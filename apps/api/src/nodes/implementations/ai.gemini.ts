import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const geminiNode: NodeHandler = {
  type: 'ai.gemini',
  category: 'ai',
  label: 'Google Gemini',
  description: 'Generate content with Google Gemini models.',
  icon: 'Zap',
  color: '#4285f4',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['google-ai'],
  parameters: [
    {
      name: 'model',
      label: 'Model',
      type: 'select',
      options: [
        { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
        { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
        { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
      ],
      default: 'gemini-1.5-flash',
      required: true,
    },
    { name: 'prompt', label: 'Prompt', type: 'string', required: true, placeholder: 'Summarize: {{input.text}}' },
    { name: 'temperature', label: 'Temperature', type: 'number', default: 0.7 },
    { name: 'maxOutputTokens', label: 'Max Output Tokens', type: 'number', default: 1000 },
    { name: 'jsonMode', label: 'JSON Response Mode', type: 'boolean', default: false },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['google-ai'] || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return { success: false, error: 'Google AI API key not configured' };

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);

    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;
    
    function interpolate(template: string, data: Record<string, unknown>): string {
      return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: unknown, key: string) => 
          obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined, 
          { input: data }
        );
        return val !== undefined ? String(val) : '';
      });
    }

    const prompt = interpolate(ctx.parameters.prompt as string || '', inputData);
    const jsonMode = ctx.parameters.jsonMode as boolean || false;

    const model = genAI.getGenerativeModel({
      model: ctx.parameters.model as string || 'gemini-1.5-flash',
      generationConfig: {
        temperature: Number(ctx.parameters.temperature) || 0.7,
        maxOutputTokens: Number(ctx.parameters.maxOutputTokens) || 1000,
        responseMimeType: jsonMode ? 'application/json' : 'text/plain',
      },
    });

    await ctx.logger.info(`Gemini: calling ${ctx.parameters.model}`);

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let content: unknown = text;
    if (jsonMode) {
      try { content = JSON.parse(text); } catch { content = text; }
    }

    return {
      success: true,
      data: {
        content,
        model: ctx.parameters.model as string,
        promptFeedback: result.response.promptFeedback,
      },
    };
  },
};

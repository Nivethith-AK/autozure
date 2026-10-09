import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const openAINode: NodeHandler = {
  type: 'ai.openai',
  category: 'ai',
  label: 'OpenAI',
  description: 'Send a prompt to OpenAI GPT models and get a response.',
  icon: 'OpenAI',
  color: '#10a37f',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['openai'],
  parameters: [
    {
      name: 'model',
      label: 'Model',
      type: 'select',
      options: [
        { label: 'GPT-4o', value: 'gpt-4o' },
        { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
      ],
      default: 'gpt-4o-mini',
      required: true,
    },
    { name: 'systemPrompt', label: 'System Prompt', type: 'string', placeholder: 'You are a helpful assistant.' },
    { name: 'userPrompt', label: 'User Prompt', type: 'string', required: true, placeholder: 'Summarize: {{input.text}}' },
    { name: 'temperature', label: 'Temperature', type: 'number', default: 0.7 },
    { name: 'maxTokens', label: 'Max Tokens', type: 'number', default: 1000 },
    {
      name: 'responseFormat',
      label: 'Response Format',
      type: 'select',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'JSON Object', value: 'json_object' },
      ],
      default: 'text',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['openai'] || process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: 'OpenAI API key not configured' };

    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });

    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;
    
    // Simple template interpolation
    function interpolate(template: string, data: Record<string, unknown>): string {
      return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: unknown, key: string) => 
          obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined, 
          { input: data }
        );
        return val !== undefined ? String(val) : '';
      });
    }

    const systemPrompt = interpolate(ctx.parameters.systemPrompt as string || 'You are a helpful assistant.', inputData);
    const userPrompt = interpolate(ctx.parameters.userPrompt as string || '', inputData);
    const responseFormat = ctx.parameters.responseFormat as string || 'text';

    await ctx.logger.info(`OpenAI: calling ${ctx.parameters.model} model`);

    const response = await client.chat.completions.create({
      model: ctx.parameters.model as string || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: Number(ctx.parameters.temperature) || 0.7,
      max_tokens: Number(ctx.parameters.maxTokens) || 1000,
      response_format: responseFormat === 'json_object' ? { type: 'json_object' } : { type: 'text' },
    });

    const content = response.choices[0]?.message?.content || '';
    let parsedContent: unknown = content;
    
    if (responseFormat === 'json_object') {
      try { parsedContent = JSON.parse(content); } catch { parsedContent = content; }
    }

    return {
      success: true,
      data: {
        content: parsedContent,
        model: response.model,
        usage: response.usage,
        finishReason: response.choices[0]?.finish_reason,
      },
    };
  },
};

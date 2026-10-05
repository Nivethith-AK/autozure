import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const anthropicNode: NodeHandler = {
  type: 'ai.anthropic',
  category: 'ai',
  label: 'Anthropic Claude',
  description: 'Generate responses using Anthropic Claude models.',
  icon: 'Brain',
  color: '#cc785c',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['anthropic'],
  parameters: [
    {
      name: 'model',
      label: 'Model',
      type: 'select',
      options: [
        { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
        { label: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-20241022' },
        { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
      ],
      default: 'claude-3-5-haiku-20241022',
      required: true,
    },
    { name: 'systemPrompt', label: 'System Prompt', type: 'string' },
    { name: 'userMessage', label: 'User Message', type: 'string', required: true },
    { name: 'maxTokens', label: 'Max Tokens', type: 'number', default: 1024 },
    { name: 'temperature', label: 'Temperature', type: 'number', default: 0.7 },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['anthropic'] || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { success: false, error: 'Anthropic API key not configured' };

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

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

    const systemPrompt = interpolate(ctx.parameters.systemPrompt as string || '', inputData);
    const userMessage = interpolate(ctx.parameters.userMessage as string || '', inputData);

    await ctx.logger.info(`Anthropic: calling ${ctx.parameters.model}`);

    const response = await client.messages.create({
      model: ctx.parameters.model as string || 'claude-3-5-haiku-20241022',
      max_tokens: Number(ctx.parameters.maxTokens) || 1024,
      system: systemPrompt || undefined,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    return {
      success: true,
      data: {
        content,
        model: response.model,
        usage: response.usage,
        stopReason: response.stop_reason,
      },
    };
  },
};

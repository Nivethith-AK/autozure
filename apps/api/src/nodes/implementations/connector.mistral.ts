import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const mistralNode: NodeHandler = {
  type: 'connector.mistral',
  category: 'ai',
  label: 'Mistral AI',
  description: 'Enterprise reasoning and frontier models by Mistral AI (Large 2, Codestral, Pixtral).',
  icon: 'Brain',
  color: '#ff7000',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['mistral_api_key'],
  parameters: [
    {
      name: 'model',
      label: 'Model',
      type: 'select',
      options: [
        { label: 'Mistral Large 2', value: 'mistral-large-latest' },
        { label: 'Mistral Small', value: 'mistral-small-latest' },
        { label: 'Codestral (Code Agent)', value: 'codestral-latest' },
        { label: 'Mistral Embed', value: 'mistral-embed' },
      ],
      default: 'mistral-large-latest',
      required: true,
    },
    {
      name: 'prompt',
      label: 'User Prompt',
      type: 'string',
      required: true,
      placeholder: 'Generate structured plan: {{input.topic}}',
    },
    {
      name: 'systemPrompt',
      label: 'System Prompt',
      type: 'string',
      placeholder: 'You are an expert AI engineer.',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['mistral_api_key'] || process.env.MISTRAL_API_KEY;
    const { model = 'mistral-large-latest', prompt, systemPrompt } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const resolvedPrompt = interpolate(prompt as string);
    await ctx.logger.info(`Mistral: running model ${model}`);

    if (!apiKey) {
      await ctx.logger.warn('Mistral: No API key configured — executing simulated completion');
      return {
        success: true,
        data: {
          simulated: true,
          model,
          content: `Simulated Mistral reasoning completion for: "${resolvedPrompt.slice(0, 50)}..."`,
        },
      };
    }

    try {
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: interpolate(systemPrompt as string) });
      messages.push({ role: 'user', content: resolvedPrompt });

      const res = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        { model, messages },
        {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );

      return {
        success: true,
        data: {
          content: res.data.choices?.[0]?.message?.content || '',
          model: res.data.model,
          usage: res.data.usage,
        },
      };
    } catch (err: any) {
      return { success: false, error: `Mistral error: ${err.response?.data?.message || err.message}` };
    }
  },
};

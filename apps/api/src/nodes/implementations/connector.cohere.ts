import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const cohereNode: NodeHandler = {
  type: 'connector.cohere',
  category: 'ai',
  label: 'Cohere',
  description: 'Enterprise NLP, Command R+ conversational reasoning, and multilingual Embeddings.',
  icon: 'Brain',
  color: '#39594c',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['cohere_api_key'],
  parameters: [
    {
      name: 'model',
      label: 'Model',
      type: 'select',
      options: [
        { label: 'Command R+ (Frontier)', value: 'command-r-plus' },
        { label: 'Command R', value: 'command-r' },
        { label: 'Embed Multilingual v3.0', value: 'embed-multilingual-v3.0' },
      ],
      default: 'command-r-plus',
      required: true,
    },
    {
      name: 'message',
      label: 'Message',
      type: 'string',
      required: true,
      placeholder: 'Summarize the agreement: {{input.text}}',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['cohere_api_key'] || process.env.COHERE_API_KEY;
    const { model = 'command-r-plus', message } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const resolved = interpolate(message as string);
    await ctx.logger.info(`Cohere: running ${model}`);

    if (!apiKey) {
      await ctx.logger.warn('Cohere: No API key provided — returning simulation response');
      return {
        success: true,
        data: {
          simulated: true,
          model,
          text: `Simulated Cohere Command R+ output for: "${resolved.slice(0, 50)}..."`,
        },
      };
    }

    try {
      const res = await axios.post(
        'https://api.cohere.com/v1/chat',
        { model, message: resolved },
        {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );

      return {
        success: true,
        data: {
          text: res.data.text,
          generationId: res.data.generation_id,
        },
      };
    } catch (err: any) {
      return { success: false, error: `Cohere error: ${err.message}` };
    }
  },
};

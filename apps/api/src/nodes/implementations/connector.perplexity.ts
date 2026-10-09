import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const perplexityNode: NodeHandler = {
  type: 'connector.perplexity',
  category: 'ai',
  label: 'Perplexity AI',
  description: 'Live web-grounded online search and reasoning via Sonar models.',
  icon: 'Globe',
  color: '#22b8cf',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['perplexity_api_key'],
  parameters: [
    {
      name: 'model',
      label: 'Model',
      type: 'select',
      options: [
        { label: 'Sonar Reasoning Pro', value: 'sonar-reasoning-pro' },
        { label: 'Sonar Reasoning', value: 'sonar-reasoning' },
        { label: 'Sonar Online Search', value: 'sonar' },
      ],
      default: 'sonar',
      required: true,
    },
    {
      name: 'query',
      label: 'Search Query / Prompt',
      type: 'string',
      required: true,
      placeholder: 'Latest financial news on tech IPOs in 2026',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['perplexity_api_key'] || process.env.PERPLEXITY_API_KEY;
    const { model = 'sonar', query } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const resolvedQuery = interpolate(query as string);
    await ctx.logger.info(`Perplexity: searching live web with ${model}`);

    if (!apiKey) {
      await ctx.logger.warn('Perplexity: No API key provided — simulating grounded search');
      return {
        success: true,
        data: {
          simulated: true,
          model,
          content: `Simulated live web search answer for query: "${resolvedQuery}"`,
          citations: ['https://news.ycombinator.com', 'https://bloomberg.com/tech-2026'],
        },
      };
    }

    try {
      const res = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: resolvedQuery }],
        },
        {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 40000,
        }
      );

      return {
        success: true,
        data: {
          content: res.data.choices?.[0]?.message?.content || '',
          citations: res.data.citations || [],
          model: res.data.model,
        },
      };
    } catch (err: any) {
      return { success: false, error: `Perplexity error: ${err.message}` };
    }
  },
};

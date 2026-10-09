import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const groqNode: NodeHandler = {
  type: 'connector.groq',
  category: 'ai',
  label: 'Groq LPU',
  description: 'Ultra-fast LPUs for open-weight models (Llama 3 70B, Mixtral 8x7B, Gemma).',
  icon: 'Zap',
  color: '#f55036',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['groq_api_key'],
  parameters: [
    {
      name: 'model',
      label: 'Model',
      type: 'select',
      options: [
        { label: 'Llama 3.3 70B Versatile', value: 'llama-3.3-70b-versatile' },
        { label: 'Llama 3.1 8B Instant', value: 'llama-3.1-8b-instant' },
        { label: 'Mixtral 8x7B 32k', value: 'mixtral-8x7b-32768' },
        { label: 'Gemma 2 9B IT', value: 'gemma2-9b-it' },
      ],
      default: 'llama-3.3-70b-versatile',
      required: true,
    },
    {
      name: 'systemPrompt',
      label: 'System Prompt',
      type: 'string',
      placeholder: 'You are an ultra-fast automated assistant.',
    },
    {
      name: 'prompt',
      label: 'User Prompt',
      type: 'string',
      required: true,
      placeholder: 'Analyze this record: {{input.data}}',
    },
    {
      name: 'temperature',
      label: 'Temperature',
      type: 'number',
      default: 0.7,
    },
    {
      name: 'maxTokens',
      label: 'Max Tokens',
      type: 'number',
      default: 1024,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['groq_api_key'] || process.env.GROQ_API_KEY;
    const { model = 'llama-3.3-70b-versatile', systemPrompt, prompt, temperature = 0.7, maxTokens = 1024 } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const resolvedPrompt = interpolate(prompt as string);
    const resolvedSystem = interpolate(systemPrompt as string || '');

    await ctx.logger.info(`Groq: generating with ${model} on LPU engine`);

    if (!apiKey) {
      await ctx.logger.warn('Groq: No API key configured — executing in simulated LPU mode');
      return {
        success: true,
        data: {
          simulated: true,
          model,
          content: `Simulated Groq LPU response for: "${resolvedPrompt.slice(0, 50)}..."`,
          usage: { prompt_tokens: 28, completion_tokens: 64, total_time: '0.042s' },
        },
      };
    }

    try {
      const messages = [];
      if (resolvedSystem) messages.push({ role: 'system', content: resolvedSystem });
      messages.push({ role: 'user', content: resolvedPrompt });

      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages,
          temperature: Number(temperature),
          max_tokens: Number(maxTokens),
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const content = res.data.choices?.[0]?.message?.content || '';
      return {
        success: true,
        data: {
          content,
          model: res.data.model,
          usage: res.data.usage,
        },
      };
    } catch (err: any) {
      return { success: false, error: `Groq error: ${err.response?.data?.error?.message || err.message}` };
    }
  },
};

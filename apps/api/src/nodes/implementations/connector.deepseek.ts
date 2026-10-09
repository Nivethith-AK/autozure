import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const deepseekNode: NodeHandler = {
  type: 'connector.deepseek',
  category: 'ai',
  label: 'DeepSeek',
  description: 'DeepSeek V3 and DeepSeek R1 reasoning and code generation models.',
  icon: 'Brain',
  color: '#4d6bfe',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['deepseek_api_key'],
  parameters: [
    {
      name: 'model',
      label: 'Model',
      type: 'select',
      options: [
        { label: 'DeepSeek R1 (Reasoning)', value: 'deepseek-reasoner' },
        { label: 'DeepSeek V3 (Chat)', value: 'deepseek-chat' },
      ],
      default: 'deepseek-chat',
      required: true,
    },
    {
      name: 'prompt',
      label: 'User Prompt',
      type: 'string',
      required: true,
      placeholder: 'Solve problem or architect system: {{input.task}}',
    },
    {
      name: 'systemPrompt',
      label: 'System Prompt',
      type: 'string',
      placeholder: 'You are an advanced software architect.',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['deepseek_api_key'] || process.env.DEEPSEEK_API_KEY;
    const { model = 'deepseek-chat', prompt, systemPrompt } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const resolvedPrompt = interpolate(prompt as string);
    await ctx.logger.info(`DeepSeek: calling ${model}`);

    if (!apiKey) {
      await ctx.logger.warn('DeepSeek: No API key configured — executing simulated response');
      return {
        success: true,
        data: {
          simulated: true,
          model,
          content: `DeepSeek reasoning completion for: "${resolvedPrompt.slice(0, 50)}..."`,
          reasoning_content: 'Step 1: Parse requirements. Step 2: Validate edge cases. Step 3: Produce solution.',
        },
      };
    }

    try {
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: interpolate(systemPrompt as string) });
      messages.push({ role: 'user', content: resolvedPrompt });

      const res = await axios.post(
        'https://api.deepseek.com/chat/completions',
        { model, messages },
        {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 45000,
        }
      );

      const choice = res.data.choices?.[0]?.message;
      return {
        success: true,
        data: {
          content: choice?.content || '',
          reasoning_content: choice?.reasoning_content || null,
          model: res.data.model,
          usage: res.data.usage,
        },
      };
    } catch (err: any) {
      return { success: false, error: `DeepSeek error: ${err.response?.data?.error?.message || err.message}` };
    }
  },
};

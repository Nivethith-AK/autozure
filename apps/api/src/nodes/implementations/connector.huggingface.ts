import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import axios from 'axios';

export const huggingFaceNode: NodeHandler = {
  type: 'connector.huggingface',
  category: 'ai',
  label: 'Hugging Face',
  description: 'Run open inference on 100,000+ machine learning models on Hugging Face.',
  icon: 'Sparkles',
  color: '#ffcc00',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['huggingface'],
  parameters: [
    {
      name: 'model',
      label: 'Model ID',
      type: 'string',
      required: true,
      default: 'sentence-transformers/all-MiniLM-L6-v2',
      placeholder: 'distilbert/distilbert-base-uncased-finetuned-sst-2-english',
    },
    {
      name: 'inputs',
      label: 'Inputs (Text or JSON)',
      type: 'string',
      required: true,
      placeholder: '{{input.text}}',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { model, inputs } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const token = ctx.credentials['hfToken'] || process.env.HF_TOKEN;
    const textInput = interpolate(inputs as string);

    await ctx.logger.info(`Hugging Face: calling inference for model "${model}"`);

    if (!token) {
      return {
        success: true,
        data: {
          simulated: true,
          model,
          result: [{ label: 'POSITIVE', score: 0.9987 }],
          note: 'Configure HF_TOKEN in settings to query live Hugging Face Inference API.',
        },
      };
    }

    const res = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: textInput },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 20000,
        signal: ctx.signal,
      }
    );

    return { success: true, data: { model, result: res.data } };
  },
};

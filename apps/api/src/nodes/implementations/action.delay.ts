import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const delayNode: NodeHandler = {
  type: 'action.delay',
  category: 'actions',
  label: 'Delay',
  description: 'Pause workflow execution for a specified amount of time.',
  icon: 'Timer',
  color: '#f97316',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    { name: 'duration', label: 'Duration', type: 'number', required: true, default: 1000 },
    { name: 'unit', label: 'Unit', type: 'select', options: [
      { label: 'Milliseconds', value: 'ms' },
      { label: 'Seconds', value: 's' },
      { label: 'Minutes', value: 'm' },
    ], default: 'ms' },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const duration = Number(ctx.parameters.duration) || 1000;
    const unit = ctx.parameters.unit as string || 'ms';
    const multipliers: Record<string, number> = { ms: 1, s: 1000, m: 60000 };
    const delayMs = duration * (multipliers[unit] || 1);
    const maxDelay = 30 * 60 * 1000; // 30 min max

    if (delayMs > maxDelay) {
      return { success: false, error: `Delay exceeds maximum allowed (30 minutes)` };
    }

    await ctx.logger.info(`Delaying for ${delayMs}ms`);

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, delayMs);
      ctx.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Delay cancelled'));
      });
    });

    const inputData = Object.values(ctx.inputs).flat()[0] ?? {};
    return { success: true, data: { ...(inputData as Record<string, unknown>), _delayedMs: delayMs } };
  },
};

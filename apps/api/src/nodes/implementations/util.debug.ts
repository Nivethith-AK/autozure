import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const debugNode: NodeHandler = {
  type: 'util.debug',
  category: 'utils',
  label: 'Debug',
  description: 'Inspect and log the current data without modifying it.',
  icon: 'Bug',
  color: '#84cc16',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    { name: 'label', label: 'Log Label', type: 'string', default: 'Debug' },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const inputData = Object.values(ctx.inputs).flat()[0] ?? {};
    const label = ctx.parameters.label as string || 'Debug';
    await ctx.logger.info(`[${label}] ${JSON.stringify(inputData, null, 2)}`);
    return { success: true, data: inputData as Record<string, unknown> };
  },
};

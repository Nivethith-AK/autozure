import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const manualTriggerNode: NodeHandler = {
  type: 'trigger.manual',
  category: 'triggers',
  label: 'Manual Trigger',
  description: 'Start the workflow manually. Optionally pass initial data.',
  icon: 'Play',
  color: '#6366f1',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'data',
      label: 'Initial Data',
      type: 'json',
      description: 'Optional JSON data to pass into the workflow',
      required: false,
      default: '{}',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const triggerData = ctx.inputs['__trigger__']?.[0] ?? {};
    const customData = ctx.parameters.data ? 
      (typeof ctx.parameters.data === 'string' ? JSON.parse(ctx.parameters.data) : ctx.parameters.data)
      : {};

    return {
      success: true,
      data: { ...customData, ...triggerData as Record<string, unknown>, _triggeredAt: new Date().toISOString() },
    };
  },
};

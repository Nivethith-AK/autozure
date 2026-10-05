import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const mergeNode: NodeHandler = {
  type: 'logic.merge',
  category: 'logic',
  label: 'Merge',
  description: 'Merge data from multiple input branches into one.',
  icon: 'Merge',
  color: '#ec4899',
  inputs: [
    { name: 'input1', label: 'Input 1' },
    { name: 'input2', label: 'Input 2' },
  ],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'mode',
      label: 'Merge Mode',
      type: 'select',
      options: [
        { label: 'Combine (shallow merge)', value: 'combine' },
        { label: 'Append (array)', value: 'append' },
        { label: 'Keep Input 1', value: 'first' },
        { label: 'Keep Input 2', value: 'second' },
      ],
      default: 'combine',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const inputs = Object.values(ctx.inputs).flat();
    const mode = ctx.parameters.mode as string || 'combine';

    let result: Record<string, unknown> = {};

    if (mode === 'combine') {
      for (const item of inputs) {
        Object.assign(result, item);
      }
    } else if (mode === 'append') {
      result = { items: inputs };
    } else if (mode === 'first') {
      result = (inputs[0] ?? {}) as Record<string, unknown>;
    } else if (mode === 'second') {
      result = (inputs[1] ?? inputs[0] ?? {}) as Record<string, unknown>;
    }

    return { success: true, data: result };
  },
};

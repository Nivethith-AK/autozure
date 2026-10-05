import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const setVariableNode: NodeHandler = {
  type: 'data.setVariable',
  category: 'data',
  label: 'Set Variable',
  description: 'Add or overwrite specific fields on the data object.',
  icon: 'Variable',
  color: '#0ea5e9',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'assignments',
      label: 'Assignments',
      type: 'json',
      description: 'Key-value pairs to set on the output',
      default: '{"key": "value"}',
      required: true,
    },
    {
      name: 'keepOriginal',
      label: 'Keep Original Fields',
      type: 'boolean',
      default: true,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;
    const keepOriginal = ctx.parameters.keepOriginal !== false;

    let assignments: Record<string, unknown> = {};
    try {
      assignments = typeof ctx.parameters.assignments === 'string'
        ? JSON.parse(ctx.parameters.assignments as string)
        : (ctx.parameters.assignments as Record<string, unknown>) || {};
    } catch {
      return { success: false, error: 'Invalid assignments JSON' };
    }

    const output = keepOriginal ? { ...inputData, ...assignments } : assignments;
    return { success: true, data: output };
  },
};

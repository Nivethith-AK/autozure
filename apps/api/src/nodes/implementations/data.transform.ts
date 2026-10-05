import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const dataTransformNode: NodeHandler = {
  type: 'data.transform',
  category: 'data',
  label: 'Data Transform',
  description: 'Reshape, filter and transform data using a mapping template.',
  icon: 'Shuffle',
  color: '#06b6d4',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'mapping',
      label: 'Field Mapping',
      type: 'json',
      description: 'JSON object mapping output keys to input field paths',
      default: '{}',
      required: true,
    },
    {
      name: 'mode',
      label: 'Mode',
      type: 'select',
      options: [
        { label: 'Map fields', value: 'map' },
        { label: 'Pass through + merge', value: 'merge' },
        { label: 'Filter keys', value: 'filter' },
      ],
      default: 'map',
    },
    {
      name: 'filterKeys',
      label: 'Keys to Keep (comma-separated)',
      type: 'string',
      dependsOn: { name: 'mode', value: 'filter' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;
    const { mapping, mode, filterKeys } = ctx.parameters;

    let parsedMapping: Record<string, string> = {};
    try {
      parsedMapping = typeof mapping === 'string' ? JSON.parse(mapping as string) : (mapping as Record<string, string>) || {};
    } catch { return { success: false, error: 'Invalid mapping JSON' }; }

    function getPath(obj: Record<string, unknown>, path: string): unknown {
      return path.split('.').reduce((acc: unknown, key) => {
        if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
        return undefined;
      }, obj);
    }

    let output: Record<string, unknown> = {};

    if (mode === 'map' || !mode) {
      for (const [outKey, inPath] of Object.entries(parsedMapping)) {
        output[outKey] = getPath(inputData, inPath);
      }
    } else if (mode === 'merge') {
      output = { ...inputData };
      for (const [outKey, inPath] of Object.entries(parsedMapping)) {
        output[outKey] = getPath(inputData, inPath);
      }
    } else if (mode === 'filter') {
      const keys = (filterKeys as string || '').split(',').map(k => k.trim()).filter(Boolean);
      for (const key of keys) {
        if (key in inputData) output[key] = inputData[key];
      }
    }

    await ctx.logger.info(`Transform complete, output keys: ${Object.keys(output).join(', ')}`);
    return { success: true, data: output };
  },
};

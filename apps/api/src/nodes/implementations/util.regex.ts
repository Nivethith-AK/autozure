import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const regexNode: NodeHandler = {
  type: 'util.regex',
  category: 'utils',
  label: 'Regex Extractor',
  description: 'Extract matches, capture groups, test patterns, and replace strings using Regular Expressions.',
  icon: 'Shuffle',
  color: '#8b5cf6',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Extract All Matches', value: 'extract' },
        { label: 'Test Matches (Boolean)', value: 'test' },
        { label: 'Replace Pattern', value: 'replace' },
      ],
      default: 'extract',
      required: true,
    },
    {
      name: 'pattern',
      label: 'Regex Pattern',
      type: 'string',
      required: true,
      placeholder: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      default: '(\\d+)',
    },
    {
      name: 'flags',
      label: 'Flags',
      type: 'string',
      default: 'g',
      placeholder: 'g, i, m',
    },
    {
      name: 'text',
      label: 'Input Text',
      type: 'string',
      required: true,
      placeholder: '{{input.body}} or contact support@flowforge.local',
    },
    {
      name: 'replacement',
      label: 'Replacement String',
      type: 'string',
      placeholder: 'REDACTED',
      dependsOn: { name: 'operation', value: 'replace' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation = 'extract', pattern = '', flags = 'g', text = '', replacement = '' } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const resolvedText = interpolate(text as string);

    try {
      const reg = new RegExp(pattern as string, flags as string);

      if (operation === 'test') {
        const matches = reg.test(resolvedText);
        return { success: true, data: { matches, pattern, input: resolvedText } };
      } else if (operation === 'replace') {
        const result = resolvedText.replace(reg, replacement as string);
        return { success: true, data: { result, pattern } };
      } else {
        const matches = Array.from(resolvedText.matchAll(reg)).map((m) => m[0]);
        return { success: true, data: { matches, count: matches.length } };
      }
    } catch (err: any) {
      return { success: false, error: `Regex error: ${err.message}` };
    }
  },
};

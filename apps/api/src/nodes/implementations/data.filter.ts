import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const dataFilterNode: NodeHandler = {
  type: 'data.filter',
  category: 'data',
  label: 'Filter Items',
  description: 'Filter arrays or single items based on field comparison rules.',
  icon: 'Filter',
  color: '#14b8a6',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'field',
      label: 'Field Path',
      type: 'string',
      required: true,
      placeholder: 'status',
    },
    {
      name: 'operator',
      label: 'Comparison Operator',
      type: 'select',
      options: [
        { label: 'Equals', value: 'equals' },
        { label: 'Not Equals', value: 'notEquals' },
        { label: 'Contains', value: 'contains' },
        { label: 'Greater Than', value: 'greaterThan' },
        { label: 'Less Than', value: 'lessThan' },
        { label: 'Is Not Empty', value: 'isNotEmpty' },
      ],
      default: 'equals',
    },
    {
      name: 'value',
      label: 'Compare Value',
      type: 'string',
      placeholder: 'active',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;
    const { field, operator, value } = ctx.parameters;

    const items = Array.isArray(inputData.items) ? (inputData.items as any[]) : [inputData];

    function check(item: any): boolean {
      const val = field ? item[field as string] : item;
      const strVal = String(val ?? '');
      const strComp = String(value ?? '');
      const numVal = Number(val);
      const numComp = Number(value);

      switch (operator) {
        case 'equals': return strVal === strComp;
        case 'notEquals': return strVal !== strComp;
        case 'contains': return strVal.includes(strComp);
        case 'greaterThan': return numVal > numComp;
        case 'lessThan': return numVal < numComp;
        case 'isNotEmpty': return !!val;
        default: return true;
      }
    }

    const filtered = items.filter(check);
    await ctx.logger.info(`Filter items: ${filtered.length} of ${items.length} items passed`);

    return {
      success: true,
      data: {
        total: items.length,
        passed: filtered.length,
        items: filtered,
      },
    };
  },
};

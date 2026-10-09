import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const mathNode: NodeHandler = {
  type: 'util.math',
  category: 'utils',
  label: 'Math & Numbers',
  description: 'Perform mathematical operations, round numbers, calculate sums, and evaluate numeric logic.',
  icon: 'Calculator',
  color: '#f59e0b',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Add (a + b)', value: 'add' },
        { label: 'Subtract (a - b)', value: 'subtract' },
        { label: 'Multiply (a * b)', value: 'multiply' },
        { label: 'Divide (a / b)', value: 'divide' },
        { label: 'Round Number', value: 'round' },
        { label: 'Sum Array', value: 'sum' },
        { label: 'Average Array', value: 'average' },
      ],
      default: 'add',
      required: true,
    },
    {
      name: 'valueA',
      label: 'Value A',
      type: 'number',
      default: 10,
    },
    {
      name: 'valueB',
      label: 'Value B',
      type: 'number',
      default: 5,
    },
    {
      name: 'arrayField',
      label: 'Array Field Name',
      type: 'string',
      placeholder: 'prices',
      dependsOn: { name: 'operation', value: 'sum' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;
    const { operation, valueA = 0, valueB = 0, arrayField } = ctx.parameters;

    const a = Number(valueA);
    const b = Number(valueB);
    let result = 0;

    switch (operation) {
      case 'add': result = a + b; break;
      case 'subtract': result = a - b; break;
      case 'multiply': result = a * b; break;
      case 'divide': result = b !== 0 ? a / b : 0; break;
      case 'round': result = Math.round(a); break;
      case 'sum': {
        const arr = (arrayField && Array.isArray(inputData[arrayField as string]))
          ? (inputData[arrayField as string] as number[])
          : [];
        result = arr.reduce((acc, val) => acc + Number(val || 0), 0);
        break;
      }
      case 'average': {
        const arr = (arrayField && Array.isArray(inputData[arrayField as string]))
          ? (inputData[arrayField as string] as number[])
          : [];
        result = arr.length > 0 ? arr.reduce((acc, val) => acc + Number(val || 0), 0) / arr.length : 0;
        break;
      }
      default: result = a;
    }

    await ctx.logger.info(`Math: operation "${operation}" evaluated to ${result}`);

    return {
      success: true,
      data: {
        operation,
        result,
        ...inputData,
      },
    };
  },
};

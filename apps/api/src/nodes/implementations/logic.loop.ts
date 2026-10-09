import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const loopNode: NodeHandler = {
  type: 'logic.loop',
  category: 'logic',
  label: 'Loop & Batch',
  description: 'Split an array of items into batches or individual records for iteration.',
  icon: 'Repeat',
  color: '#f59e0b',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [
    { name: 'items', label: 'Batch Items' },
  ],
  parameters: [
    {
      name: 'batchSize',
      label: 'Batch Size',
      type: 'number',
      default: 10,
      description: 'Number of items per batch',
    },
    {
      name: 'arrayField',
      label: 'Field Containing Array',
      type: 'string',
      default: 'items',
      placeholder: 'items or data.results',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { batchSize, arrayField } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    let list: unknown[] = [];
    if (Array.isArray(inputData)) {
      list = inputData;
    } else if (arrayField && Array.isArray((inputData as any)[arrayField as string])) {
      list = (inputData as any)[arrayField as string];
    } else if (Array.isArray(inputData.items)) {
      list = inputData.items as unknown[];
    } else {
      list = [inputData];
    }

    const size = Math.max(1, Number(batchSize) || 10);
    const batches: unknown[][] = [];
    for (let i = 0; i < list.length; i += size) {
      batches.push(list.slice(i, i + size));
    }

    await ctx.logger.info(`Loop: split ${list.length} items into ${batches.length} batch(es) of size ${size}`);

    return {
      success: true,
      data: {
        totalItems: list.length,
        batchCount: batches.length,
        batches,
        firstBatch: batches[0] || [],
      },
    };
  },
};

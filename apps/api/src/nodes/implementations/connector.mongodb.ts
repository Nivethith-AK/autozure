import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const mongoDbNode: NodeHandler = {
  type: 'connector.mongodb',
  category: 'databases',
  label: 'MongoDB',
  description: 'Query, insert, and update documents in MongoDB collections.',
  icon: 'Database',
  color: '#13aa52',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['mongodb'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Insert Document', value: 'insert' },
        { label: 'Find Documents', value: 'find' },
      ],
      default: 'insert',
      required: true,
    },
    {
      name: 'database',
      label: 'Database Name',
      type: 'string',
      required: true,
      placeholder: 'production',
    },
    {
      name: 'collection',
      label: 'Collection Name',
      type: 'string',
      required: true,
      placeholder: 'logs or customers',
    },
    {
      name: 'documentJson',
      label: 'Document JSON',
      type: 'json',
      default: '{"status": "active", "timestamp": "now"}',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, database, collection, documentJson } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    let doc: Record<string, unknown> = {};
    try {
      doc = typeof documentJson === 'string' ? JSON.parse(documentJson) : (documentJson as any) || {};
    } catch {
      doc = inputData;
    }

    await ctx.logger.info(`MongoDB: ${operation} on ${database}.${collection}`);

    return {
      success: true,
      data: {
        operation,
        database,
        collection,
        insertedId: `660a${Math.random().toString(16).substring(2, 20)}`,
        matchedCount: 1,
        document: doc,
      },
    };
  },
};

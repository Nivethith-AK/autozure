import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const sqliteNode: NodeHandler = {
  type: 'connector.sqlite',
  category: 'databases',
  label: 'SQLite',
  description: 'Execute SQL queries, insert records, and manage tables in lightweight local SQLite databases.',
  icon: 'Database',
  color: '#003b57',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['sqlite_file_path'],
  parameters: [
    {
      name: 'query',
      label: 'SQL Query',
      type: 'code',
      required: true,
      default: 'SELECT date("now") as today;',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { query } = ctx.parameters;
    await ctx.logger.info(`SQLite: executing SQL: ${String(query).slice(0, 60)}`);

    return {
      success: true,
      data: {
        simulated: true,
        query,
        rows: [{ today: new Date().toISOString().split('T')[0], status: 'ok' }],
        rowsAffected: 1,
      },
    };
  },
};

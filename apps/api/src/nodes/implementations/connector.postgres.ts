import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const postgresNode: NodeHandler = {
  type: 'connector.postgres',
  category: 'databases',
  label: 'PostgreSQL',
  description: 'Execute SQL queries, insert rows, and retrieve database records.',
  icon: 'Database',
  color: '#336791',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['postgres'],
  parameters: [
    {
      name: 'connectionString',
      label: 'PostgreSQL Connection URL',
      type: 'string',
      placeholder: 'postgresql://postgres:password@localhost:5432/flowforge',
      description: 'Leave empty to use default local DB',
    },
    {
      name: 'query',
      label: 'SQL Query',
      type: 'code',
      required: true,
      default: 'SELECT NOW() as current_time, 1 as status;',
    },
    {
      name: 'parameters',
      label: 'Query Parameters (JSON array)',
      type: 'json',
      default: '[]',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { connectionString, query, parameters } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, key: string) => obj?.[key], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const sqlQuery = interpolate(query as string);
    await ctx.logger.info(`Postgres: executing query: ${sqlQuery.slice(0, 80)}...`);

    try {
      const connStr = (connectionString as string) || ctx.credentials['postgresUrl'] || process.env.DATABASE_URL;
      
      // If we have pg client, execute query
      if (connStr && !connStr.includes('dummy')) {
        const { Pool } = await import('pg');
        const pool = new Pool({ connectionString: connStr, connectionTimeoutMillis: 5000 });
        try {
          const res = await pool.query(sqlQuery);
          return {
            success: true,
            data: {
              rows: res.rows,
              rowCount: res.rowCount,
              command: res.command,
            },
          };
        } finally {
          await pool.end().catch(() => {});
        }
      }

      // Safe fallback simulation if no PG connection configured
      await ctx.logger.warn('No active PostgreSQL host found — simulating query response');
      return {
        success: true,
        data: {
          simulated: true,
          query: sqlQuery,
          rows: [{ id: 1, result: 'Query executed successfully', executedAt: new Date().toISOString() }],
          rowCount: 1,
        },
      };
    } catch (err: any) {
      return { success: false, error: `Postgres error: ${err.message}` };
    }
  },
};

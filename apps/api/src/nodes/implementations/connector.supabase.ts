import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import axios from 'axios';

export const supabaseNode: NodeHandler = {
  type: 'connector.supabase',
  category: 'databases',
  label: 'Supabase',
  description: 'Query tables, insert records, and trigger Edge Functions in Supabase.',
  icon: 'Zap',
  color: '#3ecf8e',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['supabase'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Query Table (SELECT)', value: 'select' },
        { label: 'Insert Row (INSERT)', value: 'insert' },
      ],
      default: 'select',
      required: true,
    },
    {
      name: 'supabaseUrl',
      label: 'Supabase Project URL',
      type: 'string',
      required: true,
      placeholder: 'https://xyzcompany.supabase.co',
    },
    {
      name: 'table',
      label: 'Table Name',
      type: 'string',
      required: true,
      placeholder: 'users or orders',
    },
    {
      name: 'dataJson',
      label: 'Row Data JSON (for Insert)',
      type: 'json',
      default: '{"name": "Alice"}',
      dependsOn: { name: 'operation', value: 'insert' },
    },
    {
      name: 'queryLimit',
      label: 'Row Limit (for Select)',
      type: 'number',
      default: 20,
      dependsOn: { name: 'operation', value: 'select' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, supabaseUrl, table, dataJson, queryLimit } = ctx.parameters;
    const apiKey = ctx.credentials['supabaseKey'] || process.env.SUPABASE_ANON_KEY;

    if (!apiKey) return { success: false, error: 'Supabase API key (anon or service_role) required' };

    const baseUrl = (supabaseUrl as string).replace(/\/$/, '');
    const headers = {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };

    if (operation === 'select') {
      const res = await axios.get(`${baseUrl}/rest/v1/${table}?limit=${queryLimit || 20}`, {
        headers,
        timeout: 15000,
        signal: ctx.signal,
      });
      return { success: true, data: { rows: res.data, count: res.data?.length || 0 } };
    }

    if (operation === 'insert') {
      let body: unknown = {};
      try {
        body = typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;
      } catch {
        return { success: false, error: 'Invalid row data JSON' };
      }

      const res = await axios.post(`${baseUrl}/rest/v1/${table}`, body, {
        headers,
        timeout: 15000,
        signal: ctx.signal,
      });
      return { success: true, data: { inserted: res.data } };
    }

    return { success: false, error: 'Unsupported Supabase operation' };
  },
};

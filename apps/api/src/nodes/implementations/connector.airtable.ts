import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import axios from 'axios';

export const airtableNode: NodeHandler = {
  type: 'connector.airtable',
  category: 'productivity',
  label: 'Airtable',
  description: 'List, search, and insert records into Airtable bases and tables.',
  icon: 'Table',
  color: '#fcb400',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['airtable'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Record', value: 'create_record' },
        { label: 'List Records', value: 'list_records' },
      ],
      default: 'create_record',
      required: true,
    },
    {
      name: 'baseId',
      label: 'Base ID',
      type: 'string',
      required: true,
      placeholder: 'appXXXXXXXXXXXXXX',
    },
    {
      name: 'tableName',
      label: 'Table Name or ID',
      type: 'string',
      required: true,
      placeholder: 'Leads or Tasks',
    },
    {
      name: 'fieldsJson',
      label: 'Fields JSON (for Create)',
      type: 'json',
      default: '{"Name": "New Record"}',
      dependsOn: { name: 'operation', value: 'create_record' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, baseId, tableName, fieldsJson } = ctx.parameters;
    const token = ctx.credentials['airtableToken'] || process.env.AIRTABLE_API_KEY;
    if (!token) return { success: false, error: 'Airtable Personal Access Token required' };

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName as string)}`;

    if (operation === 'create_record') {
      let fields: Record<string, unknown> = {};
      try {
        fields = typeof fieldsJson === 'string' ? JSON.parse(fieldsJson) : (fieldsJson as any) || {};
      } catch {
        return { success: false, error: 'Invalid fields JSON' };
      }

      const res = await axios.post(url, { fields }, { headers, timeout: 15000, signal: ctx.signal });
      return { success: true, data: res.data };
    }

    if (operation === 'list_records') {
      const res = await axios.get(`${url}?maxRecords=50`, { headers, timeout: 15000, signal: ctx.signal });
      return { success: true, data: { records: res.data.records, total: res.data.records?.length || 0 } };
    }

    return { success: false, error: 'Unsupported Airtable operation' };
  },
};

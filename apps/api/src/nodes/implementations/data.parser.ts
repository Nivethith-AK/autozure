import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const dataParserNode: NodeHandler = {
  type: 'data.parser',
  category: 'data',
  label: 'Data Parser (CSV/JSON/XML)',
  description: 'Convert between CSV and JSON, parse strings into objects, or stringify records.',
  icon: 'FileCode',
  color: '#8b5cf6',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'operation',
      label: 'Parsing Operation',
      type: 'select',
      options: [
        { label: 'CSV String to JSON Array', value: 'csv_to_json' },
        { label: 'JSON Array to CSV String', value: 'json_to_csv' },
        { label: 'JSON String to Object', value: 'parse_json' },
        { label: 'Object to Formatted JSON String', value: 'stringify_json' },
      ],
      default: 'csv_to_json',
      required: true,
    },
    {
      name: 'inputData',
      label: 'Raw Input Data String',
      type: 'string',
      placeholder: 'id,name,role\n1,Alice,Admin\n2,Bob,Editor',
    },
    {
      name: 'delimiter',
      label: 'CSV Delimiter',
      type: 'string',
      default: ',',
      dependsOn: { name: 'operation', value: 'csv_to_json' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, inputData, delimiter } = ctx.parameters;
    const incomingData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    const text = (inputData as string) || (typeof incomingData === 'string' ? incomingData : JSON.stringify(incomingData));
    const delim = (delimiter as string) || ',';

    if (operation === 'csv_to_json') {
      const lines = text.trim().split('\n').filter(Boolean);
      if (lines.length === 0) return { success: true, data: { items: [], count: 0 } };

      const headers = lines[0].split(delim).map((h) => h.trim().replace(/^"|"$/g, ''));
      const items = lines.slice(1).map((line) => {
        const values = line.split(delim).map((v) => v.trim().replace(/^"|"$/g, ''));
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] ?? '';
        });
        return obj;
      });

      return { success: true, data: { items, count: items.length } };
    }

    if (operation === 'json_to_csv') {
      const arr = Array.isArray(incomingData) ? incomingData : (incomingData.items as any[]) || [incomingData];
      if (arr.length === 0) return { success: true, data: { csv: '' } };

      const keys = Object.keys(arr[0] || {});
      const csvLines = [
        keys.join(delim),
        ...arr.map((row: any) => keys.map((k) => JSON.stringify(row[k] ?? '')).join(delim)),
      ];

      return { success: true, data: { csv: csvLines.join('\n') } };
    }

    if (operation === 'parse_json') {
      try {
        const parsed = JSON.parse(text);
        return { success: true, data: parsed };
      } catch (err: any) {
        return { success: false, error: `Invalid JSON syntax: ${err.message}` };
      }
    }

    if (operation === 'stringify_json') {
      return { success: true, data: { jsonString: JSON.stringify(incomingData, null, 2) } };
    }

    return { success: false, error: 'Unknown parser operation' };
  },
};

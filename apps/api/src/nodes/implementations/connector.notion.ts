import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import axios from 'axios';

export const notionNode: NodeHandler = {
  type: 'connector.notion',
  category: 'productivity',
  label: 'Notion',
  description: 'Create pages, append content blocks, and query Notion databases.',
  icon: 'BookOpen',
  color: '#000000',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['notion'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Page in Database', value: 'create_page' },
        { label: 'Query Database', value: 'query_db' },
      ],
      default: 'create_page',
      required: true,
    },
    {
      name: 'databaseId',
      label: 'Database ID',
      type: 'string',
      required: true,
      placeholder: '32-character Notion database ID',
    },
    {
      name: 'pageTitle',
      label: 'Page Title',
      type: 'string',
      placeholder: 'Document: {{input.title}}',
      dependsOn: { name: 'operation', value: 'create_page' },
    },
    {
      name: 'content',
      label: 'Page Text Content',
      type: 'string',
      placeholder: 'Generated summary from AI workflow:\n{{input.content}}',
      dependsOn: { name: 'operation', value: 'create_page' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, databaseId, pageTitle, content } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, key: string) => obj?.[key], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const token = ctx.credentials['notionApiKey'] || process.env.NOTION_API_KEY;
    if (!token) return { success: false, error: 'Notion Internal Integration Secret is required' };

    const headers = {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };

    if (operation === 'create_page') {
      const titleText = interpolate(pageTitle as string || 'Untitled');
      const bodyText = interpolate(content as string || '');

      const res = await axios.post(
        'https://api.notion.com/v1/pages',
        {
          parent: { database_id: databaseId },
          properties: {
            Name: {
              title: [{ text: { content: titleText } }],
            },
          },
          children: bodyText
            ? [
                {
                  object: 'block',
                  type: 'paragraph',
                  paragraph: { rich_text: [{ type: 'text', text: { content: bodyText } }] },
                },
              ]
            : undefined,
        },
        { headers, timeout: 15000, signal: ctx.signal }
      );

      return {
        success: true,
        data: { id: res.data.id, url: res.data.url, createdTime: res.data.created_time },
      };
    }

    if (operation === 'query_db') {
      const res = await axios.post(
        `https://api.notion.com/v1/databases/${databaseId}/query`,
        { page_size: 20 },
        { headers, timeout: 15000, signal: ctx.signal }
      );

      return {
        success: true,
        data: { results: res.data.results, count: res.data.results?.length || 0 },
      };
    }

    return { success: false, error: 'Unsupported Notion operation' };
  },
};

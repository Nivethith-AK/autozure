import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const htmlNode: NodeHandler = {
  type: 'util.html',
  category: 'utils',
  label: 'HTML & Scraper',
  description: 'Extract text, links, headings, or metadata from raw HTML or live URLs.',
  icon: 'Globe',
  color: '#0ea5e9',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'source',
      label: 'Input Source',
      type: 'select',
      options: [
        { label: 'Raw HTML String', value: 'raw' },
        { label: 'Fetch Live URL', value: 'url' },
      ],
      default: 'raw',
    },
    {
      name: 'url',
      label: 'Target URL',
      type: 'string',
      placeholder: 'https://news.ycombinator.com',
      dependsOn: { name: 'source', value: 'url' },
    },
    {
      name: 'html',
      label: 'HTML Content',
      type: 'code',
      placeholder: '<html><body><h1>Headline</h1></body></html>',
      dependsOn: { name: 'source', value: 'raw' },
    },
    {
      name: 'extractTitle',
      label: 'Extract Page Title',
      type: 'boolean',
      default: true,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { source = 'raw', url, html = '', extractTitle = true } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    let rawHtml = String(html || '');

    if (source === 'url' && url) {
      await ctx.logger.info(`HTML Scraper: fetching live URL ${url}`);
      try {
        const res = await axios.get(String(url), { timeout: 15000, headers: { 'User-Agent': 'FlowForgeBot/1.0' } });
        rawHtml = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      } catch (err: any) {
        return { success: false, error: `Failed to fetch URL: ${err.message}` };
      }
    }

    // Extract basic tags cleanly without bulky cheerio dependency
    const titleMatch = rawHtml.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const textContent = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      success: true,
      data: {
        title: extractTitle ? title : undefined,
        textPreview: textContent.slice(0, 500),
        textLength: textContent.length,
        htmlLength: rawHtml.length,
      },
    };
  },
};

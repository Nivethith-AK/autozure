import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const markdownNode: NodeHandler = {
  type: 'util.markdown',
  category: 'utils',
  label: 'Markdown Parser',
  description: 'Convert Markdown to HTML, HTML to Markdown, or strip formatting tags.',
  icon: 'FileCode',
  color: '#0891b2',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Markdown to HTML', value: 'toHtml' },
        { label: 'Strip Markdown / Plain Text', value: 'toText' },
      ],
      default: 'toHtml',
      required: true,
    },
    {
      name: 'markdown',
      label: 'Markdown Text',
      type: 'code',
      placeholder: '# Title\n**bold text** and [link](https://autozure.local)',
      required: true,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation = 'toHtml', markdown = '' } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const text = interpolate(markdown as string);
    let result = '';

    if (operation === 'toHtml') {
      // Lightweight markdown to HTML converter
      result = text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*)\*/gim, '<i>$1</i>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
        .replace(/\n/gim, '<br />');
    } else {
      // Strip markdown
      result = text.replace(/(\*\*|__|\*|_|#|\[(.*?)\]\((.*?)\))/gim, '$2');
    }

    await ctx.logger.info(`Markdown: converted ${text.length} chars to ${operation}`);
    return { success: true, data: { result, originalLength: text.length } };
  },
};

import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const notionTriggerNode: NodeHandler = {
  type: 'trigger.notion',
  category: 'triggers',
  label: 'Notion Trigger',
  description: 'Trigger workflow when pages or database items are created or updated in Notion workspace.',
  icon: 'BookOpen',
  color: '#000000',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'databaseId',
      label: 'Database ID',
      type: 'string',
      required: true,
      placeholder: '32-character Notion database UUID',
    },
    {
      name: 'event',
      label: 'Event Type',
      type: 'select',
      options: [
        { label: 'Page Added to Database', value: 'page_added' },
        { label: 'Page Property Updated', value: 'page_updated' },
      ],
      default: 'page_added',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const triggerData = ctx.inputs['__trigger__']?.[0] ?? {};
    const { databaseId, event } = ctx.parameters;

    await ctx.logger.info(`Notion Trigger: event "${event}" on database ${databaseId}`);

    return {
      success: true,
      data: {
        _event: event || 'page_added',
        _databaseId: databaseId,
        ...((triggerData as Record<string, unknown>) || {}),
        _triggeredAt: new Date().toISOString(),
      },
    };
  },
};

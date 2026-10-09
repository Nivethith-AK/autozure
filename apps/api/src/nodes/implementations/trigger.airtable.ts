import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const airtableTriggerNode: NodeHandler = {
  type: 'trigger.airtable',
  category: 'triggers',
  label: 'Airtable Trigger',
  description: 'Trigger workflow when new records are added or updated in an Airtable base.',
  icon: 'Table',
  color: '#fcb400',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'baseId',
      label: 'Base ID',
      type: 'string',
      required: true,
      placeholder: 'appXXXXXXXXXXXXXX',
    },
    {
      name: 'tableId',
      label: 'Table Name or ID',
      type: 'string',
      required: true,
      placeholder: 'tblXXXXXXXXXXXXXX or Leads',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const triggerData = ctx.inputs['__trigger__']?.[0] ?? {};
    const { baseId, tableId } = ctx.parameters;

    await ctx.logger.info(`Airtable Trigger: incoming event for table "${tableId}"`);

    return {
      success: true,
      data: {
        _baseId: baseId,
        _tableId: tableId,
        ...((triggerData as Record<string, unknown>) || {}),
        _triggeredAt: new Date().toISOString(),
      },
    };
  },
};

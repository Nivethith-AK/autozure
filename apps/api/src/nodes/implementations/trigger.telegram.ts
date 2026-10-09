import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const telegramTriggerNode: NodeHandler = {
  type: 'trigger.telegram',
  category: 'triggers',
  label: 'Telegram Trigger',
  description: 'Trigger workflow when users send messages, commands, or callback queries to your Telegram Bot.',
  icon: 'Send',
  color: '#24a1de',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'updateType',
      label: 'Update Type',
      type: 'select',
      options: [
        { label: 'New Message', value: 'message' },
        { label: 'Bot Command (/command)', value: 'command' },
        { label: 'Inline Callback Button Click', value: 'callback_query' },
      ],
      default: 'message',
      required: true,
    },
    {
      name: 'commandFilter',
      label: 'Command Filter (e.g. /start)',
      type: 'string',
      placeholder: '/status',
      dependsOn: { name: 'updateType', value: 'command' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const triggerData = ctx.inputs['__trigger__']?.[0] ?? {};
    const { updateType, commandFilter } = ctx.parameters;

    await ctx.logger.info(`Telegram Trigger: received update of type "${updateType}"`);

    return {
      success: true,
      data: {
        _updateType: updateType,
        _command: commandFilter,
        ...((triggerData as Record<string, unknown>) || {}),
        _triggeredAt: new Date().toISOString(),
      },
    };
  },
};

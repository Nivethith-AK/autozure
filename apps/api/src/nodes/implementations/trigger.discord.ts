import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const discordTriggerNode: NodeHandler = {
  type: 'trigger.discord',
  category: 'triggers',
  label: 'Discord Trigger',
  description: 'Trigger workflow on Discord server interactions, message creation, or slash commands.',
  icon: 'Radio',
  color: '#5865f2',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'event',
      label: 'Discord Event',
      type: 'select',
      options: [
        { label: 'Message Created', value: 'message_create' },
        { label: 'Slash Command Triggered', value: 'interaction_create' },
        { label: 'Guild Member Join', value: 'guild_member_add' },
      ],
      default: 'message_create',
      required: true,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const triggerData = ctx.inputs['__trigger__']?.[0] ?? {};
    const { event } = ctx.parameters;

    await ctx.logger.info(`Discord Trigger: received event "${event}"`);

    return {
      success: true,
      data: {
        _event: event || 'message_create',
        ...((triggerData as Record<string, unknown>) || {}),
        _triggeredAt: new Date().toISOString(),
      },
    };
  },
};

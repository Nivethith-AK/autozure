import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const slackTriggerNode: NodeHandler = {
  type: 'trigger.slack',
  category: 'triggers',
  label: 'Slack Trigger',
  description: 'Trigger workflow on Slack events (messages, slash commands, reactions, mentions).',
  icon: 'MessageSquare',
  color: '#4a154b',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'event',
      label: 'Slack Event Type',
      type: 'select',
      options: [
        { label: 'Message Posted to Channel', value: 'message' },
        { label: 'App Mention (@bot)', value: 'app_mention' },
        { label: 'Reaction Added (:emoji:)', value: 'reaction_added' },
        { label: 'Slash Command Received', value: 'slash_command' },
      ],
      default: 'message',
      required: true,
    },
    {
      name: 'channel',
      label: 'Channel Name / ID (Optional)',
      type: 'string',
      placeholder: '#general or C12345678',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const triggerData = ctx.inputs['__trigger__']?.[0] ?? {};
    const { event, channel } = ctx.parameters;

    await ctx.logger.info(`Slack Trigger: received event "${event}" on ${channel || 'all channels'}`);

    return {
      success: true,
      data: {
        _event: event || 'message',
        _channel: channel || 'general',
        ...((triggerData as Record<string, unknown>) || {}),
        _triggeredAt: new Date().toISOString(),
      },
    };
  },
};

import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const teamsNode: NodeHandler = {
  type: 'connector.teams',
  category: 'communication',
  label: 'Microsoft Teams',
  description: 'Send messages, post adaptive cards, and publish channel notifications in Microsoft Teams.',
  icon: 'MessageSquare',
  color: '#6264a7',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['teams_webhook_url'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Send Webhook Message', value: 'sendMessage' },
        { label: 'Post Adaptive Card', value: 'postAdaptiveCard' },
      ],
      default: 'sendMessage',
      required: true,
    },
    {
      name: 'webhookUrl',
      label: 'Incoming Webhook URL',
      type: 'string',
      placeholder: 'https://outlook.office.com/webhook/...',
      required: false,
    },
    {
      name: 'title',
      label: 'Message Title',
      type: 'string',
      placeholder: 'Alert: High CPU Usage Detected',
    },
    {
      name: 'text',
      label: 'Message Body',
      type: 'string',
      placeholder: 'The workflow has finished processing batches.',
      required: true,
    },
    {
      name: 'themeColor',
      label: 'Theme Accent Color',
      type: 'string',
      default: '0076D7',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const webhookUrl = (ctx.parameters.webhookUrl as string) || ctx.credentials['teams_webhook_url'] || process.env.TEAMS_WEBHOOK_URL;
    const { operation, title, text, themeColor = '0076D7' } = ctx.parameters;

    await ctx.logger.info(`Microsoft Teams: sending ${operation}`);

    if (!webhookUrl) {
      await ctx.logger.warn('Teams: No webhook URL provided — simulating message delivery');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          message: { title, text, themeColor, sentAt: new Date().toISOString() },
        },
      };
    }

    try {
      const payload = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor,
        summary: title || text,
        title,
        text,
      };

      const res = await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });

      return { success: true, data: { status: res.status, data: res.data } };
    } catch (err: any) {
      return { success: false, error: `Teams error: ${err.message}` };
    }
  },
};

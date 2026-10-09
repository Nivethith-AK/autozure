import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const slackNode: NodeHandler = {
  type: 'connector.slack',
  category: 'communication',
  label: 'Slack',
  description: 'Send messages, rich blocks, and alerts to Slack channels or webhooks.',
  icon: 'MessageSquare',
  color: '#4a154b',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['slack'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Post to Incoming Webhook', value: 'webhook' },
        { label: 'Post Message (Bot Token)', value: 'post_message' },
      ],
      default: 'webhook',
      required: true,
    },
    {
      name: 'webhookUrl',
      label: 'Webhook URL',
      type: 'string',
      placeholder: 'https://hooks.slack.com/services/...',
      dependsOn: { name: 'operation', value: 'webhook' },
    },
    {
      name: 'channel',
      label: 'Channel Name / ID',
      type: 'string',
      placeholder: '#general or C12345678',
      dependsOn: { name: 'operation', value: 'post_message' },
    },
    {
      name: 'text',
      label: 'Message Text',
      type: 'string',
      required: true,
      placeholder: 'Deployment successful: {{input.version}}',
    },
    {
      name: 'blocksJson',
      label: 'Block Kit JSON (Optional)',
      type: 'json',
      default: '[]',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, webhookUrl, channel, text, blocksJson } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, key: string) => obj?.[key], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const messageText = interpolate(text as string);
    let blocks: unknown[] = [];
    try {
      if (blocksJson) {
        blocks = typeof blocksJson === 'string' ? JSON.parse(blocksJson) : blocksJson;
      }
    } catch {
      blocks = [];
    }

    if (operation === 'webhook') {
      const targetUrl = (webhookUrl as string) || (ctx.credentials['slackWebhook'] as string);
      if (!targetUrl) {
        return { success: false, error: 'Slack Webhook URL is required' };
      }

      await ctx.logger.info(`Sending Slack message via webhook`);
      const payload: Record<string, unknown> = { text: messageText };
      if (Array.isArray(blocks) && blocks.length > 0) payload.blocks = blocks;

      const res = await axios.post(targetUrl, payload, { timeout: 15000, signal: ctx.signal });
      return {
        success: true,
        data: { ok: true, status: res.status, messageText },
      };
    } else {
      const token = ctx.credentials['slackBotToken'] || process.env.SLACK_BOT_TOKEN;
      if (!token) return { success: false, error: 'Slack Bot Token required in credentials' };

      const res = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel,
          text: messageText,
          blocks: blocks.length > 0 ? blocks : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
          signal: ctx.signal,
        }
      );

      if (!res.data.ok) {
        return { success: false, error: `Slack API error: ${res.data.error}` };
      }

      return { success: true, data: res.data };
    }
  },
};

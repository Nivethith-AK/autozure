import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const discordNode: NodeHandler = {
  type: 'connector.discord',
  category: 'communication',
  label: 'Discord',
  description: 'Send messages and rich embed alerts directly to Discord channels via webhooks.',
  icon: 'Radio',
  color: '#5865f2',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['discord'],
  parameters: [
    {
      name: 'webhookUrl',
      label: 'Discord Webhook URL',
      type: 'string',
      required: true,
      placeholder: 'https://discord.com/api/webhooks/...',
    },
    {
      name: 'content',
      label: 'Message Content',
      type: 'string',
      placeholder: 'Alert: Service {{input.service}} triggered',
    },
    {
      name: 'username',
      label: 'Bot Display Name (Optional)',
      type: 'string',
      default: 'FlowForge Bot',
    },
    {
      name: 'embedTitle',
      label: 'Embed Title (Optional)',
      type: 'string',
      placeholder: 'Production Incident Detected',
    },
    {
      name: 'embedDescription',
      label: 'Embed Description (Optional)',
      type: 'string',
      placeholder: 'Details: {{input.details}}',
    },
    {
      name: 'embedColor',
      label: 'Embed Accent Color (Hex)',
      type: 'string',
      default: '#10b981',
      placeholder: '#10b981',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { webhookUrl, content, username, embedTitle, embedDescription, embedColor } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, key: string) => obj?.[key], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const targetUrl = (webhookUrl as string) || (ctx.credentials['discordWebhook'] as string);
    if (!targetUrl) return { success: false, error: 'Discord Webhook URL is required' };

    const payload: Record<string, unknown> = {
      username: username || 'FlowForge Bot',
    };

    if (content) payload.content = interpolate(content as string);

    if (embedTitle || embedDescription) {
      const hexColor = (embedColor as string || '#10b981').replace('#', '');
      const decimalColor = parseInt(hexColor, 16) || 0x10b981;

      payload.embeds = [
        {
          title: interpolate(embedTitle as string || ''),
          description: interpolate(embedDescription as string || ''),
          color: decimalColor,
          timestamp: new Date().toISOString(),
          footer: { text: 'FlowForge Automation Engine' },
        },
      ];
    }

    await ctx.logger.info(`Sending Discord notification`);
    const res = await axios.post(targetUrl, payload, { timeout: 15000, signal: ctx.signal });

    return {
      success: res.status >= 200 && res.status < 300,
      data: { status: res.status, delivered: true },
    };
  },
};

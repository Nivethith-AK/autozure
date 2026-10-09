import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const telegramNode: NodeHandler = {
  type: 'connector.telegram',
  category: 'communication',
  label: 'Telegram Bot',
  description: 'Send messages, markdown updates, and photos to Telegram chats and channels.',
  icon: 'Send',
  color: '#229ed9',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['telegram'],
  parameters: [
    {
      name: 'botToken',
      label: 'Bot Token',
      type: 'string',
      placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
      description: 'Leave empty to use saved credential',
    },
    {
      name: 'chatId',
      label: 'Chat ID / Channel Username',
      type: 'string',
      required: true,
      placeholder: '-100123456789 or @mychannel',
    },
    {
      name: 'text',
      label: 'Message Text',
      type: 'string',
      required: true,
      placeholder: 'Pipeline alert: {{input.status}}',
    },
    {
      name: 'parseMode',
      label: 'Parse Mode',
      type: 'select',
      options: [
        { label: 'HTML', value: 'HTML' },
        { label: 'Markdown', value: 'Markdown' },
        { label: 'Plain Text', value: '' },
      ],
      default: 'HTML',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { botToken, chatId, text, parseMode } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, key: string) => obj?.[key], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const token = (botToken as string) || ctx.credentials['telegramBotToken'] || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return { success: false, error: 'Telegram Bot Token is required' };
    if (!chatId) return { success: false, error: 'Telegram Chat ID is required' };

    const messageText = interpolate(text as string);
    await ctx.logger.info(`Sending Telegram message to chat ${chatId}`);

    const res = await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text: messageText,
        parse_mode: parseMode || undefined,
      },
      { timeout: 15000, signal: ctx.signal }
    );

    return {
      success: res.data.ok,
      data: res.data.result,
      error: res.data.ok ? undefined : res.data.description,
    };
  },
};

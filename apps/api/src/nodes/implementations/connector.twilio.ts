import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import axios from 'axios';

export const twilioNode: NodeHandler = {
  type: 'connector.twilio',
  category: 'communication',
  label: 'Twilio SMS',
  description: 'Send SMS messages and alerts worldwide through Twilio REST API.',
  icon: 'PhoneCall',
  color: '#f22f46',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['twilio'],
  parameters: [
    {
      name: 'accountSid',
      label: 'Account SID',
      type: 'string',
      placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    },
    {
      name: 'authToken',
      label: 'Auth Token',
      type: 'string',
      placeholder: '••••••••••••••••••••••••••••••••',
    },
    {
      name: 'fromNumber',
      label: 'Twilio Phone Number (From)',
      type: 'string',
      required: true,
      placeholder: '+15551234567',
    },
    {
      name: 'toNumber',
      label: 'Recipient Phone Number (To)',
      type: 'string',
      required: true,
      placeholder: '+15559876543',
    },
    {
      name: 'message',
      label: 'SMS Message Text',
      type: 'string',
      required: true,
      placeholder: 'Security alert: {{input.alertText}}',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { accountSid, authToken, fromNumber, toNumber, message } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, key: string) => obj?.[key], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const sid = (accountSid as string) || ctx.credentials['twilioAccountSid'] || process.env.TWILIO_ACCOUNT_SID;
    const token = (authToken as string) || ctx.credentials['twilioAuthToken'] || process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !token) {
      return { success: false, error: 'Twilio Account SID and Auth Token required' };
    }

    const text = interpolate(message as string);
    const to = interpolate(toNumber as string);
    const from = interpolate(fromNumber as string);

    await ctx.logger.info(`Sending Twilio SMS to ${to}`);

    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', from);
    params.append('Body', text);

    const authHeader = Buffer.from(`${sid}:${token}`).toString('base64');
    const res = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      params.toString(),
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15000,
        signal: ctx.signal,
      }
    );

    return {
      success: true,
      data: {
        sid: res.data.sid,
        status: res.data.status,
        to: res.data.to,
        from: res.data.from,
      },
    };
  },
};

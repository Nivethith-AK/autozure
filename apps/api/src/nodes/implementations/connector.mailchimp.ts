import axios from 'axios';
import crypto from 'crypto';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const mailchimpNode: NodeHandler = {
  type: 'connector.mailchimp',
  category: 'crm',
  label: 'Mailchimp',
  description: 'Manage email audiences, subscribers, campaigns, and tags in Mailchimp.',
  icon: 'Mail',
  color: '#ffe01b',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['mailchimp_api_key'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Add or Update Subscriber', value: 'addSubscriber' },
        { label: 'List Audiences', value: 'listAudiences' },
        { label: 'Get Member Info', value: 'getMember' },
      ],
      default: 'addSubscriber',
      required: true,
    },
    {
      name: 'listId',
      label: 'Audience / List ID',
      type: 'string',
      required: true,
      placeholder: 'e.g. 57afe96172',
    },
    {
      name: 'email',
      label: 'Subscriber Email',
      type: 'string',
      placeholder: 'subscriber@example.com',
      dependsOn: { name: 'operation', value: 'addSubscriber' },
    },
    {
      name: 'status',
      label: 'Subscription Status',
      type: 'select',
      options: [
        { label: 'Subscribed', value: 'subscribed' },
        { label: 'Pending (Double Opt-In)', value: 'pending' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
      ],
      default: 'subscribed',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['mailchimp_api_key'] || process.env.MAILCHIMP_API_KEY;
    const { operation, listId, email, status = 'subscribed' } = ctx.parameters;

    await ctx.logger.info(`Mailchimp: executing ${operation}`);

    if (!apiKey) {
      await ctx.logger.warn('Mailchimp: No API key configured — running in simulated mode');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          member: {
            id: `mc_${Date.now()}`,
            email_address: email || 'user@example.com',
            status,
            list_id: listId,
            timestamp_opt: new Date().toISOString(),
          },
        },
      };
    }

    try {
      // Mailchimp API key format: key-datacenter (e.g. abcdef123456-us19)
      const parts = String(apiKey).split('-');
      const datacenter = parts[1] || 'us1';

      const client = axios.create({
        baseURL: `https://${datacenter}.api.mailchimp.com/3.0`,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (operation === 'listAudiences') {
        const res = await client.get('/lists');
        return { success: true, data: res.data };
      } else if (operation === 'addSubscriber') {
        const hash = crypto.createHash('md5').update(String(email).toLowerCase()).digest('hex');
        const res = await client.put(`/lists/${listId}/members/${hash}`, {
          email_address: email,
          status_if_new: status,
          status,
        });
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported Mailchimp operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Mailchimp error: ${err.response?.data?.detail || err.message}` };
    }
  },
};

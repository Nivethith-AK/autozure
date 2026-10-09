import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const hubspotNode: NodeHandler = {
  type: 'connector.hubspot',
  category: 'crm',
  label: 'HubSpot',
  description: 'Manage contacts, deals, tickets, and companies in HubSpot CRM.',
  icon: 'Contact',
  color: '#ff7a59',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['hubspot_access_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create/Update Contact', value: 'createContact' },
        { label: 'Get Contact by Email', value: 'getContact' },
        { label: 'Create Deal', value: 'createDeal' },
        { label: 'List Deals', value: 'listDeals' },
      ],
      default: 'createContact',
      required: true,
    },
    {
      name: 'email',
      label: 'Contact Email',
      type: 'string',
      placeholder: 'lead@example.com',
      dependsOn: { name: 'operation', value: 'createContact' },
    },
    {
      name: 'firstname',
      label: 'First Name',
      type: 'string',
      placeholder: 'Jane',
      dependsOn: { name: 'operation', value: 'createContact' },
    },
    {
      name: 'lastname',
      label: 'Last Name',
      type: 'string',
      placeholder: 'Smith',
      dependsOn: { name: 'operation', value: 'createContact' },
    },
    {
      name: 'dealname',
      label: 'Deal Name',
      type: 'string',
      placeholder: 'Enterprise SaaS Annual',
      dependsOn: { name: 'operation', value: 'createDeal' },
    },
    {
      name: 'amount',
      label: 'Deal Amount',
      type: 'number',
      placeholder: '50000',
      dependsOn: { name: 'operation', value: 'createDeal' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const token = ctx.credentials['hubspot_access_token'] || process.env.HUBSPOT_ACCESS_TOKEN;
    const { operation, email, firstname, lastname, dealname, amount } = ctx.parameters;

    await ctx.logger.info(`HubSpot: executing ${operation}`);

    if (!token) {
      await ctx.logger.warn('HubSpot: No access token provided — returning simulated CRM entity');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          result: {
            id: `hs_${Date.now()}`,
            properties: {
              email: email || 'lead@example.com',
              firstname: firstname || 'Jane',
              lastname: lastname || 'Smith',
              dealname: dealname || 'New Deal',
              amount: amount || '10000',
              hs_object_id: `hs_${Date.now()}`,
            },
            createdAt: new Date().toISOString(),
          },
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: 'https://api.hubapi.com/crm/v3/objects',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (operation === 'createContact') {
        const res = await client.post('/contacts', {
          properties: {
            email,
            firstname,
            lastname,
          },
        });
        return { success: true, data: res.data };
      } else if (operation === 'createDeal') {
        const res = await client.post('/deals', {
          properties: {
            dealname,
            amount: String(amount || '0'),
            pipeline: 'default',
            dealstage: 'appointmentscheduled',
          },
        });
        return { success: true, data: res.data };
      } else if (operation === 'listDeals') {
        const res = await client.get('/deals?limit=10');
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported HubSpot operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `HubSpot error: ${err.response?.data?.message || err.message}` };
    }
  },
};

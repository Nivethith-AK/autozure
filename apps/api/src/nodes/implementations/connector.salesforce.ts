import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const salesforceNode: NodeHandler = {
  type: 'connector.salesforce',
  category: 'crm',
  label: 'Salesforce',
  description: 'Manage Leads, Accounts, Opportunities, and execute SOQL queries in Salesforce.',
  icon: 'Cloud',
  color: '#00a1e0',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['salesforce_instance_url', 'salesforce_access_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Lead', value: 'createLead' },
        { label: 'SOQL Query', value: 'soqlQuery' },
        { label: 'Get Record by ID', value: 'getRecord' },
        { label: 'Update Account', value: 'updateAccount' },
      ],
      default: 'createLead',
      required: true,
    },
    {
      name: 'soql',
      label: 'SOQL Query String',
      type: 'string',
      placeholder: 'SELECT Id, Name, Email FROM Contact LIMIT 10',
      dependsOn: { name: 'operation', value: 'soqlQuery' },
    },
    {
      name: 'lastName',
      label: 'Lead Last Name',
      type: 'string',
      placeholder: 'Wayne',
      dependsOn: { name: 'operation', value: 'createLead' },
    },
    {
      name: 'company',
      label: 'Company',
      type: 'string',
      placeholder: 'Wayne Enterprises',
      dependsOn: { name: 'operation', value: 'createLead' },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'string',
      placeholder: 'bruce@wayne.com',
      dependsOn: { name: 'operation', value: 'createLead' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const instanceUrl = ctx.credentials['salesforce_instance_url'] || process.env.SALESFORCE_INSTANCE_URL;
    const token = ctx.credentials['salesforce_access_token'] || process.env.SALESFORCE_ACCESS_TOKEN;
    const { operation, soql, lastName, company, email } = ctx.parameters;

    await ctx.logger.info(`Salesforce: executing ${operation}`);

    if (!token || !instanceUrl) {
      await ctx.logger.warn('Salesforce: Credentials not provided — simulating CRM query/record');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          records: operation === 'soqlQuery'
            ? [
                { Id: '001xx000003DGb2AAG', Name: 'Global Logistics Corp', Type: 'Customer - Direct' },
                { Id: '001xx000003DGb3AAG', Name: 'Acme Software Labs', Type: 'Partner' },
              ]
            : { id: `00Qxx000001${Date.now().toString(36)}`, success: true, errors: [] },
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: `${instanceUrl}/services/data/v58.0`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (operation === 'soqlQuery') {
        const res = await client.get(`/query?q=${encodeURIComponent(String(soql))}`);
        return { success: true, data: res.data };
      } else if (operation === 'createLead') {
        const res = await client.post('/sobjects/Lead', {
          LastName: lastName,
          Company: company,
          Email: email,
        });
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Salesforce error: ${err.response?.data?.[0]?.message || err.message}` };
    }
  },
};

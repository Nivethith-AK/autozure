import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const typeformNode: NodeHandler = {
  type: 'connector.typeform',
  category: 'crm',
  label: 'Typeform',
  description: 'Retrieve form responses, parse question answers, and list interactive forms.',
  icon: 'Table',
  color: '#262627',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['typeform_personal_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Get Form Responses', value: 'getResponses' },
        { label: 'List Forms', value: 'listForms' },
      ],
      default: 'getResponses',
      required: true,
    },
    {
      name: 'formId',
      label: 'Form ID / UID',
      type: 'string',
      required: true,
      placeholder: 'AbCdEf',
    },
    {
      name: 'pageSize',
      label: 'Page Size',
      type: 'number',
      default: 10,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const token = ctx.credentials['typeform_personal_token'] || process.env.TYPEFORM_TOKEN;
    const { operation, formId, pageSize = 10 } = ctx.parameters;

    await ctx.logger.info(`Typeform: executing ${operation} for form ${formId}`);

    if (!token) {
      await ctx.logger.warn('Typeform: No token provided — simulating responses');
      return {
        success: true,
        data: {
          simulated: true,
          total_items: 1,
          items: [
            {
              response_id: `resp_${Date.now()}`,
              submitted_at: new Date().toISOString(),
              answers: [
                { field: { id: 'q1', type: 'text' }, text: 'Alice Johnson' },
                { field: { id: 'q2', type: 'email' }, email: 'alice@example.com' },
              ],
            },
          ],
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: 'https://api.typeform.com',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (operation === 'getResponses') {
        const res = await client.get(`/forms/${formId}/responses?page_size=${pageSize}`);
        return { success: true, data: res.data };
      } else if (operation === 'listForms') {
        const res = await client.get('/forms');
        return { success: true, data: res.data };
      }

      return { success: false, error: `Invalid operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Typeform error: ${err.message}` };
    }
  },
};

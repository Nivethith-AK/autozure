import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const stripeNode: NodeHandler = {
  type: 'connector.stripe',
  category: 'commerce',
  label: 'Stripe',
  description: 'Process payments, manage customers, subscriptions, and invoices with Stripe.',
  icon: 'CreditCard',
  color: '#635bff',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['stripe_api_key'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Customer', value: 'createCustomer' },
        { label: 'Create Payment Intent', value: 'createPaymentIntent' },
        { label: 'Create Invoice', value: 'createInvoice' },
        { label: 'List Charges', value: 'listCharges' },
        { label: 'Refund Charge', value: 'refundCharge' },
      ],
      default: 'createCustomer',
      required: true,
    },
    {
      name: 'email',
      label: 'Customer Email',
      type: 'string',
      placeholder: 'customer@example.com',
      dependsOn: { name: 'operation', value: 'createCustomer' },
    },
    {
      name: 'name',
      label: 'Customer Name',
      type: 'string',
      placeholder: 'John Doe',
      dependsOn: { name: 'operation', value: 'createCustomer' },
    },
    {
      name: 'amount',
      label: 'Amount (in cents)',
      type: 'number',
      placeholder: '2000',
      dependsOn: { name: 'operation', value: 'createPaymentIntent' },
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'string',
      default: 'usd',
      placeholder: 'usd',
      dependsOn: { name: 'operation', value: 'createPaymentIntent' },
    },
    {
      name: 'customerId',
      label: 'Customer ID',
      type: 'string',
      placeholder: 'cus_123456',
      dependsOn: { name: 'operation', value: 'createInvoice' },
    },
    {
      name: 'chargeId',
      label: 'Charge ID to Refund',
      type: 'string',
      placeholder: 'ch_123456',
      dependsOn: { name: 'operation', value: 'refundCharge' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['stripe_api_key'] || process.env.STRIPE_API_KEY;
    const { operation, email, name, amount, currency = 'usd', customerId, chargeId } = ctx.parameters;

    await ctx.logger.info(`Stripe: executing operation "${operation}"`);

    if (!apiKey) {
      // Graceful sandbox fallback
      await ctx.logger.warn('Stripe: No API key provided — executing in sandbox simulation mode');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          result: {
            id: `stripe_mock_${Date.now()}`,
            object: operation === 'createCustomer' ? 'customer' : operation === 'createPaymentIntent' ? 'payment_intent' : 'invoice',
            email: email || 'customer@example.com',
            name: name || 'Demo User',
            amount: amount || 2000,
            currency,
            status: 'succeeded',
            createdAt: new Date().toISOString(),
          },
        },
      };
    }

    try {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      let endpoint = 'https://api.stripe.com/v1/';
      let bodyData: any = {};

      if (operation === 'createCustomer') {
        endpoint += 'customers';
        const params = new URLSearchParams();
        if (email) params.append('email', String(email));
        if (name) params.append('name', String(name));
        bodyData = params.toString();
      } else if (operation === 'createPaymentIntent') {
        endpoint += 'payment_intents';
        const params = new URLSearchParams();
        params.append('amount', String(amount || 1000));
        params.append('currency', String(currency || 'usd'));
        bodyData = params.toString();
      } else if (operation === 'createInvoice') {
        endpoint += 'invoices';
        const params = new URLSearchParams();
        if (customerId) params.append('customer', String(customerId));
        bodyData = params.toString();
      } else if (operation === 'listCharges') {
        endpoint += 'charges?limit=10';
        const res = await axios.get(endpoint, { headers });
        return { success: true, data: res.data };
      } else if (operation === 'refundCharge') {
        endpoint += 'refunds';
        const params = new URLSearchParams();
        if (chargeId) params.append('charge', String(chargeId));
        bodyData = params.toString();
      }

      const res = await axios.post(endpoint, bodyData, { headers });
      return { success: true, data: res.data };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      return { success: false, error: `Stripe API error: ${errorMsg}` };
    }
  },
};

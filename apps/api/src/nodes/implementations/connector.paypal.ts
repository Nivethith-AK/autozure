import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const paypalNode: NodeHandler = {
  type: 'connector.paypal',
  category: 'commerce',
  label: 'PayPal',
  description: 'Create and capture PayPal orders, process payments, and verify checkouts.',
  icon: 'DollarSign',
  color: '#003087',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['paypal_client_id', 'paypal_client_secret'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Order', value: 'createOrder' },
        { label: 'Capture Order', value: 'captureOrder' },
        { label: 'Get Order Details', value: 'getOrder' },
      ],
      default: 'createOrder',
      required: true,
    },
    {
      name: 'amount',
      label: 'Amount (e.g. 100.00)',
      type: 'string',
      placeholder: '100.00',
      dependsOn: { name: 'operation', value: 'createOrder' },
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'string',
      default: 'USD',
    },
    {
      name: 'orderId',
      label: 'Order ID',
      type: 'string',
      placeholder: '5O190127TN364715T',
      dependsOn: { name: 'operation', value: 'captureOrder' },
    },
    {
      name: 'sandbox',
      label: 'Use Sandbox Mode',
      type: 'boolean',
      default: true,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const clientId = ctx.credentials['paypal_client_id'] || process.env.PAYPAL_CLIENT_ID;
    const clientSecret = ctx.credentials['paypal_client_secret'] || process.env.PAYPAL_CLIENT_SECRET;
    const { operation, amount = '50.00', currency = 'USD', orderId, sandbox = true } = ctx.parameters;

    await ctx.logger.info(`PayPal: running ${operation}`);

    if (!clientId || !clientSecret) {
      await ctx.logger.warn('PayPal: No credentials found — simulating transaction in sandbox');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          order: {
            id: orderId || `PAYPAL_${Date.now()}`,
            status: operation === 'captureOrder' ? 'COMPLETED' : 'CREATED',
            intent: 'CAPTURE',
            gross_amount: { value: amount, currency_code: currency },
            create_time: new Date().toISOString(),
          },
        },
      };
    }

    try {
      const baseUrl = sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
      // 1. Get Access Token
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await axios.post(
        `${baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      const accessToken = tokenRes.data.access_token;

      // 2. Perform requested operation
      const client = axios.create({
        baseURL: baseUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (operation === 'createOrder') {
        const res = await client.post('/v2/checkout/orders', {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: String(amount),
              },
            },
          ],
        });
        return { success: true, data: res.data };
      } else if (operation === 'captureOrder') {
        const res = await client.post(`/v2/checkout/orders/${orderId}/capture`);
        return { success: true, data: res.data };
      } else if (operation === 'getOrder') {
        const res = await client.get(`/v2/checkout/orders/${orderId}`);
        return { success: true, data: res.data };
      }

      return { success: false, error: `Invalid operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `PayPal error: ${err.response?.data?.message || err.message}` };
    }
  },
};

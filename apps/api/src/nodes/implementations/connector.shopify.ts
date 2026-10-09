import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const shopifyNode: NodeHandler = {
  type: 'connector.shopify',
  category: 'commerce',
  label: 'Shopify',
  description: 'Manage store products, orders, customers, and inventory on Shopify.',
  icon: 'ShoppingBag',
  color: '#96bf48',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['shopify_access_token'],
  parameters: [
    {
      name: 'shopDomain',
      label: 'Shop Domain',
      type: 'string',
      required: true,
      placeholder: 'my-store.myshopify.com',
    },
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Get Products', value: 'getProducts' },
        { label: 'Create Order', value: 'createOrder' },
        { label: 'List Customers', value: 'listCustomers' },
        { label: 'Get Shop Info', value: 'getShopInfo' },
      ],
      default: 'getProducts',
      required: true,
    },
    {
      name: 'limit',
      label: 'Limit',
      type: 'number',
      default: 10,
    },
    {
      name: 'orderData',
      label: 'Order JSON',
      type: 'json',
      placeholder: '{"line_items": [{"variant_id": 123, "quantity": 1}]}',
      dependsOn: { name: 'operation', value: 'createOrder' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const token = ctx.credentials['shopify_access_token'] || process.env.SHOPIFY_ACCESS_TOKEN;
    const { shopDomain, operation, limit = 10, orderData } = ctx.parameters;

    await ctx.logger.info(`Shopify: executing "${operation}" on shop ${shopDomain || 'local'}`);

    if (!token) {
      await ctx.logger.warn('Shopify: No access token provided — executing in simulation mode');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          shop: shopDomain || 'demo.myshopify.com',
          data: operation === 'getProducts'
            ? [
                { id: 101, title: 'Ergonomic Chair', price: '299.00', inventory_quantity: 45 },
                { id: 102, title: 'Mechanical Keyboard', price: '129.50', inventory_quantity: 120 },
              ]
            : { id: 501, status: 'confirmed', total_price: '428.50', currency: 'USD' },
        },
      };
    }

    try {
      const cleanDomain = String(shopDomain).replace(/^https?:\/\//, '');
      const client = axios.create({
        baseURL: `https://${cleanDomain}/admin/api/2024-01`,
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (operation === 'getProducts') {
        const res = await client.get(`/products.json?limit=${limit}`);
        return { success: true, data: res.data };
      } else if (operation === 'listCustomers') {
        const res = await client.get(`/customers.json?limit=${limit}`);
        return { success: true, data: res.data };
      } else if (operation === 'getShopInfo') {
        const res = await client.get('/shop.json');
        return { success: true, data: res.data };
      } else if (operation === 'createOrder') {
        const parsed = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;
        const res = await client.post('/orders.json', { order: parsed });
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Shopify API error: ${err.response?.data?.errors || err.message}` };
    }
  },
};

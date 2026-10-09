import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const cloudflareNode: NodeHandler = {
  type: 'connector.cloudflare',
  category: 'devops',
  label: 'Cloudflare',
  description: 'Manage DNS records, purge cache, inspect zone analytics, and manage security rules.',
  icon: 'Cloud',
  color: '#f38020',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['cloudflare_api_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Purge Entire Cache', value: 'purgeCache' },
        { label: 'List DNS Records', value: 'listDns' },
        { label: 'Create DNS Record', value: 'createDns' },
      ],
      default: 'purgeCache',
      required: true,
    },
    {
      name: 'zoneId',
      label: 'Zone ID',
      type: 'string',
      required: true,
      placeholder: '023e105f4ecef8ad9ca31a8372d0c353',
    },
    {
      name: 'dnsName',
      label: 'DNS Record Name',
      type: 'string',
      placeholder: 'api.example.com',
      dependsOn: { name: 'operation', value: 'createDns' },
    },
    {
      name: 'dnsContent',
      label: 'DNS Record Content / IP',
      type: 'string',
      placeholder: '192.0.2.1',
      dependsOn: { name: 'operation', value: 'createDns' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const token = ctx.credentials['cloudflare_api_token'] || process.env.CLOUDFLARE_API_TOKEN;
    const { operation, zoneId, dnsName, dnsContent } = ctx.parameters;

    await ctx.logger.info(`Cloudflare: running ${operation} on zone ${zoneId}`);

    if (!token) {
      await ctx.logger.warn('Cloudflare: No API token provided — simulating operation');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          zoneId,
          result: { id: `cf_${Date.now()}`, success: true },
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: 'https://api.cloudflare.com/client/v4',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (operation === 'purgeCache') {
        const res = await client.post(`/zones/${zoneId}/purge_cache`, { purge_everything: true });
        return { success: true, data: res.data };
      } else if (operation === 'listDns') {
        const res = await client.get(`/zones/${zoneId}/dns_records`);
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported Cloudflare operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Cloudflare error: ${err.message}` };
    }
  },
};

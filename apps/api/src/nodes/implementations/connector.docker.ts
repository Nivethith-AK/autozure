import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const dockerNode: NodeHandler = {
  type: 'connector.docker',
  category: 'devops',
  label: 'Docker',
  description: 'Manage containers, query daemon status, inspect images, and restart services.',
  icon: 'Box',
  color: '#2496ed',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['docker_host'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'List Containers', value: 'listContainers' },
        { label: 'Inspect Container', value: 'inspectContainer' },
        { label: 'Restart Container', value: 'restartContainer' },
        { label: 'Get System Info', value: 'systemInfo' },
      ],
      default: 'listContainers',
      required: true,
    },
    {
      name: 'containerId',
      label: 'Container ID or Name',
      type: 'string',
      placeholder: 'autozure_redis_1',
      dependsOn: { name: 'operation', value: 'inspectContainer' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const dockerHost = ctx.credentials['docker_host'] || process.env.DOCKER_HOST;
    const { operation, containerId } = ctx.parameters;

    await ctx.logger.info(`Docker: running ${operation}`);

    if (!dockerHost) {
      await ctx.logger.warn('Docker: DOCKER_HOST not configured — returning simulated container list');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          containers: [
            {
              Id: '8f7a6b5c4d3e',
              Names: ['/autozure_api'],
              Image: 'node:20-alpine',
              State: 'running',
              Status: 'Up 4 hours',
            },
            {
              Id: '1a2b3c4d5e6f',
              Names: ['/autozure_redis'],
              Image: 'redis:7-alpine',
              State: 'running',
              Status: 'Up 4 hours',
            },
          ],
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: dockerHost,
        timeout: 15000,
      });

      if (operation === 'listContainers') {
        const res = await client.get('/containers/json?all=1');
        return { success: true, data: res.data };
      } else if (operation === 'inspectContainer') {
        const res = await client.get(`/containers/${containerId}/json`);
        return { success: true, data: res.data };
      } else if (operation === 'restartContainer') {
        const res = await client.post(`/containers/${containerId}/restart`);
        return { success: true, data: { restarted: true, containerId } };
      } else if (operation === 'systemInfo') {
        const res = await client.get('/info');
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Docker daemon error: ${err.message}` };
    }
  },
};

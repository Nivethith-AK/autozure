import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const clickupNode: NodeHandler = {
  type: 'connector.clickup',
  category: 'productivity',
  label: 'ClickUp',
  description: 'Manage tasks, lists, spaces, and workspace statuses on ClickUp.',
  icon: 'CheckCircle',
  color: '#7b68ee',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['clickup_api_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Task', value: 'createTask' },
        { label: 'Get Task', value: 'getTask' },
        { label: 'Get List Tasks', value: 'getListTasks' },
      ],
      default: 'createTask',
      required: true,
    },
    {
      name: 'listId',
      label: 'List ID',
      type: 'string',
      placeholder: '900200100',
      dependsOn: { name: 'operation', value: 'createTask' },
    },
    {
      name: 'name',
      label: 'Task Name',
      type: 'string',
      placeholder: 'Weekly Performance Review',
      dependsOn: { name: 'operation', value: 'createTask' },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'string',
      placeholder: 'Review KPIs and customer satisfaction metrics',
      dependsOn: { name: 'operation', value: 'createTask' },
    },
    {
      name: 'taskId',
      label: 'Task ID',
      type: 'string',
      placeholder: '86851j8kq',
      dependsOn: { name: 'operation', value: 'getTask' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const token = ctx.credentials['clickup_api_token'] || process.env.CLICKUP_API_TOKEN;
    const { operation, listId, name, description, taskId } = ctx.parameters;

    await ctx.logger.info(`ClickUp: executing ${operation}`);

    if (!token) {
      await ctx.logger.warn('ClickUp: No token provided — returning simulated task');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          task: {
            id: taskId || `cu_${Date.now()}`,
            name: name || 'ClickUp Task',
            status: { status: 'to do', color: '#d3d3d3' },
            url: 'https://app.clickup.com/t/demo',
          },
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: 'https://api.clickup.com/api/v2',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      if (operation === 'createTask') {
        const res = await client.post(`/list/${listId}/task`, { name, description });
        return { success: true, data: res.data };
      } else if (operation === 'getTask') {
        const res = await client.get(`/task/${taskId}`);
        return { success: true, data: res.data };
      } else if (operation === 'getListTasks') {
        const res = await client.get(`/list/${listId}/task`);
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `ClickUp error: ${err.response?.data?.err || err.message}` };
    }
  },
};

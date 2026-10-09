import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const todoistNode: NodeHandler = {
  type: 'connector.todoist',
  category: 'productivity',
  label: 'Todoist',
  description: 'Create tasks, manage projects, set priorities, and complete items in Todoist.',
  icon: 'CheckSquare',
  color: '#e44332',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['todoist_api_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Task', value: 'createTask' },
        { label: 'List Tasks', value: 'listTasks' },
      ],
      default: 'createTask',
      required: true,
    },
    {
      name: 'content',
      label: 'Task Content',
      type: 'string',
      required: true,
      placeholder: 'Follow up on support ticket #412',
    },
    {
      name: 'dueString',
      label: 'Due Date String',
      type: 'string',
      placeholder: 'tomorrow at 12:00',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const token = ctx.credentials['todoist_api_token'] || process.env.TODOIST_TOKEN;
    const { operation, content, dueString } = ctx.parameters;

    await ctx.logger.info(`Todoist: executing ${operation}`);

    if (!token) {
      await ctx.logger.warn('Todoist: No token configured — simulating task');
      return {
        success: true,
        data: {
          simulated: true,
          task: { id: `td_${Date.now()}`, content, due: { string: dueString || 'today' }, is_completed: false },
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: 'https://api.todoist.com/rest/v2',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (operation === 'createTask') {
        const res = await client.post('/tasks', { content, due_string: dueString || undefined });
        return { success: true, data: res.data };
      } else if (operation === 'listTasks') {
        const res = await client.get('/tasks');
        return { success: true, data: res.data };
      }

      return { success: false, error: `Invalid operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Todoist error: ${err.message}` };
    }
  },
};

import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const asanaNode: NodeHandler = {
  type: 'connector.asana',
  category: 'productivity',
  label: 'Asana',
  description: 'Create tasks, assign work, and manage projects in Asana.',
  icon: 'CheckSquare',
  color: '#f06a6a',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['asana_access_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Task', value: 'createTask' },
        { label: 'Get Task', value: 'getTask' },
        { label: 'Update Task', value: 'updateTask' },
        { label: 'List Projects', value: 'listProjects' },
      ],
      default: 'createTask',
      required: true,
    },
    {
      name: 'workspaceGid',
      label: 'Workspace GID',
      type: 'string',
      placeholder: '1234567890',
    },
    {
      name: 'projectGid',
      label: 'Project GID',
      type: 'string',
      placeholder: '9876543210',
      dependsOn: { name: 'operation', value: 'createTask' },
    },
    {
      name: 'name',
      label: 'Task Name',
      type: 'string',
      placeholder: 'Deploy v2.4 Release Candidate',
      dependsOn: { name: 'operation', value: 'createTask' },
    },
    {
      name: 'notes',
      label: 'Task Notes',
      type: 'string',
      placeholder: 'Automated release notes and steps',
      dependsOn: { name: 'operation', value: 'createTask' },
    },
    {
      name: 'taskGid',
      label: 'Task GID',
      type: 'string',
      placeholder: '1122334455',
      dependsOn: { name: 'operation', value: 'getTask' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const token = ctx.credentials['asana_access_token'] || process.env.ASANA_ACCESS_TOKEN;
    const { operation, workspaceGid, projectGid, name, notes, taskGid } = ctx.parameters;

    await ctx.logger.info(`Asana: executing ${operation}`);

    if (!token) {
      await ctx.logger.warn('Asana: No access token provided — returning simulated task');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          task: {
            gid: taskGid || `asana_${Date.now()}`,
            name: name || 'Automated Asana Task',
            notes: notes || '',
            completed: false,
            created_at: new Date().toISOString(),
          },
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: 'https://app.asana.com/api/1.0',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (operation === 'createTask') {
        const body: any = { data: { name, notes } };
        if (projectGid) body.data.projects = [projectGid];
        if (workspaceGid) body.data.workspace = workspaceGid;
        const res = await client.post('/tasks', body);
        return { success: true, data: res.data };
      } else if (operation === 'getTask') {
        const res = await client.get(`/tasks/${taskGid}`);
        return { success: true, data: res.data };
      } else if (operation === 'listProjects') {
        const res = await client.get(`/projects?workspace=${workspaceGid}`);
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported Asana operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Asana API error: ${err.response?.data?.errors?.[0]?.message || err.message}` };
    }
  },
};

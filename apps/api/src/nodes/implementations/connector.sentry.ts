import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const sentryNode: NodeHandler = {
  type: 'connector.sentry',
  category: 'devops',
  label: 'Sentry',
  description: 'Query runtime exceptions, fetch unresolved issues, and update issue states in Sentry.',
  icon: 'Bug',
  color: '#362d59',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['sentry_auth_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'List Unresolved Issues', value: 'listIssues' },
        { label: 'Resolve Issue', value: 'resolveIssue' },
      ],
      default: 'listIssues',
      required: true,
    },
    {
      name: 'organizationSlug',
      label: 'Organization Slug',
      type: 'string',
      required: true,
      placeholder: 'my-org',
    },
    {
      name: 'projectSlug',
      label: 'Project Slug',
      type: 'string',
      required: true,
      placeholder: 'backend-api',
    },
    {
      name: 'issueId',
      label: 'Issue ID',
      type: 'string',
      placeholder: '123456789',
      dependsOn: { name: 'operation', value: 'resolveIssue' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const token = ctx.credentials['sentry_auth_token'] || process.env.SENTRY_AUTH_TOKEN;
    const { operation, organizationSlug, projectSlug, issueId } = ctx.parameters;

    await ctx.logger.info(`Sentry: executing ${operation} on ${organizationSlug}/${projectSlug}`);

    if (!token) {
      await ctx.logger.warn('Sentry: No auth token provided — returning simulated error issues');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          issues: [
            { id: '987654', title: 'TypeError: Cannot read property "id" of undefined', count: '142', culprit: 'api/checkout.ts' },
          ],
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: 'https://sentry.io/api/0',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (operation === 'listIssues') {
        const res = await client.get(`/projects/${organizationSlug}/${projectSlug}/issues/?query=is:unresolved`);
        return { success: true, data: res.data };
      } else if (operation === 'resolveIssue') {
        const res = await client.put(`/issues/${issueId}/`, { status: 'resolved' });
        return { success: true, data: res.data };
      }

      return { success: false, error: `Invalid operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Sentry error: ${err.message}` };
    }
  },
};

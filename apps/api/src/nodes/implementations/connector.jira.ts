import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import axios from 'axios';

export const jiraNode: NodeHandler = {
  type: 'connector.jira',
  category: 'developer',
  label: 'Jira Software',
  description: 'Create and search Jira issues and track team sprint tasks.',
  icon: 'Layers',
  color: '#0052cc',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['jira'],
  parameters: [
    {
      name: 'domain',
      label: 'Atlassian Domain',
      type: 'string',
      required: true,
      placeholder: 'yourcompany.atlassian.net',
    },
    {
      name: 'email',
      label: 'Atlassian Account Email',
      type: 'string',
      required: true,
      placeholder: 'dev@yourcompany.com',
    },
    {
      name: 'apiToken',
      label: 'Jira API Token',
      type: 'string',
      placeholder: '••••••••••••••••',
    },
    {
      name: 'projectKey',
      label: 'Project Key',
      type: 'string',
      required: true,
      placeholder: 'PROJ',
    },
    {
      name: 'summary',
      label: 'Issue Summary (Title)',
      type: 'string',
      required: true,
      placeholder: 'Incident: {{input.incidentTitle}}',
    },
    {
      name: 'issueType',
      label: 'Issue Type',
      type: 'select',
      options: [
        { label: 'Task', value: 'Task' },
        { label: 'Bug', value: 'Bug' },
        { label: 'Story', value: 'Story' },
      ],
      default: 'Task',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { domain, email, apiToken, projectKey, summary, issueType } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, key: string) => obj?.[key], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const token = (apiToken as string) || ctx.credentials['jiraApiToken'] || process.env.JIRA_API_TOKEN;
    if (!token) return { success: false, error: 'Jira API Token required' };

    const authHeader = Buffer.from(`${email}:${token}`).toString('base64');
    const issueSummary = interpolate(summary as string);

    await ctx.logger.info(`Creating Jira issue in ${projectKey}: ${issueSummary}`);

    const res = await axios.post(
      `https://${domain}/rest/api/3/issue`,
      {
        fields: {
          project: { key: projectKey },
          summary: issueSummary,
          issuetype: { name: issueType || 'Task' },
        },
      },
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15000,
        signal: ctx.signal,
      }
    );

    return {
      success: true,
      data: {
        id: res.data.id,
        key: res.data.key,
        url: `https://${domain}/browse/${res.data.key}`,
      },
    };
  },
};

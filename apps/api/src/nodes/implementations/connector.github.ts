import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import axios from 'axios';

export const githubNode: NodeHandler = {
  type: 'connector.github',
  category: 'developer',
  label: 'GitHub',
  description: 'Automate GitHub repositories: create issues, post comments, and dispatch events.',
  icon: 'Github',
  color: '#24292e',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['github'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Issue', value: 'create_issue' },
        { label: 'Create Issue Comment', value: 'create_comment' },
        { label: 'Get Repository Details', value: 'get_repo' },
      ],
      default: 'create_issue',
      required: true,
    },
    {
      name: 'owner',
      label: 'Repository Owner (User or Org)',
      type: 'string',
      required: true,
      placeholder: 'octocat',
    },
    {
      name: 'repo',
      label: 'Repository Name',
      type: 'string',
      required: true,
      placeholder: 'Hello-World',
    },
    {
      name: 'title',
      label: 'Issue Title',
      type: 'string',
      placeholder: 'Bug: {{input.errorSummary}}',
      dependsOn: { name: 'operation', value: 'create_issue' },
    },
    {
      name: 'body',
      label: 'Issue / Comment Body',
      type: 'string',
      placeholder: 'Automated report from AutoZure:\n\n{{input.details}}',
    },
    {
      name: 'issueNumber',
      label: 'Issue / PR Number',
      type: 'number',
      placeholder: '42',
      dependsOn: { name: 'operation', value: 'create_comment' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, owner, repo, title, body, issueNumber } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, key: string) => obj?.[key], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const token = ctx.credentials['githubToken'] || process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'AutoZure-Workflow-Engine',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const textBody = interpolate(body as string || '');
    const issueTitle = interpolate(title as string || '');

    if (operation === 'create_issue') {
      if (!token) return { success: false, error: 'GitHub Personal Access Token is required' };
      await ctx.logger.info(`Creating GitHub issue in ${owner}/${repo}`);

      const res = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        { title: issueTitle, body: textBody },
        { headers, timeout: 15000, signal: ctx.signal }
      );
      return { success: true, data: { issueUrl: res.data.html_url, number: res.data.number, title: res.data.title } };
    }

    if (operation === 'create_comment') {
      if (!token) return { success: false, error: 'GitHub Personal Access Token is required' };
      const num = Number(issueNumber);
      await ctx.logger.info(`Posting comment to ${owner}/${repo}#${num}`);

      const res = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/issues/${num}/comments`,
        { body: textBody },
        { headers, timeout: 15000, signal: ctx.signal }
      );
      return { success: true, data: { commentUrl: res.data.html_url, id: res.data.id } };
    }

    if (operation === 'get_repo') {
      await ctx.logger.info(`Fetching repo details for ${owner}/${repo}`);
      const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers,
        timeout: 15000,
        signal: ctx.signal,
      });
      return {
        success: true,
        data: {
          fullName: res.data.full_name,
          stars: res.data.stargazers_count,
          forks: res.data.forks_count,
          openIssues: res.data.open_issues_count,
          url: res.data.html_url,
        },
      };
    }

    return { success: false, error: 'Unknown operation' };
  },
};

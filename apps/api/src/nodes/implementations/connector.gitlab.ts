import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import axios from 'axios';

export const gitlabNode: NodeHandler = {
  type: 'connector.gitlab',
  category: 'developer',
  label: 'GitLab',
  description: 'Trigger GitLab CI/CD pipelines and create project issues.',
  icon: 'Gitlab',
  color: '#fc6d26',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['gitlab'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Issue', value: 'create_issue' },
        { label: 'Trigger Pipeline', value: 'trigger_pipeline' },
      ],
      default: 'create_issue',
      required: true,
    },
    {
      name: 'gitlabUrl',
      label: 'GitLab Instance URL',
      type: 'string',
      default: 'https://gitlab.com',
      required: true,
    },
    {
      name: 'projectId',
      label: 'Project ID or URL-encoded Path',
      type: 'string',
      required: true,
      placeholder: 'group%2Fproject or 12345',
    },
    {
      name: 'title',
      label: 'Issue Title',
      type: 'string',
      placeholder: 'Alert: {{input.title}}',
      dependsOn: { name: 'operation', value: 'create_issue' },
    },
    {
      name: 'ref',
      label: 'Branch or Git Ref',
      type: 'string',
      default: 'main',
      dependsOn: { name: 'operation', value: 'trigger_pipeline' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, gitlabUrl, projectId, title, ref } = ctx.parameters;
    const token = ctx.credentials['gitlabToken'] || process.env.GITLAB_TOKEN;
    if (!token) return { success: false, error: 'GitLab Personal Access Token required' };

    const baseUrl = ((gitlabUrl as string) || 'https://gitlab.com').replace(/\/$/, '');
    const headers = { 'PRIVATE-TOKEN': token };

    if (operation === 'create_issue') {
      const res = await axios.post(
        `${baseUrl}/api/v4/projects/${projectId}/issues`,
        { title: title || 'New Issue from AutoZure' },
        { headers, timeout: 15000, signal: ctx.signal }
      );
      return { success: true, data: { issueId: res.data.id, webUrl: res.data.web_url } };
    }

    if (operation === 'trigger_pipeline') {
      const res = await axios.post(
        `${baseUrl}/api/v4/projects/${projectId}/pipeline`,
        { ref: ref || 'main' },
        { headers, timeout: 15000, signal: ctx.signal }
      );
      return { success: true, data: { pipelineId: res.data.id, status: res.data.status, webUrl: res.data.web_url } };
    }

    return { success: false, error: 'Unsupported GitLab operation' };
  },
};

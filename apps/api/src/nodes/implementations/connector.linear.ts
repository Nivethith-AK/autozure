import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const linearNode: NodeHandler = {
  type: 'connector.linear',
  category: 'developer',
  label: 'Linear',
  description: 'Create and track software issues, manage projects, and cycle updates on Linear.',
  icon: 'Layers',
  color: '#5e6ad2',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['linear_api_key'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Issue', value: 'createIssue' },
        { label: 'Update Issue', value: 'updateIssue' },
        { label: 'List Teams', value: 'listTeams' },
      ],
      default: 'createIssue',
      required: true,
    },
    {
      name: 'teamId',
      label: 'Team ID',
      type: 'string',
      placeholder: 'OPS or team_uuid',
      dependsOn: { name: 'operation', value: 'createIssue' },
    },
    {
      name: 'title',
      label: 'Issue Title',
      type: 'string',
      placeholder: 'Fix edge case in payment webhook',
      dependsOn: { name: 'operation', value: 'createIssue' },
    },
    {
      name: 'description',
      label: 'Description (Markdown)',
      type: 'string',
      placeholder: 'Steps to reproduce...',
      dependsOn: { name: 'operation', value: 'createIssue' },
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { label: 'No Priority (0)', value: 0 },
        { label: 'Urgent (1)', value: 1 },
        { label: 'High (2)', value: 2 },
        { label: 'Medium (3)', value: 3 },
        { label: 'Low (4)', value: 4 },
      ],
      default: 2,
    },
    {
      name: 'issueId',
      label: 'Issue ID to Update',
      type: 'string',
      placeholder: 'ENG-1234',
      dependsOn: { name: 'operation', value: 'updateIssue' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['linear_api_key'] || process.env.LINEAR_API_KEY;
    const { operation, teamId, title, description, priority = 2, issueId } = ctx.parameters;

    await ctx.logger.info(`Linear: executing ${operation}`);

    if (!apiKey) {
      await ctx.logger.warn('Linear: API key missing — executing in simulation mode');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          issue: {
            id: issueId || `lin_${Date.now()}`,
            identifier: 'ENG-842',
            title: title || 'Automated Linear Issue',
            priority,
            url: 'https://linear.app/issue/ENG-842',
            createdAt: new Date().toISOString(),
          },
        },
      };
    }

    try {
      const graphqlUrl = 'https://api.linear.app/graphql';

      if (operation === 'createIssue') {
        const query = `
          mutation IssueCreate($input: IssueCreateInput!) {
            issueCreate(input: $input) {
              success
              issue {
                id
                identifier
                title
                url
              }
            }
          }
        `;
        const res = await axios.post(
          graphqlUrl,
          {
            query,
            variables: {
              input: {
                teamId,
                title,
                description,
                priority: Number(priority),
              },
            },
          },
          {
            headers: {
              Authorization: apiKey,
              'Content-Type': 'application/json',
            },
          }
        );
        return { success: true, data: res.data?.data?.issueCreate };
      } else if (operation === 'listTeams') {
        const query = `{ teams { nodes { id name key } } }`;
        const res = await axios.post(graphqlUrl, { query }, {
          headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
        });
        return { success: true, data: res.data?.data?.teams?.nodes };
      }

      return { success: false, error: `Unsupported operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Linear error: ${err.response?.data?.errors?.[0]?.message || err.message}` };
    }
  },
};

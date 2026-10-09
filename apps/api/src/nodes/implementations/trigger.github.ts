import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const githubTriggerNode: NodeHandler = {
  type: 'trigger.github',
  category: 'triggers',
  label: 'GitHub Trigger',
  description: 'Trigger workflow on GitHub repository webhooks (push, pull request, issues, releases).',
  icon: 'Github',
  color: '#24292e',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'events',
      label: 'Repository Events',
      type: 'select',
      options: [
        { label: 'Push (commits)', value: 'push' },
        { label: 'Pull Request', value: 'pull_request' },
        { label: 'Issues', value: 'issues' },
        { label: 'Release Published', value: 'release' },
        { label: 'Star / Fork', value: 'watch' },
      ],
      default: 'push',
      required: true,
    },
    {
      name: 'repository',
      label: 'Repository (owner/repo)',
      type: 'string',
      placeholder: 'octocat/Hello-World',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const triggerData = ctx.inputs['__trigger__']?.[0] ?? {};
    const { events, repository } = ctx.parameters;

    await ctx.logger.info(`GitHub Trigger received event: ${events || 'webhook'}`);

    return {
      success: true,
      data: {
        _event: events || 'push',
        _repository: repository || 'custom/repo',
        ...((triggerData as Record<string, unknown>) || {}),
        _triggeredAt: new Date().toISOString(),
      },
    };
  },
};

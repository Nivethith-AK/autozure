import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const gitlabTriggerNode: NodeHandler = {
  type: 'trigger.gitlab',
  category: 'triggers',
  label: 'GitLab Trigger',
  description: 'Trigger workflow on GitLab project webhooks (push, merge requests, pipeline events).',
  icon: 'Gitlab',
  color: '#fc6d26',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'event',
      label: 'GitLab Event',
      type: 'select',
      options: [
        { label: 'Push Events', value: 'push' },
        { label: 'Merge Request Events', value: 'merge_request' },
        { label: 'Pipeline Events', value: 'pipeline' },
        { label: 'Issue Events', value: 'issue' },
      ],
      default: 'push',
      required: true,
    },
    {
      name: 'project',
      label: 'Project Path (group/project)',
      type: 'string',
      placeholder: 'gitlab-org/gitlab',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const triggerData = ctx.inputs['__trigger__']?.[0] ?? {};
    const { event, project } = ctx.parameters;

    await ctx.logger.info(`GitLab Trigger: received event "${event}"`);

    return {
      success: true,
      data: {
        _event: event || 'push',
        _project: project,
        ...((triggerData as Record<string, unknown>) || {}),
        _triggeredAt: new Date().toISOString(),
      },
    };
  },
};

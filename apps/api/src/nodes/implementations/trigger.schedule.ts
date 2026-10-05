import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const scheduleTriggerNode: NodeHandler = {
  type: 'trigger.schedule',
  category: 'triggers',
  label: 'Schedule Trigger',
  description: 'Run the workflow on a recurring schedule using a cron expression.',
  icon: 'Clock',
  color: '#f59e0b',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'cron',
      label: 'Cron Expression',
      type: 'string',
      description: 'Standard cron expression (e.g. "0 9 * * 1" = every Monday at 9am)',
      required: true,
      placeholder: '0 * * * *',
    },
    {
      name: 'timezone',
      label: 'Timezone',
      type: 'string',
      default: 'UTC',
      placeholder: 'UTC',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    return {
      success: true,
      data: {
        _scheduledAt: new Date().toISOString(),
        _cron: ctx.parameters.cron,
      },
    };
  },
};

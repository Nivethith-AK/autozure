import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const webhookTriggerNode: NodeHandler = {
  type: 'trigger.webhook',
  category: 'triggers',
  label: 'Webhook Trigger',
  description: 'Start the workflow when an HTTP request is received at the webhook URL.',
  icon: 'Globe',
  color: '#10b981',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'method',
      label: 'HTTP Method',
      type: 'select',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' },
      ],
      default: 'POST',
      required: true,
    },
    {
      name: 'response',
      label: 'Response Mode',
      type: 'select',
      options: [
        { label: 'Immediately (202 Accepted)', value: 'immediate' },
        { label: 'After workflow completes', value: 'sync' },
      ],
      default: 'immediate',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const webhookData = ctx.inputs['__trigger__']?.[0] ?? {};
    return {
      success: true,
      data: webhookData as Record<string, unknown>,
    };
  },
};

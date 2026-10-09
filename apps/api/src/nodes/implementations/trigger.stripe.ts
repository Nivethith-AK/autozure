import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const stripeTriggerNode: NodeHandler = {
  type: 'trigger.stripe',
  category: 'triggers',
  label: 'Stripe Trigger',
  description: 'Trigger workflow on incoming Stripe webhook events (payments, subscriptions, invoices).',
  icon: 'CreditCard',
  color: '#635bff',
  inputs: [],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'event',
      label: 'Stripe Event Type',
      type: 'select',
      options: [
        { label: 'Payment Intent Succeeded', value: 'payment_intent.succeeded' },
        { label: 'Payment Intent Failed', value: 'payment_intent.payment_failed' },
        { label: 'Customer Created', value: 'customer.created' },
        { label: 'Customer Subscription Created', value: 'customer.subscription.created' },
        { label: 'Invoice Paid', value: 'invoice.paid' },
        { label: 'Charge Refunded', value: 'charge.refunded' },
      ],
      default: 'payment_intent.succeeded',
      required: true,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const triggerData = ctx.inputs['__trigger__']?.[0] ?? {};
    const { event } = ctx.parameters;

    await ctx.logger.info(`Stripe Trigger: received event "${event}"`);

    return {
      success: true,
      data: {
        _event: event || 'payment_intent.succeeded',
        ...((triggerData as Record<string, unknown>) || {}),
        _triggeredAt: new Date().toISOString(),
      },
    };
  },
};

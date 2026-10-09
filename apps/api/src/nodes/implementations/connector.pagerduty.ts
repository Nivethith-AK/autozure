import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const pagerdutyNode: NodeHandler = {
  type: 'connector.pagerduty',
  category: 'devops',
  label: 'PagerDuty',
  description: 'Trigger on-call incidents, acknowledge alarms, and resolve service outages on PagerDuty.',
  icon: 'Radio',
  color: '#04ac33',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['pagerduty_routing_key'],
  parameters: [
    {
      name: 'eventAction',
      label: 'Event Action',
      type: 'select',
      options: [
        { label: 'Trigger Incident', value: 'trigger' },
        { label: 'Acknowledge Incident', value: 'acknowledge' },
        { label: 'Resolve Incident', value: 'resolve' },
      ],
      default: 'trigger',
      required: true,
    },
    {
      name: 'summary',
      label: 'Incident Summary / Title',
      type: 'string',
      required: true,
      placeholder: 'CRITICAL: Database connection pool exhausted',
    },
    {
      name: 'severity',
      label: 'Severity Level',
      type: 'select',
      options: [
        { label: 'Critical', value: 'critical' },
        { label: 'Error', value: 'error' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' },
      ],
      default: 'critical',
    },
    {
      name: 'dedupKey',
      label: 'Dedup Key (Optional)',
      type: 'string',
      placeholder: 'service_prod_db',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const routingKey = ctx.credentials['pagerduty_routing_key'] || process.env.PAGERDUTY_ROUTING_KEY;
    const { eventAction = 'trigger', summary, severity = 'critical', dedupKey } = ctx.parameters;

    await ctx.logger.info(`PagerDuty: ${eventAction} incident: "${summary}"`);

    if (!routingKey) {
      await ctx.logger.warn('PagerDuty: No routing key configured — simulating event delivery');
      return {
        success: true,
        data: {
          simulated: true,
          status: 'success',
          message: 'Event processed (simulation)',
          dedup_key: dedupKey || `pd_${Date.now()}`,
        },
      };
    }

    try {
      const res = await axios.post('https://events.pagerduty.com/v2/enqueue', {
        routing_key: routingKey,
        event_action: eventAction,
        dedup_key: dedupKey || undefined,
        payload: {
          summary,
          severity,
          source: 'FlowForge Engine',
          timestamp: new Date().toISOString(),
        },
      });

      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, error: `PagerDuty error: ${err.message}` };
    }
  },
};

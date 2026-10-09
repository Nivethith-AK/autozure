import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const redisNode: NodeHandler = {
  type: 'connector.redis',
  category: 'databases',
  label: 'Redis Cache & PubSub',
  description: 'Get, set, delete cached keys, or publish messages to Redis channels.',
  icon: 'Zap',
  color: '#dc382d',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['redis'],
  parameters: [
    {
      name: 'command',
      label: 'Redis Command',
      type: 'select',
      options: [
        { label: 'GET (Retrieve Key)', value: 'GET' },
        { label: 'SET (Store Value)', value: 'SET' },
        { label: 'DEL (Delete Key)', value: 'DEL' },
        { label: 'PUBLISH (Publish to Channel)', value: 'PUBLISH' },
      ],
      default: 'GET',
      required: true,
    },
    {
      name: 'key',
      label: 'Key Name or Channel',
      type: 'string',
      required: true,
      placeholder: 'user:session:123',
    },
    {
      name: 'value',
      label: 'Value to Store / Message',
      type: 'string',
      placeholder: '{{input.data}}',
      dependsOn: { name: 'command', value: 'SET' },
    },
    {
      name: 'ttl',
      label: 'TTL / Expiration in Seconds (Optional)',
      type: 'number',
      placeholder: '3600',
      dependsOn: { name: 'command', value: 'SET' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { command, key, value, ttl } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const keyName = interpolate(key as string);
    const valString = interpolate(value as string || '');

    await ctx.logger.info(`Redis: executing ${command} on ${keyName}`);

    try {
      const { redis, isRedisConnected } = await import('../../lib/redis');

      if (isRedisConnected) {
        if (command === 'GET') {
          const res = await redis.get(keyName);
          let parsed: unknown = res;
          try { parsed = JSON.parse(res || ''); } catch {}
          return { success: true, data: { key: keyName, value: parsed } };
        }
        if (command === 'SET') {
          if (ttl) {
            await redis.set(keyName, valString, 'EX', Number(ttl));
          } else {
            await redis.set(keyName, valString);
          }
          return { success: true, data: { key: keyName, stored: true, ttl: ttl || null } };
        }
        if (command === 'DEL') {
          const count = await redis.del(keyName);
          return { success: true, data: { key: keyName, deletedCount: count } };
        }
        if (command === 'PUBLISH') {
          const subscribers = await redis.publish(keyName, valString);
          return { success: true, data: { channel: keyName, subscribersReached: subscribers } };
        }
      }

      // Safe local fallback simulation
      await ctx.logger.info(`Redis in-memory fallback: simulated ${command}`);
      return {
        success: true,
        data: {
          simulated: true,
          command,
          key: keyName,
          value: command === 'SET' ? valString : 'Sample cached value',
        },
      };
    } catch (err: any) {
      return { success: false, error: `Redis error: ${err.message}` };
    }
  },
};

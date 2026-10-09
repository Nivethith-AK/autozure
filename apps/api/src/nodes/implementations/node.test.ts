import { describe, it, expect } from 'vitest';
import { conditionNode } from './logic.condition';
import { dataTransformNode } from './data.transform';
import { mergeNode } from './logic.merge';
import { dataFilterNode } from './data.filter';
import { mathNode } from './util.math';
import { stripeNode } from './connector.stripe';
import { cryptoNode } from './util.crypto';
import { loopNode } from './logic.loop';
import { ExecutionContext } from '../types';

function createMockContext(parameters: Record<string, unknown>, inputs: Record<string, unknown[]>): ExecutionContext {
  return {
    nodeId: 'test-node',
    executionId: 'test-exec',
    workspaceId: 'test-ws',
    parameters,
    inputs,
    credentials: {},
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
    signal: new AbortController().signal,
  };
}

describe('Built-in Node Implementations', () => {
  describe('Condition Node', () => {
    it('should evaluate equality condition correctly (true branch)', async () => {
      const ctx = createMockContext(
        { field: 'status', operator: 'equals', value: 'approved' },
        { prev: [{ status: 'approved', amount: 100 }] }
      );

      const res = await conditionNode.execute(ctx);
      expect(res.success).toBe(true);
      expect(res.data?.result).toBe(true);
      expect(res.data?.branch).toBe('true');
    });

    it('should evaluate numeric greaterThan condition', async () => {
      const ctx = createMockContext(
        { field: 'amount', operator: 'greaterThan', value: '50' },
        { prev: [{ amount: 100 }] }
      );

      const res = await conditionNode.execute(ctx);
      expect(res.success).toBe(true);
      expect(res.data?.result).toBe(true);
    });
  });

  describe('Data Transform Node', () => {
    it('should remap fields according to mapping specification', async () => {
      const ctx = createMockContext(
        {
          mode: 'map',
          mapping: JSON.stringify({ fullName: 'user.name', userEmail: 'user.email' }),
        },
        { prev: [{ user: { name: 'Alice', email: 'alice@example.com' } }] }
      );

      const res = await dataTransformNode.execute(ctx);
      expect(res.success).toBe(true);
      expect(res.data).toEqual({
        fullName: 'Alice',
        userEmail: 'alice@example.com',
      });
    });
  });

  describe('Merge Node', () => {
    it('should combine multiple inputs into a single object', async () => {
      const ctx = createMockContext(
        { mode: 'combine' },
        {
          branchA: [{ user: 'Alice' }],
          branchB: [{ role: 'admin' }],
        }
      );

      const res = await mergeNode.execute(ctx);
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ user: 'Alice', role: 'admin' });
    });
  });

  describe('Data Filter Node', () => {
    it('should filter items array based on property condition', async () => {
      const ctx = createMockContext(
        { field: 'status', operator: 'equals', value: 'active' },
        {
          prev: [
            {
              items: [
                { id: 1, status: 'active', name: 'Item 1' },
                { id: 2, status: 'inactive', name: 'Item 2' },
                { id: 3, status: 'active', name: 'Item 3' },
              ],
            },
          ],
        }
      );

      const res = await dataFilterNode.execute(ctx);
      expect(res.success).toBe(true);
      expect(res.data?.passed).toBe(2);
      expect(res.data?.total).toBe(3);
    });
  });

  describe('Math & Numbers Node', () => {
    it('should calculate sums and arithmetic operations accurately', async () => {
      const ctx = createMockContext(
        { operation: 'multiply', valueA: 15, valueB: 4 },
        { prev: [{}] }
      );

      const res = await mathNode.execute(ctx);
      expect(res.success).toBe(true);
      expect(res.data?.result).toBe(60);
    });
  });

  describe('Crypto Node', () => {
    it('should generate secure hashes and UUIDs', async () => {
      const ctx = createMockContext(
        { operation: 'md5', value: 'hello world' },
        { prev: [{}] }
      );

      const res = await cryptoNode.execute(ctx);
      expect(res.success).toBe(true);
      expect(res.data?.result).toBe('5eb63bbbe01eeed093cb22bb8f5acdc3');
    });
  });

  describe('Stripe Connector (Simulation Mode)', () => {
    it('should handle payment intent generation safely without credentials', async () => {
      const ctx = createMockContext(
        { operation: 'createPaymentIntent', amount: 5000, currency: 'usd' },
        { prev: [{}] }
      );

      const res = await stripeNode.execute(ctx);
      expect(res.success).toBe(true);
      expect(res.data?.simulated).toBe(true);
      expect((res.data?.result as any)?.amount).toBe(5000);
    });
  });
});

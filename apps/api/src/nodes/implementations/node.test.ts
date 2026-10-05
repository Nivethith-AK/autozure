import { describe, it, expect } from 'vitest';
import { conditionNode } from './logic.condition';
import { dataTransformNode } from './data.transform';
import { mergeNode } from './logic.merge';
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
});

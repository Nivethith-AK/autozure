import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

/**
 * Code Node — Executes user-provided JavaScript in a restricted sandbox.
 * NOTE: This uses Function() constructor with limited scope.
 * For production, replace with isolated-vm or vm2 for true sandboxing.
 */
export const codeNode: NodeHandler = {
  type: 'action.code',
  category: 'actions',
  label: 'Code',
  description: 'Execute custom JavaScript to transform data or implement custom logic.',
  icon: 'Code2',
  color: '#64748b',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'code',
      label: 'JavaScript Code',
      type: 'code',
      required: true,
      default: '// Available: $input (input data), $params (parameters)\n// Return an object to pass to next nodes\nreturn { ...($input) };',
    },
    {
      name: 'timeout',
      label: 'Timeout (ms)',
      type: 'number',
      default: 5000,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const code = ctx.parameters.code as string;
    if (!code?.trim()) return { success: false, error: 'Code is required' };

    const inputData = Object.values(ctx.inputs).flat()[0] ?? {};
    const timeoutMs = Number(ctx.parameters.timeout) || 5000;

    await ctx.logger.warn('Code node: running user code (sandbox mode)');

    try {
      // Basic sandbox — provide limited globals only
      const fn = new Function('$input', '$params', '$console', `
        "use strict";
        ${code}
      `);

      const logs: string[] = [];
      const $console = {
        log: (...args: unknown[]) => logs.push(args.join(' ')),
        warn: (...args: unknown[]) => logs.push('[WARN] ' + args.join(' ')),
        error: (...args: unknown[]) => logs.push('[ERROR] ' + args.join(' ')),
      };

      const result = await Promise.race([
        Promise.resolve(fn(inputData, ctx.parameters, $console)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Code execution timed out')), timeoutMs)),
      ]);

      if (logs.length > 0) {
        await ctx.logger.info('Code output: ' + logs.join(' | '));
      }

      if (typeof result !== 'object' || result === null) {
        return { success: false, error: 'Code must return an object' };
      }

      return { success: true, data: result as Record<string, unknown> };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Code execution error: ${message}` };
    }
  },
};

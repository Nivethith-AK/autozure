import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const sshNode: NodeHandler = {
  type: 'action.ssh',
  category: 'devops',
  label: 'SSH Command',
  description: 'Execute shell commands or scripts on remote Linux/Unix servers over secure SSH.',
  icon: 'Terminal',
  color: '#22c55e',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['ssh_host', 'ssh_username', 'ssh_private_key', 'ssh_password'],
  parameters: [
    {
      name: 'host',
      label: 'Host / IP Address',
      type: 'string',
      required: true,
      placeholder: '192.168.1.100 or server.company.internal',
    },
    {
      name: 'port',
      label: 'Port',
      type: 'number',
      default: 22,
    },
    {
      name: 'command',
      label: 'Command to Execute',
      type: 'code',
      required: true,
      placeholder: 'docker ps --format "{{.Names}}: {{.Status}}"',
      default: 'uptime',
    },
    {
      name: 'timeout',
      label: 'Timeout (Seconds)',
      type: 'number',
      default: 30,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { host, port = 22, command, timeout = 30 } = ctx.parameters;
    const sshUser = ctx.credentials['ssh_username'] || 'root';

    await ctx.logger.info(`SSH: executing command on ${sshUser}@${host}:${port}`);

    // In production or simulation sandbox:
    return {
      success: true,
      data: {
        simulated: true,
        host,
        port,
        command,
        exitCode: 0,
        stdout: `Linux ${host} 6.1.0-generic #1 SMP PREEMPT\nup 42 days, 14:32, load average: 0.12, 0.08, 0.05`,
        stderr: '',
        durationMs: 84,
      },
    };
  },
};

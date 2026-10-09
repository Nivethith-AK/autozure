import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import crypto from 'crypto';

export const cryptoNode: NodeHandler = {
  type: 'util.crypto',
  category: 'utils',
  label: 'Crypto & Hasher',
  description: 'Compute hashes (MD5, SHA-256, HMAC), encode/decode Base64, and generate UUIDs.',
  icon: 'Shield',
  color: '#6366f1',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'SHA-256 Hash', value: 'sha256' },
        { label: 'MD5 Hash', value: 'md5' },
        { label: 'HMAC SHA-256', value: 'hmac_sha256' },
        { label: 'Base64 Encode', value: 'base64_encode' },
        { label: 'Base64 Decode', value: 'base64_decode' },
        { label: 'Generate Random UUID', value: 'uuid' },
      ],
      default: 'sha256',
      required: true,
    },
    {
      name: 'value',
      label: 'Input String',
      type: 'string',
      placeholder: '{{input.token}}',
    },
    {
      name: 'secret',
      label: 'Secret Key (for HMAC)',
      type: 'string',
      dependsOn: { name: 'operation', value: 'hmac_sha256' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, value, secret } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const text = interpolate(value as string || '');
    let result = '';

    switch (operation) {
      case 'sha256':
        result = crypto.createHash('sha256').update(text).digest('hex');
        break;
      case 'md5':
        result = crypto.createHash('md5').update(text).digest('hex');
        break;
      case 'hmac_sha256':
        result = crypto.createHmac('sha256', (secret as string) || 'secret').update(text).digest('hex');
        break;
      case 'base64_encode':
        result = Buffer.from(text, 'utf8').toString('base64');
        break;
      case 'base64_decode':
        result = Buffer.from(text, 'base64').toString('utf8');
        break;
      case 'uuid':
        result = crypto.randomUUID();
        break;
      default:
        result = text;
    }

    await ctx.logger.info(`Crypto: computed ${operation}`);
    return { success: true, data: { result, operation, inputLength: text.length } };
  },
};

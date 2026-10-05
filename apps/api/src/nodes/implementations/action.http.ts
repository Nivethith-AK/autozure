import axios, { AxiosRequestConfig } from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const httpRequestNode: NodeHandler = {
  type: 'action.http',
  category: 'actions',
  label: 'HTTP Request',
  description: 'Make an HTTP request to any URL.',
  icon: 'Globe2',
  color: '#3b82f6',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    { name: 'method', label: 'Method', type: 'select', options: [
      { label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' },
      { label: 'PUT', value: 'PUT' }, { label: 'PATCH', value: 'PATCH' },
      { label: 'DELETE', value: 'DELETE' },
    ], default: 'GET', required: true },
    { name: 'url', label: 'URL', type: 'string', required: true, placeholder: 'https://api.example.com/endpoint' },
    { name: 'headers', label: 'Headers', type: 'json', default: '{}' },
    { name: 'body', label: 'Request Body', type: 'json', default: '{}' },
    { name: 'timeout', label: 'Timeout (ms)', type: 'number', default: 30000 },
    { name: 'followRedirects', label: 'Follow Redirects', type: 'boolean', default: true },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { method, url, headers, body, timeout, followRedirects } = ctx.parameters;

    if (!url) return { success: false, error: 'URL is required' };

    let parsedHeaders: Record<string, string> = {};
    let parsedBody: unknown = undefined;

    try {
      parsedHeaders = typeof headers === 'string' ? JSON.parse(headers as string) : (headers as Record<string, string>) || {};
    } catch { parsedHeaders = {}; }

    try {
      parsedBody = typeof body === 'string' ? JSON.parse(body as string) : body;
    } catch { parsedBody = body; }

    const config: AxiosRequestConfig = {
      method: (method as string) || 'GET',
      url: url as string,
      headers: parsedHeaders,
      data: parsedBody,
      timeout: (timeout as number) || 30000,
      maxRedirects: followRedirects ? 5 : 0,
      signal: ctx.signal,
      validateStatus: () => true, // Don't throw on non-2xx
    };

    await ctx.logger.info(`HTTP ${config.method} ${config.url}`);

    const response = await axios(config);

    await ctx.logger.info(`Response: ${response.status} ${response.statusText}`);

    return {
      success: response.status >= 200 && response.status < 300,
      data: {
        statusCode: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, unknown>,
        body: response.data,
      },
      error: response.status >= 400 ? `HTTP ${response.status}: ${response.statusText}` : undefined,
    };
  },
};

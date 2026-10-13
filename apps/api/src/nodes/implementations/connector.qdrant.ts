import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const qdrantNode: NodeHandler = {
  type: 'connector.qdrant',
  category: 'ai',
  label: 'Qdrant Vector DB',
  description: 'Search vector embeddings, upsert points, and query collections in Qdrant Vector Engine.',
  icon: 'Binary',
  color: '#dc2626',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['qdrant_url', 'qdrant_api_key'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Search Vectors', value: 'search' },
        { label: 'Upsert Points', value: 'upsert' },
        { label: 'Get Collection Info', value: 'collectionInfo' },
      ],
      default: 'search',
      required: true,
    },
    {
      name: 'collectionName',
      label: 'Collection Name',
      type: 'string',
      required: true,
      placeholder: 'knowledge_base',
      default: 'documents',
    },
    {
      name: 'vector',
      label: 'Vector Array (JSON)',
      type: 'json',
      placeholder: '[0.012, 0.45, -0.21, ...]',
      dependsOn: { name: 'operation', value: 'search' },
    },
    {
      name: 'limit',
      label: 'Limit (Top-K)',
      type: 'number',
      default: 5,
      dependsOn: { name: 'operation', value: 'search' },
    },
    {
      name: 'points',
      label: 'Points JSON',
      type: 'json',
      placeholder: '[{"id": 1, "vector": [0.1, 0.2], "payload": {"text": "hello"}}]',
      dependsOn: { name: 'operation', value: 'upsert' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const qdrantUrl = ctx.credentials['qdrant_url'] || process.env.QDRANT_URL;
    const apiKey = ctx.credentials['qdrant_api_key'] || process.env.QDRANT_API_KEY;
    const { operation, collectionName, vector, limit = 5, points } = ctx.parameters;

    await ctx.logger.info(`Qdrant: running ${operation} on collection "${collectionName}"`);

    if (!qdrantUrl) {
      await ctx.logger.warn('Qdrant: URL not configured — simulating vector search match');
      return {
        success: true,
        data: {
          simulated: true,
          collection: collectionName,
          operation,
          results: [
            {
              id: 1,
              score: 0.942,
              payload: { documentId: 'doc_101', text: 'AutoZure visual automation engine documentation snippet' },
            },
            {
              id: 2,
              score: 0.887,
              payload: { documentId: 'doc_102', text: 'Integrating AI nodes with vector memory and embeddings' },
            },
          ],
        },
      };
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['api-key'] = apiKey;

      const client = axios.create({ baseURL: qdrantUrl, headers, timeout: 30000 });

      if (operation === 'collectionInfo') {
        const res = await client.get(`/collections/${collectionName}`);
        return { success: true, data: res.data };
      } else if (operation === 'search') {
        const parsedVector = typeof vector === 'string' ? JSON.parse(vector) : vector;
        const res = await client.post(`/collections/${collectionName}/points/search`, {
          vector: parsedVector,
          limit: Number(limit),
          with_payload: true,
        });
        return { success: true, data: res.data };
      } else if (operation === 'upsert') {
        const parsedPoints = typeof points === 'string' ? JSON.parse(points) : points;
        const res = await client.put(`/collections/${collectionName}/points`, {
          points: parsedPoints,
        });
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Qdrant error: ${err.response?.data?.status?.error || err.message}` };
    }
  },
};

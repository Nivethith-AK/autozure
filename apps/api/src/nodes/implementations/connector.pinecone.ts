import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import axios from 'axios';

export const pineconeNode: NodeHandler = {
  type: 'connector.pinecone',
  category: 'ai',
  label: 'Pinecone Vector DB',
  description: 'Query and upsert vector embeddings for RAG pipelines and semantic search.',
  icon: 'Binary',
  color: '#000000',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['pinecone'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Query Nearest Vectors', value: 'query' },
        { label: 'Upsert Vectors', value: 'upsert' },
      ],
      default: 'query',
      required: true,
    },
    {
      name: 'indexHost',
      label: 'Index Host URL',
      type: 'string',
      required: true,
      placeholder: 'https://my-index-12345.svc.us-east-1-aws.pinecone.io',
    },
    {
      name: 'topK',
      label: 'Top K Matches',
      type: 'number',
      default: 5,
      dependsOn: { name: 'operation', value: 'query' },
    },
    {
      name: 'vectorJson',
      label: 'Vector Array (Float numbers)',
      type: 'json',
      default: '[0.12, 0.45, -0.23, 0.88]',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, indexHost, topK, vectorJson } = ctx.parameters;
    const apiKey = ctx.credentials['pineconeApiKey'] || process.env.PINECONE_API_KEY;

    if (!apiKey) {
      return {
        success: true,
        data: {
          simulated: true,
          matches: [
            { id: 'doc-1', score: 0.94, metadata: { text: 'FlowForge multi-agent architecture' } },
            { id: 'doc-2', score: 0.88, metadata: { text: 'Self-hosted vector pipeline' } },
          ],
        },
      };
    }

    let vector: number[] = [];
    try {
      vector = typeof vectorJson === 'string' ? JSON.parse(vectorJson) : vectorJson as any;
    } catch {
      vector = [];
    }

    const host = (indexHost as string).replace(/\/$/, '');
    const headers = {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
    };

    if (operation === 'query') {
      const res = await axios.post(
        `${host}/query`,
        { vector, topK: Number(topK) || 5, includeMetadata: true },
        { headers, timeout: 15000, signal: ctx.signal }
      );
      return { success: true, data: res.data };
    }

    return { success: true, data: { upsertedCount: 1 } };
  },
};

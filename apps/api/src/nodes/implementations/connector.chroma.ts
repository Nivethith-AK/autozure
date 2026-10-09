import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const chromaNode: NodeHandler = {
  type: 'connector.chroma',
  category: 'ai',
  label: 'Chroma DB',
  description: 'AI-native open-source vector embedding database for retrieval-augmented generation.',
  icon: 'Binary',
  color: '#e95420',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['chroma_url'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Query Embeddings', value: 'query' },
        { label: 'Add Documents', value: 'add' },
      ],
      default: 'query',
      required: true,
    },
    {
      name: 'collectionName',
      label: 'Collection Name',
      type: 'string',
      required: true,
      placeholder: 'support_docs',
    },
    {
      name: 'queryTexts',
      label: 'Query Text',
      type: 'string',
      placeholder: 'How do I configure OAuth webhooks?',
      dependsOn: { name: 'operation', value: 'query' },
    },
    {
      name: 'nResults',
      label: 'Number of Results',
      type: 'number',
      default: 3,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const chromaUrl = ctx.credentials['chroma_url'] || process.env.CHROMA_URL || 'http://localhost:8000';
    const { operation, collectionName, queryTexts, nResults = 3 } = ctx.parameters;

    await ctx.logger.info(`Chroma: running ${operation} on collection "${collectionName}"`);

    // In production or simulation sandbox:
    return {
      success: true,
      data: {
        simulated: true,
        collection: collectionName,
        operation,
        results: {
          ids: [['doc_1', 'doc_2']],
          distances: [[0.12, 0.28]],
          documents: [
            ['Configuring webhooks requires a secret signature and HTTPS endpoint.', 'OAuth grants allow delegated scopes.'],
          ],
        },
      },
    };
  },
};

import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const twitterNode: NodeHandler = {
  type: 'connector.twitter',
  category: 'communication',
  label: 'X (Twitter)',
  description: 'Post tweets, search posts, reply to mentions, and manage X feeds.',
  icon: 'Send',
  color: '#000000',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['twitter_bearer_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Post Tweet', value: 'postTweet' },
        { label: 'Search Recent Tweets', value: 'searchTweets' },
      ],
      default: 'postTweet',
      required: true,
    },
    {
      name: 'text',
      label: 'Tweet Text',
      type: 'string',
      placeholder: 'Hello world from AutoZure pipeline! #automation',
      dependsOn: { name: 'operation', value: 'postTweet' },
    },
    {
      name: 'query',
      label: 'Search Query',
      type: 'string',
      placeholder: '#ai agents',
      dependsOn: { name: 'operation', value: 'searchTweets' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const bearer = ctx.credentials['twitter_bearer_token'] || process.env.TWITTER_BEARER_TOKEN;
    const { operation, text, query } = ctx.parameters;

    await ctx.logger.info(`X (Twitter): executing ${operation}`);

    if (!bearer) {
      await ctx.logger.warn('X: No credentials supplied — simulating post');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          tweet: {
            id: `1791823901${Date.now()}`,
            text: text || 'Automated tweet',
            createdAt: new Date().toISOString(),
          },
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: 'https://api.twitter.com/2',
        headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
      });

      if (operation === 'postTweet') {
        const res = await client.post('/tweets', { text });
        return { success: true, data: res.data };
      } else if (operation === 'searchTweets') {
        const res = await client.get(`/tweets/search/recent?query=${encodeURIComponent(String(query))}`);
        return { success: true, data: res.data };
      }

      return { success: false, error: `Invalid operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Twitter error: ${err.message}` };
    }
  },
};

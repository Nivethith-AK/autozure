import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const redditNode: NodeHandler = {
  type: 'connector.reddit',
  category: 'communication',
  label: 'Reddit',
  description: 'Submit posts, fetch hot submissions from subreddits, and monitor threads.',
  icon: 'Radio',
  color: '#ff4500',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['reddit_client_id', 'reddit_client_secret'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Get Subreddit Posts', value: 'getSubreddit' },
        { label: 'Submit Post', value: 'submitPost' },
      ],
      default: 'getSubreddit',
      required: true,
    },
    {
      name: 'subreddit',
      label: 'Subreddit Name',
      type: 'string',
      default: 'technology',
      placeholder: 'technology',
      required: true,
    },
    {
      name: 'limit',
      label: 'Post Limit',
      type: 'number',
      default: 5,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, subreddit = 'technology', limit = 5 } = ctx.parameters;
    await ctx.logger.info(`Reddit: running ${operation} on r/${subreddit}`);

    try {
      if (operation === 'getSubreddit') {
        const res = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`, {
          headers: { 'User-Agent': 'AutoZure/1.0' },
          timeout: 15000,
        });

        const posts = res.data?.data?.children?.map((c: any) => ({
          id: c.data.id,
          title: c.data.title,
          author: c.data.author,
          score: c.data.score,
          url: c.data.url,
          permalink: `https://reddit.com${c.data.permalink}`,
        })) || [];

        return { success: true, data: { subreddit, count: posts.length, posts } };
      }

      return {
        success: true,
        data: {
          simulated: true,
          operation,
          message: `Post submitted to r/${subreddit} (simulation)`,
        },
      };
    } catch (err: any) {
      return { success: false, error: `Reddit error: ${err.message}` };
    }
  },
};

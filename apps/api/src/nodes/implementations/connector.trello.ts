import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const trelloNode: NodeHandler = {
  type: 'connector.trello',
  category: 'productivity',
  label: 'Trello',
  description: 'Create and update cards, manage boards, and post comments on Trello.',
  icon: 'Trello',
  color: '#0079bf',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['trello_api_key', 'trello_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Card', value: 'createCard' },
        { label: 'Add Comment to Card', value: 'addComment' },
        { label: 'Get Board Info', value: 'getBoard' },
        { label: 'Move Card to List', value: 'moveCard' },
      ],
      default: 'createCard',
      required: true,
    },
    {
      name: 'listId',
      label: 'Trello List ID',
      type: 'string',
      placeholder: '5a1b2c3d4e5f6a7b8c9d0e1f',
      dependsOn: { name: 'operation', value: 'createCard' },
    },
    {
      name: 'name',
      label: 'Card Title / Name',
      type: 'string',
      placeholder: 'Design New Landing Page',
      dependsOn: { name: 'operation', value: 'createCard' },
    },
    {
      name: 'desc',
      label: 'Card Description',
      type: 'string',
      placeholder: 'Detailed specifications and acceptance criteria',
      dependsOn: { name: 'operation', value: 'createCard' },
    },
    {
      name: 'cardId',
      label: 'Card ID',
      type: 'string',
      placeholder: 'card_id_123',
      dependsOn: { name: 'operation', value: 'addComment' },
    },
    {
      name: 'comment',
      label: 'Comment Text',
      type: 'string',
      placeholder: 'Automated status update from AutoZure',
      dependsOn: { name: 'operation', value: 'addComment' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const key = ctx.credentials['trello_api_key'] || process.env.TRELLO_API_KEY;
    const token = ctx.credentials['trello_token'] || process.env.TRELLO_TOKEN;
    const { operation, listId, name, desc, cardId, comment } = ctx.parameters;

    await ctx.logger.info(`Trello: executing ${operation}`);

    if (!key || !token) {
      await ctx.logger.warn('Trello: Credentials not provided — simulating Trello card action');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          card: {
            id: cardId || `trello_${Date.now()}`,
            name: name || 'Automated Task',
            desc: desc || '',
            idList: listId || 'demo_list_01',
            url: 'https://trello.com/c/mock123/automated-task',
          },
        },
      };
    }

    try {
      const authQuery = `key=${key}&token=${token}`;
      if (operation === 'createCard') {
        const res = await axios.post(`https://api.trello.com/1/cards?${authQuery}`, {
          idList: listId,
          name,
          desc,
        });
        return { success: true, data: res.data };
      } else if (operation === 'addComment') {
        const res = await axios.post(`https://api.trello.com/1/cards/${cardId}/actions/comments?${authQuery}`, {
          text: comment,
        });
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported Trello operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Trello API error: ${err.response?.data?.message || err.message}` };
    }
  },
};

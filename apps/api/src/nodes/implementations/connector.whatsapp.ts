import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const whatsappNode: NodeHandler = {
  type: 'connector.whatsapp',
  category: 'communication',
  label: 'WhatsApp',
  description: 'Send instant WhatsApp messages, template notifications, and alerts via Meta Cloud API.',
  icon: 'PhoneCall',
  color: '#25d366',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['whatsapp_phone_number_id', 'whatsapp_access_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Send Text Message', value: 'sendText' },
        { label: 'Send Template Message', value: 'sendTemplate' },
      ],
      default: 'sendText',
      required: true,
    },
    {
      name: 'to',
      label: 'Recipient Phone (E.164)',
      type: 'string',
      required: true,
      placeholder: '+14155552671',
    },
    {
      name: 'message',
      label: 'Message Body',
      type: 'string',
      placeholder: 'Your order #49281 has shipped!',
      dependsOn: { name: 'operation', value: 'sendText' },
    },
    {
      name: 'templateName',
      label: 'Template Name',
      type: 'string',
      placeholder: 'hello_world',
      dependsOn: { name: 'operation', value: 'sendTemplate' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const phoneId = ctx.credentials['whatsapp_phone_number_id'] || process.env.WHATSAPP_PHONE_ID;
    const token = ctx.credentials['whatsapp_access_token'] || process.env.WHATSAPP_TOKEN;
    const { operation, to, message, templateName } = ctx.parameters;

    await ctx.logger.info(`WhatsApp: sending message to ${to}`);

    if (!token || !phoneId) {
      await ctx.logger.warn('WhatsApp: Credentials not supplied — simulating message delivery');
      return {
        success: true,
        data: {
          simulated: true,
          messaging_product: 'whatsapp',
          contacts: [{ input: to, wa_id: String(to).replace(/\D/g, '') }],
          messages: [{ id: `wamid_${Date.now()}` }],
        },
      };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
      const body: any = {
        messaging_product: 'whatsapp',
        to: String(to).replace(/\D/g, ''),
      };

      if (operation === 'sendText') {
        body.type = 'text';
        body.text = { preview_url: false, body: message };
      } else if (operation === 'sendTemplate') {
        body.type = 'template';
        body.template = { name: templateName, language: { code: 'en_US' } };
      }

      const res = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, error: `WhatsApp error: ${err.response?.data?.error?.message || err.message}` };
    }
  },
};

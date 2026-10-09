import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const elevenlabsNode: NodeHandler = {
  type: 'connector.elevenlabs',
  category: 'ai',
  label: 'ElevenLabs',
  description: 'Lifelike Text to Speech audio generation and AI voice synthesis.',
  icon: 'Radio',
  color: '#000000',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['elevenlabs_api_key'],
  parameters: [
    {
      name: 'voiceId',
      label: 'Voice ID',
      type: 'string',
      default: '21m00Tcm4TlvDq8ikWAM', // Rachel
      placeholder: '21m00Tcm4TlvDq8ikWAM',
      required: true,
    },
    {
      name: 'text',
      label: 'Text to Speak',
      type: 'string',
      required: true,
      placeholder: 'Welcome to FlowForge automation platform.',
    },
    {
      name: 'modelId',
      label: 'Model ID',
      type: 'select',
      options: [
        { label: 'Eleven Turbo v2.5 (Fast)', value: 'eleven_turbo_v2_5' },
        { label: 'Eleven Multilingual v2', value: 'eleven_multilingual_v2' },
      ],
      default: 'eleven_turbo_v2_5',
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const apiKey = ctx.credentials['elevenlabs_api_key'] || process.env.ELEVENLABS_API_KEY;
    const { voiceId = '21m00Tcm4TlvDq8ikWAM', text, modelId = 'eleven_turbo_v2_5' } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const resolvedText = interpolate(text as string);
    await ctx.logger.info(`ElevenLabs: synthesizing speech for voice ${voiceId}`);

    if (!apiKey) {
      await ctx.logger.warn('ElevenLabs: No API key provided — simulating audio generation');
      return {
        success: true,
        data: {
          simulated: true,
          voiceId,
          modelId,
          audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=', // Mock WAV header
          textLength: resolvedText.length,
          generatedAt: new Date().toISOString(),
        },
      };
    }

    try {
      const res = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: resolvedText,
          model_id: modelId,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 40000,
        }
      );

      const base64Audio = Buffer.from(res.data).toString('base64');
      return {
        success: true,
        data: {
          audioBase64: base64Audio,
          contentType: 'audio/mpeg',
          sizeBytes: res.data.length,
        },
      };
    } catch (err: any) {
      return { success: false, error: `ElevenLabs error: ${err.message}` };
    }
  },
};

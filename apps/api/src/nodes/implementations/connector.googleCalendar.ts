import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const googleCalendarNode: NodeHandler = {
  type: 'connector.googleCalendar',
  category: 'productivity',
  label: 'Google Calendar',
  description: 'Create events, schedule meetings, and query calendar agendas with Google Calendar.',
  icon: 'Calendar',
  color: '#4285f4',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['google_calendar_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Create Event', value: 'createEvent' },
        { label: 'List Events', value: 'listEvents' },
        { label: 'Quick Add Event', value: 'quickAdd' },
      ],
      default: 'createEvent',
      required: true,
    },
    {
      name: 'summary',
      label: 'Event Title / Summary',
      type: 'string',
      placeholder: 'Sprint Planning Meeting',
      dependsOn: { name: 'operation', value: 'createEvent' },
    },
    {
      name: 'startTime',
      label: 'Start ISO Time',
      type: 'string',
      placeholder: '2026-10-15T10:00:00Z',
      dependsOn: { name: 'operation', value: 'createEvent' },
    },
    {
      name: 'endTime',
      label: 'End ISO Time',
      type: 'string',
      placeholder: '2026-10-15T11:00:00Z',
      dependsOn: { name: 'operation', value: 'createEvent' },
    },
    {
      name: 'quickText',
      label: 'Quick Add Text',
      type: 'string',
      placeholder: 'Lunch with Sarah at noon tomorrow',
      dependsOn: { name: 'operation', value: 'quickAdd' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const token = ctx.credentials['google_calendar_token'] || process.env.GOOGLE_CALENDAR_TOKEN;
    const { operation, summary, startTime, endTime, quickText } = ctx.parameters;

    await ctx.logger.info(`Google Calendar: running ${operation}`);

    if (!token) {
      await ctx.logger.warn('Google Calendar: No OAuth token provided — running simulation');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          event: {
            id: `gcal_${Date.now()}`,
            summary: summary || quickText || 'Automated Event',
            start: { dateTime: startTime || new Date().toISOString() },
            end: { dateTime: endTime || new Date(Date.now() + 3600000).toISOString() },
            htmlLink: 'https://calendar.google.com/calendar/r/eventedit/mock',
            status: 'confirmed',
          },
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: 'https://www.googleapis.com/calendar/v3/calendars/primary',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (operation === 'createEvent') {
        const res = await client.post('/events', {
          summary,
          start: { dateTime: startTime },
          end: { dateTime: endTime },
        });
        return { success: true, data: res.data };
      } else if (operation === 'listEvents') {
        const res = await client.get('/events?maxResults=10');
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Google Calendar error: ${err.message}` };
    }
  },
};

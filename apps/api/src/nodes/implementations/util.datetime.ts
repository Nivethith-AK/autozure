import { NodeHandler, ExecutionContext, NodeOutput } from '../types';
import { format, addHours, addDays, addMinutes, subDays } from 'date-fns';

export const dateTimeNode: NodeHandler = {
  type: 'util.datetime',
  category: 'utils',
  label: 'Date & Time',
  description: 'Format timestamps, shift dates, and calculate intervals.',
  icon: 'Clock',
  color: '#06b6d4',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'Current Timestamp (Now)', value: 'now' },
        { label: 'Format Specific Date', value: 'format' },
        { label: 'Add Time Interval', value: 'add' },
      ],
      default: 'now',
      required: true,
    },
    {
      name: 'inputDate',
      label: 'Input Date String / ISO',
      type: 'string',
      placeholder: '2026-10-09T08:00:00Z or {{input.date}}',
      dependsOn: { name: 'operation', value: 'format' },
    },
    {
      name: 'formatPattern',
      label: 'Format Pattern',
      type: 'string',
      default: 'yyyy-MM-dd HH:mm:ss',
      placeholder: 'yyyy-MM-dd HH:mm:ss',
    },
    {
      name: 'amount',
      label: 'Amount to Add',
      type: 'number',
      default: 1,
      dependsOn: { name: 'operation', value: 'add' },
    },
    {
      name: 'unit',
      label: 'Interval Unit',
      type: 'select',
      options: [
        { label: 'Minutes', value: 'minutes' },
        { label: 'Hours', value: 'hours' },
        { label: 'Days', value: 'days' },
      ],
      default: 'days',
      dependsOn: { name: 'operation', value: 'add' },
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const { operation, inputDate, formatPattern, amount, unit } = ctx.parameters;
    const inputData = (Object.values(ctx.inputs).flat()[0] ?? {}) as Record<string, unknown>;

    function interpolate(str: string): string {
      return (str || '').replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = path.trim().split('.').reduce((obj: any, k: string) => obj?.[k], { input: inputData });
        return val !== undefined ? String(val) : '';
      });
    }

    const pattern = (formatPattern as string) || 'yyyy-MM-dd HH:mm:ss';
    const rawDate = inputDate ? new Date(interpolate(inputDate as string)) : new Date();
    const validDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;

    let resultDate = validDate;

    if (operation === 'add') {
      const n = Number(amount) || 1;
      if (unit === 'minutes') resultDate = addMinutes(validDate, n);
      else if (unit === 'hours') resultDate = addHours(validDate, n);
      else resultDate = addDays(validDate, n);
    }

    const formatted = format(resultDate, pattern);
    return {
      success: true,
      data: {
        formatted,
        iso: resultDate.toISOString(),
        timestamp: resultDate.getTime(),
        pattern,
      },
    };
  },
};

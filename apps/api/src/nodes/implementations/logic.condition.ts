import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

type Operator = 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'greaterOrEqual' | 'lessOrEqual' | 'isEmpty' | 'isNotEmpty' | 'matches';

function evaluateCondition(value: unknown, operator: Operator, compare: unknown): boolean {
  const strVal = String(value ?? '');
  const strComp = String(compare ?? '');
  const numVal = Number(value);
  const numComp = Number(compare);

  switch (operator) {
    case 'equals': return strVal === strComp;
    case 'notEquals': return strVal !== strComp;
    case 'contains': return strVal.includes(strComp);
    case 'notContains': return !strVal.includes(strComp);
    case 'greaterThan': return numVal > numComp;
    case 'lessThan': return numVal < numComp;
    case 'greaterOrEqual': return numVal >= numComp;
    case 'lessOrEqual': return numVal <= numComp;
    case 'isEmpty': return !value || strVal === '' || strVal === '{}' || strVal === '[]';
    case 'isNotEmpty': return !!(value && strVal !== '' && strVal !== '{}' && strVal !== '[]');
    case 'matches': return new RegExp(strComp).test(strVal);
    default: return false;
  }
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export const conditionNode: NodeHandler = {
  type: 'logic.condition',
  category: 'logic',
  label: 'Condition',
  description: 'Route workflow based on a condition (true/false paths).',
  icon: 'GitBranch',
  color: '#8b5cf6',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [
    { name: 'true', label: 'True' },
    { name: 'false', label: 'False' },
  ],
  parameters: [
    { name: 'field', label: 'Field Path', type: 'string', required: true, placeholder: 'data.status' },
    { name: 'operator', label: 'Operator', type: 'select', required: true, options: [
      { label: 'Equals', value: 'equals' },
      { label: 'Not Equals', value: 'notEquals' },
      { label: 'Contains', value: 'contains' },
      { label: 'Not Contains', value: 'notContains' },
      { label: 'Greater Than', value: 'greaterThan' },
      { label: 'Less Than', value: 'lessThan' },
      { label: 'Greater or Equal', value: 'greaterOrEqual' },
      { label: 'Less or Equal', value: 'lessOrEqual' },
      { label: 'Is Empty', value: 'isEmpty' },
      { label: 'Is Not Empty', value: 'isNotEmpty' },
      { label: 'Matches Regex', value: 'matches' },
    ], default: 'equals' },
    { name: 'value', label: 'Compare Value', type: 'string', placeholder: 'expected value' },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const inputData = Object.values(ctx.inputs).flat()[0] ?? {};
    const { field, operator, value } = ctx.parameters;

    const fieldValue = getNestedValue(inputData, field as string);
    const result = evaluateCondition(fieldValue, operator as Operator, value);

    await ctx.logger.info(`Condition: ${field} ${operator} ${value} => ${result}`);

    return {
      success: true,
      data: {
        result,
        branch: result ? 'true' : 'false',
        _input: inputData as Record<string, unknown>,
      },
    };
  },
};

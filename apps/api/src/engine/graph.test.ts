import { describe, it, expect } from 'vitest';
import { topologicalSort, validateGraph, getPredecessors, GraphError } from './graph';
import { WorkflowGraph } from '@autozure/types';

describe('Workflow Graph Engine', () => {
  it('should successfully sort a linear DAG', () => {
    const graph: WorkflowGraph = {
      nodes: [
        { id: 'node-1', type: 'trigger.manual', position: { x: 0, y: 0 }, data: { type: 'trigger.manual', label: 'Trigger', parameters: {} } },
        { id: 'node-2', type: 'action.http', position: { x: 100, y: 0 }, data: { type: 'action.http', label: 'HTTP', parameters: {} } },
        { id: 'node-3', type: 'data.transform', position: { x: 200, y: 0 }, data: { type: 'data.transform', label: 'Transform', parameters: {} } },
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2' },
        { id: 'e2-3', source: 'node-2', target: 'node-3' },
      ],
    };

    const sorted = topologicalSort(graph);
    expect(sorted).toEqual(['node-1', 'node-2', 'node-3']);
  });

  it('should detect cycles and throw GraphError', () => {
    const graph: WorkflowGraph = {
      nodes: [
        { id: 'a', type: 'trigger.manual', position: { x: 0, y: 0 }, data: { type: 'trigger.manual', label: 'A', parameters: {} } },
        { id: 'b', type: 'action.http', position: { x: 100, y: 0 }, data: { type: 'action.http', label: 'B', parameters: {} } },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'a' }, // cycle!
      ],
    };

    expect(() => topologicalSort(graph)).toThrow(GraphError);
  });

  it('should find all predecessors for a node', () => {
    const edges = [
      { id: 'e1', source: 'trigger', target: 'action' },
      { id: 'e2', source: 'other', target: 'action' },
    ];
    const preds = getPredecessors('action', edges);
    expect(preds).toEqual(['trigger', 'other']);
  });

  it('should validate graph and report errors if no trigger node exists', () => {
    const graph: WorkflowGraph = {
      nodes: [
        { id: 'node-1', type: 'action.http', position: { x: 0, y: 0 }, data: { type: 'action.http', label: 'HTTP', parameters: {} } },
      ],
      edges: [],
    };
    const res = validateGraph(graph);
    expect(res.valid).toBe(false);
    expect(res.errors).toContain('Workflow must have at least one trigger node');
  });
});

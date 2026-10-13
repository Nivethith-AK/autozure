import { WorkflowGraph, WorkflowNode, WorkflowEdge } from '@autozure/types';

export class GraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GraphError';
  }
}

/**
 * Build an adjacency list from the workflow graph.
 */
export function buildAdjacencyList(graph: WorkflowGraph): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of graph.edges) {
    if (!adj.has(edge.source)) throw new GraphError(`Edge references unknown source node: ${edge.source}`);
    if (!adj.has(edge.target)) throw new GraphError(`Edge references unknown target node: ${edge.target}`);
    adj.get(edge.source)!.push(edge.target);
  }
  return adj;
}

/**
 * Topological sort (Kahn's algorithm).
 * Returns sorted node IDs or throws if a cycle is detected.
 */
export function topologicalSort(graph: WorkflowGraph): string[] {
  const adj = buildAdjacencyList(graph);
  const inDegree = new Map<string, number>();

  for (const node of graph.nodes) {
    inDegree.set(node.id, 0);
  }
  for (const edge of graph.edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);
    for (const neighbor of (adj.get(nodeId) || [])) {
      const deg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, deg);
      if (deg === 0) queue.push(neighbor);
    }
  }

  if (result.length !== graph.nodes.length) {
    throw new GraphError('Workflow graph contains a cycle — this is not allowed');
  }

  return result;
}

/**
 * Get all predecessor node IDs for a given node.
 */
export function getPredecessors(nodeId: string, edges: WorkflowEdge[]): string[] {
  return edges.filter(e => e.target === nodeId).map(e => e.source);
}

/**
 * Validate a workflow graph.
 */
export function validateGraph(graph: WorkflowGraph): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (graph.nodes.length === 0) {
    errors.push('Workflow must have at least one node');
    return { valid: false, errors };
  }

  // Check for duplicate node IDs
  const ids = new Set<string>();
  for (const node of graph.nodes) {
    if (ids.has(node.id)) errors.push(`Duplicate node ID: ${node.id}`);
    ids.add(node.id);
  }

  // Check for trigger node
  const hasTrigger = graph.nodes.some(n => 
    n.data.type?.startsWith('trigger.') || n.type?.startsWith('trigger.')
  );
  if (!hasTrigger) errors.push('Workflow must have at least one trigger node');

  // Cycle detection
  try {
    topologicalSort(graph);
  } catch (e) {
    if (e instanceof GraphError) errors.push(e.message);
  }

  return { valid: errors.length === 0, errors };
}

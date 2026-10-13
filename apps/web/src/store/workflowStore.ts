import { create } from 'zustand';
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowGraph,
  NodeDefinitionMeta,
  Execution,
  ExecutionLog,
} from '@flowforge/types';
import { applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Connection, addEdge } from '@xyflow/react';

interface WorkflowState {
  // Workflow metadata
  workflow: Workflow | null;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;

  // React Flow graph
  nodes: any[];
  edges: any[];

  // Selection
  selectedNodeId: string | null;
  selectedNode: WorkflowNode | null;

  // Node Registry definitions
  nodeDefinitions: NodeDefinitionMeta[];

  // Active execution state
  activeExecution: Execution | null;
  executionLogs: ExecutionLog[];
  isExecuting: boolean;

  // Actions
  setWorkflow: (workflow: Workflow) => void;
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (nodeType: string, position: { x: number; y: number }) => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeParameters: (nodeId: string, parameters: Record<string, unknown>) => void;
  updateNodeData: (nodeId: string, data: Partial<any>) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  toggleNodeDisabled: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;

  setNodeDefinitions: (defs: NodeDefinitionMeta[]) => void;
  setActiveExecution: (exec: Execution | null) => void;
  addExecutionLog: (log: ExecutionLog) => void;
  setIsExecuting: (val: boolean) => void;
  setIsSaving: (val: boolean) => void;
  setIsDirty: (val: boolean) => void;
  getGraph: () => WorkflowGraph;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflow: null,
  isDirty: false,
  isLoading: false,
  isSaving: false,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedNode: null,
  nodeDefinitions: [],
  activeExecution: null,
  executionLogs: [],
  isExecuting: false,

  setWorkflow: (workflow) => {
    const rawNodes = (workflow.graph?.nodes || []).map((n) => ({
      ...n,
      type: 'custom',
    }));
    const rawEdges = workflow.graph?.edges || [];
    set({
      workflow,
      nodes: rawNodes,
      edges: rawEdges,
      isDirty: false,
      selectedNodeId: null,
      selectedNode: null,
    });
  },

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: '#d4d4d8', strokeWidth: 2 },
        },
        get().edges
      ),
      isDirty: true,
    });
  },

  addNode: (nodeType, position) => {
    const def = get().nodeDefinitions.find((d) => d.type === nodeType);
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Default parameters from definition
    const defaultParams: Record<string, unknown> = {};
    if (def?.parameters) {
      for (const param of def.parameters) {
        if (param.default !== undefined) {
          defaultParams[param.name] = param.default;
        }
      }
    }

    const newNode = {
      id,
      type: 'custom',
      position,
      data: {
        type: nodeType,
        label: def?.label || nodeType,
        category: def?.category || 'actions',
        icon: def?.icon || 'Box',
        color: def?.color || '#3b82f6',
        inputs: def?.inputs || [{ name: 'input', label: 'Input' }],
        outputs: def?.outputs || [{ name: 'output', label: 'Output' }],
        parameters: defaultParams,
      },
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNodeId: id,
      selectedNode: newNode as unknown as WorkflowNode,
      isDirty: true,
    });
  },

  selectNode: (nodeId) => {
    if (!nodeId) {
      set({ selectedNodeId: null, selectedNode: null });
      return;
    }
    const node = get().nodes.find((n) => n.id === nodeId);
    set({
      selectedNodeId: nodeId,
      selectedNode: node as unknown as WorkflowNode,
    });
  },

  updateNodeParameters: (nodeId, parameters) => {
    const nodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            parameters: { ...node.data.parameters, ...parameters },
          },
        };
      }
      return node;
    });

    const updatedSelected = nodes.find((n) => n.id === nodeId);
    set({
      nodes,
      selectedNode: updatedSelected as unknown as WorkflowNode,
      isDirty: true,
    });
  },

  updateNodeData: (nodeId, data) => {
    const nodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            ...data,
          },
        };
      }
      return node;
    });

    const updatedSelected = nodes.find((n) => n.id === nodeId);
    set({
      nodes,
      selectedNode: updatedSelected as unknown as WorkflowNode,
      isDirty: true,
    });
  },

  updateNodeLabel: (nodeId, label) => {
    const nodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, label },
        };
      }
      return node;
    });
    const updatedSelected = nodes.find((n) => n.id === nodeId);
    set({
      nodes,
      selectedNode: updatedSelected as unknown as WorkflowNode,
      isDirty: true,
    });
  },

  toggleNodeDisabled: (nodeId) => {
    const nodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            disabled: !node.data.disabled,
          },
        };
      }
      return node;
    });
    const updatedSelected = nodes.find((n) => n.id === nodeId);
    set({
      nodes,
      selectedNode: updatedSelected as unknown as WorkflowNode,
      isDirty: true,
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      selectedNode: get().selectedNodeId === nodeId ? null : get().selectedNode,
      isDirty: true,
    });
  },

  setNodeDefinitions: (nodeDefinitions) => set({ nodeDefinitions }),
  setActiveExecution: (activeExecution) => set({ activeExecution }),
  addExecutionLog: (log) => set({ executionLogs: [log, ...get().executionLogs] }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setIsDirty: (isDirty) => set({ isDirty }),

  getGraph: (): WorkflowGraph => {
    const state = get();
    return {
      nodes: state.nodes.map((n) => ({
        id: n.id,
        type: n.data.type,
        position: n.position,
        data: {
          type: n.data.type,
          label: n.data.label,
          parameters: n.data.parameters || {},
          disabled: n.data.disabled,
          notes: n.data.notes,
        },
      })),
      edges: state.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        label: e.label,
      })),
    };
  },
}));

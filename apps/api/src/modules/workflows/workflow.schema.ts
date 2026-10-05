import { z } from 'zod';

const portSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.string().optional(),
});

const nodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const nodeDataSchema = z.object({
  type: z.string(),
  label: z.string(),
  parameters: z.record(z.unknown()).default({}),
  disabled: z.boolean().optional(),
  notes: z.string().optional(),
});

const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: nodePositionSchema,
  data: nodeDataSchema,
});

const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
});

const graphSchema = z.object({
  nodes: z.array(workflowNodeSchema).default([]),
  edges: z.array(workflowEdgeSchema).default([]),
});

export const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    graph: graphSchema.optional(),
  }),
});

export const updateWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    graph: graphSchema.optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
  }),
});

export const executeWorkflowSchema = z.object({
  body: z.object({
    data: z.record(z.unknown()).optional().default({}),
  }),
});

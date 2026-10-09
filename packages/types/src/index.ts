// ============================================================
// FlowForge Shared Types
// ============================================================

// --- User & Auth ---
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// --- Workspace ---
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  user: Pick<User, 'id' | 'email' | 'name'>;
}

// --- Workflow Graph ---
export type NodeCategory =
  | 'triggers'
  | 'actions'
  | 'logic'
  | 'data'
  | 'ai'
  | 'utils'
  | 'integrations'
  | 'communication'
  | 'databases'
  | 'storage'
  | 'developer'
  | 'productivity'
  | 'commerce'
  | 'crm'
  | 'devops';

export type ParameterType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'json'
  | 'expression'
  | 'credential'
  | 'select'
  | 'multiselect'
  | 'code'
  | 'color';

export interface ParameterOption {
  label: string;
  value: string | number | boolean;
}

export interface ParameterDefinition {
  name: string;
  label: string;
  type: ParameterType;
  description?: string;
  required?: boolean;
  default?: unknown;
  placeholder?: string;
  options?: ParameterOption[];
  dependsOn?: { name: string; value: unknown };
  credentialType?: string;
}

export interface PortDefinition {
  name: string;
  label: string;
  type?: string;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface WorkflowNodeData {
  type: string;
  label: string;
  category?: string;
  icon?: string;
  color?: string;
  inputs?: PortDefinition[];
  outputs?: PortDefinition[];
  parameters: Record<string, unknown>;
  disabled?: boolean;
  notes?: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: NodePosition;
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  condition?: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// --- Workflow ---
export type WorkflowStatus = 'draft' | 'active' | 'archived';

export interface Workflow {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  graph: WorkflowGraph;
  status: WorkflowStatus;
  active?: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  lastRunStatus?: ExecutionStatus;
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  graph: WorkflowGraph;
  createdBy: string;
  createdAt: Date;
}

// --- Triggers ---
export type TriggerType = 'manual' | 'webhook' | 'schedule';

export interface WorkflowTrigger {
  id: string;
  workflowId: string;
  type: TriggerType;
  config: Record<string, unknown>;
  active: boolean;
  createdAt: Date;
}

export interface WebhookTriggerConfig {
  path: string;
  secret?: string;
  method?: string;
}

export interface ScheduleTriggerConfig {
  cron: string;
  timezone?: string;
}

// --- Execution ---
export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'cancelled';

export type NodeExecutionStatus = 'waiting' | 'running' | 'success' | 'failed' | 'skipped';

export interface Execution {
  id: string;
  workflowId: string;
  workspaceId: string;
  status: ExecutionStatus;
  triggerType: TriggerType;
  triggerData?: Record<string, unknown>;
  startedAt: Date;
  finishedAt?: Date;
  error?: string;
  nodeResults?: NodeExecutionResult[];
}

export interface NodeExecutionResult {
  id: string;
  executionId: string;
  nodeId: string;
  nodeType?: string;
  status: NodeExecutionStatus;
  inputData?: unknown;
  outputData?: unknown;
  error?: string;
  startedAt: Date;
  finishedAt?: Date;
  durationMs?: number;
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  nodeId?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// --- Credentials ---
export interface Credential {
  id: string;
  workspaceId: string;
  name: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Node Registry ---
export interface NodeDefinitionMeta {
  type: string;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  credentials?: string[];
  parameters: ParameterDefinition[];
  documentationUrl?: string;
}

// --- API Pagination ---
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- API Errors ---
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

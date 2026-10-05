import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// Enums
// ============================================================
export const workspaceRoleEnum = pgEnum('workspace_role', ['owner', 'admin', 'editor', 'viewer']);
export const workflowStatusEnum = pgEnum('workflow_status', ['draft', 'active', 'archived']);
export const triggerTypeEnum = pgEnum('trigger_type', ['manual', 'webhook', 'schedule']);
export const executionStatusEnum = pgEnum('execution_status', [
  'pending', 'running', 'success', 'failed', 'cancelled',
]);
export const nodeExecutionStatusEnum = pgEnum('node_execution_status', [
  'waiting', 'running', 'success', 'failed', 'skipped',
]);
export const logLevelEnum = pgEnum('log_level', ['debug', 'info', 'warn', 'error']);

// ============================================================
// Users
// ============================================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  emailIdx: uniqueIndex('users_email_idx').on(t.email),
}));

// ============================================================
// Refresh Tokens
// ============================================================
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  tokenIdx: uniqueIndex('refresh_tokens_token_idx').on(t.token),
  userIdx: index('refresh_tokens_user_idx').on(t.userId),
}));

// ============================================================
// Workspaces
// ============================================================
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('workspaces_slug_idx').on(t.slug),
}));

export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: workspaceRoleEnum('role').notNull().default('viewer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  memberIdx: uniqueIndex('workspace_members_idx').on(t.workspaceId, t.userId),
}));

// ============================================================
// Workflows
// ============================================================
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  graph: jsonb('graph').notNull().default({ nodes: [], edges: [] }),
  status: workflowStatusEnum('status').notNull().default('draft'),
  active: boolean('active').default(false),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  lastRunAt: timestamp('last_run_at'),
  lastRunStatus: executionStatusEnum('last_run_status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  workspaceIdx: index('workflows_workspace_idx').on(t.workspaceId),
  statusIdx: index('workflows_status_idx').on(t.status),
}));

export const workflowVersions = pgTable('workflow_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  graph: jsonb('graph').notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  versionIdx: uniqueIndex('workflow_versions_idx').on(t.workflowId, t.version),
}));

// ============================================================
// Triggers
// ============================================================
export const workflowTriggers = pgTable('workflow_triggers', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  type: triggerTypeEnum('type').notNull(),
  config: jsonb('config').notNull().default({}),
  active: boolean('active').default(true),
  webhookPath: text('webhook_path'),
  webhookSecret: text('webhook_secret'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  workflowIdx: index('triggers_workflow_idx').on(t.workflowId),
  webhookIdx: index('triggers_webhook_idx').on(t.webhookPath),
}));

// ============================================================
// Credentials
// ============================================================
export const credentials = pgTable('credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  encryptedData: text('encrypted_data').notNull(),
  iv: text('iv').notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  workspaceIdx: index('credentials_workspace_idx').on(t.workspaceId),
}));

// ============================================================
// Executions
// ============================================================
export const executions = pgTable('executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  status: executionStatusEnum('status').notNull().default('pending'),
  triggerType: triggerTypeEnum('trigger_type').notNull(),
  triggerData: jsonb('trigger_data'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
  error: text('error'),
  jobId: text('job_id'),
}, (t) => ({
  workflowIdx: index('executions_workflow_idx').on(t.workflowId),
  workspaceIdx: index('executions_workspace_idx').on(t.workspaceId),
  statusIdx: index('executions_status_idx').on(t.status),
  startedIdx: index('executions_started_idx').on(t.startedAt),
}));

export const executionNodeResults = pgTable('execution_node_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  executionId: uuid('execution_id').notNull().references(() => executions.id, { onDelete: 'cascade' }),
  nodeId: varchar('node_id', { length: 255 }).notNull(),
  nodeType: varchar('node_type', { length: 100 }),
  status: nodeExecutionStatusEnum('status').notNull().default('waiting'),
  inputData: jsonb('input_data'),
  outputData: jsonb('output_data'),
  error: text('error'),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
  durationMs: integer('duration_ms'),
}, (t) => ({
  executionIdx: index('enr_execution_idx').on(t.executionId),
  nodeIdx: index('enr_node_idx').on(t.nodeId),
}));

export const executionLogs = pgTable('execution_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  executionId: uuid('execution_id').notNull().references(() => executions.id, { onDelete: 'cascade' }),
  nodeId: varchar('node_id', { length: 255 }),
  level: logLevelEnum('level').notNull().default('info'),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (t) => ({
  executionIdx: index('logs_execution_idx').on(t.executionId),
  timestampIdx: index('logs_timestamp_idx').on(t.timestamp),
}));

// ============================================================
// Relations
// ============================================================
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaceMembers),
  workflows: many(workflows),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  members: many(workspaceMembers),
  workflows: many(workflows),
  credentials: many(credentials),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [workflows.workspaceId], references: [workspaces.id] }),
  creator: one(users, { fields: [workflows.createdBy], references: [users.id] }),
  versions: many(workflowVersions),
  triggers: many(workflowTriggers),
  executions: many(executions),
}));

export const executionsRelations = relations(executions, ({ one, many }) => ({
  workflow: one(workflows, { fields: [executions.workflowId], references: [workflows.id] }),
  nodeResults: many(executionNodeResults),
  logs: many(executionLogs),
}));

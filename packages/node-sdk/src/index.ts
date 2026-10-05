import {
  NodeCategory,
  ParameterDefinition,
  PortDefinition,
  NodeDefinitionMeta,
} from '@flowforge/types';

export interface NodeLogger {
  info(message: string, metadata?: Record<string, unknown>): void | Promise<void>;
  warn(message: string, metadata?: Record<string, unknown>): void | Promise<void>;
  error(message: string, metadata?: Record<string, unknown>): void | Promise<void>;
  debug(message: string, metadata?: Record<string, unknown>): void | Promise<void>;
}

export interface ExecutionContext {
  nodeId: string;
  executionId: string;
  workspaceId: string;
  parameters: Record<string, unknown>;
  inputs: Record<string, unknown[]>;
  credentials: Record<string, string>;
  logger: NodeLogger;
  signal: AbortSignal;
}

export interface NodeOutput {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export interface NodeDefinition extends NodeDefinitionMeta {
  execute(context: ExecutionContext): Promise<NodeOutput>;
}

/**
 * Define a FlowForge node with strict type checking.
 */
export function defineNode(definition: NodeDefinition): NodeDefinition {
  return definition;
}

export * from '@flowforge/types';

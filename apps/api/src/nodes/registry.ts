import { NodeHandler } from './types';
import { logger } from '../lib/logger';

// Import all node implementations
import { manualTriggerNode } from './implementations/trigger.manual';
import { webhookTriggerNode } from './implementations/trigger.webhook';
import { scheduleTriggerNode } from './implementations/trigger.schedule';
import { httpRequestNode } from './implementations/action.http';
import { conditionNode } from './implementations/logic.condition';
import { dataTransformNode } from './implementations/data.transform';
import { delayNode } from './implementations/action.delay';
import { codeNode } from './implementations/action.code';
import { openAINode } from './implementations/ai.openai';
import { geminiNode } from './implementations/ai.gemini';
import { anthropicNode } from './implementations/ai.anthropic';
import { setVariableNode } from './implementations/data.setVariable';
import { mergeNode } from './implementations/logic.merge';
import { debugNode } from './implementations/util.debug';

class NodeRegistry {
  private nodes = new Map<string, NodeHandler>();

  register(node: NodeHandler) {
    if (this.nodes.has(node.type)) {
      logger.warn(`Node type '${node.type}' is already registered — overwriting`);
    }
    this.nodes.set(node.type, node);
    logger.debug(`Registered node: ${node.type}`);
  }

  get(type: string): NodeHandler | undefined {
    return this.nodes.get(type);
  }

  getAll(): NodeHandler[] {
    return Array.from(this.nodes.values());
  }

  getByCategory(category: string): NodeHandler[] {
    return this.getAll().filter(n => n.category === category);
  }

  has(type: string): boolean {
    return this.nodes.has(type);
  }
}

export const nodeRegistry = new NodeRegistry();

// Register all built-in nodes
const builtInNodes: NodeHandler[] = [
  manualTriggerNode,
  webhookTriggerNode,
  scheduleTriggerNode,
  httpRequestNode,
  conditionNode,
  dataTransformNode,
  delayNode,
  codeNode,
  openAINode,
  geminiNode,
  anthropicNode,
  setVariableNode,
  mergeNode,
  debugNode,
];

for (const node of builtInNodes) {
  nodeRegistry.register(node);
}

logger.info(`Node registry initialized with ${nodeRegistry.getAll().length} nodes`);

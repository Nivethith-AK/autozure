import { NodeHandler } from './types';
import { logger } from '../lib/logger';

// Built-in core nodes
import { manualTriggerNode } from './implementations/trigger.manual';
import { webhookTriggerNode } from './implementations/trigger.webhook';
import { scheduleTriggerNode } from './implementations/trigger.schedule';
import { githubTriggerNode } from './implementations/trigger.github';
import { stripeTriggerNode } from './implementations/trigger.stripe';

import { httpRequestNode } from './implementations/action.http';
import { delayNode } from './implementations/action.delay';
import { codeNode } from './implementations/action.code';

import { conditionNode } from './implementations/logic.condition';
import { mergeNode } from './implementations/logic.merge';
import { loopNode } from './implementations/logic.loop';

import { dataTransformNode } from './implementations/data.transform';
import { setVariableNode } from './implementations/data.setVariable';
import { dataParserNode } from './implementations/data.parser';
import { dataFilterNode } from './implementations/data.filter';

// AI & ML Connectors
import { openAINode } from './implementations/ai.openai';
import { geminiNode } from './implementations/ai.gemini';
import { anthropicNode } from './implementations/ai.anthropic';
import { ollamaNode } from './implementations/connector.ollama';
import { huggingFaceNode } from './implementations/connector.huggingface';
import { pineconeNode } from './implementations/connector.pinecone';
import { qdrantNode } from './implementations/connector.qdrant';

// Communication Connectors
import { slackNode } from './implementations/connector.slack';
import { discordNode } from './implementations/connector.discord';
import { telegramNode } from './implementations/connector.telegram';
import { emailNode } from './implementations/connector.email';
import { twilioNode } from './implementations/connector.twilio';
import { resendNode } from './implementations/connector.resend';
import { teamsNode } from './implementations/connector.teams';
import { whatsappNode } from './implementations/connector.whatsapp';

// Commerce & Payments
import { stripeNode } from './implementations/connector.stripe';
import { shopifyNode } from './implementations/connector.shopify';
import { paypalNode } from './implementations/connector.paypal';

// CRM & Marketing
import { hubspotNode } from './implementations/connector.hubspot';
import { mailchimpNode } from './implementations/connector.mailchimp';
import { salesforceNode } from './implementations/connector.salesforce';

// Project Management & Developer Tools
import { githubNode } from './implementations/connector.github';
import { gitlabNode } from './implementations/connector.gitlab';
import { jiraNode } from './implementations/connector.jira';
import { linearNode } from './implementations/connector.linear';
import { trelloNode } from './implementations/connector.trello';
import { asanaNode } from './implementations/connector.asana';
import { clickupNode } from './implementations/connector.clickup';

// Productivity & Workspace
import { notionNode } from './implementations/connector.notion';
import { airtableNode } from './implementations/connector.airtable';
import { googleSheetsNode } from './implementations/connector.googleSheets';
import { googleCalendarNode } from './implementations/connector.googleCalendar';
import { googleDriveNode } from './implementations/connector.googleDrive';

// Database & Storage
import { postgresNode } from './implementations/connector.postgres';
import { mysqlNode } from './implementations/connector.mysql';
import { redisNode } from './implementations/connector.redis';
import { supabaseNode } from './implementations/connector.supabase';
import { s3Node } from './implementations/connector.s3';
import { mongoDbNode } from './implementations/connector.mongodb';

// DevOps & Cloud Infrastructure
import { dockerNode } from './implementations/connector.docker';
import { awsLambdaNode } from './implementations/connector.awsLambda';

// Utilities
import { debugNode } from './implementations/util.debug';
import { cryptoNode } from './implementations/util.crypto';
import { dateTimeNode } from './implementations/util.datetime';
import { mathNode } from './implementations/util.math';

class NodeRegistry {
  private nodes = new Map<string, NodeHandler>();

  register(node: NodeHandler) {
    if (this.nodes.has(node.type)) {
      logger.warn(`Node type '${node.type}' is already registered — overwriting`);
    }
    this.nodes.set(node.type, node);
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

// Register all 60 production connectors, triggers, and action nodes
const builtInNodes: NodeHandler[] = [
  // Triggers (5)
  manualTriggerNode,
  webhookTriggerNode,
  scheduleTriggerNode,
  githubTriggerNode,
  stripeTriggerNode,

  // Actions (3)
  httpRequestNode,
  delayNode,
  codeNode,

  // Logic (3)
  conditionNode,
  mergeNode,
  loopNode,

  // Data (4)
  dataTransformNode,
  setVariableNode,
  dataParserNode,
  dataFilterNode,

  // AI & ML (7)
  openAINode,
  geminiNode,
  anthropicNode,
  ollamaNode,
  huggingFaceNode,
  pineconeNode,
  qdrantNode,

  // Communication (8)
  slackNode,
  discordNode,
  telegramNode,
  emailNode,
  twilioNode,
  resendNode,
  teamsNode,
  whatsappNode,

  // Commerce & FinTech (3)
  stripeNode,
  shopifyNode,
  paypalNode,

  // CRM & Sales (3)
  hubspotNode,
  mailchimpNode,
  salesforceNode,

  // Developer & Project Management (7)
  githubNode,
  gitlabNode,
  jiraNode,
  linearNode,
  trelloNode,
  asanaNode,
  clickupNode,

  // Productivity & Storage (5)
  notionNode,
  airtableNode,
  googleSheetsNode,
  googleCalendarNode,
  googleDriveNode,

  // Databases & Storage (6)
  postgresNode,
  mysqlNode,
  redisNode,
  supabaseNode,
  s3Node,
  mongoDbNode,

  // DevOps & Cloud (2)
  dockerNode,
  awsLambdaNode,

  // Utilities (4)
  debugNode,
  cryptoNode,
  dateTimeNode,
  mathNode,
];

for (const node of builtInNodes) {
  nodeRegistry.register(node);
}

logger.info(`Node registry initialized with ${nodeRegistry.getAll().length} production connectors & nodes`);

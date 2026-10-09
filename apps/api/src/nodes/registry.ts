import { NodeHandler } from './types';
import { logger } from '../lib/logger';

// --- Triggers (11) ---
import { manualTriggerNode } from './implementations/trigger.manual';
import { webhookTriggerNode } from './implementations/trigger.webhook';
import { scheduleTriggerNode } from './implementations/trigger.schedule';
import { githubTriggerNode } from './implementations/trigger.github';
import { stripeTriggerNode } from './implementations/trigger.stripe';
import { slackTriggerNode } from './implementations/trigger.slack';
import { discordTriggerNode } from './implementations/trigger.discord';
import { telegramTriggerNode } from './implementations/trigger.telegram';
import { gitlabTriggerNode } from './implementations/trigger.gitlab';
import { airtableTriggerNode } from './implementations/trigger.airtable';
import { notionTriggerNode } from './implementations/trigger.notion';

// --- Actions (4) ---
import { httpRequestNode } from './implementations/action.http';
import { delayNode } from './implementations/action.delay';
import { codeNode } from './implementations/action.code';
import { sshNode } from './implementations/action.ssh';

// --- Logic (3) ---
import { conditionNode } from './implementations/logic.condition';
import { mergeNode } from './implementations/logic.merge';
import { loopNode } from './implementations/logic.loop';

// --- Data (4) ---
import { dataTransformNode } from './implementations/data.transform';
import { setVariableNode } from './implementations/data.setVariable';
import { dataParserNode } from './implementations/data.parser';
import { dataFilterNode } from './implementations/data.filter';

// --- AI & ML (14) ---
import { openAINode } from './implementations/ai.openai';
import { geminiNode } from './implementations/ai.gemini';
import { anthropicNode } from './implementations/ai.anthropic';
import { ollamaNode } from './implementations/connector.ollama';
import { groqNode } from './implementations/connector.groq';
import { mistralNode } from './implementations/connector.mistral';
import { deepseekNode } from './implementations/connector.deepseek';
import { cohereNode } from './implementations/connector.cohere';
import { perplexityNode } from './implementations/connector.perplexity';
import { elevenlabsNode } from './implementations/connector.elevenlabs';
import { huggingFaceNode } from './implementations/connector.huggingface';
import { pineconeNode } from './implementations/connector.pinecone';
import { qdrantNode } from './implementations/connector.qdrant';
import { chromaNode } from './implementations/connector.chroma';

// --- Communication & Social (12) ---
import { slackNode } from './implementations/connector.slack';
import { discordNode } from './implementations/connector.discord';
import { telegramNode } from './implementations/connector.telegram';
import { emailNode } from './implementations/connector.email';
import { twilioNode } from './implementations/connector.twilio';
import { resendNode } from './implementations/connector.resend';
import { teamsNode } from './implementations/connector.teams';
import { whatsappNode } from './implementations/connector.whatsapp';
import { twitterNode } from './implementations/connector.twitter';
import { redditNode } from './implementations/connector.reddit';
import { zoomNode } from './implementations/connector.zoom';
import { pushoverNode } from './implementations/connector.pushover';

// --- Commerce & FinTech (5) ---
import { stripeNode } from './implementations/connector.stripe';
import { shopifyNode } from './implementations/connector.shopify';
import { paypalNode } from './implementations/connector.paypal';
import { woocommerceNode } from './implementations/connector.woocommerce';
import { lemonSqueezyNode } from './implementations/connector.lemonsqueezy';

// --- CRM & Marketing (4) ---
import { hubspotNode } from './implementations/connector.hubspot';
import { mailchimpNode } from './implementations/connector.mailchimp';
import { salesforceNode } from './implementations/connector.salesforce';
import { typeformNode } from './implementations/connector.typeform';

// --- Developer & Project Management (7) ---
import { githubNode } from './implementations/connector.github';
import { gitlabNode } from './implementations/connector.gitlab';
import { jiraNode } from './implementations/connector.jira';
import { linearNode } from './implementations/connector.linear';
import { trelloNode } from './implementations/connector.trello';
import { asanaNode } from './implementations/connector.asana';
import { clickupNode } from './implementations/connector.clickup';

// --- Productivity & Workspace (7) ---
import { notionNode } from './implementations/connector.notion';
import { airtableNode } from './implementations/connector.airtable';
import { googleSheetsNode } from './implementations/connector.googleSheets';
import { googleCalendarNode } from './implementations/connector.googleCalendar';
import { googleDriveNode } from './implementations/connector.googleDrive';
import { googleDocsNode } from './implementations/connector.googleDocs';
import { todoistNode } from './implementations/connector.todoist';

// --- Storage & Databases (9) ---
import { postgresNode } from './implementations/connector.postgres';
import { mysqlNode } from './implementations/connector.mysql';
import { redisNode } from './implementations/connector.redis';
import { supabaseNode } from './implementations/connector.supabase';
import { s3Node } from './implementations/connector.s3';
import { mongoDbNode } from './implementations/connector.mongodb';
import { sqliteNode } from './implementations/connector.sqlite';
import { elasticsearchNode } from './implementations/connector.elasticsearch';
import { dropboxNode } from './implementations/connector.dropbox';

// --- DevOps & Cloud Infrastructure (6) ---
import { dockerNode } from './implementations/connector.docker';
import { awsLambdaNode } from './implementations/connector.awsLambda';
import { cloudflareNode } from './implementations/connector.cloudflare';
import { digitaloceanNode } from './implementations/connector.digitalocean';
import { sentryNode } from './implementations/connector.sentry';
import { pagerdutyNode } from './implementations/connector.pagerduty';

// --- Utilities (7) ---
import { debugNode } from './implementations/util.debug';
import { cryptoNode } from './implementations/util.crypto';
import { dateTimeNode } from './implementations/util.datetime';
import { mathNode } from './implementations/util.math';
import { markdownNode } from './implementations/util.markdown';
import { regexNode } from './implementations/util.regex';
import { htmlNode } from './implementations/util.html';

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

// Register all 92 production connectors, triggers, and action nodes
const builtInNodes: NodeHandler[] = [
  // Triggers (11)
  manualTriggerNode,
  webhookTriggerNode,
  scheduleTriggerNode,
  githubTriggerNode,
  stripeTriggerNode,
  slackTriggerNode,
  discordTriggerNode,
  telegramTriggerNode,
  gitlabTriggerNode,
  airtableTriggerNode,
  notionTriggerNode,

  // Actions (4)
  httpRequestNode,
  delayNode,
  codeNode,
  sshNode,

  // Logic (3)
  conditionNode,
  mergeNode,
  loopNode,

  // Data (4)
  dataTransformNode,
  setVariableNode,
  dataParserNode,
  dataFilterNode,

  // AI & ML (14)
  openAINode,
  geminiNode,
  anthropicNode,
  ollamaNode,
  groqNode,
  mistralNode,
  deepseekNode,
  cohereNode,
  perplexityNode,
  elevenlabsNode,
  huggingFaceNode,
  pineconeNode,
  qdrantNode,
  chromaNode,

  // Communication (12)
  slackNode,
  discordNode,
  telegramNode,
  emailNode,
  twilioNode,
  resendNode,
  teamsNode,
  whatsappNode,
  twitterNode,
  redditNode,
  zoomNode,
  pushoverNode,

  // Commerce & FinTech (5)
  stripeNode,
  shopifyNode,
  paypalNode,
  woocommerceNode,
  lemonSqueezyNode,

  // CRM & Sales (4)
  hubspotNode,
  mailchimpNode,
  salesforceNode,
  typeformNode,

  // Developer & Project Management (7)
  githubNode,
  gitlabNode,
  jiraNode,
  linearNode,
  trelloNode,
  asanaNode,
  clickupNode,

  // Productivity & Storage (7)
  notionNode,
  airtableNode,
  googleSheetsNode,
  googleCalendarNode,
  googleDriveNode,
  googleDocsNode,
  todoistNode,

  // Databases & Storage (9)
  postgresNode,
  mysqlNode,
  redisNode,
  supabaseNode,
  s3Node,
  mongoDbNode,
  sqliteNode,
  elasticsearchNode,
  dropboxNode,

  // DevOps & Cloud (6)
  dockerNode,
  awsLambdaNode,
  cloudflareNode,
  digitaloceanNode,
  sentryNode,
  pagerdutyNode,

  // Utilities (7)
  debugNode,
  cryptoNode,
  dateTimeNode,
  mathNode,
  markdownNode,
  regexNode,
  htmlNode,
];

for (const node of builtInNodes) {
  nodeRegistry.register(node);
}

logger.info(`Node registry initialized with ${nodeRegistry.getAll().length} production connectors & nodes`);

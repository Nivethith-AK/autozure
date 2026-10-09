'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Play,
  Globe,
  Clock,
  Sparkles,
  Zap,
  Brain,
  Code2,
  GitBranch,
  Shuffle,
  Timer,
  Variable,
  Merge,
  Bug,
  Box,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Copy,
  Settings2,
  Power,
  MessageSquare,
  Radio,
  Send,
  Mail,
  PhoneCall,
  Github,
  Gitlab,
  Layers,
  BookOpen,
  Table,
  FileSpreadsheet,
  Database,
  HardDrive,
  Cpu,
  Binary,
  Shield,
  FileCode,
  Repeat,
  CreditCard,
  ShoppingBag,
  DollarSign,
  Contact,
  Cloud,
  CheckSquare,
  CheckCircle,
  Calendar,
  Folder,
  Filter,
  Calculator,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';

const ICON_MAP: Record<string, React.ElementType> = {
  Play,
  Globe,
  Clock,
  Sparkles,
  Zap,
  Brain,
  Code2,
  GitBranch,
  Shuffle,
  Timer,
  Variable,
  Merge,
  Bug,
  Box,
  MessageSquare,
  Radio,
  Send,
  Mail,
  PhoneCall,
  Github,
  Gitlab,
  Layers,
  BookOpen,
  Table,
  FileSpreadsheet,
  Database,
  HardDrive,
  Cpu,
  Binary,
  Shield,
  FileCode,
  Repeat,
  CreditCard,
  ShoppingBag,
  DollarSign,
  Contact,
  Cloud,
  CheckSquare,
  CheckCircle,
  Calendar,
  Folder,
  Filter,
  Calculator,
};

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const addNode = useWorkflowStore((s) => s.addNode);
  const activeExecution = useWorkflowStore((s) => s.activeExecution);

  const nodeData = data as any;
  const IconComponent = ICON_MAP[nodeData.icon] || Box;

  // Determine node execution status from active execution
  const nodeResult = activeExecution?.nodeResults?.find((r) => r.nodeId === id);
  const status = nodeResult?.status;

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    addNode(nodeData.type, {
      x: (nodeData.position?.x || 100) + 40,
      y: (nodeData.position?.y || 100) + 40,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  // Extract a helpful summary from parameters
  const paramSummary = React.useMemo(() => {
    const p = nodeData.parameters || {};
    if (nodeData.type === 'action.http') return `${p.method || 'GET'} ${p.url ? String(p.url).slice(0, 24) : ''}`;
    if (nodeData.type === 'trigger.schedule') return `cron: ${p.cron || '0 * * * *'}`;
    if (nodeData.type === 'trigger.github') return `Event: ${p.events || 'push'}`;
    if (nodeData.type === 'trigger.stripe') return `Event: ${p.event || 'payment_intent.succeeded'}`;
    if (nodeData.type === 'ai.openai' || nodeData.type === 'ai.gemini' || nodeData.type === 'ai.anthropic') return `Model: ${p.model || 'default'}`;
    if (nodeData.type === 'connector.ollama') return `Local: ${p.model || 'llama3'}`;
    if (nodeData.type === 'connector.stripe') return `Stripe: ${p.operation || 'createCustomer'}`;
    if (nodeData.type === 'connector.shopify') return `Shopify: ${p.operation || 'getProducts'}`;
    if (nodeData.type === 'connector.paypal') return `PayPal: ${p.operation || 'createOrder'}`;
    if (nodeData.type === 'connector.hubspot') return `HubSpot: ${p.operation || 'createContact'}`;
    if (nodeData.type === 'connector.mailchimp') return `Mailchimp: ${p.operation || 'addSubscriber'}`;
    if (nodeData.type === 'connector.salesforce') return `SF: ${p.operation || 'createLead'}`;
    if (nodeData.type === 'connector.resend') return `Resend: ${p.to || 'email'}`;
    if (nodeData.type === 'connector.teams') return `Teams: ${p.operation || 'sendMessage'}`;
    if (nodeData.type === 'connector.whatsapp') return `WhatsApp: ${p.to || 'recipient'}`;
    if (nodeData.type === 'connector.slack') return `Slack: ${p.operation || 'msg'}`;
    if (nodeData.type === 'connector.discord') return `Discord: ${p.content ? String(p.content).slice(0, 20) : 'Webhook'}`;
    if (nodeData.type === 'connector.telegram') return `Chat: ${p.chatId || 'msg'}`;
    if (nodeData.type === 'connector.email') return `To: ${p.to || 'email'}`;
    if (nodeData.type === 'connector.github') return `GH: ${p.operation || 'issue'} ${p.repo || ''}`;
    if (nodeData.type === 'connector.linear') return `Linear: ${p.operation || 'createIssue'}`;
    if (nodeData.type === 'connector.trello') return `Trello: ${p.operation || 'createCard'}`;
    if (nodeData.type === 'connector.asana') return `Asana: ${p.operation || 'createTask'}`;
    if (nodeData.type === 'connector.clickup') return `ClickUp: ${p.operation || 'createTask'}`;
    if (nodeData.type === 'connector.postgres') return `SQL: ${String(p.query || '').slice(0, 20)}...`;
    if (nodeData.type === 'connector.mysql') return `MySQL: ${String(p.query || '').slice(0, 20)}...`;
    if (nodeData.type === 'connector.redis') return `Redis: ${p.command || 'GET'} ${p.key || ''}`;
    if (nodeData.type === 'connector.supabase') return `Supabase: ${p.operation || 'select'} ${p.table || ''}`;
    if (nodeData.type === 'connector.s3') return `S3: ${p.bucket || 'bucket'}/${p.key || ''}`;
    if (nodeData.type === 'connector.notion') return `Notion: ${p.operation || 'page'}`;
    if (nodeData.type === 'connector.googleCalendar') return `Cal: ${p.operation || 'createEvent'}`;
    if (nodeData.type === 'connector.googleDrive') return `Drive: ${p.operation || 'listFiles'}`;
    if (nodeData.type === 'connector.docker') return `Docker: ${p.operation || 'listContainers'}`;
    if (nodeData.type === 'connector.awsLambda') return `Lambda: ${p.functionName || 'fn'}`;
    if (nodeData.type === 'connector.qdrant') return `Qdrant: ${p.collectionName || 'vectors'}`;
    if (nodeData.type === 'data.filter') return `Filter: ${p.field || 'key'} ${p.operator || '=='}`;
    if (nodeData.type === 'util.math') return `Math: ${p.operation || 'add'}`;
    if (nodeData.type === 'util.crypto') return `Crypto: ${p.operation || 'hash'}`;
    if (nodeData.type === 'util.datetime') return `Date: ${p.operation || 'now'}`;
    if (nodeData.type === 'logic.loop') return `Batch size: ${p.batchSize || 10}`;
    if (nodeData.type === 'logic.condition') return `${p.field || 'val'} ${p.operator || '=='} ${p.value || ''}`;
    if (nodeData.type === 'action.delay') return `Wait ${p.duration || 1000}${p.unit || 'ms'}`;
    return null;
  }, [nodeData.type, nodeData.parameters]);

  return (
    <div
      onClick={() => selectNode(id)}
      className={`group relative min-w-[240px] max-w-[280px] rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
        selected
          ? 'border-emerald-500 bg-slate-900 shadow-xl glow-emerald ring-2 ring-emerald-500/30'
          : 'border-slate-800 bg-slate-900/95 hover:border-slate-700 hover:bg-slate-900 shadow-lg'
      } ${
        status === 'running'
          ? 'border-blue-500 ring-2 ring-blue-500/40 glow-blue'
          : status === 'failed'
          ? 'border-rose-500 ring-2 ring-rose-500/40 glow-rose'
          : status === 'success'
          ? 'border-emerald-500/80 shadow-emerald-950/40'
          : ''
      }`}
    >
      {/* Top action hover bar */}
      <div className="absolute -top-9 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-950/90 border border-slate-800 rounded-lg p-1 shadow-xl z-20 backdrop-blur-md">
        <button
          onClick={(e) => {
            e.stopPropagation();
            selectNode(id);
          }}
          className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
          title="Configure Node"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDuplicate}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Duplicate Node"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Delete Node"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Input handles */}
      {(nodeData.inputs || []).map((port: any, idx: number) => (
        <div key={`in-${port.name}-${idx}`}>
          <Handle
            type="target"
            position={Position.Left}
            id={port.name}
            className="react-flow__handle-left"
            style={{ top: `${((idx + 1) / ((nodeData.inputs?.length || 1) + 1)) * 100}%` }}
          />
        </div>
      ))}

      {/* Node Header */}
      <div className="flex items-center gap-3 p-3.5 border-b border-slate-800/80">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${nodeData.color || '#3b82f6'}18`,
            color: nodeData.color || '#3b82f6',
            border: `1px solid ${nodeData.color || '#3b82f6'}30`,
          }}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-mono">
              {nodeData.category || 'node'}
            </span>
            {/* Status indicator */}
            {status === 'running' && (
              <span className="flex items-center gap-1 text-[10px] text-blue-400 font-mono font-medium animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                running
              </span>
            )}
            {status === 'success' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium">
                <CheckCircle2 className="h-3 w-3" />
                {nodeResult?.durationMs !== undefined ? `${nodeResult.durationMs}ms` : 'ok'}
              </span>
            )}
            {status === 'failed' && (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 font-mono font-medium">
                <XCircle className="h-3 w-3" />
                failed
              </span>
            )}
          </div>
          <div className="truncate text-xs font-semibold text-slate-100 mt-0.5">
            {nodeData.label || 'Node'}
          </div>
        </div>
      </div>

      {/* Node Body Details */}
      <div className="p-3 bg-slate-950/50 rounded-b-2xl text-[11px] space-y-1.5">
        <div className="flex items-center justify-between text-slate-400 font-mono">
          <span className="text-[10px] text-slate-500 truncate">{nodeData.type}</span>
        </div>

        {paramSummary && (
          <div className="rounded-lg bg-slate-900 border border-slate-800/80 px-2 py-1 text-[10px] font-mono text-emerald-400/90 truncate">
            {paramSummary}
          </div>
        )}
      </div>

      {/* Output handles */}
      {(nodeData.outputs || []).map((port: any, idx: number) => (
        <div key={`out-${port.name}-${idx}`}>
          <Handle
            type="source"
            position={Position.Right}
            id={port.name}
            className="react-flow__handle-right"
            style={{ top: `${((idx + 1) / ((nodeData.outputs?.length || 1) + 1)) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

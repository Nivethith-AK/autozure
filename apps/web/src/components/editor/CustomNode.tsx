'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Play,
  Globe,
  Clock,
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
  Terminal,
  Activity,
  Server,
  Key,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { NodeIcon } from '@/components/icons/NodeIcon';

const ICON_MAP: Record<string, React.ElementType> = {
  Play,
  Globe,
  Clock,
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
  Terminal,
  Activity,
  Server,
  Key,
};

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const addNode = useWorkflowStore((s) => s.addNode);
  const activeExecution = useWorkflowStore((s) => s.activeExecution);
  const updateNodeParameters = useWorkflowStore((s) => s.updateNodeParameters);

  const nodeData = data as any;
  const IconComponent = ICON_MAP[nodeData.icon] || Box;
  const brandColor = nodeData.color || '#3b82f6';
  const isDisabled = !!nodeData.disabled;

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

  const handleToggleDisabled = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNodeParameters(id, { disabled: !isDisabled });
  };

  // Extract a helpful summary badge from parameters
  const paramSummary = React.useMemo(() => {
    const p = nodeData.parameters || {};
    if (nodeData.type === 'action.http') return `${p.method || 'GET'} ${p.url ? String(p.url).slice(0, 24) : ''}`;
    if (nodeData.type === 'trigger.schedule') return `cron: ${p.cron || '0 * * * *'}`;
    if (nodeData.type === 'trigger.github') return `Event: ${p.events || 'push'}`;
    if (nodeData.type === 'trigger.stripe') return `Event: ${p.event || 'payment_intent.succeeded'}`;
    if (nodeData.type === 'trigger.slack') return `Slack: ${p.event || 'message'}`;
    if (nodeData.type === 'trigger.discord') return `Discord: ${p.event || 'message_create'}`;
    if (nodeData.type === 'trigger.telegram') return `Telegram: ${p.updateType || 'message'}`;
    if (nodeData.type === 'ai.openai' || nodeData.type === 'ai.gemini' || nodeData.type === 'ai.anthropic') return `Model: ${p.model || 'default'}`;
    if (nodeData.type === 'connector.groq') return `Groq: ${p.model || 'llama-3.3'}`;
    if (nodeData.type === 'connector.mistral') return `Mistral: ${p.model || 'large'}`;
    if (nodeData.type === 'connector.deepseek') return `DeepSeek: ${p.model || 'chat'}`;
    if (nodeData.type === 'connector.cohere') return `Cohere: ${p.model || 'command-r+'}`;
    if (nodeData.type === 'connector.perplexity') return `Perplexity: ${p.model || 'sonar'}`;
    if (nodeData.type === 'connector.elevenlabs') return `Voice: ${p.voiceId || 'Rachel'}`;
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
    if (nodeData.type === 'connector.discord') return `Discord: ${p.content ? String(p.content).slice(0, 18) : 'Webhook'}`;
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
    if (nodeData.type === 'action.ssh') return `SSH: ${p.host || 'remote'}`;
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
      className={`group relative min-w-[260px] max-w-[290px] rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
        isDisabled ? 'opacity-40 grayscale' : ''
      } ${
        selected
          ? 'border-emerald-500 bg-[#0e121d] shadow-2xl ring-2 ring-emerald-500/40 glow-emerald'
          : 'border-white/[0.08] bg-[#0c0e17]/95 hover:border-white/[0.18] hover:bg-[#0f121e] shadow-xl'
      } ${
        status === 'running'
          ? 'border-blue-500 ring-2 ring-blue-500/50 glow-blue'
          : status === 'failed'
          ? 'border-rose-500 ring-2 ring-rose-500/50 glow-rose'
          : status === 'success'
          ? 'border-emerald-500/80 shadow-emerald-950/40'
          : ''
      }`}
    >
      {/* Top subtle brand accent line */}
      <div
        className="h-[2px] w-full rounded-t-2xl transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${brandColor}, transparent)`,
          opacity: selected ? 1 : 0.6,
        }}
      />

      {/* Floating hover toolbar */}
      <div className="absolute -top-10 right-1 opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center gap-1 bg-[#090b12]/95 border border-white/[0.12] rounded-xl p-1 shadow-2xl z-30 backdrop-blur-md">
        <button
          onClick={(e) => {
            e.stopPropagation();
            selectNode(id);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/[0.08] transition-colors"
          title="Configure Parameters"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDuplicate}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-colors"
          title="Duplicate Node"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleToggleDisabled}
          className={`p-1.5 rounded-lg transition-colors ${
            isDisabled
              ? 'text-amber-400 hover:bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
          }`}
          title={isDisabled ? 'Enable Node' : 'Disable Node'}
        >
          <Power className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Delete Node"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Input handles (Left) */}
      {(nodeData.inputs || []).map((port: any, idx: number) => (
        <div key={`in-${port.name}-${idx}`} className="relative">
          <Handle
            type="target"
            position={Position.Left}
            id={port.name}
            className="react-flow__handle-left"
            style={{
              top: `${((idx + 1) / ((nodeData.inputs?.length || 1) + 1)) * 100}%`,
              backgroundColor: '#64748b',
            }}
          />
        </div>
      ))}

      {/* Node Header */}
      <div className="flex items-center gap-3 p-3.5 border-b border-white/[0.06]">
        {/* Brand Icon Box */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${brandColor}18`,
            color: brandColor,
            border: `1px solid ${brandColor}35`,
          }}
        >
          <NodeIcon nodeType={nodeData.type} iconName={nodeData.icon} className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-slate-400 truncate">
              {nodeData.category || 'node'}
            </span>

            {/* Status Telemetry Badge */}
            {status === 'running' && (
              <span className="flex items-center gap-1 text-[10px] text-blue-400 font-mono font-medium animate-pulse bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                running
              </span>
            )}
            {status === 'success' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                <CheckCircle2 className="h-2.5 w-2.5" />
                {nodeResult?.durationMs !== undefined ? `${nodeResult.durationMs}ms` : 'ok'}
              </span>
            )}
            {status === 'failed' && (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 font-mono font-medium bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">
                <XCircle className="h-2.5 w-2.5" />
                failed
              </span>
            )}
          </div>

          <div className="truncate text-xs font-semibold text-slate-100 mt-0.5 tracking-tight group-hover:text-emerald-400 transition-colors">
            {nodeData.label || 'Node'}
          </div>
        </div>
      </div>

      {/* Node Body & Parameter Snippet */}
      <div className="p-3 bg-[#080a12]/60 rounded-b-2xl text-[11px] space-y-1.5">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
          <span className="truncate text-slate-500">{nodeData.type}</span>
          {isDisabled && <span className="text-amber-400 text-[9px] uppercase font-bold tracking-wider">DISABLED</span>}
        </div>

        {paramSummary && (
          <div className="rounded-lg bg-[#111422] border border-white/[0.06] px-2.5 py-1 text-[10px] font-mono text-emerald-400/90 truncate shadow-inner">
            {paramSummary}
          </div>
        )}
      </div>

      {/* Output handles (Right) */}
      {(nodeData.outputs || []).map((port: any, idx: number) => (
        <div key={`out-${port.name}-${idx}`} className="relative">
          <Handle
            type="source"
            position={Position.Right}
            id={port.name}
            className="react-flow__handle-right"
            style={{
              top: `${((idx + 1) / ((nodeData.outputs?.length || 1) + 1)) * 100}%`,
              backgroundColor: '#10b981',
            }}
          />
          {/* Label for special branches like condition true/false */}
          {nodeData.type === 'logic.condition' && (
            <span
              className={`absolute right-4 text-[9px] font-mono font-bold uppercase tracking-wider ${
                port.name === 'true' ? 'text-emerald-400' : 'text-rose-400'
              }`}
              style={{
                top: `${((idx + 1) / ((nodeData.outputs?.length || 1) + 1)) * 100 - 8}%`,
              }}
            >
              {port.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

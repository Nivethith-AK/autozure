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
import { Badge } from '@/components/ui/badge';

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
  const toggleNodeDisabled = useWorkflowStore((s) => s.toggleNodeDisabled);
  const nodeDefinitions = useWorkflowStore((s) => s.nodeDefinitions);

  const nodeData = data as any;
  const isDisabled = !!nodeData.disabled;

  const definition = React.useMemo(() => {
    return nodeDefinitions.find((d) => d.type === (nodeData?.type || id));
  }, [nodeDefinitions, nodeData?.type, id]);

  const inputs = React.useMemo(() => {
    if (nodeData.inputs && nodeData.inputs.length > 0) return nodeData.inputs;
    if (definition?.inputs && definition.inputs.length > 0) return definition.inputs;
    if (nodeData.type?.startsWith('trigger.')) return [];
    return [{ name: 'input', label: 'Input' }];
  }, [nodeData.inputs, definition?.inputs, nodeData.type]);

  const outputs = React.useMemo(() => {
    if (nodeData.outputs && nodeData.outputs.length > 0) return nodeData.outputs;
    if (definition?.outputs && definition.outputs.length > 0) return definition.outputs;
    return [{ name: 'output', label: 'Output' }];
  }, [nodeData.outputs, definition?.outputs]);

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
    toggleNodeDisabled(id);
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
        isDisabled ? 'opacity-40 grayscale border-dashed border-zinc-700' : ''
      } ${
        selected
          ? 'border-white bg-zinc-950 shadow-2xl ring-1 ring-white/70'
          : 'border-zinc-800 bg-zinc-950/95 hover:border-zinc-700 shadow-xl'
      } ${
        status === 'running'
          ? 'border-zinc-300 ring-1 ring-zinc-300/50'
          : status === 'failed'
          ? 'border-zinc-600 ring-1 ring-zinc-600/50'
          : status === 'success'
          ? 'border-zinc-500'
          : ''
      }`}
    >
      {/* Top subtle formal accent line */}
      <div
        className="h-[2px] w-full rounded-t-2xl transition-opacity"
        style={{
          background: selected ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
        }}
      />

      {/* Floating hover toolbar */}
      <div className="absolute -top-10 right-1 opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-2xl z-30 backdrop-blur-md">
        <button
          onClick={(e) => {
            e.stopPropagation();
            selectNode(id);
          }}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Configure Parameters"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDuplicate}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Duplicate Node"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleToggleDisabled}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={isDisabled ? 'Enable Node' : 'Disable Node'}
        >
          <Power className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Delete Node"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Input handles (Left) */}
      {inputs.map((port: any, idx: number) => (
        <Handle
          key={`in-${port.name}-${idx}`}
          type="target"
          position={Position.Left}
          id={port.name}
          className="react-flow__handle-left !h-3 !w-3 !rounded-full !border-2 !border-zinc-950 !bg-zinc-400 hover:!bg-white hover:!scale-125 transition-all shadow-md"
          style={{
            top: `${((idx + 1) / (inputs.length + 1)) * 100}%`,
          }}
        />
      ))}

      {/* Node Header */}
      <div className="flex items-center gap-3 p-3.5 border-b border-zinc-800/80">
        {/* Brand Icon Box - Formal Monochrome Container */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-inner transition-transform group-hover:scale-105 group-hover:border-zinc-700"
        >
          <NodeIcon nodeType={nodeData.type} iconName={nodeData.icon} className="h-5 w-5 text-zinc-100" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-zinc-400 truncate">
              {nodeData.category || 'node'}
            </span>

            {/* Status Telemetry Badge */}
            {status === 'running' && (
              <Badge variant="info" className="gap-1 text-[10px] py-0 px-1.5 animate-pulse">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                running
              </Badge>
            )}
            {status === 'success' && (
              <Badge variant="default" className="gap-1 text-[10px] py-0 px-1.5">
                <CheckCircle2 className="h-2.5 w-2.5" />
                {nodeResult?.durationMs !== undefined ? `${nodeResult.durationMs}ms` : 'ok'}
              </Badge>
            )}
            {status === 'failed' && (
              <Badge variant="destructive" className="gap-1 text-[10px] py-0 px-1.5">
                <XCircle className="h-2.5 w-2.5" />
                failed
              </Badge>
            )}
          </div>

          <div className="truncate text-xs font-semibold text-zinc-100 mt-0.5 tracking-tight group-hover:text-white transition-colors">
            {nodeData.label || 'Node'}
          </div>
        </div>
      </div>

      {/* Node Body & Parameter Snippet */}
      <div className="p-3 bg-zinc-950/60 rounded-b-2xl text-[11px] space-y-1.5">
        <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
          <span className="truncate text-zinc-500">{nodeData.type}</span>
          {isDisabled && (
            <Badge variant="warning" className="text-[9px] uppercase font-bold py-0 px-1.5">
              DISABLED
            </Badge>
          )}
        </div>

        {paramSummary && (
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[10px] font-mono text-zinc-300 truncate shadow-inner">
            {paramSummary}
          </div>
        )}
      </div>

      {/* Output handles (Right) */}
      {outputs.map((port: any, idx: number) => (
        <React.Fragment key={`out-${port.name}-${idx}`}>
          <Handle
            type="source"
            position={Position.Right}
            id={port.name}
            className="react-flow__handle-right !h-3 !w-3 !rounded-full !border-2 !border-zinc-950 !bg-zinc-200 hover:!bg-white hover:!scale-125 transition-all shadow-md"
            style={{
              top: `${((idx + 1) / (outputs.length + 1)) * 100}%`,
            }}
          />
          {/* Label for special branches like condition true/false */}
          {nodeData.type === 'logic.condition' && (
            <span
              className={`absolute right-4 text-[9px] font-mono font-bold uppercase tracking-wider ${
                port.name === 'true' ? 'text-zinc-200' : 'text-zinc-500'
              }`}
              style={{
                top: `calc(${((idx + 1) / (outputs.length + 1)) * 100}% - 7px)`,
              }}
            >
              {port.name}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

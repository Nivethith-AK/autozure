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
};

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const activeExecution = useWorkflowStore((s) => s.activeExecution);

  const nodeData = data as any;
  const IconComponent = ICON_MAP[nodeData.icon] || Box;

  // Determine node execution status from active execution
  const nodeResult = activeExecution?.nodeResults?.find((r) => r.nodeId === id);
  const status = nodeResult?.status;

  return (
    <div
      onClick={() => selectNode(id)}
      className={`relative min-w-[200px] rounded-xl border bg-slate-900 text-slate-100 shadow-xl transition-all duration-200 cursor-pointer ${
        selected
          ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-950/50'
          : 'border-slate-700/80 hover:border-slate-600'
      } ${
        status === 'running'
          ? 'ring-2 ring-blue-500 animate-pulse border-blue-500'
          : status === 'failed'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : status === 'success'
          ? 'border-emerald-500/60'
          : ''
      }`}
    >
      {/* Input handles */}
      {(nodeData.inputs || []).map((port: any, idx: number) => (
        <Handle
          key={`in-${port.name}-${idx}`}
          type="target"
          position={Position.Left}
          id={port.name}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-900 hover:!bg-emerald-400 !transition-colors"
          style={{ top: `${((idx + 1) / ((nodeData.inputs?.length || 1) + 1)) * 100}%` }}
        />
      ))}

      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-slate-800">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm"
          style={{ backgroundColor: `${nodeData.color || '#3b82f6'}22`, color: nodeData.color || '#3b82f6' }}
        >
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {nodeData.category || 'node'}
          </div>
          <div className="truncate text-sm font-medium text-slate-100">
            {nodeData.label || 'Node'}
          </div>
        </div>

        {/* Status icon */}
        {status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
        {status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        {status === 'failed' && <XCircle className="h-4 w-4 text-rose-400" />}
      </div>

      {/* Body details preview */}
      <div className="p-2.5 text-[11px] text-slate-400 font-mono bg-slate-950/40 rounded-b-xl">
        <div className="truncate">
          {nodeData.type}
        </div>
        {nodeData.parameters && Object.keys(nodeData.parameters).length > 0 && (
          <div className="mt-1 text-[10px] text-slate-500">
            {Object.keys(nodeData.parameters).length} parameter{Object.keys(nodeData.parameters).length > 1 ? 's' : ''} configured
          </div>
        )}
      </div>

      {/* Output handles */}
      {(nodeData.outputs || []).map((port: any, idx: number) => (
        <Handle
          key={`out-${port.name}-${idx}`}
          type="source"
          position={Position.Right}
          id={port.name}
          className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-slate-900 hover:!bg-emerald-300 !transition-colors"
          style={{ top: `${((idx + 1) / ((nodeData.outputs?.length || 1) + 1)) * 100}%` }}
        />
      ))}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

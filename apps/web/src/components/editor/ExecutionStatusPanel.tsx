'use client';

import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';

export function ExecutionStatusPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeExecution = useWorkflowStore((s) => s.activeExecution);
  const isExecuting = useWorkflowStore((s) => s.isExecuting);
  const executionLogs = useWorkflowStore((s) => s.executionLogs);

  if (!activeExecution && !isExecuting && executionLogs.length === 0) {
    return null;
  }

  const status = activeExecution?.status || (isExecuting ? 'running' : 'idle');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-2xl transition-all">
      {/* Bar Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-900/60 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Execution Console</span>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-900 border border-slate-800">
            {status === 'running' && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                <span className="text-blue-400">Running</span>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Success</span>
              </>
            )}
            {status === 'failed' && (
              <>
                <XCircle className="h-3 w-3 text-rose-400" />
                <span className="text-rose-400">Failed</span>
              </>
            )}
            {status === 'pending' && (
              <>
                <Clock className="h-3 w-3 text-amber-400" />
                <span className="text-amber-400">Queued</span>
              </>
            )}
          </div>

          {activeExecution?.id && (
            <span className="text-[11px] text-slate-500 font-mono">
              ID: {activeExecution.id.slice(0, 8)}
            </span>
          )}
        </div>

        <button className="text-slate-400 hover:text-slate-200 p-1">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded Logs Panel */}
      {isExpanded && (
        <div className="h-64 border-t border-slate-800/80 bg-slate-950 p-3 overflow-y-auto font-mono text-[11px] space-y-1.5">
          {executionLogs.length === 0 ? (
            <p className="text-slate-500">Waiting for logs...</p>
          ) : (
            executionLogs.map((log, idx) => (
              <div key={log.id || idx} className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`uppercase text-[10px] px-1 rounded font-semibold shrink-0 ${
                    log.level === 'error'
                      ? 'bg-rose-500/20 text-rose-400'
                      : log.level === 'warn'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {log.level}
                </span>
                {log.nodeId && (
                  <span className="text-slate-400 shrink-0">[{log.nodeId}]</span>
                )}
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

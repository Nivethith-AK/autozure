'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Terminal,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { executionApi } from '@/lib/api';
import { Execution, NodeExecutionResult } from '@flowforge/types';

export default function ExecutionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [execution, setExecution] = useState<Execution | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await executionApi.get(id);
        setExecution(data);
        if (data.nodeResults && data.nodeResults.length > 0) {
          setSelectedNode(data.nodeResults[0]);
        }
      } catch (err) {
        console.error('Failed to load execution details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <p className="text-xs text-slate-400">Execution not found.</p>
          <Link href="/executions" className="mt-2 inline-block text-xs text-emerald-400 hover:underline">
            Back to Executions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-950 px-5 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <Link
            href="/executions"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-slate-100">
                Execution {execution.id.slice(0, 8)}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  execution.status === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : execution.status === 'failed'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}
              >
                {execution.status === 'success' && <CheckCircle2 className="h-3 w-3" />}
                {execution.status === 'failed' && <XCircle className="h-3 w-3" />}
                {execution.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                {execution.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Trigger: {execution.triggerType}
            </p>
          </div>
        </div>
      </header>

      {/* Main split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node list sidebar */}
        <div className="w-80 border-r border-slate-800 bg-slate-950/60 flex flex-col">
          <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Executed Nodes
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {(execution.nodeResults || []).map((nr) => (
              <div
                key={nr.nodeId}
                onClick={() => setSelectedNode(nr)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedNode?.nodeId === nr.nodeId
                    ? 'bg-slate-900 border-emerald-500/50 text-slate-100 shadow-md'
                    : 'bg-slate-900/30 border-slate-800/80 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                <div className="overflow-hidden pr-2">
                  <span className="block text-xs font-medium truncate">{nr.nodeId}</span>
                  <span className="block text-[10px] text-slate-500 font-mono capitalize">
                    {nr.status} {nr.durationMs !== undefined ? `• ${nr.durationMs}ms` : ''}
                  </span>
                </div>
                {nr.status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                {nr.status === 'failed' && <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                {nr.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-blue-400 shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Node detail & I/O Inspector */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!selectedNode ? (
            <div className="text-center py-20 text-slate-500 text-xs">
              Select a node from the left to inspect its input and output telemetry.
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-base font-bold text-slate-100">{selectedNode.nodeId}</h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>Status: <strong className="text-slate-200 capitalize">{selectedNode.status}</strong></span>
                  {selectedNode.durationMs !== undefined && (
                    <span>Duration: <strong className="text-slate-200">{selectedNode.durationMs}ms</strong></span>
                  )}
                </div>
              </div>

              {selectedNode.error && (
                <div className="rounded-xl border border-rose-800/80 bg-rose-950/30 p-4 text-xs text-rose-300">
                  <h3 className="font-semibold mb-1">Execution Error:</h3>
                  <pre className="font-mono text-[11px] whitespace-pre-wrap">{selectedNode.error}</pre>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inputs */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                    Input Payload
                  </h3>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96">
                    {JSON.stringify(selectedNode.inputData, null, 2) || '{}'}
                  </pre>
                </div>

                {/* Outputs */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                    Output Result
                  </h3>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-96">
                    {JSON.stringify(selectedNode.outputData, null, 2) || '{}'}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Copy,
  Check,
  Download,
  Play,
  ArrowUpRight,
  AlertTriangle,
  FileJson,
  Code2,
  Eye,
  Info,
} from 'lucide-react';
import { executionApi, workflowApi } from '@/lib/api';
import { Execution, NodeExecutionResult, ExecutionLog, Workflow } from '@flowforge/types';

export default function ExecutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [execution, setExecution] = useState<Execution | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'output' | 'input' | 'logs' | 'raw'>('output');
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isReRunning, setIsReRunning] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [execData, logData] = await Promise.all([
          executionApi.get(id),
          executionApi.logs(id).catch(() => []),
        ]);
        setExecution(execData);
        setLogs(logData);

        if (execData.workflowId) {
          const wf = await workflowApi.get(execData.workflowId).catch(() => null);
          setWorkflow(wf);
        }

        if (execData.nodeResults && execData.nodeResults.length > 0) {
          setSelectedNode(execData.nodeResults[0]);
        }
      } catch (err) {
        console.error('Failed to load execution details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadExecution = () => {
    if (!execution) return;
    const blob = new Blob([JSON.stringify({ execution, logs }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${execution.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReRun = async () => {
    if (!execution) return;
    setIsReRunning(true);
    try {
      const res = await workflowApi.execute(execution.workflowId, execution.triggerData as any);
      router.push(`/executions/${res.executionId}`);
    } catch (err) {
      console.error('Failed to re-run:', err);
    } finally {
      setIsReRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-xs text-zinc-400 font-medium">Loading execution telemetry...</p>
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="text-center">
          <p className="text-xs text-zinc-400">Execution not found or deleted.</p>
          <Link href="/executions" className="mt-3 inline-block text-xs font-semibold text-white hover:underline underline-offset-4">
            Back to Executions
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total duration
  let durationStr = '—';
  if (execution.finishedAt && execution.startedAt) {
    const ms = new Date(execution.finishedAt).getTime() - new Date(execution.startedAt).getTime();
    durationStr = ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  }

  const nodeResults = execution.nodeResults || [];
  const nodeLogs = logs.filter((l) => !selectedNode || l.nodeId === selectedNode.nodeId);

  return (
    <div className="flex h-screen w-screen flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/executions"
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
            title="Back to Executions"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="h-4 w-px bg-zinc-800" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-100">
                Run {execution.id.slice(0, 8)}
              </span>

              {/* Status pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                  execution.status === 'success'
                    ? 'bg-white text-zinc-950 font-bold border border-white'
                    : execution.status === 'failed'
                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                }`}
              >
                {execution.status === 'success' && <CheckCircle2 className="h-3 w-3" />}
                {execution.status === 'failed' && <XCircle className="h-3 w-3" />}
                {execution.status === 'running' && <Loader2 className="h-3 w-3 animate-spin text-zinc-300" />}
                {execution.status}
              </span>

              {workflow && (
                <Link
                  href={`/editor/${workflow.id}`}
                  className="hidden md:flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                >
                  ({workflow.name})
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono mt-0.5">
              <span>Trigger: <strong className="text-zinc-300 capitalize">{execution.triggerType}</strong></span>
              <span>• Duration: <strong className="text-zinc-300">{durationStr}</strong></span>
              <span>• Started: {new Date(execution.startedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* Re-run button */}
          <button
            onClick={handleReRun}
            disabled={isReRunning}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 font-medium transition-colors hover:text-white"
            title="Re-run this workflow"
          >
            {isReRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-300" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Re-Run</span>
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownloadExecution}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 font-medium transition-colors hover:text-white"
            title="Download full execution JSON"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          {workflow && (
            <Link
              href={`/editor/${workflow.id}`}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-3.5 py-1.5 text-xs transition-colors border border-white shadow-sm"
            >
              Open Editor
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </header>

      {/* Main split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Node execution pipeline */}
        <div className="w-80 border-r border-zinc-800 bg-zinc-950/70 flex flex-col">
          <div className="p-3.5 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Executed Nodes
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
              {nodeResults.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {nodeResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                No node executions recorded yet.
              </div>
            ) : (
              nodeResults.map((nr) => {
                const isSelected = selectedNode?.nodeId === nr.nodeId;
                return (
                  <div
                    key={nr.nodeId}
                    onClick={() => setSelectedNode(nr)}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/50'
                        : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <div className="overflow-hidden pr-2">
                      <span className="block text-xs font-bold text-zinc-100 truncate">{nr.nodeId}</span>
                      <span className="block text-[10px] text-zinc-500 font-mono truncate">{nr.nodeType}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {nr.durationMs !== undefined && (
                        <span className="text-[10px] font-mono text-zinc-500">
                          {nr.durationMs}ms
                        </span>
                      )}
                      {nr.status === 'success' && <CheckCircle2 className="h-4 w-4 text-white" />}
                      {nr.status === 'failed' && <XCircle className="h-4 w-4 text-zinc-400" />}
                      {nr.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content Pane: I/O & Log Inspector */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
          {!selectedNode ? (
            <div className="flex-1 flex items-center justify-center text-center p-8 text-zinc-500 text-xs">
              Select a node from the left panel to inspect its inputs, outputs, and runtime logs.
            </div>
          ) : (
            <>
              {/* Selected Node Header */}
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-zinc-100">{selectedNode.nodeId}</h2>
                    <span className="text-[11px] font-mono text-zinc-500">({selectedNode.nodeType})</span>
                    <span
                      className={`text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full ${
                        selectedNode.status === 'success'
                          ? 'bg-white text-zinc-950 font-bold border border-white'
                          : selectedNode.status === 'failed'
                          ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {selectedNode.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400 font-mono">
                    <span>Duration: <strong className="text-zinc-200">{selectedNode.durationMs ?? 0}ms</strong></span>
                    {selectedNode.startedAt && (
                      <span>Started: {new Date(selectedNode.startedAt).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>

                {/* Tab selector */}
                <div className="flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-800 p-1">
                  <button
                    onClick={() => setActiveTab('output')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'output' ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Output Data
                  </button>
                  <button
                    onClick={() => setActiveTab('input')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'input' ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Input Data
                  </button>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'logs' ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Node Logs ({nodeLogs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'raw' ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Raw Record
                  </button>
                </div>
              </div>

              {/* Error Banner if Node Failed */}
              {selectedNode.error && (
                <div className="m-4 rounded-2xl border border-zinc-700 bg-zinc-900/60 p-4 flex items-start gap-3 text-zinc-200">
                  <AlertTriangle className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Execution Error Encountered</h4>
                    <p className="mt-1 text-xs font-mono text-zinc-300 break-all leading-relaxed">
                      {selectedNode.error}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab Viewport */}
              <div className="flex-1 overflow-y-auto p-4 select-text">
                {activeTab === 'output' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">Node Output Payload</span>
                      <button
                        onClick={() => copyText(JSON.stringify(selectedNode.outputData, null, 2), 'output')}
                        className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedKey === 'output' ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === 'output' ? 'Copied' : 'Copy Output JSON'}
                      </button>
                    </div>
                    <pre className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-100 overflow-x-auto leading-relaxed shadow-inner">
                      {JSON.stringify(selectedNode.outputData ?? {}, null, 2)}
                    </pre>
                  </div>
                )}

                {activeTab === 'input' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">Predecessor Input Payload</span>
                      <button
                        onClick={() => copyText(JSON.stringify(selectedNode.inputData, null, 2), 'input')}
                        className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedKey === 'input' ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === 'input' ? 'Copied' : 'Copy Input JSON'}
                      </button>
                    </div>
                    <pre className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed shadow-inner">
                      {JSON.stringify(selectedNode.inputData ?? {}, null, 2)}
                    </pre>
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-300">Execution Logs Scoped to this Node</span>
                    {nodeLogs.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic p-4">No specific logs generated for this node.</p>
                    ) : (
                      <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 font-mono text-xs space-y-2 leading-relaxed">
                        {nodeLogs.map((l, i) => (
                          <div key={l.id || i} className="flex items-start gap-2">
                            <span className="text-zinc-500 font-mono text-[10px]">
                              {new Date(l.timestamp).toLocaleTimeString()}
                            </span>
                            <span
                              className={`uppercase text-[9px] px-1.5 rounded font-bold ${
                                l.level === 'error'
                                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                                  : l.level === 'warn'
                                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                              }`}
                            >
                              {l.level}
                            </span>
                            <span className="text-zinc-200 break-all">{l.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'raw' && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-300">Raw Node Result Object</span>
                    <pre className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed shadow-inner">
                      {JSON.stringify(selectedNode, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

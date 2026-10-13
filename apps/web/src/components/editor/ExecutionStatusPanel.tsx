'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Terminal,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Trash2,
  Copy,
  Maximize2,
  Minimize2,
  Search,
  StopCircle,
  Check,
  Layers,
  ArrowDownCircle,
  ExternalLink,
  BarChart3,
  Code2,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { executionApi } from '@/lib/api';
import Link from 'next/link';

export function ExecutionStatusPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [panelHeight, setPanelHeight] = useState<'sm' | 'md' | 'lg' | 'full'>('md');
  const [activeTab, setActiveTab] = useState<'waterfall' | 'logs' | 'data'>('waterfall');
  const [logLevel, setLogLevel] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [followLogs, setFollowLogs] = useState(true);
  const [selectedNodeResult, setSelectedNodeResult] = useState<string | null>(null);

  const activeExecution = useWorkflowStore((s) => s.activeExecution);
  const setActiveExecution = useWorkflowStore((s) => s.setActiveExecution);
  const isExecuting = useWorkflowStore((s) => s.isExecuting);
  const setIsExecuting = useWorkflowStore((s) => s.setIsExecuting);
  const executionLogs = useWorkflowStore((s) => s.executionLogs);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Poll execution status and logs while running
  useEffect(() => {
    if (!activeExecution?.id) return;
    if (activeExecution.status !== 'running' && !isExecuting) return;

    const interval = setInterval(async () => {
      try {
        const [updatedExec, newLogs] = await Promise.all([
          executionApi.get(activeExecution.id).catch(() => null),
          executionApi.logs(activeExecution.id).catch(() => []),
        ]);

        if (updatedExec) {
          setActiveExecution(updatedExec);
          if (updatedExec.status !== 'running' && updatedExec.status !== 'pending') {
            setIsExecuting(false);
          }
        }

        if (newLogs && newLogs.length > 0) {
          const currentIds = new Set(useWorkflowStore.getState().executionLogs.map((l) => l.id));
          for (const l of newLogs) {
            if (!currentIds.has(l.id)) {
              useWorkflowStore.getState().addExecutionLog(l);
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [activeExecution?.id, activeExecution?.status, isExecuting, setActiveExecution, setIsExecuting]);

  // Auto-expand when execution starts
  useEffect(() => {
    if (isExecuting || activeExecution?.status === 'running') {
      setIsExpanded(true);
    }
  }, [isExecuting, activeExecution?.status]);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (followLogs && isExpanded && logContainerRef.current && activeTab === 'logs') {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [executionLogs, followLogs, isExpanded, activeTab]);

  const handleCancelExecution = async () => {
    if (!activeExecution?.id) return;
    try {
      await executionApi.cancel(activeExecution.id);
      setActiveExecution({ ...activeExecution, status: 'cancelled' });
      setIsExecuting(false);
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const handleClearLogs = () => {
    useWorkflowStore.setState({ executionLogs: [] });
  };

  const handleCopyLogs = () => {
    const raw = JSON.stringify(executionLogs, null, 2);
    navigator.clipboard.writeText(raw);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const filteredLogs = useMemo(() => {
    return executionLogs.filter((log) => {
      const matchesLevel = logLevel === 'all' || log.level === logLevel;
      const matchesSearch =
        !searchFilter ||
        log.message.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (log.nodeId && log.nodeId.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchesLevel && matchesSearch;
    });
  }, [executionLogs, logLevel, searchFilter]);

  if (!activeExecution && !isExecuting && executionLogs.length === 0) {
    return null;
  }

  const status = activeExecution?.status || (isExecuting ? 'running' : 'idle');
  const nodeResults = activeExecution?.nodeResults || [];
  const totalDuration = nodeResults.reduce((acc, r) => acc + (r.durationMs || 0), 0);

  // Default select first node result if none selected
  const activeNodeResult = nodeResults.find((r) => r.nodeId === selectedNodeResult) || nodeResults[0];

  const counts = {
    info: executionLogs.filter((l) => l.level === 'info').length,
    warn: executionLogs.filter((l) => l.level === 'warn').length,
    error: executionLogs.filter((l) => l.level === 'error').length,
  };

  const heightClass =
    panelHeight === 'sm'
      ? 'h-48'
      : panelHeight === 'lg'
      ? 'h-96'
      : panelHeight === 'full'
      ? 'h-[calc(80vh)]'
      : 'h-64';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl transition-all select-none">
      {/* Top Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-5 py-2.5 cursor-pointer hover:bg-zinc-900/80 transition-colors border-b border-zinc-800/80"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
              <Terminal className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-zinc-100 tracking-tight">Execution Console</span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-zinc-900 border border-zinc-800">
            {status === 'running' && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-zinc-300" />
                <span className="text-zinc-200">Executing</span>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-3 w-3 text-white" />
                <span className="text-white font-bold">Success</span>
              </>
            )}
            {status === 'failed' && (
              <>
                <XCircle className="h-3 w-3 text-zinc-400" />
                <span className="text-zinc-300 font-bold">Failed</span>
              </>
            )}
            {status === 'pending' && (
              <>
                <Clock className="h-3 w-3 text-zinc-400" />
                <span className="text-zinc-300">Queued</span>
              </>
            )}
            {status === 'cancelled' && <span className="text-zinc-400">Cancelled</span>}
          </div>

          {/* Telemetry info chips */}
          {activeExecution?.id && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyId(activeExecution.id);
                }}
                className="hover:text-white transition-colors flex items-center gap-1"
                title="Click to copy run ID"
              >
                <span>Run: <strong className="text-zinc-200">{activeExecution.id.slice(0, 8)}</strong></span>
                {copiedId ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3 text-zinc-500" />}
              </button>

              {totalDuration > 0 && (
                <span className="text-zinc-500">• {totalDuration}ms total runtime</span>
              )}

              {activeExecution.startedAt && (
                <span className="text-zinc-500">• Started {new Date(activeExecution.startedAt).toLocaleTimeString()}</span>
              )}
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {status === 'running' && (
            <button
              onClick={handleCancelExecution}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-zinc-300 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors"
            >
              <StopCircle className="h-3 w-3" />
              Cancel Run
            </button>
          )}

          {activeExecution?.id && (
            <Link
              href={`/executions/${activeExecution.id}`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
              title="Open full execution telemetry page"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden md:inline">Inspect Run</span>
            </Link>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Console Window */}
      {isExpanded && (
        <div className="bg-zinc-950 flex flex-col">
          {/* Main Tabs Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2 border-b border-zinc-800 bg-zinc-900/60 text-xs">
            {/* Primary View Mode Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('waterfall')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'waterfall'
                    ? 'bg-white text-zinc-950 font-bold border border-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Pipeline Waterfall ({nodeResults.length})
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'logs'
                    ? 'bg-white text-zinc-950 font-bold border border-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                Console Logs ({executionLogs.length})
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'data'
                    ? 'bg-white text-zinc-950 font-bold border border-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Step Data Inspector
              </button>
            </div>

            {/* Sub-Actions & Filters */}
            <div className="flex items-center gap-2">
              {activeTab === 'logs' && (
                <>
                  {/* Log level filter pills */}
                  <div className="flex items-center gap-1 mr-2 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => setLogLevel('all')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        logLevel === 'all' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setLogLevel('info')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        logLevel === 'info' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Info ({counts.info})
                    </button>
                    <button
                      onClick={() => setLogLevel('warn')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        logLevel === 'warn' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Warn ({counts.warn})
                    </button>
                    <button
                      onClick={() => setLogLevel('error')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        logLevel === 'error' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Err ({counts.error})
                    </button>
                  </div>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1.5 h-3 w-3 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Filter logs..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="rounded-lg bg-zinc-900 border border-zinc-800 pl-7 pr-2.5 py-1 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white"
                    />
                  </div>

                  {/* Follow toggle */}
                  <button
                    onClick={() => setFollowLogs(!followLogs)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors flex items-center gap-1 ${
                      followLogs
                        ? 'bg-zinc-800 text-white border border-zinc-700 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Auto-scroll to bottom on new log"
                  >
                    <ArrowDownCircle className="h-3 w-3" />
                    Follow
                  </button>

                  {/* Copy logs */}
                  <button
                    onClick={handleCopyLogs}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
                    title="Copy all logs to clipboard as JSON"
                  >
                    {copiedLogs ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>

                  {/* Clear logs */}
                  <button
                    onClick={handleClearLogs}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                    title="Clear console logs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}

              {/* Height toggle */}
              <button
                onClick={() =>
                  setPanelHeight(
                    panelHeight === 'sm'
                      ? 'md'
                      : panelHeight === 'md'
                      ? 'lg'
                      : panelHeight === 'lg'
                      ? 'full'
                      : 'sm'
                  )
                }
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors ml-1"
                title="Toggle console height"
              >
                {panelHeight === 'full' ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Viewport Content */}
          <div className={`${heightClass} overflow-y-auto p-4 font-mono text-[11px] bg-zinc-950 select-text`}>
            {/* 1. PIPELINE WATERFALL VIEW */}
            {activeTab === 'waterfall' && (
              <div className="space-y-3">
                {nodeResults.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 italic">
                    <p>No node execution results yet.</p>
                    <p className="text-[10px] text-zinc-600 mt-1">Run a workflow to generate telemetry graphs.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {nodeResults.map((nr) => {
                      const duration = nr.durationMs || 1;
                      const maxDur = Math.max(...nodeResults.map((r) => r.durationMs || 1), 10);
                      const widthPercent = Math.min(100, Math.max(8, (duration / maxDur) * 100));

                      return (
                        <div
                          key={nr.nodeId}
                          onClick={() => {
                            setSelectedNodeResult(nr.nodeId);
                            setActiveTab('data');
                          }}
                          className="group p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-600 cursor-pointer transition-all flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {nr.status === 'success' && <CheckCircle2 className="h-4 w-4 text-white shrink-0" />}
                              {nr.status === 'failed' && <XCircle className="h-4 w-4 text-zinc-400 shrink-0" />}
                              {nr.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-zinc-300 shrink-0" />}
                              {nr.status === 'skipped' && <Clock className="h-4 w-4 text-zinc-500 shrink-0" />}

                              <div>
                                <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                                  {nr.nodeId}
                                </span>
                                <span className="text-[10px] text-zinc-500 ml-2 font-mono">
                                  [{nr.nodeType}]
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-semibold text-zinc-300 font-mono">
                                {nr.durationMs !== undefined ? `${nr.durationMs}ms` : 'pending'}
                              </span>
                              <span
                                className={`text-[9px] uppercase px-2 py-0.5 rounded font-bold border ${
                                  nr.status === 'success'
                                    ? 'bg-white text-zinc-950 border-white'
                                    : nr.status === 'failed'
                                    ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                    : 'bg-zinc-800 text-zinc-200 border-zinc-700'
                                }`}
                              >
                                {nr.status}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                            </div>
                          </div>

                          {/* Waterfall Duration Bar */}
                          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                nr.status === 'success'
                                  ? 'bg-white'
                                  : nr.status === 'failed'
                                  ? 'bg-zinc-500'
                                  : 'bg-zinc-400'
                              }`}
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>

                          {nr.error && (
                            <div className="text-zinc-200 text-[10px] font-mono bg-zinc-900 border border-zinc-700 rounded-lg p-2 mt-1">
                              {nr.error}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. CONSOLE LOGS VIEW */}
            {activeTab === 'logs' && (
              <div ref={logContainerRef} className="space-y-1.5">
                {filteredLogs.length === 0 ? (
                  <p className="text-zinc-500 italic py-8 text-center">No console logs recorded.</p>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <div key={log.id || idx} className="flex items-start gap-2.5 leading-relaxed hover:bg-zinc-900/60 p-1 rounded transition-colors">
                      <span className="text-zinc-500 shrink-0 font-mono select-none text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`uppercase text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 select-none ${
                          log.level === 'error'
                            ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                            : log.level === 'warn'
                            ? 'bg-zinc-850 text-zinc-300 border border-zinc-750'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {log.level}
                      </span>
                      {log.nodeId && (
                        <span className="text-zinc-300 shrink-0 font-mono">
                          [{log.nodeId}]
                        </span>
                      )}
                      <span className="text-zinc-200 break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. STEP DATA INSPECTOR VIEW */}
            {activeTab === 'data' && (
              <div>
                {nodeResults.length === 0 ? (
                  <p className="text-zinc-500 italic py-8 text-center">No node output data recorded for this run.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Node selector tabs */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {nodeResults.map((nr) => (
                        <button
                          key={nr.nodeId}
                          onClick={() => setSelectedNodeResult(nr.nodeId)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                            activeNodeResult?.nodeId === nr.nodeId
                              ? 'bg-white text-zinc-950 font-bold border-white shadow-sm'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                          }`}
                        >
                          {nr.nodeId} ({nr.status})
                        </button>
                      ))}
                    </div>

                    {activeNodeResult && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Input Payload */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs text-zinc-300 font-bold border-b border-zinc-800 pb-1.5">
                            <span>Input Payload</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(JSON.stringify(activeNodeResult.inputData, null, 2))}
                              className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <Copy className="h-3 w-3" /> Copy
                            </button>
                          </div>
                          <pre className="text-[11px] text-zinc-300 font-mono overflow-x-auto max-h-56 p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                            {JSON.stringify(activeNodeResult.inputData || {}, null, 2)}
                          </pre>
                        </div>

                        {/* Output Payload */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs text-zinc-200 font-bold border-b border-zinc-800 pb-1.5">
                            <span>Output Result</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(JSON.stringify(activeNodeResult.outputData, null, 2))}
                              className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <Copy className="h-3 w-3" /> Copy
                            </button>
                          </div>
                          <pre className="text-[11px] text-zinc-100 font-mono overflow-x-auto max-h-56 p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                            {JSON.stringify(activeNodeResult.outputData || {}, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

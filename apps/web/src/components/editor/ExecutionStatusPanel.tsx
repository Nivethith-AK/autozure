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
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { executionApi } from '@/lib/api';
import Link from 'next/link';

export function ExecutionStatusPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [panelHeight, setPanelHeight] = useState<'sm' | 'md' | 'lg'>('md');
  const [activeTab, setActiveTab] = useState<'all' | 'info' | 'warn' | 'error' | 'nodes'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [followLogs, setFollowLogs] = useState(true);

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
          // Merge unique logs
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
    if (followLogs && isExpanded && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [executionLogs, followLogs, isExpanded]);

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
    // Clear logs from Zustand
    useWorkflowStore.setState({ executionLogs: [] });
  };

  const handleCopyLogs = () => {
    const raw = JSON.stringify(executionLogs, null, 2);
    navigator.clipboard.writeText(raw);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const filteredLogs = useMemo(() => {
    return executionLogs.filter((log) => {
      const matchesLevel = activeTab === 'all' || log.level === activeTab;
      const matchesSearch =
        !searchFilter ||
        log.message.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (log.nodeId && log.nodeId.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchesLevel && matchesSearch;
    });
  }, [executionLogs, activeTab, searchFilter]);

  if (!activeExecution && !isExecuting && executionLogs.length === 0) {
    return null;
  }

  const status = activeExecution?.status || (isExecuting ? 'running' : 'idle');
  const counts = {
    info: executionLogs.filter((l) => l.level === 'info').length,
    warn: executionLogs.filter((l) => l.level === 'warn').length,
    error: executionLogs.filter((l) => l.level === 'error').length,
  };

  const heightClass =
    panelHeight === 'sm' ? 'h-44' : panelHeight === 'lg' ? 'h-96' : 'h-64';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-2xl transition-all select-none">
      {/* Top Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-slate-900/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-100 tracking-tight">Execution Console</span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-900 border border-slate-800">
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
            {status === 'cancelled' && (
              <span className="text-slate-400">Cancelled</span>
            )}
          </div>

          {/* Execution details */}
          {activeExecution?.id && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>Run: <strong className="text-slate-200">{activeExecution.id.slice(0, 8)}</strong></span>
              {activeExecution.startedAt && (
                <span>• Started {new Date(activeExecution.startedAt).toLocaleTimeString()}</span>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {status === 'running' && (
            <button
              onClick={handleCancelExecution}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              <StopCircle className="h-3 w-3" />
              Cancel Run
            </button>
          )}

          {activeExecution?.id && (
            <Link
              href={`/executions/${activeExecution.id}`}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors"
              title="Open full execution telemetry page"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden md:inline">Inspect Run</span>
            </Link>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-900 transition-colors"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Console Window */}
      {isExpanded && (
        <div className="border-t border-slate-800 bg-slate-950 flex flex-col">
          {/* Sub Toolbar: Tabs & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5 border-b border-slate-800/80 bg-slate-900/40 text-xs">
            {/* Level Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({executionLogs.length})
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Info ({counts.info})
              </button>
              <button
                onClick={() => setActiveTab('warn')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeTab === 'warn'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Warn ({counts.warn})
              </button>
              <button
                onClick={() => setActiveTab('error')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeTab === 'error'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Error ({counts.error})
              </button>
              <button
                onClick={() => setActiveTab('nodes')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  activeTab === 'nodes'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="h-3 w-3" />
                Node Telemetry
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Search filter in logs */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1.5 h-3 w-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="rounded-lg bg-slate-900 border border-slate-800 pl-7 pr-2.5 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Follow output toggle */}
              <button
                onClick={() => setFollowLogs(!followLogs)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors flex items-center gap-1 ${
                  followLogs
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Auto scroll to bottom on new log"
              >
                <ArrowDownCircle className="h-3 w-3" />
                Follow
              </button>

              {/* Copy logs */}
              <button
                onClick={handleCopyLogs}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Copy all logs to clipboard as JSON"
              >
                {copiedLogs ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              {/* Clear logs */}
              <button
                onClick={handleClearLogs}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Clear console logs"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {/* Height toggle */}
              <button
                onClick={() => setPanelHeight(panelHeight === 'sm' ? 'md' : panelHeight === 'md' ? 'lg' : 'sm')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Toggle console height"
              >
                {panelHeight === 'lg' ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Logs Viewport */}
          <div
            ref={logContainerRef}
            className={`${heightClass} overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 bg-slate-950 transition-all select-text`}
          >
            {activeTab === 'nodes' ? (
              /* Node Telemetry Tab */
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2">
                  Node Execution Pipeline Summary
                </div>
                {(!activeExecution?.nodeResults || activeExecution.nodeResults.length === 0) ? (
                  <p className="text-slate-500 italic">No node telemetry available for this run yet.</p>
                ) : (
                  activeExecution.nodeResults.map((nr) => (
                    <div
                      key={nr.nodeId}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {nr.status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                        {nr.status === 'failed' && <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                        {nr.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-blue-400 shrink-0" />}
                        {nr.status === 'skipped' && <Clock className="h-4 w-4 text-slate-500 shrink-0" />}

                        <div>
                          <span className="text-xs font-semibold text-slate-200">{nr.nodeId}</span>
                          <span className="block text-[10px] text-slate-500">{nr.nodeType}</span>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        <span className="capitalize">{nr.status}</span>
                        {nr.durationMs !== undefined && (
                          <span className="ml-2 text-slate-300">({nr.durationMs}ms)</span>
                        )}
                        {nr.error && (
                          <div className="text-rose-400 text-[10px] mt-0.5">{nr.error}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : filteredLogs.length === 0 ? (
              <p className="text-slate-500 italic">No console logs recorded.</p>
            ) : (
              filteredLogs.map((log, idx) => (
                <div key={log.id || idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 shrink-0 font-mono select-none">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`uppercase text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 select-none ${
                      log.level === 'error'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : log.level === 'warn'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {log.level}
                  </span>
                  {log.nodeId && (
                    <span className="text-emerald-400/80 shrink-0 font-mono">
                      [{log.nodeId}]
                    </span>
                  )}
                  <span className="text-slate-200 break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

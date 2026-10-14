'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  StopCircle,
  ChevronRight,
  Play,
  Globe,
  RefreshCw,
  Search,
  Copy,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import { executionApi, workflowApi } from '@/lib/api';
import { Execution, Workflow } from '@autozure/types';
import { formatDistanceToNow } from 'date-fns';

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [workflows, setWorkflows] = useState<Record<string, Workflow>>({});
  const [stats, setStats] = useState({ total: 0, successful: 0, failed: 0, running: 0, successRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reRunningId, setReRunningId] = useState<string | null>(null);

  const fetchExecutions = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [execData, statData, wfList] = await Promise.all([
        executionApi.list().catch(() => []),
        executionApi.stats().catch(() => ({ total: 0, successful: 0, failed: 0, running: 0, successRate: 0 })),
        workflowApi.list().catch(() => []),
      ]);
      setExecutions(execData);
      setStats(statData);

      const wfMap: Record<string, Workflow> = {};
      for (const w of wfList) {
        wfMap[w.id] = w;
      }
      setWorkflows(wfMap);
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchExecutions(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleCancel = async (id: string) => {
    try {
      await executionApi.cancel(id);
      fetchExecutions(true);
    } catch (err) {
      console.error('Failed to cancel execution:', err);
    }
  };

  const handleReRun = async (exec: Execution) => {
    setReRunningId(exec.id);
    try {
      await workflowApi.execute(exec.workflowId, exec.triggerData as any);
      await fetchExecutions(true);
    } catch (err) {
      console.error('Failed to re-run:', err);
    } finally {
      setReRunningId(null);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = useMemo(() => {
    return executions.filter((e) => {
      const matchesStatus =
        filterStatus === 'all'
          ? true
          : ['manual', 'webhook', 'schedule'].includes(filterStatus)
          ? e.triggerType === filterStatus
          : e.status === filterStatus;

      const wf = workflows[e.workflowId];
      const wfName = wf?.name || '';
      const matchesSearch =
        !searchQuery ||
        e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wfName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.triggerType.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [executions, filterStatus, searchQuery, workflows]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-zinc-100">Execution History & Logs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
              Live Engine Telemetry
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Real-time execution status, node performance timelines, and input/output payload inspection.
          </p>
        </div>

        {/* Live Refresh Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              autoRefresh
                ? 'bg-zinc-900 text-zinc-100 border-zinc-750 font-semibold'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-white animate-pulse' : 'bg-zinc-600'}`} />
            {autoRefresh ? 'Live Polling Active' : 'Polling Paused'}
          </button>

          <button
            onClick={() => fetchExecutions()}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
            title="Refresh executions"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Total Invocations</span>
            <Activity className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-100">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Successful Runs</span>
            <CheckCircle2 className="h-4 w-4 text-zinc-300" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-100">{stats.successful}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Failed Runs</span>
            <XCircle className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-100">{stats.failed}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Active Workers</span>
            <Clock className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-100">{stats.running}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            id="search-executions"
            name="search-executions"
            placeholder="Search by ID, workflow name, or trigger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'running', label: 'Running' },
            { id: 'success', label: 'Success' },
            { id: 'failed', label: 'Failed' },
            { id: 'manual', label: 'Manual' },
            { id: 'webhook', label: 'Webhook' },
            { id: 'schedule', label: 'Schedule' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap border ${
                filterStatus === tab.id
                  ? 'bg-white text-zinc-950 font-bold border-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Executions Table */}
      {isLoading ? (
        <div className="flex py-24 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            <p className="text-xs text-zinc-400 font-mono">Loading telemetry logs...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center text-zinc-500 text-xs">
          No execution runs found matching your filters.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Workflow</th>
                <th className="px-5 py-3.5">Run ID</th>
                <th className="px-5 py-3.5">Trigger</th>
                <th className="px-5 py-3.5">Started At</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-medium">
              {filtered.map((exec) => {
                const wf = workflows[exec.workflowId];
                const wfName = wf?.name || 'Workflow';

                let durationStr = '—';
                if (exec.finishedAt && exec.startedAt) {
                  const ms = new Date(exec.finishedAt).getTime() - new Date(exec.startedAt).getTime();
                  durationStr = ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
                } else if (exec.status === 'running') {
                  durationStr = 'Running...';
                }

                const TriggerIcon =
                  exec.triggerType === 'webhook'
                    ? Globe
                    : exec.triggerType === 'schedule'
                    ? Clock
                    : Play;

                return (
                  <tr key={exec.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Status Badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                          exec.status === 'success'
                            ? 'bg-white text-zinc-950 font-bold border border-white'
                            : exec.status === 'failed'
                            ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            : exec.status === 'running'
                            ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {exec.status === 'running' && <Loader2 className="h-3 w-3 animate-spin text-zinc-300" />}
                        {exec.status === 'success' && <CheckCircle2 className="h-3 w-3 text-zinc-950" />}
                        {exec.status === 'failed' && <XCircle className="h-3 w-3 text-zinc-400" />}
                        {exec.status}
                      </span>
                    </td>

                    {/* Workflow Name Link */}
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/editor/${exec.workflowId}`}
                        className="text-zinc-200 hover:text-white font-semibold transition-colors flex items-center gap-1"
                      >
                        {wfName}
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </Link>
                    </td>

                    {/* Run ID with copy */}
                    <td className="px-5 py-3.5 font-mono text-zinc-400">
                      <button
                        onClick={() => copyId(exec.id)}
                        className="hover:text-white transition-colors flex items-center gap-1"
                        title="Copy full Execution ID"
                      >
                        <span>{exec.id.slice(0, 8)}...</span>
                        {copiedId === exec.id ? (
                          <Check className="h-3 w-3 text-white" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-40 hover:opacity-100" />
                        )}
                      </button>
                    </td>

                    {/* Trigger */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-zinc-300 font-mono text-[11px] capitalize">
                        <TriggerIcon className="h-3.5 w-3.5 text-zinc-500" />
                        {exec.triggerType}
                      </span>
                    </td>

                    {/* Started time */}
                    <td className="px-5 py-3.5 text-zinc-400 font-mono text-[11px]">
                      {formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true })}
                    </td>

                    {/* Duration */}
                    <td className="px-5 py-3.5 font-mono text-zinc-300 text-[11px]">
                      {durationStr}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Re-run button */}
                        <button
                          onClick={() => handleReRun(exec)}
                          disabled={reRunningId === exec.id}
                          className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
                          title="Re-run this workflow execution"
                        >
                          {reRunningId === exec.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-300" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Cancel button if running */}
                        {exec.status === 'running' && (
                          <button
                            onClick={() => handleCancel(exec.id)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
                            title="Cancel running execution"
                          >
                            <StopCircle className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Inspect detail page */}
                        <Link
                          href={`/executions/${exec.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 text-xs font-semibold transition-colors"
                        >
                          Inspect
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

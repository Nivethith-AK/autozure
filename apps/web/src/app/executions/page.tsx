'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  StopCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { executionApi } from '@/lib/api';
import { Execution } from '@flowforge/types';
import { formatDistanceToNow } from 'date-fns';

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchExecutions = async () => {
    try {
      setIsLoading(true);
      const data = await executionApi.list();
      setExecutions(data);
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await executionApi.cancel(id);
      fetchExecutions();
    } catch (err) {
      console.error('Failed to cancel execution:', err);
    }
  };

  const filtered = executions.filter((e) =>
    filterStatus === 'all' ? true : e.status === filterStatus
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Execution History</h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry and execution logs across all your workflows.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 p-1">
          {['all', 'running', 'success', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex py-20 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center text-slate-500 text-xs">
          No execution runs found.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Execution ID</th>
                <th className="px-4 py-3">Trigger</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((exec) => (
                <tr key={exec.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        exec.status === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : exec.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-400'
                          : exec.status === 'running'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {exec.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {exec.status === 'success' && <CheckCircle2 className="h-3 w-3" />}
                      {exec.status === 'failed' && <XCircle className="h-3 w-3" />}
                      {exec.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {exec.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-400">
                    {exec.triggerType}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/executions/${exec.id}`}
                        className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5"
                      >
                        Inspect
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                      {exec.status === 'running' && (
                        <button
                          onClick={() => handleCancel(exec.id)}
                          className="rounded p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Cancel execution"
                        >
                          <StopCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  GitFork,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  MoreVertical,
  Loader2,
  Zap,
} from 'lucide-react';
import { workflowApi, executionApi } from '@/lib/api';
import { Workflow } from '@flowforge/types';

export default function DashboardPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState({ total: 0, successful: 0, failed: 0, running: 0, successRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [wfList, statData] = await Promise.all([
          workflowApi.list().catch(() => []),
          executionApi.stats().catch(() => ({ total: 0, successful: 0, failed: 0, running: 0, successRate: 0 })),
        ]);
        setWorkflows(wfList);
        setStats(statData);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    try {
      const newWf = await workflowApi.create({
        name: `Workflow ${workflows.length + 1}`,
        description: 'New visual automation flow',
        graph: {
          nodes: [
            {
              id: 'node-trigger',
              type: 'trigger.manual',
              position: { x: 100, y: 150 },
              data: {
                type: 'trigger.manual',
                label: 'Manual Trigger',
                parameters: {},
              },
            },
          ],
          edges: [],
        },
      });
      router.push(`/editor/${newWf.id}`);
    } catch (err) {
      console.error('Failed to create workflow:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Workflows</h1>
          <p className="text-xs text-slate-400">
            Build, monitor and manage your automated data pipelines and AI workflows.
          </p>
        </div>
        <button
          onClick={handleCreateWorkflow}
          disabled={isCreating}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 text-xs transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create Workflow
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Workflows</span>
            <GitFork className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{workflows.length}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Runs</span>
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{stats.total}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Success Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">{stats.successRate}%</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Running Jobs</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{stats.running}</div>
        </div>
      </div>

      {/* Workflows Grid */}
      {isLoading ? (
        <div className="flex py-20 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No workflows yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Get started by creating your first automated workflow using visual drag-and-drop nodes.
          </p>
          <button
            onClick={handleCreateWorkflow}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Forge a Workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => {
            const nodeCount = wf.graph?.nodes?.length || 0;
            return (
              <div
                key={wf.id}
                className="group rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/editor/${wf.id}`}
                        className="text-sm font-semibold text-slate-100 hover:text-emerald-400 transition-colors"
                      >
                        {wf.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {wf.description || 'No description'}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        wf.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {wf.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                    <span>{nodeCount} node{nodeCount !== 1 ? 's' : ''}</span>
                    {wf.lastRunStatus && (
                      <span className="flex items-center gap-1">
                        {wf.lastRunStatus === 'success' ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3 w-3 text-rose-400" />
                        )}
                        Last run: {wf.lastRunStatus}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    href={`/editor/${wf.id}`}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    Open Editor →
                  </Link>

                  <button
                    onClick={() => router.push(`/editor/${wf.id}`)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Run Workflow"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

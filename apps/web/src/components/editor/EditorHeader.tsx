'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Save,
  Plus,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { workflowApi } from '@/lib/api';

interface EditorHeaderProps {
  onToggleLibrary: () => void;
  isLibraryOpen: boolean;
}

export function EditorHeader({ onToggleLibrary, isLibraryOpen }: EditorHeaderProps) {
  const workflow = useWorkflowStore((s) => s.workflow);
  const isDirty = useWorkflowStore((s) => s.isDirty);
  const isSaving = useWorkflowStore((s) => s.isSaving);
  const isExecuting = useWorkflowStore((s) => s.isExecuting);
  const getGraph = useWorkflowStore((s) => s.getGraph);
  const setIsSaving = useWorkflowStore((s) => s.setIsSaving);
  const setIsDirty = useWorkflowStore((s) => s.setIsDirty);
  const setIsExecuting = useWorkflowStore((s) => s.setIsExecuting);
  const setActiveExecution = useWorkflowStore((s) => s.setActiveExecution);
  const addExecutionLog = useWorkflowStore((s) => s.addExecutionLog);

  const handleSave = async () => {
    if (!workflow) return;
    setIsSaving(true);
    try {
      const graph = getGraph();
      await workflowApi.update(workflow.id, {
        name: workflow.name,
        graph,
      });
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to save workflow:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!workflow) return;
    setIsExecuting(true);
    try {
      // First save current graph if dirty
      if (isDirty) {
        await handleSave();
      }

      addExecutionLog({
        id: `log-${Date.now()}`,
        executionId: '',
        level: 'info',
        message: 'Dispatching workflow execution to engine...',
        timestamp: new Date(),
      });

      const res = await workflowApi.execute(workflow.id);
      setActiveExecution({
        id: res.executionId,
        workflowId: workflow.id,
        workspaceId: workflow.workspaceId,
        status: 'running',
        triggerType: 'manual',
        startedAt: new Date(),
      });

      addExecutionLog({
        id: `log-${Date.now()}`,
        executionId: res.executionId,
        level: 'info',
        message: `Execution queued (Job ID: ${res.jobId || res.executionId})`,
        timestamp: new Date(),
      });
    } catch (err: any) {
      addExecutionLog({
        id: `log-${Date.now()}`,
        executionId: '',
        level: 'error',
        message: err.response?.data?.message || err.message || 'Execution failed',
        timestamp: new Date(),
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-100">
              {workflow?.name || 'Untitled Workflow'}
            </h1>
            {isDirty && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium bg-amber-400/10 px-1.5 py-0.5 rounded">
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate max-w-xs">
            {workflow?.description || 'No description provided'}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Toggle Node Library */}
        <button
          onClick={onToggleLibrary}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            isLibraryOpen
              ? 'bg-slate-800 text-slate-200'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Node
        </button>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            isDirty
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
              : 'bg-slate-900/50 text-slate-500 cursor-not-allowed border border-slate-900'
          }`}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save
        </button>

        {/* Run Workflow button */}
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md shadow-emerald-950/30 transition-all disabled:opacity-50"
        >
          {isExecuting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" />
          )}
          Run Workflow
        </button>
      </div>
    </header>
  );
}

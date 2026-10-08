'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Save,
  Plus,
  Loader2,
  Check,
  Globe,
  Copy,
  Layers,
  Sparkles,
  ExternalLink,
  Edit2,
  Download,
  Upload,
  Power,
  Activity,
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
  const setWorkflow = useWorkflowStore((s) => s.setWorkflow);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(workflow?.name || 'Untitled Workflow');
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const webhookUrl = `http://localhost:3001/webhooks/${workflow?.id || 'demo'}`;

  // Keyboard shortcut Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workflow, isDirty]);

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (!workflow || !titleValue.trim()) return;
    try {
      const updated = await workflowApi.update(workflow.id, { name: titleValue.trim() });
      setWorkflow({ ...workflow, name: updated.name });
    } catch (err) {
      console.error('Failed to update workflow title:', err);
    }
  };

  const handleToggleStatus = async () => {
    if (!workflow) return;
    const nextStatus = workflow.status === 'active' ? 'draft' : 'active';
    try {
      const updated = await workflowApi.update(workflow.id, { status: nextStatus });
      setWorkflow({ ...workflow, status: updated.status, active: updated.active });
    } catch (err) {
      console.error('Failed to toggle workflow status:', err);
    }
  };

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
      if (isDirty) {
        await handleSave();
      }

      addExecutionLog({
        id: `log-${Date.now()}`,
        executionId: '',
        level: 'info',
        message: '🚀 Dispatching workflow execution to FlowForge engine...',
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
        message: `Execution queued (ID: ${res.executionId.slice(0, 8)})`,
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
      setIsExecuting(false);
    }
  };

  const handleExportJson = () => {
    if (!workflow) return;
    const fullData = {
      name: workflow.name,
      description: workflow.description,
      graph: getGraph(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !workflow) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.graph && parsed.graph.nodes) {
          setWorkflow({
            ...workflow,
            name: parsed.name || workflow.name,
            graph: parsed.graph,
          });
          setIsDirty(true);
        }
      } catch (err) {
        alert('Invalid workflow JSON file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const sampleCurl = `curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello from external webhook!", "priority": "high"}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <>
      <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors border border-transparent hover:border-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-medium">Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />

          {/* Editable Title */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                className="rounded-lg bg-slate-900 border border-emerald-500/50 px-2.5 py-1 text-xs font-semibold text-slate-100 focus:outline-none ring-1 ring-emerald-500/40"
              />
            ) : (
              <div
                onClick={() => {
                  setTitleValue(workflow?.name || 'Untitled Workflow');
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 hover:bg-slate-900 transition-colors"
              >
                <h1 className="text-sm font-semibold text-slate-100">
                  {workflow?.name || 'Untitled Workflow'}
                </h1>
                <Edit2 className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Active / Draft Pill Switch */}
            {workflow && (
              <button
                onClick={handleToggleStatus}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors border ${
                  workflow.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title="Toggle Active / Draft"
              >
                <Power className="h-2.5 w-2.5" />
                <span>{workflow.status}</span>
              </button>
            )}

            {isDirty ? (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                ● Unsaved changes
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                Saved (Ctrl+S)
              </span>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Webhook URL modal button */}
          <button
            onClick={() => setIsWebhookModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors border border-slate-800/60"
            title="Inbound Webhook Trigger URL & curl test"
          >
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden md:inline">Webhook</span>
          </button>

          {/* Export / Import Menu */}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 rounded-lg p-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors border border-slate-800/60"
            title="Export Workflow JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <label
            className="flex items-center gap-1 rounded-lg p-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors border border-slate-800/60 cursor-pointer"
            title="Import Workflow JSON"
          >
            <Upload className="h-3.5 w-3.5" />
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          {/* Toggle Node Library */}
          <button
            onClick={onToggleLibrary}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              isLibraryOpen
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Node</span>
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              isDirty
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save</span>
          </button>

          {/* Execute / Run button */}
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold px-4 py-1.5 text-xs shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>Run Workflow</span>
          </button>
        </div>
      </header>

      {/* Webhook Details Modal */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Inbound Webhook Trigger</h3>
              </div>
              <button
                onClick={() => setIsWebhookModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Trigger this workflow from any external service (GitHub, Stripe, custom API, curl) by sending an HTTP POST/GET request to:
            </p>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 p-3">
              <code className="flex-1 font-mono text-xs text-emerald-400 break-all">{webhookUrl}</code>
              <button
                onClick={handleCopyWebhook}
                className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors shrink-0"
              >
                {copiedWebhook ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedWebhook ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-slate-950/50 border border-slate-800/80 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-300 font-mono">Test with cURL:</span>
                <button
                  onClick={handleCopyCurl}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 font-mono"
                >
                  {copiedCurl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedCurl ? 'Copied' : 'Copy cURL'}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-pre p-2 bg-slate-950 rounded-lg border border-slate-800/60">
                {sampleCurl}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

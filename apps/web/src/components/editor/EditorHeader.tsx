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
  ExternalLink,
  Edit2,
  Download,
  Upload,
  Power,
  Activity,
  Terminal,
  ChevronRight,
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
  const [titleValue, setTitleValue] = useState(workflow?.name || 'Untitled Pipeline');
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const webhookUrl = `http://localhost:3001/webhooks/${workflow?.id || 'demo'}`;

  // Keyboard shortcut Ctrl+S (Save) & Ctrl+Enter (Run)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workflow, isDirty, isExecuting]);

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (!workflow || !titleValue.trim()) return;
    try {
      const updated = await workflowApi.update(workflow.id, { name: titleValue.trim() });
      setWorkflow({ ...workflow, name: updated.name });
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleToggleStatus = async () => {
    if (!workflow) return;
    const nextStatus = workflow.status === 'active' ? 'draft' : 'active';
    try {
      const updated = await workflowApi.update(workflow.id, { status: nextStatus });
      setWorkflow({ ...workflow, status: updated.status, active: updated.active });
    } catch (err) {
      console.error('Failed to toggle status:', err);
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
    if (!workflow || isExecuting) return;
    setIsExecuting(true);
    try {
      if (isDirty) {
        await handleSave();
      }

      addExecutionLog({
        id: `log-${Date.now()}`,
        executionId: '',
        level: 'info',
        message: '⚡ Dispatching workflow execution to FlowForge engine...',
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

  const sampleCurl = `curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello from external webhook!", "priority": "high"}'`;

  return (
    <>
      <header className="h-14 border-b border-white/[0.08] bg-[#090b12]/90 backdrop-blur-xl px-4 flex items-center justify-between z-30 select-none">
        {/* Left: Breadcrumbs & Workflow Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-slate-100 transition-colors border border-transparent hover:border-white/[0.06]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-medium">Workflows</span>
          </Link>

          <ChevronRight className="h-3.5 w-3.5 text-slate-600 hidden sm:inline" />

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
                className="rounded-xl bg-[#121624] border border-emerald-500/50 px-3 py-1 text-xs font-semibold text-slate-100 focus:outline-none ring-1 ring-emerald-500/40"
              />
            ) : (
              <div
                onClick={() => {
                  setTitleValue(workflow?.name || 'Untitled Pipeline');
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-2 cursor-pointer rounded-xl px-2 py-1 hover:bg-white/[0.06] transition-colors"
              >
                <h1 className="text-sm font-bold text-slate-100 tracking-tight">
                  {workflow?.name || 'Untitled Pipeline'}
                </h1>
                <Edit2 className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Active / Draft Pill Switch */}
            {workflow && (
              <button
                onClick={handleToggleStatus}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider transition-all border ${
                  workflow.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-[#141824] text-slate-400 border-white/[0.06] hover:bg-white/[0.08]'
                }`}
                title="Toggle Active / Draft"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    workflow.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span>{workflow.status}</span>
              </button>
            )}

            {isDirty ? (
              <span className="flex items-center gap-1.5 text-[10px] text-amber-400 font-medium bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-mono">
                ● Unsaved
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                Saved (Ctrl+S)
              </span>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Webhook Modal Trigger */}
          <button
            onClick={() => setIsWebhookModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border border-white/[0.08]"
            title="Inbound Webhook Trigger URL & curl test"
          >
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden md:inline">Webhook</span>
          </button>

          {/* Export / Import Menu */}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 rounded-xl p-1.5 text-xs text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-colors border border-white/[0.06]"
            title="Export Workflow JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <label
            className="flex items-center gap-1 rounded-xl p-1.5 text-xs text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-colors border border-white/[0.06] cursor-pointer"
            title="Import Workflow JSON"
          >
            <Upload className="h-3.5 w-3.5" />
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          {/* Toggle Node Library */}
          <button
            onClick={onToggleLibrary}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              isLibraryOpen
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-[#121624] border border-white/[0.08] text-slate-200 hover:bg-white/[0.08]'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Node</span>
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              isDirty
                ? 'bg-[#121624] hover:bg-white/[0.08] text-slate-100 border border-white/[0.12] shadow-sm'
                : 'bg-transparent text-slate-600 border border-white/[0.04] cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save</span>
          </button>

          {/* Execute / Run Workflow CTA */}
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold px-4 py-1.5 text-xs shadow-xl shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>Run Workflow</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-slate-950/20 px-1 rounded font-mono">⌘↵</kbd>
          </button>
        </div>
      </header>

      {/* Webhook Details Modal */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0c0e17] p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Inbound Webhook Trigger</h3>
                  <p className="text-[11px] text-slate-400">Trigger this workflow from any external API or webhook</p>
                </div>
              </div>
              <button
                onClick={() => setIsWebhookModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/[0.08] hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  HTTP POST Endpoint URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 rounded-xl bg-[#08090d] border border-white/[0.08] px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      setCopiedWebhook(true);
                      setTimeout(() => setCopiedWebhook(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                  >
                    {copiedWebhook ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedWebhook ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Quick curl Test Command
                </label>
                <div className="relative">
                  <pre className="p-3 rounded-xl bg-[#08090d] border border-white/[0.08] text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {sampleCurl}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sampleCurl);
                      setCopiedCurl(true);
                      setTimeout(() => setCopiedCurl(false), 2000);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-xs transition-colors"
                    title="Copy curl"
                  >
                    {copiedCurl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsWebhookModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

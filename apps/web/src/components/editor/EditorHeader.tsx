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
  ChevronRight,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { workflowApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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
        message: '⚡ Dispatching workflow execution to AutoZure engine...',
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
      <header className="h-14 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
        {/* Left: Breadcrumbs & Workflow Title */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-white rounded-xl">
            <Link href="/" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Workflows</span>
            </Link>
          </Button>

          <ChevronRight className="h-3.5 w-3.5 text-zinc-600 hidden sm:inline" />

          {/* Editable Title */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <Input
                type="text"
                id="workflow-title-input"
                name="workflow-title-input"
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                className="h-8 w-56 bg-zinc-900 border-zinc-700 text-xs font-semibold ring-1 ring-white/60 rounded-xl"
              />
            ) : (
              <div
                onClick={() => {
                  setTitleValue(workflow?.name || 'Untitled Pipeline');
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-2 cursor-pointer rounded-xl px-2 py-1 hover:bg-zinc-900 transition-colors"
              >
                <h1 className="text-sm font-bold text-zinc-100 tracking-tight">
                  {workflow?.name || 'Untitled Pipeline'}
                </h1>
                <Edit2 className="h-3 w-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Active / Draft Pill Switch with shadcn Badge */}
            {workflow && (
              <button
                onClick={handleToggleStatus}
                title="Toggle Active / Draft"
                className="focus:outline-none"
              >
                <Badge
                  variant={workflow.status === 'active' ? 'default' : 'secondary'}
                  className="cursor-pointer gap-1.5 uppercase font-mono text-[10px] py-0 px-2.5"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      workflow.status === 'active' ? 'bg-zinc-950 animate-pulse' : 'bg-zinc-500'
                    }`}
                  />
                  <span>{workflow.status}</span>
                </Badge>
              </button>
            )}

            {isDirty ? (
              <Badge variant="warning" className="font-mono text-[10px] py-0 px-2">
                ● Unsaved
              </Badge>
            ) : (
              <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">
                Saved (Ctrl+S)
              </span>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Webhook Modal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWebhookModalOpen(true)}
            className="rounded-xl text-zinc-300 hover:text-white border-zinc-800 gap-1.5 bg-zinc-900"
            title="Inbound Webhook Trigger URL & curl test"
          >
            <Globe className="h-3.5 w-3.5 text-zinc-300" />
            <span className="hidden md:inline">Webhook</span>
          </Button>

          {/* Export / Import Menu */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleExportJson}
            className="rounded-xl text-zinc-400 hover:text-white"
            title="Export Workflow JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>

          <label
            htmlFor="import-workflow-json"
            className="inline-flex items-center justify-center rounded-xl h-7 w-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Import Workflow JSON"
          >
            <Upload className="h-3.5 w-3.5" />
            <input id="import-workflow-json" name="import-workflow-json" type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          {/* Toggle Node Library */}
          <Button
            variant={isLibraryOpen ? 'secondary' : 'outline'}
            size="sm"
            onClick={onToggleLibrary}
            className={`rounded-xl gap-1.5 transition-all ${
              isLibraryOpen
                ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                : 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:text-white'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Node</span>
          </Button>

          {/* Save button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`rounded-xl gap-1.5 transition-all ${
              isDirty
                ? 'bg-zinc-900 text-white border-zinc-700 shadow-sm hover:bg-zinc-800'
                : 'text-zinc-600 border-zinc-800/40 opacity-50 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save</span>
          </Button>

          {/* Execute / Run Workflow CTA */}
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            className="rounded-xl font-bold gap-2 bg-white hover:bg-zinc-200 text-zinc-950 border border-white shadow-md active:bg-zinc-300"
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>Run Workflow</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-zinc-200 px-1 rounded font-mono text-zinc-800">⌘↵</kbd>
          </Button>
        </div>
      </header>

      {/* Webhook Details Dialog with shadcn Dialog */}
      <Dialog open={isWebhookModalOpen} onOpenChange={setIsWebhookModalOpen}>
        <DialogContent className="max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-zinc-100">Inbound Webhook Trigger</DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Trigger this workflow from any external API or webhook
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                HTTP POST Endpoint URL
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={webhookUrl}
                  className="font-mono text-zinc-100 text-xs bg-zinc-900 border-zinc-800"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    setCopiedWebhook(true);
                    setTimeout(() => setCopiedWebhook(false), 2000);
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 gap-1.5"
                >
                  {copiedWebhook ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedWebhook ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                Quick curl Test Command
              </label>
              <div className="relative">
                <pre className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                  {sampleCurl}
                </pre>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(sampleCurl);
                    setCopiedCurl(true);
                    setTimeout(() => setCopiedCurl(false), 2000);
                  }}
                  className="absolute top-2 right-2 text-zinc-400 hover:text-white"
                  title="Copy curl"
                >
                  {copiedCurl ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="secondary"
              onClick={() => setIsWebhookModalOpen(false)}
              className="text-xs font-semibold rounded-xl"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

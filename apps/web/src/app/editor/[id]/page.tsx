'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { workflowApi } from '@/lib/api';
import { useWorkflowStore } from '@/store/workflowStore';
import { WorkflowCanvas } from '@/components/editor/WorkflowCanvas';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { NodeLibraryDrawer } from '@/components/editor/NodeLibraryDrawer';
import { NodeConfigDrawer } from '@/components/editor/NodeConfigDrawer';
import { ExecutionStatusPanel } from '@/components/editor/ExecutionStatusPanel';
import { Loader2, AlertCircle } from 'lucide-react';

export default function WorkflowEditorPage() {
  const params = useParams();
  const workflowId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const setWorkflow = useWorkflowStore((s) => s.setWorkflow);
  const setNodeDefinitions = useWorkflowStore((s) => s.setNodeDefinitions);

  useEffect(() => {
    async function loadEditorData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch workflow and available node types in parallel
        const [wf, nodeDefs] = await Promise.all([
          workflowApi.get(workflowId),
          workflowApi.getNodeDefinitions(),
        ]);

        setWorkflow(wf);
        setNodeDefinitions(nodeDefs);
      } catch (err: any) {
        console.error('Failed to load workflow:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load workflow');
      } finally {
        setIsLoading(false);
      }
    }

    if (workflowId) {
      loadEditorData();
    }
  }, [workflowId, setWorkflow, setNodeDefinitions]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-xs text-slate-400">Loading workflow editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="max-w-md rounded-xl border border-rose-800/80 bg-rose-950/20 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-rose-300">Failed to load workflow</h2>
          <p className="mt-1 text-xs text-slate-400">{error}</p>
          <a
            href="/"
            className="mt-4 inline-block rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Editor Top Bar */}
      <EditorHeader
        onToggleLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
        isLibraryOpen={isLibraryOpen}
      />

      {/* Main Canvas Area */}
      <div className="relative flex-1">
        <WorkflowCanvas />

        {/* Node Library Drawer (Left) */}
        <NodeLibraryDrawer
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
        />

        {/* Node Config Drawer (Right) */}
        <NodeConfigDrawer />

        {/* Execution Log / Status Console (Bottom) */}
        <ExecutionStatusPanel />
      </div>
    </div>
  );
}

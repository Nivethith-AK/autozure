'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
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

        // If navigated to /editor/new, create a default blank pipeline and redirect
        if (workflowId === 'new') {
          const [newWf, nodeDefs] = await Promise.all([
            workflowApi.create({
              name: 'Untitled Pipeline',
              description: 'Created with FlowForge visual engine',
              graph: {
                nodes: [
                  {
                    id: 'node-trigger-1',
                    type: 'trigger.manual',
                    position: { x: 140, y: 160 },
                    data: {
                      type: 'trigger.manual',
                      label: 'Manual Trigger',
                      parameters: { data: '{}' },
                    },
                  },
                ],
                edges: [],
              },
            }),
            workflowApi.getNodeDefinitions(),
          ]);

          setWorkflow(newWf);
          setNodeDefinitions(nodeDefs);
          router.replace(`/editor/${newWf.id}`);
          return;
        }

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
  }, [workflowId, router, setWorkflow, setNodeDefinitions]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-xs text-zinc-400 font-mono">Initializing FlowForge editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="max-w-md rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-zinc-100">Failed to load workflow</h2>
          <p className="mt-1 text-xs text-zinc-400">{error}</p>
          <a
            href="/"
            className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
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

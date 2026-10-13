'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { CustomNode } from './CustomNode';
import {
  Maximize2,
  Grid,
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  RotateCcw,
} from 'lucide-react';

function CanvasInner() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const setNodes = useWorkflowStore((s) => s.setNodes);
  const addNode = useWorkflowStore((s) => s.addNode);

  const [bgVariant, setBgVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
  const [showMiniMap, setShowMiniMap] = useState(true);

  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Drag and drop handler from node library drawer
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/flowforge-nodetype');
      if (!nodeType) return;

      let position = { x: 250, y: 200 };
      if (typeof screenToFlowPosition === 'function') {
        position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
      }

      addNode(nodeType, position);
    },
    [screenToFlowPosition, addNode]
  );

  // Smart Auto-Align layout (DAG positioning)
  const handleAutoAlign = useCallback(() => {
    if (nodes.length === 0) return;

    // Simple layered DAG layout:
    // 1. Calculate in-degrees
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });

    edges.forEach((e) => {
      if (inDegree[e.target] !== undefined) inDegree[e.target]++;
      if (adj[e.source]) adj[e.source].push(e.target);
    });

    // Layer assignment
    const queue: { id: string; layer: number }[] = [];
    nodes.forEach((n) => {
      if (inDegree[n.id] === 0) queue.push({ id: n.id, layer: 0 });
    });

    const layerMap: Record<string, number> = {};
    while (queue.length > 0) {
      const { id, layer } = queue.shift()!;
      layerMap[id] = Math.max(layerMap[id] || 0, layer);

      (adj[id] || []).forEach((nextId) => {
        queue.push({ id: nextId, layer: layer + 1 });
      });
    }

    // Group by layer
    const layers: Record<number, string[]> = {};
    nodes.forEach((n) => {
      const l = layerMap[n.id] || 0;
      if (!layers[l]) layers[l] = [];
      layers[l].push(n.id);
    });

    // Position coordinates
    const updatedNodes = nodes.map((node) => {
      const l = layerMap[node.id] || 0;
      const indexInLayer = layers[l].indexOf(node.id);
      const x = 120 + l * 340;
      const y = 140 + indexInLayer * 160;

      return {
        ...node,
        position: { x, y },
      };
    });

    setNodes(updatedNodes);
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
  }, [nodes, edges, setNodes, fitView]);

  return (
    <div className="relative h-full w-full bg-[#09090b] overflow-hidden">
      {/* Background vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,9,11,0.85)_100%)]" />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        onPaneClick={() => selectNode(null)}
        fitView
        className="touch-none select-none"
      >
        <Background
          variant={bgVariant}
          gap={20}
          size={1.5}
          color="#27272a"
          className="bg-[#09090b]"
        />

        {showMiniMap && (
          <MiniMap
            nodeColor={() => '#52525b'}
            maskColor="rgba(9, 9, 11, 0.88)"
            className="!bottom-16 !right-6 !m-0 !w-44 !h-32 border border-zinc-800"
          />
        )}
      </ReactFlow>

      {/* Floating Canvas Controls HUD */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1.5 rounded-2xl shadow-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
        <button
          onClick={handleAutoAlign}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 transition-all hover:scale-[1.02] shadow-sm"
          title="Auto-organize workflow layout"
        >
          <Layers className="h-3.5 w-3.5 text-zinc-300" />
          <span>Auto-Align</span>
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        <button
          onClick={() => zoomIn({ duration: 200 })}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <button
          onClick={() => zoomOut({ duration: 200 })}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <button
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Fit Canvas"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        <button
          onClick={() =>
            setBgVariant((curr) =>
              curr === BackgroundVariant.Dots
                ? BackgroundVariant.Lines
                : curr === BackgroundVariant.Lines
                ? BackgroundVariant.Cross
                : BackgroundVariant.Dots
            )
          }
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Cycle Grid Style"
        >
          <Grid className="h-4 w-4" />
        </button>

        <button
          onClick={() => setShowMiniMap((v) => !v)}
          className={`p-2 rounded-xl transition-colors ${
            showMiniMap
              ? 'text-white bg-zinc-900'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          title="Toggle MiniMap"
        >
          <Compass className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Play,
  Globe,
  Clock,
  Sparkles,
  Zap,
  Brain,
  Code2,
  GitBranch,
  Shuffle,
  Timer,
  Variable,
  Merge,
  Bug,
  Box,
  Plus,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { NodeDefinitionMeta } from '@flowforge/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Play,
  Globe,
  Clock,
  Sparkles,
  Zap,
  Brain,
  Code2,
  GitBranch,
  Shuffle,
  Timer,
  Variable,
  Merge,
  Bug,
  Box,
};

interface NodeLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NodeLibraryDrawer({ isOpen, onClose }: NodeLibraryDrawerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const nodeDefinitions = useWorkflowStore((s) => s.nodeDefinitions);
  const addNode = useWorkflowStore((s) => s.addNode);

  const categories = useMemo(() => {
    const cats = new Set(nodeDefinitions.map((n) => n.category));
    return ['all', ...Array.from(cats)];
  }, [nodeDefinitions]);

  const filteredNodes = useMemo(() => {
    return nodeDefinitions.filter((n) => {
      const matchesSearch =
        n.label.toLowerCase().includes(search.toLowerCase()) ||
        n.description.toLowerCase().includes(search.toLowerCase()) ||
        n.type.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'all' || n.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [nodeDefinitions, search, selectedCategory]);

  const handleAddNode = (nodeType: string) => {
    // Add near center of canvas
    addNode(nodeType, { x: 250 + Math.random() * 50, y: 150 + Math.random() * 50 });
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-14 bottom-0 z-30 w-80 border-r border-slate-800 bg-slate-950/95 backdrop-blur-md flex flex-col shadow-2xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Nodes Library</h2>
          <p className="text-xs text-slate-400">Click or drag a node to add it</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredNodes.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No nodes found matching &ldquo;{search}&rdquo;
          </div>
        ) : (
          filteredNodes.map((node: NodeDefinitionMeta) => {
            const Icon = ICON_MAP[node.icon] || Box;
            return (
              <div
                key={node.type}
                onClick={() => handleAddNode(node.type)}
                className="group relative flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm"
                  style={{ backgroundColor: `${node.color || '#3b82f6'}22`, color: node.color || '#3b82f6' }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-100 truncate">{node.label}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {node.category}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>
                </div>

                <button
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 rounded-md p-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md"
                  title="Add to canvas"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

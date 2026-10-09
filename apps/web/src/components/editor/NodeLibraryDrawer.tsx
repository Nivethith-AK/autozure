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
  MessageSquare,
  Radio,
  Send,
  Mail,
  PhoneCall,
  Github,
  Gitlab,
  Layers,
  BookOpen,
  Table,
  FileSpreadsheet,
  Database,
  HardDrive,
  Cpu,
  Binary,
  Shield,
  FileCode,
  Repeat,
  CreditCard,
  ShoppingBag,
  DollarSign,
  Contact,
  Cloud,
  CheckSquare,
  CheckCircle,
  Calendar,
  Folder,
  Filter,
  Calculator,
  Terminal,
  Activity,
  Server,
  Key,
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
  MessageSquare,
  Radio,
  Send,
  Mail,
  PhoneCall,
  Github,
  Gitlab,
  Layers,
  BookOpen,
  Table,
  FileSpreadsheet,
  Database,
  HardDrive,
  Cpu,
  Binary,
  Shield,
  FileCode,
  Repeat,
  CreditCard,
  ShoppingBag,
  DollarSign,
  Contact,
  Cloud,
  CheckSquare,
  CheckCircle,
  Calendar,
  Folder,
  Filter,
  Calculator,
  Terminal,
  Activity,
  Server,
  Key,
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
    addNode(nodeType, {
      x: 320 + (Math.random() * 60 - 30),
      y: 200 + (Math.random() * 60 - 30),
    });
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-14 bottom-0 z-30 w-84 sm:w-96 border-r border-white/[0.08] bg-[#0a0c14]/95 backdrop-blur-2xl flex flex-col shadow-2xl transition-all select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-[#0f121d]/70">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>Integration Registry</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              {nodeDefinitions.length} nodes
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Triggers, AI models, connectors & logic actions</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-slate-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-white/[0.06] bg-[#080a11]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search triggers, AI, databases, commerce..."
            className="w-full rounded-xl bg-[#121624] border border-white/[0.08] pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'bg-[#121624] text-slate-400 hover:text-slate-200 border border-white/[0.04]'
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
          <div className="text-center py-14 text-xs text-slate-500">
            No integration nodes found matching &ldquo;{search}&rdquo;
          </div>
        ) : (
          filteredNodes.map((node: NodeDefinitionMeta) => {
            const Icon = ICON_MAP[node.icon] || Box;
            return (
              <div
                key={node.type}
                onClick={() => handleAddNode(node.type)}
                className="group relative flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[#0e111a]/70 p-3 hover:border-emerald-500/50 hover:bg-[#121624] cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-950/20"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${node.color || '#3b82f6'}18`,
                    color: node.color || '#3b82f6',
                    border: `1px solid ${node.color || '#3b82f6'}35`,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
                      {node.label}
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-[#181d2e] text-slate-400">
                      {node.category}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>
                </div>

                <button
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 rounded-lg p-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md font-bold"
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

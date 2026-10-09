'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Play,
  Globe,
  Clock,
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
import { NodeIcon } from '@/components/icons/NodeIcon';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const ICON_MAP: Record<string, React.ElementType> = {
  Play,
  Globe,
  Clock,
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
  const nodeDefinitions = useWorkflowStore((s) => s.nodeDefinitions);
  const addNode = useWorkflowStore((s) => s.addNode);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    <aside className="fixed left-0 top-14 bottom-0 z-30 w-84 sm:w-96 border-r border-border bg-[#0a0c14]/95 backdrop-blur-2xl flex flex-col shadow-2xl transition-all select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-[#0f121d]/70">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>Integration Registry</span>
            <Badge variant="default" className="text-[10px] font-mono px-2 py-0">
              {nodeDefinitions.length} nodes
            </Badge>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Triggers, AI models, connectors & logic actions</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-slate-400 hover:text-white rounded-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-border bg-[#080a11]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search triggers, AI, databases, commerce..."
            className="pl-9 h-9 bg-card border-border text-xs rounded-xl"
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
                  : 'bg-card text-muted-foreground hover:text-slate-200 border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Node list inside ScrollArea */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2 pr-2 pb-4">
          {filteredNodes.length === 0 ? (
            <div className="text-center py-14 text-xs text-muted-foreground">
              No integration nodes found matching &ldquo;{search}&rdquo;
            </div>
          ) : (
            filteredNodes.map((node: NodeDefinitionMeta) => {
              return (
                <div
                  key={node.type}
                  onClick={() => handleAddNode(node.type)}
                  className="group relative flex items-start gap-3 rounded-2xl border border-border bg-card/70 p-3 hover:border-emerald-500/50 hover:bg-[#121624] cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-950/20"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${node.color || '#3b82f6'}18`,
                      color: node.color || '#3b82f6',
                      border: `1px solid ${node.color || '#3b82f6'}35`,
                    }}
                  >
                    <NodeIcon nodeType={node.type} iconName={node.icon} className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
                        {node.label}
                      </span>
                      <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0 font-mono font-bold">
                        {node.category}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
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
      </ScrollArea>
    </aside>
  );
}

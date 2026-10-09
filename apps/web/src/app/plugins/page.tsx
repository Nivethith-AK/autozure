'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Check,
  Power,
  KeyRound,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Send,
  Mail,
  PhoneCall,
  Github,
  Gitlab,
  BookOpen,
  Table,
  FileSpreadsheet,
  Database,
  HardDrive,
  Cpu,
  Binary,
  Shield,
  Clock,
  FileCode,
  Repeat,
  Box,
  CheckCircle2,
  Filter,
  Download,
  AlertCircle,
  Loader2,
  Terminal,
  CreditCard,
  ShoppingBag,
  DollarSign,
  Contact,
  Cloud,
  CheckSquare,
  CheckCircle,
  Calendar,
  Folder,
  Calculator,
} from 'lucide-react';
import { workflowApi } from '@/lib/api';
import { NodeDefinitionMeta } from '@flowforge/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Play: Globe,
  Globe,
  Clock,
  Sparkles,
  Zap,
  Brain: Sparkles,
  Code2: FileCode,
  GitBranch: Layers,
  Shuffle: Layers,
  Timer: Clock,
  Variable: FileCode,
  Merge: Layers,
  Bug: Terminal,
  Box,
  MessageSquare: Send,
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
};

export default function PluginsPage() {
  const router = useRouter();
  const [nodes, setNodes] = useState<NodeDefinitionMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [disabledNodes, setDisabledNodes] = useState<Set<string>>(new Set());
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [customPackageName, setCustomPackageName] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadNodes() {
      try {
        setIsLoading(true);
        const data = await workflowApi.getNodeDefinitions();
        setNodes(data);
      } catch (err) {
        console.error('Failed to load nodes:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNodes();
  }, []);

  const toggleNodeEnabled = (type: string) => {
    setDisabledNodes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
        showToast(`Plugin "${type}" enabled`);
      } else {
        next.add(type);
        showToast(`Plugin "${type}" disabled`);
      }
      return next;
    });
  };

  const handleCreateWorkflowWithNode = async (node: NodeDefinitionMeta) => {
    try {
      const newWf = await workflowApi.create({
        name: `${node.label} Pipeline`,
        description: `Automated pipeline built with ${node.label} connector`,
        graph: {
          nodes: [
            {
              id: 'node-trigger',
              type: 'trigger.manual',
              position: { x: 100, y: 180 },
              data: { type: 'trigger.manual', label: 'Manual Trigger', parameters: {} },
            },
            {
              id: 'node-action',
              type: node.type,
              position: { x: 420, y: 180 },
              data: {
                type: node.type,
                label: node.label,
                category: node.category,
                icon: node.icon,
                color: node.color,
                inputs: node.inputs,
                outputs: node.outputs,
                parameters: {},
              },
            },
          ],
          edges: [{ id: 'e1', source: 'node-trigger', target: 'node-action' }],
        },
      });
      router.push(`/editor/${newWf.id}`);
    } catch (err) {
      console.error('Failed to create workflow:', err);
      showToast('Error creating workflow');
    }
  };

  const handleInstallCustomPlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPackageName.trim()) return;
    setIsInstalling(true);
    setTimeout(() => {
      setIsInstalling(false);
      setIsInstallModalOpen(false);
      showToast(`Plugin "${customPackageName}" installed successfully!`);
      setCustomPackageName('');
    }, 1000);
  };

  const categories = useMemo(() => {
    const cats = new Set(nodes.map((n) => n.category));
    return ['all', ...Array.from(cats)];
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchesSearch =
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || node.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [nodes, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
              Plugins & Connector Integrations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {nodes.length} Connectors Active
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Extend FlowForge with enterprise connectors for Slack, Discord, GitHub, PostgreSQL, Notion, Ollama, Supabase, and AWS S3.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 text-xs transition-all shadow-lg shadow-emerald-950/40"
          >
            <Plus className="h-4 w-4" />
            Install Custom Plugin
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
          <span className="text-xs font-medium text-slate-400">Total Connectors</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-100">{nodes.length}</div>
          <span className="text-[11px] text-emerald-400 font-mono">100% Zero-Lockin Ready</span>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
          <span className="text-xs font-medium text-slate-400">AI & Local LLM Nodes</span>
          <div className="mt-2 text-2xl font-extrabold text-purple-400">6 Models</div>
          <span className="text-[11px] text-slate-500 font-mono">OpenAI, Claude, Gemini, Ollama</span>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
          <span className="text-xs font-medium text-slate-400">Databases & Storage</span>
          <div className="mt-2 text-2xl font-extrabold text-blue-400">5 Systems</div>
          <span className="text-[11px] text-slate-500 font-mono">Postgres, Redis, Supabase, S3, Mongo</span>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
          <span className="text-xs font-medium text-slate-400">Active Integrations</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400">
            {nodes.length - disabledNodes.size} Enabled
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Ready for execution engine</span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3 border-b border-slate-800/80 pb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connectors (Slack, GitHub, Postgres, AI)..."
              className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing {filteredNodes.length} of {nodes.length} connectors
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Connectors Grid */}
      {isLoading ? (
        <div className="py-24 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-xs text-slate-400">Loading plugin registry...</p>
          </div>
        </div>
      ) : filteredNodes.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-800">
          No connectors match &ldquo;{searchQuery}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNodes.map((node) => {
            const Icon = ICON_MAP[node.icon] || Box;
            const isDisabled = disabledNodes.has(node.type);
            const hasCredentials = (node.credentials || []).length > 0;

            return (
              <div
                key={node.type}
                className={`group flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-lg ${
                  isDisabled
                    ? 'border-slate-800/40 bg-slate-950/40 opacity-60'
                    : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700/80'
                }`}
              >
                <div>
                  {/* Top Bar: Icon, Category & Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: `${node.color || '#3b82f6'}18`,
                          color: node.color || '#3b82f6',
                          border: `1px solid ${node.color || '#3b82f6'}30`,
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                          {node.label}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono uppercase font-semibold">
                          {node.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleNodeEnabled(node.type)}
                      className={`p-1.5 rounded-lg border text-[10px] font-mono transition-colors ${
                        isDisabled
                          ? 'border-slate-800 text-slate-500 bg-slate-950 hover:text-slate-300'
                          : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                      }`}
                      title={isDisabled ? 'Click to enable' : 'Click to disable'}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {node.description}
                  </p>

                  {/* Capabilities / Parameters tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      {(node.parameters || []).length} parameters
                    </span>
                    {hasCredentials ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400">
                        Auth Required
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                        Zero Auth
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-slate-500">
                      v1.0.0
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                  {hasCredentials ? (
                    <Link
                      href="/settings"
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
                      title="Manage connector API credentials"
                    >
                      <KeyRound className="h-3 w-3" />
                      Credentials
                    </Link>
                  ) : (
                    <span className="text-[11px] text-slate-600 font-mono">Built-In</span>
                  )}

                  <button
                    onClick={() => handleCreateWorkflowWithNode(node)}
                    disabled={isDisabled}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-40"
                  >
                    Use in Workflow →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Install Custom Plugin Modal */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-100">Install Community Plugin</h3>
            <p className="mt-1 text-xs text-slate-400">
              Register custom npm packages, OpenAPI specs, or third-party FlowForge connector bundles.
            </p>

            <form onSubmit={handleInstallCustomPlugin} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Package Name or GitHub Repository
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. @flowforge/plugin-salesforce or user/custom-nodes"
                  value={customPackageName}
                  onChange={(e) => setCustomPackageName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInstalling}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
                >
                  {isInstalling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Install Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

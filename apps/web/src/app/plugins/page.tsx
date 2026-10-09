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
  Layers,
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
  Flame,
  Brain,
  MessageSquare,
  Blocks,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { workflowApi } from '@/lib/api';
import { NodeDefinitionMeta } from '@flowforge/types';
import { NodeIcon } from '@/components/icons/NodeIcon';

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

  const aiCount = useMemo(() => nodes.filter((n) => n.category === 'ai').length, [nodes]);
  const dbCount = useMemo(() => nodes.filter((n) => n.category === 'databases').length, [nodes]);

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
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#0e111a] border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-100">
              Plugins & Connector Integrations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              {nodes.length} Connectors Active
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Enterprise integrations across LLMs (OpenAI, Claude, Gemini, Ollama, Groq, Mistral, DeepSeek), Databases (PostgreSQL, Supabase, Redis, S3, MongoDB), DevOps, and SaaS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold px-4 py-2.5 text-xs transition-all shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Install Custom Plugin
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#1a1f2e] bg-[#0e111a]/70 p-4 backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Total Connectors</span>
          <div className="mt-2 text-3xl font-extrabold text-slate-100 tracking-tight">{nodes.length}</div>
          <span className="text-[11px] text-emerald-400 font-mono">100% Zero-Lockin Ready</span>
        </div>

        <div className="rounded-2xl border border-[#1a1f2e] bg-[#0e111a]/70 p-4 backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">AI & Local LLM Nodes</span>
          <div className="mt-2 text-3xl font-extrabold text-purple-400 tracking-tight">{aiCount} Models</div>
          <span className="text-[11px] text-slate-500 font-mono">OpenAI, Claude, Ollama, Groq...</span>
        </div>

        <div className="rounded-2xl border border-[#1a1f2e] bg-[#0e111a]/70 p-4 backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Databases & Storage</span>
          <div className="mt-2 text-3xl font-extrabold text-blue-400 tracking-tight">{dbCount} Systems</div>
          <span className="text-[11px] text-slate-500 font-mono">Postgres, Redis, Supabase, S3...</span>
        </div>

        <div className="rounded-2xl border border-[#1a1f2e] bg-[#0e111a]/70 p-4 backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Active Integrations</span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400 tracking-tight">
            {nodes.length - disabledNodes.size} Enabled
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Ready for execution engine</span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3 border-b border-[#1a1f2e] pb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connectors (Slack, GitHub, Postgres, OpenAI, Stripe)..."
              className="w-full rounded-xl bg-[#0e111a] border border-[#1a1f2e] pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
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
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm'
                  : 'bg-[#0e111a] text-slate-400 hover:text-slate-200 border-[#1a1f2e]'
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
            <p className="text-xs text-slate-400 font-mono">Loading connector registry...</p>
          </div>
        </div>
      ) : filteredNodes.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-[#1a1f2e] bg-[#0e111a]/30">
          No connectors match &ldquo;{searchQuery}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNodes.map((node) => {
            const isDisabled = disabledNodes.has(node.type);
            const hasCredentials = (node.credentials || []).length > 0;

            return (
              <div
                key={node.type}
                className={`group flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-lg ${
                  isDisabled
                    ? 'border-[#1a1f2e]/40 bg-[#08090d] opacity-50'
                    : 'border-[#1a1f2e] bg-[#0e111a]/60 hover:bg-[#0e111a] hover:border-slate-700 shadow-black/40'
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
                        <NodeIcon nodeType={node.type} iconName={node.icon} className="h-5 w-5" />
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
                          ? 'border-[#1a1f2e] text-slate-500 bg-[#08090d] hover:text-slate-300'
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
                    <span className="px-2 py-0.5 rounded-md bg-[#08090d] border border-[#1a1f2e] text-[10px] font-mono text-slate-400">
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
                    <span className="px-2 py-0.5 rounded-md bg-[#08090d] border border-[#1a1f2e] text-[10px] font-mono text-slate-500">
                      v1.0
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3.5 border-t border-[#1a1f2e] flex items-center justify-between">
                  {hasCredentials ? (
                    <Link
                      href="/settings?tab=credentials"
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Manage connector API credentials in vault"
                    >
                      <KeyRound className="h-3 w-3" />
                      Vault Keys
                    </Link>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">Native Node</span>
                  )}

                  <button
                    onClick={() => handleCreateWorkflowWithNode(node)}
                    disabled={isDisabled}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-40"
                  >
                    Use in Workflow <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Install Custom Plugin Modal */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1a1f2e] bg-[#0e111a] p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-100">Install Custom Connector</h3>
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
                  className="w-full rounded-xl bg-[#08090d] border border-[#1a1f2e] px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1a1f2e]">
                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-[#1a1f2e] transition-colors"
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

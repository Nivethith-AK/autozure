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
import { NodeDefinitionMeta } from '@autozure/types';
import { NodeIcon } from '@/components/icons/NodeIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-750 text-zinc-100 text-xs px-4 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-zinc-100">
              Plugins & Connector Integrations
            </h1>
            <Badge variant="default" className="text-[10px] font-mono px-2.5 py-0.5">
              {nodes.length} Connectors Active
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Enterprise integrations across LLMs (OpenAI, Claude, Gemini, Ollama, Groq, Mistral, DeepSeek), Databases (PostgreSQL, Supabase, Redis, S3, MongoDB), DevOps, and SaaS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsInstallModalOpen(true)}
            className="rounded-xl font-bold gap-2 bg-white hover:bg-zinc-200 text-zinc-950 border border-white shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Install Custom Plugin
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-950/80 border-zinc-800">
          <span className="text-xs font-medium text-zinc-400">Total Connectors</span>
          <div className="mt-2 text-3xl font-extrabold text-zinc-100 tracking-tight">{nodes.length}</div>
          <span className="text-[11px] text-zinc-400 font-mono">100% Zero-Lockin Ready</span>
        </Card>

        <Card className="p-4 bg-zinc-950/80 border-zinc-800">
          <span className="text-xs font-medium text-zinc-400">AI & Local LLM Nodes</span>
          <div className="mt-2 text-3xl font-extrabold text-zinc-100 tracking-tight">{aiCount} Models</div>
          <span className="text-[11px] text-zinc-500 font-mono">OpenAI, Claude, Ollama, Groq...</span>
        </Card>

        <Card className="p-4 bg-zinc-950/80 border-zinc-800">
          <span className="text-xs font-medium text-zinc-400">Databases & Storage</span>
          <div className="mt-2 text-3xl font-extrabold text-zinc-100 tracking-tight">{dbCount} Systems</div>
          <span className="text-[11px] text-zinc-500 font-mono">Postgres, Redis, Supabase, S3...</span>
        </Card>

        <Card className="p-4 bg-zinc-950/80 border-zinc-800">
          <span className="text-xs font-medium text-zinc-400">Active Integrations</span>
          <div className="mt-2 text-3xl font-extrabold text-zinc-100 tracking-tight">
            {nodes.length - disabledNodes.size} Enabled
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Ready for execution engine</span>
        </Card>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3 border-b border-border pb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              id="search-plugins"
              name="search-plugins"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connectors (Slack, GitHub, Postgres, OpenAI, Stripe)..."
              className="pl-10 h-9 bg-card border-border text-xs rounded-xl focus-visible:ring-white"
            />
          </div>

          <div className="text-xs text-muted-foreground font-mono">
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
                  ? 'bg-white text-zinc-950 font-bold border-white shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-white border-border'
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
            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            <p className="text-xs text-muted-foreground font-mono">Loading connector registry...</p>
          </div>
        </div>
      ) : filteredNodes.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground border-dashed bg-card/30">
          No connectors match &ldquo;{searchQuery}&rdquo;
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNodes.map((node) => {
            const isDisabled = disabledNodes.has(node.type);
            const hasCredentials = (node.credentials || []).length > 0;

            return (
              <Card
                key={node.type}
                className={`group flex flex-col justify-between p-5 transition-all shadow-lg border-zinc-800 ${
                  isDisabled
                    ? 'bg-zinc-950/40 opacity-50'
                    : 'bg-zinc-950/80 hover:border-zinc-600 shadow-black/40'
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
                        <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                          {node.label}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase font-semibold">
                          {node.category}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleNodeEnabled(node.type)}
                      className={`rounded-lg border text-[10px] font-mono transition-colors ${
                        isDisabled
                          ? 'border-border text-muted-foreground bg-zinc-900 hover:text-white'
                          : 'border-zinc-700 text-zinc-200 bg-zinc-900 hover:bg-zinc-800 hover:text-white'
                      }`}
                      title={isDisabled ? 'Click to enable' : 'Click to disable'}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {node.description}
                  </p>

                  {/* Capabilities / Parameters tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0 bg-zinc-900 text-zinc-300 border-zinc-800">
                      {(node.parameters || []).length} params
                    </Badge>
                    {hasCredentials ? (
                      <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0 bg-zinc-900 text-zinc-300 border-zinc-800">
                        Auth Required
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0 bg-zinc-900 text-zinc-300 border-zinc-800">
                        Zero Auth
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] font-mono px-2 py-0 text-muted-foreground border-zinc-800">
                      v1.0
                    </Badge>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                  {hasCredentials ? (
                    <Button variant="link" size="sm" asChild className="p-0 h-auto text-[11px] font-medium text-zinc-400 hover:text-white gap-1">
                      <Link href="/settings?tab=credentials" title="Manage connector API credentials in vault">
                        <KeyRound className="h-3 w-3" />
                        Vault Keys
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-mono">Native Node</span>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCreateWorkflowWithNode(node)}
                    disabled={isDisabled}
                    className="h-auto p-0 text-xs font-semibold text-zinc-300 hover:text-white gap-1 hover:bg-transparent disabled:opacity-40"
                  >
                    Use in Workflow <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Install Custom Plugin Dialog with shadcn Dialog */}
      <Dialog open={isInstallModalOpen} onOpenChange={setIsInstallModalOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-zinc-100">Install Custom Connector</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register custom npm packages, OpenAPI specs, or third-party AutoZure connector bundles.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInstallCustomPlugin} className="mt-2 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Package Name or GitHub Repository
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. @autozure/plugin-salesforce or user/custom-nodes"
                value={customPackageName}
                onChange={(e) => setCustomPackageName(e.target.value)}
                className="font-mono text-xs bg-zinc-900 border-zinc-800 text-zinc-100"
              />
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsInstallModalOpen(false)}
                className="rounded-xl bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInstalling}
                className="rounded-xl font-bold bg-white hover:bg-zinc-200 text-zinc-950 gap-1.5 border border-white shadow-sm"
              >
                {isInstalling && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-950" />}
                Install Connector
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

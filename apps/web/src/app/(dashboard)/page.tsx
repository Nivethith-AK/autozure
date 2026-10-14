'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  GitFork,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Loader2,
  Zap,
  Search,
  Copy,
  Trash2,
  Power,
  ArrowRight,
  Server,
  Layers,
  Flame,
  Check,
  AlertTriangle,
  Cpu,
  Github,
  CreditCard,
  Contact,
  ShieldCheck,
} from 'lucide-react';
import { workflowApi, executionApi } from '@/lib/api';
import { Workflow, WorkflowGraph } from '@autozure/types';
import { OpenAIIcon } from '@/components/icons/NodeIcon';
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

interface StarterTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  graph: WorkflowGraph;
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'ai-synthesizer',
    title: 'AI Content Synthesizer',
    description: 'Transform user inputs with GPT-4o Mini, format the schema, and log structured data.',
    icon: OpenAIIcon,
    badge: 'AI & Data',
    badgeColor: 'text-zinc-300 bg-zinc-900 border-zinc-800',
    graph: {
      nodes: [
        {
          id: 'node-trigger',
          type: 'trigger.manual',
          position: { x: 80, y: 160 },
          data: {
            type: 'trigger.manual',
            label: 'Manual Trigger',
            parameters: { data: '{"topic": "Autonomous AI Multi-Agent Systems in 2026"}' },
          },
        },
        {
          id: 'node-ai',
          type: 'ai.openai',
          position: { x: 380, y: 160 },
          data: {
            type: 'ai.openai',
            label: 'OpenAI Synthesis',
            parameters: {
              model: 'gpt-4o-mini',
              systemPrompt: 'You are an executive research analyst. Provide a 3-bullet concise summary.',
              userPrompt: 'Analyze this topic: {{input.topic}}',
            },
          },
        },
        {
          id: 'node-transform',
          type: 'data.transform',
          position: { x: 680, y: 160 },
          data: {
            type: 'data.transform',
            label: 'Format Summary',
            parameters: {
              mode: 'map',
              mapping: '{"summary": "content", "model": "model"}',
            },
          },
        },
        {
          id: 'node-debug',
          type: 'util.debug',
          position: { x: 980, y: 160 },
          data: {
            type: 'util.debug',
            label: 'Output Inspector',
            parameters: { label: 'Final AI Summary' },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'node-trigger', target: 'node-ai' },
        { id: 'e2', source: 'node-ai', target: 'node-transform' },
        { id: 'e3', source: 'node-transform', target: 'node-debug' },
      ],
    },
  },
  {
    id: 'webhook-router',
    title: 'Webhook Event Dispatcher',
    description: 'Accept incoming webhooks, inspect conditional priority, and route to external services.',
    icon: Zap,
    badge: 'Integration',
    badgeColor: 'text-zinc-300 bg-zinc-900 border-zinc-800',
    graph: {
      nodes: [
        {
          id: 'node-webhook',
          type: 'trigger.webhook',
          position: { x: 80, y: 160 },
          data: {
            type: 'trigger.webhook',
            label: 'Webhook Ingestion',
            parameters: { method: 'POST', response: 'immediate' },
          },
        },
        {
          id: 'node-condition',
          type: 'logic.condition',
          position: { x: 380, y: 160 },
          data: {
            type: 'logic.condition',
            label: 'Check Priority',
            parameters: { field: 'body.priority', operator: 'equals', value: 'high' },
          },
        },
        {
          id: 'node-http',
          type: 'action.http',
          position: { x: 680, y: 80 },
          data: {
            type: 'action.http',
            label: 'Dispatch High-Priority Alert',
            parameters: {
              method: 'POST',
              url: 'https://httpbin.org/post',
              body: '{"alert": "High priority incident received"}',
            },
          },
        },
        {
          id: 'node-debug',
          type: 'util.debug',
          position: { x: 680, y: 260 },
          data: {
            type: 'util.debug',
            label: 'Log Standard Event',
            parameters: { label: 'Standard Priority Webhook' },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'node-webhook', target: 'node-condition' },
        { id: 'e2', source: 'node-condition', target: 'node-http', sourceHandle: 'true' },
        { id: 'e3', source: 'node-condition', target: 'node-debug', sourceHandle: 'false' },
      ],
    },
  },
  {
    id: 'health-poller',
    title: 'Automated Health Poller',
    description: 'Poll an endpoint on a schedule, set runtime status flags, and record uptime telemetry.',
    icon: Server,
    badge: 'Reliability',
    badgeColor: 'text-zinc-300 bg-zinc-900 border-zinc-800',
    graph: {
      nodes: [
        {
          id: 'node-schedule',
          type: 'trigger.schedule',
          position: { x: 80, y: 160 },
          data: {
            type: 'trigger.schedule',
            label: '15-Minute Cron',
            parameters: { cron: '*/15 * * * *', timezone: 'UTC' },
          },
        },
        {
          id: 'node-http',
          type: 'action.http',
          position: { x: 380, y: 160 },
          data: {
            type: 'action.http',
            label: 'Probe Endpoint',
            parameters: { method: 'GET', url: 'https://httpbin.org/status/200' },
          },
        },
        {
          id: 'node-setvar',
          type: 'data.setVariable',
          position: { x: 680, y: 160 },
          data: {
            type: 'data.setVariable',
            label: 'Set Telemetry State',
            parameters: { assignments: '{"status": "UP", "checked": true}', keepOriginal: true },
          },
        },
        {
          id: 'node-debug',
          type: 'util.debug',
          position: { x: 980, y: 160 },
          data: {
            type: 'util.debug',
            label: 'Audit Logger',
            parameters: { label: 'Uptime Ping OK' },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'node-schedule', target: 'node-http' },
        { id: 'e2', source: 'node-http', target: 'node-setvar' },
        { id: 'e3', source: 'node-setvar', target: 'node-debug' },
      ],
    },
  },
  {
    id: 'github-slack-alert',
    title: 'GitHub to Slack Notifier',
    description: 'Trigger from incoming webhook, create a GitHub issue, and broadcast updates to Slack.',
    icon: Github,
    badge: 'DevOps & Chat',
    badgeColor: 'text-zinc-300 bg-zinc-900 border-zinc-800',
    graph: {
      nodes: [
        {
          id: 'node-webhook',
          type: 'trigger.webhook',
          position: { x: 80, y: 160 },
          data: {
            type: 'trigger.webhook',
            label: 'Inbound Webhook',
            parameters: { method: 'POST', response: 'immediate' },
          },
        },
        {
          id: 'node-github',
          type: 'connector.github',
          position: { x: 380, y: 160 },
          data: {
            type: 'connector.github',
            label: 'Create GitHub Issue',
            parameters: {
              operation: 'create_issue',
              owner: 'my-org',
              repo: 'my-app',
              title: 'Incident: {{input.title}}',
              body: 'Reported via AutoZure webhook:\n{{input.body}}',
            },
          },
        },
        {
          id: 'node-slack',
          type: 'connector.slack',
          position: { x: 720, y: 160 },
          data: {
            type: 'connector.slack',
            label: 'Post to Slack',
            parameters: {
              operation: 'webhook',
              text: 'New Issue created: {{input.title}} (URL: {{input.issueUrl}})',
            },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'node-webhook', target: 'node-github' },
        { id: 'e2', source: 'node-github', target: 'node-slack' },
      ],
    },
  },
  {
    id: 'local-ollama-rag',
    title: 'Local Ollama Private AI',
    description: 'Query your self-hosted Ollama model (Llama 3), hash output, and parse structured output.',
    icon: Cpu,
    badge: 'Local AI',
    badgeColor: 'text-zinc-300 bg-zinc-900 border-zinc-800',
    graph: {
      nodes: [
        {
          id: 'node-trigger',
          type: 'trigger.manual',
          position: { x: 80, y: 160 },
          data: {
            type: 'trigger.manual',
            label: 'Local Prompt Trigger',
            parameters: { data: '{"query": "Provide a quick summary of modern container security."}' },
          },
        },
        {
          id: 'node-ollama',
          type: 'connector.ollama',
          position: { x: 380, y: 160 },
          data: {
            type: 'connector.ollama',
            label: 'Ollama Llama 3',
            parameters: {
              baseUrl: 'http://localhost:11434',
              model: 'llama3',
              prompt: '{{input.query}}',
              temperature: 0.7,
            },
          },
        },
        {
          id: 'node-crypto',
          type: 'util.crypto',
          position: { x: 700, y: 160 },
          data: {
            type: 'util.crypto',
            label: 'Hash Response',
            parameters: { operation: 'sha256', value: '{{input.response}}' },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'node-trigger', target: 'node-ollama' },
        { id: 'e2', source: 'node-ollama', target: 'node-crypto' },
      ],
    },
  },
  {
    id: 'stripe-resend-invoice',
    title: 'Stripe Payment to Resend Invoice',
    description: 'Listen for successful Stripe payment webhook, trigger transactional email invoice, and notify Slack.',
    icon: CreditCard,
    badge: 'FinTech & Commerce',
    badgeColor: 'text-zinc-300 bg-zinc-900 border-zinc-800',
    graph: {
      nodes: [
        {
          id: 'node-stripe-trigger',
          type: 'trigger.stripe',
          position: { x: 80, y: 160 },
          data: {
            type: 'trigger.stripe',
            label: 'Stripe Payment Succeeded',
            parameters: { event: 'payment_intent.succeeded' },
          },
        },
        {
          id: 'node-resend',
          type: 'connector.resend',
          position: { x: 400, y: 160 },
          data: {
            type: 'connector.resend',
            label: 'Send Receipt via Resend',
            parameters: {
              from: 'billing@autozure.local',
              to: '{{input.customer_email}}',
              subject: 'Receipt for Order #{{input.id}}',
              html: '<p>Thank you for your payment!</p>',
            },
          },
        },
        {
          id: 'node-slack',
          type: 'connector.slack',
          position: { x: 740, y: 160 },
          data: {
            type: 'connector.slack',
            label: 'Notify Sales Channel',
            parameters: {
              operation: 'webhook',
              text: '💰 New payment received: ${{input.amount}}',
            },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'node-stripe-trigger', target: 'node-resend' },
        { id: 'e2', source: 'node-resend', target: 'node-slack' },
      ],
    },
  },
  {
    id: 'crm-sync-hubspot-notion',
    title: 'HubSpot Lead to Notion Sync',
    description: 'Ingest inbound lead inquiries, create a contact in HubSpot CRM, and append to Notion database.',
    icon: Contact,
    badge: 'CRM & Workspace',
    badgeColor: 'text-zinc-300 bg-zinc-900 border-zinc-800',
    graph: {
      nodes: [
        {
          id: 'node-webhook',
          type: 'trigger.webhook',
          position: { x: 80, y: 160 },
          data: {
            type: 'trigger.webhook',
            label: 'Contact Form Webhook',
            parameters: { method: 'POST', response: 'immediate' },
          },
        },
        {
          id: 'node-hubspot',
          type: 'connector.hubspot',
          position: { x: 400, y: 160 },
          data: {
            type: 'connector.hubspot',
            label: 'Create HubSpot Contact',
            parameters: {
              operation: 'createContact',
              email: '{{input.email}}',
              firstname: '{{input.firstName}}',
              lastname: '{{input.lastName}}',
            },
          },
        },
        {
          id: 'node-notion',
          type: 'connector.notion',
          position: { x: 740, y: 160 },
          data: {
            type: 'connector.notion',
            label: 'Add Notion Lead Row',
            parameters: {
              operation: 'createPage',
              title: 'Lead: {{input.firstName}} {{input.lastName}}',
            },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'node-webhook', target: 'node-hubspot' },
        { id: 'e2', source: 'node-hubspot', target: 'node-notion' },
      ],
    },
  },
  {
    id: 'multi-model-eval',
    title: 'Multi-LLM Evaluator',
    description: 'Dispatch parallel prompts across Google Gemini & Anthropic Claude, then merge the answers.',
    icon: Flame,
    badge: 'LLM Orchestration',
    badgeColor: 'text-zinc-300 bg-zinc-900 border-zinc-800',
    graph: {
      nodes: [
        {
          id: 'node-trigger',
          type: 'trigger.manual',
          position: { x: 80, y: 180 },
          data: {
            type: 'trigger.manual',
            label: 'Eval Prompt Trigger',
            parameters: { data: '{"topic": "Explain Quantum Entanglement in simple terms."}' },
          },
        },
        {
          id: 'node-gemini',
          type: 'ai.gemini',
          position: { x: 380, y: 80 },
          data: {
            type: 'ai.gemini',
            label: 'Google Gemini 1.5 Flash',
            parameters: { model: 'gemini-1.5-flash', prompt: '{{input.topic}}' },
          },
        },
        {
          id: 'node-anthropic',
          type: 'ai.anthropic',
          position: { x: 380, y: 280 },
          data: {
            type: 'ai.anthropic',
            label: 'Anthropic Claude 3.5 Haiku',
            parameters: { model: 'claude-3-5-haiku-20241022', userMessage: '{{input.topic}}' },
          },
        },
        {
          id: 'node-merge',
          type: 'logic.merge',
          position: { x: 720, y: 180 },
          data: {
            type: 'logic.merge',
            label: 'Merge Responses',
            parameters: { mode: 'combine' },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'node-trigger', target: 'node-gemini' },
        { id: 'e2', source: 'node-trigger', target: 'node-anthropic' },
        { id: 'e3', source: 'node-gemini', target: 'node-merge' },
        { id: 'e4', source: 'node-anthropic', target: 'node-merge' },
      ],
    },
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState({ total: 0, successful: 0, failed: 0, running: 0, successRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [runningWfId, setRunningWfId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'nodes'>('updated');

  // Delete modal state
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [wfList, statData] = await Promise.all([
        workflowApi.list().catch(() => []),
        executionApi.stats().catch(() => ({ total: 0, successful: 0, failed: 0, running: 0, successRate: 0 })),
      ]);
      setWorkflows(wfList);
      setStats(statData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBlankWorkflow = async () => {
    setIsCreating(true);
    try {
      const newWf = await workflowApi.create({
        name: `Workflow ${workflows.length + 1}`,
        description: 'Visual workflow pipeline created with AutoZure engine',
        graph: {
          nodes: [
            {
              id: 'node-trigger',
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
      });
      router.push(`/editor/${newWf.id}`);
    } catch (err) {
      console.error('Failed to create workflow:', err);
      showToast('Error creating workflow');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUseTemplate = async (template: StarterTemplate) => {
    setIsCreating(true);
    try {
      const newWf = await workflowApi.create({
        name: template.title,
        description: template.description,
        graph: template.graph,
      });
      showToast(`Created workflow from template: ${template.title}`);
      router.push(`/editor/${newWf.id}`);
    } catch (err) {
      console.error('Failed to instantiate template:', err);
      showToast('Failed to instantiate template');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicateWorkflow = async (wf: Workflow) => {
    try {
      const copy = await workflowApi.create({
        name: `${wf.name} (Copy)`,
        description: wf.description || undefined,
        graph: wf.graph || { nodes: [], edges: [] },
      });
      setWorkflows([copy, ...workflows]);
      showToast(`Duplicated "${wf.name}"`);
    } catch (err) {
      console.error('Failed to duplicate workflow:', err);
      showToast('Error duplicating workflow');
    }
  };

  const handleToggleActive = async (wf: Workflow) => {
    const nextStatus = wf.status === 'active' ? 'draft' : 'active';
    try {
      const updated = await workflowApi.update(wf.id, { status: nextStatus });
      setWorkflows(workflows.map((w) => (w.id === wf.id ? { ...w, status: updated.status, active: updated.active } : w)));
      showToast(`Workflow "${wf.name}" is now ${nextStatus}`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to change workflow status');
    }
  };

  const handleRunWorkflow = async (wf: Workflow) => {
    setRunningWfId(wf.id);
    try {
      const res = await workflowApi.execute(wf.id);
      showToast(`Execution started (Run: ${res.executionId.slice(0, 8)})`);
      const statData = await executionApi.stats().catch(() => null);
      if (statData) setStats(statData);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to trigger execution');
    } finally {
      setRunningWfId(null);
    }
  };

  const confirmDeleteWorkflow = async () => {
    if (!workflowToDelete) return;
    setIsDeleting(true);
    try {
      await workflowApi.delete(workflowToDelete.id);
      setWorkflows(workflows.filter((w) => w.id !== workflowToDelete.id));
      showToast(`Deleted "${workflowToDelete.name}"`);
      setWorkflowToDelete(null);
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      showToast('Error deleting workflow');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered & sorted workflows
  const displayedWorkflows = useMemo(() => {
    return workflows
      .filter((wf) => {
        const matchesSearch =
          wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (wf.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'active'
            ? wf.status === 'active'
            : wf.status === 'draft';
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'nodes') {
          const aCount = a.graph?.nodes?.length || 0;
          const bCount = b.graph?.nodes?.length || 0;
          return bCount - aCount;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [workflows, searchQuery, statusFilter, sortBy]);

  const activeCount = workflows.filter((w) => w.status === 'active').length;
  const draftCount = workflows.filter((w) => w.status === 'draft').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-750 text-zinc-100 text-xs px-4 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-zinc-100">Automation Workflows</h1>
            <Badge variant="default" className="text-[10px] font-mono px-2.5 py-0.5">
              AutoZure v1.0 • 93 Nodes
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Build, execute, and monitor distributed visual pipelines with AI models, cloud triggers, and multi-step logic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateBlankWorkflow}
            disabled={isCreating}
            className="rounded-xl font-bold gap-2 bg-white hover:bg-zinc-200 text-zinc-950 border border-white shadow-sm"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin text-zinc-950" /> : <Plus className="h-4 w-4 stroke-[3]" />}
            New Workflow
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 relative overflow-hidden group hover:border-zinc-700 transition-colors bg-zinc-950/80 border-zinc-800">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium text-zinc-400">Total Workflows</span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <GitFork className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-100 tracking-tight">{workflows.length}</span>
            <span className="text-[11px] text-zinc-500 font-mono">
              ({activeCount} active, {draftCount} draft)
            </span>
          </div>
        </Card>

        <Card className="p-4 relative overflow-hidden group hover:border-zinc-700 transition-colors bg-zinc-950/80 border-zinc-800">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium text-zinc-400">Execution Runs</span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-100 tracking-tight">{stats.total}</span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {stats.successful} passed
            </span>
          </div>
        </Card>

        <Card className="p-4 relative overflow-hidden group hover:border-zinc-700 transition-colors bg-zinc-950/80 border-zinc-800">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium text-zinc-400">Execution Success Rate</span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-100 tracking-tight">
              {stats.total > 0 ? `${stats.successRate}%` : '100%'}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {stats.failed} failed
            </span>
          </div>
        </Card>

        <Card className="p-4 relative overflow-hidden group hover:border-zinc-700 transition-colors bg-zinc-950/80 border-zinc-800">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium text-zinc-400">Active Jobs Running</span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-100 tracking-tight">{stats.running}</span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Engine ready
            </span>
          </div>
        </Card>
      </div>

      {/* Starter Templates Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-zinc-300" />
            <h2 className="text-sm font-bold text-zinc-200">Production Starter Templates</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">1-click to instantiate prebuilt graphs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STARTER_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <Card
                key={tmpl.id}
                className="group relative flex flex-col justify-between p-4 border-zinc-800 bg-zinc-950/80 hover:border-zinc-600 hover:bg-zinc-900/60 transition-all hover:shadow-xl hover:shadow-black/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-9 w-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-200 border border-zinc-800 group-hover:scale-105 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className={`text-[10px] font-mono px-2 py-0 border ${tmpl.badgeColor}`}>
                      {tmpl.badge}
                    </Badge>
                  </div>

                  <h3 className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {tmpl.graph.nodes.length} nodes
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUseTemplate(tmpl)}
                    disabled={isCreating}
                    className="h-auto p-0 text-[11px] font-semibold text-zinc-300 hover:text-white gap-1 hover:bg-transparent"
                  >
                    Use Template <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Workflows Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border pb-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              id="search-workflows"
              name="search-workflows"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows by name or description..."
              className="pl-10 h-9 bg-card border-border text-xs rounded-xl focus-visible:ring-white"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-card border border-border p-1">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={`h-7 px-3 text-xs rounded-lg ${
                  statusFilter === 'all' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All ({workflows.length})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('active')}
                className={`h-7 px-3 text-xs rounded-lg ${
                  statusFilter === 'active' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Active ({activeCount})
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('draft')}
                className={`h-7 px-3 text-xs rounded-lg ${
                  statusFilter === 'draft' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Draft ({draftCount})
              </Button>
            </div>

            {/* Sort Dropdown */}
            <select
              id="sort-workflows"
              name="sort-workflows"
              aria-label="Sort workflows"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl bg-card border border-border px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-medium"
            >
              <option value="updated">Recently Updated</option>
              <option value="name">Name (A-Z)</option>
              <option value="nodes">Most Nodes</option>
            </select>
          </div>
        </div>

        {/* Workflows Grid */}
        {isLoading ? (
          <div className="flex py-24 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
              <p className="text-xs text-muted-foreground font-mono">Loading pipelines from engine...</p>
            </div>
          </div>
        ) : displayedWorkflows.length === 0 ? (
          <Card className="border-dashed p-12 text-center bg-card/30">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 mx-auto mb-3">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">
              {searchQuery ? 'No matching workflows found' : 'No workflows yet'}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search query or status filter.'
                : 'Get started by creating a blank workflow or selecting one of the production templates above.'}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleCreateBlankWorkflow}
                className="mt-4 gap-1.5 rounded-xl font-bold bg-white text-zinc-950 hover:bg-zinc-200 border border-white shadow-sm"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Forge Blank Workflow
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedWorkflows.map((wf) => {
              const nodeCount = wf.graph?.nodes?.length || 0;
              const isRunning = runningWfId === wf.id;
              const nodeNames = (wf.graph?.nodes || []).slice(0, 3).map((n) => n.data?.label || n.type);

              return (
                <Card
                  key={wf.id}
                  className="group hover:border-zinc-700 transition-all p-5 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-black/60 bg-zinc-950/80 border-zinc-800"
                >
                  <div>
                    {/* Header: Title & Status switch */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/editor/${wf.id}`}
                          className="text-sm font-bold text-zinc-100 hover:text-white transition-colors truncate block"
                        >
                          {wf.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {wf.description || 'Visual workflow pipeline'}
                        </p>
                      </div>

                      {/* Active/Draft Switch */}
                      <button
                        onClick={() => handleToggleActive(wf)}
                        title="Click to toggle Active / Draft"
                        className="focus:outline-none"
                      >
                        <Badge
                          variant={wf.status === 'active' ? 'default' : 'secondary'}
                          className="cursor-pointer gap-1.5 uppercase font-mono text-[10px] py-0.5 px-2.5"
                        >
                          <Power className="h-3 w-3" />
                          <span>{wf.status}</span>
                        </Badge>
                      </button>
                    </div>

                    {/* Node chain preview */}
                    {nodeNames.length > 0 && (
                      <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground font-mono truncate">
                        <Layers className="h-3 w-3 text-zinc-600 shrink-0" />
                        <span className="truncate">
                          {nodeNames.join(' → ')}
                          {nodeCount > 3 ? ` +${nodeCount - 3} more` : ''}
                        </span>
                      </div>
                    )}

                    {/* Metadata & Last run */}
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>{nodeCount} node{nodeCount !== 1 ? 's' : ''}</span>
                      {wf.lastRunStatus ? (
                        <span className="flex items-center gap-1">
                          {wf.lastRunStatus === 'success' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-zinc-400" />
                          )}
                          <span className="capitalize">{wf.lastRunStatus}</span>
                        </span>
                      ) : (
                        <span>Never executed</span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                    <Button variant="link" size="sm" asChild className="p-0 h-auto font-semibold text-zinc-300 hover:text-white">
                      <Link href={`/editor/${wf.id}`}>
                        Open Canvas →
                      </Link>
                    </Button>

                    <div className="flex items-center gap-1">
                      {/* Run button */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRunWorkflow(wf)}
                        disabled={isRunning}
                        className="rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
                        title="Run Workflow Now"
                      >
                        {isRunning ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-300" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      {/* Duplicate button */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDuplicateWorkflow(wf)}
                        className="rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
                        title="Duplicate Workflow"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setWorkflowToDelete(wf)}
                        className="rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
                        title="Delete Workflow"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog with shadcn Dialog */}
      <Dialog open={!!workflowToDelete} onOpenChange={(open) => !open && setWorkflowToDelete(null)}>
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 text-zinc-300 mb-1">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-zinc-100">Delete Workflow</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">This action cannot be undone</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-zinc-100 font-semibold">&ldquo;{workflowToDelete?.name}&rdquo;</strong>?
            All associated execution logs and version histories will be removed.
          </p>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="secondary"
              onClick={() => setWorkflowToDelete(null)}
              disabled={isDeleting}
              className="rounded-xl bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteWorkflow}
              disabled={isDeleting}
              className="rounded-xl gap-1.5"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

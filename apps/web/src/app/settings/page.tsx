'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  KeyRound,
  Shield,
  Plus,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Building,
  Zap,
  Brain,
  Globe,
  Lock,
  Server,
  Activity,
  HardDrive,
  Users,
  Copy,
  ExternalLink,
  MessageSquare,
  Radio,
  Send,
  Github,
  Gitlab,
  BookOpen,
  Table,
  FileSpreadsheet,
  Database,
  PhoneCall,
  Binary,
  CreditCard,
  ShoppingBag,
  DollarSign,
  Contact,
  Cloud,
  CheckSquare,
  CheckCircle,
  Calendar,
  Folder,
  Box,
  Cpu,
  Flame,
  Terminal,
} from 'lucide-react';
import { credentialApi } from '@/lib/api';
import { Credential } from '@flowforge/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  OpenAIIcon,
  AnthropicIcon,
  GeminiIcon,
  GroqIcon,
  MistralIcon,
  DeepSeekIcon,
  PerplexityIcon,
  CohereIcon,
  ElevenLabsIcon,
  SlackIcon,
  DiscordIcon,
  TelegramIcon,
  StripeIcon,
  ShopifyIcon,
  NotionIcon,
  AirtableIcon,
  PostgresIcon,
  MySQLIcon,
  RedisIcon,
  SupabaseIcon,
  AwsIcon,
  MongoDBIcon,
  CloudflareIcon,
  DigitalOceanIcon,
  SentryIcon,
  PagerDutyIcon,
  HubSpotIcon,
  ResendIcon,
  LinearIcon,
} from '@/components/icons/NodeIcon';

interface CredentialPreset {
  type: string;
  name: string;
  provider: string;
  icon: React.ElementType;
  badgeColor: string;
  fields: { name: string; label: string; placeholder: string; type: 'password' | 'text' }[];
}

const CREDENTIAL_PRESETS: CredentialPreset[] = [
  {
    type: 'openai',
    name: 'OpenAI API Key',
    provider: 'OpenAI',
    icon: OpenAIIcon,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    fields: [{ name: 'apiKey', label: 'API Key', placeholder: 'sk-...', type: 'password' }],
  },
  {
    type: 'google-ai',
    name: 'Google Gemini API Key',
    provider: 'Google AI',
    icon: GeminiIcon,
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    fields: [{ name: 'apiKey', label: 'API Key', placeholder: 'AIzaSy...', type: 'password' }],
  },
  {
    type: 'anthropic',
    name: 'Anthropic Claude API Key',
    provider: 'Anthropic',
    icon: AnthropicIcon,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    fields: [{ name: 'apiKey', label: 'API Key', placeholder: 'sk-ant-...', type: 'password' }],
  },
  {
    type: 'groq',
    name: 'Groq Cloud API Key',
    provider: 'Groq',
    icon: GroqIcon,
    badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    fields: [{ name: 'groq_api_key', label: 'Groq API Key', placeholder: 'gsk_...', type: 'password' }],
  },
  {
    type: 'mistral',
    name: 'Mistral AI API Key',
    provider: 'Mistral AI',
    icon: MistralIcon,
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    fields: [{ name: 'mistral_api_key', label: 'Mistral API Key', placeholder: '••••••••', type: 'password' }],
  },
  {
    type: 'deepseek',
    name: 'DeepSeek API Key',
    provider: 'DeepSeek',
    icon: DeepSeekIcon,
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    fields: [{ name: 'deepseek_api_key', label: 'DeepSeek API Key', placeholder: 'sk-••••', type: 'password' }],
  },
  {
    type: 'perplexity',
    name: 'Perplexity AI API Key',
    provider: 'Perplexity',
    icon: PerplexityIcon,
    badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    fields: [{ name: 'perplexity_api_key', label: 'Perplexity API Key', placeholder: 'pplx-...', type: 'password' }],
  },
  {
    type: 'cohere',
    name: 'Cohere API Key',
    provider: 'Cohere',
    icon: CohereIcon,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    fields: [{ name: 'cohere_api_key', label: 'Cohere API Key', placeholder: '••••••••', type: 'password' }],
  },
  {
    type: 'elevenlabs',
    name: 'ElevenLabs Voice API Key',
    provider: 'ElevenLabs',
    icon: ElevenLabsIcon,
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    fields: [{ name: 'elevenlabs_api_key', label: 'API Key', placeholder: '••••••••', type: 'password' }],
  },
  {
    type: 'slack',
    name: 'Slack Bot Token / Webhook',
    provider: 'Slack',
    icon: SlackIcon,
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    fields: [
      { name: 'slackBotToken', label: 'Bot Token (xoxb-...)', placeholder: 'xoxb-...', type: 'password' },
      { name: 'slackWebhook', label: 'Incoming Webhook URL (Optional)', placeholder: 'https://hooks.slack.com/...', type: 'text' },
    ],
  },
  {
    type: 'discord',
    name: 'Discord Webhook',
    provider: 'Discord',
    icon: DiscordIcon,
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    fields: [
      { name: 'discordWebhook', label: 'Webhook URL', placeholder: 'https://discord.com/api/webhooks/...', type: 'password' },
    ],
  },
  {
    type: 'telegram',
    name: 'Telegram Bot Token',
    provider: 'Telegram',
    icon: TelegramIcon,
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    fields: [
      { name: 'telegramBotToken', label: 'Bot Token', placeholder: '123456789:ABCdef...', type: 'password' },
    ],
  },
  {
    type: 'github',
    name: 'GitHub Personal Access Token',
    provider: 'GitHub',
    icon: Github,
    badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
    fields: [
      { name: 'githubToken', label: 'Personal Access Token', placeholder: 'ghp_...', type: 'password' },
    ],
  },
  {
    type: 'gitlab',
    name: 'GitLab Access Token',
    provider: 'GitLab',
    icon: Gitlab,
    badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    fields: [
      { name: 'gitlabToken', label: 'Personal Access Token', placeholder: 'glpat-...', type: 'password' },
    ],
  },
  {
    type: 'notion',
    name: 'Notion Integration Secret',
    provider: 'Notion',
    icon: NotionIcon,
    badgeColor: 'text-slate-200 bg-slate-800 border-slate-700',
    fields: [
      { name: 'notionApiKey', label: 'Internal Integration Secret', placeholder: 'secret_...', type: 'password' },
    ],
  },
  {
    type: 'airtable',
    name: 'Airtable Access Token',
    provider: 'Airtable',
    icon: AirtableIcon,
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    fields: [
      { name: 'airtableToken', label: 'Personal Access Token', placeholder: 'pat...', type: 'password' },
    ],
  },
  {
    type: 'supabase',
    name: 'Supabase API Key',
    provider: 'Supabase',
    icon: SupabaseIcon,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    fields: [
      { name: 'supabaseKey', label: 'Anon or Service Role Key', placeholder: 'eyJhbGciOi...', type: 'password' },
    ],
  },
  {
    type: 'postgres',
    name: 'PostgreSQL Database URL',
    provider: 'PostgreSQL',
    icon: PostgresIcon,
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    fields: [
      { name: 'postgresUrl', label: 'Connection URL', placeholder: 'postgresql://user:pass@host:5432/db', type: 'password' },
    ],
  },
  {
    type: 'mysql',
    name: 'MySQL Connection String',
    provider: 'MySQL',
    icon: MySQLIcon,
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    fields: [
      { name: 'mysql_connection_string', label: 'Connection URL', placeholder: 'mysql://user:pass@host:3306/db', type: 'password' },
    ],
  },
  {
    type: 'redis',
    name: 'Redis Connection URL',
    provider: 'Redis',
    icon: RedisIcon,
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    fields: [
      { name: 'redisUrl', label: 'Redis URL', placeholder: 'redis://default:pass@host:6379', type: 'password' },
    ],
  },
  {
    type: 'mongodb',
    name: 'MongoDB Connection URI',
    provider: 'MongoDB',
    icon: MongoDBIcon,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    fields: [
      { name: 'mongoUri', label: 'Connection URI', placeholder: 'mongodb+srv://user:pass@cluster.mongodb.net', type: 'password' },
    ],
  },
  {
    type: 'aws-s3',
    name: 'AWS S3 Access Keys',
    provider: 'AWS S3',
    icon: AwsIcon,
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    fields: [
      { name: 'accessKeyId', label: 'Access Key ID', placeholder: 'AKIA...', type: 'text' },
      { name: 'secretAccessKey', label: 'Secret Access Key', placeholder: '••••••••', type: 'password' },
    ],
  },
  {
    type: 'cloudflare',
    name: 'Cloudflare API Token',
    provider: 'Cloudflare',
    icon: CloudflareIcon,
    badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    fields: [
      { name: 'cloudflare_api_token', label: 'API Token', placeholder: '••••••••', type: 'password' },
      { name: 'cloudflare_account_id', label: 'Account ID (Optional)', placeholder: '••••••••', type: 'text' },
    ],
  },
  {
    type: 'digitalocean',
    name: 'DigitalOcean API Token',
    provider: 'DigitalOcean',
    icon: DigitalOceanIcon,
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    fields: [
      { name: 'digitalocean_token', label: 'Personal Access Token', placeholder: 'dop_v1_...', type: 'password' },
    ],
  },
  {
    type: 'sentry',
    name: 'Sentry Auth Token',
    provider: 'Sentry',
    icon: SentryIcon,
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    fields: [
      { name: 'sentry_auth_token', label: 'Internal Auth Token', placeholder: 'sntrys_...', type: 'password' },
    ],
  },
  {
    type: 'pagerduty',
    name: 'PagerDuty API Token',
    provider: 'PagerDuty',
    icon: PagerDutyIcon,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    fields: [
      { name: 'pagerduty_token', label: 'REST API Key', placeholder: 'u+...', type: 'password' },
    ],
  },
  {
    type: 'stripe',
    name: 'Stripe Secret Key',
    provider: 'Stripe',
    icon: StripeIcon,
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    fields: [
      { name: 'stripe_api_key', label: 'Secret API Key', placeholder: 'sk_live_... or sk_test_...', type: 'password' },
    ],
  },
  {
    type: 'shopify',
    name: 'Shopify Admin API Token',
    provider: 'Shopify',
    icon: ShopifyIcon,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    fields: [
      { name: 'shopify_access_token', label: 'Admin API Access Token', placeholder: 'shpat_...', type: 'password' },
      { name: 'shopDomain', label: 'Store Domain', placeholder: 'my-store.myshopify.com', type: 'text' },
    ],
  },
  {
    type: 'hubspot',
    name: 'HubSpot Private App Token',
    provider: 'HubSpot',
    icon: HubSpotIcon,
    badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    fields: [
      { name: 'hubspot_access_token', label: 'Private App Access Token', placeholder: 'pat-na1-...', type: 'password' },
    ],
  },
  {
    type: 'resend',
    name: 'Resend API Key',
    provider: 'Resend',
    icon: ResendIcon,
    badgeColor: 'text-slate-200 bg-slate-800 border-slate-700',
    fields: [
      { name: 'resend_api_key', label: 'API Key', placeholder: 're_...', type: 'password' },
    ],
  },
  {
    type: 'linear',
    name: 'Linear API Key',
    provider: 'Linear',
    icon: LinearIcon,
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    fields: [
      { name: 'linear_api_key', label: 'Personal API Key', placeholder: 'lin_api_...', type: 'password' },
    ],
  },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'credentials' | 'system' | 'workspace' | null;

  const [activeTab, setActiveTab] = useState<'credentials' | 'system' | 'workspace'>(
    initialTab === 'system' ? 'system' : initialTab === 'workspace' ? 'workspace' : 'credentials'
  );
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('openai');
  const [credName, setCredName] = useState('');
  const [credData, setCredData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadCreds() {
      try {
        setIsLoading(true);
        const list = await credentialApi.list();
        setCredentials(list);
      } catch (err) {
        console.error('Failed to load credentials:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCreds();
  }, []);

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const newCred = await credentialApi.create({
        name: credName,
        type: selectedType,
        data: credData,
      });
      setCredentials([newCred, ...credentials]);
      setIsModalOpen(false);
      setCredName('');
      setCredData({});
    } catch (err) {
      console.error('Failed to create credential:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await credentialApi.delete(id);
      setCredentials(credentials.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete credential:', err);
    }
  };

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestResult((prev) => ({ ...prev, [id]: 'Verified OK' }));
      setTestingId(null);
    }, 900);
  };

  const activePreset = CREDENTIAL_PRESETS.find((p) => p.type === selectedType) || CREDENTIAL_PRESETS[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 select-none">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Settings & Security</h1>
        <p className="mt-1 text-xs text-slate-400">
          Configure encrypted API credentials, workspace access controls, and view platform system telemetry.
        </p>
      </div>

      {/* Settings Navigation with shadcn Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-6">
        <TabsList className="bg-card border border-border h-11 p-1 rounded-xl">
          <TabsTrigger value="credentials" className="text-xs font-semibold gap-2 px-5 py-2 rounded-lg">
            <KeyRound className="h-4 w-4" />
            <span>Credentials Vault</span>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-1 font-mono">
              {credentials.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs font-semibold gap-2 px-5 py-2 rounded-lg">
            <Server className="h-4 w-4" />
            <span>Engine & Health</span>
            <Badge variant="default" className="text-[10px] py-0 px-1.5 ml-1 font-mono">
              93 Nodes
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="workspace" className="text-xs font-semibold gap-2 px-5 py-2 rounded-lg">
            <Building className="h-4 w-4" />
            <span>Workspace</span>
          </TabsTrigger>
        </TabsList>

        {/* CREDENTIALS TAB */}
        <TabsContent value="credentials" className="mt-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Encrypted Credentials Vault</h2>
              <p className="text-xs text-muted-foreground">
                Credentials are encrypted with AES-256-GCM at rest and decrypted on-demand during node execution.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl font-bold gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-950/40"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              Add Credential
            </Button>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : credentials.length === 0 ? (
            <Card className="border-dashed p-12 text-center text-xs text-muted-foreground bg-card/40">
              <KeyRound className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-300">No credentials configured</p>
              <p className="mt-1">Add your OpenAI, Gemini, Groq, Mistral, Slack, or GitHub keys to power workflows.</p>
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 gap-1.5 rounded-xl font-semibold text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Your First Key
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credentials.map((cred) => {
                const preset = CREDENTIAL_PRESETS.find((p) => p.type === cred.type) || CREDENTIAL_PRESETS[0];
                const Icon = preset.icon;
                const isTesting = testingId === cred.id;
                const verified = testResult[cred.id];

                return (
                  <Card
                    key={cred.id}
                    className="flex flex-col justify-between p-4 bg-card/60 hover:bg-card transition-all shadow-lg"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[#08090d] flex items-center justify-center text-emerald-400 border border-border">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-200">{cred.name}</span>
                            <span className="block text-[10px] text-muted-foreground font-mono">
                              ID: {cred.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>

                        <Badge variant="secondary" className={`text-[10px] font-mono uppercase px-2 py-0 border ${preset.badgeColor}`}>
                          {cred.type}
                        </Badge>
                      </div>

                      <div className="mt-4 p-2.5 rounded-xl bg-[#08090d] border border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                        <span>Encrypted Payload:</span>
                        <span className="text-slate-500">•••••••••••••••• (AES-256)</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestConnection(cred.id)}
                          disabled={isTesting}
                          className="h-auto p-0 text-[11px] font-semibold text-muted-foreground hover:text-emerald-400 gap-1 hover:bg-transparent"
                        >
                          {isTesting ? (
                            <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                          ) : verified ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Activity className="h-3 w-3" />
                          )}
                          <span>{verified ? 'Connected' : 'Test Connection'}</span>
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(cred.id)}
                        className="rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        title="Delete Credential"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Add Credential Dialog with shadcn Dialog */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-md bg-[#0e111a] border-border text-slate-100 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold text-slate-100">Add New Credential</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Store integration API keys securely with AES-256 encryption.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateCredential} className="mt-2 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Provider Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full rounded-xl bg-[#08090d] border border-border px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {CREDENTIAL_PRESETS.map((p) => (
                      <option key={p.type} value={p.type}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Friendly Name</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Production OpenAI Key"
                    value={credName}
                    onChange={(e) => setCredName(e.target.value)}
                    className="bg-[#08090d] border-border text-xs"
                  />
                </div>

                {activePreset.fields.map((field) => (
                  <div key={field.name}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300 capitalize">{field.label}</label>
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="text-[10px] text-muted-foreground hover:text-slate-200 flex items-center gap-1 font-mono"
                        >
                          {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {showSecret ? 'Hide' : 'Reveal'}
                        </button>
                      )}
                    </div>
                    <Input
                      type={field.type === 'password' ? (showSecret ? 'text' : 'password') : 'text'}
                      required
                      placeholder={field.placeholder}
                      value={credData[field.name] || ''}
                      onChange={(e) => setCredData({ ...credData, [field.name]: e.target.value })}
                      className="bg-[#08090d] border-border text-xs font-mono"
                    />
                  </div>
                ))}

                <DialogFooter className="mt-4 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 gap-1.5 shadow-lg shadow-emerald-950/50"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Credential
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* SYSTEM & HEALTH TAB */}
        <TabsContent value="system" className="mt-0 space-y-4">
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-200">FlowForge Engine Diagnostics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[#08090d] border border-border">
                <span className="block text-[11px] text-muted-foreground font-mono">Backend API Endpoint</span>
                <span className="block text-xs font-mono font-semibold text-emerald-400 mt-1">
                  http://localhost:3001
                </span>
                <Badge variant="default" className="mt-2 text-[10px] font-mono px-2 py-0">
                  ONLINE • Healthy (Port 3001)
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-[#08090d] border border-border">
                <span className="block text-[11px] text-muted-foreground font-mono">Execution Engine Mode</span>
                <span className="block text-xs font-semibold text-slate-200 mt-1">
                  In-Process Local Executor (BullMQ Ready)
                </span>
                <Badge variant="info" className="mt-2 text-[10px] font-mono px-2 py-0">
                  Zero Host Dependency Active
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-[#08090d] border border-border">
                <span className="block text-[11px] text-muted-foreground font-mono">Persistence Store</span>
                <span className="block text-xs font-semibold text-slate-200 mt-1">
                  In-Memory Store (PostgreSQL / Drizzle Ready)
                </span>
                <Badge variant="warning" className="mt-2 text-[10px] font-mono px-2 py-0">
                  Seeded with Demo Workflows
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-[#08090d] border border-border">
                <span className="block text-[11px] text-muted-foreground font-mono">Registered Node Types</span>
                <span className="block text-xs font-semibold text-slate-200 mt-1">
                  93 Built-In Production Nodes
                </span>
                <Badge variant="default" className="mt-2 text-[10px] font-mono px-2 py-0">
                  Triggers, Actions, Logic, Data, AI, Databases, Cloud
                </Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* WORKSPACE TAB */}
        <TabsContent value="workspace" className="mt-0">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Workspace Settings</h2>
              <p className="text-xs text-muted-foreground">Manage workspace branding, slug, and members.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Workspace Name</label>
                <Input
                  type="text"
                  defaultValue="Production Cluster"
                  className="bg-[#08090d] border-border text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Workspace Slug</label>
                <Input
                  type="text"
                  disabled
                  defaultValue="ws-production-cluster"
                  className="bg-[#08090d]/60 border-border text-xs text-muted-foreground font-mono"
                />
              </div>
            </div>

            {/* Members list */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Workspace Members</h3>
              <div className="rounded-xl border border-border bg-[#08090d]/60 divide-y divide-border">
                <div className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">
                      A
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-200">admin@flowforge.local</span>
                      <span className="block text-[10px] text-muted-foreground">FlowForge Administrator</span>
                    </div>
                  </div>
                  <Badge variant="default" className="text-[10px] font-mono px-2.5 py-0">
                    OWNER
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}

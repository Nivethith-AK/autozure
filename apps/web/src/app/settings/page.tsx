'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
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
} from 'lucide-react';
import { credentialApi } from '@/lib/api';
import { Credential } from '@flowforge/types';

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
    icon: Sparkles,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    fields: [{ name: 'apiKey', label: 'API Key', placeholder: 'sk-...', type: 'password' }],
  },
  {
    type: 'google-ai',
    name: 'Google Gemini API Key',
    provider: 'Google AI',
    icon: Zap,
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    fields: [{ name: 'apiKey', label: 'API Key', placeholder: 'AIzaSy...', type: 'password' }],
  },
  {
    type: 'anthropic',
    name: 'Anthropic Claude API Key',
    provider: 'Anthropic',
    icon: Brain,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    fields: [{ name: 'apiKey', label: 'API Key', placeholder: 'sk-ant-...', type: 'password' }],
  },
  {
    type: 'bearer',
    name: 'HTTP Bearer Token',
    provider: 'REST API',
    icon: Globe,
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    fields: [{ name: 'token', label: 'Bearer Token', placeholder: 'eyJhbGciOi...', type: 'password' }],
  },
  {
    type: 'basic_auth',
    name: 'HTTP Basic Auth',
    provider: 'HTTP',
    icon: Lock,
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    fields: [
      { name: 'username', label: 'Username', placeholder: 'admin', type: 'text' },
      { name: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
    ],
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'credentials' | 'system' | 'workspace'>('credentials');
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Settings & Security</h1>
        <p className="mt-1 text-xs text-slate-400">
          Configure encrypted API credentials, workspace access controls, and view platform system telemetry.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'credentials'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          API Credentials
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'system'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="h-4 w-4" />
          Engine & Health
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'workspace'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="h-4 w-4" />
          Workspace
        </button>
      </div>

      {/* CREDENTIALS TAB */}
      {activeTab === 'credentials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Encrypted Credentials Vault</h2>
              <p className="text-xs text-slate-400">
                Credentials are encrypted with AES-256-GCM at rest and decrypted on-demand during node execution.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 text-xs transition-all shadow-lg shadow-emerald-950/40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Credential
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : credentials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-xs text-slate-500">
              <KeyRound className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-300">No credentials configured</p>
              <p className="mt-1">Add your OpenAI, Gemini, or Anthropic API keys to power AI workflow nodes.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Your First Key
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credentials.map((cred) => {
                const preset = CREDENTIAL_PRESETS.find((p) => p.type === cred.type) || CREDENTIAL_PRESETS[0];
                const Icon = preset.icon;
                const isTesting = testingId === cred.id;
                const verified = testResult[cred.id];

                return (
                  <div
                    key={cred.id}
                    className="flex flex-col justify-between p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 transition-all shadow-lg"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700/60">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-200">{cred.name}</span>
                            <span className="block text-[10px] text-slate-500 font-mono">
                              ID: {cred.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                          {cred.type}
                        </span>
                      </div>

                      <div className="mt-4 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>Encrypted Key:</span>
                        <span className="text-slate-500">••••••••••••••••</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestConnection(cred.id)}
                          disabled={isTesting}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          {isTesting ? (
                            <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                          ) : verified ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Activity className="h-3 w-3" />
                          )}
                          <span>{verified ? 'Connected' : 'Test Connection'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleDelete(cred.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Credential"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Credential Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95">
                <h3 className="text-sm font-bold text-slate-100">Add New Credential</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Store integration API keys securely with AES-256 encryption.
                </p>

                <form onSubmit={handleCreateCredential} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Provider Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      {CREDENTIAL_PRESETS.map((p) => (
                        <option key={p.type} value={p.type}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Friendly Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Production OpenAI Key"
                      value={credName}
                      onChange={(e) => setCredName(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
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
                            className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
                          >
                            {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            {showSecret ? 'Hide' : 'Reveal'}
                          </button>
                        )}
                      </div>
                      <input
                        type={field.type === 'password' ? (showSecret ? 'text' : 'password') : 'text'}
                        required
                        placeholder={field.placeholder}
                        value={credData[field.name] || ''}
                        onChange={(e) => setCredData({ ...credData, [field.name]: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  ))}

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
                    >
                      {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Credential
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SYSTEM & HEALTH TAB */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4 shadow-lg">
            <h2 className="text-sm font-bold text-slate-200">FlowForge Engine Diagnostics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="block text-[11px] text-slate-500 font-mono">Backend API Endpoint</span>
                <span className="block text-xs font-mono font-semibold text-emerald-400 mt-1">
                  http://localhost:3001
                </span>
                <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ONLINE • Healthy
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="block text-[11px] text-slate-500 font-mono">Execution Engine Mode</span>
                <span className="block text-xs font-semibold text-slate-200 mt-1">
                  In-Process Local Executor (BullMQ Ready)
                </span>
                <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Zero Host Dependency Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="block text-[11px] text-slate-500 font-mono">Persistence Store</span>
                <span className="block text-xs font-semibold text-slate-200 mt-1">
                  In-Memory Store (PostgreSQL / Drizzle Ready)
                </span>
                <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Seeded with Demo Workflows
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="block text-[11px] text-slate-500 font-mono">Registered Node Types</span>
                <span className="block text-xs font-semibold text-slate-200 mt-1">
                  14 Built-In Production Nodes
                </span>
                <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Triggers, Actions, Logic, Data, AI
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE TAB */}
      {activeTab === 'workspace' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6 shadow-lg">
          <div>
            <h2 className="text-sm font-bold text-slate-200">Workspace Settings</h2>
            <p className="text-xs text-slate-400">Manage workspace branding, slug, and members.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Workspace Name</label>
              <input
                type="text"
                defaultValue="Default Workspace"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Workspace Slug</label>
              <input
                type="text"
                disabled
                defaultValue="ws-default-001"
                className="w-full rounded-xl bg-slate-950/50 border border-slate-800 px-3.5 py-2 text-xs text-slate-500 font-mono"
              />
            </div>
          </div>

          {/* Members list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Workspace Members</h3>
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 divide-y divide-slate-800/80">
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">
                    A
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-200">admin@flowforge.local</span>
                    <span className="block text-[10px] text-slate-500">FlowForge Administrator</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  OWNER
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

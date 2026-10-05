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
} from 'lucide-react';
import { credentialApi } from '@/lib/api';
import { Credential } from '@flowforge/types';

const CREDENTIAL_PRESETS = [
  { type: 'openai', name: 'OpenAI API Key', fields: ['apiKey'] },
  { type: 'google-ai', name: 'Google Gemini API Key', fields: ['apiKey'] },
  { type: 'anthropic', name: 'Anthropic Claude API Key', fields: ['apiKey'] },
  { type: 'bearer', name: 'Bearer Token', fields: ['token'] },
  { type: 'basic_auth', name: 'HTTP Basic Auth', fields: ['username', 'password'] },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'credentials' | 'workspace'>('credentials');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New credential modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('openai');
  const [credName, setCredName] = useState('');
  const [credData, setCredData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

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

  const activePreset = CREDENTIAL_PRESETS.find((p) => p.type === selectedType) || CREDENTIAL_PRESETS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Settings</h1>
        <p className="text-xs text-slate-400">
          Manage workspace settings, security, and encrypted integration credentials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'credentials'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          Credentials
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'workspace'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="h-4 w-4" />
          Workspace
        </button>
      </div>

      {activeTab === 'credentials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Encrypted Credentials</h2>
              <p className="text-xs text-slate-400">
                Credentials are encrypted with AES-256-GCM at rest and decrypted only during node execution.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3 py-1.5 text-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Credential
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : credentials.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
              No credentials configured. Add your OpenAI, Gemini, or Anthropic API keys to use AI nodes.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800">
              {credentials.map((cred) => (
                <div key={cred.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-200">{cred.name}</span>
                      <span className="block text-[10px] text-slate-500 font-mono uppercase">{cred.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(cred.id)}
                    className="rounded-lg p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                <h3 className="text-sm font-bold text-slate-100">Add New Credential</h3>
                <p className="mt-1 text-xs text-slate-400">Store API credentials securely</p>

                <form onSubmit={handleCreateCredential} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      {CREDENTIAL_PRESETS.map((p) => (
                        <option key={p.type} value={p.type}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Production OpenAI Key"
                      value={credName}
                      onChange={(e) => setCredName(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {activePreset.fields.map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-slate-300 mb-1 capitalize">{field}</label>
                      <input
                        type="password"
                        required
                        placeholder={`Enter ${field}`}
                        value={credData[field] || ''}
                        onChange={(e) => setCredData({ ...credData, [field]: e.target.value })}
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  ))}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-1.5 text-xs transition-colors flex items-center gap-1.5"
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

      {activeTab === 'workspace' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">Workspace Settings</h2>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Workspace Name</label>
            <input
              type="text"
              defaultValue="Default Workspace"
              className="w-full max-w-md rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Slug</label>
            <input
              type="text"
              disabled
              defaultValue="default-workspace"
              className="w-full max-w-md rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2 text-xs text-slate-500 font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
}

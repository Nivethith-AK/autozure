'use client';

import React, { useState } from 'react';
import {
  X,
  Trash2,
  Eye,
  Settings2,
  Check,
  AlertCircle,
  Copy,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { ParameterDefinition } from '@flowforge/types';

export function NodeConfigDrawer() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const selectedNode = useWorkflowStore((s) => s.selectedNode);
  const nodeDefinitions = useWorkflowStore((s) => s.nodeDefinitions);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const updateNodeParameters = useWorkflowStore((s) => s.updateNodeParameters);
  const updateNodeLabel = useWorkflowStore((s) => s.updateNodeLabel);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const activeExecution = useWorkflowStore((s) => s.activeExecution);

  const [activeTab, setActiveTab] = useState<'parameters' | 'inspector' | 'docs'>('parameters');
  const [copiedData, setCopiedData] = useState<string | null>(null);

  if (!selectedNodeId || !selectedNode) return null;

  const nodeData = selectedNode.data as any;
  const definition = nodeDefinitions.find((d) => d.type === (nodeData?.type || selectedNode.type));
  const parameters = nodeData?.parameters || {};

  // Check if there is an execution result for this node
  const nodeResult = activeExecution?.nodeResults?.find((r) => r.nodeId === selectedNodeId);

  const handleParamChange = (name: string, value: any) => {
    updateNodeParameters(selectedNodeId, { [name]: value });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedData(key);
    setTimeout(() => setCopiedData(null), 2000);
  };

  return (
    <aside className="fixed right-0 top-14 bottom-0 z-30 w-[420px] border-l border-slate-800 bg-slate-950/95 backdrop-blur-xl flex flex-col shadow-2xl transition-all select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${nodeData.color || '#3b82f6'}22`, color: nodeData.color || '#3b82f6' }}
          >
            <Settings2 className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold text-slate-100 truncate">{nodeData.label || 'Node'}</h2>
            <p className="text-[10px] text-slate-400 font-mono truncate">{nodeData.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => deleteNode(selectedNodeId)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Node"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => selectNode(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-4 bg-slate-950">
        <button
          onClick={() => setActiveTab('parameters')}
          className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'parameters'
              ? 'border-emerald-500 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Parameters
        </button>
        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 ml-4 transition-colors ${
            activeTab === 'inspector'
              ? 'border-emerald-500 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Data Inspector
          {nodeResult && (
            <span
              className={`w-2 h-2 rounded-full ${
                nodeResult.status === 'success'
                  ? 'bg-emerald-400'
                  : nodeResult.status === 'failed'
                  ? 'bg-rose-400'
                  : 'bg-blue-400'
              }`}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 ml-4 transition-colors ${
            activeTab === 'docs'
              ? 'border-emerald-500 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info className="h-3.5 w-3.5" />
          Help
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'parameters' && (
          <div className="space-y-4">
            {/* Rename Title */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Node Title
              </label>
              <input
                type="text"
                value={nodeData.label || ''}
                onChange={(e) => updateNodeLabel(selectedNodeId, e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="h-px bg-slate-800/80 my-2" />

            {/* Dynamic Parameter Forms */}
            {(definition?.parameters || []).length === 0 ? (
              <p className="text-xs text-slate-500 italic">This node has no configurable parameters.</p>
            ) : (
              (definition?.parameters || []).map((param: ParameterDefinition) => (
                <div key={param.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-200">
                      {param.label}
                      {param.required && <span className="text-rose-400 ml-0.5">*</span>}
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {param.type}
                    </span>
                  </div>

                  {param.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">{param.description}</p>
                  )}

                  {/* Render based on parameter type */}
                  {param.type === 'string' && (
                    <input
                      type="text"
                      value={parameters[param.name] ?? ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.placeholder}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  )}

                  {param.type === 'number' && (
                    <input
                      type="number"
                      value={parameters[param.name] ?? ''}
                      onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  )}

                  {param.type === 'boolean' && (
                    <label className="flex items-center gap-2.5 cursor-pointer mt-1 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <input
                        type="checkbox"
                        checked={!!parameters[param.name]}
                        onChange={(e) => handleParamChange(param.name, e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span className="text-xs text-slate-300 font-medium">Enabled</span>
                    </label>
                  )}

                  {param.type === 'select' && (
                    <select
                      value={parameters[param.name] ?? param.default ?? ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      {(param.options || []).map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {(param.type === 'json' || param.type === 'code') && (
                    <div className="relative">
                      <textarea
                        rows={6}
                        value={
                          typeof parameters[param.name] === 'object'
                            ? JSON.stringify(parameters[param.name], null, 2)
                            : parameters[param.name] ?? ''
                        }
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        placeholder={param.placeholder}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-emerald-400 font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed scrollbar-thin"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Data Inspector */}
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            {!nodeResult ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
                <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-slate-300">No Telemetry Recorded</h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Execute this workflow to inspect live input arguments and transformed output data.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        nodeResult.status === 'success'
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                          : 'bg-rose-400 shadow-sm shadow-rose-400/50'
                      }`}
                    />
                    <span className="font-semibold text-slate-200 capitalize">{nodeResult.status}</span>
                  </div>

                  {nodeResult.durationMs !== undefined && (
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {nodeResult.durationMs}ms
                    </span>
                  )}
                </div>

                {nodeResult.error && (
                  <div className="rounded-xl border border-rose-800/80 bg-rose-950/30 p-3 text-xs text-rose-300">
                    <span className="font-bold block mb-1">Error Message:</span>
                    <pre className="font-mono text-[11px] whitespace-pre-wrap">{nodeResult.error}</pre>
                  </div>
                )}

                {/* Input Inspector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                      Input Payload
                    </h4>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(nodeResult.inputData, null, 2), 'input')}
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedData === 'input' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedData === 'input' ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(nodeResult.inputData, null, 2) || '{}'}
                  </pre>
                </div>

                {/* Output Inspector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                      Output Result
                    </h4>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(nodeResult.outputData, null, 2), 'output')}
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedData === 'output' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedData === 'output' ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(nodeResult.outputData, null, 2) || '{}'}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}

        {/* Documentation / Help */}
        {activeTab === 'docs' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] uppercase font-bold text-slate-500 font-mono mb-1">Description</span>
              <p>{definition?.description || 'No documentation available for this node.'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] uppercase font-bold text-slate-500 font-mono mb-1">Category</span>
              <span className="capitalize font-semibold text-emerald-400">{nodeData.category}</span>
            </div>

            {definition?.credentials && definition.credentials.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-500 font-mono mb-1">Required Credentials</span>
                <div className="flex gap-1.5 flex-wrap">
                  {definition.credentials.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-400">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

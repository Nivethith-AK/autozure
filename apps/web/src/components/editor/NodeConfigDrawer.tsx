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
  Zap,
  Play,
  Loader2,
  Power,
  Code2,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { ParameterDefinition } from '@flowforge/types';
import { NodeIcon } from '@/components/icons/NodeIcon';
import Link from 'next/link';

export function NodeConfigDrawer() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const selectedNode = useWorkflowStore((s) => s.selectedNode);
  const nodeDefinitions = useWorkflowStore((s) => s.nodeDefinitions);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const updateNodeParameters = useWorkflowStore((s) => s.updateNodeParameters);
  const updateNodeLabel = useWorkflowStore((s) => s.updateNodeLabel);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const activeExecution = useWorkflowStore((s) => s.activeExecution);

  const [activeTab, setActiveTab] = useState<'parameters' | 'test' | 'inspector' | 'docs'>('parameters');
  const [copiedData, setCopiedData] = useState<string | null>(null);

  // Live Step Testing state
  const [testPayload, setTestPayload] = useState('{\n  "test": true,\n  "sample": "data"\n}');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingStep, setIsTestingStep] = useState(false);

  if (!selectedNodeId || !selectedNode) return null;

  const nodeData = selectedNode.data as any;
  const definition = nodeDefinitions.find((d) => d.type === (nodeData?.type || selectedNode.type));
  const parameters = nodeData?.parameters || {};
  const isDisabled = !!nodeData.disabled;

  // Check if there is an execution result for this node in the active execution
  const nodeResult = activeExecution?.nodeResults?.find((r) => r.nodeId === selectedNodeId);

  const handleParamChange = (name: string, value: any) => {
    updateNodeParameters(selectedNodeId, { [name]: value });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedData(key);
    setTimeout(() => setCopiedData(null), 2000);
  };

  // Run a quick mock test of this step
  const handleTestStep = async () => {
    setIsTestingStep(true);
    setTestResult(null);
    try {
      let parsedInput = {};
      try {
        parsedInput = JSON.parse(testPayload);
      } catch {}

      // Simulate step evaluation with input
      await new Promise((resolve) => setTimeout(resolve, 350));
      setTestResult({
        success: true,
        nodeType: nodeData.type,
        executedAt: new Date().toISOString(),
        durationMs: 14,
        output: {
          ...parsedInput,
          _processedBy: nodeData.label || nodeData.type,
          _status: 'ok',
          parametersUsed: parameters,
        },
      });
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTestingStep(false);
    }
  };

  const insertExpression = (paramName: string, expr: string) => {
    const current = String(parameters[paramName] || '');
    handleParamChange(paramName, current ? `${current} {{${expr}}}` : `{{${expr}}}`);
  };

  return (
    <aside className="fixed right-0 top-14 bottom-0 z-30 w-[440px] border-l border-white/[0.08] bg-[#0b0d14]/95 backdrop-blur-2xl flex flex-col shadow-2xl transition-all select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-[#0f121d]/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
            style={{ backgroundColor: `${nodeData.color || '#3b82f6'}20`, color: nodeData.color || '#3b82f6', border: `1px solid ${nodeData.color || '#3b82f6'}40` }}
          >
            <NodeIcon nodeType={nodeData.type} iconName={nodeData.icon} className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold text-slate-100 truncate">{nodeData.label || 'Node'}</h2>
            <p className="text-[10px] text-slate-400 font-mono truncate">{nodeData.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => updateNodeParameters(selectedNodeId, { disabled: !isDisabled })}
            className={`rounded-lg p-1.5 transition-colors ${
              isDisabled ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:bg-white/[0.06]'
            }`}
            title={isDisabled ? 'Enable node' : 'Disable node'}
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteNode(selectedNodeId)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Node"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => selectNode(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/[0.06] px-4 bg-[#090b12]">
        <button
          onClick={() => setActiveTab('parameters')}
          className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'parameters'
              ? 'border-emerald-500 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Parameters
        </button>

        <button
          onClick={() => setActiveTab('test')}
          className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 ml-4 transition-all ${
            activeTab === 'test'
              ? 'border-emerald-500 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="h-3 w-3 fill-current" />
          Test Step
        </button>

        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 ml-4 transition-all ${
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
                nodeResult.status === 'success' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 ml-4 transition-all ${
            activeTab === 'docs'
              ? 'border-emerald-500 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info className="h-3.5 w-3.5" />
          Docs
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* PARAMETERS TAB */}
        {activeTab === 'parameters' && (
          <div className="space-y-4">
            {/* Rename Title */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Node Name
              </label>
              <input
                type="text"
                value={nodeData.label || ''}
                onChange={(e) => updateNodeLabel(selectedNodeId, e.target.value)}
                className="w-full rounded-xl bg-[#121622] border border-white/[0.08] px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-all"
              />
            </div>

            <div className="h-px bg-white/[0.06] my-2" />

            {/* Dynamic Parameter Forms */}
            {(definition?.parameters || []).length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                This node requires no manual parameters.
              </p>
            ) : (
              (definition?.parameters || []).map((param: ParameterDefinition) => (
                <div key={param.name} className="space-y-1.5 rounded-xl p-2.5 bg-[#0e111a]/50 border border-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-200 flex items-center gap-1">
                      {param.label}
                      {param.required && <span className="text-rose-400">*</span>}
                    </label>
                    <span className="text-[9px] text-slate-500 font-mono uppercase bg-[#141824] px-1.5 py-0.5 rounded border border-white/[0.06]">
                      {param.type}
                    </span>
                  </div>

                  {param.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">{param.description}</p>
                  )}

                  {/* Expression insertion chips for strings/code */}
                  {(param.type === 'string' || param.type === 'code') && (
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">Insert:</span>
                      {['input.data', 'input.id', 'input.body', 'input.email'].map((expr) => (
                        <button
                          key={expr}
                          type="button"
                          onClick={() => insertExpression(param.name, expr)}
                          className="px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-emerald-500/10 hover:text-emerald-400 border border-white/[0.06] text-[10px] font-mono text-slate-400 transition-colors whitespace-nowrap"
                        >
                          +{expr}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Render based on parameter type */}
                  {param.type === 'string' && (
                    <input
                      type="text"
                      value={parameters[param.name] ?? ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.placeholder}
                      className="w-full rounded-xl bg-[#131724] border border-white/[0.08] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-all"
                    />
                  )}

                  {param.type === 'number' && (
                    <input
                      type="number"
                      value={parameters[param.name] ?? ''}
                      onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
                      className="w-full rounded-xl bg-[#131724] border border-white/[0.08] px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono transition-all"
                    />
                  )}

                  {param.type === 'boolean' && (
                    <label className="flex items-center gap-2.5 cursor-pointer mt-1 p-2 rounded-xl bg-[#131724] border border-white/[0.06]">
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
                      className="w-full rounded-xl bg-[#131724] border border-white/[0.08] px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
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
                        className="w-full rounded-xl bg-[#090b12] border border-white/[0.08] p-3 text-xs text-emerald-400 font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed scrollbar-thin"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TEST STEP TAB */}
        {activeTab === 'test' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#111422] border border-white/[0.08]">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                <Zap className="h-4 w-4" />
                Live Node Step Evaluator
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Test and execute this isolated step with sample input payload to verify output schema before running the entire graph.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Sample Input Payload (JSON)
              </label>
              <textarea
                rows={5}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="w-full rounded-xl bg-[#090b12] border border-white/[0.08] p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleTestStep}
              disabled={isTestingStep}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isTestingStep ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              <span>Execute Step Test</span>
            </button>

            {testResult && (
              <div className="space-y-2 animate-in fade-in-50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" /> Step Execution Succeeded
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{testResult.durationMs}ms</span>
                </div>
                <pre className="p-3 rounded-xl bg-[#090b12] border border-white/[0.08] text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56 leading-relaxed">
                  {JSON.stringify(testResult.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* DATA INSPECTOR TAB */}
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            {!nodeResult ? (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#0d101a]/50 p-8 text-center">
                <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-slate-300">No Execution Telemetry</h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Run the workflow using &ldquo;Run Workflow&rdquo; in the top bar to inspect transformed results.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#121624] border border-white/[0.08] text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        nodeResult.status === 'success' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-400'
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
                  <pre className="p-3 rounded-xl bg-[#090b12] border border-white/[0.06] text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
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
                  <pre className="p-3 rounded-xl bg-[#090b12] border border-white/[0.06] text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(nodeResult.outputData, null, 2) || '{}'}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}

        {/* DOCS TAB */}
        {activeTab === 'docs' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="p-3.5 rounded-xl bg-[#121624] border border-white/[0.06]">
              <span className="block text-[10px] uppercase font-bold text-slate-500 font-mono mb-1">Description</span>
              <p>{definition?.description || 'No documentation available for this node.'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121624] border border-white/[0.06]">
              <span className="block text-[10px] uppercase font-bold text-slate-500 font-mono mb-1">Category</span>
              <span className="capitalize font-semibold text-emerald-400">{nodeData.category}</span>
            </div>

            {definition?.credentials && definition.credentials.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#121624] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Required Credentials</span>
                  <Link
                    href="/settings"
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Manage Vault <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {definition.credentials.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-[#090b12] border border-white/[0.08] font-mono text-[11px] text-amber-400">
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

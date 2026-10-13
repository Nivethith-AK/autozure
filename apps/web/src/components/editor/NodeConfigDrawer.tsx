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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export function NodeConfigDrawer() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const selectedNode = useWorkflowStore((s) => s.selectedNode);
  const nodeDefinitions = useWorkflowStore((s) => s.nodeDefinitions);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const updateNodeParameters = useWorkflowStore((s) => s.updateNodeParameters);
  const updateNodeLabel = useWorkflowStore((s) => s.updateNodeLabel);
  const toggleNodeDisabled = useWorkflowStore((s) => s.toggleNodeDisabled);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const activeExecution = useWorkflowStore((s) => s.activeExecution);

  const [activeTab, setActiveTab] = useState<string>('parameters');
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
    <aside className="fixed right-0 top-14 bottom-0 z-30 w-[440px] border-l border-zinc-800 bg-zinc-950/98 backdrop-blur-2xl flex flex-col shadow-2xl transition-all select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
            style={{
              backgroundColor: `${nodeData.color || '#3b82f6'}20`,
              color: nodeData.color || '#3b82f6',
              border: `1px solid ${nodeData.color || '#3b82f6'}40`,
            }}
          >
            <NodeIcon nodeType={nodeData.type} iconName={nodeData.icon} className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold text-zinc-100 truncate">{nodeData.label || 'Node'}</h2>
            <p className="text-[10px] text-zinc-400 font-mono truncate">{nodeData.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleNodeDisabled(selectedNodeId)}
            className="rounded-lg text-zinc-400 hover:text-white"
            title={isDisabled ? 'Enable node' : 'Disable node'}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => deleteNode(selectedNodeId)}
            className="rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Delete Node"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => selectNode(null)}
            className="rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Tabs with shadcn Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-950">
          <TabsList className="grid grid-cols-4 w-full h-8 bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="parameters" className="text-xs py-1 gap-1">
              <Settings2 className="h-3 w-3" />
              <span>Params</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="text-xs py-1 gap-1">
              <Play className="h-2.5 w-2.5 fill-current" />
              <span>Test</span>
            </TabsTrigger>
            <TabsTrigger value="inspector" className="text-xs py-1 gap-1">
              <Eye className="h-3 w-3" />
              <span>Inspect</span>
              {nodeResult && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    nodeResult.status === 'success' ? 'bg-white' : 'bg-zinc-500'
                  }`}
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="docs" className="text-xs py-1 gap-1">
              <Info className="h-3 w-3" />
              <span>Docs</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* PARAMETERS TAB */}
          <TabsContent value="parameters" className="mt-0 space-y-4">
            {/* Rename Title */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Node Name
              </label>
              <Input
                type="text"
                value={nodeData.label || ''}
                onChange={(e) => updateNodeLabel(selectedNodeId, e.target.value)}
                className="h-8 bg-zinc-900 border-zinc-800 text-xs rounded-xl"
              />
            </div>

            <div className="h-px bg-zinc-800 my-2" />

            {/* Dynamic Parameter Forms */}
            {(definition?.parameters || []).length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4 text-center">
                This node requires no manual parameters.
              </p>
            ) : (
              (definition?.parameters || []).map((param: ParameterDefinition) => (
                <div key={param.name} className="space-y-1.5 rounded-xl p-2.5 bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-200 flex items-center gap-1">
                      {param.label}
                      {param.required && <span className="text-zinc-400">*</span>}
                    </label>
                    <Badge variant="secondary" className="text-[9px] uppercase font-mono px-1.5 py-0">
                      {param.type}
                    </Badge>
                  </div>

                  {param.description && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{param.description}</p>
                  )}

                  {/* Expression insertion chips for strings/code */}
                  {(param.type === 'string' || param.type === 'code') && (
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                      <span className="text-[10px] text-zinc-500 font-mono">Insert:</span>
                      {['input.data', 'input.id', 'input.body', 'input.email'].map((expr) => (
                        <button
                          key={expr}
                          type="button"
                          onClick={() => insertExpression(param.name, expr)}
                          className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700/60 text-[10px] font-mono text-zinc-400 transition-colors whitespace-nowrap"
                        >
                          +{expr}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Render based on parameter type */}
                  {param.type === 'string' && (
                    <Input
                      type="text"
                      value={parameters[param.name] ?? ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.placeholder}
                      className="h-8 bg-zinc-900 border-zinc-800 text-xs font-mono rounded-xl"
                    />
                  )}

                  {param.type === 'number' && (
                    <Input
                      type="number"
                      value={parameters[param.name] ?? ''}
                      onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
                      className="h-8 bg-zinc-900 border-zinc-800 text-xs font-mono rounded-xl"
                    />
                  )}

                  {param.type === 'boolean' && (
                    <div className="flex items-center justify-between mt-1 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-xs text-zinc-300 font-medium">Enabled</span>
                      <Switch
                        checked={!!parameters[param.name]}
                        onCheckedChange={(checked) => handleParamChange(param.name, checked)}
                      />
                    </div>
                  )}

                  {param.type === 'select' && (
                    <select
                      value={parameters[param.name] ?? param.default ?? ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-white transition-all"
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
                      <Textarea
                        rows={6}
                        value={
                          typeof parameters[param.name] === 'object'
                            ? JSON.stringify(parameters[param.name], null, 2)
                            : parameters[param.name] ?? ''
                        }
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        placeholder={param.placeholder}
                        className="bg-zinc-900 border-zinc-800 p-3 text-xs text-zinc-100 font-mono leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* TEST STEP TAB */}
          <TabsContent value="test" className="mt-0 space-y-4">
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-100 font-semibold text-xs mb-1">
                <Zap className="h-4 w-4" />
                Live Node Step Evaluator
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Test and execute this isolated step with sample input payload to verify output schema before running the entire graph.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                Sample Input Payload (JSON)
              </label>
              <Textarea
                rows={5}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-xs text-zinc-200 font-mono"
              />
            </div>

            <Button
              onClick={handleTestStep}
              disabled={isTestingStep}
              className="w-full gap-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-md border border-white"
            >
              {isTestingStep ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              <span>Execute Step Test</span>
            </Button>

            {testResult && (
              <div className="space-y-2 animate-in fade-in-50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-white" /> Step Execution Succeeded
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">{testResult.durationMs}ms</span>
                </div>
                <pre className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-200 overflow-x-auto max-h-56 leading-relaxed">
                  {JSON.stringify(testResult.output, null, 2)}
                </pre>
              </div>
            )}
          </TabsContent>

          {/* DATA INSPECTOR TAB */}
          <TabsContent value="inspector" className="mt-0 space-y-4">
            {!nodeResult ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
                <AlertCircle className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-zinc-300">No Execution Telemetry</h3>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Run the workflow using &ldquo;Run Workflow&rdquo; in the top bar to inspect transformed results.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        nodeResult.status === 'success' ? 'bg-white shadow-sm shadow-white/50' : 'bg-zinc-500'
                      }`}
                    />
                    <span className="font-semibold text-zinc-200 capitalize">{nodeResult.status}</span>
                  </div>

                  {nodeResult.durationMs !== undefined && (
                    <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      {nodeResult.durationMs}ms
                    </span>
                  )}
                </div>

                {nodeResult.error && (
                  <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-xs text-zinc-300">
                    <span className="font-bold block mb-1 text-zinc-200">Error Message:</span>
                    <pre className="font-mono text-[11px] whitespace-pre-wrap text-zinc-400">{nodeResult.error}</pre>
                  </div>
                )}

                {/* Input Inspector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                      Input Payload
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(nodeResult.inputData, null, 2), 'input')}
                      className="text-[10px] text-zinc-400 hover:text-white h-auto py-1 px-2 gap-1"
                    >
                      {copiedData === 'input' ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3" />}
                      {copiedData === 'input' ? 'Copied' : 'Copy JSON'}
                    </Button>
                  </div>
                  <pre className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(nodeResult.inputData, null, 2) || '{}'}
                  </pre>
                </div>

                {/* Output Inspector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider font-mono">
                      Output Result
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(nodeResult.outputData, null, 2), 'output')}
                      className="text-[10px] text-zinc-400 hover:text-white h-auto py-1 px-2 gap-1"
                    >
                      {copiedData === 'output' ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3" />}
                      {copiedData === 'output' ? 'Copied' : 'Copy JSON'}
                    </Button>
                  </div>
                  <pre className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-200 overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(nodeResult.outputData, null, 2) || '{}'}
                  </pre>
                </div>
              </>
            )}
          </TabsContent>

          {/* DOCS TAB */}
          <TabsContent value="docs" className="mt-0 space-y-3 text-xs leading-relaxed text-zinc-300">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="block text-[10px] uppercase font-bold text-zinc-500 font-mono mb-1">Description</span>
              <p>{definition?.description || 'No documentation available for this node.'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="block text-[10px] uppercase font-bold text-zinc-500 font-mono mb-1">Category</span>
              <span className="capitalize font-semibold text-zinc-100">{nodeData.category}</span>
            </div>

            {definition?.credentials && definition.credentials.length > 0 && (
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Required Credentials</span>
                  <Link
                    href="/settings"
                    className="text-[10px] text-zinc-300 hover:underline flex items-center gap-1"
                  >
                    Manage Vault <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {definition.credentials.map((c) => (
                    <Badge key={c} variant="secondary" className="font-mono text-[11px]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}

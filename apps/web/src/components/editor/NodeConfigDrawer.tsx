'use client';

import React, { useState } from 'react';
import { X, Trash2, Eye, Settings2, Check, AlertCircle } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'parameters' | 'inspector'>('parameters');

  if (!selectedNodeId || !selectedNode) return null;

  const nodeData = selectedNode.data as any;
  const definition = nodeDefinitions.find((d) => d.type === (nodeData?.type || selectedNode.type));
  const parameters = nodeData?.parameters || {};

  // Check if there is an execution result for this node
  const nodeResult = activeExecution?.nodeResults?.find((r) => r.nodeId === selectedNodeId);

  const handleParamChange = (name: string, value: any) => {
    updateNodeParameters(selectedNodeId, { [name]: value });
  };

  return (
    <aside className="fixed right-0 top-14 bottom-0 z-30 w-96 border-l border-slate-800 bg-slate-950/95 backdrop-blur-md flex flex-col shadow-2xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">Node Configuration</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => deleteNode(selectedNodeId)}
            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
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
      <div className="flex border-b border-slate-800 px-4">
        <button
          onClick={() => setActiveTab('parameters')}
          className={`flex items-center gap-2 py-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'parameters'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Parameters
        </button>
        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex items-center gap-2 py-3 text-xs font-medium border-b-2 ml-4 transition-colors ${
            activeTab === 'inspector'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Data Inspector
          {nodeResult && (
            <span className={`w-2 h-2 rounded-full ${nodeResult.status === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'parameters' ? (
          <>
            {/* Label input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Node Title</label>
              <input
                type="text"
                value={nodeData.label || ''}
                onChange={(e) => updateNodeLabel(selectedNodeId, e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Dynamic parameters based on definition */}
            {(definition?.parameters || []).map((param: ParameterDefinition) => (
              <div key={param.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    {param.label}
                    {param.required && <span className="text-rose-400 ml-0.5">*</span>}
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{param.type}</span>
                </div>
                {param.description && (
                  <p className="text-[11px] text-slate-400 mb-1">{param.description}</p>
                )}

                {/* Input renderers based on parameter type */}
                {param.type === 'string' && (
                  <input
                    type="text"
                    value={parameters[param.name] ?? ''}
                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                    placeholder={param.placeholder}
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                )}

                {param.type === 'number' && (
                  <input
                    type="number"
                    value={parameters[param.name] ?? ''}
                    onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                )}

                {param.type === 'boolean' && (
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={!!parameters[param.name]}
                      onChange={(e) => handleParamChange(param.name, e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-300">Enabled</span>
                  </label>
                )}

                {param.type === 'select' && (
                  <select
                    value={parameters[param.name] ?? param.default ?? ''}
                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {(param.options || []).map((opt) => (
                      <option key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {(param.type === 'json' || param.type === 'code') && (
                  <textarea
                    rows={5}
                    value={
                      typeof parameters[param.name] === 'object'
                        ? JSON.stringify(parameters[param.name], null, 2)
                        : parameters[param.name] ?? ''
                    }
                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                    placeholder={param.placeholder}
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                )}
              </div>
            ))}
          </>
        ) : (
          /* Data Inspector Tab */
          <div className="space-y-4">
            {!nodeResult ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No execution data for this node yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Run the workflow to inspect inputs and outputs.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-slate-400">Execution Status:</span>
                  <span
                    className={`font-semibold capitalize px-2 py-0.5 rounded text-[10px] ${
                      nodeResult.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {nodeResult.status}
                  </span>
                </div>

                {nodeResult.durationMs !== undefined && (
                  <div className="text-xs text-slate-400">
                    Execution time: <span className="text-slate-200 font-mono">{nodeResult.durationMs}ms</span>
                  </div>
                )}

                {nodeResult.error && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                    <p className="font-semibold mb-1">Error:</p>
                    <pre className="font-mono text-[11px] whitespace-pre-wrap">{nodeResult.error}</pre>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1.5">Input Data</h4>
                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                    {JSON.stringify(nodeResult.inputData, null, 2) || '{}'}
                  </pre>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1.5">Output Data</h4>
                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60">
                    {JSON.stringify(nodeResult.outputData, null, 2) || '{}'}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

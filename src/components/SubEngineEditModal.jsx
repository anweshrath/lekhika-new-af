import React, { useState, useEffect } from 'react'
import { X, Brain, Zap, Plus, AlertTriangle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import UltraButton from './UltraButton'

const SubEngineEditModal = ({ engine, onClose, onSave }) => {
  const [editData, setEditData] = useState({ ...engine })
  const [loading, setLoading] = useState(false)
  const [availableModels, setAvailableModels] = useState([])
  const [providers, setProviders] = useState([])
  const [nodeProviderStates, setNodeProviderStates] = useState({})

  useEffect(() => {
    loadAIModels()
  }, [])

  const loadAIModels = async () => {
    try {
      const [providersRes, modelsRes] = await Promise.all([
        supabase.from('ai_providers').select('*').eq('is_active', true),
        supabase.from('ai_model_metadata').select('*').eq('is_active', true)
      ])

      if (providersRes.data) {
        setProviders(providersRes.data.map(p => p.name))
      }
      if (modelsRes.data) {
        setAvailableModels(modelsRes.data)
      }
    } catch (error) {
      console.error('Error loading AI models:', error)
    }
  }

  const getAINodes = () => {
    if (!editData.nodes || editData.nodes.length === 0) return []
    
    return editData.nodes
      .filter(node => node.data?.aiEnabled)
      .map(node => ({
        id: node.id,
        name: node.data?.label || node.data?.name || 'Unnamed Node',
        type: node.type,
        selectedModels: node.data?.selectedModels || [],
        temperature: node.data?.temperature || 0.7,
        maxTokens: node.data?.maxTokens || 2000,
        systemPrompt: node.data?.systemPrompt || '',
        userPrompt: node.data?.userPrompt || node.data?.promptTemplate || '',
        instructions: node.data?.instructions || node.data?.additionalInstructions || ''
      }))
  }

  const getFilteredModels = (nodeId) => {
    const nodeProvider = nodeProviderStates[nodeId]
    if (!nodeProvider) return []
    return availableModels.filter(model => model.key_name === nodeProvider)
  }

  const handleSave = async () => {
    try {
      const aiNodes = getAINodes()
      const invalidNodes = aiNodes.filter(node => node.selectedModels.length === 0)
      
      if (invalidNodes.length > 0) {
        const nodeNames = invalidNodes.map(n => n.name).join(', ')
        toast.error(`These nodes need at least one AI model: ${nodeNames}`)
        return
      }
      
      setLoading(true)
      
      const { id, user_id, users, ...updateData } = editData
      
      const { error } = await supabase
        .from('user_engines')
        .update(updateData)
        .eq('id', engine.id)

      if (error) throw error
      
      toast.success('Engine updated successfully!')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error updating engine:', error)
      toast.error(`Failed to update engine: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-600">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Your Engine</h2>
                <p className="text-sm text-blue-100">{editData.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Basic Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Status</label>
                <select
                  value={editData.status || 'active'}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* AI Nodes */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>AI Workflow Nodes</span>
            </h3>
            
            {getAINodes().length > 0 ? (
              <div className="space-y-4">
                {getAINodes().map((aiNode) => (
                  <div key={aiNode.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600 rounded-xl p-5">
                    {/* Node Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-600">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{aiNode.name}</div>
                          <div className="text-xs text-gray-400">{aiNode.type}</div>
                        </div>
                      </div>
                      <div className="text-xs px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">
                        {aiNode.selectedModels.length} Model{aiNode.selectedModels.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    {/* Selected Models */}
                    <div className="space-y-2 mb-4">
                      {aiNode.selectedModels.map((modelKey, idx) => {
                        const [providerKey, modelId] = modelKey.split(':')
                        const modelInfo = availableModels.find(m => m.key_name === providerKey && m.model_id === modelId)
                        return (
                          <div key={idx} className="flex items-center justify-between bg-slate-700/70 rounded-lg p-3 border border-slate-600/50">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-white">{modelId}</div>
                                <div className="text-xs text-gray-400">{providerKey}</div>
                                {modelInfo && (
                                  <div className="text-xs text-green-400 mt-1">
                                    ${modelInfo.input_cost_per_million || 0}/1M tokens
                                  </div>
                                )}
                              </div>
                              {modelInfo?.is_active === false && (
                                <div className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded border border-red-500/30">
                                  Inactive
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const newNodes = [...editData.nodes]
                                const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                if (nodeIdx !== -1) {
                                  const updatedModels = aiNode.selectedModels.filter((_, i) => i !== idx)
                                  newNodes[nodeIdx] = {
                                    ...newNodes[nodeIdx],
                                    data: {
                                      ...newNodes[nodeIdx].data,
                                      selectedModels: updatedModels
                                    }
                                  }
                                  setEditData({ ...editData, nodes: newNodes })
                                  toast.success('Model removed')
                                }
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Add Model Section */}
                    <div className="bg-slate-700/30 border border-slate-600 border-dashed rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <Plus className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-bold text-gray-300">Add AI Model</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Provider</label>
                          <select
                            value={nodeProviderStates[aiNode.id] || ''}
                            onChange={(e) => {
                              setNodeProviderStates({
                                ...nodeProviderStates,
                                [aiNode.id]: e.target.value
                              })
                            }}
                            className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select Provider</option>
                            {providers.map((prov) => (
                              <option key={prov} value={prov}>{prov}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Model</label>
                          {nodeProviderStates[aiNode.id] ? (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  const modelKey = e.target.value
                                  const newNodes = [...editData.nodes]
                                  const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                  if (nodeIdx !== -1) {
                                    const updatedModels = [...aiNode.selectedModels, modelKey]
                                    newNodes[nodeIdx] = {
                                      ...newNodes[nodeIdx],
                                      data: {
                                        ...newNodes[nodeIdx].data,
                                        selectedModels: updatedModels
                                      }
                                    }
                                    setEditData({ ...editData, nodes: newNodes })
                                    setNodeProviderStates({
                                      ...nodeProviderStates,
                                      [aiNode.id]: ''
                                    })
                                    const model = getFilteredModels(aiNode.id).find(m => `${m.key_name}:${m.model_id}` === modelKey)
                                    toast.success(`${model?.model_name || 'Model'} added`)
                                  }
                                }
                              }}
                              className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Model</option>
                              {getFilteredModels(aiNode.id)
                                .filter(model => model.is_active)
                                .map((model) => {
                                  const modelKey = `${model.key_name}:${model.model_id}`
                                  const alreadySelected = aiNode.selectedModels.includes(modelKey)
                                  return (
                                    <option 
                                      key={model.id} 
                                      value={modelKey}
                                      disabled={alreadySelected}
                                    >
                                      {model.model_name} {alreadySelected ? '(Added)' : `($${model.input_cost_per_million || 0}/1M)`}
                                    </option>
                                  )
                                })}
                            </select>
                          ) : (
                            <div className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-gray-500 text-xs">
                              Select provider first
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Node Settings */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-600 mb-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Temperature</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={aiNode.temperature}
                            onChange={(e) => {
                              const newNodes = [...editData.nodes]
                              const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                              if (nodeIdx !== -1) {
                                newNodes[nodeIdx] = {
                                  ...newNodes[nodeIdx],
                                  data: {
                                    ...newNodes[nodeIdx].data,
                                    temperature: parseFloat(e.target.value)
                                  }
                                }
                                setEditData({ ...editData, nodes: newNodes })
                              }
                            }}
                            className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs text-white font-mono w-10">{aiNode.temperature}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Max Tokens</label>
                        <input
                          type="number"
                          value={aiNode.maxTokens}
                          onChange={(e) => {
                            const newNodes = [...editData.nodes]
                            const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                            if (nodeIdx !== -1) {
                              newNodes[nodeIdx] = {
                                ...newNodes[nodeIdx],
                                data: {
                                  ...newNodes[nodeIdx].data,
                                  maxTokens: parseInt(e.target.value)
                                }
                              }
                              setEditData({ ...editData, nodes: newNodes })
                            }
                          }}
                          min="100"
                          max="8000"
                          step="100"
                          className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* Prompt Fields */}
                    <div className="grid grid-cols-1 gap-3 pt-3 border-t border-slate-600">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1.5">System Prompt</label>
                        <textarea
                          value={aiNode.systemPrompt || ''}
                          onChange={(e) => {
                            const newNodes = [...editData.nodes]
                            const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                            if (nodeIdx !== -1) {
                              newNodes[nodeIdx] = {
                                ...newNodes[nodeIdx],
                                data: {
                                  ...newNodes[nodeIdx].data,
                                  systemPrompt: e.target.value
                                }
                              }
                              setEditData({ ...editData, nodes: newNodes })
                            }
                          }}
                          rows={3}
                          placeholder="System-level instructions for the AI..."
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1.5">User Prompt / Prompt Template</label>
                        <textarea
                          value={aiNode.userPrompt || ''}
                          onChange={(e) => {
                            const newNodes = [...editData.nodes]
                            const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                            if (nodeIdx !== -1) {
                              newNodes[nodeIdx] = {
                                ...newNodes[nodeIdx],
                                data: {
                                  ...newNodes[nodeIdx].data,
                                  userPrompt: e.target.value,
                                  promptTemplate: e.target.value
                                }
                              }
                              setEditData({ ...editData, nodes: newNodes })
                            }
                          }}
                          rows={3}
                          placeholder="User prompt template with {variables}..."
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1.5">Additional Instructions</label>
                        <textarea
                          value={aiNode.instructions || ''}
                          onChange={(e) => {
                            const newNodes = [...editData.nodes]
                            const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                            if (nodeIdx !== -1) {
                              newNodes[nodeIdx] = {
                                ...newNodes[nodeIdx],
                                data: {
                                  ...newNodes[nodeIdx].data,
                                  instructions: e.target.value,
                                  additionalInstructions: e.target.value
                                }
                              }
                              setEditData({ ...editData, nodes: newNodes })
                            }
                          }}
                          rows={3}
                          placeholder="Additional context or instructions..."
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <div className="font-medium">No AI configured</div>
                <div className="text-xs text-gray-500">This engine has no AI nodes in its workflow</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border-t border-slate-600 p-4">
          <div className="flex items-center justify-end space-x-4">
            <UltraButton
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </UltraButton>
            <UltraButton
              variant="primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </UltraButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubEngineEditModal


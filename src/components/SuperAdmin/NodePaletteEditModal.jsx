import React, { useState, useEffect } from 'react'
import { X, Save, Settings, FileText, Brain, Zap, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const NodePaletteEditModal = ({ isOpen, onClose, node }) => {
  const [config, setConfig] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    userPrompt: '',
    negativePrompt: '',
    processingInstructions: '',
    outputFormat: '',
    errorHandling: '',
    conflictResolution: '',
    qualityValidation: '',
    maxTokens: 3000,
    temperature: 0.7
  })
  
  const [activeTab, setActiveTab] = useState('instructions')
  const [saving, setSaving] = useState(false)

  // Load node configuration when modal opens
  useEffect(() => {
    if (node && isOpen) {
      console.log('🔍 Loading Node Palette node for editing:', node)
      
      setConfig({
        name: node.name || '',
        description: node.description || '',
        systemPrompt: node.configuration?.systemPrompt || '',
        userPrompt: node.configuration?.userPrompt || '',
        negativePrompt: node.configuration?.negativePrompt || '',
        processingInstructions: node.configuration?.processingInstructions || '',
        outputFormat: node.configuration?.outputFormat || '',
        errorHandling: node.configuration?.errorHandling || '',
        conflictResolution: node.configuration?.conflictResolution || '',
        qualityValidation: node.configuration?.qualityValidation || '',
        maxTokens: node.configuration?.maxTokens || 3000,
        temperature: node.configuration?.temperature || 0.7
      })
    }
  }, [node, isOpen])

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log('🔍 Saving Node Palette node:', {
        nodeId: node.node_id || node.id,
        nodeName: node.name,
        config: config
      })
      
      const updateData = {
        name: config.name,
        description: config.description,
        configuration: {
          systemPrompt: config.systemPrompt,
          userPrompt: config.userPrompt,
          negativePrompt: config.negativePrompt,
          processingInstructions: config.processingInstructions,
          outputFormat: config.outputFormat,
          errorHandling: config.errorHandling,
          conflictResolution: config.conflictResolution,
          qualityValidation: config.qualityValidation,
          maxTokens: config.maxTokens,
          temperature: config.temperature
        },
        updated_at: new Date().toISOString()
      }
      
      console.log('🔍 Update data:', updateData)
      
      const { error } = await supabase
        .from('node_palettes')
        .update(updateData)
        .eq('node_id', node.node_id || node.id)
      
      if (error) {
        console.error('❌ Database update error:', error)
        throw error
      }
      
      console.log('✅ Node Palette updated successfully!')
      toast.success('Master Node updated in database!')
      onClose()
      
    } catch (error) {
      console.error('❌ Failed to save Node Palette:', error)
      toast.error('Failed to save Master Node configuration')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Settings },
    { id: 'instructions', label: 'Instructions', icon: FileText },
    { id: 'ai', label: 'AI Integration', icon: Brain },
    ...(node?.type !== 'input' ? [{ id: 'advanced', label: 'Advanced', icon: Zap }] : []),
    { id: 'variables', label: 'Variables', icon: FileText },
    { id: 'test', label: 'Test Input', icon: RefreshCw }
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="superadmin-theme rounded-2xl border border-subtle w-full max-w-4xl max-h-[90vh] overflow-hidden" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-soft)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }}>
              <Settings className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Edit Master Node: {config.name || node?.name || 'Unnamed'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Configure master template - syncs to database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors focus-ring hover:bg-gray-700"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-subtle">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 focus-ring ${
                activeTab === tab.id
                  ? 'role-gradient-process text-white rounded-t-lg'
                  : 'text-secondary hover:bg-surface-hover'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Node Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full rounded-lg px-4 py-2"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  placeholder="Master node name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 h-24"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  placeholder="Node description and purpose..."
                />
              </div>
            </div>
          )}

          {/* Instructions Tab */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Node Instructions</label>
                <textarea
                  value={config.processingInstructions}
                  onChange={(e) => setConfig({ ...config, processingInstructions: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 h-32"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  placeholder="Technical processing instructions for workflow execution..."
                />
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Technical instructions for workflow engine on how to process this node's data and execute its function
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Expert System Prompt</label>
                <textarea
                  value={config.systemPrompt}
                  onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 h-32"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  placeholder="System prompt for AI model..."
                />
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  System-level prompt that defines the AI's role and behavior
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>User Prompt Template</label>
                <textarea
                  value={config.userPrompt}
                  onChange={(e) => setConfig({ ...config, userPrompt: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 h-32"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  placeholder="Professional user prompt template with dynamic variables..."
                />
              </div>
              
              <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Negative Prompt (Restrictions)</label>
                <textarea
                  value={config.negativePrompt}
                  onChange={(e) => setConfig({ ...config, negativePrompt: e.target.value })}
                    className="w-full rounded-lg px-4 py-2 h-24"
                    style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  placeholder="Explicitly tell AI what NOT to do or include..."
                />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Clear restrictions and forbidden behaviors to ensure AI stays within defined boundaries
                </p>
              </div>
            </div>
          )}

          {/* AI Integration Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">AI Integration</h3>
                  <p className="text-sm text-gray-400">Configure AI models and processing</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Max Tokens</label>
                  <input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                    className="w-full rounded-lg px-4 py-2"
                    style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full rounded-lg px-4 py-2"
                    style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Advanced Configuration Fields - For all node types */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Advanced Node Configuration</h4>
                <div className="w-full h-px" style={{ background: 'var(--border-subtle)' }} />
                
                {/* Error Handling Configuration */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Error Handling Protocol</label>
                  <textarea
                    value={config.errorHandling}
                    onChange={(e) => setConfig({ ...config, errorHandling: e.target.value })}
                    className="w-full rounded-lg px-4 py-2 h-24"
                    style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    placeholder="Professional error reporting with specific error codes and actionable messages..."
                  />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    How this node handles errors and what error messages it provides for debugging
                  </p>
                </div>
                
                {/* Conflict Resolution Configuration */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Conflict Resolution Strategy</label>
                  <textarea
                    value={config.conflictResolution}
                    onChange={(e) => setConfig({ ...config, conflictResolution: e.target.value })}
                    className="w-full rounded-lg px-4 py-2 h-24"
                    style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    placeholder="How to resolve contradictory data and maintain quality..."
                  />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Strategy for handling contradictory inputs while maintaining content integrity
                  </p>
                </div>
                
                {/* Quality Validation Configuration */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Quality Validation Standards</label>
                  <textarea
                    value={config.qualityValidation}
                    onChange={(e) => setConfig({ ...config, qualityValidation: e.target.value })}
                    className="w-full rounded-lg px-4 py-2 h-24"
                    style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    placeholder="Quality standards and validation criteria..."
                  />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Quality standards this node must meet before outputting results
                  </p>
                </div>
                
                {/* Output Format Configuration */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>JSON Output Format Structure</label>
                  <textarea
                    value={config.outputFormat}
                    onChange={(e) => setConfig({ ...config, outputFormat: e.target.value })}
                    className="w-full rounded-lg px-4 py-2 h-32"
                    style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    placeholder="Exact JSON structure for next node input..."
                  />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Precise JSON format that this node outputs for seamless next-node processing
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Variables Tab */}
          {activeTab === 'variables' && (
            <div className="space-y-6">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-200">Master Node Variables</h3>
                <p className="text-sm text-purple-300 mb-4">
                  Configure default variables for this master node template
                </p>
                <div className="text-center py-8">
                  <p className="text-gray-400">Variable configuration for master nodes</p>
                </div>
              </div>
            </div>
          )}

          {/* Test Input Tab */}
          {activeTab === 'test' && (
            <div className="space-y-6">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-200">Master Node Testing</h3>
                <p className="text-sm text-green-300 mb-4">
                  Test configuration for this master node template
                </p>
                <div className="text-center py-8">
                  <p className="text-gray-400">Test configuration for master nodes</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-subtle">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors focus-ring"
            style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 focus-ring"
          >
            {saving ? 'Saving...' : 'Save Master Template'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NodePaletteEditModal

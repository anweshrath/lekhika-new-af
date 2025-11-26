import React, { useState } from 'react'
import { X, Save, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

const NodeConfigurationModal = ({ isOpen, onClose, nodeData, onSave }) => {
  const [config, setConfig] = useState(nodeData?.data || {})
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!config.label?.trim()) {
      toast.error('Node label is required')
      return
    }

    setSaving(true)
    try {
      await onSave(config)
      toast.success('Node configuration saved')
      onClose()
    } catch (error) {
      console.error('Error saving node config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="superadmin-theme rounded-2xl border border-subtle w-[90vw] max-w-[1280px] min-w-[800px] h-[50.625vw] max-h-[720px] min-h-[450px] overflow-hidden flex flex-col" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-soft)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{nodeData?.type || 'Node'} Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors focus-ring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Node Label</label>
                <input
                  type="text"
                  value={config.label || ''}
                  onChange={(e) => setConfig({ ...config, label: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 focus-ring"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  placeholder="Enter node label"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  value={config.description || ''}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 h-24 focus-ring"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  placeholder="Enter node description"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Node Type</label>
                <select
                  value={config.type || ''}
                  onChange={(e) => setConfig({ ...config, type: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 focus-ring"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  <option value="input">Input Node</option>
                  <option value="process">Process Node</option>
                  <option value="output">Output Node</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>AI Model</label>
                <select
                  value={config.model || ''}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 focus-ring"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  <option value="">Select AI Model</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Temperature</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature || 0.7}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Current: {config.temperature || 0.7}</span>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Max Tokens</label>
                <input
                  type="number"
                  value={config.maxTokens || 2000}
                  onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                  className="w-full rounded-lg px-4 py-2 focus-ring"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  min="100"
                  max="4000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-subtle">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors focus-ring"
            style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg disabled:opacity-50 transition-colors focus-ring"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NodeConfigurationModal
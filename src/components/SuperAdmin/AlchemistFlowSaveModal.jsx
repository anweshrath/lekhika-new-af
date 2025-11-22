/**
 * ALCHEMIST FLOW SAVE MODAL
 * Save modal for Alchemist flows
 */

import React, { useState } from 'react'
import { X, Save, Rocket } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'
import toast from 'react-hot-toast'

const AlchemistFlowSaveModal = ({ isOpen, onClose, onSave, nodes, edges, currentFlow }) => {
  const { getSuperAdminUserId, isAuthenticated, refreshSession } = useSuperAdmin()
  const [flowName, setFlowName] = useState(currentFlow?.name || '')
  const [flowDescription, setFlowDescription] = useState(currentFlow?.description || '')
  const [engineName, setEngineName] = useState(currentFlow?.name || '')
  const [engineDescription, setEngineDescription] = useState(currentFlow?.description || '')
  const [saving, setSaving] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedFlowId, setSavedFlowId] = useState(null)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!flowName.trim()) {
      toast.error('Please enter a flow name')
      return
    }

    setSaving(true)
    setSaveSuccess(false)

    try {
      // Check SuperAdmin authentication
      if (!isAuthenticated()) {
        console.error('❌ SuperAdmin not authenticated, attempting to refresh session...')
        try {
          await refreshSession()
          if (!isAuthenticated()) {
            console.error('❌ Session refresh failed')
            toast.error('You must be logged in as SuperAdmin to save an Alchemist flow')
            return
          }
          console.log('✅ Session refreshed successfully')
        } catch (error) {
          console.error('❌ Session refresh error:', error)
          toast.error('You must be logged in as SuperAdmin to save an Alchemist flow')
          return
        }
      }

      const userId = getSuperAdminUserId()

      const flowData = {
        name: flowName.trim(),
        description: flowDescription.trim(),
        steps: nodes, // Store nodes directly as JSON
        configurations: {
          edges: edges,
          category: 'alchemist',
          suite: 'Content Creation',
          priority: 1,
          metadata: {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            lastModified: new Date().toISOString()
          }
        },
        type: 'full',
        is_default: false,
        usage_count: 0,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      let result
      let isUpdate = false

      if (currentFlow && currentFlow.id) {
        // Update existing flow
        flowData.id = currentFlow.id
        flowData.updated_at = new Date().toISOString()
        
        const { data, error } = await supabase
          .from('alchemist_flows')
          .update(flowData)
          .eq('id', currentFlow.id)
          .select()

        if (error) throw error
        result = data[0]
        isUpdate = true
      } else {
        // Create new flow
        const { data, error } = await supabase
          .from('alchemist_flows')
          .insert([flowData])
          .select()

        if (error) throw error
        result = data[0]
        isUpdate = false
      }

      toast.success(`Alchemist flow "${flowName}" ${isUpdate ? 'updated' : 'saved'} successfully!`)
      setSaveSuccess(true)
      setSavedFlowId(result.id)
      onSave(result)

    } catch (error) {
      console.error('Error saving Alchemist flow:', error)
      toast.error(`Failed to save Alchemist flow: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeploy = async () => {
    if (!saveSuccess || !savedFlowId) {
      toast.error('Please save the flow first before deploying')
      return
    }

    if (!engineName.trim()) {
      toast.error('Please enter an engine name')
      return
    }

    setDeploying(true)

    try {
      // Check SuperAdmin authentication
      if (!isAuthenticated()) {
        console.error('❌ SuperAdmin not authenticated, attempting to refresh session...')
        try {
          await refreshSession()
          if (!isAuthenticated()) {
            console.error('❌ Session refresh failed')
            toast.error('You must be logged in as SuperAdmin to deploy an Alchemist flow')
            return
          }
          console.log('✅ Session refreshed successfully')
        } catch (error) {
          console.error('❌ Session refresh error:', error)
          toast.error('You must be logged in as SuperAdmin to deploy an Alchemist flow')
          return
        }
      }

      const userId = getSuperAdminUserId()

      // Alchemist engines are not default engines by default
      // Setting is_default to false and default_order to null to satisfy constraint
      const isDefault = false
      const defaultOrder = null

      // Deploy Alchemist flow as engine to ai_engines table
      const engineData = {
        name: engineName.trim(),
        description: engineDescription.trim() || flowDescription.trim(),
        type: 'alchemist_content_creation',
        flow_config: {
          type: 'alchemist',
          category: 'content_creation',
          nodes: nodes,
          edges: edges,
          metadata: {
            nodeCount: nodes.length,
            hasInputFields: nodes.some(node => node.data?.inputFields?.length > 0),
            hasAI: nodes.some(node => node.data?.aiEnabled),
            deployedAt: new Date().toISOString(),
            deployedFrom: 'alchemist_flow_editor',
            sourceFlowId: savedFlowId,
            alchemistFlow: true
          }
        },
        nodes: nodes,
        edges: edges,
        created_by: userId,
        status: 'active',
        is_default: isDefault,
        default_order: defaultOrder,
        tier: 'pro', // Default tier for Alchemist engines
        active: true,
        metadata: {
          nodeCount: nodes.length,
          hasInputFields: nodes.some(node => node.data?.inputFields?.length > 0),
          hasAI: nodes.some(node => node.data?.aiEnabled),
          deployedAt: new Date().toISOString(),
          deployedFrom: 'alchemist_flow_editor',
          sourceFlowId: savedFlowId,
          alchemistEngine: true,
          category: 'content_creation'
        }
      }

      const { data: deployedEngine, error: deployError } = await supabase
        .from('ai_engines')
        .insert([engineData])
        .select()

      if (deployError) {
        console.error('Alchemist engine deploy error:', deployError)
        toast.error(`Failed to deploy Alchemist engine: ${deployError.message}`)
        return
      }

      toast.success(`🚀 Alchemist flow "${flowName}" deployed as engine "${engineName}" successfully!`)
      console.log('✅ Alchemist Engine deployed:', deployedEngine[0])
      
      // Close modal after successful deploy
      onClose()

    } catch (error) {
      console.error('Unexpected Alchemist deploy error:', error)
      toast.error('Failed to deploy Alchemist flow as engine')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="superadmin-theme rounded-2xl shadow-2xl w-full max-w-md border border-subtle" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-soft)' }}>
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Save Alchemist Flow</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors focus-ring"
          >
            <X className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {!saveSuccess ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Flow Name *
                </label>
                <input
                  type="text"
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  placeholder="Enter flow name..."
                  className="w-full px-4 py-3 rounded-lg focus-ring"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {currentFlow ? 'Keep the same name to overwrite, or change it to create a new flow' : 'This name will be used to save the flow'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Flow Description (Optional)
                </label>
                <textarea
                  value={flowDescription}
                  onChange={(e) => setFlowDescription(e.target.value)}
                  placeholder="Describe this flow..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg focus-ring"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="text-sm rounded-lg p-3" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' }}>
                <p><span className="mr-1">📊</span>Nodes: {nodes.length}</p>
                <p><span className="mr-1">🔗</span>Edges: {edges.length}</p>
                {currentFlow && <p><span className="mr-1">📁</span>Current Flow: {currentFlow.name}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg p-3 mb-4" style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>✅ Flow saved successfully!</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-medium">Flow saved:</span> {flowName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Engine Name *
                </label>
                <input
                  type="text"
                  value={engineName}
                  onChange={(e) => setEngineName(e.target.value)}
                  placeholder="Enter engine name..."
                  className="w-full px-4 py-3 rounded-lg focus-ring"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  This is the name users will see when using this engine
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Engine Description (Optional)
                </label>
                <textarea
                  value={engineDescription}
                  onChange={(e) => setEngineDescription(e.target.value)}
                  placeholder="Describe the engine for users..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg focus-ring"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            </>
          )}
        </div>
        
        <div className="p-6 border-t border-subtle flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors focus-ring"
            style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            disabled={saving || deploying}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || deploying}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 focus-ring"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : currentFlow?.id ? 'Update Flow' : 'Save Flow'}
          </button>
          {saveSuccess && (
            <button
              onClick={handleDeploy}
              disabled={saving || deploying}
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 focus-ring"
            >
              <Rocket className="w-4 h-4" />
              {deploying ? 'Deploying...' : 'Deploy as Engine'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlchemistFlowSaveModal

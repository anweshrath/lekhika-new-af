import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Save, X, Rocket, CheckCircle, AlertTriangle } from 'lucide-react'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'
import { CLIENT_FLOWS } from '../../data/clientFlows'

const FlowSaveModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  nodes,
  edges,
  currentFlow = null,
  clientFlowKey = null
}) => {
  const { getSuperAdminUserId, isAuthenticated, refreshSession } = useSuperAdmin()
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [engineName, setEngineName] = useState('')
  const [engineDescription, setEngineDescription] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedFlowId, setSavedFlowId] = useState(null)
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false)
  const [existingFlowInfo, setExistingFlowInfo] = useState(null)
  const [aiConfigured, setAiConfigured] = useState(false)
  const [checkingAiConfig, setCheckingAiConfig] = useState(false)
  const [selectedFlowKey, setSelectedFlowKey] = useState(clientFlowKey || '')

  // Populate form when currentFlow changes
  useEffect(() => {
    if (currentFlow) {
      setFlowName(currentFlow.name || '')
      setFlowDescription(currentFlow.description || '')
      setIsDefault(currentFlow.is_default || false)
      setSaveSuccess(false)
      setSavedFlowId(null)
      // Pre-populate engine name with flow name (user can change it)
      setEngineName(currentFlow.name || '')
      setEngineDescription(currentFlow.description || '')
    } else {
      // Check if this might be an existing flow by comparing structure
      detectExistingFlow()
    }
  }, [currentFlow, nodes])

  // SURGICAL FIX: Sync selectedFlowKey when clientFlowKey prop changes OR modal opens
  useEffect(() => {
    if (clientFlowKey) {
      setSelectedFlowKey(clientFlowKey)
      console.log('🎯 Auto-selected flow_key for presets:', clientFlowKey)
    }
  }, [clientFlowKey, isOpen])
  
  // SURGICAL FIX: Also set on modal open if clientFlowKey exists
  useEffect(() => {
    if (isOpen && clientFlowKey && !selectedFlowKey) {
      setSelectedFlowKey(clientFlowKey)
      console.log('🎯 Modal opened - setting flow_key:', clientFlowKey)
    }
  }, [isOpen])

  // Detect if this might be an existing flow
  const detectExistingFlow = async () => {
    try {
      const userId = getSuperAdminUserId()
      if (!userId || !nodes || nodes.length === 0) {
        generateNewFlowName()
        return
      }

      // Create a signature of the current flow structure
      const flowSignature = createFlowSignature(nodes)
      
      // Check for flows with similar structure
      const { data: existingFlows, error } = await supabase
        .from('ai_flows')
        .select('id, name, description, nodes, edges')
        .eq('created_by', userId)
        .order('updated_at', { ascending: false })
        .limit(10)

      if (error) throw error

      // Find the best match
      let bestMatch = null
      let bestScore = 0

      for (const flow of existingFlows || []) {
        const score = calculateSimilarityScore(flowSignature, flow)
        if (score > bestScore && score > 0.7) { // 70% similarity threshold
          bestScore = score
          bestMatch = flow
        }
      }

      if (bestMatch) {
        // Suggest updating the existing flow
        setFlowName(bestMatch.name)
        setFlowDescription(bestMatch.description || '')
        setIsDefault(bestMatch.is_default || false)
        console.log(`🔍 Detected existing flow: ${bestMatch.name} (${Math.round(bestScore * 100)}% similarity)`) 
      } else {
        generateNewFlowName()
      }
    } catch (error) {
      console.error('❌ Failed to detect existing flow:', error)
      generateNewFlowName()
    }
  }

  // Create a signature of the flow structure
  const createFlowSignature = (nodes) => {
    return {
      nodeCount: nodes.length,
      nodeTypes: nodes.map(n => n.type).sort(),
      nodeLabels: nodes.map(n => n.data?.label).filter(Boolean).sort(),
      hasAI: nodes.some(n => n.data?.aiEnabled),
      hasConditions: nodes.some(n => n.type === 'condition'),
      hasStructural: nodes.some(n => n.type === 'structural')
    }
  }

  // Calculate similarity score between two flow signatures
  const calculateSimilarityScore = (signature1, flow2) => {
    try {
      const flow2Nodes = typeof flow2.nodes === 'string' ? JSON.parse(flow2.nodes) : flow2.nodes || []
      const signature2 = createFlowSignature(flow2Nodes)
      
      let score = 0
      let factors = 0

      // Node count similarity
      if (signature1.nodeCount > 0 && signature2.nodeCount > 0) {
        const countDiff = Math.abs(signature1.nodeCount - signature2.nodeCount)
        const countScore = Math.max(0, 1 - (countDiff / Math.max(signature1.nodeCount, signature2.nodeCount)))
        score += countScore * 0.3
        factors += 0.3
      }

      // Node types similarity
      const types1 = signature1.nodeTypes
      const types2 = signature2.nodeTypes
      const commonTypes = types1.filter(t => types2.includes(t)).length
      const totalTypes = new Set([...types1, ...types2]).size
      if (totalTypes > 0) {
        score += (commonTypes / totalTypes) * 0.4
        factors += 0.4
      }

      // Feature similarity
      const features1 = [signature1.hasAI, signature1.hasConditions, signature1.hasStructural]
      const features2 = [signature2.hasAI, signature2.hasConditions, signature2.hasStructural]
      const commonFeatures = features1.filter((f, i) => f === features2[i]).length
      score += (commonFeatures / features1.length) * 0.3
      factors += 0.3

      return factors > 0 ? score / factors : 0
    } catch (error) {
      console.error('❌ Error calculating similarity:', error)
      return 0
    }
  }

  // Generate name for new flow
  const generateNewFlowName = () => {
    // Prefer a human-friendly name from node data if present
    const paletteName = nodes?.find(n => n.type === 'input')?.data?.label || nodes?.[0]?.data?.label
    if (paletteName && typeof paletteName === 'string' && paletteName.trim().length > 0) {
      setFlowName(paletteName.trim())
      setFlowDescription(`Workflow based on "${paletteName.trim()}". Created on ${new Date().toLocaleDateString()}.`)
      setIsDefault(false)
      setSaveSuccess(false)
      setSavedFlowId(null)
      return
    }

    const nodeCount = nodes.length
    const hasAI = nodes.some(node => node.data?.aiEnabled)
    const hasConditions = nodes.some(node => node.type === 'condition')
    const hasStructural = nodes.some(node => node.type === 'structural')
    
    let suggestedName = 'New Flow'
    let suggestedDescription = ''
    
    if (nodeCount > 0) {
      const components = []
      if (hasStructural) components.push('Structural')
      if (hasAI) components.push('AI')
      if (hasConditions) components.push('Conditional')
      
      suggestedName = `${nodeCount}-Step ${components.join(' ')} Flow`
      suggestedDescription = `A ${nodeCount}-step workflow${hasAI ? ' with AI integration' : ''}${hasConditions ? ' including conditional logic' : ''}${hasStructural ? ' with structural elements' : ''}. Created on ${new Date().toLocaleDateString()}.`
    }
    
    setFlowName(suggestedName)
    setFlowDescription(suggestedDescription)
    setIsDefault(false)
    setSaveSuccess(false)
    setSavedFlowId(null)
  }

  // Check AI configuration status
  const checkAiConfiguration = async () => {
    setCheckingAiConfig(true)
    try {
      // Check if any nodes have AI enabled
      const aiNodes = nodes.filter(node => node.data?.aiEnabled)
      
      if (aiNodes.length === 0) {
        setAiConfigured(true) // No AI nodes, so no configuration needed
        return
      }

      // Check if AI providers are configured
      const { data: providers, error } = await supabase
        .from('ai_providers')
        .select('name, is_active')
        .eq('is_active', true)

      if (error) throw error

      // Check if any AI models are available
      const { data: models, error: modelsError } = await supabase
        .from('ai_model_metadata')
        .select('provider, model_id, is_active')
        .eq('is_active', true)

      if (modelsError) throw modelsError

      // Check if there are active providers with models
      const activeProviders = providers || []
      const activeModels = models || []
      
      // Check if all AI nodes have models selected
      const allAiNodesConfigured = aiNodes.every(node => {
        const selectedModels = node.data?.selectedModels || []
        return selectedModels.length > 0
      })
      
      const hasConfiguredAi = activeProviders.length > 0 && activeModels.length > 0 && allAiNodesConfigured
      
      setAiConfigured(hasConfiguredAi)
      
      if (!hasConfiguredAi) {
        console.log('⚠️ AI not configured - providers:', activeProviders.length, 'models:', activeModels.length, 'aiNodes:', aiNodes.length, 'configuredNodes:', aiNodes.filter(n => (n.data?.selectedModels || []).length > 0).length)
      } else {
        console.log('✅ AI configured - providers:', activeProviders.length, 'models:', activeModels.length, 'aiNodes:', aiNodes.length)
      }
      
    } catch (error) {
      console.error('Error checking AI configuration:', error)
      setAiConfigured(false)
    } finally {
      setCheckingAiConfig(false)
    }
  }

  // Check AI configuration when modal opens or nodes change
  useEffect(() => {
    if (isOpen) {
      checkAiConfiguration()
    }
  }, [isOpen, nodes])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!flowName.trim()) {
      toast.error('Flow name is required')
      return
    }

    // Check for duplicate names (only if it's a new flow or name changed)
    if (!currentFlow || currentFlow.name !== flowName.trim()) {
      try {
        const { data: existingFlows, error } = await supabase
          .from('ai_flows')
          .select('id, name')
          .eq('name', flowName.trim())
          .eq('created_by', getSuperAdminUserId())

        if (error) throw error

        if (existingFlows && existingFlows.length > 0) {
          const existingFlow = existingFlows[0]
          const shouldUpdate = confirm(
            `A flow named "${flowName.trim()}" already exists. Do you want to update it? Click OK to update, Cancel to rename.`
          )
          
          if (shouldUpdate) {
            // Update the existing flow - we'll handle this in the save logic below
            // Just continue with the save process
          } else {
            // User wants to rename, don't proceed
            return
          }
        }
      } catch (error) {
        console.error('Error checking for duplicate names:', error)
        toast.error('Failed to check for duplicate flow names')
        return
      }
    }

    setSaving(true)

    try {
      // Check if SuperAdmin is authenticated
      if (!isAuthenticated()) {
        console.error('❌ SuperAdmin not authenticated, attempting to refresh session...')
        try {
          await refreshSession()
          if (!isAuthenticated()) {
            console.error('❌ Session refresh failed')
            toast.error('You must be logged in as SuperAdmin to save a flow')
            return
          }
          console.log('✅ Session refreshed successfully')
        } catch (error) {
          console.error('❌ Session refresh error:', error)
          toast.error('You must be logged in as SuperAdmin to save a flow')
          return
        }
      }

      // Get SuperAdmin user ID
      const userId = getSuperAdminUserId()

      // User-configured selectedModels in flow editor are preserved and saved
      // Hardcoded models from CLIENT_FLOWS templates are already stripped when loading templates
      const flowData = {
        name: flowName.trim(),
        description: flowDescription.trim(),
        type: 'book_generation',
        nodes: nodes, // SURGICAL FIX: Ensure nodes are saved at the top level
        edges: edges, // SURGICAL FIX: Ensure edges are saved at the top level
        created_by: userId,
        is_default: isDefault,
        configurations: {
          nodes: nodes,
          edges: edges,
          nodeCount: nodes.length,
          hasConditions: nodes.some(node => node.type === 'condition'),
          hasAI: nodes.some(node => node.data?.aiEnabled)
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      let result
      let isUpdate = false

      // Check if we're updating an existing flow (either currentFlow or duplicate name)
      if (currentFlow && currentFlow.id) {
        // Update existing flow
        flowData.id = currentFlow.id
        flowData.updated_at = new Date().toISOString()
        
        const { data, error } = await supabase
          .from('ai_flows')
          .update(flowData)
          .eq('id', currentFlow.id)
          .select()

        if (error) throw error
        result = data[0]
        isUpdate = true
      } else {
        // Check if there's a duplicate name to update
        const { data: existingFlows, error: checkError } = await supabase
          .from('ai_flows')
          .select('id')
          .eq('name', flowName.trim())
          .eq('created_by', userId)

        if (checkError) throw checkError

        if (existingFlows && existingFlows.length > 0) {
          // Show overwrite confirmation dialog
          setExistingFlowInfo({
            id: existingFlows[0].id,
            name: flowName.trim(),
            description: flowDescription.trim()
          })
          setShowOverwriteDialog(true)
          setSaving(false)
          return
        } else {
          // Create new flow
          const { data, error } = await supabase
            .from('ai_flows')
            .insert([flowData])
            .select()

          if (error) throw error
          result = data[0]
          isUpdate = false
        }
      }

      toast.success(`Flow "${flowName}" ${isUpdate ? 'updated' : 'saved'} successfully`)
      setSaveSuccess(true)
      setSavedFlowId(result.id)
      onSave(result)

    } catch (error) {
      console.error('Unexpected flow save error:', error)
      toast.error('Failed to save flow')
    } finally {
      setSaving(false)
    }
  }

  // Handle overwrite confirmation
  const handleOverwrite = async () => {
    if (!existingFlowInfo) return
    
    setSaving(true)
    setShowOverwriteDialog(false)
    
    try {
      const flowData = {
        name: flowName.trim(),
        description: flowDescription.trim(),
        type: 'book_generation',
        nodes: nodes,
        edges: edges,
        created_by: getSuperAdminUserId(),
        is_default: isDefault,
        metadata: {
          nodeCount: nodes.length,
          hasConditions: nodes.some(node => node.type === 'condition'),
          hasAI: nodes.some(node => node.data?.aiEnabled),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        id: existingFlowInfo.id,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('ai_flows')
        .update(flowData)
        .eq('id', existingFlowInfo.id)
        .select()

      if (error) throw error
      
      toast.success(`Flow "${flowName}" overwritten successfully`)
      setSaveSuccess(true)
      setSavedFlowId(data[0].id)
      onSave(data[0])
      
    } catch (error) {
      console.error('Overwrite error:', error)
      toast.error('Failed to overwrite flow')
    } finally {
      setSaving(false)
      setExistingFlowInfo(null)
    }
  }

  // Handle rename and save as new
  const handleRenameAndSave = () => {
    setShowOverwriteDialog(false)
    // User can now change the name and save as new flow
    setFlowName(`${flowName} (Copy)`)
    setExistingFlowInfo(null)
  }

  // Cancel overwrite dialog
  const handleCancelOverwrite = () => {
    setShowOverwriteDialog(false)
    setExistingFlowInfo(null)
    setSaving(false)
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

    // Check AI configuration before deploying
    if (!aiConfigured) {
      toast.error('AI is not configured. Please configure AI providers and models before deploying.')
      return
    }

    setDeploying(true)

    try {
      // Check if SuperAdmin is authenticated
      if (!isAuthenticated()) {
        console.error('❌ SuperAdmin not authenticated, attempting to refresh session...')
        try {
          await refreshSession()
          if (!isAuthenticated()) {
            console.error('❌ Session refresh failed')
            toast.error('You must be logged in as SuperAdmin to deploy a flow')
            return
          }
          console.log('✅ Session refreshed successfully')
        } catch (error) {
          console.error('❌ Session refresh error:', error)
          toast.error('You must be logged in as SuperAdmin to deploy a flow')
          return
        }
      }

      // Get SuperAdmin user ID
      const userId = getSuperAdminUserId()

      // Calculate default_order if isDefault is true
      let defaultOrder = null
      if (isDefault) {
        // Get count of existing default engines
        const { count, error: countError } = await supabase
          .from('ai_engines')
          .select('*', { count: 'exact', head: true })
          .eq('is_default', true)
        
        if (countError) {
          console.error('Error counting default engines:', countError)
          toast.error('Failed to calculate default order')
          return
        }
        
        // Set default_order to next available number (max 10)
        defaultOrder = (count || 0) + 1
        if (defaultOrder > 10) {
          toast.error('Maximum 10 default engines allowed. Please unset an existing default engine first.')
          return
        }
      }

      // SURGICAL FIX: Define scrubbedNodes for deployment (same as in handleSaveFlow)
      const scrubbedNodes = nodes.map(node => {
        const { systemPrompt, userPrompt, ...restData } = node.data;
        return {
          ...node,
          data: {
            ...restData,
            ...(systemPrompt && { systemPrompt }),
            ...(userPrompt && { userPrompt }),
          }
        };
      });
      
      // SURGICAL FIX: Use BOTH selectedFlowKey AND clientFlowKey (prefer selectedFlowKey)
      const flowKeyToSave = selectedFlowKey || clientFlowKey
      
      // DEBUG: Log what flow_key we're about to save
      console.log('🔍 DEPLOY DEBUG:')
      console.log('  - selectedFlowKey state:', selectedFlowKey)
      console.log('  - clientFlowKey prop:', clientFlowKey)
      console.log('  - FINAL flow_key to save:', flowKeyToSave)

      // Deploy as engine to ai_engines using the saved flow data
      // User's configured selectedModels from flow editor are preserved in nodes
      const engineData = {
        name: engineName.trim(),
        description: engineDescription.trim() || flowDescription.trim(),
        type: 'book_generation',
        flow_config: {
          type: 'book_generation',
          nodes: scrubbedNodes,
          edges: edges,
          metadata: {
            nodeCount: scrubbedNodes.length,
            hasConditions: scrubbedNodes.some(node => node.type === 'condition'),
            hasAI: scrubbedNodes.some(node => node.data?.aiEnabled),
            deployedAt: new Date().toISOString(),
            deployedFrom: 'flow_editor',
            ...(flowKeyToSave ? { flow_key: flowKeyToSave } : {}),
            sourceFlowId: savedFlowId
          }
        },
        nodes: scrubbedNodes,
        edges: edges,
        created_by: userId,
        status: 'active',
        is_default: isDefault,
        default_order: defaultOrder,
        metadata: {
          nodeCount: nodes.length,
          hasConditions: nodes.some(node => node.type === 'condition'),
          hasAI: nodes.some(node => node.data?.aiEnabled),
          deployedAt: new Date().toISOString(),
          deployedFrom: 'flow_editor',
          ...(flowKeyToSave ? { flow_key: flowKeyToSave } : {}),
          sourceFlowId: savedFlowId
        }
      }
      
      console.log('📤 ENGINE DATA TO SAVE:')
      console.log('  - flow_config.metadata:', engineData.flow_config.metadata)
      console.log('  - metadata:', engineData.metadata)

      const { data: deployedEngine, error: deployError } = await supabase
        .from('ai_engines')
        .insert([engineData])
        .select()

      if (deployError) {
        console.error('Engine deploy error:', deployError)
        toast.error(`Failed to deploy engine: ${deployError.message}`)
        return
      }

      toast.success(`Flow "${flowName}" deployed as engine "${engineName}" successfully!`)
      onClose()

    } catch (error) {
      console.error('Unexpected deploy error:', error)
      toast.error('Failed to deploy flow as engine')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="superadmin-theme rounded-xl w-[500px] max-w-[90%] p-6 relative border border-subtle" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-soft)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary hover:text-white focus-ring"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          {currentFlow ? 'Update Flow' : 'Save New Flow'}
        </h2>
        
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Flow saved successfully!</span>
            </div>
            <p className="text-green-300 text-sm mt-1">
              Now configure the engine name and deploy
            </p>
          </div>
        )}

        {!saveSuccess ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Flow Name *
              </label>
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                placeholder="Enter flow name"
                className="w-full rounded-lg px-4 py-2"
                style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                required
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {currentFlow ? 'Keep the same name to overwrite, or change it to create a new flow' : 'This name will be used to save the flow'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Flow Description
              </label>
              <textarea
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                placeholder="Describe your flow (optional)"
                className="w-full rounded-lg px-4 py-2 min-h-[100px]"
                style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Base Flow for Presets (Optional)
              </label>
              <select
                value={selectedFlowKey}
                onChange={(e) => setSelectedFlowKey(e.target.value)}
                className="w-full rounded-lg px-4 py-2"
                style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                <option value="">-- No Presets --</option>
                {Object.entries(CLIENT_FLOWS).map(([flowKey, flowData]) => (
                  <option key={flowKey} value={flowKey}>
                    {flowData.name}
                  </option>
                ))}
              </select>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Select a base flow to enable preset compatibility. Users will be able to use DFY presets from this flow category.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="text-blue-500 rounded"
              />
              <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Set as default flow
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg mb-4 border border-subtle" style={{ background: 'var(--bg-surface-hover)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                placeholder="Enter engine name"
                className="w-full rounded-lg px-4 py-2"
                style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                required
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                This is the name users will see when using this engine
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Engine Description
              </label>
              <textarea
                value={engineDescription}
                onChange={(e) => setEngineDescription(e.target.value)}
                placeholder="Describe the engine for users (optional)"
                className="w-full rounded-lg px-4 py-2 min-h-[100px]"
                style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        )}

        {/* AI Configuration Status */}
        {nodes.some(node => node.data?.aiEnabled) && (
          <div className="mt-4 p-3 rounded-lg border border-subtle" style={{ background: 'var(--bg-surface-hover)' }}>
            <div className="flex items-center gap-2 mb-2">
              {checkingAiConfig ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : aiConfigured ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              )}
              <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                AI Configuration Status
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {checkingAiConfig ? (
                'Checking AI configuration...'
              ) : aiConfigured ? (
                '✅ AI is properly configured. You can deploy this flow.'
              ) : (
                '⚠️ AI is not configured. You can save the flow but cannot deploy it until AI is configured.'
              )}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-gray-600 focus-ring"
            style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || deploying}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center focus-ring"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Flow'}
          </button>
          {saveSuccess && (
            <button
              onClick={handleDeploy}
              disabled={saving || deploying || !aiConfigured}
              className={`px-4 py-2 text-white rounded-lg flex items-center ${
                aiConfigured 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-gray-500 cursor-not-allowed'
              } focus-ring`}
            >
              <Rocket className="w-4 h-4 mr-2" />
              {deploying ? 'Deploying...' : 'Deploy as Engine'}
            </button>
          )}
        </div>
      </div>

      {/* Overwrite Confirmation Dialog */}
      {showOverwriteDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="superadmin-theme rounded-xl w-[400px] max-w-[90%] p-6 relative border border-subtle" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-soft)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-surface-hover)' }}>
                <X className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Flow Already Exists</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>A flow with this name already exists</p>
              </div>
            </div>
            
            <div className="rounded-lg p-4 mb-6" style={{ background: 'var(--bg-surface-hover)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Flow "<span className="font-medium" style={{ color: 'var(--text-primary)' }}>${existingFlowInfo?.name}</span>" already exists.
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                What would you like to do?
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelOverwrite}
                className="px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors focus-ring"
                style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRenameAndSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-ring"
              >
                Rename & Save New
              </button>
              <button
                onClick={handleOverwrite}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors focus-ring"
              >
                Overwrite Existing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FlowSaveModal

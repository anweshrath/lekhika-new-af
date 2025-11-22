/**
 * ALCHEMIST FLOW CANVAS
 * Specialized React Flow canvas for content creation workflows
 * Mirrors the structure of the main Flow component but isolated
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Plus, Save, Play, Settings, Eye, Trash2, Copy, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

// Import Alchemist-specific components
import AlchemistNodeModal from './AlchemistNodeModal'
import AlchemistFlowSaveModal from './AlchemistFlowSaveModal'
import AlchemistWorkflowExecutionModal from './AlchemistWorkflowExecutionModal'
import { alchemistFlowService } from '../../services/alchemistFlowService'

// Import Alchemist-specific nodes
import { alchemistNodeTypes } from './AlchemistNodes'
import { alchemistNodeStyleService } from '../../services/alchemistNodeStyleService'

const AlchemistFlowCanvas = () => {
  console.log('AlchemistFlowCanvas rendering...')
  
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [availableAIModels, setAvailableAIModels] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Fetch active AI models from database
  useEffect(() => {
    fetchActiveAIModels()
  }, [])

  const fetchActiveAIModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_model_metadata')
        .select('model_id, model_name, provider, description, input_cost_per_million, output_cost_per_million, context_window_tokens, specialties')
        .eq('is_active', true)
        .order('provider', { ascending: true })
        .order('model_name', { ascending: true })

      if (error) throw error

      setAvailableAIModels(data || [])
      console.log('Fetched AI models:', data?.length || 0)
      
      // Initialize nodes with random AI models after fetching
      initializeNodesWithRandomAI(data || [])
    } catch (error) {
      console.error('Error fetching AI models:', error)
      toast.error('Failed to fetch AI models')
      // Fallback to default models
      initializeNodesWithRandomAI([])
    } finally {
      setLoading(false)
    }
  }

  // Get random AI model
  const getRandomAIModel = (availableModels) => {
    if (!availableModels || availableModels.length === 0) {
      // Fallback models
      const fallbackModels = [
        { model_id: 'gpt-4o', model_name: 'GPT-4o', provider: 'OpenAI' },
        { model_id: 'claude-3', model_name: 'Claude 3', provider: 'Anthropic' },
        { model_id: 'gemini-pro', model_name: 'Gemini Pro', provider: 'Google' }
      ]
      return fallbackModels[Math.floor(Math.random() * fallbackModels.length)]
    }
    return availableModels[Math.floor(Math.random() * availableModels.length)]
  }

  // Initialize nodes with random AI models
  const initializeNodesWithRandomAI = (availableModels) => {
    const initialNodes = [
      // 5 MASTER NODES ONLY
      {
        id: 'input-master-1',
        type: 'inputMaster',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Input Master', 
          description: 'Data Collection & Input Management', 
          aiModel: getRandomAIModel(availableModels),
          configuration: {
            alchemistVariables: {},
            features: ['Dynamic form generation', 'Smart validation', 'Auto-suggestions', 'Variable management']
          }
        }
      },
      {
        id: 'process-master-1',
        type: 'processMaster',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Process Master', 
          description: 'AI Content Processing & Generation', 
          aiModel: getRandomAIModel(availableModels),
          configuration: {
            alchemistVariables: {},
            features: ['Content writing', 'Research engine', 'Quality optimization', 'Style adaptation']
          }
        }
      },
      {
        id: 'condition-master-1',
        type: 'conditionMaster',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Condition Master', 
          description: 'Logic Gates & Decision Making', 
          aiModel: getRandomAIModel(availableModels),
          configuration: {
            alchemistVariables: {},
            features: ['Logic gates', 'Decision trees', 'Validation checks', 'Conditional branching']
          }
        }
      },
      {
        id: 'structural-master-1',
        type: 'structuralMaster',
        position: { x: 200, y: 300 },
        data: { 
          label: 'Structural Master', 
          description: 'Blueprint Design & Structure Planning', 
          aiModel: getRandomAIModel(availableModels),
          configuration: {
            alchemistVariables: {},
            features: ['Blueprint design', 'Template management', 'Layout engine', 'Structure planning']
          }
        }
      },
      {
        id: 'output-master-1',
        type: 'outputMaster',
        position: { x: 400, y: 300 },
        data: { 
          label: 'Output Master', 
          description: 'Multi-Format Export & Delivery', 
          aiModel: getRandomAIModel(availableModels),
          configuration: {
            alchemistVariables: {},
            features: ['Multi-format export', 'Preview generation', 'Delivery management', 'Quality control']
          }
        }
      }
    ]

    setNodes(initialNodes)
    console.log('Initialized 5 Master Nodes with random AI models:', initialNodes.length)
  }
  
  console.log('Current nodes:', nodes)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [showNodePalette, setShowNodePalette] = useState(false)
  const [showNodeModal, setShowNodeModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showExecutionModal, setShowExecutionModal] = useState(false)
  const [executionData, setExecutionData] = useState(null)
  const [currentFlow, setCurrentFlow] = useState(null)

  const reactFlowWrapper = useRef(null)

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation()
    console.log('Node clicked:', node)
    console.log('Node data:', node.data)
    
    // Prevent multiple modals from opening
    if (showNodeModal) {
      console.log('Modal already open, ignoring click')
      return
    }
    
    setSelectedNode(node)
    setShowNodeModal(true)
  }, [showNodeModal])

  // Handle edge connection
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Add new node
  const addNode = useCallback(async (nodeType) => {
    try {
      // Create node in database first
      const nodeData = {
        node_id: `${nodeType}-${Date.now()}`,
        name: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Master`,
        description: `AI-powered ${nodeType} processing`,
        type: 'master',
        category: 'master',
        sub_category: nodeType,
        role: nodeType,
        icon: nodeType === 'input' ? '📝' : nodeType === 'process' ? '⚙️' : nodeType === 'condition' ? '🔀' : nodeType === 'structural' ? '🏗️' : '📤',
        gradient: nodeType === 'input' ? 'from-blue-500 to-blue-700' : nodeType === 'process' ? 'from-purple-500 to-purple-700' : nodeType === 'condition' ? 'from-green-500 to-green-700' : nodeType === 'structural' ? 'from-orange-500 to-orange-700' : 'from-gray-500 to-gray-700',
        is_ai_enabled: true,
        configuration: {
          globalSettings: {
            aiModel: 'gpt-4o',
            validationLevel: 'strict',
            autoSuggestions: true,
            syncMode: 'selective'
          },
          features: ['AI Integration', 'Dynamic Configuration', 'Real-time Processing'],
          variables: ['topic', 'target_audience', 'tone', 'word_count']
        },
        is_active: true,
        created_by: 'user'
      }

      // Save to database
      const savedNode = await alchemistFlowService.createNode(nodeData)
      
      // Create canvas node
      const newNode = {
        id: savedNode.node_id,
        type: nodeType,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: { 
          label: savedNode.name,
          description: savedNode.description,
          configuration: savedNode.configuration,
          databaseId: savedNode.id
        }
      }
      
      setNodes((nds) => [...nds, newNode])
      setShowNodePalette(false)
      toast.success(`${savedNode.name} created and saved to database!`)
    } catch (error) {
      console.error('Error creating node:', error)
      toast.error('Failed to create node')
    }
  }, [setNodes])

  // Delete node
  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    toast.success('Node deleted successfully')
  }, [setNodes, setEdges])

  // Delete edge
  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId))
    toast.success('Connection deleted successfully')
  }, [setEdges])

  // Clear all nodes and edges
  const clearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
      setNodes([])
      setEdges([])
      toast.success('Canvas cleared')
    }
  }, [setNodes, setEdges])

  // Sync with templates
  const syncWithTemplates = useCallback(async () => {
    try {
      // Fetch templates from ai_flows table
      const { data: templates, error } = await supabase
        .from('ai_flows')
        .select('*')
        .eq('type', 'template')
        .eq('is_active', true)
        .limit(5)

      if (error) throw error

      if (templates && templates.length > 0) {
        // Show template selection modal or auto-apply first template
        const template = templates[0]
        setNodes(template.nodes || [])
        setEdges(template.edges || [])
        toast.success(`Synced with template: ${template.name}`)
      } else {
        toast.info('No templates available for sync')
      }
    } catch (error) {
      console.error('Error syncing with templates:', error)
      toast.error('Failed to sync with templates')
    }
  }, [setNodes, setEdges])

  // Copy flow configuration
  const copyFlowConfig = useCallback(() => {
    const flowConfig = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type
      }))
    }
    
    navigator.clipboard.writeText(JSON.stringify(flowConfig, null, 2))
    toast.success('Flow configuration copied to clipboard')
  }, [nodes, edges])

  // Save flow
  const handleSaveFlow = useCallback(async () => {
    try {
      const flowData = {
        name: currentFlow?.name || `Alchemist Flow ${new Date().toLocaleDateString()}`,
        description: currentFlow?.description || 'Content creation workflow',
        category: 'alchemist',
        type: 'alchemist',
        suite: 'Content Creation',
        priority: 1,
        nodes,
        edges
      }

      if (currentFlow?.id) {
        await alchemistFlowService.updateFlow(currentFlow.id, flowData)
      } else {
        const savedFlow = await alchemistFlowService.createFlow(flowData)
        setCurrentFlow(savedFlow)
      }
      
      setShowSaveModal(false)
    } catch (error) {
      console.error('Error saving flow:', error)
    }
  }, [nodes, edges, currentFlow])

  // Execute flow
  const handleExecuteFlow = useCallback(() => {
    if (nodes.length === 0) {
      toast.error('Please add at least one node to execute the flow')
      return
    }
    
    setExecutionData({
      nodes,
      edges,
      flowId: currentFlow?.id || `alchemist-flow-${Date.now()}`
    })
    setShowExecutionModal(true)
  }, [nodes, edges, currentFlow])

  // Load flow
  const loadFlow = useCallback((flow) => {
    setCurrentFlow(flow)
    setNodes(flow.nodes || [])
    setEdges(flow.edges || [])
    toast.success(`Loaded flow: ${flow.name}`)
  }, [setNodes, setEdges])

  return (
    <ReactFlowProvider>
      <div className="w-full h-[800px] bg-gray-900 rounded-lg border border-gray-700">
        <div className="flex h-full">
          {/* Main Flow Canvas */}
          <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onInit={setReactFlowInstance}
              nodeTypes={alchemistNodeTypes}
              fitView
              className="bg-gray-900"
            >
              <Controls className="bg-gray-800 border-gray-600" />
              <MiniMap 
                className="bg-gray-800 border-gray-600"
                nodeColor={(node) => {
                  const minimapColors = alchemistNodeStyleService.getMinimapColors()
                  return minimapColors[node.type] || '#374151'
                }}
              />
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={20} 
                size={1} 
                color="#374151"
              />
            </ReactFlow>

          {/* Enhanced Floating Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {/* Add Node */}
            <button
              onClick={() => setShowNodePalette(true)}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
              title="Add Node"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            {/* Sync with Templates */}
            <button
              onClick={syncWithTemplates}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
              title="Sync with Templates"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            {/* Copy Flow Config */}
            <button
              onClick={copyFlowConfig}
              className="p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
              title="Copy Flow Configuration"
            >
              <Copy className="w-5 h-5" />
            </button>
            
            {/* Save Flow */}
            <button
              onClick={handleSaveFlow}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
              title="Save Flow"
            >
              <Save className="w-5 h-5" />
            </button>
            
            {/* Execute Flow */}
            <button
              onClick={handleExecuteFlow}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
              title="Execute Flow"
            >
              <Play className="w-5 h-5" />
            </button>
            
            {/* Clear Canvas */}
            <button
              onClick={clearCanvas}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
              title="Clear Canvas"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

            {/* Flow Info */}
            <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
              <div className="text-sm text-gray-300">
                <div>Nodes: {nodes.length}</div>
                <div>Edges: {edges.length}</div>
                {currentFlow && <div>Flow: {currentFlow.name}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {/* Node Palette temporarily disabled - using direct node addition for now */}

        {showNodeModal && selectedNode && (
          <AlchemistNodeModal
            isOpen={showNodeModal}
            onClose={() => {
              setShowNodeModal(false)
              setSelectedNode(null)
            }}
            node={selectedNode}
            onUpdate={(updatedNode) => {
              setNodes((nds) => nds.map((node) => 
                node.id === updatedNode.id ? updatedNode : node
              ))
            }}
            onDelete={() => {
              deleteNode(selectedNode.id)
              setShowNodeModal(false)
              setSelectedNode(null)
            }}
          />
        )}

        {showSaveModal && (
          <AlchemistFlowSaveModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSaveFlow}
            nodes={nodes}
            edges={edges}
            currentFlow={currentFlow}
          />
        )}

        {showExecutionModal && executionData && (
          <AlchemistWorkflowExecutionModal
            isOpen={showExecutionModal}
            onClose={() => setShowExecutionModal(false)}
            executionData={executionData}
            onForceStop={() => {
              setShowExecutionModal(false)
              setExecutionData(null)
            }}
          />
        )}
      </div>
    </ReactFlowProvider>
  )
}

export default AlchemistFlowCanvas

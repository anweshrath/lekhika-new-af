import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { workflowExecutionService } from '../../services/workflowExecutionService'
import { flowPersistenceService } from '../../services/flowPersistenceService'
import { Settings, BookOpen, Eye, Crown } from 'lucide-react'
import { 
  Save,
  Trash2,
  FileText,
  Brain,
  CheckCircle,
  Workflow,
  GitBranch,
  Download,
  X,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import AlchemistMasterNodeModal from './AlchemistMasterNodeModal'
import AlchemistFlowSaveModal from './AlchemistFlowSaveModal'
import AlchemistWorkflowExecutionModal from './AlchemistWorkflowExecutionModal'
import AlchemistFlowTemplates from './AlchemistFlowTemplates'
import { alchemistNodeTypes } from './AlchemistNodes'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'
import { getAllAlchemistVariables } from '../../data/alchemistVariables'
import { alchemistNodeStyleService } from '../../services/alchemistNodeStyleService'
import { alchemistJsonWrapper } from '../../services/alchemistJsonWrapper'
import alchemistDataFlow from '../../services/alchemistDataFlow'

// Alchemist-specific input options for content creation
const ALCHEMIST_INPUT_OPTIONS = {
  contentTypes: [
    { id: 'blog_post', name: 'Blog Post', description: 'Engaging blog content' },
    { id: 'sales_page', name: 'Sales Page', description: 'High-converting sales copy' },
    { id: 'email_sequence', name: 'Email Sequence', description: 'Automated email campaigns' },
    { id: 'video_script', name: 'Video Script', description: 'Compelling video content' },
    { id: 'case_study', name: 'Case Study', description: 'Success story documentation' },
    { id: 'social_media', name: 'Social Media', description: 'Social platform content' },
    { id: 'ad_copy', name: 'Ad Copy', description: 'Paid advertising content' },
    { id: 'landing_page', name: 'Landing Page', description: 'Conversion-focused pages' },
    { id: 'product_description', name: 'Product Description', description: 'E-commerce product copy' },
    { id: 'press_release', name: 'Press Release', description: 'Media announcements' }
  ],
  tones: [
    { id: 'professional', name: 'Professional', description: 'Formal, business-like tone' },
    { id: 'conversational', name: 'Conversational', description: 'Friendly, approachable tone' },
    { id: 'persuasive', name: 'Persuasive', description: 'Compelling, sales-focused tone' },
    { id: 'authoritative', name: 'Authoritative', description: 'Expert, confident tone' },
    { id: 'casual', name: 'Casual', description: 'Relaxed, informal tone' },
    { id: 'urgent', name: 'Urgent', description: 'Time-sensitive, action-oriented tone' },
    { id: 'emotional', name: 'Emotional', description: 'Story-driven, empathetic tone' }
  ],
  targetAudiences: [
    'Small Business Owners', 'Marketing Professionals', 'Content Creators', 'Entrepreneurs',
    'B2B Decision Makers', 'E-commerce Customers', 'SaaS Users', 'Consultants',
    'Industry Experts', 'General Consumers', 'Tech Enthusiasts', 'Creative Professionals'
  ],
  contentDepths: ['surface', 'detailed', 'comprehensive', 'expert'],
  writingStyles: ['direct', 'storytelling', 'data-driven', 'creative', 'technical', 'conversational'],
  contentFormats: ['short-form', 'long-form', 'listicle', 'how-to', 'comparison', 'review'],
  platforms: ['website', 'linkedin', 'facebook', 'twitter', 'instagram', 'youtube', 'email', 'blog'],
  campaignObjectives: ['awareness', 'conversion', 'engagement', 'retention', 'lead-generation'],
  brandingStyles: ['modern', 'classic', 'minimalist', 'bold', 'creative', 'corporate'],
  emotionalTones: ['inspiring', 'motivational', 'trustworthy', 'exciting', 'calming', 'confident']
}

const AlchemistFlow = () => {
  const { superAdminUser, getSuperAdminUserId, isAuthenticated, refreshSession } = useSuperAdmin()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showNodeModal, setShowNodeModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showNodePaletteModal, setShowNodePaletteModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)

  // Close node palette when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNodePaletteModal && !event.target.closest('.relative')) {
        setShowNodePaletteModal(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNodePaletteModal])
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [savedFlows, setSavedFlows] = useState([])
  const [showSavedFlows, setShowSavedFlows] = useState(false)
  
  // Real workflow execution state
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)
  const [currentExecutingNode, setCurrentExecutingNode] = useState(null)
  const [executionStatuses, setExecutionStatuses] = useState({})
  const [executionResults, setExecutionResults] = useState(null)
  const [executionError, setExecutionError] = useState(null)
  const [executionLog, setExecutionLog] = useState([])
  
  // Execution modal state
  const [showExecutionModal, setShowExecutionModal] = useState(false)
  const [executionModalData, setExecutionModalData] = useState(null)
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null)
  const [currentFlow, setCurrentFlow] = useState(null)
  
  const [showVariables, setShowVariables] = useState(false)
  const [availableVariables, setAvailableVariables] = useState([])

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 }
    }, eds))
  }, [setEdges])

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation()
    if (confirm('Delete this connection?')) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id))
      toast.success('Connection deleted')
    }
  }, [setEdges])

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
    setShowNodeModal(true)
  }, [])

  const addNode = (nodeData) => {
    const nodeType = typeof nodeData === 'string' ? nodeData : (nodeData.type || nodeData.node_id)
    const nodeConfig = typeof nodeData === 'object' ? nodeData : null
    
    const position = {
      x: Math.random() * 300 + 150,
      y: Math.random() * 200 + 100,
    }

    const newNode = {
      id: `${nodeConfig?.role || nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: nodeConfig?.name || `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
        description: nodeConfig?.description || `New ${nodeType} node`,
        role: nodeConfig?.role || nodeType,
        aiEnabled: nodeConfig?.is_ai_enabled ?? (nodeType !== 'conditionMaster'),
        selectedModels: [],
        inputOptions: ALCHEMIST_INPUT_OPTIONS,
        ...(nodeConfig?.configuration || {}),
        // Ensure node has proper data for Alchemist workflows
        nodeId: nodeConfig?.node_id || nodeType,
        category: nodeConfig?.category || 'general',
        gradient: nodeConfig?.gradient || 'from-gray-500 to-gray-700'
      },
    }

    setNodes((nds) => [...nds, newNode])
    setShowNodePaletteModal(false) // Close the modal after adding
    toast.success(`${nodeConfig?.name || nodeType} node added`)
  }

  const saveNodeConfig = async (nodeId, config) => {
    try {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...config } } : node
        )
      )

      if (currentFlow && currentFlow.id) {
        setCurrentFlow(null)
        toast.success('Node configuration saved. Use "Save Flow" to persist changes.')
      } else {
        toast.success('Node configuration saved')
      }

      setShowNodeModal(false)
      setSelectedNode(null)
    } catch (error) {
      console.error('Error saving node config:', error)
      toast.error('Failed to save node configuration')
    }
  }

  const clearFlow = () => {
    setNodes([])
    setEdges([])
    setFlowName('')
    setFlowDescription('')
    toast.success('Flow cleared')
  }

  const deleteNode = (nodeId) => {
    if (!confirm('Are you sure you want to delete this node? This will also remove all connections to this node.')) {
      return
    }

    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    setCurrentFlow(null)
    toast.success('Node deleted successfully')
  }

  // Load saved flows
  useEffect(() => {
    loadSavedFlows()
  }, [])

  const loadSavedFlows = async () => {
    try {
      const { data, error } = await supabase
        .from('alchemist_flows')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Combine hardcoded templates with database flows
      setSavedFlows([...alchemistTemplates, ...(data || [])])
    } catch (error) {
      console.error('Error loading saved flows:', error)
      // Even if database fails, show templates
      setSavedFlows(alchemistTemplates)
    }
  }

  // saveFlow function removed - now handled by AlchemistFlowSaveModal

  const loadFlow = async (flow) => {
    try {
      // Handle both database format and template format
      let nodes = []
      let edges = []
      
      if (flow.steps && flow.configurations) {
        // Database format: use directly (no parsing needed since Supabase returns JSON objects)
        nodes = Array.isArray(flow.steps) ? flow.steps : []
        edges = flow.configurations?.edges || []
      } else {
        // Template format: use directly
        nodes = flow.nodes || []
        edges = flow.edges || []
      }
      
      setNodes(nodes)
      setEdges(edges)
      setFlowName(flow.name)
      setFlowDescription(flow.description || '')
      setCurrentFlow(flow)
      toast.success(`Flow "${flow.name}" loaded`)
    } catch (error) {
      console.error('Error loading flow:', error)
      toast.error('Failed to load flow')
    }
  }

  const deleteFlow = async (flowId, flowName) => {
    if (!confirm(`Are you sure you want to delete "${flowName}"?`)) return

    try {
      const { error } = await supabase
        .from('alchemist_flows')
        .delete()
        .eq('id', flowId)

      if (error) throw error
      
      toast.success('Flow deleted successfully')
      loadSavedFlows()
    } catch (error) {
      console.error('Error deleting flow:', error)
      toast.error('Failed to delete flow')
    }
  }

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      toast.error('Please add nodes to your workflow before executing')
      return
    }

    // Validate SuperAdmin authentication first
    if (!superAdminUser || !superAdminUser.id) {
      toast.error('SuperAdmin authentication required. Please refresh your session.')
      return
    }

    try {
      setIsExecuting(true)
      setExecutionProgress(0)
      setExecutionStatuses({})
      setExecutionResults(null)
      setExecutionError(null)
      
      // ENSURE MODAL SHOWS IMMEDIATELY
      setShowExecutionModal(true)
      
      console.log('🚀 ALCHEMIST EXECUTION STARTED - Modal should be visible!')

      const workflowId = currentWorkflowId || `alchemist-workflow-${Date.now()}`
      setCurrentWorkflowId(workflowId)

      // Extract initial input from input nodes and create JSON wrapper
      const inputNodes = nodes.filter(node => node.type === 'inputMaster' || node.type.includes('Input'))
      
      let initialInput = {}
      if (inputNodes.length > 0) {
        const inputNode = inputNodes[0]
        const nodeData = inputNode.data || {}
        
        // Get test input values (from Test Input tab)
        const testInputValues = nodeData.testInputValues || {}
        
        // Create proper JSON wrapper for Alchemist Flow
        const jsonWrapper = alchemistJsonWrapper.createInputWrapper(
          nodeData,
          testInputValues,
          {
            tier: superAdminUser?.tier || 'pro',
            industry: superAdminUser?.industry || 'general',
            userId: superAdminUser?.id,
            sessionId: superAdminUser?.session_id
          },
          workflowId
        )
        
        initialInput = jsonWrapper
        console.log('🎯 ALCHEMIST JSON WRAPPER CREATED FOR WORKFLOW:', jsonWrapper)
      } else {
        console.log('⚠️ No input nodes found, using empty input')
      }

      console.log('🔍 Alchemist Workflow Execution Debug:', {
        superAdminUser,
        isAuthenticated,
        workflowId,
        nodesCount: nodes.length,
        edgesCount: edges.length,
        initialInput,
        modalState: showExecutionModal
      })

      // Progress callback for real-time updates
      const progressCallback = (update) => {
        console.log('📊 Progress Update:', update)
        setExecutionProgress(update.progress || 0)
        setCurrentExecutingNode(update.nodeId)
        setExecutionStatuses(prev => ({
          ...prev,
          [update.nodeId]: update.status
        }))
        
        setExecutionModalData({
          ...update,
          timestamp: new Date().toLocaleTimeString(),
          workflowId,
          nodeType: update.nodeType,
          aiThinking: update.aiThinking || false,
          currentStep: update.currentStep || 'Processing...'
        })
      }

      // Execute with ALCHEMIST execution service - pass progress callback
      const results = await alchemistDataFlow.executeFlowNodes(
        nodes,
        edges,
        initialInput,
        {
          tier: superAdminUser?.tier || 'pro',
          industry: superAdminUser?.industry || 'general',
          userId: superAdminUser?.id,
          sessionId: superAdminUser?.session_id,
          workflowId: workflowId
        },
        progressCallback
      )

      setExecutionResults(results)
      toast.success('🚀 Alchemist workflow executed successfully!')

    } catch (error) {
      console.error('Workflow execution error:', error)
      setExecutionError(error.message)
      toast.error(`Workflow execution failed: ${error.message}`)
    } finally {
      setIsExecuting(false)
      setCurrentExecutingNode(null)
      console.log('✅ Alchemist execution completed - Modal still visible for results')
    }
  }

  // FORCE STOP WORKFLOW FUNCTION
  const forceStopWorkflow = () => {
    if (isExecuting) {
      setIsExecuting(false)
      setCurrentExecutingNode(null)
      setExecutionError('Workflow execution stopped by user')
      toast.error('🛑 Workflow execution stopped')
      console.log('🛑 FORCE STOP: Execution halted by user')
    }
  }

  // Load Awesome Template
  // Load pre-built flow
  const loadPreBuiltFlow = async (flow) => {
    try {
      console.log('Loading pre-built flow:', flow)
      
      // Clear existing nodes and edges
      setNodes([])
      setEdges([])
      
      // Set flow name and description
      setFlowName(flow.name)
      setFlowDescription(flow.description)
      
      // Load nodes from the flow definition
      const flowNodes = flow.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          // Ensure proper node configuration
          label: node.data.label || node.data.description || `${node.type} Node`,
          description: node.data.description || 'Flow node',
          variables: node.data.variables || [],
          config: node.data.config || {}
        }
      }))
      
      // Load edges from the flow definition
      const flowEdges = flow.connections.map((connection, index) => ({
        id: `edge-${index}`,
        source: connection.source,
        target: connection.target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 }
      }))
      
      // Apply nodes and edges
      setNodes(flowNodes)
      setEdges(flowEdges)
      
      toast.success(`🚀 ${flow.name} loaded successfully!`)
      
    } catch (error) {
      console.error('Error loading pre-built flow:', error)
      toast.error('Failed to load pre-built flow')
    }
  }


  // ALL ALCHEMIST TEMPLATES - HARDCODED AS YOU REQUESTED
  const alchemistTemplates = [
    // CONTENT CREATION
    {
      id: 'blog-post-generator',
      name: 'Blog Post Generator',
      description: 'Create engaging blog posts with SEO optimization',
      category: 'Content Creation',
      icon: '📝',
      shortDescription: 'Write compelling blog content',
      suite: 'Content Creation',
      priority: 1,
      color: 'blue'
    },
    {
      id: 'video-script-writer',
      name: 'Video Script Writer',
      description: 'Write compelling video scripts for any platform',
      category: 'Content Creation',
      icon: '🎬',
      shortDescription: 'Create engaging video scripts',
      suite: 'Content Creation',
      priority: 2,
      color: 'purple'
    },
    {
      id: 'case-study-writer',
      name: 'Case Study Writer',
      description: 'Document success stories and case studies',
      category: 'Content Creation',
      icon: '📊',
      shortDescription: 'Write detailed case studies',
      suite: 'Content Creation',
      priority: 3,
      color: 'green'
    },
    
    // MARKETING
    {
      id: 'email-sequence-generator',
      name: 'Email Sequence Generator',
      description: 'Create automated email marketing campaigns',
      category: 'Marketing',
      icon: '📧',
      shortDescription: 'Build email sequences',
      suite: 'Marketing',
      priority: 1,
      color: 'indigo'
    },
    {
      id: 'social-media-generator',
      name: 'Social Media Generator',
      description: 'Generate content for all social platforms',
      category: 'Marketing',
      icon: '📱',
      shortDescription: 'Create social content',
      suite: 'Marketing',
      priority: 2,
      color: 'pink'
    },
    {
      id: 'ad-copy-generator',
      name: 'Ad Copy Generator',
      description: 'Write high-converting ad copy',
      category: 'Marketing',
      icon: '📢',
      shortDescription: 'Create persuasive ads',
      suite: 'Marketing',
      priority: 3,
      color: 'orange'
    },
    
    // SALES
    {
      id: 'sales-page-generator',
      name: 'Sales Page Generator',
      description: 'Create high-converting sales pages',
      category: 'Sales',
      icon: '💰',
      shortDescription: 'Build sales pages',
      suite: 'Sales',
      priority: 1,
      color: 'red'
    },
    {
      id: 'landing-page-generator',
      name: 'Landing Page Generator',
      description: 'Write conversion-focused landing pages',
      category: 'Sales',
      icon: '🎯',
      shortDescription: 'Create landing pages',
      suite: 'Sales',
      priority: 2,
      color: 'yellow'
    },
    {
      id: 'product-description-generator',
      name: 'Product Description Generator',
      description: 'Write compelling product descriptions',
      category: 'Sales',
      icon: '🛍️',
      shortDescription: 'Describe products',
      suite: 'Sales',
      priority: 3,
      color: 'teal'
    },
    
    // PR
    {
      id: 'press-release-generator',
      name: 'Press Release Generator',
      description: 'Write professional press releases',
      category: 'PR',
      icon: '📰',
      shortDescription: 'Create press releases',
      suite: 'PR',
      priority: 1,
      color: 'emerald'
    }
  ]

  // Load sample nodes when component mounts
  useEffect(() => {
    // Add 3 compact sample nodes
    const sampleNodes = [
      {
        id: 'sample-input',
        type: 'inputMaster',
        position: { x: 200, y: 200 },
        data: {
          label: 'Content Input',
          description: 'Define your content requirements',
          role: 'input',
          aiEnabled: true,
          inputOptions: ALCHEMIST_INPUT_OPTIONS
        }
      },
      {
        id: 'sample-process',
        type: 'processMaster',
        position: { x: 400, y: 200 },
        data: {
          label: 'AI Writer',
          description: 'Generate content with AI',
          role: 'process',
          aiEnabled: true,
          inputOptions: ALCHEMIST_INPUT_OPTIONS
        }
      },
      {
        id: 'sample-output',
        type: 'outputMaster',
        position: { x: 600, y: 200 },
        data: {
          label: 'Content Output',
          description: 'Deliver final content',
          role: 'output',
          aiEnabled: false,
          inputOptions: ALCHEMIST_INPUT_OPTIONS
        }
      }
    ]

    const sampleEdges = [
      {
        id: 'sample-e1',
        source: 'sample-input',
        target: 'sample-process',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      },
      {
        id: 'sample-e2',
        source: 'sample-process',
        target: 'sample-output',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      }
    ]

    setNodes(sampleNodes)
    setEdges(sampleEdges)
    setAvailableVariables(getAllAlchemistVariables()) // Load all Alchemist variables
  }, [])

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">🧪 Alchemist Flow Builder</h1>
            <p className="text-gray-400">Professional content creation workflows</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-200"
            >
              <Workflow className="w-4 h-4" /> 10 Pre-Built Flows
            </button>
            <button
              onClick={() => setShowSavedFlows(!showSavedFlows)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              <Workflow className="w-4 h-4" /> My Flows ({savedFlows.length})
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNodePaletteModal(!showNodePaletteModal)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" /> Add Node
              </button>
              
              {/* ULTIMATE NODE SELECTOR - MASTERS + SUB-NODES */}
              {showNodePaletteModal && (
                <div 
                  className="absolute top-full left-0 mt-2 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6 z-50 min-w-[500px] max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-bold text-white text-lg">🚀 Add Alchemist Node</h3>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full">PERFECTION</span>
                  </div>
                  
                  {/* MASTER NODES SECTION */}
                  <div className="mb-6">
                    <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Master Nodes
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => { addNode('inputMaster'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-3 p-3 bg-blue-900/30 hover:bg-blue-800/50 rounded-lg border border-blue-500/30 hover:border-blue-400 text-left transition-all"
                      >
                        <span className="text-2xl">📥</span>
                        <div>
                          <div className="font-semibold text-blue-300">Input Master</div>
                          <div className="text-xs text-blue-400">Multi-Modal Input Collection Hub</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('processMaster'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-3 p-3 bg-purple-900/30 hover:bg-purple-800/50 rounded-lg border border-purple-500/30 hover:border-purple-400 text-left transition-all"
                      >
                        <span className="text-2xl">🧠</span>
                        <div>
                          <div className="font-semibold text-purple-300">Process Master</div>
                          <div className="text-xs text-purple-400">AI Content Generation Engine</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('conditionMaster'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-3 p-3 bg-emerald-900/30 hover:bg-emerald-800/50 rounded-lg border border-emerald-500/30 hover:border-emerald-400 text-left transition-all"
                      >
                        <span className="text-2xl">🔀</span>
                        <div>
                          <div className="font-semibold text-emerald-300">Condition Master</div>
                          <div className="text-xs text-emerald-400">Smart Logic & Decision Tree</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('previewMaster'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-3 p-3 bg-amber-900/30 hover:bg-amber-800/50 rounded-lg border border-amber-500/30 hover:border-amber-400 text-left transition-all"
                      >
                        <span className="text-2xl">👁️</span>
                        <div>
                          <div className="font-semibold text-amber-300">Preview Master</div>
                          <div className="text-xs text-amber-400">Content Review & Editor Suite</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('outputMaster'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-3 p-3 bg-rose-900/30 hover:bg-rose-800/50 rounded-lg border border-rose-500/30 hover:border-rose-400 text-left transition-all"
                      >
                        <span className="text-2xl">📤</span>
                        <div>
                          <div className="font-semibold text-rose-300">Output Master</div>
                          <div className="text-xs text-rose-400">Multi-Channel Distribution Hub</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* INPUT SUB-NODES */}
                  <div className="mb-6">
                    <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Input Specialists
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { addNode('textPromptInput'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-blue-900/20 hover:bg-blue-800/40 rounded-lg border border-blue-500/20 hover:border-blue-400/50 text-left transition-all"
                      >
                        <span className="text-lg">📝</span>
                        <div>
                          <div className="font-medium text-blue-300 text-sm">Text Prompt</div>
                          <div className="text-xs text-blue-400">Smart Text Collection</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('voiceInput'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-blue-900/20 hover:bg-blue-800/40 rounded-lg border border-blue-500/20 hover:border-blue-400/50 text-left transition-all"
                      >
                        <span className="text-lg">🎤</span>
                        <div>
                          <div className="font-medium text-blue-300 text-sm">Voice Input</div>
                          <div className="text-xs text-blue-400">Speech-to-Text</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('fileUpload'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-blue-900/20 hover:bg-blue-800/40 rounded-lg border border-blue-500/20 hover:border-blue-400/50 text-left transition-all"
                      >
                        <span className="text-lg">📁</span>
                        <div>
                          <div className="font-medium text-blue-300 text-sm">File Upload</div>
                          <div className="text-xs text-blue-400">Multi-Format Files</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('urlScrapeInput'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-blue-900/20 hover:bg-blue-800/40 rounded-lg border border-blue-500/20 hover:border-blue-400/50 text-left transition-all"
                      >
                        <span className="text-lg">🔗</span>
                        <div>
                          <div className="font-medium text-blue-300 text-sm">URL Scraper</div>
                          <div className="text-xs text-blue-400">Web Content Extract</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* PROCESS SUB-NODES */}
                  <div className="mb-6">
                    <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Processing Powerhouses
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { addNode('contentWriter'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-purple-900/20 hover:bg-purple-800/40 rounded-lg border border-purple-500/20 hover:border-purple-400/50 text-left transition-all"
                      >
                        <span className="text-lg">✍️</span>
                        <div>
                          <div className="font-medium text-purple-300 text-sm">Content Writer</div>
                          <div className="text-xs text-purple-400">AI Writing Engine</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('researchEngine'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-purple-900/20 hover:bg-purple-800/40 rounded-lg border border-purple-500/20 hover:border-purple-400/50 text-left transition-all"
                      >
                        <span className="text-lg">🔍</span>
                        <div>
                          <div className="font-medium text-purple-300 text-sm">Research Engine</div>
                          <div className="text-xs text-purple-400">Data Gathering</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('qualityOptimizer'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-purple-900/20 hover:bg-purple-800/40 rounded-lg border border-purple-500/20 hover:border-purple-400/50 text-left transition-all"
                      >
                        <span className="text-lg">⚡</span>
                        <div>
                          <div className="font-medium text-purple-300 text-sm">Quality Optimizer</div>
                          <div className="text-xs text-purple-400">Content Enhancement</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* CONDITION SUB-NODES */}
                  <div className="mb-6">
                    <h4 className="text-emerald-300 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Decision Makers
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { addNode('logicGate'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-emerald-900/20 hover:bg-emerald-800/40 rounded-lg border border-emerald-500/20 hover:border-emerald-400/50 text-left transition-all"
                      >
                        <span className="text-lg">🚪</span>
                        <div>
                          <div className="font-medium text-emerald-300 text-sm">Logic Gate</div>
                          <div className="text-xs text-emerald-400">Boolean Logic</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('decisionTree'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-emerald-900/20 hover:bg-emerald-800/40 rounded-lg border border-emerald-500/20 hover:border-emerald-400/50 text-left transition-all"
                      >
                        <span className="text-lg">🌳</span>
                        <div>
                          <div className="font-medium text-emerald-300 text-sm">Decision Tree</div>
                          <div className="text-xs text-emerald-400">Complex Decisions</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('validationCheck'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-emerald-900/20 hover:bg-emerald-800/40 rounded-lg border border-emerald-500/20 hover:border-emerald-400/50 text-left transition-all"
                      >
                        <span className="text-lg">✅</span>
                        <div>
                          <div className="font-medium text-emerald-300 text-sm">Validation Check</div>
                          <div className="text-xs text-emerald-400">Quality Gate</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* PREVIEW SUB-NODES */}
                  <div className="mb-6">
                    <h4 className="text-amber-300 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Preview Masters
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { addNode('livePreview'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-amber-900/20 hover:bg-amber-800/40 rounded-lg border border-amber-500/20 hover:border-amber-400/50 text-left transition-all"
                      >
                        <span className="text-lg">📐</span>
                        <div>
                          <div className="font-medium text-amber-300 text-sm">Live Preview</div>
                          <div className="text-xs text-amber-400">Real-Time View</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('mobileDesktopSimulator'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-amber-900/20 hover:bg-amber-800/40 rounded-lg border border-amber-500/20 hover:border-amber-400/50 text-left transition-all"
                      >
                        <span className="text-lg">📱</span>
                        <div>
                          <div className="font-medium text-amber-300 text-sm">Device Simulator</div>
                          <div className="text-xs text-amber-400">Multi-Device</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('emailPreview'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-amber-900/20 hover:bg-amber-800/40 rounded-lg border border-amber-500/20 hover:border-amber-400/50 text-left transition-all"
                      >
                        <span className="text-lg">📧</span>
                        <div>
                          <div className="font-medium text-amber-300 text-sm">Email Preview</div>
                          <div className="text-xs text-amber-400">Client Simulation</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* OUTPUT SUB-NODES */}
                  <div>
                    <h4 className="text-rose-300 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                      Output Powerhouses
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { addNode('multiFormatExporter'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-rose-900/20 hover:bg-rose-800/40 rounded-lg border border-rose-500/20 hover:border-rose-400/50 text-left transition-all"
                      >
                        <span className="text-lg">📦</span>
                        <div>
                          <div className="font-medium text-rose-300 text-sm">Format Exporter</div>
                          <div className="text-xs text-rose-400">20+ Formats</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('cloudStorage'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-rose-900/20 hover:bg-rose-800/40 rounded-lg border border-rose-500/20 hover:border-rose-400/50 text-left transition-all"
                      >
                        <span className="text-lg">☁️</span>
                        <div>
                          <div className="font-medium text-rose-300 text-sm">Cloud Storage</div>
                          <div className="text-xs text-rose-400">Multi-Cloud</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { addNode('scheduler'); setShowNodePaletteModal(false) }}
                        className="flex items-center gap-2 p-2 bg-rose-900/20 hover:bg-rose-800/40 rounded-lg border border-rose-500/20 hover:border-rose-400/50 text-left transition-all"
                      >
                        <span className="text-lg">📅</span>
                        <div>
                          <div className="font-medium text-rose-300 text-sm">Scheduler</div>
                          <div className="text-xs text-rose-400">Auto-Publish</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Save className="w-4 h-4" /> Save Flow
            </button>
            <button
              onClick={clearFlow}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={alchemistNodeTypes}
          fitView
          className="bg-gray-900"
        >
          <Background color="#374151" />
          <Controls className="bg-gray-800 border-gray-700" />
          <MiniMap 
            className="bg-gray-800 border-gray-700"
            nodeColor={(node) => {
              const minimapColors = alchemistNodeStyleService.getMinimapColors()
              return minimapColors[node.type] || '#6b7280'
            }}
          />
          
          {/* Floating Action Panel */}
          <Panel position="top-right" className="space-y-2">
            {/* Execute Button */}
            <button
              onClick={executeWorkflow}
              disabled={isExecuting || nodes.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-colors font-medium ${
                isExecuting 
                  ? 'bg-orange-600 text-white cursor-not-allowed' 
                  : nodes.length === 0
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Executing... ({Math.round(executionProgress)}%)
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Execute Workflow
                </>
              )}
            </button>

            {/* Force Stop Button */}
            {isExecuting && (
              <button
                onClick={forceStopWorkflow}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Force Stop
              </button>
            )}
          </Panel>
        </ReactFlow>

        {/* Saved Flows Sidebar */}
        {showSavedFlows && (
          <div className="absolute top-0 right-0 w-80 h-full bg-gray-800 border-l border-gray-700 flex flex-col z-10">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-white">My Alchemist Flows</h3>
                <p className="text-sm text-gray-400 mt-1">{savedFlows.length} flows saved</p>
              </div>
              <button
                onClick={() => setShowSavedFlows(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedFlows.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Workflow className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No flows saved yet</p>
                  <p className="text-sm">Create and save your first Alchemist flow!</p>
                </div>
              ) : (
                savedFlows.map((flow) => (
                  <div key={flow.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white truncate">{flow.name}</h4>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => loadFlow(flow)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Load Flow"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFlow(flow.id, flow.name)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete Flow"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {flow.description && (
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">{flow.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        <span>{flow.nodes?.length || 0} nodes</span>
                        <span>{flow.edges?.length || 0} connections</span>
                      </div>
                      <span>{new Date(flow.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNodeModal && (
        <AlchemistMasterNodeModal
          isOpen={showNodeModal}
          onClose={() => setShowNodeModal(false)}
          node={selectedNode}
          onSave={saveNodeConfig}
          onDelete={deleteNode}
        />
      )}

      {showSaveModal && (
        <AlchemistFlowSaveModal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false)
            loadSavedFlows() // Reload flows after modal closes
          }}
          onSave={(savedFlow) => {
            setCurrentFlow(savedFlow)
            loadSavedFlows()
          }}
          nodes={nodes}
          edges={edges}
          currentFlow={currentFlow}
        />
      )}

      {showExecutionModal && (
        <AlchemistWorkflowExecutionModal
          isOpen={showExecutionModal}
          onClose={() => {
            setShowExecutionModal(false)
            // Only reset states if execution is complete
            if (!isExecuting) {
              setExecutionResults(null)
              setExecutionError(null)
              setExecutionProgress(0)
              setCurrentExecutingNode(null)
              setExecutionStatuses({})
              setExecutionModalData(null)
              setExecutionLog([])
            }
          }}
          onForceStop={forceStopWorkflow}
          workflowData={executionModalData}
          isExecuting={isExecuting}
          executionProgress={executionProgress}
          currentExecutingNode={currentExecutingNode}
          executionStatuses={executionStatuses}
          executionResults={executionResults}
          executionError={executionError}
          executionLog={executionLog}
          flowId={currentFlow?.id}
          userId={getSuperAdminUserId()}
          nodes={nodes}
          edges={edges}
          setExecutionError={setExecutionError}
          setExecutionStatuses={setExecutionStatuses}
          setExecutionProgress={setExecutionProgress}
          setCurrentExecutingNode={setCurrentExecutingNode}
          setExecutionLog={setExecutionLog}
        />
      )}

      {/* Node Palette temporarily disabled - using direct node addition for now */}

      {showTemplatesModal && (
        <AlchemistFlowTemplates
          isOpen={showTemplatesModal}
          onClose={() => setShowTemplatesModal(false)}
          onLoadFlow={loadPreBuiltFlow}
        />
      )}

    </div>
  )
}

export default AlchemistFlow
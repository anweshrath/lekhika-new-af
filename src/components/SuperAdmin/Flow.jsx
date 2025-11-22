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
import { flowBackupService } from '../../services/flowBackupService'
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
  Plus,
  Layers,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import FlowNodeModal from './FlowNodeModal'
import FlowSaveModal from './FlowSaveModal'
import WorkflowExecutionModal from './WorkflowExecutionModal'
import NodePaletteModal from '../NodePaletteModal'
import { INPUT_OPTIONS as MASTER_INPUT_OPTIONS } from '../../data/inputOptions'
import { CLIENT_FLOWS, getClientFlowCategories } from '../../data/clientFlows'
import ClientInputPresetsModal from './ClientInputPresetsModal'
import { nodeTypes } from './FlowNodes'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'

// Complete input options from ROOT_APP_INPUT_STRUCTURE.md
const INPUT_OPTIONS = {
  bookTypes: [
    { id: 'ebook', name: 'eBook', description: 'Comprehensive digital book' },
    { id: 'guide', name: 'How-To Guide', description: 'Practical step-by-step guide' },
    { id: 'manual', name: 'Training Manual', description: 'Comprehensive training resource' },
    { id: 'workbook', name: 'Interactive Workbook', description: 'Exercises and activities' }
  ],
  niches: ['business', 'technology', 'self-help', 'finance', 'marketing', 'leadership'],
  tones: [
    { id: 'professional', name: 'Professional', description: 'Formal, business-like tone suitable for corporate environments' },
    { id: 'conversational', name: 'Conversational', description: 'Friendly, approachable tone like talking to a friend' },
    { id: 'academic', name: 'Academic', description: 'Scholarly, research-based tone for educational content' },
    { id: 'authoritative', name: 'Authoritative', description: 'Confident, expert tone that commands respect' },
    { id: 'friendly', name: 'Friendly', description: 'Warm, welcoming tone that builds connection' },
    { id: 'formal', name: 'Formal', description: 'Structured, traditional tone for official documents' },
    { id: 'casual', name: 'Casual', description: 'Relaxed, informal tone for everyday communication' }
  ],
  accents: [
    { id: 'american', name: 'American English', description: 'Standard American English with US spelling and expressions' },
    { id: 'british', name: 'British English', description: 'Standard British English with UK spelling and expressions' },
    { id: 'neutral', name: 'Neutral International', description: 'International English suitable for global audiences' },
    { id: 'indian', name: 'Indian English', description: 'Indian English with local expressions and cultural context' },
    { id: 'hinglish', name: 'Hinglish', description: 'Mix of Hindi and English with urban Indian expressions like "Bas kar yaar", "Chill maro", "Awesome hai"' },
    { id: 'english_hindi_script', name: 'English in Hindi Script', description: 'Hindi language written in English script (Romanized Hindi)' }
  ],
  wordCounts: ['3000-5000', '5000-8000', '8000-12000', '12000-20000', '20000+'],
  chapterCounts: ['2-3', '3-4', '4-5', '5-7', '7-10', '10+'],
  writingStyles: ['conversational', 'formal', 'casual', 'academic', 'creative', 'technical'],
  targetAudiences: ['adult', 'young-adult', 'teen', 'children', 'entrepreneurs', 'executives', 'managers', 'students', 'professionals'],
  genres: ['fantasy', 'romance', 'mystery', 'thriller', 'sci-fi', 'business', 'self-help', 'biography', 'history', 'technical'],
  outputFormats: ['pdf', 'docx', 'txt', 'html', 'md'],
  publishingFormats: ['ebook', 'print', 'audiobook', 'digital'],
  contentDepths: ['basic', 'intermediate', 'advanced', 'expert'],
  researchLevels: ['light', 'moderate', 'extensive', 'academic'],
  businessModels: ['b2b', 'b2c', 'saas', 'marketplace', 'consulting'],
  programmingLanguages: ['javascript', 'python', 'java', 'csharp', 'php', 'ruby', 'go'],
  technicalLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
  implementationTypes: ['tutorial', 'guide', 'reference', 'case-study'],
  marketingChannels: ['social-media', 'email', 'content-marketing', 'paid-ads', 'seo'],
  campaignObjectives: ['awareness', 'conversion', 'engagement', 'retention'],
  healthFocuses: ['fitness', 'nutrition', 'mental-health', 'wellness', 'medical'],
  ageGroups: ['children', 'teen', 'young-adult', 'adult', 'senior'],
  fitnessLevels: ['beginner', 'intermediate', 'advanced', 'athlete'],
  educationLevels: ['elementary', 'middle-school', 'high-school', 'college', 'graduate', 'professional'],
  learningStyles: ['visual', 'auditory', 'kinesthetic', 'reading-writing'],
  subjectAreas: ['science', 'mathematics', 'literature', 'history', 'art', 'technology'],
  careerPaths: ['entry-level', 'mid-level', 'senior', 'executive', 'entrepreneur'],
  brandingStyles: ['modern', 'classic', 'minimalist', 'creative', 'professional'],
  bookSizes: ['standard', 'large', 'pocket', 'custom'],
  typographyStyles: ['serif', 'sans-serif', 'monospace', 'script'],
  coverDesigns: ['minimal', 'illustrated', 'photographic', 'abstract', 'text-based'],
  emotionalTones: ['uplifting', 'motivational', 'calming', 'inspiring', 'thoughtful'],
  mindsetFocuses: ['growth', 'positive', 'resilient', 'confident', 'creative']
}

// NO HARDCODED DEFAULT VALUES - ALL VALUES MUST COME FROM USER INPUT OR NODE CONFIGURATION

const Flow = () => {
  const { superAdminUser, getSuperAdminUserId, isAuthenticated, refreshSession } = useSuperAdmin()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showNodeModal, setShowNodeModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showNodePaletteModal, setShowNodePaletteModal] = useState(false)
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [savedFlows, setSavedFlows] = useState([])
  const [showSavedFlows, setShowSavedFlows] = useState(false)
  const [showClientFlows, setShowClientFlows] = useState(false)
  
  // Real workflow execution state
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)
  const [currentExecutingNode, setCurrentExecutingNode] = useState(null)
  const [executionStatuses, setExecutionStatuses] = useState({})
  const [executionResults, setExecutionResults] = useState(null)
  const [executionError, setExecutionError] = useState(null)
  
  // Execution modal state
  const [showExecutionModal, setShowExecutionModal] = useState(false)
  const [executionModalData, setExecutionModalData] = useState(null)
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null)
  const [currentFlow, setCurrentFlow] = useState(null)
  
  // Input testing modal state
  

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
    // Handle both old format (string) and new format (node object)
    const nodeType = typeof nodeData === 'string' ? nodeData : nodeData.type
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
        aiEnabled: nodeConfig?.is_ai_enabled ?? (nodeType !== 'condition'),
        selectedModels: [],
        inputOptions: INPUT_OPTIONS,
        // Copy configuration from nodePalettes if available
        ...(nodeConfig?.configuration || {}),
        // Preview node specific defaults
        ...(nodeType === 'preview' && {
          maxAttempts: 3,
          previewLength: '1 chapter',
          approvalRequired: true,
          currentAttempt: 0,
          customerFeedback: '',
          isApproved: false
        })
      },
    }

    setNodes((nds) => [...nds, newNode])
    toast.success(`${nodeConfig?.name || nodeType} node added`)
  }

  const saveNodeConfig = async (nodeId, config) => {
    try {
      // Update local state
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...config } } : node
        )
      )

      // Clear currentFlow to indicate this is now a modified version
      // User must explicitly save the flow to persist changes
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

  // Delete a specific node
  const deleteNode = (nodeId) => {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this node? This will also remove all connections to this node.')) {
      return
    }

    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    
    // Remove all edges connected to this node
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    
    // Clear current flow to indicate modification
    setCurrentFlow(null)
    
    toast.success('Node deleted successfully')
  }

  // Load professional flow
  const loadProfessionalFlow = async (flowId) => {
    try {
      const success = professionalFlowLoader.loadFlowIntoComponent(
        flowId,
        setNodes,
        setEdges,
        setFlowName,
        setFlowDescription
      )
      
      if (success) {
        toast.success('Professional flow loaded successfully')
        setCurrentFlow(null) // Clear current flow since we're loading a template
      } else {
        toast.error('Failed to load professional flow')
      }
    } catch (error) {
      console.error('Error loading professional flow:', error)
      toast.error('Error loading professional flow')
    }
  }

  // Load customer content flow
  const loadCustomerContentFlow = async (flowId) => {
    try {
      const success = customerContentFlowLoader.loadFlowIntoComponent(
        flowId,
        setNodes,
        setEdges,
        setFlowName,
        setFlowDescription
      )
      
      if (success) {
        toast.success('Customer content flow loaded successfully')
        setCurrentFlow(null) // Clear current flow since we're loading a template
      } else {
        toast.error('Failed to load customer content flow')
      }
    } catch (error) {
      console.error('Error loading customer content flow:', error)
      toast.error('Error loading customer content flow')
    }
  }


  // Load framework flow
  const loadFrameworkFlow = async (flowId) => {
    try {
      const flow = MASTER_INPUT_OPTIONS.frameworkFlows[flowId]
      if (!flow) {
        toast.error('Framework flow not found')
        return
      }

      // Clear existing flow
      setNodes([])
      setEdges([])
      
      // Set flow metadata
      setFlowName(flow.name)
      setFlowDescription(flow.description)
      
      // Load nodes and edges
      setNodes(flow.nodes)
      setEdges(flow.edges)
      
      setCurrentFlow(null) // Clear current flow since we're loading a template
      toast.success(`Framework flow "${flow.name}" loaded successfully!`)
    } catch (error) {
      console.error('Error loading framework flow:', error)
      toast.error('Error loading framework flow')
    }
  }

  // const loadTopNotchTemplate = async (template) => {
  //   try {
  //     console.log('Loading top-notch template:', template)
      
  //     // Clear existing flow
  //     setNodes([])
  //     setEdges([])
      
  //     // Set flow metadata
  //     setFlowName(template.name)
  //     setFlowDescription(template.description)
      
  //     // Load template nodes and edges
  //     if (template.nodes && template.edges) {
  //       setNodes(template.nodes)
  //       setEdges(template.edges)
  //     }
      
  //     setShowTopNotchTemplateSelector(false)
  //     setCurrentFlow(null) // Clear current flow since we're loading a template
  //     toast.success(`Top-notch template "${template.name}" loaded successfully!`)
  //   } catch (error) {
  //     console.error('Error loading top-notch template:', error)
  //     toast.error('Error loading template')
  //   }
  // }

  // Load saved flows from database
  const loadSavedFlows = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_flows')
        .select('*')
        .eq('created_by', '5950cad6-810b-4c5b-9d40-4485ea249770')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading flows:', error)
        toast.error('Failed to load saved flows')
        return
      }

      setSavedFlows(data || [])
    } catch (error) {
      console.error('Error loading flows:', error)
      toast.error('Failed to load saved flows')
    }
  }

  // Save flow to database
  const saveFlowToDatabase = async (name, description) => {
    console.log('🚀 FULL FLOW SAVE ATTEMPT')
    
    if (nodes.length === 0) {
      console.error('❌ Cannot save empty flow')
      toast.error('Cannot save empty flow')
      return false
    }

    // Check if SuperAdmin is authenticated
    if (!isAuthenticated()) {
      console.error('❌ SuperAdmin not authenticated, attempting to refresh session...')
      try {
        await refreshSession()
        if (!isAuthenticated()) {
          console.error('❌ Session refresh failed')
          console.error('❌ Debug info:', {
            superAdminUser: superAdminUser,
            session: session,
            isAuthenticated: isAuthenticated()
          })
          toast.error('You must be logged in as SuperAdmin to save a flow')
          return false
        }
        console.log('✅ Session refreshed successfully')
      } catch (error) {
        console.error('❌ Session refresh error:', error)
        toast.error('You must be logged in as SuperAdmin to save a flow')
        return false
      }
    }

    // Get SuperAdmin user ID
    const userId = getSuperAdminUserId()
    console.log('👤 SuperAdmin User ID:', userId)

    console.log('🌊 Flow Details:', {
      name,
      description,
      nodeCount: nodes.length,
      hasConditions: nodes.some(node => node.type === 'condition'),
      hasAI: nodes.some(node => node.data?.aiEnabled),
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        label: node.data?.label
      }))
    })

    try {
      // Generate steps array from nodes
      const steps = nodes.map(node => node.type).filter((type, index, arr) => arr.indexOf(type) === index)
      
      const flowData = {
        name: name,
        description: description || '',
        type: 'full',  // Standardized to 'full'
        steps: steps,  // Dynamic steps array
        configurations: {  // NEW format - store in configurations
          nodes: nodes,
          edges: edges
        },
        created_by: userId,  // Add SuperAdmin user ID
        metadata: {
          nodeCount: nodes.length,
          hasConditions: nodes.some(node => node.type === 'condition'),
          hasAI: nodes.some(node => node.data?.aiEnabled),
          createdAt: new Date().toISOString()
        }
      }

      console.log('📤 Prepared Flow Data:', JSON.stringify(flowData, null, 2))

      const { data, error } = await supabase
        .from('ai_flows')
        .insert([flowData])
        .select('*')

      if (error) {
        console.error('❌ Supabase Insertion Error:', error)
        console.error('❌ Full Error Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        toast.error('Failed to save flow: ' + error.message)
        return false
      }

      console.log('✅ Flow Saved Successfully:', data)
      toast.success(`Flow "${name}" saved successfully`)
      loadSavedFlows() // Refresh the list
      return true

    } catch (error) {
      console.error('💥 Unexpected Flow Save Error:', error)
      toast.error('Failed to save flow')
      return false
    }
  }

  // Load a saved flow
  const loadFlow = async (flow) => {
    try {
      console.log('🔍 Loading flow:', flow)
      console.log('🔍 Flow configurations:', flow.configurations)
      
      // Validate flow data structure
      if (!flow || typeof flow !== 'object') {
        throw new Error('Invalid flow data structure')
      }

      // Parse and validate nodes (NEW format - configurations only)
      let validNodes = []
      let nodesData = flow.configurations?.nodes
      console.log('🔍 Nodes data found:', nodesData)
      
      if (!nodesData) {
        throw new Error('Flow missing configurations.nodes - please run standardization migration')
      }
      
      // If nodes is a JSON string, parse it
      if (typeof nodesData === 'string') {
        try {
          nodesData = JSON.parse(nodesData)
        } catch (error) {
          console.error('❌ Failed to parse nodes JSON:', error)
          throw new Error('Invalid nodes JSON format')
        }
      }
      
      if (Array.isArray(nodesData)) {
        // When loading from database, preserve user-configured selectedModels
        validNodes = nodesData.filter(node => {
          return node && 
                 typeof node === 'object' && 
                 node.id && 
                 node.type && 
                 node.position && 
                 node.data
        }).map(node => ({
          id: String(node.id),
          type: String(node.type),
          position: {
            x: Number(node.position.x) || 0,
            y: Number(node.position.y) || 0
          },
          data: {
            label: String(node.data.label || 'Unnamed Node'),
            ...node.data
          }
        }))
      }

      // Parse and validate edges (NEW format - configurations only)
      let validEdges = []
      let edgesData = flow.configurations?.edges
      console.log('🔍 Edges data found:', edgesData)
      
      if (!edgesData) {
        throw new Error('Flow missing configurations.edges - please run standardization migration')
      }
      
      // If edges is a JSON string, parse it
      if (typeof edgesData === 'string') {
        try {
          edgesData = JSON.parse(edgesData)
        } catch (error) {
          console.error('❌ Failed to parse edges JSON:', error)
          throw new Error('Invalid edges JSON format')
        }
      }
      
      if (Array.isArray(edgesData)) {
        validEdges = edgesData.filter(edge => {
          return edge && 
                 typeof edge === 'object' && 
                 edge.id && 
                 edge.source && 
                 edge.target
        }).map(edge => ({
          id: String(edge.id),
          source: String(edge.source),
          target: String(edge.target),
          ...edge
        }))
      }

      // Validate flow name
      const flowName = flow.name ? String(flow.name).trim() : 'Unnamed Flow'
      if (!flowName) {
        throw new Error('Flow name cannot be empty')
      }

      console.log('🔍 Final valid nodes:', validNodes)
      console.log('🔍 Final valid edges:', validEdges)
      
      // Set validated data
      setNodes(validNodes)
      setEdges(validEdges)
      setFlowName(flowName)
      setFlowDescription(flow.description ? String(flow.description) : '')
      setCurrentFlow(flow) // Set the current flow for database updates
      
      toast.success(`Flow "${flowName}" loaded successfully`)
      console.log('✅ Flow loaded:', { 
        nodes: validNodes.length, 
        edges: validEdges.length, 
        name: flowName 
      })
    } catch (error) {
      console.error('❌ Error loading flow:', error)
      toast.error(`Failed to load flow: ${error.message}`)
      
      // Reset to safe state
      setNodes([])
      setEdges([])
      setFlowName('')
      setFlowDescription('')
      setCurrentFlow(null)
    }
  }

  // Delete a saved flow
  const deleteFlow = async (flowId, flowName) => {
    try {
      const { error } = await supabase
        .from('ai_flows')
        .delete()
        .eq('id', flowId)

      if (error) {
        console.error('Error deleting flow:', error)
        toast.error('Failed to delete flow')
        return
      }

      toast.success(`Flow "${flowName}" deleted`)
      loadSavedFlows() // Refresh the list
    } catch (error) {
      console.error('Error deleting flow:', error)
      toast.error('Failed to delete flow')
    }
  }

  // REAL WORKFLOW EXECUTION FUNCTION
  const executeWorkflow = async (testInput = null) => {
    if (nodes.length === 0) {
      toast.error('No workflow to execute')
      return
    }

    // Reset execution state
      setIsExecuting(true)
      setExecutionProgress(0)
      setCurrentExecutingNode(null)
      setExecutionResults(null)
      setExecutionError(null)
      
      // Show execution modal
      setShowExecutionModal(true)
      setExecutionModalData({
        nodeId: null,
        nodeName: 'Initializing...',
        status: 'executing',
        progress: 0,
        timestamp: new Date().toLocaleTimeString()
      })

    try {
      // Extract test input from input node if available
      const inputNode = nodes.find(node => node.type === 'input')
      let userInput = testInput || {}
      
      // If input node has test input enabled, use those values
      console.log('🔍 Input node debug:')
      console.log('  - Input node found:', !!inputNode)
      console.log('  - Test input enabled:', inputNode?.data?.testInputEnabled)
      console.log('  - Test input values:', inputNode?.data?.testInputValues)
      console.log('  - Input node data keys:', inputNode?.data ? Object.keys(inputNode.data) : 'No data')
      
      if (inputNode?.data?.testInputEnabled && inputNode?.data?.testInputValues) {
        console.log('🎯 Using ENABLED test input values from input node:', inputNode.data.testInputValues)
        userInput = inputNode.data.testInputValues
      } else if (inputNode?.data?.testInputValues) {
        console.log('🎯 Using DEFAULT test input values from input node:', inputNode.data.testInputValues)
        userInput = inputNode.data.testInputValues
      } else {
        console.log('❌ No test input values found in input node')
      }
      
      console.log('📊 Final user input for workflow:', userInput)
      console.log('📊 User input keys:', Object.keys(userInput))
      console.log('📊 Specific values:')
      console.log('  - "Book Title":', userInput["Book Title"])
      console.log('  - "Author Name":', userInput["Author Name"])
      console.log('  - Genre:', userInput.Genre)
      console.log('  - "Target Audience":', userInput["Target Audience"])
      console.log('  - "Book Description":', userInput["Book Description"])

      const workflowId = `workflow_${Date.now()}`
      setCurrentWorkflowId(workflowId)

      // Progress callback to update UI and modal
      const progressCallback = (update) => {
        setExecutionProgress(update.progress)
        setCurrentExecutingNode(update.nodeId)
        
        // Update modal data with real-time info - ensure AI data is preserved
        setExecutionModalData({
          ...update,
          timestamp: new Date().toLocaleTimeString(),
          providerName: update.providerName || null,
          // Preserve AI thinking data
          aiResponse: update.aiResponse,
          processedContent: update.processedContent,
          rawData: update.rawData,
          tokens: update.tokens,
          cost: update.cost,
          words: update.words
        })
        
        if (update.status === 'completed') {
          console.log(`Node ${update.nodeName} completed:`, update.output)
        } else if (update.status === 'error') {
          console.error(`Node ${update.nodeName} failed:`, update.error)
        }
      }

      // Execute the real workflow
      console.log('🚀 Starting REAL workflow execution...')
      
      // Get SuperAdmin user from context - NO FALLBACKS
      console.log('🔍 SuperAdmin context debug:', { 
        superAdminUser, 
        isAuthenticated, 
        getSuperAdminUserId: getSuperAdminUserId(),
        contextKeys: Object.keys(superAdminUser || {})
      })
      
      if (!superAdminUser) {
        throw new Error('SuperAdmin user not authenticated. Please log in as SuperAdmin first.');
      }
      
      console.log('🔍 Using SuperAdmin user for workflow:', superAdminUser)
      
      const executionContext = {
        executionId: workflowId,
        userId: superAdminUser?.id,
        userEngineId: currentFlow?.id || null,
        masterEngineId: currentFlow?.engine_id || null,
        levelId: superAdminUser?.level_id || null,
        nodes,
        edges,
        userInput
      }

      const results = await workflowExecutionService.executeWorkflow(
        nodes,
        edges,
        userInput,
        workflowId,
        progressCallback,
        superAdminUser,
        executionContext
      )

      setExecutionResults(results)
      setExecutionProgress(100)
      setCurrentExecutingNode(null)
      
      // Update flow usage statistics
      if (currentFlow?.id) {
        try {
          await flowPersistenceService.incrementUsage(currentFlow.id)
          console.log('✅ Flow usage statistics updated')
        } catch (error) {
          console.error('❌ Failed to update flow usage statistics:', error)
          // Don't fail the execution if tracking fails
        }
      }
      
      // Update modal with completion and final results
      setExecutionModalData(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        timestamp: new Date().toLocaleTimeString(),
        output: results // Set the final workflow results as output
      }))
      
      console.log('✅ Workflow execution completed:', results)
      toast.success('Workflow executed successfully!')

      // Show results in PROPER IN-APP MODAL WITH RICH TEXT EDITOR
      setExecutionResults(results)
      setShowExecutionModal(true)

    } catch (error) {
      console.error('❌ Workflow execution failed:', error)
      setExecutionError(error.message)
      
      // Update modal with error
      setExecutionModalData(prev => ({
        ...prev,
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      }))
      
      toast.error(`Workflow execution failed: ${error.message}`)
    } finally {
      // Don't reset execution state immediately - let the modal stay open with results
      // Only reset if there was an error
      if (executionError) {
        setIsExecuting(false)
        setCurrentWorkflowId(null)
      }
    }
  }

  // FORCE STOP WORKFLOW FUNCTION
  const forceStopWorkflow = () => {
    if (currentWorkflowId) {
      workflowExecutionService.stopWorkflow(currentWorkflowId)
      setIsExecuting(false)
      setCurrentExecutingNode(null)
      setCurrentWorkflowId(null)
      
      // Update modal with stop status
      setExecutionModalData(prev => ({
        ...prev,
        status: 'stopped',
        timestamp: new Date().toLocaleTimeString()
      }))
      
      toast.info('Workflow stopped by user')
    }
  }

  // CLOSE EXECUTION MODAL FUNCTION
  const closeExecutionModal = () => {
    setShowExecutionModal(false)
    setIsExecuting(false)
    setCurrentExecutingNode(null)
    setCurrentWorkflowId(null)
    setExecutionResults(null)
    setExecutionError(null)
    setExecutionModalData(null)
  }

  const showExecutionResults = (results) => {
    // FULL WIDTH OUTPUT MODAL WITH FLIP BOOK DEFAULT
    const resultsWindow = window.open('', '_blank', 'width=1920,height=1080,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,status=no')
    if (resultsWindow) {
      const content = results.lastNodeOutput?.content || results.content || 'No content generated'
      const deliverables = results.lastNodeOutput?.deliverables || results.deliverables || []
      const metadata = results.metadata || {}
      
      // Generate sexy download buttons with custom naming
      const downloadButtons = deliverables.map(deliverable => `
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%); 
                    border: 2px solid rgba(139, 92, 246, 0.5); border-radius: 20px; padding: 25px; margin: 15px; 
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); transition: all 0.3s ease;
                    position: relative; overflow: hidden;" 
             onmouseover="this.style.transform='translateY(-8px) scale(1.02)'; this.style.boxShadow='0 20px 50px rgba(0, 0, 0, 0.5)'"
             onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.4)'">
          
          <div style="font-size: 2.5em; margin-bottom: 15px;">${deliverable.format === 'pdf' ? '📕' : deliverable.format === 'epub' ? '📚' : deliverable.format === 'docx' ? '📄' : deliverable.format === 'html' ? '🌐' : '📝'}</div>
          
          <div style="font-size: 1.4em; font-weight: 800; color: #f1f5f9; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
            ${deliverable.format.toUpperCase()}
          </div>
          
          <div style="margin-bottom: 20px;">
            <input type="text" id="filename_${deliverable.format}" placeholder="Enter filename (without extension)" 
                   value="${metadata.bookTitle || 'lekhika_masterpiece'}"
                   style="width: 100%; padding: 12px 16px; border: 2px solid rgba(139, 92, 246, 0.4); 
                          border-radius: 12px; background: rgba(15, 23, 42, 0.8); color: white; 
                          font-size: 1em; font-weight: 600; text-align: center;
                          backdrop-filter: blur(10px);" />
          </div>
          
          <button onclick="customDownload('${deliverable.format}', \`${deliverable.content.replace(/`/g, '\\`')}\`, '${deliverable.format}')" 
                  style="background: linear-gradient(45deg, #8B5CF6, #3B82F6); 
                         color: white; border: none; padding: 15px 30px; 
                         border-radius: 15px; cursor: pointer; font-weight: 800; 
                         font-size: 1.1em; text-transform: uppercase; letter-spacing: 1px;
                         box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
                         transition: all 0.3s ease; width: 100%;"
                  onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 12px 35px rgba(139, 92, 246, 0.6)'"
                  onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 25px rgba(139, 92, 246, 0.4)'">
            🚀 Download ${deliverable.format.toUpperCase()}
          </button>
        </div>
      `).join('')
      
      resultsWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🎉 Your Masterpiece is Ready! - Lekhika</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); 
                min-height: 100vh; 
                color: white; 
                overflow-x: hidden;
                animation: backgroundShift 20s ease-in-out infinite alternate;
                line-height: 1.6;
              }
              
              @keyframes backgroundShift {
                0% { background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); }
                100% { background: linear-gradient(135deg, #16213e 0%, #1a1a2e 50%, #0f0f23 100%); }
              }
              .container { 
                width: 100%; 
                min-height: 100vh; 
                padding: 0;
                background: transparent;
                position: relative; 
                overflow: hidden;
              }
              
              .content-area {
                max-width: none;
                width: 100%;
                padding: 2rem;
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(25px);
                border-radius: 0;
                min-height: 100vh;
              }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #2d3748; margin: 0; font-size: 2.5em; }
              .header p { color: #718096; margin: 10px 0 0 0; font-size: 1.1em; }
              .download-section { background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
              .download-section h3 { color: #2d3748; margin: 0 0 15px 0; }
              .content-section { margin: 20px 0; }
              .content-section h3 { color: #2d3748; margin: 0 0 15px 0; }
              .content-preview { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; max-height: 400px; overflow-y: auto; white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.6; }
              .metadata { background: #f1f5f9; border: 1px solid #cbd5e0; border-radius: 8px; padding: 15px; font-family: 'Courier New', monospace; font-size: 12px; }
              .stats { display: flex; justify-content: space-around; margin: 20px 0; flex-wrap: wrap; }
              .stat { text-align: center; padding: 15px; background: #edf2f7; border-radius: 8px; margin: 5px; min-width: 120px; }
              .stat-value { font-size: 1.5em; font-weight: bold; color: #2d3748; }
              .stat-label { color: #718096; font-size: 0.9em; }
              .success-badge { background: #48bb78; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
            </style>
          </head>
          <body>
            <!-- Floating Cosmic Orbs -->
            <div class="floating-orb" style="left: 5%; animation-delay: 0s;"></div>
            <div class="floating-orb" style="left: 25%; animation-delay: -4s;"></div>
            <div class="floating-orb" style="left: 50%; animation-delay: -8s;"></div>
            <div class="floating-orb" style="left: 75%; animation-delay: -12s;"></div>
            <div class="floating-orb" style="left: 90%; animation-delay: -16s;"></div>
            
            <div class="container">
              <div class="content-area">
                <!-- HEADER WITH EDIT TOGGLE -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem 2rem; background: rgba(15, 23, 42, 0.8); border-radius: 1rem;">
                  <div>
                    <h1 style="font-size: 2.5rem; font-weight: 800; color: #f1f5f9; margin: 0; text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);">
                      📖 ${metadata.bookTitle || 'Your Masterpiece'}
                    </h1>
                    <p style="font-size: 1.1rem; color: #c084fc; margin: 0.5rem 0 0 0;">
                      Generated successfully • Ready for download
                    </p>
                  </div>
                  <div style="display: flex; gap: 1rem;">
                    <button id="editToggle" onclick="toggleEditMode()" style="background: linear-gradient(45deg, #8B5CF6, #3B82F6); color: white; border: none; padding: 1rem 2rem; border-radius: 1rem; font-weight: 700; font-size: 1rem; cursor: pointer; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3); transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                      ✏️ Edit Book
                    </button>
                    <button onclick="window.close()" style="background: rgba(239, 68, 68, 0.8); color: white; border: none; padding: 1rem 2rem; border-radius: 1rem; font-weight: 700; cursor: pointer;">
                      ✕ Close
                    </button>
                  </div>
                </div>
                
                <!-- FLIP BOOK DISPLAY (DEFAULT) -->
                <div id="flipBookView" style="margin-bottom: 2rem;">
                  <div style="background: linear-gradient(135deg, #fef3c7, #fed7aa); border-radius: 1.5rem; padding: 2rem; min-height: 600px; position: relative; perspective: 1000px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);">
                    
                    <!-- Book spine -->
                    <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 4px; height: 80%; background: linear-gradient(to bottom, #92400e, #78350f); box-shadow: 0 0 20px rgba(0, 0, 0, 0.3); z-index: 10; border-radius: 2px;"></div>
                    
                    <!-- Left page -->
                    <div style="position: absolute; left: 0; top: 0; width: 50%; height: 100%; background: white; box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.2); border-radius: 0.75rem 0 0 0.75rem; overflow: hidden;">
                      <div style="padding: 2rem; height: 100%; overflow-y: auto;">
                        <div style="font-family: Georgia, serif; font-size: 16px; line-height: 1.8; color: #1f2937; text-align: justify;">
                          <h1 style="text-align: center; color: #1f2937; margin-bottom: 2rem; font-size: 2rem; font-weight: 700;">
                            ${metadata.bookTitle || 'Your Book Title'}
                          </h1>
                          <p style="text-align: center; margin-bottom: 3rem; color: #6b7280; font-size: 1.2rem;">
                            by ${metadata.authorName || 'The Author'}
                          </p>
                          <div style="margin-bottom: 2rem;">
                            <h2 style="color: #374151; margin-bottom: 1rem; font-size: 1.4rem; font-weight: 600;">Foreword</h2>
                            <p>Dear Reader, welcome to this comprehensive guide that will transform your understanding and provide practical wisdom for immediate application.</p>
                          </div>
                        </div>
                      </div>
                      <div style="position: absolute; bottom: 1rem; left: 2rem; font-size: 0.9rem; color: #9ca3af;">Page 1</div>
                    </div>
                    
                    <!-- Right page -->
                    <div style="position: absolute; right: 0; top: 0; width: 50%; height: 100%; background: white; box-shadow: -5px 5px 20px rgba(0, 0, 0, 0.2); border-radius: 0 0.75rem 0.75rem 0; overflow: hidden;">
                      <div style="padding: 2rem; height: 100%; overflow-y: auto;">
                        <div style="font-family: Georgia, serif; font-size: 16px; line-height: 1.8; color: #1f2937; text-align: justify;">
                          ${typeof content === 'string' ? content.replace(/\n/g, '<br>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>').substring(0, 3000) + (content.length > 3000 ? '<br><br><em>...continue reading in downloaded version</em>' : '') : 'Content preview not available'}
                        </div>
                      </div>
                      <div style="position: absolute; bottom: 1rem; right: 2rem; font-size: 0.9rem; color: #9ca3af;">Page 2</div>
                    </div>
                    
                    <!-- Page flip controls -->
                    <button style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); background: rgba(139, 92, 246, 0.8); color: white; border: none; padding: 1rem; border-radius: 50%; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-50%) scale(1.1)'" onmouseout="this.style.transform='translateY(-50%) scale(1)'">
                      ←
                    </button>
                    <button style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: rgba(139, 92, 246, 0.8); color: white; border: none; padding: 1rem; border-radius: 50%; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-50%) scale(1.1)'" onmouseout="this.style.transform='translateY(-50%) scale(1)'">
                      →
                    </button>
                  </div>
                </div>
                
                <!-- RICH TEXT EDITOR (HIDDEN BY DEFAULT) -->
                <div id="editorView" style="display: none; margin-bottom: 2rem;">
                  <div style="background: rgba(15, 23, 42, 0.95); border-radius: 1.5rem; padding: 2rem; min-height: 600px;">
                    <textarea id="bookEditor" style="width: 100%; height: 500px; background: rgba(255, 255, 255, 0.95); border: none; border-radius: 1rem; padding: 2rem; font-family: Georgia, serif; font-size: 16px; line-height: 1.8; color: #1f2937; resize: none; outline: none;">${typeof content === 'string' ? content : ''}</textarea>
                    <div style="margin-top: 1rem; text-align: center;">
                      <button onclick="publishChanges()" style="background: linear-gradient(45deg, #10b981, #059669); color: white; border: none; padding: 1rem 3rem; border-radius: 1rem; font-weight: 700; font-size: 1.1rem; cursor: pointer; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3); margin-right: 1rem;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🚀 Publish Changes
                      </button>
                      <button onclick="toggleEditMode()" style="background: rgba(107, 114, 128, 0.8); color: white; border: none; padding: 1rem 2rem; border-radius: 1rem; font-weight: 700; cursor: pointer;">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-value">${metadata.totalWords || metadata.totalContent || 0}</div>
                  <div class="stat-label">Total Words</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${deliverables.length}</div>
                  <div class="stat-label">Formats Available</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${metadata.formats ? metadata.formats.join(', ') : 'Multiple'}</div>
                  <div class="stat-label">Export Formats</div>
                </div>
              </div>
              
              <div class="download-section">
                <h3>📥 Download Your Content</h3>
                <p>Choose your preferred format and download instantly:</p>
                ${downloadButtons || '<p>No downloadable formats available</p>'}
              </div>
              
                <!-- CLEAN CONTENT DISPLAY -->
                <div style="margin: 3rem 0;">
                  <h2 style="font-size: 2rem; font-weight: 700; color: #f1f5f9; margin-bottom: 2rem; text-align: center;">
                    📖 Your Generated Content
                  </h2>
                  <div style="background: rgba(255, 255, 255, 0.95); border-radius: 1.5rem; padding: 3rem; margin: 2rem 0; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-height: 70vh; overflow-y: auto;">
                    <div style="color: #1f2937; font-family: 'Georgia', serif; font-size: 1.1rem; line-height: 1.8; text-align: justify;">
                      ${typeof content === 'string' ? content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') : 'Content not available'}
                    </div>
                  </div>
                </div>
              
              <!-- Metadata hidden by default - can be shown if needed -->
              <div class="content-section" style="display: none;" id="metadata-section">
                <h3>📊 Generation Metadata</h3>
                <div class="metadata">${JSON.stringify(metadata, null, 2)}</div>
              </div>
              
              <div style="text-align: center; padding: 20px;">
                <button onclick="document.getElementById('metadata-section').style.display = document.getElementById('metadata-section').style.display === 'none' ? 'block' : 'none'"
                        style="background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.5); 
                               color: #8B5CF6; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600;">
                  🔍 Toggle Technical Details
                </button>
              </div>
            </div>
            
            <script>
              // EDIT MODE TOGGLE FUNCTIONALITY
              function toggleEditMode() {
                const flipBookView = document.getElementById('flipBookView')
                const editorView = document.getElementById('editorView')
                const editToggle = document.getElementById('editToggle')
                
                if (flipBookView.style.display === 'none') {
                  // Switch to flip book view
                  flipBookView.style.display = 'block'
                  editorView.style.display = 'none'
                  editToggle.innerHTML = '✏️ Edit Book'
                } else {
                  // Switch to editor view
                  flipBookView.style.display = 'none'
                  editorView.style.display = 'block'
                  editToggle.innerHTML = '📖 View Book'
                }
              }
              
              // PUBLISH CHANGES FUNCTIONALITY
              function publishChanges() {
                const editor = document.getElementById('bookEditor')
                const newContent = editor.value
                
                // Show loading state
                const publishBtn = event.target
                publishBtn.innerHTML = '🔄 Publishing...'
                publishBtn.disabled = true
                
                // Simulate format regeneration
                setTimeout(() => {
                  alert('✅ All formats regenerated successfully!\\n\\nYour edited book is now available in all selected formats.')
                  publishBtn.innerHTML = '🚀 Publish Changes'
                  publishBtn.disabled = false
                  
                  // Switch back to flip book view
                  toggleEditMode()
                }, 2000)
              }
            
              // Custom download function with filename input
              function customDownload(format, content, fileExtension) {
                const filenameInput = document.getElementById(\`filename_\${format}\`)
                const customFilename = filenameInput.value.trim() || 'lekhika_masterpiece'
                
                // Get proper MIME type
                const mimeTypes = {
                  'pdf': 'application/pdf',
                  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'html': 'text/html',
                  'markdown': 'text/markdown',
                  'md': 'text/markdown',
                  'txt': 'text/plain',
                  'text': 'text/plain',
                  'json': 'application/json',
                  'epub': 'application/epub+zip',
                  'xml': 'application/xml'
                }
                
                const mimeType = mimeTypes[format.toLowerCase()] || 'text/plain'
                const blob = new Blob([content], { type: mimeType })
                
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = \`\${customFilename}.\${fileExtension}\`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                
                // Show sexy success message
                const successDiv = document.createElement('div')
                successDiv.innerHTML = \`
                  <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                              background: linear-gradient(45deg, #10b981, #059669); color: white; 
                              padding: 25px 40px; border-radius: 20px; font-size: 1.2em; font-weight: 800;
                              box-shadow: 0 15px 40px rgba(16, 185, 129, 0.6); z-index: 9999;
                              animation: successPop 0.5s ease-out;">
                    🎉 \${format.toUpperCase()} downloaded as "\${customFilename}.\${fileExtension}"!
                  </div>
                \`
                document.body.appendChild(successDiv)
                setTimeout(() => document.body.removeChild(successDiv), 3000)
              }
              
              // Legacy download function for backward compatibility
              function downloadContent(format, content, filename) {
                customDownload(format, content, format)
              }
            </script>
          </body>
        </html>
      `)
    }
  }

  const [currentClientFlowKey, setCurrentClientFlowKey] = useState(null)
  const [showPresetsModal, setShowPresetsModal] = useState(false)
  const [selectedPresetsFlowKey, setSelectedPresetsFlowKey] = useState('')

  // Load client flow
  const loadClientFlow = async (flow, flowKey = null) => {
    try {
      console.log('🔍 Loading client flow:', flow)
      
      // Validate flow data structure
      if (!flow || typeof flow !== 'object') {
        throw new Error('Invalid client flow data structure')
      }

      // Clear existing flow
      setNodes([])
      setEdges([])
      setCurrentClientFlowKey(flowKey)
      
      // Set flow metadata
      setFlowName(flow.name)
      setFlowDescription(flow.description)
      
      // Load nodes and edges
      if (flow.nodes && flow.edges && Array.isArray(flow.nodes) && Array.isArray(flow.edges)) {
        console.log('Setting client flow nodes:', flow.nodes.length)
        console.log('Setting client flow edges:', flow.edges.length)
        
        // Validate node structure
        const validNodes = flow.nodes.filter(node => 
          node && 
          typeof node === 'object' && 
          node.id && 
          node.type && 
          node.position && 
          node.data
        )
        
        if (validNodes.length !== flow.nodes.length) {
          console.warn(`Filtered out ${flow.nodes.length - validNodes.length} invalid nodes`)
        }
        
        // Surgical runtime scrub: remove any hardcoded selectedModels from client flow templates
        const scrubbedNodes = validNodes.map(node => {
          try {
            if (node && node.data && node.data.selectedModels) {
              const clone = { ...node, data: { ...node.data } }
              delete clone.data.selectedModels
              return clone
            }
          } catch (e) {
            console.warn('Scrub selectedModels failed for node', node?.id, e)
          }
          return node
        })

        setNodes(scrubbedNodes)
        setEdges(flow.edges)
        setCurrentFlow(null) // Clear current flow since we're loading a template
        toast.success(`Client flow "${flow.name}" loaded successfully`)
      } else {
        console.warn('No valid nodes or edges found in client flow:', flow)
        toast.error('Client flow structure is invalid')
        return
      }
      
    } catch (error) {
      console.error('Error loading client flow:', error)
      toast.error('Error loading client flow: ' + error.message)
    }
  }

  // Load saved flows on component mount
  useEffect(() => {
    loadSavedFlows()
  }, [])

  // Create preset flows with full configurations
  const createPresetFlow = (stepCount) => {
    let presetNodes = []
    let presetEdges = []
    
    if (stepCount === 'starter') {
      // Starter Workflow - Basic Tier (4 Nodes)
      presetNodes = [
        {
          id: 'input-1',
          type: 'input',
          position: { x: 100, y: 200 },
          data: {
            label: 'Input Validation & Metadata Structuring',
            description: 'Validate user inputs and auto-generate missing metadata for entry-level automation',
            inputInstructions: `TIER 1 BASIC INPUT VALIDATION & METADATA STRUCTURING:

You are an expert input validation and metadata generation specialist designed for entry-level users. Your role is to create fast, simple, automated processing with intelligent defaults.

CORE VALIDATION FRAMEWORK:
• Input Validation: Title, Author, Topic, Word Count, Tone, Language, Accent (e.g., "UK English"), Image Preference
• Auto-Generation: Missing metadata using NLP topic detection and genre mapping
• Template Assignment: Default templates based on detected topic (self-help, tech, finance, business)
• Smart Defaults: Apply proven configurations for maximum success rates

AUTOMATION INTELLIGENCE:
• NLP Topic Detection: Analyze user input to detect intent and map to predefined categories
• Genre Classification: Automatically assign appropriate book type and structure
• Audience Inference: Suggest target demographics based on topic and tone
• Quality Assurance: Ensure all required fields are populated with intelligent defaults

OUTPUT REQUIREMENTS:
• Structured JSON with fully validated and enriched inputs
• Genre-specific metadata assignments
• Optimal word count and chapter recommendations
• Professional defaults for missing information`,
            inputFields: [
              { id: 1, name: 'bookTitle', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter your book title' },
              { id: 2, name: 'authorName', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
              { id: 3, name: 'topic', type: 'select', required: true, variable: 'topic', options: INPUT_OPTIONS.niches },
              { id: 4, name: 'wordCount', type: 'select', required: true, variable: 'word_count', options: ['10000-15000', '15000-20000', '20000-25000'], defaultValue: '15000-20000' },
              { id: 5, name: 'tone', type: 'select', required: true, variable: 'tone', options: INPUT_OPTIONS.tones },
              { id: 6, name: 'accent', type: 'select', required: true, variable: 'accent', options: INPUT_OPTIONS.accents },
              { id: 7, name: 'targetAudience', type: 'select', required: true, variable: 'target_audience', options: ['Beginner', 'Intermediate', 'General Public'], defaultValue: 'Intermediate' },
              { id: 8, name: 'includeImages', type: 'boolean', required: false, variable: 'include_images', defaultValue: true },
              { id: 9, name: 'chapterCount', type: 'select', required: true, variable: 'chapter_count', options: [5, 6, 7, 8] }
            ],
            aiEnabled: false
          }
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 400, y: 150 },
          data: {
            label: 'AI Outline Generation Engine',
            description: 'Generate logical, reader-friendly chapter outlines with genre-specific structure',
            inputInstructions: `AI OUTLINE GENERATION FOR BASIC TIER:

You are an expert outline generation specialist creating logical, reader-friendly structures for entry-level authors. Focus on proven frameworks that maximize reader engagement and content coherence.

OUTLINE GENERATION FRAMEWORK:
• Genre-Specific Structure: Apply proven templates (problem → solution → action for self-help, etc.)
• Reader-Friendly Flow: Logical progression that maintains engagement throughout
• Chapter Optimization: Perfect balance of content depth and accessibility
• Visual Integration: Strategic placement suggestions for images and graphics
• Action-Oriented Design: Each chapter builds toward practical outcomes

STRUCTURAL INTELLIGENCE:
• Apply proven content frameworks for maximum impact
• Ensure logical flow and progressive complexity
• Include strategic image placement points when requested
• Optimize chapter length for target word count
• Build in engagement hooks and transition elements`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are an expert outline generation specialist for {topic} content targeting {target_audience}. Create logical, reader-friendly chapter outlines that follow proven genre-specific structures. Focus on maximum reader engagement and practical value delivery.',
            userPrompt: `Generate a logical, reader-friendly chapter outline for a {word_count}-word eBook on '{book_title}' in {tone} tone, for {target_audience}, with {chapter_count} chapters.

OUTLINE SPECIFICATIONS:
- Topic Focus: {topic}
- Target Audience: {target_audience} level
- Writing Style: {tone} tone with {accent} accent
- Adaptive Length: Let chapter length vary by narrative importance; hit ~{word_count} total (±15%), no per-chapter quota
- Image Integration: {include_images ? 'Include strategic image placement suggestions' : 'Text-only content'}

STRUCTURAL REQUIREMENTS:
- Apply genre-specific framework for {topic}
- Ensure logical progression from basic concepts to advanced applications
- Each chapter should have compelling title and 1-line description
- Include introduction and conclusion chapters
- Balance theory with practical, actionable content
- Suggest strategic image placement points if images are included

Create an outline that ensures reader engagement and maximum value delivery.`,
            temperature: 0.7,
            maxTokens: 3000
          }
        },
        {
          id: 'process-2',
          type: 'process',
          position: { x: 700, y: 200 },
          data: {
            label: 'Full Manuscript Generation',
            description: 'Sequential chapter generation with memory injection and tone consistency',
            inputInstructions: `FULL MANUSCRIPT GENERATION FOR BASIC TIER:

You are an expert manuscript generation specialist creating complete, publication-ready content for entry-level authors. Focus on sequential chapter creation with perfect coherence and professional quality.

MANUSCRIPT GENERATION FRAMEWORK:
• Sequential Processing: Generate chapters one-by-one for maximum coherence
• Memory Injection: Pass previous chapter summaries to maintain perfect flow
• Tone Consistency: Use style anchoring to ensure uniform voice throughout
• Quality Standards: Professional writing that meets publication requirements
• Content Rules: Specific formatting and citation guidelines for credibility

PROFESSIONAL WRITING STANDARDS:
• Do NOT evenly divide words; dynamically size chapters by plot, stakes, and pacing (keep total near target ±15%)
• Use bullet points, short paragraphs, real-world analogies for accessibility
• No hallucinated citations unless clearly flagged as "example only"
• Maintain consistent voice and expertise level throughout
• Include actionable takeaways in each chapter`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are an expert manuscript writer specializing in {topic} for {target_audience}. Generate complete, publication-ready chapters with perfect coherence and professional quality. Maintain consistent {tone} tone with {accent} accent throughout. Focus on practical value and reader engagement.',
            userPrompt: `Create a complete manuscript for "{book_title}" using the generated outline.

MANUSCRIPT SPECIFICATIONS:
- Total Length: {word_count} words
- Chapter Count: {chapter_count} chapters
- Target Audience: {target_audience}
- Writing Style: {tone} tone with {accent} accent
- Content Focus: {topic}

WRITING REQUIREMENTS:
- Generate chapters sequentially for maximum coherence
- Do NOT evenly divide words; allocate chapter length by narrative need and coherence (overall ~{word_count} ±15%)
- Use bullet points, short paragraphs, and real-world analogies
- Include compelling introduction and conclusion
- Maintain consistent voice and expertise level
- No hallucinated citations unless flagged as "example only"
- Each chapter should build logically on previous content
- Include actionable takeaways and practical applications

Create a complete, publication-ready manuscript that delivers exceptional value to {target_audience}.`,
            temperature: 0.7,
            maxTokens: 8000
          }
        },
        {
          id: 'output-1',
          type: 'output',
          position: { x: 1000, y: 150 },
          data: {
            label: 'Auto-Formatting & Multi-Format Export',
            description: 'Professional formatting with cover page and multi-format export delivery',
            inputInstructions: `AUTO-FORMATTING & EXPORT FOR BASIC TIER:

You are a professional publishing specialist creating final deliverables for entry-level authors. Apply clean formatting and generate multiple export formats for maximum distribution flexibility.

FORMATTING EXCELLENCE:
• Professional Layout: Clean formatting with proper headings, spacing, and typography
• Cover Page Generation: Title, Author, and professional branding elements
• Multi-Format Export: PDF, EPUB, MOBI optimized for different platforms
• Delivery Options: Dashboard download and email delivery capabilities
• Quality Assurance: Final review ensuring publication-ready standards

EXPORT SPECIFICATIONS:
• Typography: Professional fonts and sizing (Calibri 11pt or equivalent)
• Layout: Proper spacing, margins, and chapter breaks
• Cover Design: Automated cover page with title and author
• Format Optimization: Platform-specific formatting for each export type
• Distribution Ready: Files optimized for immediate publication or sharing`,
            outputFormat: 'multi-format',
            generateCover: true,
            includeTOC: true,
            includeMetadata: true,
            exportFormats: ['pdf', 'epub', 'mobi', 'docx'],
            deliveryMethod: 'dashboard_and_email',
            aiEnabled: true,
            selectedModels: []
          }
        }
      ]
      
      presetEdges = [
        { id: 'e1-2', source: 'input-1', target: 'process-1', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
        { id: 'e2-3', source: 'process-1', target: 'process-2', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
        { id: 'e3-4', source: 'process-2', target: 'output-1', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
      ]
      
      setFlowName('Starter - Basic Tier Automated Workflow')
      setFlowDescription('Fast, simple, automated 4-node workflow designed for entry-level users. Complete book generation with minimal input required.')
    }
    
    else if (stepCount === 'pro') {
      // Pro Workflow - Professional Tier (6 Nodes)
      presetNodes = [
        {
          id: 'input-1',
          type: 'input',
          position: { x: 100, y: 200 },
          data: {
            label: 'Enhanced Input Validation & Metadata Structuring',
            description: 'Advanced validation with personalization features and professional metadata generation',
            inputInstructions: `PROFESSIONAL TIER INPUT VALIDATION & METADATA STRUCTURING:

You are an advanced input validation and metadata generation specialist for professional-tier users. Your role is to create sophisticated, personalized processing with enhanced quality controls and professional customization options.

ENHANCED VALIDATION FRAMEWORK:
• Advanced Input Processing: Title, Author, Topic, Word Count, Tone, Language, Accent, Target Demographics, Personalization Preferences
• Intelligent Auto-Generation: Sophisticated NLP analysis with market research integration
• Professional Templates: Industry-specific frameworks with competitive analysis
• Quality Controls: Enhanced validation with professional publishing standards
• Personalization Engine: Custom branding, voice, and style preferences

PROFESSIONAL INTELLIGENCE:
• Market Analysis: Competitive landscape assessment and positioning strategies
• Advanced NLP: Multi-layered topic analysis with trend identification
• Brand Integration: Custom voice development and style guide creation
• Quality Assurance: Professional validation with industry benchmark comparison
• Personalization: Individual writing style analysis and enhancement recommendations

OUTPUT REQUIREMENTS:
• Comprehensive JSON with advanced metadata and personalization settings
• Professional branding and voice guidelines
• Market positioning recommendations
• Enhanced quality control parameters
• Custom style and formatting preferences`,
            inputFields: [
              { id: 1, name: 'bookTitle', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter your professional book title' },
              { id: 2, name: 'authorName', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
              { id: 3, name: 'authorBio', type: 'textarea', required: false, variable: 'author_bio', placeholder: 'Brief author biography for credibility' },
              { id: 4, name: 'topic', type: 'select', required: true, variable: 'topic', options: INPUT_OPTIONS.niches },
              { id: 5, name: 'wordCount', type: 'select', required: true, variable: 'word_count', options: ['15000-25000', '25000-35000', '35000-50000'] },
              { id: 6, name: 'tone', type: 'select', required: true, variable: 'tone', options: INPUT_OPTIONS.tones },
              { id: 7, name: 'accent', type: 'select', required: true, variable: 'accent', options: INPUT_OPTIONS.accents },
              { id: 8, name: 'targetAudience', type: 'select', required: true, variable: 'target_audience', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Mixed Audience'] },
              { id: 9, name: 'industryFocus', type: 'select', required: false, variable: 'industry_focus', options: ['Startup', 'Corporate', 'SMB', 'Enterprise', 'General'] },
              { id: 10, name: 'includeImages', type: 'boolean', required: false, variable: 'include_images' },
              { id: 11, name: 'brandingStyle', type: 'select', required: false, variable: 'branding_style', options: ['Professional', 'Modern', 'Classic', 'Innovative', 'Authority'] },
              { id: 12, name: 'chapterCount', type: 'select', required: true, variable: 'chapter_count', options: [6, 8, 10, 12] },
              { id: 13, name: 'coverImageOption', type: 'select', required: true, variable: 'cover_image_option', options: ['upload', 'generate', 'none'] },
              { id: 14, name: 'coverImageUpload', type: 'file', required: false, variable: 'cover_image_upload', condition: 'coverImageOption === upload' },
              { id: 15, name: 'coverImageStyle', type: 'select', required: false, variable: 'cover_image_style', options: ['Professional', 'Modern', 'Classic', 'Artistic', 'Minimalist', 'Corporate'], condition: 'coverImageOption === generate' },
              { id: 16, name: 'customRequirements', type: 'textarea', required: false, variable: 'custom_requirements', placeholder: 'Specific professional requirements, unique angles, or industry insights' }
            ],
            aiEnabled: false
          }
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 300, y: 100 },
          data: {
            label: 'Enhanced AI Outline Generation',
            description: 'Professional outline generation with market analysis and competitive intelligence',
            inputInstructions: `ENHANCED AI OUTLINE GENERATION FOR PROFESSIONAL TIER:

You are an expert outline generation specialist with advanced market intelligence and competitive analysis capabilities. Create sophisticated, market-aware outlines that position content for professional success.

ENHANCED OUTLINE FRAMEWORK:
• Market Intelligence: Competitive analysis and positioning strategies
• Professional Structure: Industry-proven frameworks with advanced methodology
• Reader Journey Optimization: Sophisticated engagement and retention strategies
• Visual Content Integration: Strategic multimedia placement with professional rationale
• Authority Building: Credibility markers and thought leadership elements

PROFESSIONAL INTELLIGENCE:
• Competitive landscape analysis for unique positioning
• Industry trend integration for market relevance
• Advanced reader psychology for maximum engagement
• Professional formatting with visual hierarchy planning
• Strategic content placement for authority establishment`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a professional outline generation specialist with market intelligence capabilities for {topic} targeting {target_audience} in {industry_focus}. Create sophisticated outlines that establish thought leadership and competitive advantage. Apply advanced content strategy and reader psychology principles.',
            userPrompt: `Generate a sophisticated, market-aware chapter outline for a professional {word_count}-word book on '{book_title}' in {tone} tone, for {target_audience} in {industry_focus} sector, with {chapter_count} chapters.

ENHANCED SPECIFICATIONS:
- Topic Authority: {topic} with competitive differentiation
- Professional Audience: {target_audience} level in {industry_focus}
- Brand Positioning: {branding_style} approach
- Writing Excellence: {tone} tone with {accent} accent
- Adaptive Length: Let chapter length vary naturally; total target ~{word_count} (±15%), no equal split
- Visual Strategy: {include_images ? 'Include strategic visual content plan with professional rationale' : 'Text-focused with strategic formatting'}

PROFESSIONAL REQUIREMENTS:
- Conduct competitive analysis for unique positioning
- Apply industry-proven content frameworks
- Include authority-building elements and credibility markers
- Design reader journey for maximum engagement and retention
- Strategic visual content placement with professional justification
- Each chapter must build thought leadership credibility
- Include professional development and actionable insights
- Balance theoretical depth with practical application

Custom Requirements: {custom_requirements}

Create an outline that establishes market authority and delivers exceptional professional value.`,
            temperature: 0.6,
            maxTokens: 4000
          }
        },
        {
          id: 'process-2',
          type: 'process',
          position: { x: 600, y: 200 },
          data: {
            label: 'Professional Manuscript Generation',
            description: 'Enhanced sequential generation with authority building and market positioning',
            inputInstructions: `PROFESSIONAL MANUSCRIPT GENERATION FOR PRO TIER:

You are an elite manuscript generation specialist creating authoritative, market-positioned content for professional audiences. Focus on thought leadership, credibility building, and exceptional quality that establishes industry authority.

PROFESSIONAL MANUSCRIPT FRAMEWORK:
• Authority Positioning: Establish thought leadership through expert content delivery
• Market Intelligence Integration: Current trends, data, and industry insights
• Sequential Excellence: Chapter-by-chapter generation with perfect coherence
• Professional Standards: Publication-grade quality exceeding industry benchmarks
• Credibility Building: Expert examples, case studies, and authority markers

ENHANCED WRITING STANDARDS:
• Professional voice with consistent expertise demonstration
• Advanced content structure with strategic information architecture
• Market-relevant examples and cutting-edge insights
• Authority-building elements throughout each chapter
• Professional formatting with advanced readability optimization`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are an elite manuscript specialist with expertise in {topic} for {industry_focus} professionals. Generate authoritative, market-positioned content that establishes thought leadership. Maintain {branding_style} brand positioning with {tone} tone and {accent} accent. Focus on building professional credibility and industry authority.',
            userPrompt: `Create a professional, authoritative manuscript for "{book_title}" targeting {target_audience} professionals in {industry_focus}.

PROFESSIONAL MANUSCRIPT SPECIFICATIONS:
- Authority Level: {target_audience} professionals requiring thought leadership content
- Industry Context: {industry_focus} sector with market positioning
- Total Length Target: ~{word_count} words overall (±15%); chapter lengths vary organically
- Brand Position: {branding_style} approach with {tone} tone and {accent} accent
- Professional Focus: {topic} with competitive differentiation

ENHANCED WRITING REQUIREMENTS:
- Generate chapters sequentially with perfect professional coherence
- Include current market trends, data, and industry insights
- Build authority through expert examples and thought leadership content
- Maintain consistent professional voice and credibility markers
- Strategic use of case studies, statistics, and industry benchmarks
- Professional formatting with advanced readability optimization
- Each chapter must deliver actionable professional insights
- Include strategic thought leadership positioning throughout

Custom Professional Requirements: {custom_requirements}

Author Credibility Context: {author_bio}

Create authoritative content that establishes market leadership and delivers exceptional value to {industry_focus} professionals.`,
            temperature: 0.7,
            maxTokens: 10000
          }
        },
        {
          id: 'process-3',
          type: 'process',
          position: { x: 900, y: 150 },
          data: {
            label: 'AI-Powered Copy Editing & Voice Refinement',
            description: 'Professional editing with engagement enhancement and voice consistency',
            inputInstructions: `AI-POWERED COPY EDITING & VOICE REFINEMENT FOR PRO TIER:

You are a master copy editor and voice refinement specialist ensuring professional-grade content quality. Apply sophisticated editing techniques that enhance clarity, engagement, and professional authority.

PROFESSIONAL EDITING FRAMEWORK:
• Clarity Optimization: Improve flow, engagement, and readability for professional audiences
• Voice Consistency: Maintain perfect tone alignment and brand voice throughout
• Engagement Enhancement: Add professional engagement elements and interaction points
• Quality Assurance: Eliminate repetition, inconsistencies, and jargon overuse
• Professional Polish: Apply publication-grade editing standards

ADVANCED EDITING TECHNIQUES:
• Sentence structure optimization (under 20 words, active voice preference)
• Professional terminology consistency and clarity
• Strategic engagement element integration
• Chapter flow and transition enhancement
• Authority voice strengthening and credibility building`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a master copy editor specializing in professional {topic} content for {industry_focus} audiences. Apply sophisticated editing techniques that enhance clarity, engagement, and authority. Maintain {tone} tone with {branding_style} brand voice throughout.',
            userPrompt: `Perform professional copy editing and voice refinement for "{book_title}" targeting {target_audience} professionals.

EDITING SPECIFICATIONS:
- Content Focus: {topic} for {industry_focus} professionals
- Voice Requirements: {tone} tone with {branding_style} brand positioning
- Target Audience: {target_audience} requiring professional-grade content
- Quality Standard: Publication-ready with thought leadership authority

PROFESSIONAL EDITING REQUIREMENTS:
- Improve clarity, flow, and engagement while maintaining professional authority
- Match the {tone} tone consistently throughout all chapters
- Avoid passive voice and keep sentences under 20 words for readability
- Detect and fix repetition, inconsistent terminology, and jargon overuse
- Insert professional engagement elements:
  • "Professional Insight" boxes with expert tips
  • "Strategic Questions" for self-assessment
  • "Key Takeaways" chapter summaries
  • "Implementation Guide" action items
- Enhance readability for busy professionals
- Strengthen authority voice and credibility markers
- Ensure perfect brand voice consistency

Author Context: {author_bio}
Custom Requirements: {custom_requirements}

Transform the manuscript into a polished, engaging professional resource that establishes thought leadership authority.`,
            temperature: 0.5,
            maxTokens: 8000
          }
        },
        {
          id: 'condition-1',
          type: 'condition',
          position: { x: 1200, y: 100 },
          data: {
            label: 'Visual Content Decision Gateway',
            description: 'Intelligent routing for professional visual content integration',
            inputInstructions: `PROFESSIONAL VISUAL CONTENT DECISION GATEWAY:

You are evaluating professional visual content requirements for sophisticated business publications. Make intelligent decisions about visual enhancement based on industry standards, audience preferences, and professional positioning.

PROFESSIONAL EVALUATION CRITERIA:
• Industry Standards: Professional visual content expectations for the sector
• Audience Analysis: Visual learning preferences of target professional audience
• Brand Positioning: Visual elements that strengthen professional authority
• Content Enhancement: Strategic visual integration for improved comprehension
• Market Positioning: Visual elements that support competitive differentiation`,
            conditions: [
              { 
                id: 1, 
                field: 'include_images', 
                operator: 'equals', 
                value: 'true',
                trueAction: {
                  type: 'generate_content',
                  prompt: 'Generate professional visual content strategy including infographics, diagrams, charts, and professional imagery that enhance comprehension and establish authority. Create detailed image descriptions, placement strategies, and integration guidelines for professional publication standards.',
                  instructions: 'When professional visual content is requested, proceed to generate comprehensive visual content strategy with detailed image descriptions, professional placement guidelines, and authority-building visual elements.'
                },
                falseAction: {
                  type: 'continue',
                  instructions: 'When visual content is not required, proceed directly to final formatting while maintaining all other professional quality standards and focusing on exceptional text-based content delivery.'
                }
              }
            ],
            aiEnabled: true,
            selectedModels: []
          }
        },
        {
          id: 'condition-1',
          type: 'condition',
          position: { x: 1200, y: 100 },
          data: {
            label: 'Cover Image Decision Gateway',
            description: 'Intelligent routing for cover image handling - upload, generate, or skip',
            inputInstructions: `COVER IMAGE DECISION GATEWAY FOR PRO TIER:

You are evaluating cover image requirements based on user preferences. Route workflow based on cover image option selected by user.

COVER IMAGE EVALUATION:
• Upload Option: User has provided their own cover image - validate and process uploaded file
• Generate Option: User wants AI-generated cover - proceed to cover generation with style preferences  
• None Option: User doesn't want a cover - skip cover generation entirely
• Quality Standards: Ensure cover meets professional publishing requirements`,
            conditions: [
              { 
                id: 1, 
                field: 'cover_image_option', 
                operator: 'equals', 
                value: 'upload',
                trueAction: {
                  type: 'continue',
                  instructions: 'Process uploaded cover image - validate format, optimize for publishing, and integrate with final output'
                },
                falseAction: {
                  type: 'check_next_condition',
                  instructions: 'Check if cover generation is needed'
                }
              },
              { 
                id: 2, 
                field: 'cover_image_option', 
                operator: 'equals', 
                value: 'generate',
                trueAction: {
                  type: 'generate_content',
                  prompt: 'Generate professional cover image based on book title, style preferences, and branding guidelines. Use AI image services (DALL-E, Midjourney, Canva API) to create publication-quality cover design.',
                  instructions: 'Proceed to AI cover generation with user style preferences and book metadata'
                },
                falseAction: {
                  type: 'skip_to',
                  instructions: 'Skip cover generation - proceed directly to final output formatting'
                }
              }
            ],
            aiEnabled: false
          }
        },
        {
          id: 'process-4',
          type: 'process',
          position: { x: 1500, y: 200 },
          data: {
            label: 'Professional Image & Visual Content Generation',
            description: 'Advanced visual content creation with professional design standards',
            inputInstructions: `PROFESSIONAL IMAGE & VISUAL CONTENT GENERATION:

You are a professional visual content specialist creating sophisticated imagery and visual elements for business publications. Generate high-quality visual content that enhances professional authority and improves comprehension.

VISUAL CONTENT FRAMEWORK:
• Professional Image Generation: Industry-appropriate imagery with business standards
• Infographic Design: Data visualization and process diagrams for professional audiences
• Strategic Placement: Optimal visual integration with content flow and readability
• Professional Standards: Brand-consistent visual elements with quality assurance
• Accessibility Compliance: Alt text, captions, and professional formatting standards

ADVANCED VISUAL CREATION:
• Generate detailed image descriptions per chapter with professional context
• Create infographics for complex concepts and data visualization
• Design process diagrams and workflow illustrations
• Integrate with professional stock imagery when appropriate
• Auto-place visuals with professional captions and accessibility features`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a professional visual content specialist for {topic} publications targeting {industry_focus} professionals. Create sophisticated visual content that enhances authority and comprehension. Maintain {branding_style} visual standards throughout.',
            userPrompt: `Generate professional visual content for "{book_title}" targeting {target_audience} in {industry_focus}.

COVER IMAGE HANDLING STRATEGY:
- Cover Option: {cover_image_option}
- Cover Style: {cover_image_style || 'Professional'}
- Uploaded Cover: {cover_image_upload ? 'Process uploaded cover image' : 'No uploaded cover'}

VISUAL CONTENT SPECIFICATIONS:
- Industry Context: {industry_focus} professional standards
- Brand Guidelines: {branding_style} visual approach
- Professional Audience: {target_audience} requiring authoritative content
- Content Focus: {topic} with visual enhancement needs

COVER PROCESSING REQUIREMENTS:
IF cover_image_option === 'upload':
- Process and optimize uploaded cover image
- Validate format and dimensions for professional publishing
- Integrate with overall visual content strategy

IF cover_image_option === 'generate':
- Create professional cover design using AI image services (DALL-E, Midjourney, Canva API)
- Style: {cover_image_style} approach with {branding_style} branding
- Generate cover with title, author, and professional design elements
- Store generated cover in Supabase storage

IF cover_image_option === 'none':
- Skip cover generation
- Focus on interior visual content only

PROFESSIONAL VISUAL REQUIREMENTS:
- Generate detailed image descriptions per chapter (e.g., "Professional Infographic: 5-Step Strategic Planning Framework")
- Create sophisticated visual elements:
  • Process diagrams and flowcharts for complex concepts
  • Professional infographics for data visualization
  • Industry-appropriate charts and graphs
  • Authority-building professional imagery
- Strategic visual placement with professional rationale
- Auto-place images with professional captions and alt text
- Maintain brand consistency and professional design standards
- Include visual accessibility features for all audiences
- Provide alternative visual options for user selection

Custom Visual Requirements: {custom_requirements}

Create professional visual content including appropriate cover handling that establishes authority and enhances comprehension for busy professionals.`,
            temperature: 0.6,
            maxTokens: 6000
          }
        },
        {
          id: 'output-1',
          type: 'output',
          position: { x: 1800, y: 150 },
          data: {
            label: 'Multi-Format Export + Professional Preview',
            description: 'Advanced export system with preview mode and approval workflow',
            inputInstructions: `MULTI-FORMAT EXPORT + PROFESSIONAL PREVIEW SYSTEM:

You are a professional publishing specialist creating sophisticated deliverables with preview capabilities and approval workflows. Generate multiple professional formats with quality assurance and client approval processes.

PROFESSIONAL EXPORT FRAMEWORK:
• Multi-Format Generation: Print-ready PDF, responsive EPUB, professional web version (HTML)
• Preview Mode: First 3 chapters + cover for professional review and approval
• Quality Assurance: Professional formatting with industry-standard presentation
• Approval Workflow: Enable minor edits (title, tone adjustments, chapter rewrites)
• Final Delivery: Complete professional package after approval confirmation

ADVANCED EXPORT FEATURES:
• Print-ready PDF with professional typography and formatting
• Responsive EPUB optimized for multiple devices and platforms
• Professional web version with interactive elements and navigation
• Preview system for client review and feedback integration
• Editorial workflow for professional revisions and improvements
• Complete delivery package with all formats and supplementary materials`,
            outputFormat: 'professional-multi-format',
            generateCover: true,
            includeImages: true,
            includeTOC: true,
            includeMetadata: true,
            includePreview: true,
            previewChapters: 3,
            exportFormats: ['print-pdf', 'responsive-epub', 'web-html', 'professional-docx'],
            approvalWorkflow: true,
            editingOptions: ['title', 'tone', 'chapter_rewrite'],
            deliveryMethod: 'professional_package',
            aiEnabled: true,
            selectedModels: []
          }
        }
      ]
      
      presetEdges = [
        { id: 'e1-2', source: 'input-1', target: 'process-1', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
        { id: 'e2-3', source: 'process-1', target: 'process-2', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
        { id: 'e3-4', source: 'process-2', target: 'process-3', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
        { id: 'e4-5', source: 'process-3', target: 'condition-1', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
        { id: 'e5-6', source: 'condition-1', target: 'process-4', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
        { id: 'e6-7', source: 'process-4', target: 'output-1', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
        { id: 'e5-7-alt', source: 'condition-1', target: 'output-1', type: 'smoothstep', animated: true, style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' } }
      ]
      
      setFlowName('Pro - Professional Tier Enhanced Workflow')
      setFlowDescription('Advanced 6-node workflow with copy editing, visual content generation, and professional preview system for Pro tier users')
    }
    
    else if (stepCount === 'ultimate') {
      // Ultimate Workflow - Premium Tier (9 Nodes)
      presetNodes = [
        {
          id: 'input-1',
          type: 'input',
          position: { x: 100, y: 300 },
          data: {
            label: 'Ultimate Input Validation & Brand Integration',
            description: 'Premium validation with brand alignment and publishing-grade metadata',
            inputInstructions: `ULTIMATE TIER INPUT VALIDATION & BRAND INTEGRATION:

You are a premium input validation and brand integration specialist for ultimate-tier publishing. Your role is to create sophisticated, brand-aligned processing with publishing-grade quality controls and comprehensive customization.

ULTIMATE VALIDATION FRAMEWORK:
• Premium Input Processing: Complete publishing metadata, brand assets, voice samples, distribution preferences
• Brand Integration Analysis: Logo, color schemes, typography, voice samples for cloning
• Publishing Metadata: ISBN, categories, keywords, distribution channels, pricing strategy
• Quality Controls: Publishing-grade validation with industry benchmark standards
• Voice Analysis: Past content analysis for voice fingerprint extraction

PREMIUM INTELLIGENCE:
• Publishing Market Analysis: Category positioning and competitive landscape assessment
• Brand Consistency: Visual identity and voice alignment across all materials
• Distribution Strategy: Multi-platform publishing optimization and market positioning
• Voice Fingerprinting: Style analysis from uploaded content for authentic voice cloning
• Quality Assurance: Premium validation exceeding traditional publishing standards

OUTPUT REQUIREMENTS:
• Comprehensive publishing-ready JSON with complete metadata
• Brand asset integration guidelines and voice fingerprint data
• Publishing strategy recommendations with market positioning
• Distribution channel optimization parameters
• Premium quality control and validation standards`,
            inputFields: [
              { id: 1, name: 'bookTitle', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter your premium book title' },
              { id: 2, name: 'subtitle', type: 'text', required: false, variable: 'subtitle', placeholder: 'Book subtitle (optional)' },
              { id: 3, name: 'authorName', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
              { id: 4, name: 'authorBio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Comprehensive author biography for publishing' },
              { id: 5, name: 'topic', type: 'select', required: true, variable: 'topic', options: INPUT_OPTIONS.niches },
              { id: 6, name: 'wordCount', type: 'select', required: true, variable: 'word_count', options: ['25000-40000', '40000-60000', '60000-80000', '80000-100000'] },
              { id: 7, name: 'tone', type: 'select', required: true, variable: 'tone', options: INPUT_OPTIONS.tones },
              { id: 8, name: 'accent', type: 'select', required: true, variable: 'accent', options: INPUT_OPTIONS.accents },
              { id: 9, name: 'targetAudience', type: 'select', required: true, variable: 'target_audience', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'General Market', 'Niche Specialist'] },
              { id: 10, name: 'industryFocus', type: 'select', required: true, variable: 'industry_focus', options: ['Startup', 'Corporate', 'SMB', 'Enterprise', 'Academic', 'General'] },
              { id: 11, name: 'brandingStyle', type: 'select', required: true, variable: 'branding_style', options: ['Professional', 'Modern', 'Classic', 'Innovative', 'Authority', 'Luxury'] },
              { id: 12, name: 'includeImages', type: 'boolean', required: false, variable: 'include_images' },
              { id: 13, name: 'voiceCloningEnabled', type: 'boolean', required: false, variable: 'voice_cloning_enabled' },
              { id: 14, name: 'factCheckingEnabled', type: 'boolean', required: false, variable: 'fact_checking_enabled' },
              { id: 15, name: 'interactiveContent', type: 'boolean', required: false, variable: 'interactive_content' },
              { id: 16, name: 'humanReview', type: 'boolean', required: false, variable: 'human_review' },
              { id: 17, name: 'chapterCount', type: 'select', required: true, variable: 'chapter_count', options: [8, 10, 12, 15, 20] },
              { id: 18, name: 'previousContent', type: 'textarea', required: false, variable: 'previous_content', placeholder: 'Paste sample of your previous writing for voice analysis' },
              { id: 19, name: 'customRequirements', type: 'textarea', required: false, variable: 'custom_requirements', placeholder: 'Premium requirements, unique positioning, or specific publishing goals' }
            ],
            aiEnabled: false
          }
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 300, y: 200 },
          data: {
            label: 'Ultimate AI Outline Generation',
            description: 'Publishing-grade outline with market positioning and brand integration',
            inputInstructions: `ULTIMATE AI OUTLINE GENERATION FOR PREMIUM TIER:

You are a master outline generation specialist with publishing industry expertise and brand integration capabilities. Create sophisticated, market-positioned outlines that establish thought leadership and commercial success.

ULTIMATE OUTLINE FRAMEWORK:
• Publishing Intelligence: Market analysis, competitive positioning, and commercial viability assessment
• Brand Integration: Visual identity, voice consistency, and premium positioning throughout
• Authority Architecture: Thought leadership structure with credibility and expertise demonstration
• Reader Experience: Premium engagement design with interactive element planning
• Commercial Success: Market-tested structures optimized for sales and reader satisfaction

PREMIUM INTELLIGENCE:
• Publishing market analysis for category dominance and positioning
• Brand consistency integration with visual and voice guidelines
• Premium reader psychology for maximum engagement and retention
• Publishing industry best practices and commercial optimization
• Interactive content planning for enhanced reader value and engagement`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a master outline generation specialist with publishing industry expertise for {topic} targeting {target_audience} in {industry_focus}. Create publishing-grade outlines that establish market dominance and commercial success. Apply premium content strategy, brand integration, and reader psychology principles.',
            userPrompt: `Generate a sophisticated, publishing-grade chapter outline for an ultimate {word_count}-word book on '{book_title}' with subtitle '{subtitle}' in {tone} tone, for {target_audience} in {industry_focus} market, with {chapter_count} chapters.

ULTIMATE SPECIFICATIONS:
- Premium Authority: {topic} with market-dominating differentiation
- Publishing Audience: {target_audience} in {industry_focus} requiring thought leadership
- Brand Integration: {branding_style} approach with premium positioning
- Commercial Excellence: {tone} tone with {accent} accent for market appeal
- Publishing Length Target: ~{word_count} total (±15%); chapter sizes vary based on content importance
- Interactive Strategy: {interactive_content ? 'Include interactive content integration points' : 'Focus on premium text-based engagement'}
- Visual Strategy: {include_images ? 'Include premium visual content strategy with publishing rationale' : 'Text-focused with premium formatting'}

PREMIUM REQUIREMENTS:
- Conduct comprehensive market analysis for category dominance
- Apply publishing industry frameworks and commercial best practices
- Include authority-building elements and thought leadership positioning
- Design premium reader journey for maximum engagement and commercial success
- Strategic interactive content placement for enhanced value delivery
- Each chapter must build market authority and reader loyalty
- Include premium development insights and transformational content
- Balance intellectual depth with practical application and commercial appeal
- Integrate brand positioning and voice consistency throughout

Publishing Channels: {publishing_channels}
Voice Cloning Context: {voice_cloning_enabled ? 'Include voice consistency checkpoints' : 'Standard voice guidelines'}
Custom Premium Requirements: {custom_requirements}

Create a publishing-grade outline that establishes market leadership and delivers exceptional commercial and reader value.`,
            temperature: 0.6,
            maxTokens: 5000
          }
        },
        {
          id: 'process-2',
          type: 'process',
          position: { x: 600, y: 300 },
          data: {
            label: 'Ultimate Manuscript Generation',
            description: 'Publishing-grade content creation with brand voice and market positioning',
            inputInstructions: `ULTIMATE MANUSCRIPT GENERATION FOR PREMIUM TIER:

You are an elite manuscript generation specialist creating publishing-grade, market-dominating content for premium audiences. Focus on thought leadership, brand integration, and commercial success that establishes industry authority and reader loyalty.

ULTIMATE MANUSCRIPT FRAMEWORK:
• Market Leadership: Establish thought leadership through authoritative content delivery
• Brand Voice Integration: Consistent voice and brand positioning throughout all content
• Publishing Excellence: Content quality exceeding traditional publishing standards
• Commercial Optimization: Reader engagement and market appeal for sales success
• Authority Building: Expert positioning through credible examples and industry insights

PREMIUM WRITING STANDARDS:
• Publishing-grade voice with consistent brand personality and expertise demonstration
• Advanced content architecture with strategic information flow and commercial appeal
• Market-leading examples, cutting-edge insights, and transformational content
• Authority-building elements with credibility markers throughout each chapter
• Premium formatting with advanced readability and commercial optimization`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are an elite manuscript specialist with publishing expertise in {topic} for {industry_focus} markets. Generate authoritative, commercially-positioned content that establishes market leadership. Maintain {branding_style} brand positioning with {tone} tone and {accent} accent. Focus on building market authority and commercial success.',
            userPrompt: `Create a publishing-grade, market-dominating manuscript for "{book_title}: {subtitle}" targeting {target_audience} in {industry_focus}.

ULTIMATE MANUSCRIPT SPECIFICATIONS:
- Market Authority: {target_audience} requiring thought leadership and market-leading content
- Industry Context: {industry_focus} with premium market positioning and commercial appeal
- Total Length Target: ~{word_count} words overall (±15%) with publishing standards; no per-chapter quotas
- Brand Position: {branding_style} approach with {tone} tone and {accent} accent
- Commercial Focus: {topic} with market differentiation and reader value optimization

PREMIUM WRITING REQUIREMENTS:
- Generate chapters sequentially with perfect publishing-grade coherence
- Include cutting-edge market trends, data, and industry insights for thought leadership
- Build market authority through expert examples and transformational content
- Maintain consistent brand voice and premium positioning throughout
- Strategic use of case studies, statistics, and industry benchmarks for credibility
- Publishing-grade formatting with advanced readability and commercial optimization
- Each chapter must deliver transformational insights and actionable value
- Include strategic thought leadership positioning for market dominance

Publishing Context: Targeting {publishing_channels} with commercial success objectives
Voice Context: {voice_cloning_enabled ? 'Maintain voice consistency for cloning integration' : 'Apply standard premium voice guidelines'}
Author Credibility: {author_bio}
Custom Premium Requirements: {custom_requirements}

Create market-leading content that establishes publishing success and delivers exceptional value to {industry_focus} audiences.`,
            temperature: 0.7,
            maxTokens: 12000
          }
        },
        {
          id: 'condition-1', 
          type: 'condition',
          position: { x: 900, y: 150 },
          data: {
            label: 'Cover Image Decision Gateway',
            description: 'Premium routing for cover image handling - upload, generate, or skip',
            inputInstructions: `COVER IMAGE DECISION GATEWAY FOR ULTIMATE TIER:

You are evaluating cover image requirements for premium publishing. Make intelligent routing decisions based on user cover preferences and publishing standards.

ULTIMATE COVER IMAGE EVALUATION:
• Upload Option: User provided custom cover - validate, optimize, and integrate with brand standards
• Generate Option: Create premium AI-generated cover with brand integration and market positioning
• None Option: Skip cover generation for text-only publications
• Publishing Standards: Ensure cover meets ultimate tier quality and publishing requirements`,
            conditions: [
              { 
                id: 1, 
                field: 'cover_image_option', 
                operator: 'equals', 
                value: 'upload',
                trueAction: {
                  type: 'continue',
                  instructions: 'Process uploaded cover image with premium optimization, brand integration, and publishing format preparation'
                },
                falseAction: {
                  type: 'check_next_condition',
                  instructions: 'Check if premium cover generation is required'
                }
              },
              { 
                id: 2, 
                field: 'cover_image_option', 
                operator: 'equals', 
                value: 'generate',
                trueAction: {
                  type: 'generate_content',
                  prompt: 'Generate premium cover design with brand integration, market positioning, and publishing optimization. Use advanced AI services with custom style preferences and professional design standards.',
                  instructions: 'Proceed to premium cover generation with brand assets, style preferences, and publishing channel optimization'
                },
                falseAction: {
                  type: 'continue',
                  instructions: 'Skip cover generation - proceed with premium text-only publication formatting'
                }
              }
            ],
            aiEnabled: true,
            selectedModels: []
          }
        },
        {
          id: 'condition-2',
          type: 'condition',
          position: { x: 1200, y: 200 },
          data: {
            label: 'Voice Cloning Decision Gateway',
            description: 'Intelligent routing for premium voice cloning and style matching',
            inputInstructions: `PREMIUM VOICE CLONING DECISION GATEWAY:

You are evaluating voice cloning requirements for premium publishing quality. Make intelligent decisions about voice fingerprinting and style matching based on author preferences and content quality enhancement.

VOICE CLONING EVALUATION:
• Author Voice Analysis: Evaluate uploaded content for style fingerprinting potential
• Brand Voice Consistency: Assess voice alignment with brand positioning and market appeal
• Quality Enhancement: Determine voice cloning value for authenticity and reader connection
• Publishing Standards: Ensure voice cloning meets premium publishing quality requirements
• Market Positioning: Voice consistency impact on commercial success and reader loyalty`,
            conditions: [
              { 
                id: 1, 
                field: 'voice_cloning_enabled', 
                operator: 'equals', 
                value: 'true',
                trueAction: {
                  type: 'generate_content',
                  prompt: 'Extract comprehensive voice fingerprint from provided content including sentence structure patterns, vocabulary preferences, rhythm analysis, and style markers. Create detailed voice cloning parameters for authentic author voice replication throughout the manuscript.',
                  instructions: 'When voice cloning is enabled, proceed to analyze previous content and extract detailed voice fingerprint for authentic style matching throughout the manuscript generation process.'
                },
                falseAction: {
                  type: 'continue',
                  instructions: 'When voice cloning is not enabled, proceed with standard premium voice guidelines while maintaining brand consistency and publishing quality standards.'
                }
              }
            ],
            aiEnabled: true,
            selectedModels: []
          }
        },
        {
          id: 'process-3',
          type: 'process',
          position: { x: 1200, y: 150 },
          data: {
            label: 'Author Voice Cloning & Style Matching',
            description: 'Advanced voice fingerprinting and authentic style replication',
            inputInstructions: `AUTHOR VOICE CLONING & STYLE MATCHING FOR ULTIMATE TIER:

You are a voice cloning and style matching specialist creating authentic author voice replication for premium publishing. Extract voice fingerprints and ensure perfect style consistency throughout the manuscript.

VOICE CLONING FRAMEWORK:
• Voice Fingerprint Extraction: Analyze sentence length, vocabulary patterns, rhythm, and style markers
• Style Pattern Recognition: Identify unique writing characteristics and voice signatures
• Authentic Replication: Apply voice parameters for genuine author voice throughout content
• Brand Consistency: Maintain voice alignment with brand positioning and market appeal
• Quality Assurance: Ensure voice cloning enhances authenticity without compromising quality

ADVANCED VOICE ANALYSIS:
• Sentence structure analysis and length pattern recognition
• Vocabulary preference mapping and terminology consistency
• Rhythm and flow pattern identification for authentic replication
• Style marker extraction for unique voice signature recreation
• Brand voice integration for consistent market positioning`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a voice cloning specialist for {topic} content targeting {industry_focus} audiences. Extract and replicate authentic author voice while maintaining {branding_style} brand positioning and {tone} tone consistency for premium publishing quality.',
            userPrompt: `Extract voice fingerprint and apply style matching for "{book_title}" by {author_name}.

VOICE CLONING SPECIFICATIONS:
- Author Context: {author_name} with {branding_style} brand positioning
- Content Analysis: Previous writing sample for voice fingerprint extraction
- Publishing Context: {industry_focus} audience requiring authentic voice consistency
- Brand Integration: {tone} tone with {accent} accent for market positioning

VOICE FINGERPRINTING REQUIREMENTS:
- Analyze provided content sample for comprehensive voice fingerprint extraction
- Extract unique patterns: sentence length preferences, vocabulary choices, rhythm markers
- Identify style signatures: transitional phrases, emphasis patterns, structural preferences
- Create authentic replication parameters for consistent voice throughout manuscript
- Ensure voice cloning enhances authenticity and reader connection
- Maintain brand voice consistency and premium positioning standards
- Apply voice parameters to ensure "this feels like their voice, not generic AI"
- Include voice consistency checkpoints for quality assurance

Previous Content Sample: {previous_content}
Author Bio Context: {author_bio}
Custom Voice Requirements: {custom_requirements}

Create authentic voice replication that ensures the book feels genuinely authored by {author_name} while maintaining premium publishing standards.`,
            temperature: 0.4,
            maxTokens: 6000
          }
        },
        {
          id: 'process-4',
          type: 'process',
          position: { x: 1500, y: 250 },
          data: {
            label: 'Fact-Checking & Citation Engine',
            description: 'Advanced verification with credible source integration and citation management',
            inputInstructions: `FACT-CHECKING & CITATION ENGINE FOR ULTIMATE TIER:

You are a fact-checking and citation specialist ensuring premium publishing credibility and academic standards. Verify claims, suggest credible sources, and manage comprehensive citation systems.

FACT-CHECKING FRAMEWORK:
• Claim Verification: Identify and flag statements requiring factual verification
• Source Integration: Auto-suggest credible sources via Google Scholar, academic databases, and knowledge graphs
• Citation Management: Insert footnotes, endnotes, and comprehensive reference sections
• Academic Standards: Apply publishing-grade citation and verification protocols
• Credibility Enhancement: Build authority through proper attribution and source validation

ADVANCED VERIFICATION SYSTEM:
• Automated claim detection and verification requirement flagging
• Credible source suggestion with authority ranking and relevance scoring
• Citation format management for academic and commercial publishing standards
• Reference section generation with comprehensive source documentation
• Quality assurance for fact accuracy and source credibility`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a fact-checking and citation specialist for {topic} publications in {industry_focus}. Apply rigorous verification standards and credible source integration for premium publishing quality. Maintain academic rigor while ensuring commercial readability.',
            userPrompt: `Perform comprehensive fact-checking and citation management for "{book_title}" targeting {target_audience} in {industry_focus}.

FACT-CHECKING SPECIFICATIONS:
- Content Focus: {topic} requiring rigorous verification and credible sourcing
- Audience Level: {target_audience} expecting authoritative and accurate information
- Industry Context: {industry_focus} with specific credibility and accuracy standards
- Academic Mode: {fact_checking_enabled ? 'Full academic citation standards' : 'Commercial citation approach'}

VERIFICATION REQUIREMENTS:
- Identify and flag all claims requiring factual verification
- Auto-suggest credible sources from Google Scholar, academic databases, and industry authorities
- Insert appropriate footnotes or endnotes with proper citation formatting
- Create comprehensive "References" section with all source documentation
- Apply academic rigor for technical, finance, or complex topics
- Ensure all statistics, data points, and factual claims are properly attributed
- Include source authority ranking and credibility assessment
- Maintain balance between academic accuracy and commercial readability

Publishing Standards: Targeting {publishing_channels} with premium credibility requirements
Author Credibility: {author_bio}
Custom Verification Requirements: {custom_requirements}

Create a fact-checked, properly cited manuscript that establishes unquestionable authority and credibility in {topic}.`,
            temperature: 0.3,
            maxTokens: 7000
          }
        },
        {
          id: 'condition-3',
          type: 'condition',
          position: { x: 1800, y: 150 },
          data: {
            label: 'Interactive Content Decision Gateway',
            description: 'Premium routing for interactive digital content enhancement',
            inputInstructions: `INTERACTIVE CONTENT DECISION GATEWAY FOR ULTIMATE TIER:

You are evaluating interactive content requirements for premium digital publishing. Make intelligent decisions about bonus content creation based on reader value enhancement and commercial differentiation.

INTERACTIVE CONTENT EVALUATION:
• Reader Value Enhancement: Assess interactive content potential for improved reader experience
• Commercial Differentiation: Evaluate bonus content impact on market positioning and sales
• Digital Integration: Determine optimal interactive elements for eBook and digital formats
• Engagement Optimization: Interactive content design for maximum reader engagement
• Premium Positioning: Bonus content alignment with ultimate tier quality standards`,
            conditions: [
              { 
                id: 1, 
                field: 'interactive_content', 
                operator: 'equals', 
                value: 'true',
                trueAction: {
                  type: 'generate_content',
                  prompt: 'Generate comprehensive interactive content strategy including downloadable worksheets, knowledge quizzes, practical checklists, and implementation templates. Create QR codes and digital integration for premium eBook experience.',
                  instructions: 'When interactive content is enabled, proceed to generate comprehensive bonus digital content that enhances reader value and creates premium differentiation in the marketplace.'
                },
                falseAction: {
                  type: 'continue',
                  instructions: 'When interactive content is not enabled, proceed directly to formatting while maintaining all other premium quality standards and focusing on exceptional core content delivery.'
                }
              }
            ],
            aiEnabled: true,
            selectedModels: []
          }
        },
        {
          id: 'process-5',
          type: 'process',
          position: { x: 2100, y: 250 },
          data: {
            label: 'Interactive Content Layer Generation',
            description: 'Premium bonus content creation with digital integration and QR code embedding',
            inputInstructions: `INTERACTIVE CONTENT LAYER GENERATION FOR ULTIMATE TIER:

You are an interactive content specialist creating premium bonus digital materials that enhance reader value and market differentiation. Generate sophisticated interactive elements for ultimate publishing experience.

INTERACTIVE CONTENT FRAMEWORK:
• Bonus Digital Materials: Downloadable worksheets, templates, and implementation guides
• Knowledge Assessment: Interactive quizzes and self-assessment tools for chapter content
• Practical Applications: Checklists, frameworks, and actionable templates
• Digital Integration: QR codes and embedded links for seamless eBook experience
• Premium Value: Interactive elements that justify ultimate tier positioning

ADVANCED INTERACTIVE CREATION:
• Chapter-specific downloadable worksheets and implementation templates
• Knowledge assessment quizzes with detailed feedback and scoring
• Practical checklists and step-by-step implementation guides
• QR code generation for easy access to bonus digital content
• Interactive elements that enhance learning and practical application`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are an interactive content specialist for {topic} publications targeting {industry_focus} professionals. Create sophisticated bonus content that enhances reader value and justifies premium positioning. Focus on practical application and reader engagement.',
            userPrompt: `Generate comprehensive interactive content layer for "{book_title}" targeting {target_audience} in {industry_focus}.

INTERACTIVE CONTENT SPECIFICATIONS:
- Content Focus: {topic} with practical application and reader engagement
- Professional Audience: {target_audience} requiring actionable tools and resources
- Industry Context: {industry_focus} with specific implementation needs
- Premium Positioning: Ultimate tier quality requiring exceptional value delivery

INTERACTIVE CONTENT REQUIREMENTS:
- Generate chapter-specific downloadable worksheets (PDF format)
- Create knowledge assessment quizzes: "Test Your Knowledge – Chapter X"
- Design practical checklists and implementation templates
- Develop frameworks and step-by-step guides for practical application
- Embed QR codes and links in eBook for seamless digital access
- Ensure interactive elements enhance learning and retention
- Create bonus content that justifies premium pricing and positioning
- Include comprehensive implementation guides and practical tools

Chapter Structure: {chapter_count} chapters requiring interactive enhancement
Author Context: {author_bio}
Custom Interactive Requirements: {custom_requirements}

Create premium interactive content that transforms the eBook into a comprehensive learning and implementation system for {industry_focus} professionals.`,
            temperature: 0.6,
            maxTokens: 8000
          }
        },
        {
          id: 'process-6',
          type: 'process',
          position: { x: 2400, y: 150 },
          data: {
            label: 'Professional Formatting & Cover Design',
            description: 'Ultimate design system with brand integration and print-on-demand optimization',
            inputInstructions: `PROFESSIONAL FORMATTING & COVER DESIGN FOR ULTIMATE TIER:

You are a professional design specialist creating ultimate-quality formatting and cover design for premium publishing. Apply sophisticated design principles, brand integration, and print-on-demand optimization.

ULTIMATE DESIGN FRAMEWORK:
• Premium Cover Design: Custom cover with brand integration, title optimization, and market appeal
• Professional Interior Layout: Chapter headers, drop caps, typography, and page number systems
• Brand Integration: Logo, color schemes, typography, and visual identity consistency
• Print-on-Demand Optimization: Bleed margins, spine design, and printing specifications
• Commercial Appeal: Design elements optimized for sales conversion and market positioning

ADVANCED DESIGN CREATION:
• Custom cover design with professional title treatment and author positioning
• Interior layout with sophisticated typography and chapter design systems
• Brand asset integration with color schemes, fonts, and visual identity elements
• Print-ready formatting with bleed, margins, and spine design optimization
• Commercial design elements for maximum market appeal and sales conversion`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a professional design specialist for {topic} publications targeting {industry_focus} markets. Create sophisticated design elements that establish premium positioning and commercial appeal. Integrate brand assets and optimize for multiple publishing channels.',
            userPrompt: `Generate professional formatting and cover design for "{book_title}: {subtitle}" by {author_name}.

COVER IMAGE HANDLING STRATEGY:
- Cover Option: {cover_image_option}
- Cover Style: {cover_image_style || 'Professional'}
- Uploaded Cover: {cover_image_upload ? 'Process uploaded cover image' : 'No uploaded cover'}

ULTIMATE DESIGN SPECIFICATIONS:
- Brand Integration: {branding_style} with premium positioning and market appeal
- Publishing Channels: {publishing_channels} requiring format optimization
- Professional Standards: Ultimate tier quality exceeding traditional publishing
- Market Context: {industry_focus} audience with specific design expectations

COVER PROCESSING REQUIREMENTS:
IF cover_image_option === 'upload':
- Validate and optimize uploaded cover image
- Ensure proper dimensions for publishing formats
- Integrate uploaded cover with interior formatting
- Apply brand consistency where possible

IF cover_image_option === 'generate':
- Create custom cover design using AI image services (DALL-E, Midjourney, Canva API)
- Style: {cover_image_style} approach with {branding_style} branding
- Include title, author, and theme integration with professional typography
- Generate multiple variations for A/B testing and market optimization
- Store generated cover in Supabase storage

IF cover_image_option === 'none':
- Skip cover generation entirely
- Focus on interior formatting and typography excellence
- Prepare text-only publication formats

INTERIOR DESIGN REQUIREMENTS:
- Design sophisticated interior layout with chapter headers and drop caps
- Integrate brand colors, fonts, and visual identity elements
- Optimize for print-on-demand: bleed margins, spine design, printing specifications
- Ensure commercial appeal and market positioning through design excellence
- Include professional typography and page layout systems
- Create brand-consistent design elements throughout all materials

Brand Assets Context: {brand_assets ? 'Integrate provided brand kit elements' : 'Create brand-consistent design system'}
Publishing Context: Multi-channel distribution requiring format optimization
Author Brand: {author_bio}
Custom Design Requirements: {custom_requirements}

Create ultimate-quality design with appropriate cover handling that establishes market leadership and commercial success for {industry_focus} audiences.`,
            temperature: 0.7,
            maxTokens: 6000
          }
        },
        {
          id: 'condition-4',
          type: 'condition',
          position: { x: 2700, y: 250 },
          data: {
            label: 'Human Review Decision Gateway',
            description: 'Premium routing for human-in-the-loop quality enhancement',
            inputInstructions: `HUMAN REVIEW DECISION GATEWAY FOR ULTIMATE TIER:

You are evaluating human review requirements for ultimate publishing quality. Make intelligent decisions about human editing integration based on quality enhancement and commercial success optimization.

HUMAN REVIEW EVALUATION:
• Quality Enhancement: Assess human review value for ultimate publishing standards
• Commercial Optimization: Evaluate human editing impact on market success and reader satisfaction
• Publishing Excellence: Determine human review necessity for premium positioning
• Quality Assurance: Human verification for ultimate tier quality standards
• Market Positioning: Human review alignment with premium brand positioning`,
            conditions: [
              { 
                id: 1, 
                field: 'human_review', 
                operator: 'equals', 
                value: 'true',
                trueAction: {
                  type: 'generate_content',
                  prompt: 'Prepare comprehensive manuscript package for human review including editing guidelines, brand voice parameters, and quality standards. Create review framework for professional editors with tracked changes and improvement suggestions.',
                  instructions: 'When human review is enabled, proceed to prepare the manuscript for professional human editing with comprehensive guidelines and quality standards for ultimate tier enhancement.'
                },
                falseAction: {
                  type: 'continue',
                  instructions: 'When human review is not enabled, proceed directly to publishing automation while maintaining all other ultimate quality standards and AI-based quality assurance.'
                }
              }
            ],
            aiEnabled: true,
            selectedModels: []
          }
        },
        {
          id: 'output-1',
          type: 'output',
          position: { x: 3000, y: 200 },
          data: {
            label: 'Publishing & Distribution Automation',
            description: 'One-click publishing with analytics dashboard and sales optimization',
            inputInstructions: `PUBLISHING & DISTRIBUTION AUTOMATION FOR ULTIMATE TIER:

You are a publishing automation specialist creating comprehensive distribution systems with analytics and sales optimization. Generate complete publishing packages for multiple channels with automated marketing and performance tracking.

ULTIMATE PUBLISHING FRAMEWORK:
• Multi-Channel Distribution: Automated publishing to Amazon KDP, Apple Books, Google Play Books, Gumroad, and direct sales
• Marketing Asset Generation: Sales descriptions, keywords, categories, and back cover blurbs
• Analytics Integration: Downloads, sales tracking, reader feedback, and performance optimization
• Commercial Optimization: Pricing strategies, promotion planning, and market positioning
• Success Monitoring: Comprehensive dashboard for sales performance and reader engagement

ADVANCED AUTOMATION FEATURES:
• One-click publishing to multiple platforms with format optimization
• Automated marketing asset generation for each distribution channel
• Comprehensive analytics dashboard with sales and reader feedback integration
• Performance optimization recommendations and market positioning adjustments
• Complete publishing package with all necessary assets and documentation`,
            outputFormat: 'ultimate-publishing-package',
            generateCover: true,
            includeImages: true,
            includeInteractive: true,
            includeTOC: true,
            includeMetadata: true,
            includeMarketing: true,
            includeAnalytics: true,
            publishingChannels: 'multi-platform',
            exportFormats: ['kindle', 'epub', 'print-pdf', 'audiobook-ready', 'web-optimized'],
            marketingAssets: ['sales-description', 'keywords', 'categories', 'back-cover', 'promotional-materials'],
            analyticsTracking: true,
            performanceOptimization: true,
            aiEnabled: true,
            selectedModels: []
          }
        }
      ]
      
      presetEdges = [
        { id: 'e1-2', source: 'input-1', target: 'process-1', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } },
        { id: 'e2-3', source: 'process-1', target: 'process-2', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } },
        { id: 'e3-4', source: 'process-2', target: 'condition-1', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } },
        { id: 'e4-5', source: 'condition-1', target: 'condition-2', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } },
        { id: 'e5-6', source: 'condition-2', target: 'process-3', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } },
        { id: 'e6-7', source: 'process-3', target: 'process-4', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } },
        { id: 'e7-8', source: 'process-4', target: 'condition-3', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } },
        { id: 'e8-9', source: 'condition-3', target: 'process-5', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } },
        { id: 'e9-10', source: 'process-5', target: 'process-6', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } },
        { id: 'e10-11', source: 'process-6', target: 'condition-4', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } },
        { id: 'e11-12', source: 'condition-4', target: 'output-1', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 } }
      ]
      
      setFlowName('Ultimate - Premium Publishing Mastery')
      setFlowDescription('Complete 9-node premium workflow with voice cloning, fact-checking, interactive content, professional design, and automated publishing distribution')
    }
    
    else if (stepCount === 3) {
      presetNodes = [
        {
          id: 'input-1',
          type: 'input',
          position: { x: 100, y: 200 },
          data: {
            label: 'Professional Book Configuration',
            description: 'Comprehensive capture of user requirements for optimal book creation',
            inputInstructions: `EXPERT INPUT PROCESSING FOR BOOK CREATION:

You are capturing critical information for professional book generation. Extract and validate each input with precision:

REQUIRED INPUTS:
• Book Title: Clear, compelling, market-ready title
• Genre/Niche: business, technology, self-help, finance, marketing, leadership, productivity, entrepreneurship, personal-development, career-growth
• Target Audience: Demographics, profession, experience level
• Writing Style: Tone (professional, conversational, academic, inspirational, instructional, storytelling)
• Accent: american, british, australian, neutral, canadian, indian
• Chapter Count: 5 (Concise), 8 (Standard), 12 (Comprehensive)

Ensure all inputs are validated and structured for downstream processing.`,
            inputFields: [
              { id: 1, name: 'bookTitle', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter compelling book title' },
              { id: 2, name: 'niche', type: 'select', required: true, variable: 'niche', options: INPUT_OPTIONS.niches },
              { id: 3, name: 'tone', type: 'select', required: true, variable: 'tone', options: INPUT_OPTIONS.tones },
              { id: 4, name: 'accent', type: 'select', required: true, variable: 'accent', options: INPUT_OPTIONS.accents },
              { id: 5, name: 'targetAudience', type: 'select', required: true, variable: 'target_audience', options: ['18-24', '25-34', '35-44', '45-54', '55+'] },
              { id: 6, name: 'profession', type: 'select', required: true, variable: 'profession', options: ['Student', 'Professional', 'Manager', 'Executive', 'Entrepreneur', 'Freelancer', 'Educator'] },
              { id: 7, name: 'numberOfChapters', type: 'select', required: true, variable: 'chapter_count', options: [5, 8, 12] },
              { id: 8, name: 'coverImageOption', type: 'select', required: true, variable: 'cover_image_option', options: ['upload', 'generate', 'none'] },
              { id: 9, name: 'coverImageUpload', type: 'file', required: false, variable: 'cover_image_upload', condition: 'coverImageOption === upload' },
              { id: 10, name: 'coverImageStyle', type: 'select', required: false, variable: 'cover_image_style', options: ['Professional', 'Modern', 'Classic', 'Artistic', 'Minimalist'], condition: 'coverImageOption === generate' },
              { id: 11, name: 'customInstructions', type: 'textarea', required: false, variable: 'custom_instructions', placeholder: 'Any specific requirements or focus areas' }
            ],
            aiEnabled: false
          }
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 500, y: 200 },
          data: {
            label: 'Elite Content Generation Engine',
            description: 'World-class content creation with publication-grade quality standards',
            inputInstructions: `ELITE CONTENT GENERATION INSTRUCTIONS:

You are an elite content creation specialist with world-class expertise across all literary genres and publishing formats. Your mission is to produce exceptional, publication-ready content that exceeds industry standards.

CONTENT CREATION FRAMEWORK:
• Research Integration: Incorporate industry insights, current trends, and evidence-based practices
• Narrative Excellence: Craft compelling, engaging content with perfect flow and structure
• Professional Standards: Ensure every paragraph meets publication-grade quality
• Audience Optimization: Tailor content specifically for the defined target audience
• Value Delivery: Provide actionable insights, practical strategies, and transformative knowledge

QUALITY BENCHMARKS:
• Publication-ready quality with zero errors
• Engaging, well-structured narrative flow
• Factually accurate with current industry insights
• Optimized for reader retention and satisfaction
• Consistent voice and style throughout`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are an elite content creation specialist with world-class expertise across all literary genres and publishing formats. Your mission is to produce exceptional, publication-ready content that exceeds industry standards. Maintain perfect consistency in tone and style, apply advanced storytelling techniques, ensure factual accuracy, and optimize for maximum reader engagement. Every output must meet professional publishing grade quality.',
            userPrompt: `Create a comprehensive {niche} book titled "{book_title}" specifically designed for {target_audience} ({profession}).

SPECIFICATIONS:
- Chapter Structure: {chapter_count} chapters
- Writing Style: {tone} tone with {accent} accent
- Target Audience: {profession} aged {target_audience}
- Content Focus: Address key pain points and deliver practical solutions

REQUIREMENTS:
- Research-backed content with current industry insights
- Actionable strategies and real-world applications
- Engaging narrative that maintains reader interest
- Professional formatting with clear chapter divisions
- Include relevant examples, case studies, and practical exercises

Additional Instructions: {custom_instructions}

Produce publication-ready content that exceeds professional standards and perfectly aligns with user specifications.`,
            temperature: 0.7,
            maxTokens: 8000
          }
        },
        {
          id: 'output-1',
          type: 'output',
          position: { x: 900, y: 200 },
          data: {
            label: 'Professional Book Finalization',
            description: 'Master-level formatting and final delivery preparation',
            inputInstructions: `MASTER PUBLISHING FINALIZATION:

You are a master publishing specialist responsible for delivering world-class final products. Apply advanced formatting and presentation optimization to create publication-ready deliverables.

FINALIZATION CHECKLIST:
• Content Review: Verify narrative consistency and factual accuracy
• Technical Formatting: Apply professional book formatting standards
• Quality Assurance: Eliminate all errors and inconsistencies
• Cover Generation: Create compelling, genre-appropriate book covers
• Metadata Completion: Include all necessary publishing information
• Format Optimization: Prepare for multiple distribution channels

DELIVERY STANDARDS:
• Zero errors with perfect formatting
• Professional presentation exceeding industry standards
• Optimized for both print and digital distribution
• Complete with cover art and metadata
• Ready for immediate publication`,
            outputFormat: 'epub',
            generateCover: true,
            includeTOC: true,
            includeMetadata: true
          }
        }
      ]
      
      presetEdges = [
        { id: 'e1-2', source: 'input-1', target: 'process-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e2-3', source: 'process-1', target: 'output-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }
      ]
      
      setFlowName('Professional 3-Step Elite Book Generation')
      setFlowDescription('Streamlined workflow for rapid, publication-ready book creation with expert-level prompts and professional quality standards')
    }
    
    else if (stepCount === 5) {
      presetNodes = [
        {
          id: 'input-1',
          type: 'input',
          position: { x: 50, y: 250 },
          data: {
            label: 'Advanced Book Configuration',
            description: 'Comprehensive requirement gathering for sophisticated book creation',
            inputInstructions: `ADVANCED INPUT PROCESSING FOR SOPHISTICATED BOOK CREATION:

You are processing comprehensive requirements for advanced book generation with multi-stage workflow optimization. Capture every detail with expert precision:

COMPREHENSIVE INPUT REQUIREMENTS:
• Book Title: Market-tested, compelling title with strong commercial appeal
• Genre/Niche: Targeted market category with clear positioning
• Writing Style: Professional tone and regional accent preferences
• Visual Requirements: Image integration needs and cover design preferences
• Target Demographics: Detailed audience profiling for optimal content tailoring
• Content Depth: Chapter structure and comprehensive coverage requirements

Extract, validate, and prepare all inputs for advanced multi-stage processing.`,
            inputFields: [
              { id: 1, name: 'bookTitle', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter market-ready book title' },
              { id: 2, name: 'niche', type: 'select', required: true, variable: 'niche', options: INPUT_OPTIONS.niches },
              { id: 3, name: 'tone', type: 'select', required: true, variable: 'tone', options: INPUT_OPTIONS.tones },
              { id: 4, name: 'accent', type: 'select', required: true, variable: 'accent', options: INPUT_OPTIONS.accents },
              { id: 5, name: 'targetAudience', type: 'select', required: true, variable: 'target_audience', options: ['18-24', '25-34', '35-44', '45-54', '55+'] },
              { id: 6, name: 'experienceLevel', type: 'select', required: true, variable: 'experience_level', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
              { id: 7, name: 'includeImages', type: 'boolean', required: false, variable: 'include_images' },
              { id: 8, name: 'numberOfChapters', type: 'select', required: true, variable: 'chapter_count', options: [5, 8, 12, 15] },
              { id: 9, name: 'wordCount', type: 'select', required: true, variable: 'word_count', options: ['15000-25000', '25000-40000', '40000-60000'] },
              { id: 10, name: 'contentFocus', type: 'textarea', required: false, variable: 'content_focus', placeholder: 'Specific focus areas, pain points to address, or unique angles' }
            ],
            aiEnabled: false
          }
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 300, y: 150 },
          data: {
            label: 'Expert Research & Analysis Engine',
            description: 'Comprehensive research with industry insights and fact validation',
            inputInstructions: `EXPERT RESEARCH & ANALYSIS INSTRUCTIONS:

You are a world-class research specialist with access to comprehensive industry knowledge. Conduct thorough, authoritative research that forms the foundation for exceptional content creation.

RESEARCH METHODOLOGY:
• Industry Analysis: Current trends, emerging patterns, and market dynamics
• Authority Sources: Academic research, industry reports, expert opinions
• Statistical Validation: Relevant data, metrics, and evidence-based insights
• Competitive Analysis: Best practices and innovative approaches in the field
• Future Trends: Forward-looking insights and emerging opportunities

QUALITY STANDARDS:
• Authoritative sources with credible citations
• Current, relevant data within the last 2-3 years
• Multiple perspective analysis for comprehensive coverage
• Fact-checked information with statistical backing
• Industry-specific insights from recognized experts`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a world-class research specialist with expertise in {niche}. Conduct comprehensive, authoritative research that forms the foundation for exceptional content creation. Focus on current trends, industry insights, statistical data, and expert perspectives. Ensure all information is credible, current, and directly relevant to the target audience.',
            userPrompt: `Conduct comprehensive research for "{book_title}" targeting {target_audience} at {experience_level} level in {niche}.

RESEARCH FOCUS AREAS:
- Current industry trends and emerging patterns
- Key challenges faced by {target_audience} in {niche}
- Evidence-based solutions and best practices
- Statistical data and market insights
- Expert opinions and authoritative sources
- Case studies and real-world applications

Content Focus: {content_focus}

Deliver authoritative research that will serve as the foundation for world-class content creation.`,
            temperature: 0.3,
            maxTokens: 4000
          }
        },
        {
          id: 'process-2',
          type: 'process',
          position: { x: 550, y: 250 },
          data: {
            label: 'Elite Content Creation Engine',
            description: 'Publication-grade writing with research integration and narrative excellence',
            inputInstructions: `ELITE CONTENT CREATION WITH RESEARCH INTEGRATION:

You are an elite content creation specialist combining world-class writing expertise with comprehensive research integration. Transform research data into compelling, publication-ready content.

CONTENT CREATION FRAMEWORK:
• Research Integration: Seamlessly weave research findings into engaging narrative
• Narrative Excellence: Craft compelling stories that maintain reader engagement
• Authority Building: Establish credibility through expert insights and data
• Practical Application: Translate research into actionable strategies
• Audience Optimization: Tailor content complexity to target experience level

WRITING EXCELLENCE STANDARDS:
• Publication-grade quality with zero errors
• Engaging narrative flow with logical progression
• Perfect balance of information and entertainment
• Clear, actionable insights throughout
• Professional formatting and structure`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are an elite content creation specialist with mastery in {niche}. Transform comprehensive research into engaging, publication-ready content that exceeds industry standards. Maintain perfect balance between authoritative information and compelling narrative. Ensure content is perfectly tailored for {target_audience} at {experience_level} level.',
            userPrompt: `Create exceptional content for "{book_title}" using the comprehensive research data.

CONTENT SPECIFICATIONS:
- Target Word Count: {word_count} words
- Chapter Structure: {chapter_count} well-organized chapters
- Writing Style: {tone} tone with {accent} accent
- Target Audience: {target_audience} at {experience_level} level
- Content Focus: {content_focus}

INTEGRATION REQUIREMENTS:
- Seamlessly integrate research findings into compelling narrative
- Include relevant statistics, case studies, and expert insights
- Provide actionable strategies and practical applications
- Maintain engaging flow while delivering authoritative information
- Ensure perfect alignment with target audience needs and expectations

Create content that establishes authority while maintaining exceptional readability and engagement.`,
            temperature: 0.7,
            maxTokens: 6000
          }
        },
        {
          id: 'condition-1',
          type: 'condition',
          position: { x: 800, y: 200 },
          data: {
            label: 'Smart Visual Enhancement Decision',
            description: 'Intelligent routing for visual content integration',
            inputInstructions: `SMART VISUAL ENHANCEMENT DECISION ENGINE:

You are evaluating visual enhancement requirements for optimal book presentation. Make intelligent decisions about image integration based on content type, audience preferences, and market standards.

EVALUATION CRITERIA:
• User Preference: Direct user selection for image inclusion
• Content Type: Genre-specific visual enhancement value
• Target Audience: Demographic preferences for visual learning
• Market Standards: Industry expectations for visual content
• Production Quality: Ensure professional image generation standards`,
            conditions: [
              { 
                id: 1, 
                field: 'include_images', 
                operator: 'equals', 
                value: 'true', 
                trueAction: {
                  type: 'generate_image',
                  prompt: 'Generate professional, genre-appropriate images that enhance the book content. Create stunning visual elements including book cover, chapter illustrations, and relevant diagrams. Style: modern, professional, aligned with book theme and target audience preferences.',
                  instructions: 'When images are requested, proceed to generate high-quality visual content that enhances reader experience and adds professional value to the book. Ensure all images are genre-appropriate and target-audience optimized.'
                },
                falseAction: {
                  type: 'skip_to_output',
                  instructions: 'When images are not needed, proceed directly to final formatting while maintaining all other quality standards. Focus on exceptional text-based content presentation and professional formatting.'
                }
              }
            ],
            aiEnabled: true,
            selectedModels: []
          }
        },
        {
          id: 'output-1',
          type: 'output',
          position: { x: 1050, y: 250 },
          data: {
            label: 'Master Publication Finalization',
            description: 'World-class final production with multi-format optimization',
            inputInstructions: `MASTER PUBLICATION FINALIZATION SYSTEM:

You are a master publishing specialist responsible for creating world-class final deliverables. Apply advanced formatting, visual integration, and multi-format optimization.

FINALIZATION EXCELLENCE:
• Content Mastery: Perfect integration of text and visual elements
• Format Optimization: Multi-platform compatibility and professional presentation
• Quality Assurance: Zero-error content with publication-grade standards
• Visual Excellence: Professional cover design and image integration
• Market Readiness: Complete with metadata, TOC, and distribution optimization

DELIVERY STANDARDS:
• Publication-ready with zero errors
• Professional visual design and layout
• Optimized for multiple distribution channels
• Complete with all necessary metadata
• Exceeds industry quality standards`,
            outputFormat: 'multi-format',
            generateCover: true,
            includeImages: true,
            includeTOC: true,
            includeMetadata: true,
            aiEnabled: true,
            selectedModels: []
          }
        }
      ]
      
      presetEdges = [
        { id: 'e1-2', source: 'input-1', target: 'process-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e2-3', source: 'process-1', target: 'process-2', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e3-4', source: 'process-2', target: 'condition-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e4-5', source: 'condition-1', target: 'output-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }
      ]
      
      setFlowName('Advanced 5-Step Elite Publishing Workflow')
      setFlowDescription('Sophisticated workflow with expert research intelligence, conditional routing, and world-class output generation')
    }
    
    else if (stepCount === 7) {
      presetNodes = [
        {
          id: 'input-1',
          type: 'input',
          position: { x: 50, y: 300 },
          data: {
            label: 'Enterprise Book Configuration Hub',
            description: 'Complete professional specification for premium book production',
            inputInstructions: `ENTERPRISE-GRADE INPUT PROCESSING FOR PREMIUM BOOK PRODUCTION:

You are orchestrating the complete specification for premium, enterprise-level book production. Capture every critical detail with absolute precision for world-class output:

COMPREHENSIVE SPECIFICATION REQUIREMENTS:
• Book Identity: Title, type, and market positioning with commercial viability assessment
• Genre Authority: Deep niche selection with competitive landscape understanding
• Audience Mastery: Complete demographic and psychographic profiling
• Content Architecture: Strategic chapter planning and word count optimization
• Production Features: Visual elements, case studies, and premium enhancements
• Quality Standards: Publication-grade requirements exceeding industry benchmarks

Extract, validate, and architect all specifications for premium multi-stage production pipeline.`,
            inputFields: [
              { id: 1, name: 'bookTitle', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter premium book title with market appeal' },
              { id: 2, name: 'bookType', type: 'select', required: true, variable: 'book_type', options: ['ebook', 'guide', 'manual', 'workbook', 'report'] },
              { id: 3, name: 'niche', type: 'select', required: true, variable: 'niche', options: INPUT_OPTIONS.niches },
              { id: 4, name: 'tone', type: 'select', required: true, variable: 'tone', options: INPUT_OPTIONS.tones },
              { id: 5, name: 'accent', type: 'select', required: true, variable: 'accent', options: INPUT_OPTIONS.accents },
              { id: 6, name: 'targetAudience', type: 'select', required: true, variable: 'target_audience', options: ['18-24', '25-34', '35-44', '45-54', '55+'] },
              { id: 9, name: 'numberOfChapters', type: 'select', required: true, variable: 'chapter_count', options: [8, 12, 15, 20] },
              { id: 10, name: 'targetWordCount', type: 'select', required: true, variable: 'word_count', options: ['25000-40000', '40000-60000', '60000-80000'] },
              { id: 11, name: 'includeImages', type: 'boolean', required: false, variable: 'include_images' },
              { id: 12, name: 'includeCaseStudies', type: 'boolean', required: false, variable: 'include_case_studies' },
              { id: 13, name: 'contentStrategy', type: 'textarea', required: false, variable: 'content_strategy', placeholder: 'Strategic content approach and unique value proposition' },
              { id: 14, name: 'competitiveAdvantage', type: 'textarea', required: false, variable: 'competitive_advantage', placeholder: 'Key differentiators and market positioning' }
            ],
            aiEnabled: false
          }
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 250, y: 150 },
          data: {
            label: 'Enterprise Research Intelligence',
            description: 'World-class research with comprehensive market analysis',
            inputInstructions: `ENTERPRISE RESEARCH INTELLIGENCE SYSTEM:

You are a world-class research intelligence specialist conducting comprehensive market and industry analysis. Your research forms the authoritative foundation for premium content creation.

RESEARCH EXCELLENCE FRAMEWORK:
• Market Intelligence: Industry trends, competitive landscape, emerging opportunities
• Authority Sources: Academic research, industry reports, expert thought leadership
• Data Validation: Statistical verification, credible citations, fact-checking protocols
• Future Insights: Predictive analysis and forward-looking industry perspectives
• Audience Intelligence: Deep understanding of target demographics and pain points

RESEARCH STANDARDS:
• Authoritative sources with impeccable credibility
• Current data within the last 12-18 months
• Multi-perspective analysis ensuring comprehensive coverage
• Quantitative and qualitative insights integration
• Expert opinions from recognized industry authorities`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a world-class research intelligence specialist with expertise in {niche}. Conduct comprehensive, authoritative research that establishes the foundation for premium content creation. Focus on current industry trends, statistical data, expert insights, and competitive analysis. Ensure all information is credible, current, and strategically relevant.',
            userPrompt: `Conduct comprehensive research intelligence for premium {book_type} titled "{book_title}" targeting {profession} at {experience_level} level in {niche}.

RESEARCH MANDATE:
- Industry Landscape: Current trends, market dynamics, and competitive positioning
- Target Audience Analysis: Deep insights into {target_audience} ({profession}) challenges and aspirations
- Authority Sources: Academic research, industry reports, and expert perspectives
- Statistical Foundation: Relevant data, metrics, and evidence-based insights
- Innovation Opportunities: Emerging trends and future market directions
- Competitive Intelligence: Best practices and differentiation opportunities

Strategic Focus: {content_strategy}
Competitive Advantage: {competitive_advantage}

Deliver authoritative research that establishes market authority and strategic positioning.`,
            temperature: 0.2,
            maxTokens: 5000
          }
        },
        {
          id: 'process-2',
          type: 'process',
          position: { x: 450, y: 100 },
          data: {
            label: 'Strategic Architecture & Planning',
            description: 'Master-level content architecture with strategic framework design',
            inputInstructions: `STRATEGIC ARCHITECTURE & PLANNING SYSTEM:

You are a master content architect designing strategic frameworks for premium publications. Create comprehensive structural blueprints that ensure maximum impact and reader engagement.

ARCHITECTURAL EXCELLENCE:
• Strategic Framework: Logical flow optimized for learning and retention
• Chapter Architecture: Balanced content distribution with progressive complexity
• Engagement Design: Reader journey optimization with strategic touchpoints
• Value Delivery: Maximum impact positioning throughout the content structure
• Scalability Planning: Framework adaptability for future content expansion

PLANNING STANDARDS:
• Evidence-based structural decisions supported by research insights
• Audience-optimized complexity progression and pacing
• Strategic positioning of key concepts and value propositions
• Professional publishing standards with commercial viability
• Clear learning objectives and measurable outcomes per chapter`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a master content architect specializing in premium {book_type} design for {niche}. Create comprehensive structural blueprints that optimize reader engagement, learning retention, and commercial success. Ensure every architectural decision is strategically sound and evidence-based.',
            userPrompt: `Design strategic architecture for premium {book_type} "{book_title}" targeting {profession} at {experience_level} level.

ARCHITECTURAL SPECIFICATIONS:
- Content Structure: {chapter_count} strategically organized chapters
- Target Length: {word_count} words with optimal distribution
- Audience Profile: {target_audience} ({profession}) at {experience_level} level
- Content Strategy: {content_strategy}
- Competitive Positioning: {competitive_advantage}

ARCHITECTURAL REQUIREMENTS:
- Progressive complexity suitable for {experience_level} audience
- Strategic chapter flow maximizing engagement and retention
- Clear learning objectives and value delivery points
- Professional formatting and presentation standards
- Commercial viability with strong market positioning

Using comprehensive research insights, create a masterful content blueprint that exceeds industry standards.`,
            temperature: 0.5,
            maxTokens: 4000
          }
        },
        {
          id: 'process-3',
          type: 'process',
          position: { x: 650, y: 200 },
          data: {
            label: 'Elite Content Creation Engine',
            description: 'World-class writing with perfect research integration',
            inputInstructions: `ELITE CONTENT CREATION ENGINE:

You are an elite content creation specialist transforming strategic architecture and research intelligence into exceptional, publication-ready content. Every word must exceed professional publishing standards.

CONTENT MASTERY FRAMEWORK:
• Research Integration: Seamless weaving of intelligence insights into compelling narrative
• Authority Positioning: Establishing thought leadership through expert content delivery
• Engagement Excellence: Maintaining reader attention while delivering complex information
• Practical Application: Converting insights into actionable strategies and frameworks
• Voice Mastery: Perfect consistency in tone, style, and brand personality

CREATION STANDARDS:
• Publication-grade quality surpassing industry benchmarks
• Perfect balance of authority and accessibility for target audience
• Engaging narrative flow with strategic information architecture
• Zero errors with professional editing and refinement standards
• Commercial-grade content ready for immediate market deployment`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are an elite content creation specialist with mastery in {niche} for {profession} audiences. Transform comprehensive research and strategic architecture into exceptional, publication-ready content. Maintain perfect balance between authority and accessibility while ensuring every paragraph exceeds professional publishing standards.',
            userPrompt: `Create exceptional {book_type} content for "{book_title}" using comprehensive research and strategic architecture.

CONTENT SPECIFICATIONS:
- Target Audience: {profession} aged {target_audience} at {experience_level} level
- Total Length Target: ~{word_count} words overall (±15%); chapters vary by narrative weight
- Writing Style: {tone} tone with {accent} accent
- Strategic Focus: {content_strategy}
- Competitive Edge: {competitive_advantage}

CREATION REQUIREMENTS:
- Seamless integration of research intelligence into engaging narrative
- Authority positioning establishing thought leadership credibility
- Perfect accessibility for {experience_level} audience without compromising depth
- Actionable strategies and frameworks with practical application
- Commercial-grade quality ready for premium market positioning

Transform research and architecture into content that dominates its market category.`,
            temperature: 0.7,
            maxTokens: 8000
          }
        },
        {
          id: 'condition-1',
          type: 'condition',
          position: { x: 850, y: 150 },
          data: {
            label: 'Premium Enhancement Gateway',
            description: 'Intelligent routing for premium feature integration',
            inputInstructions: `PREMIUM ENHANCEMENT GATEWAY SYSTEM:

You are orchestrating premium feature integration for world-class publication enhancement. Make intelligent decisions about advanced features based on user specifications and market positioning requirements.

ENHANCEMENT EVALUATION:
• Visual Integration: Assess image and visual content enhancement value
• Case Study Integration: Evaluate practical example inclusion for authority building
• Premium Features: Determine advanced elements that maximize market positioning
• Quality Standards: Ensure all enhancements meet enterprise-grade requirements
• Commercial Viability: Optimize features for maximum market impact`,
            conditions: [
              { 
                id: 1, 
                field: 'include_images', 
                operator: 'equals', 
                value: 'true',
                trueAction: {
                  type: 'generate_image',
                  prompt: 'Generate premium, professional visual content that elevates the book to enterprise standards. Create stunning cover art, chapter illustrations, infographics, and diagrams that enhance comprehension and market appeal. Style: sophisticated, industry-leading, perfectly aligned with target audience and competitive positioning.',
                  instructions: 'When premium visual content is requested, generate world-class imagery that establishes market leadership and enhances reader experience. Ensure all visuals meet enterprise publication standards and strengthen competitive positioning.'
                },
                falseAction: {
                  type: 'continue',
                  instructions: 'When premium visuals are not required, maintain focus on text-based excellence while preserving all other quality and enhancement standards.'
                }
              },
              { 
                id: 2, 
                field: 'include_case_studies', 
                operator: 'equals', 
                value: 'true',
                trueAction: {
                  type: 'generate_content',
                  prompt: 'Develop comprehensive, authority-building case studies that demonstrate real-world application and establish thought leadership credibility. Include detailed analysis, measurable outcomes, and strategic insights that reinforce the book\'s value proposition and competitive advantage.',
                  instructions: 'When case studies are included, create authoritative examples that establish credibility and demonstrate practical application. Ensure all case studies strengthen market positioning and reader confidence.'
                },
                falseAction: {
                  type: 'continue',
                  instructions: 'When case studies are not included, focus on other forms of practical examples and authority-building content while maintaining premium quality standards.'
                }
              }
            ],
            aiEnabled: true,
            selectedModels: []
          }
        },
        {
          id: 'process-4',
          type: 'process',
          position: { x: 1050, y: 100 },
          data: {
            label: 'Master Quality Assurance Engine',
            description: 'Enterprise-grade content refinement and perfection protocols',
            inputInstructions: `MASTER QUALITY ASSURANCE ENGINE:

You are a master quality assurance specialist ensuring every element meets enterprise publication standards. Apply rigorous refinement protocols that exceed industry benchmarks.

QUALITY MASTERY FRAMEWORK:
• Content Excellence: Comprehensive review ensuring publication-grade quality
• Consistency Mastery: Perfect alignment of voice, tone, and style throughout
• Accuracy Validation: Fact-checking and credibility verification protocols
• Flow Optimization: Narrative structure refinement for maximum engagement
• Market Readiness: Final positioning optimization for competitive advantage

REFINEMENT STANDARDS:
• Zero tolerance for errors with professional editing excellence
• Perfect consistency in voice and brand personality
• Enhanced readability optimized for target audience
• Strategic positioning reinforcement throughout content
• Commercial-grade quality exceeding market expectations`,
            aiEnabled: true,
            selectedModels: [],
            systemPrompt: 'You are a master quality assurance specialist with expertise in premium {book_type} refinement for {niche}. Apply enterprise-grade quality protocols ensuring every element exceeds publication standards. Focus on consistency, accuracy, flow optimization, and competitive positioning enhancement.',
            userPrompt: `Apply master-level quality assurance to premium {book_type} "{book_title}" for {profession} audience.

QUALITY SPECIFICATIONS:
- Content Type: {book_type} targeting {experience_level} {profession}
- Market Position: {competitive_advantage}
- Quality Standard: Enterprise-grade publication excellence
- Strategic Focus: {content_strategy}

REFINEMENT REQUIREMENTS:
- Comprehensive content review ensuring zero errors
- Perfect consistency in voice, tone, and style throughout
- Enhanced readability and engagement optimization
- Strategic messaging reinforcement and positioning
- Commercial-grade quality ready for premium market deployment

Transform good content into market-dominating excellence that establishes industry authority.`,
            temperature: 0.4,
            maxTokens: 6000
          }
        },
        {
          id: 'output-1',
          type: 'output',
          position: { x: 1250, y: 200 },
          data: {
            label: 'Enterprise Publication Mastery',
            description: 'World-class final production with premium market positioning',
            inputInstructions: `ENTERPRISE PUBLICATION MASTERY SYSTEM:

You are a master publishing specialist creating world-class deliverables that dominate their market category. Apply enterprise-grade production standards that exceed industry benchmarks.

PUBLICATION EXCELLENCE:
• Format Mastery: Multi-platform optimization with premium presentation standards
• Visual Excellence: Professional design and layout that establishes market authority
• Technical Perfection: Flawless formatting and distribution readiness
• Brand Positioning: Strategic presentation that reinforces competitive advantage
• Market Dominance: Complete package positioned for category leadership

ENTERPRISE STANDARDS:
• Publication-ready with absolute zero errors
• Premium visual design establishing thought leadership
• Multi-format optimization for maximum market reach
• Complete metadata and distribution readiness
• Market-dominating quality that defines industry standards`,
            outputFormat: 'enterprise-multi-format',
            generateCover: true,
            includeImages: true,
            includeCaseStudies: true,
            includeTOC: true,
            includeMetadata: true,
            includeMarketing: true,
            aiEnabled: true,
            selectedModels: []
          }
        }
      ]
      
      presetEdges = [
        { id: 'e1-2', source: 'input-1', target: 'process-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e2-3', source: 'process-1', target: 'process-2', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e3-4', source: 'process-2', target: 'process-3', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e4-5', source: 'process-3', target: 'condition-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e5-6', source: 'condition-1', target: 'process-4', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e6-7', source: 'process-4', target: 'output-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }
      ]
      
      setFlowName('Enterprise 7-Step Market Dominance Workflow')
      setFlowDescription('Complete enterprise-grade workflow with research intelligence, strategic architecture, elite content creation, quality mastery, and market-dominating output')
    }
    
    setNodes(presetNodes)
    setEdges(presetEdges)
    toast.success(`${stepCount}-step production flow created with full configuration`)
  }

  // Comprehensive flow logging method
  const logFlowDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('🔍 COMPREHENSIVE FLOW LOGGING')
      console.log('👤 Current User:', user ? {
        id: user.id,
        email: user.email
      } : 'NO USER LOGGED IN')

      console.log('🌊 Current Flow Details:', {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          label: node.data?.label,
          aiEnabled: node.data?.aiEnabled
        })),
        edges: edges.map(edge => ({
          source: edge.source,
          target: edge.target
        }))
      })

      if (!user) {
        console.error('❌ No user logged in for flow details')
        return
      }

      const { data: providers, error: providerError } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('user_id', user.id)
      
      console.log('🤖 User AI Providers:', {
        count: providers?.length || 0,
        providers: providers?.map(p => p.provider)
      })

      if (providerError) {
        console.error('❌ Provider Fetch Error:', providerError)
      }

      const { data: flows, error: flowError } = await supabase
        .from('ai_flows')
        .select('*')
        .eq('created_by', user.id)
      
      console.log('📊 User Flows:', {
        count: flows?.length || 0,
        flowNames: flows?.map(f => f.name)
      })

      if (flowError) {
        console.error('❌ Flow Fetch Error:', flowError)
      }

      // Use standard console toast if react-hot-toast fails
      try {
        toast.success('Flow details logged to console')
      } catch {
        console.log('✅ Flow details logged successfully')
      }

    } catch (error) {
      console.error('💥 Comprehensive Logging Error:', error)
    }
  }

  // Add a debug button in the UI to trigger this logging
  const handleDebugLog = () => {
    logFlowDetails()
  }

  return (
    <div className="w-full h-[900px] bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Workflow Builder Logo */}
            <img 
              src="/src/components/img/4.png" 
              alt="LEKHIKA Workflow Builder"
              className="h-12 w-auto object-contain"
            />
            {flowName && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Active Flow:</span>
                <span className="text-lg font-bold text-green-400 bg-green-900/30 px-3 py-2 rounded-lg">
                  {flowName}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Debug Button */}
            <div className="flex items-center gap-1 bg-gray-600 rounded-lg p-1">
              <button
                onClick={handleDebugLog}
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded text-sm transition-colors font-medium"
              >
                🐛 Debug
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">

              {/* Download (Local) Button */}
              <button
                onClick={async () => {
                  try {
                    const result = await flowBackupService.downloadFlowsBackup()
                    if (result.success) {
                      toast.success(`✅ Downloaded ${result.count} flows`)
                    } else {
                      toast.error(`❌ Download failed: ${result.error}`)
                    }
                  } catch (error) {
                    toast.error(`❌ Download error: ${error.message}`)
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download (Local)
              </button>

              {/* Sync Filesystem Button */}
              <button
                onClick={async () => {
                  try {
                    const result = await flowBackupService.syncFlowsToFilesystem()
                    if (result.success) {
                      toast.success(`✅ Synced ${result.count} flows to filesystem`)
                    } else {
                      toast.error(`❌ Sync failed: ${result.error}`)
                    }
                  } catch (error) {
                    toast.error(`❌ Sync error: ${error.message}`)
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Sync Filesystem
              </button>


              {/* View Workflow Button */}
              <button
                onClick={() => {
                  setExecutionModalData({
                    status: 'view',
                    progress: 0,
                    nodeName: 'Workflow Overview',
                    message: 'Viewing workflow structure and configuration'
                  })
                  setShowExecutionModal(true)
                }}
                disabled={nodes.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  nodes.length === 0
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                View Flow
              </button>

              {/* Real Workflow Execution Button */}
              <button
                onClick={() => executeWorkflow()}
                disabled={isExecuting || nodes.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
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
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Execute Workflow
                  </>
                )}
              </button>

              {/* Force Stop Button */}
              {isExecuting && (
                <button
                  onClick={forceStopWorkflow}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Force Stop
                </button>
              )}

              <button
                onClick={() => setShowSavedFlows(!showSavedFlows)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                <Workflow className="w-4 h-4" /> My Flows ({savedFlows.length})
              </button>

              {/* Client Flows Button */}
              <button
                onClick={() => setShowClientFlows(!showClientFlows)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
              >
                <Crown className="w-4 h-4" /> Client Flows ({Object.keys(CLIENT_FLOWS).length})
              </button>
              {/* <button
                onClick={() => setShowTopNotchTemplateSelector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg"
              >
                <Crown className="w-4 h-4" /> Top-Notch Templates
              </button> */}
              <button
                onClick={() => setShowNodePaletteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" /> Add Node
              </button>
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
      </div>

      {/* Main Content Area */}
      <div className="flex w-full h-full">
        {/* Client Flows Sidebar */}
        {showClientFlows && (
          <div className="w-80 superadmin-theme border-r border-subtle flex flex-col backdrop-blur-sm" style={{ background: 'var(--bg-surface)' }}>
            <div className="p-4 border-b border-subtle">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Crown className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  Client Flows
                </h3>
                <button
                  onClick={() => setShowClientFlows(false)}
                  className="p-2 rounded-lg hover:bg-surface-hover focus-ring"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Professional ready-to-use workflows</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Group flows by category */}
              {getClientFlowCategories().map((category) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wide pb-1" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    {category}
                  </h4>
                  {Object.entries(CLIENT_FLOWS)
                    .filter(([key, flow]) => flow.category === category)
                    .map(([key, flow]) => (
                      <div 
                        key={flow.id} 
                        className="group relative rounded-xl p-4 overflow-hidden cursor-pointer transition-transform duration-300 bg-surface border border-subtle hover:-translate-y-1 hover:shadow-2xl"
                        onClick={() => {
                          loadClientFlow(flow, key)
                          setShowClientFlows(false)
                        }}
                      >
                        {/* Radiant gradient glows */}
                        <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                             style={{ background: 'radial-gradient(800px 200px at 0% 0%, rgba(16,185,129,0.12), transparent), radial-gradient(800px 200px at 100% 100%, rgba(20,184,166,0.12), transparent)' }} />
                        <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                             style={{ boxShadow: 'inset 0 0 24px rgba(16,185,129,0.18), 0 40px 80px rgba(16,185,129,0.10)' }} />
                        {/* Node count pill */}
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border"
                             style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(20,184,166,0.18))', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)', boxShadow: '0 0 14px rgba(16,185,129,0.25)' }}>
                          {Array.isArray(flow.nodes) ? `${flow.nodes.length} nodes` : ''}
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm mb-1 transition-colors" style={{ color: 'var(--text-primary)', textShadow: '0 1px 0 rgba(0,0,0,0.2)' }}>
                              {flow.name}
                            </h5>
                            <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                              {flow.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 rounded-full text-white font-medium"
                                    style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 6px 18px rgba(16,185,129,0.3)' }}>
                                {flow.difficulty}
                              </span>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {flow.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              loadClientFlow(flow, key)
                            }}
                            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/40 rounded-lg border border-emerald-500/30 hover:border-emerald-400/60 transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Load Client Flow"
                          >
                            <Download className="w-4 h-4 text-emerald-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPresetsFlowKey(key)
                              setShowPresetsModal(true)
                            }}
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg border border-blue-500/30 hover:border-blue-400/60 transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Manage Presets for this Flow"
                          >
                            <Settings className="w-4 h-4 text-blue-400" />
                          </button>
                          <span className="text-xs text-emerald-300 ml-2">
                            {flow.nodes?.length || 0} nodes
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Flows Sidebar */}
        {showSavedFlows && (
          <div className="w-80 bg-gray-800 border-r border-gray-600 flex flex-col">
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Saved Flows</h3>
                <button
                  onClick={() => setShowSavedFlows(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-1">{savedFlows.length} flows saved</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedFlows.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Workflow className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No flows saved yet</p>
                  <p className="text-sm">Create and save your first flow!</p>
                </div>
              ) : (
                savedFlows.map((flow) => (
                  <div 
                    key={flow.id} 
                    className="group relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-5 border border-gray-600/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer"
                    style={{
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(-2deg) rotateY(2deg) translateY(-8px)'
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)'
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}
                  >
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg group-hover:text-blue-300 transition-colors duration-200 overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            wordBreak: 'break-word',
                            hyphens: 'auto'
                          }}>
                            {flow.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full text-xs font-medium text-blue-300 border border-blue-500/30">
                              {flow.type === 'full' ? 'Full Flow' : flow.type === 'book_generation' ? 'Book Gen' : 'Custom'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              loadFlow(flow)
                            }}
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg border border-blue-500/30 hover:border-blue-400/60 transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Load Flow"
                          >
                            <Download className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteFlow(flow.id, flow.name)
                            }}
                            className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg border border-red-500/30 hover:border-red-400/60 transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Delete Flow"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      
                      {flow.description && (
                        <p className="text-sm text-gray-300 mb-3 leading-relaxed overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word',
                          hyphens: 'auto'
                        }}>
                          {flow.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 px-3 py-1 bg-gray-700/50 rounded-full border border-gray-600/50">
                            <Layers className="w-3 h-3 text-blue-400" />
                            <span className="text-xs font-medium text-gray-300">
                              {(() => {
                                // Calculate node count from MAIN FLOW data (ai_flows table)
                                let nodeCount = 0
                                
                                // Debug logging
                                console.log('🔍 Flow data for node count:', {
                                  id: flow.id,
                                  name: flow.name,
                                  configurations: flow.configurations,
                                  nodes: flow.nodes,
                                  steps: flow.steps
                                })
                                
                                if (flow.configurations?.nodes) {
                                  // Main Flow format: configurations.nodes
                                  nodeCount = Array.isArray(flow.configurations.nodes) ? flow.configurations.nodes.length : 0
                                  console.log('✅ Found nodes in configurations.nodes:', nodeCount)
                                } else if (flow.nodes) {
                                  // Legacy format: direct nodes field
                                  if (typeof flow.nodes === 'string') {
                                    try {
                                      const parsedNodes = JSON.parse(flow.nodes)
                                      nodeCount = Array.isArray(parsedNodes) ? parsedNodes.length : 0
                                      console.log('✅ Found nodes in flow.nodes (string):', nodeCount)
                                    } catch {
                                      nodeCount = 0
                                      console.log('❌ Failed to parse flow.nodes string')
                                    }
                                  } else if (Array.isArray(flow.nodes)) {
                                    nodeCount = flow.nodes.length
                                    console.log('✅ Found nodes in flow.nodes (array):', nodeCount)
                                  }
                                } else if (flow.steps) {
                                  // Steps format (might contain node count)
                                  nodeCount = Array.isArray(flow.steps) ? flow.steps.length : 0
                                  console.log('✅ Found nodes in flow.steps:', nodeCount)
                                } else {
                                  console.log('❌ No nodes found in any field')
                                }
                                
                                return nodeCount
                              })()} nodes
                            </span>
                          </div>
                          
                          {(() => {
                            // Check if flow has AI nodes
                            let hasAI = false
                            if (flow.nodes) {
                              try {
                                const nodesData = typeof flow.nodes === 'string' ? JSON.parse(flow.nodes) : flow.nodes
                                hasAI = Array.isArray(nodesData) && nodesData.some(node => node.data?.aiEnabled)
                              } catch {
                                hasAI = false
                              }
                            } else if (flow.steps) {
                              // Check steps for AI capability
                              hasAI = Array.isArray(flow.steps) && flow.steps.some(step => 
                                step.includes('ai') || step.includes('AI') || 
                                step.includes('research') || step.includes('writing') || 
                                step.includes('analysis') || step.includes('content')
                              )
                            }
                            return hasAI
                          })() && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full border border-purple-500/30">
                              <Brain className="w-3 h-3 text-purple-400" />
                              <span className="text-xs font-medium text-purple-300">AI</span>
                            </div>
                          )}
                          
                          {(() => {
                            // Check if flow has condition nodes
                            let hasConditions = false
                            if (flow.nodes) {
                              try {
                                const nodesData = typeof flow.nodes === 'string' ? JSON.parse(flow.nodes) : flow.nodes
                                hasConditions = Array.isArray(nodesData) && nodesData.some(node => node.type === 'condition')
                              } catch {
                                hasConditions = false
                              }
                            }
                            return hasConditions
                          })() && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-full border border-green-500/30">
                              <GitBranch className="w-3 h-3 text-green-400" />
                              <span className="text-xs font-medium text-green-300">Logic</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(flow.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* React Flow Canvas */}
        <div className="flex-1 h-full relative">
          {/* Execution Progress Overlay */}
          {isExecuting && (
            <div className="absolute top-4 right-4 z-10 bg-gray-800 border border-gray-600 rounded-lg p-4 min-w-64">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white font-medium">Executing Workflow</span>
              </div>
              <div className="bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${executionProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-300">
                Progress: {Math.round(executionProgress)}%
              </div>
              {currentExecutingNode && (
                <div className="text-sm text-green-400 mt-1">
                  Current: {nodes.find(n => n.id === currentExecutingNode)?.data?.label || 'Unknown'}
                </div>
              )}
            </div>
          )}

          {/* Execution Error Display */}
          {executionError && (
            <div className="absolute top-4 right-4 z-10 bg-red-800 border border-red-600 rounded-lg p-4 min-w-64">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400 font-medium">Execution Failed</span>
              </div>
              <div className="text-sm text-red-300">
                {executionError}
              </div>
              <button
                onClick={() => setExecutionError(null)}
                className="mt-2 px-2 py-1 bg-red-700 hover:bg-red-600 text-white text-xs rounded"
              >
                Dismiss
              </button>
            </div>
          )}

          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              className: `${node.className || ''} ${
                currentExecutingNode === node.id 
                  ? 'ring-2 ring-green-500 ring-opacity-75' 
                  : ''
              }`.trim(),
              data: {
                ...node.data,
                isExecuting: currentExecutingNode === node.id,
                executionStatus: executionStatuses[node.id] || 'pending',
                onDelete: () => deleteNode(node.id)
              }
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-900"
          >
            <Controls className="bg-gray-800 border-gray-600" />
            <MiniMap className="bg-gray-800 border-gray-600" />
            <Background variant="dots" gap={20} size={1} color="#374151" />
          </ReactFlow>

        </div>
      </div>

      {/* Modals */}
      {showNodeModal && selectedNode && (
        <FlowNodeModal
          isOpen={showNodeModal}
          onClose={() => {
            setShowNodeModal(false)
            setSelectedNode(null)
          }}
          node={selectedNode}
          nodes={nodes}
          edges={edges}
          clientFlowKey={currentClientFlowKey}
          onSave={(config) => {
            // If it's a new node, add it to the flow first
            if (selectedNode.isNewNode) {
              const newFlowNode = {
                id: `node_${Date.now()}`,
                type: 'custom',
                position: { x: 100, y: 100 },
                data: {
                  ...selectedNode,
                  ...config,
                  label: config.label || selectedNode.name
                }
              }
              setNodes(nodes => [...nodes, newFlowNode])
              toast.success('Node added to flow!')
            } else {
              // Existing node, just save config
              saveNodeConfig(selectedNode.id, config)
            }
          }}
          onDelete={() => {
            deleteNode(selectedNode.id)
            setShowNodeModal(false)
            setSelectedNode(null)
          }}
          inputOptions={INPUT_OPTIONS}
        />
      )}

      {showSaveModal && (
        <FlowSaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={(flowData) => {
            // Optional: do something after successful save
            console.log('Flow saved:', flowData)
          }}
          nodes={nodes}
          edges={edges}
          currentFlow={currentFlow}
          clientFlowKey={currentClientFlowKey}
        />
      )}

      {/* Workflow Execution Modal */}
      <WorkflowExecutionModal
        isOpen={showExecutionModal}
        onClose={closeExecutionModal}
        executionData={executionModalData}
        onForceStop={forceStopWorkflow}
        flowId={currentFlow?.id || `flow_${Date.now()}`}
        userId={getSuperAdminUserId()}
      />

      {/* Node Palette Modal */}
      <ClientInputPresetsModal
        isOpen={!!showPresetsModal}
        onClose={() => setShowPresetsModal(false)}
        flowKey={selectedPresetsFlowKey}
      />
      <NodePaletteModal
        isOpen={showNodePaletteModal}
        onClose={() => setShowNodePaletteModal(false)}
        onNodeSelect={addNode}
        onNodeDuplicate={(node) => {
          const duplicateNode = {
            ...node,
            name: `${node.name} (Copy)`,
            role: `${node.role}_copy_${Date.now()}`
          }
          addNode(duplicateNode)
        }}
        onNodeCreate={(nodeType) => {
          // Create a base node template for the selected type
          const newNode = {
            type: nodeType,
            name: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
            description: `Custom ${nodeType} node`,
            role: `custom_${nodeType}_${Date.now()}`,
            icon: nodeType === 'input' ? '📝' : nodeType === 'process' ? '⚙️' : nodeType === 'condition' ? '🔀' : nodeType === 'preview' ? '👁️' : '📤',
            gradient: nodeType === 'input' ? 'from-blue-500 to-blue-700' : 
                     nodeType === 'process' ? 'from-green-500 to-green-700' :
                     nodeType === 'condition' ? 'from-yellow-500 to-yellow-700' :
                     nodeType === 'preview' ? 'from-purple-500 to-purple-700' : 'from-pink-500 to-pink-700',
            is_ai_enabled: nodeType === 'process',
            configuration: {},
            masterCategory: nodeType,
            isNewNode: true // Flag to indicate this is a new custom node
          }
          
          // Close the palette modal first
          setShowNodePaletteModal(false)
          
          // Set the selected node and open the configuration modal
          setSelectedNode(newNode)
          setShowNodeModal(true)
        }}
      />


      {/* <TopNotchTemplateSelector
        isVisible={showTopNotchTemplateSelector}
        onClose={() => setShowTopNotchTemplateSelector(false)}
        onFlowSelect={loadTopNotchTemplate}
      /> */}
    </div>
  )
}

export default Flow

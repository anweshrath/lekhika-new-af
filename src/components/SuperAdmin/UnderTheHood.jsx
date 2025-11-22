import React, { useState, useCallback, useMemo } from 'react'
// React Flow imports - cleaned up invalid exports
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow'
import 'reactflow/dist/style.css'
import { 
  Zap, 
  Crown, 
  BookOpen, 
  Heart, 
  Sparkles,
  Plus,
  Save,
  Trash2,
  Settings,
  Play,
  Eye,
  Copy,
  Download,
  Upload,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Palette,
  Workflow,
  Layers,
  ArrowRight,
  Brain,
  Rocket,
  Magic,
  Sun,
  Moon,
  Flower,
  Tree,
  Mountain,
  Ocean,
  Fire,
  X,
  PenTool,
  BarChart3,
  Layout
} from 'lucide-react'
import toast from 'react-hot-toast'

// Custom Node Types
import InputNode from './nodes/InputNode'
import ConditionNode from './nodes/ConditionNode'
import ProcessNode from './nodes/ProcessNode'
import MediaNode from './nodes/MediaNode'
import QualityNode from './nodes/QualityNode'
import OutputNode from './nodes/OutputNode'

// Node Configuration Modal
import NodeConfigurationModal from './NodeConfigurationModal'

const nodeTypes = {
  input: InputNode,
  condition: ConditionNode,
  process: ProcessNode,
  media: MediaNode,
  quality: QualityNode,
  output: OutputNode
}

const UnderTheHood = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedFlow, setSelectedFlow] = useState('simplified')
  const [showNodePalette, setShowNodePalette] = useState(false)
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Node Configuration Modal State
  const [showNodeModal, setShowNodeModal] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)

  // Pre-built professional flows
  const professionalFlows = useMemo(() => ({
    simplified: {
      name: 'Streamlined Book Creator',
      description: 'Quick, high-quality book generation in 3 steps',
      nodes: [
        {
          id: 'start',
          type: 'input',
          position: { x: 100, y: 100 },
          data: { 
            label: 'Book Requirements',
            inputs: ['title', 'genre', 'target_audience', 'word_count'],
            icon: BookOpen,
            color: 'blue'
          }
        },
        {
          id: 'content_gen',
          type: 'process',
          position: { x: 400, y: 100 },
          data: { 
            label: 'AI Content Generation',
            services: ['openai', 'claude', 'gemini'],
            estimated_tokens: 5000,
            icon: Brain,
            color: 'green'
          }
        },
        {
          id: 'finish',
          type: 'output',
          position: { x: 700, y: 100 },
          data: { 
            label: 'Final Book',
            outputs: ['pdf', 'epub', 'docx'],
            icon: CheckCircle,
            color: 'purple'
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'start', target: 'content_gen', type: 'smoothstep' },
        { id: 'e2-3', source: 'content_gen', target: 'finish', type: 'smoothstep' }
      ]
    },
    expert: {
      name: 'Professional Content Engine',
      description: 'Advanced 5-step workflow for publication-ready content',
      nodes: [
        {
          id: 'start',
          type: 'input',
          position: { x: 100, y: 100 },
          data: { 
            label: 'Project Brief',
            inputs: ['title', 'genre', 'audience', 'style', 'research_requirements'],
            icon: FileText,
            color: 'blue'
          }
        },
        {
          id: 'research',
          type: 'process',
          position: { x: 350, y: 100 },
          data: { 
            label: 'Research & Analysis',
            services: ['perplexity', 'claude', 'openai'],
            estimated_tokens: 3000,
            icon: Target,
            color: 'green'
          }
        },
        {
          id: 'outline',
          type: 'process',
          position: { x: 600, y: 100 },
          data: { 
            label: 'Structure & Outline',
            services: ['claude', 'openai'],
            estimated_tokens: 2000,
            icon: Layers,
            color: 'orange'
          }
        },
        {
          id: 'writing',
          type: 'process',
          position: { x: 850, y: 100 },
          data: { 
            label: 'Content Creation',
            services: ['claude', 'openai', 'gemini'],
            estimated_tokens: 8000,
            icon: PenTool,
            color: 'purple'
          }
        },
        {
          id: 'finish',
          type: 'output',
          position: { x: 1100, y: 100 },
          data: { 
            label: 'Publication Ready',
            outputs: ['formatted_pdf', 'epub', 'print_ready', 'cover_design'],
            icon: Star,
            color: 'yellow'
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'start', target: 'research', type: 'smoothstep' },
        { id: 'e2-3', source: 'research', target: 'outline', type: 'smoothstep' },
        { id: 'e3-4', source: 'outline', target: 'writing', type: 'smoothstep' },
        { id: 'e4-5', source: 'writing', target: 'finish', type: 'smoothstep' }
      ]
    },
    full: {
      name: 'Comprehensive Book Factory',
      description: 'Complete 7-step process for maximum quality and control',
      nodes: [
        {
          id: 'start',
          type: 'input',
          position: { x: 100, y: 100 },
          data: { 
            label: 'Comprehensive Brief',
            inputs: ['title', 'genre', 'audience', 'style', 'research_depth', 'image_requirements', 'publishing_goals'],
            icon: FileText,
            color: 'blue'
          }
        },
        {
          id: 'research',
          type: 'process',
          position: { x: 300, y: 100 },
          data: { 
            label: 'Deep Research',
            services: ['perplexity', 'claude', 'openai', 'gemini'],
            estimated_tokens: 4000,
            icon: Target,
            color: 'green'
          }
        },
        {
          id: 'analysis',
          type: 'process',
          position: { x: 500, y: 100 },
          data: { 
            label: 'Market Analysis',
            services: ['claude', 'openai'],
            estimated_tokens: 2500,
            icon: BarChart3,
            color: 'teal'
          }
        },
        {
          id: 'outline',
          type: 'process',
          position: { x: 700, y: 100 },
          data: { 
            label: 'Detailed Outline',
            services: ['claude', 'openai'],
            estimated_tokens: 3000,
            icon: Layers,
            color: 'orange'
          }
        },
        {
          id: 'writing',
          type: 'process',
          position: { x: 900, y: 100 },
          data: { 
            label: 'Content Generation',
            services: ['claude', 'openai', 'gemini', 'mistral'],
            estimated_tokens: 12000,
            icon: PenTool,
            color: 'purple'
          }
        },
        {
          id: 'enhancement',
          type: 'process',
          position: { x: 1100, y: 100 },
          data: { 
            label: 'Quality Enhancement',
            services: ['claude', 'openai'],
            estimated_tokens: 4000,
            icon: Sparkles,
            color: 'pink'
          }
        },
        {
          id: 'finish',
          type: 'output',
          position: { x: 1300, y: 100 },
          data: { 
            label: 'Professional Output',
            outputs: ['formatted_pdf', 'epub', 'print_ready', 'cover_design', 'marketing_materials'],
            icon: Crown,
            color: 'yellow'
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'start', target: 'research', type: 'smoothstep' },
        { id: 'e2-3', source: 'research', target: 'analysis', type: 'smoothstep' },
        { id: 'e3-4', source: 'analysis', target: 'outline', type: 'smoothstep' },
        { id: 'e4-5', source: 'outline', target: 'writing', type: 'smoothstep' },
        { id: 'e5-6', source: 'writing', target: 'enhancement', type: 'smoothstep' },
        { id: 'e6-7', source: 'enhancement', target: 'finish', type: 'smoothstep' }
      ]
    },
    children: {
      name: 'Children\'s Book Creator',
      description: 'Specialized flow for creating engaging children\'s books with illustrations',
      nodes: [
        {
          id: 'start',
          type: 'input',
          position: { x: 100, y: 100 },
          data: { 
            label: 'Children\'s Book Brief',
            inputs: ['age_group', 'theme', 'story_type', 'illustration_style', 'educational_value'],
            icon: Flower,
            color: 'pink'
          }
        },
        {
          id: 'story_dev',
          type: 'process',
          position: { x: 350, y: 100 },
          data: { 
            label: 'Story Development',
            services: ['claude', 'openai'],
            estimated_tokens: 3000,
            icon: BookOpen,
            color: 'green'
          }
        },
        {
          id: 'character_design',
          type: 'process',
          position: { x: 600, y: 100 },
          data: { 
            label: 'Character Design',
            services: ['dalle', 'midjourney', 'stable-diffusion'],
            estimated_tokens: 1000,
            icon: Star,
            color: 'yellow'
          }
        },
        {
          id: 'illustrations',
          type: 'media',
          position: { x: 850, y: 100 },
          data: { 
            label: 'Story Illustrations',
            services: ['dalle', 'midjourney'],
            estimated_tokens: 2000,
            icon: ImageIcon,
            color: 'purple'
          }
        },
        {
          id: 'layout',
          type: 'process',
          position: { x: 1100, y: 100 },
          data: { 
            label: 'Layout & Design',
            services: ['claude', 'openai'],
            estimated_tokens: 1500,
            icon: Layout,
            color: 'blue'
          }
        },
        {
          id: 'finish',
          type: 'output',
          position: { x: 1350, y: 100 },
          data: { 
            label: 'Children\'s Book',
            outputs: ['illustrated_pdf', 'print_ready', 'digital_version'],
            icon: Heart,
            color: 'red'
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'start', target: 'story_dev', type: 'smoothstep' },
        { id: 'e2-3', source: 'story_dev', target: 'character_design', type: 'smoothstep' },
        { id: 'e3-4', source: 'character_design', target: 'illustrations', type: 'smoothstep' },
        { id: 'e4-5', source: 'illustrations', target: 'layout', type: 'smoothstep' },
        { id: 'e5-6', source: 'layout', target: 'finish', type: 'smoothstep' }
      ]
    },
    manifestation: {
      name: 'Life & Manifestation Journal',
      description: 'Complete journal system with prebuilt structure and manifestation questions',
      nodes: [
        {
          id: 'start',
          type: 'input',
          position: { x: 100, y: 100 },
          data: { 
            label: 'Journal Intentions',
            inputs: ['life_area', 'manifestation_goals', 'personal_style', 'preferred_format'],
            icon: Heart,
            color: 'pink'
          }
        },
        {
          id: 'structure',
          type: 'process',
          position: { x: 350, y: 100 },
          data: { 
            label: 'Journal Structure',
            services: ['claude', 'openai'],
            estimated_tokens: 2000,
            icon: Layers,
            color: 'blue',
            prebuilt: ['morning_routine', 'gratitude_practice', 'goal_tracking', 'reflection_prompts']
          }
        },
        {
          id: 'questions',
          type: 'process',
          position: { x: 600, y: 100 },
          data: { 
            label: 'Manifestation Questions',
            services: ['claude', 'openai'],
            estimated_tokens: 3000,
            icon: Target,
            color: 'green',
            prebuilt: [
              'What do I want to manifest?',
              'How does it feel to have it?',
              'What actions align with my desires?',
              'What limiting beliefs am I releasing?'
            ]
          }
        },
        {
          id: 'design',
          type: 'process',
          position: { x: 850, y: 100 },
          data: { 
            label: 'Journal Design',
            services: ['claude', 'openai'],
            estimated_tokens: 2000,
            icon: Palette,
            color: 'purple'
          }
        },
        {
          id: 'templates',
          type: 'process',
          position: { x: 1100, y: 100 },
          data: { 
            label: 'Daily Templates',
            services: ['claude', 'openai'],
            estimated_tokens: 4000,
            icon: FileText,
            color: 'orange',
            prebuilt: [
              'morning_affirmations',
              'evening_reflection',
              'weekly_goals',
              'monthly_review',
              'vision_board_template'
            ]
          }
        },
        {
          id: 'finish',
          type: 'output',
          position: { x: 1350, y: 100 },
          data: { 
            label: 'Complete Journal System',
            outputs: ['printable_pdf', 'digital_journal', 'guided_prompts', 'tracking_sheets'],
            icon: Sparkles,
            color: 'yellow'
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'start', target: 'structure', type: 'smoothstep' },
        { id: 'e2-3', source: 'structure', target: 'questions', type: 'smoothstep' },
        { id: 'e3-4', source: 'questions', target: 'design', type: 'smoothstep' },
        { id: 'e4-5', source: 'design', target: 'templates', type: 'smoothstep' },
        { id: 'e5-6', source: 'templates', target: 'finish', type: 'smoothstep' }
      ]
    }
  }), [])

  // Node palette items
  const nodePaletteItems = [
    { type: 'input', label: 'Input Node', icon: FileText, color: 'blue' },
    { type: 'condition', label: 'Condition Node', icon: Target, color: 'green' },
    { type: 'process', label: 'Process Node', icon: Brain, color: 'purple' },
    { type: 'media', label: 'Media Node', icon: ImageIcon, color: 'pink' },
    { type: 'quality', label: 'Quality Node', icon: CheckCircle, color: 'orange' },
    { type: 'output', label: 'Output Node', icon: Star, color: 'yellow' }
  ]

  // Load selected flow
  const loadFlow = useCallback((flowType) => {
    setSelectedFlow(flowType)
    const flow = professionalFlows[flowType]
    if (flow) {
      setNodes(flow.nodes)
      setEdges(flow.edges)
      setFlowName(flow.name)
      setFlowDescription(flow.description)
    }
  }, [professionalFlows, setNodes, setEdges])

  // Handle node changes
  const onNodeChanges = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  )

  // Handle edge changes
  const onEdgeChanges = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  )

  // Handle connections
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Add node from palette
  const addNodeFromPalette = useCallback((nodeType, position) => {
    const newNode = {
      id: `${nodeType}_${Date.now()}`,
      type: nodeType,
      position,
      data: { 
        label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
        icon: nodePaletteItems.find(item => item.type === nodeType)?.icon || FileText,
        color: nodePaletteItems.find(item => item.type === nodeType)?.color || 'blue'
      }
    }
    setNodes((nds) => [...nds, newNode])
    setShowNodePalette(false)
  }, [setNodes])

  // Handle node click to open configuration modal
  const handleNodeClick = useCallback((event, node) => {
    event.stopPropagation()
    setSelectedNode(node)
    setShowNodeModal(true)
  }, [])

  // Handle node configuration save
  const handleNodeSave = useCallback((updatedNodeData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === updatedNodeData.id ? { ...node, data: updatedNodeData } : node
      )
    )
    toast.success('Node configuration updated successfully!')
  }, [setNodes])

  // Save flow
  const handleSaveFlow = async () => {
    if (!flowName.trim()) {
      toast.error('Please enter a flow name')
      return
    }

    setSaving(true)
    try {
      // Here you would save to your database
      // For now, just show success
      toast.success(`Flow "${flowName}" saved successfully!`)
      setShowSaveModal(false)
    } catch (error) {
      console.error('Error saving flow:', error)
      toast.error('Failed to save flow')
    } finally {
      setSaving(false)
    }
  }

  // Load initial flow
  React.useEffect(() => {
    loadFlow('simplified')
  }, [loadFlow])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Rocket className="w-8 h-8 text-purple-400" />
              Under The Hood
            </h2>
            <p className="text-gray-400 mt-1">
              Professional workflow engine with React Flow and smart node-based design
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNodePalette(!showNodePalette)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Palette className="w-4 h-4" />
              Node Palette
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Flow
            </button>
          </div>
        </div>

        {/* Flow Selector */}
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(professionalFlows).map(([key, flow]) => (
            <button
              key={key}
              onClick={() => loadFlow(key)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                selectedFlow === key
                  ? 'border-blue-500 bg-blue-900/20 text-blue-400'
                  : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-600/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {key === 'simplified' && <Zap className="w-5 h-5" />}
                {key === 'expert' && <Target className="w-5 h-5" />}
                {key === 'full' && <Crown className="w-5 h-5" />}
                {key === 'children' && <Heart className="w-5 h-5" />}
                {key === 'manifestation' && <Sparkles className="w-5 h-5" />}
                <span className="font-semibold">{flow.name}</span>
              </div>
              <p className="text-xs text-gray-400">{flow.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <div className="h-[600px] w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodeChanges}
            onEdgesChange={onEdgeChanges}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-900"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* Node Palette */}
      {showNodePalette && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Node Palette</h3>
              <button
                onClick={() => setShowNodePalette(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {nodePaletteItems.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addNodeFromPalette(item.type, { x: 100, y: 100 })}
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-lg ${
                    item.color === 'blue' ? 'bg-blue-600' :
                    item.color === 'green' ? 'bg-green-600' :
                    item.color === 'purple' ? 'bg-purple-600' :
                    item.color === 'pink' ? 'bg-pink-600' :
                    item.color === 'orange' ? 'bg-orange-600' :
                    item.color === 'yellow' ? 'bg-yellow-600' : 'bg-gray-600'
                  } flex items-center justify-center`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Flow Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Save Flow</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Flow Name</label>
                <input
                  type="text"
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Enter flow name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={flowDescription}
                  onChange={(e) => setFlowDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows="3"
                  placeholder="Enter flow description"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFlow}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Flow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Node Configuration Modal */}
      <NodeConfigurationModal
        isOpen={showNodeModal}
        onClose={() => {
          setShowNodeModal(false)
          setSelectedNode(null)
        }}
        nodeData={selectedNode}
        onSave={handleNodeSave}
      />
    </div>
  )
}

export default UnderTheHood

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  BarChart3, 
  FileText, 
  Edit3, 
  RefreshCw, 
  Image as ImageIcon, 
  Layout,
  Settings,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Target,
  Layers,
  ArrowRight,
  BookOpen,
  Rocket,
  Users,
  Crown,
  Star,
  Plus,
  Copy
} from 'lucide-react'
import ProcessStepModal from './ProcessStepModal'
import FlowSelector from './FlowSelector'
import FlowSaveModal from './FlowSaveModal'
import { flowPersistenceService } from '../../services/flowPersistenceService'
import toast from 'react-hot-toast'

const ContentCreationFlow = ({ serviceStatus }) => {
  const [selectedStep, setSelectedStep] = useState(null)
  const [activeFlow, setActiveFlow] = useState('simplified')
  const [stepConfigurations, setStepConfigurations] = useState({})
  const [selectedFlow, setSelectedFlow] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [flowStats, setFlowStats] = useState({})

  // Load flow stats on mount
  useEffect(() => {
    loadFlowStats()
  }, [])

  const loadFlowStats = async () => {
    try {
      const stats = await flowPersistenceService.getFlowStats()
      setFlowStats(stats)
    } catch (error) {
      console.error('Error loading flow stats:', error)
    }
  }

  // Update active flow when selected flow changes
  useEffect(() => {
    if (selectedFlow) {
      setActiveFlow(selectedFlow.type)
      // Load flow configurations if available
      if (selectedFlow.steps) {
        // Convert flow steps to step configurations
        const configs = {}
        selectedFlow.steps.forEach(stepId => {
          configs[stepId] = {
            models: selectedFlow.models ? Object.entries(selectedFlow.models).map(([service, modelId]) => ({
              service,
              modelId,
              maxTokens: selectedFlow.parameters?.maxTokens || 2000
            })) : []
          }
        })
        setStepConfigurations(configs)
      }
    }
  }, [selectedFlow])

  // Full 7-step process flow
  const fullProcessSteps = [
    {
      id: 'research',
      name: 'Research',
      description: 'Gather comprehensive information and sources',
      purpose: 'Conduct thorough research on the book topic, gather credible sources, analyze market trends, and compile comprehensive background information.',
      icon: Search,
      color: 'blue',
      estimatedTokens: 3000,
      recommendedServices: ['perplexity', 'claude', 'openai'],
      dependencies: [],
      outputs: ['research_data', 'source_list', 'market_analysis']
    },
    {
      id: 'analysis',
      name: 'Analysis',
      description: 'Analyze research data and extract insights',
      purpose: 'Process research data, identify key themes, extract actionable insights, and create structured analysis for content creation.',
      icon: BarChart3,
      color: 'purple',
      estimatedTokens: 2500,
      recommendedServices: ['claude', 'openai', 'gemini'],
      dependencies: ['research'],
      outputs: ['analysis_report', 'key_insights', 'content_structure']
    },
    {
      id: 'parsing',
      name: 'Parsing',
      description: 'Structure and organize content framework',
      purpose: 'Parse analyzed data into structured content framework, create chapter outlines, and organize information hierarchy.',
      icon: FileText,
      color: 'green',
      estimatedTokens: 2000,
      recommendedServices: ['openai', 'claude', 'mistral'],
      dependencies: ['analysis'],
      outputs: ['content_outline', 'chapter_structure', 'information_hierarchy']
    },
    {
      id: 'writing',
      name: 'Writing',
      description: 'Generate initial book content',
      purpose: 'Create comprehensive book content based on structured outline, write engaging chapters, and develop narrative flow.',
      icon: Edit3,
      color: 'orange',
      estimatedTokens: 5000,
      recommendedServices: ['claude', 'openai', 'gemini'],
      dependencies: ['parsing'],
      outputs: ['chapter_content', 'narrative_flow', 'section_drafts']
    },
    {
      id: 'refinement',
      name: 'Refinement',
      description: 'Polish and enhance content quality',
      purpose: 'Refine generated content, improve clarity, enhance readability, and ensure consistency across all sections.',
      icon: RefreshCw,
      color: 'indigo',
      estimatedTokens: 3000,
      recommendedServices: ['claude', 'openai', 'mistral'],
      dependencies: ['writing'],
      outputs: ['polished_content', 'consistency_check', 'quality_improvements']
    },
    {
      id: 'images',
      name: 'Images',
      description: 'Generate visual content and illustrations',
      purpose: 'Create relevant images, diagrams, and visual elements to enhance the book content and improve reader engagement.',
      icon: ImageIcon,
      color: 'pink',
      estimatedTokens: 1500,
      recommendedServices: ['dalle', 'midjourney', 'stable-diffusion'],
      dependencies: ['writing'],
      outputs: ['book_images', 'diagrams', 'visual_elements']
    },
    {
      id: 'formatting',
      name: 'Formatting',
      description: 'Final formatting and presentation',
      purpose: 'Apply professional formatting, create table of contents, add metadata, and prepare final book structure for publication.',
      icon: Layout,
      color: 'teal',
      estimatedTokens: 1000,
      recommendedServices: ['claude', 'openai'],
      dependencies: ['refinement', 'images'],
      outputs: ['formatted_book', 'table_of_contents', 'publication_ready']
    }
  ]

  // Simplified 3-step process flow
  const simplifiedSteps = [
    {
      id: 'research_analysis',
      name: 'Research & Analysis',
      description: 'Combined research and analysis phase',
      purpose: 'Conduct comprehensive research and analyze data to create a solid foundation for content creation.',
      icon: Search,
      color: 'blue',
      estimatedTokens: 4000,
      recommendedServices: ['perplexity', 'claude', 'openai'],
      dependencies: [],
      outputs: ['research_data', 'analysis_report', 'content_strategy']
    },
    {
      id: 'content_creation',
      name: 'Content Creation',
      description: 'Generate and refine all book content',
      purpose: 'Create comprehensive book content, including all chapters, sections, and supporting materials with built-in refinement.',
      icon: Edit3,
      color: 'green',
      estimatedTokens: 6000,
      recommendedServices: ['claude', 'openai', 'gemini'],
      dependencies: ['research_analysis'],
      outputs: ['complete_content', 'chapter_structure', 'refined_text']
    },
    {
      id: 'finalization',
      name: 'Finalization',
      description: 'Format, enhance, and finalize',
      purpose: 'Apply final formatting, add images if needed, create table of contents, and prepare publication-ready book.',
      icon: CheckCircle,
      color: 'purple',
      estimatedTokens: 2500,
      recommendedServices: ['claude', 'dalle', 'openai'],
      dependencies: ['content_creation'],
      outputs: ['formatted_book', 'images', 'publication_ready']
    }
  ]

  // Expert 5-step process flow
  const expertSteps = [
    {
      id: 'strategic_research',
      name: 'Strategic Research',
      description: 'Advanced market and audience research',
      purpose: 'Conduct deep market analysis, competitor research, audience profiling, and strategic positioning for maximum impact.',
      icon: Target,
      color: 'red',
      estimatedTokens: 4500,
      recommendedServices: ['perplexity', 'claude', 'openai'],
      dependencies: [],
      outputs: ['market_analysis', 'competitor_research', 'audience_profile', 'positioning_strategy']
    },
    {
      id: 'content_architecture',
      name: 'Content Architecture',
      description: 'Design comprehensive content structure',
      purpose: 'Create detailed content architecture, chapter flow, narrative structure, and engagement optimization framework.',
      icon: Layers,
      color: 'blue',
      estimatedTokens: 3500,
      recommendedServices: ['claude', 'openai', 'gemini'],
      dependencies: ['strategic_research'],
      outputs: ['content_architecture', 'chapter_flow', 'narrative_structure', 'engagement_framework']
    },
    {
      id: 'premium_writing',
      name: 'Premium Writing',
      description: 'High-quality content generation',
      purpose: 'Generate premium-quality content with advanced writing techniques, storytelling elements, and professional polish.',
      icon: Crown,
      color: 'yellow',
      estimatedTokens: 7000,
      recommendedServices: ['claude', 'openai', 'gemini'],
      dependencies: ['content_architecture'],
      outputs: ['premium_content', 'storytelling_elements', 'professional_polish']
    },
    {
      id: 'multimedia_enhancement',
      name: 'Multimedia Enhancement',
      description: 'Advanced visual and interactive elements',
      purpose: 'Create sophisticated visual elements, interactive components, and multimedia enhancements for premium user experience.',
      icon: Star,
      color: 'pink',
      estimatedTokens: 3000,
      recommendedServices: ['dalle', 'midjourney', 'claude'],
      dependencies: ['premium_writing'],
      outputs: ['premium_visuals', 'interactive_elements', 'multimedia_content']
    },
    {
      id: 'publication_optimization',
      name: 'Publication Optimization',
      description: 'Professional publishing preparation',
      purpose: 'Optimize for multiple publication formats, create marketing materials, and ensure professional presentation standards.',
      icon: Rocket,
      color: 'green',
      estimatedTokens: 2000,
      recommendedServices: ['claude', 'openai'],
      dependencies: ['multimedia_enhancement'],
      outputs: ['optimized_formats', 'marketing_materials', 'professional_presentation']
    }
  ]

  const getStepsForFlow = () => {
    switch (activeFlow) {
      case 'full':
        return fullProcessSteps
      case 'expert':
        return expertSteps
      case 'simplified':
      default:
        return simplifiedSteps
    }
  }

  const handleStepClick = (step) => {
    setSelectedStep(step)
  }

  const handleStepConfigSave = (stepId, config) => {
    setStepConfigurations(prev => ({
      ...prev,
      [stepId]: config
    }))
    setSelectedStep(null)
    toast.success('Step configuration saved!')
  }

  const handleSaveFlow = async (flowData) => {
    try {
      const flowToSave = {
        ...flowData,
        type: activeFlow,
        steps: getStepsForFlow().map(step => step.id),
        configurations: stepConfigurations,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await flowPersistenceService.saveFlow(flowToSave)
      setShowSaveModal(false)
      await loadFlowStats()
      toast.success('Flow saved successfully!')
    } catch (error) {
      console.error('Error saving flow:', error)
      toast.error('Failed to save flow')
    }
  }

  const handleLoadFlow = (flow) => {
    setSelectedFlow(flow)
    toast.success(`Loaded flow: ${flow.name}`)
  }

  const handleDuplicateFlow = async (flow) => {
    try {
      const duplicatedFlow = {
        ...flow,
        id: undefined,
        name: `${flow.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await flowPersistenceService.saveFlow(duplicatedFlow)
      await loadFlowStats()
      toast.success('Flow duplicated successfully!')
    } catch (error) {
      console.error('Error duplicating flow:', error)
      toast.error('Failed to duplicate flow')
    }
  }

  const getFlowDescription = () => {
    switch (activeFlow) {
      case 'full':
        return 'Complete 7-step process for maximum quality and control. Best for complex projects requiring detailed customization.'
      case 'expert':
        return 'Advanced 5-step workflow for professional-grade content. Includes strategic research and premium enhancements.'
      case 'simplified':
      default:
        return 'Streamlined 3-step process for quick, high-quality results. Perfect for most book creation needs.'
    }
  }

  const getTotalEstimatedTokens = () => {
    return getStepsForFlow().reduce((total, step) => total + step.estimatedTokens, 0)
  }

  const getConfiguredStepsCount = () => {
    const steps = getStepsForFlow()
    return steps.filter(step => stepConfigurations[step.id]).length
  }

  const steps = getStepsForFlow()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-400" />
              Content Creation Flow
            </h2>
            <p className="text-gray-400 mt-1">
              Design and configure your AI-powered book creation workflow
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Save Flow
            </button>
          </div>
        </div>

        {/* Flow Type Selector */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveFlow('simplified')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeFlow === 'simplified'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>3-Step Flow</span>
              </div>
              <div className="text-xs mt-1 opacity-80">Quick & Simple</div>
            </button>
            
            <button
              onClick={() => setActiveFlow('expert')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeFlow === 'expert'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>5-Step Flow</span>
              </div>
              <div className="text-xs mt-1 opacity-80">Professional Grade</div>
            </button>
            
            <button
              onClick={() => setActiveFlow('full')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeFlow === 'full'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>7-Step Flow</span>
              </div>
              <div className="text-xs mt-1 opacity-80">Maximum Control</div>
            </button>
          </div>
        </div>

        {/* Flow Selector */}
        <FlowSelector
          selectedFlow={selectedFlow}
          onFlowSelect={handleLoadFlow}
          onDuplicateFlow={handleDuplicateFlow}
          onCreateNew={() => setShowSaveModal(true)}
          flowStats={flowStats}
        />

        {/* Flow Info */}
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">
                {activeFlow === 'full' ? 'Full Process Flow' : 
                 activeFlow === 'expert' ? 'Expert Flow' : 'Simplified Flow'}
              </h3>
              <p className="text-gray-400 text-sm mb-3">{getFlowDescription()}</p>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">{steps.length} Steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400">{getTotalEstimatedTokens().toLocaleString()} Est. Tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400">{getConfiguredStepsCount()}/{steps.length} Configured</span>
                </div>
              </div>
            </div>
            
            {selectedFlow && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Loaded Flow:</div>
                <div className="font-semibold text-blue-400">{selectedFlow.name}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          Process Steps
        </h3>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isConfigured = stepConfigurations[step.id]
            const IconComponent = step.icon
            const hasBlockingDependencies = step.dependencies.some(dep => !stepConfigurations[dep])

            return (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-600"></div>
                )}

                <div 
                  className={`
                    relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer
                    ${isConfigured 
                      ? 'border-green-600 bg-green-900/20 hover:bg-green-900/30' 
                      : hasBlockingDependencies
                        ? 'border-gray-600 bg-gray-800/50 opacity-60 cursor-not-allowed'
                        : 'border-gray-600 bg-gray-800 hover:bg-gray-750'
                    }
                  `}
                  onClick={() => !hasBlockingDependencies && handleStepClick(step)}
                >
                  {/* Step Icon */}
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${isConfigured 
                      ? 'bg-green-600 text-white' 
                      : hasBlockingDependencies
                        ? 'bg-gray-600 text-gray-400'
                        : `bg-${step.color}-600 text-white`
                    }
                  `}>
                    {isConfigured ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : hasBlockingDependencies ? (
                      <Clock className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{step.name}</h4>
                      <div className="flex items-center gap-2">
                        {hasBlockingDependencies && (
                          <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-900/20 px-2 py-1 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            Waiting for dependencies
                          </div>
                        )}
                        {isConfigured && (
                          <div className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Configured
                          </div>
                        )}
                        <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                          {step.estimatedTokens.toLocaleString()} tokens
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{step.description}</p>
                    
                    <div className="text-xs text-gray-500 mb-3">{step.purpose}</div>

                    {/* Dependencies */}
                    {step.dependencies.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">Depends on:</span>
                        {step.dependencies.map(depId => {
                          const depStep = steps.find(s => s.id === depId)
                          const isDepConfigured = stepConfigurations[depId]
                          return (
                            <span 
                              key={depId}
                              className={`text-xs px-2 py-1 rounded ${
                                isDepConfigured 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              {depStep?.name || depId}
                            </span>
                          )
                        })}
                      </div>
                    )}

                    {/* Recommended Services */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Recommended:</span>
                      <div className="flex gap-1">
                        {step.recommendedServices.map(service => (
                          <span 
                            key={service}
                            className={`text-xs px-2 py-1 rounded capitalize ${
                              serviceStatus[service]?.status === 'active'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Configuration Preview */}
                    {isConfigured && stepConfigurations[step.id] && (
                      <div className="mt-3 p-3 bg-gray-700 rounded border border-gray-600">
                        <div className="text-xs text-gray-400 mb-1">Configuration:</div>
                        <div className="flex gap-2">
                          {stepConfigurations[step.id].models?.map((model, idx) => (
                            <span key={idx} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                              {model.service}: {model.modelId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  {!hasBlockingDependencies && (
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Flow Statistics */}
      {Object.keys(flowStats).length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Flow Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{flowStats.total || 0}</div>
              <div className="text-sm text-blue-300">Total Flows</div>
            </div>
            <div className="p-4 bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{flowStats.active || 0}</div>
              <div className="text-sm text-green-300">Active Flows</div>
            </div>
            <div className="p-4 bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{flowStats.recent || 0}</div>
              <div className="text-sm text-purple-300">Recent Flows</div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedStep && (
        <ProcessStepModal
          step={selectedStep}
          serviceStatus={serviceStatus}
          initialConfig={stepConfigurations[selectedStep.id]}
          onSave={(config) => handleStepConfigSave(selectedStep.id, config)}
          onClose={() => setSelectedStep(null)}
        />
      )}

      {showSaveModal && (
        <FlowSaveModal
          isOpen={showSaveModal}
          flowType={activeFlow}
          steps={steps}
          configurations={stepConfigurations}
          onSave={handleSaveFlow}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  )
}

export default ContentCreationFlow

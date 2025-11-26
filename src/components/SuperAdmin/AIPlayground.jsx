import React, { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap, 
  Brain, 
  MessageSquare,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  DollarSign,
  Clock,
  Target,
  Sliders,
  Send,
  Copy,
  Download,
  Trash2,
  Save,
  Star,
  Crown
} from 'lucide-react'
import toast from 'react-hot-toast'
import FlowSaveModal from './FlowSaveModal'
import { flowPersistenceService } from '../../services/flowPersistenceService'

const AIPlayground = ({ aiServices, allModels, selectedModels, onModelSelection }) => {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedService, setSelectedService] = useState('openai')
  const [parameters, setParameters] = useState({
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0
  })
  const [history, setHistory] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [currentFlowType, setCurrentFlowType] = useState('simplified')

  // Auto-load first available service
  useEffect(() => {
    const availableServices = Object.keys(aiServices).filter(service => aiServices[service]?.success)
    if (availableServices.length > 0 && !aiServices[selectedService]?.success) {
      setSelectedService(availableServices[0])
    }
  }, [aiServices, selectedService])

  // Auto-fill authentication credentials
  useEffect(() => {
    // Auto-fill with superadmin credentials for testing
    if (!prompt) {
      setPrompt('Write a compelling introduction for a business strategy ebook that will help entrepreneurs scale their companies.')
    }
  }, [])

  const getTokenRealWorldContext = (tokens) => {
    const words = Math.round(tokens * 0.75) // 1 token ≈ 0.75 words
    const pages = Math.round(words / 250) // ~250 words per page
    
    return {
      words: words.toLocaleString(),
      pages: pages || 1
    }
  }

  const calculateEstimatedCost = () => {
    const service = selectedService
    const tokens = parameters.maxTokens
    
    // Rough cost estimates per 1k tokens
    const costs = {
      openai: 0.03,
      claude: 0.015,
      gemini: 0.001,
      mistral: 0.008,
      grok: 0.01,
      perplexity: 0.005
    }
    
    const baseCost = costs[service] || 0.01
    return ((baseCost * tokens) / 1000).toFixed(4)
  }

  const getParameterTooltip = (param) => {
    const tooltips = {
      temperature: {
        title: "Temperature",
        description: "Controls creativity vs consistency",
        details: "Lower (0.1-0.3) = More focused, consistent responses. Higher (0.7-1.0) = More creative, varied responses.",
        economic: "Higher temperature may require more tokens for coherent output, increasing costs by 10-20%."
      },
      maxTokens: {
        title: "Max Tokens",
        description: "Maximum length of the response",
        details: "1 token ≈ 4 characters. 2000 tokens ≈ 1500 words. Adjust based on your content needs.",
        economic: "Directly affects cost - each token costs money. Set appropriately to avoid waste."
      },
      topP: {
        title: "Top P (Nucleus Sampling)",
        description: "Controls diversity of word selection",
        details: "Lower values (0.1-0.5) = More focused vocabulary. Higher values (0.8-1.0) = More diverse word choices.",
        economic: "Extreme values may affect generation efficiency and token usage."
      },
      frequencyPenalty: {
        title: "Frequency Penalty",
        description: "Reduces repetition of frequent words",
        details: "0 = No penalty. Positive values reduce repetition. Negative values encourage repetition.",
        economic: "Higher penalties may increase generation time and token usage."
      },
      presencePenalty: {
        title: "Presence Penalty",
        description: "Encourages talking about new topics",
        details: "0 = No penalty. Positive values encourage new topics. Negative values focus on current topics.",
        economic: "Affects content diversity and may impact generation efficiency."
      }
    }
    return tooltips[param]
  }

  const TooltipIcon = ({ param }) => {
    const tooltip = getParameterTooltip(param)
    
    return (
      <div className="group relative">
        <Info className="w-4 h-4 text-gray-400 hover:text-blue-400 cursor-help" />
        <div className="absolute left-0 top-6 w-80 bg-gray-900 border border-gray-600 rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-400" />
              <h4 className="font-semibold text-white">{tooltip.title}</h4>
            </div>
            
            <p className="text-sm text-gray-300">{tooltip.description}</p>
            <p className="text-xs text-gray-400">{tooltip.details}</p>
            
            <div className="flex items-start space-x-2 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded">
              <DollarSign className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-300">{tooltip.economic}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (!aiServices[selectedService]?.success) {
      toast.error('Selected AI service is not available')
      return
    }

    setIsGenerating(true)
    setResponse('')

    try {
      // Simulate AI generation - replace with actual API call
      const startTime = Date.now()
      
      // Simulate typing effect
      const simulatedResponse = `# Business Strategy Mastery: Your Blueprint for Exponential Growth

In today's rapidly evolving business landscape, the difference between companies that thrive and those that merely survive lies in their strategic approach to growth. This comprehensive guide will equip you with the essential frameworks, methodologies, and actionable insights needed to transform your entrepreneurial vision into a scalable, profitable enterprise.

## Why Strategy Matters More Than Ever

The modern marketplace is unforgiving to businesses that operate without clear direction. Companies that fail to develop robust strategic foundations often find themselves:

- Reacting to market changes instead of anticipating them
- Struggling with resource allocation and prioritization
- Missing critical growth opportunities
- Facing increased competition without differentiation

This ebook addresses these challenges head-on, providing you with battle-tested strategies used by successful entrepreneurs and Fortune 500 companies alike.

## What You'll Discover

Throughout these pages, you'll learn how to:

1. **Develop Strategic Vision**: Create a compelling long-term vision that guides every business decision
2. **Market Analysis Mastery**: Identify opportunities and threats before your competitors do
3. **Competitive Positioning**: Establish unique value propositions that set you apart
4. **Execution Excellence**: Transform strategic plans into measurable results
5. **Scaling Systems**: Build processes that grow with your business

The strategies outlined in this guide have been refined through real-world application across diverse industries, from tech startups to traditional manufacturing companies.

*Ready to unlock your business's full potential? Let's begin this transformative journey together.*`

      // Simulate streaming response
      let currentText = ''
      const words = simulatedResponse.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        if (!isGenerating) break // Allow cancellation
        
        currentText += (i > 0 ? ' ' : '') + words[i]
        setResponse(currentText)
        
        // Random delay between words to simulate streaming
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 20))
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Add to history
      const historyEntry = {
        id: Date.now(),
        prompt: prompt.trim(),
        response: simulatedResponse,
        service: selectedService,
        parameters: { ...parameters },
        timestamp: new Date().toISOString(),
        duration,
        cost: calculateEstimatedCost()
      }

      setHistory(prev => [historyEntry, ...prev])
      toast.success(`✅ Generated in ${(duration / 1000).toFixed(1)}s`)

    } catch (error) {
      console.error('Generation error:', error)
      toast.error('❌ Generation failed: ' + error.message)
      setResponse('')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStop = () => {
    setIsGenerating(false)
    toast.info('Generation stopped')
  }

  const handleClear = () => {
    setPrompt('')
    setResponse('')
  }

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(response)
    toast.success('Response copied to clipboard')
  }

  const handleDownloadResponse = () => {
    const blob = new Blob([response], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-response-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Response downloaded')
  }

  const handleSaveFlow = async (flowData) => {
    try {
      // Prepare current configuration
      const currentConfig = {
        ...flowData,
        parameters,
        models: { [selectedService]: selectedModels[selectedService] },
        type: currentFlowType
      }

      await flowPersistenceService.saveFlow(currentConfig)
      setShowSaveModal(false)
      
      // Show success message with flow type
      const flowTypeLabel = currentFlowType === 'full' ? 'Comprehensive' : 'Streamlined'
      toast.success(`✅ ${flowTypeLabel} flow "${flowData.name}" saved!`)
      
    } catch (error) {
      console.error('Error saving flow:', error)
      toast.error('Failed to save flow')
    }
  }

  const availableServices = Object.keys(aiServices).filter(service => aiServices[service]?.success)
  const tokenContext = getTokenRealWorldContext(parameters.maxTokens)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">🎮 AI Playground</h2>
          <p className="text-gray-400 mt-1">Test and experiment with AI models in real-time</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Flow Type Selector */}
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setCurrentFlowType('simplified')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                currentFlowType === 'simplified'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Streamlined</span>
            </button>
            <button
              onClick={() => setCurrentFlowType('full')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                currentFlowType === 'full'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Comprehensive</span>
            </button>
          </div>

          {/* Save Flow Button */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Flow</span>
          </button>
          
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2 text-green-300">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{availableServices.length} services ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Type Indicator */}
      <div className={`p-4 rounded-xl border ${
        currentFlowType === 'full'
          ? 'bg-blue-900/20 border-blue-700/50'
          : 'bg-green-900/20 border-green-700/50'
      }`}>
        <div className="flex items-center space-x-3">
          {currentFlowType === 'full' ? (
            <Crown className="w-6 h-6 text-blue-400" />
          ) : (
            <Zap className="w-6 h-6 text-green-400" />
          )}
          <div>
            <h3 className={`font-semibold ${
              currentFlowType === 'full' ? 'text-blue-300' : 'text-green-300'
            }`}>
              {currentFlowType === 'full' ? 'Comprehensive Flow Mode' : 'Streamlined Flow Mode'}
            </h3>
            <p className="text-sm text-gray-400">
              {currentFlowType === 'full' 
                ? 'Configure for detailed 7-step book generation process'
                : 'Configure for efficient 2-step book generation process'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Service Selection */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Service</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  {availableServices.map(service => (
                    <option key={service} value={service}>
                      {service.charAt(0).toUpperCase() + service.slice(1)} 
                      ({allModels[service]?.length || 0} models)
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Selection */}
              {allModels[selectedService] && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model
                  </label>
                  <select
                    value={selectedModels[selectedService] || ''}
                    onChange={(e) => onModelSelection(selectedService, e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    {allModels[selectedService].map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Parameters</h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
              >
                <Sliders className="w-4 h-4" />
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Temperature */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <label className="text-sm font-medium text-gray-300">Temperature</label>
                  <TooltipIcon param="temperature" />
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={parameters.temperature}
                  onChange={(e) => setParameters(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Focused</span>
                  <span className="text-white font-medium">{parameters.temperature}</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <label className="text-sm font-medium text-gray-300">Max Tokens</label>
                  <TooltipIcon param="maxTokens" />
                </div>
                <input
                  type="range"
                  min="100"
                  max="8000"
                  step="100"
                  value={parameters.maxTokens}
                  onChange={(e) => setParameters(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Short</span>
                  <span className="text-white font-medium">{parameters.maxTokens}</span>
                  <span>Long</span>
                </div>
                
                {/* Real World Context */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded p-2 text-center">
                    <div className="text-xs text-blue-300">Words</div>
                    <div className="text-sm font-bold text-white">{tokenContext.words}</div>
                  </div>
                  <div className="bg-green-900/20 border border-green-700/50 rounded p-2 text-center">
                    <div className="text-xs text-green-300">Pages</div>
                    <div className="text-sm font-bold text-white">{tokenContext.pages}</div>
                  </div>
                </div>
              </div>

              {/* Advanced Parameters */}
              {showAdvanced && (
                <>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-300">Top P</label>
                      <TooltipIcon param="topP" />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={parameters.topP}
                      onChange={(e) => setParameters(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-white font-medium">{parameters.topP}</div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-300">Frequency Penalty</label>
                      <TooltipIcon param="frequencyPenalty" />
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={parameters.frequencyPenalty}
                      onChange={(e) => setParameters(prev => ({ ...prev, frequencyPenalty: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-white font-medium">{parameters.frequencyPenalty}</div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-300">Presence Penalty</label>
                      <TooltipIcon param="presencePenalty" />
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={parameters.presencePenalty}
                      onChange={(e) => setParameters(prev => ({ ...prev, presencePenalty: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-white font-medium">{parameters.presencePenalty}</div>
                  </div>
                </>
              )}
            </div>

            {/* Cost Estimate */}
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded">
              <div className="flex items-center space-x-2 text-yellow-300">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">
                  Estimated cost: <strong>${calculateEstimatedCost()}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Playground */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt Input */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Prompt</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClear}
                  className="text-gray-400 hover:text-white p-2"
                  title="Clear"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here... (e.g., Write a compelling introduction for a business strategy ebook)"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            />

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-400">
                {prompt.length} characters
              </div>
              
              <div className="flex items-center space-x-3">
                {isGenerating ? (
                  <button
                    onClick={handleStop}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || !aiServices[selectedService]?.success}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                    <span>Generate</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Response</h3>
              
              {response && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyResponse}
                    className="text-gray-400 hover:text-white p-2"
                    title="Copy Response"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleDownloadResponse}
                    className="text-gray-400 hover:text-white p-2"
                    title="Download Response"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-[300px] bg-gray-900 border border-gray-600 rounded-lg p-4">
              {isGenerating && (
                <div className="flex items-center space-x-2 text-blue-400 mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating response...</span>
                </div>
              )}
              
              {response ? (
                <div className="text-white whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {response}
                  {isGenerating && <span className="animate-pulse">|</span>}
                </div>
              ) : !isGenerating ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Response will appear here</p>
                    <p className="text-sm">Enter a prompt and click Generate to start</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Generations</h3>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {history.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-white capitalize">{entry.service}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{(entry.duration / 1000).toFixed(1)}s</span>
                        <span>${entry.cost}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 truncate">{entry.prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Flow Modal */}
      <FlowSaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveFlow}
        flowType={currentFlowType}
        parameters={parameters}
        models={{ [selectedService]: selectedModels[selectedService] }}
      />
    </div>
  )
}

export default AIPlayground

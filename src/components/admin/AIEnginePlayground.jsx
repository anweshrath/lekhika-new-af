import React, { useState, useRef, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Save, 
  Download, 
  Upload, 
  Trash2,
  Settings,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Image as ImageIcon,
  Languages,
  Mic,
  FileText,
  Video,
  Music,
  Code,
  Database,
  Globe,
  Mail,
  MessageSquare,
  PenTool,
  Scissors,
  Palette,
  Camera,
  Headphones,
  BookOpen,
  Calculator,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Hash,
  Type,
  AlignLeft,
  Layers,
  Grid,
  Move,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react'
import ProcessStepModal from '../SuperAdmin/ProcessStepModal'

const AIEnginePlayground = () => {
  const [canvasCards, setCanvasCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [draggedCard, setDraggedCard] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [cardConfigurations, setCardConfigurations] = useState({})
  const [canvasConnections, setCanvasConnections] = useState([])
  const [isDraggingFromLibrary, setIsDraggingFromLibrary] = useState(false)
  const canvasRef = useRef(null)

  // 20+ Premade Process Cards
  const premadeCards = [
    // Content Generation
    { id: 'text-generation', name: 'Text Generation', description: 'Generate written content', icon: PenTool, color: 'blue', category: 'content', estimatedTokens: 2000, recommendedServices: ['openai', 'claude', 'gemini'] },
    { id: 'image-generation', name: 'Image Generation', description: 'Create AI-generated images', icon: ImageIcon, color: 'purple', category: 'content', estimatedTokens: 1000, recommendedServices: ['openai', 'gemini'] },
    { id: 'video-generation', name: 'Video Generation', description: 'Generate video content', icon: Video, color: 'red', category: 'content', estimatedTokens: 3000, recommendedServices: ['openai', 'gemini'] },
    { id: 'audio-generation', name: 'Audio Generation', description: 'Create audio content', icon: Music, color: 'green', category: 'content', estimatedTokens: 1500, recommendedServices: ['openai'] },
    
    // Language Processing
    { id: 'translation', name: 'Translation', description: 'Translate text between languages', icon: Languages, color: 'indigo', category: 'language', estimatedTokens: 1200, recommendedServices: ['openai', 'claude', 'gemini'] },
    { id: 'text-to-speech', name: 'Text-to-Speech', description: 'Convert text to spoken audio', icon: Mic, color: 'pink', category: 'language', estimatedTokens: 800, recommendedServices: ['openai'] },
    { id: 'speech-to-text', name: 'Speech-to-Text', description: 'Convert audio to text', icon: Headphones, color: 'yellow', category: 'language', estimatedTokens: 1000, recommendedServices: ['openai'] },
    { id: 'sentiment-analysis', name: 'Sentiment Analysis', description: 'Analyze emotional tone', icon: TrendingUp, color: 'orange', category: 'language', estimatedTokens: 500, recommendedServices: ['openai', 'claude'] },
    
    // Document Processing
    { id: 'ocr', name: 'OCR (Text Recognition)', description: 'Extract text from images', icon: FileText, color: 'teal', category: 'document', estimatedTokens: 800, recommendedServices: ['openai', 'gemini'] },
    { id: 'pdf-processing', name: 'PDF Processing', description: 'Extract and process PDF content', icon: BookOpen, color: 'cyan', category: 'document', estimatedTokens: 1500, recommendedServices: ['claude', 'openai'] },
    { id: 'document-summarization', name: 'Document Summarization', description: 'Create concise summaries', icon: AlignLeft, color: 'lime', category: 'document', estimatedTokens: 1800, recommendedServices: ['claude', 'openai', 'gemini'] },
    { id: 'content-extraction', name: 'Content Extraction', description: 'Extract specific data from documents', icon: Scissors, color: 'amber', category: 'document', estimatedTokens: 1200, recommendedServices: ['claude', 'openai'] },
    
    // Data Analysis
    { id: 'data-analysis', name: 'Data Analysis', description: 'Analyze datasets and patterns', icon: BarChart3, color: 'emerald', category: 'analysis', estimatedTokens: 2500, recommendedServices: ['claude', 'openai'] },
    { id: 'chart-generation', name: 'Chart Generation', description: 'Create data visualizations', icon: PieChart, color: 'violet', category: 'analysis', estimatedTokens: 1000, recommendedServices: ['openai', 'claude'] },
    { id: 'trend-analysis', name: 'Trend Analysis', description: 'Identify patterns and trends', icon: LineChart, color: 'rose', category: 'analysis', estimatedTokens: 2000, recommendedServices: ['claude', 'perplexity'] },
    { id: 'statistical-analysis', name: 'Statistical Analysis', description: 'Perform statistical calculations', icon: Calculator, color: 'sky', category: 'analysis', estimatedTokens: 1500, recommendedServices: ['claude', 'openai'] },
    
    // Communication
    { id: 'email-generation', name: 'Email Generation', description: 'Create professional emails', icon: Mail, color: 'slate', category: 'communication', estimatedTokens: 800, recommendedServices: ['openai', 'claude'] },
    { id: 'chatbot-response', name: 'Chatbot Response', description: 'Generate conversational responses', icon: MessageSquare, color: 'zinc', category: 'communication', estimatedTokens: 600, recommendedServices: ['openai', 'claude', 'gemini'] },
    { id: 'social-media-post', name: 'Social Media Post', description: 'Create social media content', icon: Hash, color: 'neutral', category: 'communication', estimatedTokens: 400, recommendedServices: ['openai', 'gemini'] },
    
    // Code & Development
    { id: 'code-generation', name: 'Code Generation', description: 'Generate programming code', icon: Code, color: 'stone', category: 'development', estimatedTokens: 2000, recommendedServices: ['openai', 'claude'] },
    { id: 'code-review', name: 'Code Review', description: 'Review and analyze code', icon: Eye, color: 'red', category: 'development', estimatedTokens: 1500, recommendedServices: ['claude', 'openai'] },
    { id: 'api-documentation', name: 'API Documentation', description: 'Generate API documentation', icon: Database, color: 'blue', category: 'development', estimatedTokens: 1800, recommendedServices: ['claude', 'openai'] },
    
    // Specialized
    { id: 'web-scraping', name: 'Web Scraping', description: 'Extract data from websites', icon: Globe, color: 'green', category: 'specialized', estimatedTokens: 1200, recommendedServices: ['perplexity', 'openai'] },
    { id: 'calendar-scheduling', name: 'Calendar Scheduling', description: 'Schedule and manage events', icon: Calendar, color: 'purple', category: 'specialized', estimatedTokens: 600, recommendedServices: ['openai', 'claude'] },
    { id: 'time-tracking', name: 'Time Tracking', description: 'Track and analyze time usage', icon: Clock, color: 'orange', category: 'specialized', estimatedTokens: 800, recommendedServices: ['openai', 'claude'] }
  ]

  const categories = [
    { id: 'all', name: 'All Cards', count: premadeCards.length },
    { id: 'content', name: 'Content Generation', count: premadeCards.filter(c => c.category === 'content').length },
    { id: 'language', name: 'Language Processing', count: premadeCards.filter(c => c.category === 'language').length },
    { id: 'document', name: 'Document Processing', count: premadeCards.filter(c => c.category === 'document').length },
    { id: 'analysis', name: 'Data Analysis', count: premadeCards.filter(c => c.category === 'analysis').length },
    { id: 'communication', name: 'Communication', count: premadeCards.filter(c => c.category === 'communication').length },
    { id: 'development', name: 'Code & Development', count: premadeCards.filter(c => c.category === 'development').length },
    { id: 'specialized', name: 'Specialized', count: premadeCards.filter(c => c.category === 'specialized').length }
  ]

  const filteredCards = premadeCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDragStart = (e, card) => {
    setDraggedCard(card)
    setIsDraggingFromLibrary(true)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    setIsDraggingFromLibrary(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    
    if (!draggedCard || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - canvasRect.left
    const y = e.clientY - canvasRect.top

    const newCanvasCard = {
      ...draggedCard,
      canvasId: `canvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: { x: Math.max(0, x - 100), y: Math.max(0, y - 50) },
      configured: false
    }

    setCanvasCards(prev => [...prev, newCanvasCard])
    setDraggedCard(null)
    setIsDraggingFromLibrary(false)
  }, [draggedCard])

  const handleCardMove = (cardId, newPosition) => {
    setCanvasCards(prev => prev.map(card => 
      card.canvasId === cardId 
        ? { ...card, position: newPosition }
        : card
    ))
  }

  const handleCardConfigure = (card) => {
    setSelectedCard(card)
  }

  const handleCardConfiguration = (cardId, configuration) => {
    setCardConfigurations(prev => ({
      ...prev,
      [cardId]: configuration
    }))
    
    setCanvasCards(prev => prev.map(card => 
      card.canvasId === cardId 
        ? { ...card, configured: true }
        : card
    ))
  }

  const handleDeleteCard = (cardId) => {
    setCanvasCards(prev => prev.filter(card => card.canvasId !== cardId))
    setCardConfigurations(prev => {
      const newConfig = { ...prev }
      delete newConfig[cardId]
      return newConfig
    })
  }

  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
      setCanvasCards([])
      setCardConfigurations({})
      setCanvasConnections([])
    }
  }

  const handleSaveFlow = () => {
    const flowData = {
      cards: canvasCards,
      configurations: cardConfigurations,
      connections: canvasConnections,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `custom-flow-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getCardStatus = (card) => {
    const config = cardConfigurations[card.canvasId]
    if (!config) return 'unconfigured'
    
    // Mock service status - in real implementation, this would check actual service status
    const mockServiceStatus = {
      openai: { valid: true },
      claude: { valid: true },
      gemini: { valid: true },
      mistral: { valid: true },
      grok: { valid: false },
      perplexity: { valid: true }
    }
    
    const workingModels = config.models?.filter(model => 
      mockServiceStatus[model.service]?.valid
    ).length || 0
    
    if (workingModels === 0) return 'error'
    if (workingModels < (config.models?.length || 0)) return 'warning'
    return 'ready'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'border-green-500 bg-green-900/20'
      case 'warning': return 'border-yellow-500 bg-yellow-900/20'
      case 'error': return 'border-red-500 bg-red-900/20'
      default: return 'border-gray-600 bg-gray-700'
    }
  }

  const DraggableCanvasCard = ({ card }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const status = getCardStatus(card)
    const Icon = card.icon

    const handleMouseDown = (e) => {
      if (e.target.closest('.card-action-button')) return
      
      setIsDragging(true)
      setDragStart({
        x: e.clientX - card.position.x,
        y: e.clientY - card.position.y
      })
    }

    const handleMouseMove = useCallback((e) => {
      if (!isDragging) return
      
      const newPosition = {
        x: Math.max(0, e.clientX - dragStart.x),
        y: Math.max(0, e.clientY - dragStart.y)
      }
      
      handleCardMove(card.canvasId, newPosition)
    }, [isDragging, dragStart, card.canvasId])

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, handleMouseMove])

    return (
      <div
        className={`absolute bg-gray-800 rounded-lg border-2 p-3 cursor-move select-none transition-all ${
          getStatusColor(status)
        } ${isDragging ? 'shadow-2xl scale-105 z-50' : 'hover:shadow-lg z-10'}`}
        style={{
          left: card.position.x,
          top: card.position.y,
          width: '180px',
          minHeight: '100px'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900/20 flex items-center justify-center`}>
              <Icon className={`w-3 h-3 text-${card.color}-600`} />
            </div>
            <div>
              <h4 className="font-medium text-white text-xs">{card.name}</h4>
            </div>
          </div>
          
          <button
            className="card-action-button text-red-400 hover:text-red-300 p-1"
            onClick={() => handleDeleteCard(card.canvasId)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Description */}
        <p className="text-gray-400 text-xs mb-3">{card.description}</p>

        {/* Card Stats */}
        <div className="flex justify-between text-xs mb-3">
          <span className="text-gray-500">
            {(card.estimatedTokens/1000).toFixed(1)}k tokens
          </span>
          <span className={`font-medium ${
            status === 'ready' ? 'text-green-400' :
            status === 'warning' ? 'text-yellow-400' :
            status === 'error' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {status === 'ready' ? 'Ready' :
             status === 'warning' ? 'Warning' :
             status === 'error' ? 'Error' :
             'Not Configured'}
          </span>
        </div>

        {/* Configure Button */}
        <button
          className="card-action-button w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
          onClick={() => handleCardConfigure(card)}
        >
          <Settings className="w-3 h-3 inline mr-1" />
          {card.configured ? 'Edit Config' : 'Configure'}
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-900 text-white overflow-hidden">
      {/* Left Sidebar - Card Library */}
      <div className="w-80 lg:w-80 md:w-72 sm:w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold mb-4 truncate">🎮 Content Flows</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search process cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-[1.02] ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate pr-2">{category.name}</span>
                  <span className="text-xs opacity-75 flex-shrink-0">{category.count}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cards List */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 scroll-smooth">
          <div className="space-y-3">
            {filteredCards.map(card => {
              const Icon = card.icon
              return (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card)}
                  onDragEnd={handleDragEnd}
                  className="bg-gray-700 rounded-lg p-4 cursor-grab active:cursor-grabbing hover:bg-gray-600 transition-all duration-200 border border-gray-600 hover:border-gray-500 hover:shadow-lg transform hover:scale-[1.02] hover:-translate-y-0.5 group"
                >
                  <div className="flex items-start space-x-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`w-4 h-4 text-${card.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm truncate group-hover:text-blue-300 transition-colors duration-200" title={card.name}>
                        {card.name}
                      </h4>
                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed" title={card.description}>
                        {card.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 capitalize truncate pr-2" title={card.category}>
                      {card.category}
                    </span>
                    <span className="text-gray-400 flex-shrink-0">
                      {(card.estimatedTokens/1000).toFixed(1)}k tokens
                    </span>
                  </div>

                  {/* Drag Indicator */}
                  <div className="mt-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Move className="w-3 h-3" />
                      <span>Drag to canvas</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* No Results State */}
          {filteredCards.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No cards found</p>
              <p className="text-xs">Try adjusting your search or category filter</p>
            </div>
          )}

          {/* Create New Card Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full mt-4 p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center space-x-2 group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="truncate">Create New Card</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              <h3 className="text-lg font-semibold truncate">Canvas Flow Builder</h3>
              <div className="text-sm text-gray-400 hidden sm:block">
                {canvasCards.length} cards • {Object.keys(cardConfigurations).length} configured
              </div>
            </div>
            
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={handleSaveFlow}
                disabled={canvasCards.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save Flow</span>
              </button>
              
              <button
                onClick={handleClearCanvas}
                disabled={canvasCards.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className={`w-full h-full bg-gray-900 relative transition-all duration-300 ${
              isDraggingFromLibrary ? 'bg-gray-800 ring-2 ring-blue-500/50' : ''
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              backgroundImage: `
                radial-gradient(circle, #374151 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            {/* Canvas Cards */}
            {canvasCards.map(card => (
              <DraggableCanvasCard key={card.canvasId} card={card} />
            ))}

            {/* Empty State */}
            {canvasCards.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500 max-w-md mx-auto px-4">
                  <Grid className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Empty Canvas</h3>
                  <p className="text-sm mb-4">Drag process cards from the sidebar to start building your flow</p>
                  <div className="flex items-center justify-center space-x-2 text-xs">
                    <Move className="w-4 h-4" />
                    <span>Drag cards here to create your custom workflow</span>
                  </div>
                </div>
              </div>
            )}

            {/* Drop Zone Indicator */}
            {isDraggingFromLibrary && (
              <div className="absolute inset-4 border-2 border-dashed border-blue-500 rounded-xl bg-blue-500/5 flex items-center justify-center pointer-events-none">
                <div className="text-center text-blue-400">
                  <Plus className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg font-medium">Drop card here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {selectedCard && (
        <ProcessStepModal
          step={{
            ...selectedCard,
            id: selectedCard.canvasId,
            purpose: `Configure ${selectedCard.name} process: ${selectedCard.description}. Set up AI models and parameters for optimal performance.`
          }}
          serviceStatus={{
            openai: { valid: true },
            claude: { valid: true },
            gemini: { valid: true },
            mistral: { valid: true },
            grok: { valid: false },
            perplexity: { valid: true }
          }}
          existingConfiguration={cardConfigurations[selectedCard.canvasId]}
          onClose={() => setSelectedCard(null)}
          onSave={(config) => {
            handleCardConfiguration(selectedCard.canvasId, config)
            setSelectedCard(null)
          }}
        />
      )}

      {/* Create New Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create New Process Card</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center py-8 text-gray-400">
              <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Custom card creation coming soon!</p>
              <p className="text-sm">This feature will allow you to create custom process cards with your own parameters.</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIEnginePlayground

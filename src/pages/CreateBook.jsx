import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Star, 
  Play, 
  Zap, 
  ArrowRight,
  Loader2,
  Sparkles,
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Palette,
  Settings
} from 'lucide-react'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { dbService } from '../services/database'
import { tokenPredictionService } from '../services/tokenPredictionService'
import UltraButton from '../components/UltraButton'
import UltraCard from '../components/UltraCard'
import UltraLoader from '../components/UltraLoader'
import TemplateSelector from '../components/TemplateSelector'
import { ultraToast } from '../utils/ultraToast'

const CreateBook = () => {
  const { user } = useUserAuth()
  const { isDark } = useTheme()
  
  // State
  const [goToEngines, setGoToEngines] = useState([])
  const [defaultEngines, setDefaultEngines] = useState([])
  const [allEngines, setAllEngines] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const [tokenFilter, setTokenFilter] = useState('all') // all, low, medium, high
  const [showAllEngines, setShowAllEngines] = useState(false)
  
  // Template Selection State
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedEngine, setSelectedEngine] = useState(null)

  useEffect(() => {
    if (user?.id) {
      loadEngines()
    }
  }, [user?.id])

  const loadEngines = async () => {
    try {
      setLoading(true)
      
      // Load Go To engines, default engines, and all engines
      const [goToData, defaultData, allEnginesData] = await Promise.all([
        dbService.getGoToEngines(user.id),
        dbService.getDefaultEngines(user.id),
        dbService.getAllUserEnginesWithGoToStatus(user.id)
      ])
      
      setGoToEngines(goToData)
      setDefaultEngines(defaultData)
      setAllEngines(allEnginesData)
      
      // Load token predictions for all engines
      await loadTokenPredictions(allEnginesData)
      
    } catch (error) {
      console.error('Error loading engines:', error)
      ultraToast.error('Failed to load engines')
    } finally {
      setLoading(false)
    }
  }

  const loadTokenPredictions = async (engines) => {
    try {
      setLoadingPredictions(true)
      
      // Load predictions for each engine
      const enginesWithPredictions = await Promise.all(
        engines.map(async (userEngine) => {
          const engine = userEngine.engine || userEngine.ai_engines
          const prediction = await tokenPredictionService.getTokenPrediction(engine, user.id)
          
          return {
            ...userEngine,
            tokenPrediction: prediction
          }
        })
      )
      
      // Update state with predictions
      setGoToEngines(enginesWithPredictions.filter(e => e.is_go_to))
      setDefaultEngines(enginesWithPredictions.filter(e => e.is_default))
      setAllEngines(enginesWithPredictions)
      
    } catch (error) {
      console.error('Error loading token predictions:', error)
      ultraToast.error('Failed to load token predictions')
    } finally {
      setLoadingPredictions(false)
    }
  }

  const toggleGoToEngine = async (userEngine) => {
    try {
      if (userEngine.is_go_to) {
        // Remove from Go To
        await dbService.removeEngineFromGoTo(userEngine.id, user.id)
        ultraToast.success('Removed from Go To engines')
      } else {
        // Add to Go To
        await dbService.setEngineAsGoTo(userEngine.id, user.id)
        ultraToast.success('Added to Go To engines')
      }
      
      // Reload engines
      await loadEngines()
      
    } catch (error) {
      console.error('Error toggling Go To engine:', error)
      ultraToast.error(error.message || 'Failed to update Go To engines')
    }
  }

  const getTokenFilteredEngines = () => {
    const engines = showAllEngines ? allEngines : goToEngines
    
    if (tokenFilter === 'all') return engines
    
    return engines.filter(engine => {
      const tokens = engine.tokenPrediction?.tokens || 0
      
      switch (tokenFilter) {
        case 'low': return tokens <= 1000
        case 'medium': return tokens > 1000 && tokens <= 5000
        case 'high': return tokens > 5000
        default: return true
      }
    })
  }

  const getTokenBadgeColor = (tokens) => {
    if (tokens <= 1000) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    if (tokens <= 5000) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }

  // Template Selection Handlers
  const handleTemplateSelect = (templateId, size) => {
    setSelectedTemplate({ id: templateId, size })
    ultraToast.success('Template selected! Ready to generate.')
  }

  const handleStartGeneration = (engine) => {
    if (!selectedTemplate) {
      setSelectedEngine(engine)
      setShowTemplateSelector(true)
      return
    }
    
    // Start generation with selected template
    startGenerationWithTemplate(engine, selectedTemplate)
  }

  const startGenerationWithTemplate = async (engine, template) => {
    try {
      ultraToast.info(`Starting generation with ${engine.name} using ${template.id} template...`)
      // TODO: Integrate with actual generation service
      console.log('Starting generation:', { engine, template })
    } catch (error) {
      console.error('Error starting generation:', error)
      ultraToast.error('Failed to start generation')
    }
  }


  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'high': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'medium': return <Target className="w-4 h-4 text-yellow-500" />
      case 'low': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="text-center">
          <UltraLoader type="pulse" size="lg" />
          <p className="mt-4" style={{ color: 'var(--color-text-muted)' }}>Loading your engines...</p>
        </div>
      </div>
    )
  }

  const filteredEngines = getTokenFilteredEngines()

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-4 text-gradient">
            🚀 Your Go To AI Engines
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Choose your preferred AI engine to create amazing content with token predictions
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <UltraButton
              onClick={() => setShowAllEngines(!showAllEngines)}
              variant={showAllEngines ? 'primary' : 'secondary'}
              icon={showAllEngines ? Star : Brain}
            >
              {showAllEngines ? 'Show Go To Only' : 'Show All Engines'}
            </UltraButton>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Filter by tokens:</span>
              <select
                value={tokenFilter}
                onChange={(e) => setTokenFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-primary-500 transition-all"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
              >
                <option value="all">All</option>
                <option value="low">Low (≤1K tokens)</option>
                <option value="medium">Medium (1K-5K tokens)</option>
                <option value="high">High (&gt;5K tokens)</option>
              </select>
            </div>
          </div>

          {loadingPredictions && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--theme-primary)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading predictions...</span>
            </div>
          )}
        </motion.div>

        {/* Default Engines - Recommended Section */}
        {defaultEngines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                  Recommended Engines
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Our top recommended engines for the best results
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {defaultEngines.slice(0, 2).map((userEngine, index) => {
                const engine = userEngine.engine || userEngine.ai_engines
                const prediction = userEngine.tokenPrediction
                
                return (
                  <motion.div
                    key={userEngine.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <UltraCard 
                      className="p-6 cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden"
                      onClick={() => {
                        window.location.href = `/app/studio?engine=${userEngine.id}`
                      }}
                    >
                      {/* Gradient border effect for default engines */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-20 rounded-lg" />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3 fill-white" />
                                Default #{userEngine.default_order}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                                {engine?.tier || 'Pro'}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                              {userEngine.name}
                            </h3>
                            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                              {userEngine.description || engine?.description || 'AI-powered content generation'}
                            </p>
                          </div>
                        </div>
                        
                        {prediction && (
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                  Est. Tokens
                                </div>
                                <div className={`text-lg font-bold ${getTokenBadgeColor(prediction.tokens)}`}>
                                  {prediction.tokens?.toLocaleString() || 'N/A'}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                  Est. Cost
                                </div>
                                <div className="text-lg font-bold" style={{ color: 'var(--theme-success)' }}>
                                  ${prediction.cost?.toFixed(4) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <UltraButton
                          variant="primary"
                          className="w-full"
                          icon={Play}
                        >
                          Start Creating
                        </UltraButton>
                      </div>
                    </UltraCard>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <UltraCard className="text-center p-6">
            <Star className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--theme-primary)' }} />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {goToEngines.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Go To Engines
            </div>
          </UltraCard>

          <UltraCard className="text-center p-6">
            <Brain className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--theme-secondary)' }} />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {allEngines.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Total Engines
            </div>
          </UltraCard>

          <UltraCard className="text-center p-6">
            <Zap className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--theme-accent)' }} />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {Math.round(goToEngines.reduce((sum, e) => sum + (e.tokenPrediction?.tokens || 0), 0) / Math.max(goToEngines.length, 1))}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Avg Tokens (Go To)
            </div>
          </UltraCard>

          <UltraCard className="text-center p-6">
            <TrendingUp className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--theme-success)' }} />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {filteredEngines.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Filtered Results
            </div>
          </UltraCard>
        </motion.div>

        {/* Engines Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredEngines.map((userEngine, index) => {
            const engine = userEngine.engine || userEngine.ai_engines
            const prediction = userEngine.tokenPrediction
            
            return (
              <motion.div
                key={userEngine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative"
              >
                <UltraCard 
                  className={`p-6 cursor-pointer transition-all duration-300 ${
                    userEngine.is_go_to 
                      ? 'ring-2 ring-primary-500 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20' 
                      : ''
                  }`}
                  onClick={() => {
                    // Navigate to AI Studio with this engine selected
                    window.location.href = `/app/studio?engine=${userEngine.id}`
                  }}
                >
                  {/* Go To Toggle */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleGoToEngine(userEngine)
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                      userEngine.is_go_to 
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star className={`w-5 h-5 ${userEngine.is_go_to ? 'fill-current' : ''}`} />
                  </motion.button>

                  {/* Engine Icon */}
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Brain className="w-8 h-8 text-white" />
                  </div>

                  {/* Engine Info */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                      {userEngine.name}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                      {userEngine.description || engine?.description || 'AI-powered content generation'}
                    </p>
                  </div>

                  {/* Token Prediction */}
                  {prediction && (
                    <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--color-surface-100)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          Token Prediction
                        </span>
                        {getConfidenceIcon(prediction.confidence)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTokenBadgeColor(prediction.tokens)}`}>
                          {prediction.tokens.toLocaleString()} tokens
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {prediction.method === 'historical' ? 'Actual' : 'Estimated'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {userEngine.is_go_to && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs font-medium rounded-full">
                        Go To #{userEngine.go_to_order}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                      {engine?.tier || 'Pro'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <UltraButton
                      variant="primary"
                      className="w-full"
                      icon={Play}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartGeneration(userEngine)
                      }}
                    >
                      {selectedTemplate ? 'Generate with Template' : 'Choose Template & Generate'}
                      <ArrowRight className="w-4 h-4" />
                    </UltraButton>
                    
                    
                    {selectedTemplate && (
                      <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                        <Palette className="w-3 h-3 mr-1" />
                        Template: {selectedTemplate.id}
                      </div>
                    )}
                  </div>
                </UltraCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Empty State */}
        {filteredEngines.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
              <Brain className="w-10 h-10" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              No Engines Found
            </h3>
            <p className="text-lg mb-6" style={{ color: 'var(--color-text-muted)' }}>
              {tokenFilter !== 'all' 
                ? `No engines match your token filter criteria.`
                : showAllEngines 
                  ? 'You don\'t have any engines assigned yet.'
                  : 'You don\'t have any Go To engines yet. Click the star icon to add some!'
              }
            </p>
            {tokenFilter !== 'all' && (
              <UltraButton
                onClick={() => setTokenFilter('all')}
                variant="secondary"
              >
                Clear Filter
              </UltraButton>
            )}
          </motion.div>
        )}
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <TemplateSelector
                mode="pre-generation"
                onTemplateSelect={handleTemplateSelect}
                onClose={() => {
                  setShowTemplateSelector(false)
                  setSelectedEngine(null)
                }}
                showPreview={true}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default CreateBook

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  FileText, 
  Image, 
  CheckCircle, 
  Clock,
  Zap,
  Sparkles,
  Target,
  Layers,
  Wand2
} from 'lucide-react'

const EnhancedProgressIndicator = ({ 
  currentPhase = 'research',
  progress = 0,
  currentAgent = '',
  sectionsComplete = 0,
  totalSections = 0,
  estimatedTimeRemaining = 0
}) => {
  const phases = [
    {
      id: 'research',
      name: 'Research & Analysis',
      icon: Brain,
      color: 'from-blue-400 to-blue-600',
      description: 'AI teams analyzing your requirements'
    },
    {
      id: 'outline',
      name: 'Structure Planning',
      icon: Layers,
      color: 'from-purple-400 to-purple-600',
      description: 'Creating comprehensive book outline'
    },
    {
      id: 'writing',
      name: 'Content Generation',
      icon: FileText,
      color: 'from-green-400 to-green-600',
      description: 'Writing chapters with specialized AI'
    },
    {
      id: 'enhancement',
      name: 'Content Enhancement',
      icon: Sparkles,
      color: 'from-yellow-400 to-orange-500',
      description: 'Polishing and optimizing content'
    },
    {
      id: 'images',
      name: 'Visual Creation',
      icon: Image,
      color: 'from-pink-400 to-red-500',
      description: 'Generating images and graphics'
    },
    {
      id: 'finalization',
      name: 'Final Assembly',
      icon: Target,
      color: 'from-indigo-400 to-purple-500',
      description: 'Assembling your complete book'
    }
  ]

  const currentPhaseIndex = phases.findIndex(phase => phase.id === currentPhase)
  const currentPhaseData = phases[currentPhaseIndex] || phases[0]

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Current Phase Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${currentPhaseData.color} flex items-center justify-center shadow-lg`}
        >
          <currentPhaseData.icon className="w-10 h-10 text-white" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {currentPhaseData.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {currentPhaseData.description}
        </p>
        
        {currentAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {currentAgent}
          </motion.div>
        )}
      </motion.div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Overall Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${currentPhaseData.color} relative`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          
          {/* Progress markers */}
          <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-1">
            {[20, 40, 60, 80].map((marker, index) => (
              <motion.div
                key={marker}
                className={`w-2 h-2 rounded-full ${
                  progress >= marker 
                    ? 'bg-white shadow-lg' 
                    : 'bg-gray-400 dark:bg-gray-600'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: progress >= marker ? 1.2 : 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {phases.map((phase, index) => {
          const isCompleted = index < currentPhaseIndex
          const isCurrent = index === currentPhaseIndex
          const isUpcoming = index > currentPhaseIndex

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-xl border-2 transition-all ${
                isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  : isCurrent
                  ? `bg-gradient-to-r ${phase.color.replace('400', '50').replace('600', '100')} dark:from-${phase.color.split('-')[1]}-900/20 dark:to-${phase.color.split('-')[3]}-900/20 border-${phase.color.split('-')[1]}-200 dark:border-${phase.color.split('-')[1]}-700`
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={isCurrent ? { rotate: 360 } : {}}
                  transition={{ duration: 2, repeat: isCurrent ? Infinity : 0, ease: "linear" }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? `bg-gradient-to-r ${phase.color} text-white`
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <phase.icon className="w-4 h-4" />
                  )}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${
                    isCompleted || isCurrent
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {phase.name}
                  </h4>
                  {isCurrent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-600 dark:text-gray-400 mt-1"
                    >
                      In progress...
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Additional Stats */}
      {(sectionsComplete > 0 || estimatedTimeRemaining > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {sectionsComplete > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
            >
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {sectionsComplete}/{totalSections}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sections Complete
              </div>
            </motion.div>
          )}
          
          {estimatedTimeRemaining > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700"
            >
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-5 h-5 text-orange-600 mr-1" />
                <span className="text-2xl font-bold text-orange-600">
                  {formatTime(estimatedTimeRemaining)}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Est. Remaining
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

export default EnhancedProgressIndicator

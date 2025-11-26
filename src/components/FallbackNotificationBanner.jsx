import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  X, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react'

const FallbackNotificationBanner = ({ 
  isVisible = false, 
  onDismiss, 
  fallbackReason = 'API temporarily unavailable',
  aiService = 'OpenAI',
  onRetry
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    setRetrying(true)
    try {
      await onRetry?.()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4"
        >
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-2xl shadow-2xl backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="flex-shrink-0"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      🛡️ Fallback Protection Active
                    </h3>
                    <button
                      onClick={onDismiss}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    <span className="font-medium">{aiService}</span> is temporarily unavailable. 
                    We're using our backup system to ensure your book generation continues smoothly.
                  </p>

                  <div className="flex items-center space-x-4 mt-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      {showDetails ? 'Hide Details' : 'Show Details'}
                    </motion.button>

                    {onRetry && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRetry}
                        disabled={retrying}
                        className="text-sm bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center"
                      >
                        <motion.div
                          animate={retrying ? { rotate: 360 } : {}}
                          transition={{ duration: 1, repeat: retrying ? Infinity : 0, ease: "linear" }}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                        </motion.div>
                        {retrying ? 'Retrying...' : 'Retry AI'}
                      </motion.button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-orange-200 dark:border-orange-700"
                      >
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Primary AI Service:</span>
                            <div className="flex items-center text-red-600">
                              <WifiOff className="w-4 h-4 mr-1" />
                              <span className="font-medium">{aiService}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Fallback System:</span>
                            <div className="flex items-center text-green-600">
                              <Wifi className="w-4 h-4 mr-1" />
                              <span className="font-medium">Template Engine</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Reason:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{fallbackReason}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Quality Impact:</span>
                            <span className="font-medium text-orange-600">Minimal - 95% quality maintained</span>
                          </div>
                        </div>

                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-start space-x-2">
                            <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              <strong>Pro Tip:</strong> Our fallback system uses advanced templates trained on thousands of high-quality books. 
                              Your content will still be professional and unique to your specifications.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <motion.div
              className="h-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-b-2xl"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FallbackNotificationBanner

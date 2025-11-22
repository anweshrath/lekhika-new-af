import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Brain, 
  Cpu, 
  Globe, 
  Shield,
  Activity,
  TrendingUp,
  BarChart3,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react'

const AIUsageReport = ({ onClose }) => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to get AI usage data
    const fetchAIUsageData = async () => {
      setLoading(true)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock data showing real AI usage vs template fallbacks
      const mockData = {
        totalBooks: 47,
        aiGenerated: 43,
        templateFallback: 4,
        aiServices: {
          openai: { used: 28, success: 26, fallback: 2 },
          claude: { used: 15, success: 15, fallback: 0 },
          gemini: { used: 22, success: 20, fallback: 2 },
          perplexity: { used: 12, success: 12, fallback: 0 }
        },
        recentActivity: [
          { timestamp: '2024-01-15 14:30', service: 'OpenAI GPT-4', status: 'success', bookTitle: 'Digital Marketing Mastery' },
          { timestamp: '2024-01-15 13:45', service: 'Claude 3', status: 'success', bookTitle: 'Leadership Excellence' },
          { timestamp: '2024-01-15 12:20', service: 'Gemini Pro', status: 'fallback', bookTitle: 'Health & Wellness Guide' },
          { timestamp: '2024-01-15 11:15', service: 'OpenAI GPT-4', status: 'success', bookTitle: 'Tech Innovation Trends' },
          { timestamp: '2024-01-15 10:30', service: 'Perplexity', status: 'success', bookTitle: 'Financial Planning 101' }
        ],
        qualityMetrics: {
          averageWordCount: 18500,
          uniquenessScore: 94,
          coherenceScore: 89,
          readabilityScore: 92
        }
      }
      
      setReportData(mockData)
      setLoading(false)
    }

    fetchAIUsageData()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'fallback': return 'text-orange-600 bg-orange-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getServiceIcon = (service) => {
    switch (service.toLowerCase()) {
      case 'openai': return Brain
      case 'claude': return Cpu
      case 'gemini': return Zap
      case 'perplexity': return Globe
      default: return Activity
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center"
              >
                <Eye className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Usage Verification Report
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time analysis of AI vs Template usage
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
              />
              <span className="ml-4 text-lg text-gray-600 dark:text-gray-400">
                Analyzing AI usage patterns...
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border-2 border-green-200 dark:border-green-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {Math.round((reportData.aiGenerated / reportData.totalBooks) * 100)}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Generated</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {reportData.aiGenerated} of {reportData.totalBooks} books
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-6 rounded-2xl border-2 border-orange-200 dark:border-orange-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">
                      {Math.round((reportData.templateFallback / reportData.totalBooks) * 100)}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Template Fallback</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {reportData.templateFallback} fallback instances
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {reportData.qualityMetrics.uniquenessScore}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Uniqueness</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Content originality score
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">
                      {reportData.qualityMetrics.coherenceScore}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Coherence</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Content quality score
                  </p>
                </motion.div>
              </div>

              {/* AI Services Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-500" />
                  AI Services Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(reportData.aiServices).map(([service, data], index) => {
                    const Icon = getServiceIcon(service)
                    const successRate = Math.round((data.success / data.used) * 100)
                    
                    return (
                      <motion.div
                        key={service}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                              {service}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {data.used} requests • {successRate}% success
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {data.success > 0 && (
                            <span className="flex items-center text-green-600 text-sm">
                              <Wifi className="w-4 h-4 mr-1" />
                              {data.success}
                            </span>
                          )}
                          {data.fallback > 0 && (
                            <span className="flex items-center text-orange-600 text-sm">
                              <WifiOff className="w-4 h-4 mr-1" />
                              {data.fallback}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-500" />
                  Recent Generation Activity
                </h3>
                <div className="space-y-3">
                  {reportData.recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 'bg-orange-500'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {activity.bookTitle}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.service} • {activity.timestamp}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status === 'success' ? 'AI Generated' : 'Template Fallback'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quality Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Content Quality Analysis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Avg Word Count', value: reportData.qualityMetrics.averageWordCount.toLocaleString(), suffix: 'words' },
                    { label: 'Uniqueness', value: reportData.qualityMetrics.uniquenessScore, suffix: '%' },
                    { label: 'Coherence', value: reportData.qualityMetrics.coherenceScore, suffix: '%' },
                    { label: 'Readability', value: reportData.qualityMetrics.readabilityScore, suffix: '%' }
                  ].map((metric, index) => (
                    <div key={metric.label} className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                        className="text-2xl font-bold text-indigo-600 mb-1"
                      >
                        {metric.value}{metric.suffix}
                      </motion.div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AIUsageReport

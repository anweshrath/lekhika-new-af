import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader, Zap, Brain, Sparkles } from 'lucide-react'
import { multiLlmService } from '../services/multiLlmService'
import toast from 'react-hot-toast'

const APITestPanel = () => {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState({})

  const testAllAPIs = async () => {
    setTesting(true)
    setResults({})
    
    try {
      toast.loading('Testing all AI services...', { id: 'api-test' })
      
      const testResults = await multiLlmService.testAllConnections()
      setResults(testResults)
      
      const successCount = Object.values(testResults).filter(r => r.success).length
      const totalCount = Object.keys(testResults).length
      
      if (successCount === totalCount) {
        toast.success(`All ${totalCount} AI services connected successfully!`, { id: 'api-test' })
      } else if (successCount > 0) {
        toast.success(`${successCount}/${totalCount} AI services connected`, { id: 'api-test' })
      } else {
        toast.error('No AI services could connect', { id: 'api-test' })
      }
    } catch (error) {
      console.error('API test error:', error)
      toast.error('Failed to test API connections', { id: 'api-test' })
    } finally {
      setTesting(false)
    }
  }

  const serviceIcons = {
    openai: Zap,
    claude: Brain,
    gemini: Sparkles
  }

  const serviceNames = {
    openai: 'OpenAI GPT-4',
    claude: 'Claude 3 Sonnet',
    gemini: 'Gemini Pro'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Services Status
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Test connectivity to all AI services
          </p>
        </div>
        <button
          onClick={testAllAPIs}
          disabled={testing}
          className="btn-primary flex items-center space-x-2"
        >
          {testing ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>{testing ? 'Testing...' : 'Test All APIs'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(serviceNames).map(([key, name]) => {
          const Icon = serviceIcons[key]
          const result = results[key]
          
          return (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  result?.success 
                    ? 'bg-green-100 text-green-600' 
                    : result?.success === false
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {name}
                  </h4>
                  {result?.error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {result.error}
                    </p>
                  )}
                  {result?.response && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {result.response}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                {testing && !result ? (
                  <Loader className="w-5 h-5 animate-spin text-gray-400" />
                ) : result?.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : result?.success === false ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <div className="w-5 h-5 bg-gray-300 rounded-full" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Multi-LLM System Ready
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Your AI services are configured and ready for advanced book generation with multiple AI models working together.
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default APITestPanel

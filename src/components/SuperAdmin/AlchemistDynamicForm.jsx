/**
 * ALCHEMIST DYNAMIC FORM
 * BADASS FORM COMPONENT THAT RENDERS ALL VARIABLES BEAUTIFULLY
 * Boss's Vision: Perfect forms that collect perfect data for perfect content! 🚀
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Brain, Target, Zap, CheckCircle, AlertCircle,
  Lightbulb, TrendingUp, Eye, RefreshCw, Copy, Save
} from 'lucide-react'
import { alchemistVariableProcessor } from '../../services/alchemistVariableProcessor'
import { getAllAlchemistVariables } from '../../data/alchemistVariables'
import toast from 'react-hot-toast'

const AlchemistDynamicForm = ({ 
  nodeType, 
  selectedVariables, 
  customerContext, 
  onDataCollected,
  onValidationChange 
}) => {
  const [formData, setFormData] = useState({})
  const [validationErrors, setValidationErrors] = useState({})
  const [aiSuggestions, setAiSuggestions] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [formConfig, setFormConfig] = useState(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [showAIAssist, setShowAIAssist] = useState({})
  
  const formRef = useRef(null)

  // Generate dynamic form configuration
  useEffect(() => {
    if (selectedVariables?.length > 0) {
      const config = alchemistVariableProcessor.generateDynamicForm(
        nodeType, 
        selectedVariables, 
        customerContext
      )
      setFormConfig(config)
      
      // Initialize form data with smart defaults
      const initialData = {}
      config.fields.forEach(field => {
        if (field.smartDefaults) {
          initialData[field.id] = field.smartDefaults
        }
      })
      setFormData(initialData)
      
      toast.success(`🚀 Dynamic form generated with ${config.fields.length} fields!`)
    }
  }, [selectedVariables, nodeType, customerContext])

  // Calculate completion percentage
  useEffect(() => {
    if (formConfig) {
      const totalFields = formConfig.fields.length
      const completedFields = Object.keys(formData).filter(key => 
        formData[key] && formData[key] !== ''
      ).length
      
      setCompletionPercentage(Math.round((completedFields / totalFields) * 100))
    }
  }, [formData, formConfig])

  // Handle field value change
  const handleFieldChange = async (fieldId, value) => {
    const newFormData = { ...formData, [fieldId]: value }
    setFormData(newFormData)

    // Real-time validation
    const allVariables = getAllAlchemistVariables()
    const variable = allVariables[fieldId]
    
    if (variable) {
      const validation = await import('../../data/alchemistVariables').then(module => 
        module.validateAlchemistVariable(fieldId, value)
      )
      
      setValidationErrors(prev => ({
        ...prev,
        [fieldId]: validation.valid ? null : validation.error
      }))

      // Get AI suggestions for this field
      if (value && value.length > 3) {
        const suggestions = alchemistVariableProcessor.getAISuggestions(fieldId, customerContext)
        setAiSuggestions(prev => ({
          ...prev,
          [fieldId]: suggestions
        }))
      }
    }

    // Notify parent of validation changes
    if (onValidationChange) {
      const hasErrors = Object.values({...validationErrors, [fieldId]: validation?.valid ? null : validation?.error})
        .some(error => error !== null)
      onValidationChange(!hasErrors)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Collect and validate all data
      const results = await alchemistVariableProcessor.collectAndValidateData(
        formConfig.formId,
        formData,
        customerContext
      )

      if (results.success) {
        toast.success('🎯 All data collected and validated successfully!')
        if (onDataCollected) {
          onDataCollected(results)
        }
      } else {
        toast.error(`❌ ${results.errors.length} validation errors found`)
        // Update validation errors
        const newErrors = {}
        results.errors.forEach(error => {
          newErrors[error.field] = error.error
        })
        setValidationErrors(newErrors)
      }

    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('❌ Error submitting form: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Apply AI suggestion
  const applySuggestion = (fieldId, suggestion) => {
    handleFieldChange(fieldId, suggestion)
    toast.success('✨ AI suggestion applied!')
  }

  // Auto-fill with AI
  const autoFillWithAI = async (fieldId) => {
    setIsProcessing(true)
    try {
      // Simulate AI auto-fill (integrate with actual AI later)
      const suggestions = aiSuggestions[fieldId] || []
      if (suggestions.length > 0) {
        handleFieldChange(fieldId, suggestions[0])
        toast.success('🧠 AI auto-filled the field!')
      }
    } catch (error) {
      toast.error('❌ AI auto-fill failed')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!formConfig) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Generating your perfect form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* BADASS FORM HEADER */}
      <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-cyan-900/30 border border-purple-500/40 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Target className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">🚀 Alchemist Data Collection</h2>
            <p className="text-purple-300">AI-powered form for {nodeType.replace('Master', '')} data collection</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-400">{completionPercentage}%</div>
            <div className="text-sm text-cyan-300">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <motion.div 
            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Form Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{formConfig.fields.length}</div>
            <div className="text-xs text-blue-300">Total Fields</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{formConfig.metadata.requiredFields}</div>
            <div className="text-xs text-green-300">Required</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{formConfig.metadata.estimatedCompletionTime}m</div>
            <div className="text-xs text-yellow-300">Est. Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">AI</div>
            <div className="text-xs text-purple-300">Enhanced</div>
          </div>
        </div>
      </div>

      {/* DYNAMIC FORM */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence>
          {formConfig.fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-purple-500/50 transition-colors"
            >
              {/* Field Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <label className="text-lg font-semibold text-white flex items-center gap-2">
                      {field.name}
                      {field.required && <span className="text-red-400">*</span>}
                    </label>
                    {field.aiSuggestions?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAIAssist(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
                        className="p-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-lg transition-colors"
                        title="AI Assist"
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{field.description}</p>
                  {field.instructions && (
                    <p className="text-blue-300 text-xs bg-blue-500/10 p-2 rounded-lg">
                      💡 {field.instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* AI Suggestions Panel */}
              <AnimatePresence>
                {showAIAssist[field.id] && field.aiSuggestions?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4"
                  >
                    <h4 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Suggestions
                    </h4>
                    <div className="space-y-2">
                      {field.aiSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applySuggestion(field.id, suggestion)}
                          className="block w-full text-left p-3 bg-purple-800/30 hover:bg-purple-700/50 text-purple-200 rounded-lg transition-colors text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Field Input */}
              <div className="space-y-3">
                {field.type === 'text' && (
                  <div className="relative">
                    <input
                      type="text"
                      id={field.id}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full p-4 bg-gray-700 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors ${
                        validationErrors[field.id] 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-gray-600 focus:border-purple-500'
                      }`}
                      required={field.required}
                      minLength={field.minLength}
                      maxLength={field.maxLength}
                    />
                    {field.aiSuggestionsEnabled && (
                      <button
                        type="button"
                        onClick={() => autoFillWithAI(field.id)}
                        className="absolute right-3 top-4 p-1 text-purple-400 hover:text-purple-300"
                        title="AI Auto-fill"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {field.type === 'textarea' && (
                  <div className="relative">
                    <textarea
                      id={field.id}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={field.rows || 4}
                      className={`w-full p-4 bg-gray-700 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors resize-vertical ${
                        validationErrors[field.id] 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-gray-600 focus:border-purple-500'
                      }`}
                      required={field.required}
                    />
                    {field.wordCount && formData[field.id] && (
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {formData[field.id].split(' ').length} words
                      </div>
                    )}
                  </div>
                )}

                {field.type === 'select' && (
                  <select
                    id={field.id}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={`w-full p-4 bg-gray-700 border-2 rounded-xl text-white focus:outline-none transition-colors ${
                      validationErrors[field.id] 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-gray-600 focus:border-purple-500'
                    }`}
                    required={field.required}
                  >
                    <option value="">Select {field.name}...</option>
                    {field.options?.map((option, idx) => (
                      <option key={idx} value={option}>{option}</option>
                    ))}
                  </select>
                )}

                {field.type === 'number' && (
                  <div className="relative">
                    <input
                      type="number"
                      id={field.id}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      className={`w-full p-4 bg-gray-700 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors ${
                        validationErrors[field.id] 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-gray-600 focus:border-purple-500'
                      }`}
                      required={field.required}
                    />
                    {field.unit && (
                      <span className="absolute right-4 top-4 text-gray-400 text-sm">
                        {field.unit}
                      </span>
                    )}
                  </div>
                )}

                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id={field.id}
                      checked={formData[field.id] || false}
                      onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-white">{field.name}</span>
                  </label>
                )}

                {/* Validation Error */}
                {validationErrors[field.id] && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors[field.id]}
                  </div>
                )}

                {/* Field Success */}
                {formData[field.id] && !validationErrors[field.id] && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Looks great!
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-8"
        >
          <button
            type="submit"
            disabled={isProcessing || completionPercentage < 100}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              isProcessing || completionPercentage < 100
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transform hover:scale-105'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Processing Data...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                🚀 Generate Amazing Content!
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  )
}

export default AlchemistDynamicForm

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  ArrowRight, 
  Settings, 
  Play, 
  Save,
  Trash2,
  Copy,
  Zap,
  Brain,
  Wand2,
  Target,
  FileText,
  Mail,
  Share2
} from 'lucide-react'

const AIWorkflowBuilder = () => {
  const [workflow, setWorkflow] = useState({
    name: 'My AI Workflow',
    steps: [
      {
        id: 1,
        type: 'input',
        title: 'Content Brief',
        description: 'Define your content requirements',
        config: { fields: ['Topic', 'Audience', 'Tone', 'Length'] }
      }
    ]
  })
  const [selectedStep, setSelectedStep] = useState(null)

  const stepTypes = [
    {
      type: 'research',
      title: 'AI Research',
      description: 'Gather information and insights',
      icon: Brain,
      color: 'blue'
    },
    {
      type: 'generate',
      title: 'Content Generation',
      description: 'Create content using AI',
      icon: Wand2,
      color: 'purple'
    },
    {
      type: 'optimize',
      title: 'SEO Optimization',
      description: 'Optimize for search engines',
      icon: Target,
      color: 'green'
    },
    {
      type: 'format',
      title: 'Format & Style',
      description: 'Apply formatting and styling',
      icon: FileText,
      color: 'orange'
    },
    {
      type: 'distribute',
      title: 'Distribution',
      description: 'Share across platforms',
      icon: Share2,
      color: 'pink'
    }
  ]

  const addStep = (stepType) => {
    const newStep = {
      id: Date.now(),
      type: stepType.type,
      title: stepType.title,
      description: stepType.description,
      config: {}
    }
    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const removeStep = (stepId) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }))
  }

  const runWorkflow = () => {
    // Simulate workflow execution
    console.log('Running workflow:', workflow)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔧 AI Workflow Builder
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create custom AI workflows to automate your content creation
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runWorkflow}
            className="btn-primary"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Workflow
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </motion.button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Workflow Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card">
            <input
              type="text"
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
            />
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            {workflow.steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <div className="card group hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedStep(step)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeStep(step.id)}
                        className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                {index < workflow.steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Add Step Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="card border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 transition-colors cursor-pointer"
            >
              <div className="text-center py-8">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  Add a new step to your workflow
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Step Library */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Available Steps
          </h3>
          <div className="space-y-2">
            {stepTypes.map((stepType) => (
              <motion.div
                key={stepType.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addStep(stepType)}
                className="card cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-${stepType.color}-100 dark:bg-${stepType.color}-900/20 rounded-lg flex items-center justify-center`}>
                    <stepType.icon className={`w-4 h-4 text-${stepType.color}-600`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {stepType.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {stepType.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Configuration Modal */}
      <AnimatePresence>
        {selectedStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedStep(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Configure: {selectedStep.title}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Step Name
                  </label>
                  <input
                    type="text"
                    value={selectedStep.title}
                    className="input-field"
                    onChange={(e) => {
                      const updatedSteps = workflow.steps.map(step =>
                        step.id === selectedStep.id ? { ...step, title: e.target.value } : step
                      )
                      setWorkflow(prev => ({ ...prev, steps: updatedSteps }))
                      setSelectedStep({ ...selectedStep, title: e.target.value })
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={selectedStep.description}
                    className="input-field h-20 resize-none"
                    onChange={(e) => {
                      const updatedSteps = workflow.steps.map(step =>
                        step.id === selectedStep.id ? { ...step, description: e.target.value } : step
                      )
                      setWorkflow(prev => ({ ...prev, steps: updatedSteps }))
                      setSelectedStep({ ...selectedStep, description: e.target.value })
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setSelectedStep(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setSelectedStep(null)}
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AIWorkflowBuilder

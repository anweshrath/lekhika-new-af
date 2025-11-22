import React, { useState } from 'react'
import { X, Plus, Zap, Settings, Target } from 'lucide-react'
// COMMENTED OUT - FAKE ENGINE SERVICE
// import { aiEngineService } from '../../services/aiEngineService'
import toast from 'react-hot-toast'

const CreateEngineModal = ({ onClose, onEngineCreated, serviceStatus }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tier: 'hobby',
    executionMode: 'sequential',
    models: [],
    taskAssignments: [],
    fallbackConfig: {
      enabled: true,
      strategy: 'auto',
      maxRetries: 3,
      retryDelay: 1000
    },
    performanceConfig: {
      timeout: 30000,
      maxConcurrent: 3,
      rateLimiting: true,
      caching: true
    }
  })

  const [selectedModels, setSelectedModels] = useState([])

  const availableServices = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'claude', name: 'Claude', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
    { id: 'gemini', name: 'Google Gemini', models: ['gemini-pro', 'gemini-pro-vision'] },
    { id: 'grok', name: 'GROK', models: ['grok-beta'] },
    { id: 'perplexity', name: 'Perplexity', models: ['llama-3-sonar-large', 'llama-3-sonar-small'] },
    { id: 'mistral', name: 'Mistral', models: ['mistral-large', 'mistral-medium', 'mistral-small'] }
  ]

  const taskTypes = [
    { id: 'research', name: 'Research Generation', description: 'Market research and data gathering' },
    { id: 'outline', name: 'Outline Creation', description: 'Book structure and chapter planning' },
    { id: 'content', name: 'Content Writing', description: 'Chapter and section content generation' },
    { id: 'enhancement', name: 'Content Enhancement', description: 'Improving and refining existing content' },
    { id: 'images', name: 'Image Generation', description: 'Creating visual content and illustrations' }
  ]

  const engineTemplates = [
    {
      id: 'research-focused',
      name: 'Research Focused',
      description: 'Optimized for comprehensive research and data analysis',
      models: [
        { service: 'openai', model: 'gpt-4', config: { temperature: 0.3, maxTokens: 3000 } },
        { service: 'claude', model: 'claude-3-opus', config: { temperature: 0.2, maxTokens: 2500 } },
        { service: 'perplexity', model: 'llama-3-sonar-large', config: { temperature: 0.4, maxTokens: 2000 } }
      ],
      tasks: ['research'],
      executionMode: 'parallel'
    },
    {
      id: 'content-creator',
      name: 'Content Creator',
      description: 'Specialized for high-quality content generation',
      models: [
        { service: 'gemini', model: 'gemini-pro', config: { temperature: 0.7, maxTokens: 2000 } },
        { service: 'openai', model: 'gpt-3.5-turbo', config: { temperature: 0.8, maxTokens: 1500 } }
      ],
      tasks: ['content', 'outline'],
      executionMode: 'sequential'
    },
    {
      id: 'balanced-performer',
      name: 'Balanced Performer',
      description: 'Well-rounded engine for all book creation tasks',
      models: [
        { service: 'openai', model: 'gpt-4', config: { temperature: 0.6, maxTokens: 2500 } },
        { service: 'claude', model: 'claude-3-sonnet', config: { temperature: 0.5, maxTokens: 2000 } },
        { service: 'gemini', model: 'gemini-pro', config: { temperature: 0.7, maxTokens: 1800 } }
      ],
      tasks: ['research', 'content', 'outline', 'enhancement'],
      executionMode: 'hybrid'
    },
    {
      id: 'custom',
      name: 'Custom Engine',
      description: 'Build your own engine from scratch',
      models: [],
      tasks: [],
      executionMode: 'sequential'
    }
  ]

  const handleTemplateSelect = (template) => {
    if (template.id === 'custom') {
      setStep(2)
      return
    }

    const models = template.models.map((model, index) => ({
      id: `${model.service}-${model.model}-${Date.now()}-${index}`,
      service: model.service,
      model: model.model,
      priority: index + 1,
      config: {
        temperature: model.config.temperature,
        maxTokens: model.config.maxTokens,
        topP: 1.0
      }
    }))

    setFormData({
      ...formData,
      models,
      taskAssignments: template.tasks,
      executionMode: template.executionMode
    })

    setStep(3)
  }

  const addModel = (service, model) => {
    const newModel = {
      id: `${service}-${model}-${Date.now()}`,
      service,
      model,
      priority: formData.models.length + 1,
      config: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1.0
      }
    }

    setFormData({
      ...formData,
      models: [...formData.models, newModel]
    })
  }

  const removeModel = (modelId) => {
    setFormData({
      ...formData,
      models: formData.models.filter(m => m.id !== modelId)
    })
  }

  const toggleTask = (taskId) => {
    const tasks = formData.taskAssignments.includes(taskId)
      ? formData.taskAssignments.filter(t => t !== taskId)
      : [...formData.taskAssignments, taskId]
    
    setFormData({ ...formData, taskAssignments: tasks })
  }

  const createEngine = async () => {
    if (!formData.name.trim()) {
      toast.error('Engine name is required')
      return
    }

    if (formData.models.length === 0) {
      toast.error('At least one model is required')
      return
    }

    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // const newEngine = await aiEngineService.createEngine({
      //   ...formData,
      //   active: true
      // })
      // onEngineCreated(newEngine)
      toast.error('This modal uses fake service - create engines via Flow page instead')
      onClose()
    } catch (error) {
      toast.error('Failed to create engine')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create AI Engine</h2>
            <p className="text-gray-600 mt-1">Step {step} of 4</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2 bg-gray-50">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map(stepNum => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    stepNum < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Choose a Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {engineTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 text-left transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      
                      {template.id !== 'custom' && (
                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Zap className="w-3 h-3 mr-1" />
                            <span>{template.models.length} models</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Target className="w-3 h-3 mr-1" />
                            <span>{template.tasks.length} tasks</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engine Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Research Powerhouse"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tier
                    </label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hobby">Hobby</option>
                      <option value="expert">Expert</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what this engine is optimized for..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Execution Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'sequential', label: 'Sequential', desc: 'One model at a time' },
                      { value: 'parallel', label: 'Parallel', desc: 'Multiple models simultaneously' },
                      { value: 'hybrid', label: 'Hybrid', desc: 'Smart combination' }
                    ].map(mode => (
                      <button
                        key={mode.value}
                        onClick={() => setFormData({ ...formData, executionMode: mode.value })}
                        className={`p-3 border rounded-lg text-left ${
                          formData.executionMode === mode.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{mode.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configure Models</h3>
                
                {/* Current Models */}
                {formData.models.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Selected Models</h4>
                    <div className="space-y-3">
                      {formData.models.map(model => (
                        <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              serviceStatus[model.service]?.valid ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <div className="font-medium text-sm">{model.service}</div>
                              <div className="text-xs text-gray-600">{model.model}</div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeModel(model.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Models */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Add Models</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableServices.map(service => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">{service.name}</h5>
                          <div className={`w-2 h-2 rounded-full ${
                            serviceStatus[service.id]?.valid ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                        
                        <div className="space-y-2">
                          {service.models.map(model => (
                            <button
                              key={model}
                              onClick={() => addModel(service.id, model)}
                              disabled={formData.models.some(m => m.service === service.id && m.model === model)}
                              className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {model}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Task Assignments</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {taskTypes.map(task => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        formData.taskAssignments.includes(task.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{task.name}</h4>
                        {formData.taskAssignments.includes(task.id) && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>
          
          <div className="flex items-center space-x-3">
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 2 && !formData.name.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={createEngine}
                disabled={formData.models.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Engine
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateEngineModal

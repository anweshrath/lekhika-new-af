import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Server,
  Zap,
  Activity,
  Cpu,
  Plus,
  Copy,
  Eye,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'

const CreateWorkerModal = ({ isOpen, onClose, onWorkerCreated, workerToClone = null }) => {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [workerConfig, setWorkerConfig] = useState({
    name: '',
    type: 'standard',
    port: '',
    autoAssignPort: true,
    maxConcurrent: 3,
    maxMemory: '3G'
  })
  const [preview, setPreview] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [availablePorts, setAvailablePorts] = useState([])

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
      loadAvailablePorts()
      
      // If cloning, pre-fill with clone source
      if (workerToClone) {
        setWorkerConfig({
          ...workerConfig,
          type: workerToClone.type,
          maxConcurrent: workerToClone.capacity || 3,
          name: `${workerToClone.name}-clone`
        })
      }
    }
  }, [isOpen, workerToClone])

  const loadTemplates = async () => {
    try {
      const response = await fetch('http://103.190.93.28:3001/orchestration/workers/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const loadAvailablePorts = async () => {
    try {
      const response = await fetch('http://103.190.93.28:3001/orchestration/ports/available?limit=20')
      if (response.ok) {
        const data = await response.json()
        setAvailablePorts(data.ports || [])
      }
    } catch (error) {
      console.error('Failed to load available ports:', error)
    }
  }

  const loadPreview = async () => {
    try {
      const config = selectedTemplate 
        ? { template: selectedTemplate.id, ...workerConfig }
        : workerConfig

      const response = await fetch('http://103.190.93.28:3001/orchestration/workers/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        const data = await response.json()
        setPreview(data)
      }
    } catch (error) {
      console.error('Failed to load preview:', error)
    }
  }

  useEffect(() => {
    if (isOpen && (selectedTemplate || workerConfig.name)) {
      const timer = setTimeout(() => {
        loadPreview()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [selectedTemplate, workerConfig, isOpen])

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      let endpoint = 'http://103.190.93.28:3001/orchestration/workers/create'
      let body = workerConfig

      // If cloning
      if (workerToClone) {
        endpoint = `http://103.190.93.28:3001/orchestration/workers/${workerToClone.id}/clone`
        body = {
          name: workerConfig.name,
          port: workerConfig.autoAssignPort ? undefined : workerConfig.port,
          maxConcurrent: workerConfig.maxConcurrent,
          maxMemory: workerConfig.maxMemory
        }
      }
      // If using template
      else if (selectedTemplate) {
        endpoint = 'http://103.190.93.28:3001/orchestration/workers/create-from-template'
        body = {
          template: selectedTemplate.id,
          overrides: {
            name: workerConfig.name || undefined,
            port: workerConfig.autoAssignPort ? undefined : workerConfig.port,
            maxConcurrent: workerConfig.maxConcurrent
          }
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Worker ${result.worker.name} created successfully!`)
        onWorkerCreated(result.worker)
        handleClose()
      } else {
        const error = await response.json()
        toast.error(`Failed to create worker: ${error.error}`)
      }
    } catch (error) {
      toast.error(`Failed to create worker: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setWorkerConfig({
      name: '',
      type: 'standard',
      port: '',
      autoAssignPort: true,
      maxConcurrent: 3,
      maxMemory: '3G'
    })
    setSelectedTemplate(null)
    setPreview(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {workerToClone ? (
                  <>
                    <Copy className="w-6 h-6 text-blue-400" />
                    Clone Worker
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-green-400" />
                    Create New Worker
                  </>
                )}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {workerToClone 
                  ? `Cloning from: ${workerToClone.name}`
                  : 'Choose a template or configure manually'
                }
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Configuration */}
              <div className="space-y-4">
                {/* Templates */}
                {!workerToClone && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Select Template (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplate(template)
                            setWorkerConfig({
                              ...workerConfig,
                              type: template.type,
                              maxConcurrent: template.maxConcurrent,
                              maxMemory: template.maxMemory
                            })
                          }}
                          className={`
                            p-3 rounded-lg border-2 transition-all text-left
                            ${selectedTemplate?.id === template.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {template.type === 'lean' && <Zap className="w-4 h-4 text-green-400" />}
                            {template.type === 'queue' && <Activity className="w-4 h-4 text-teal-400" />}
                            {template.type === 'gpu' && <Cpu className="w-4 h-4 text-purple-400" />}
                            {template.type === 'standard' && <Server className="w-4 h-4 text-blue-400" />}
                            <span className="font-semibold text-white text-sm">{template.name}</span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Worker Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Worker Name {!workerConfig.name && <span className="text-gray-500">(auto-generated)</span>}
                  </label>
                  <input
                    type="text"
                    value={workerConfig.name}
                    onChange={(e) => setWorkerConfig({ ...workerConfig, name: e.target.value })}
                    placeholder="Leave empty for auto-generated name"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Port Configuration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Port Assignment
                  </label>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={workerConfig.autoAssignPort}
                        onChange={() => setWorkerConfig({ ...workerConfig, autoAssignPort: true, port: '' })}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-sm text-gray-300">Auto-assign</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!workerConfig.autoAssignPort}
                        onChange={() => setWorkerConfig({ ...workerConfig, autoAssignPort: false })}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-sm text-gray-300">Manual</span>
                    </label>
                  </div>

                  {!workerConfig.autoAssignPort && (
                    <div>
                      <input
                        type="number"
                        value={workerConfig.port}
                        onChange={(e) => setWorkerConfig({ ...workerConfig, port: parseInt(e.target.value) || '' })}
                        placeholder="Enter port number (3001-3100)"
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Available: {availablePorts.slice(0, 5).join(', ')}...
                      </p>
                    </div>
                  )}
                </div>

                {/* Max Concurrent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Max Concurrent Executions
                  </label>
                  <input
                    type="number"
                    value={workerConfig.maxConcurrent}
                    onChange={(e) => setWorkerConfig({ ...workerConfig, maxConcurrent: parseInt(e.target.value) || 3 })}
                    min="1"
                    max="20"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Range: 1-20 concurrent jobs</p>
                </div>

                {/* Max Memory */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Max Memory Limit
                  </label>
                  <select
                    value={workerConfig.maxMemory}
                    onChange={(e) => setWorkerConfig({ ...workerConfig, maxMemory: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="512M">512 MB</option>
                    <option value="1G">1 GB</option>
                    <option value="2G">2 GB</option>
                    <option value="3G">3 GB</option>
                    <option value="4G">4 GB</option>
                    <option value="8G">8 GB</option>
                  </select>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Preview</h3>
                  </div>

                  {preview && preview.valid ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Name:</span>
                        <span className="text-white font-mono text-sm">{preview.worker.name}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Type:</span>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded">
                          {preview.worker.type}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Port:</span>
                        <span className="text-white font-mono text-sm">:{preview.worker.port}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Script:</span>
                        <span className="text-white font-mono text-xs">{preview.worker.script}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Max Concurrent:</span>
                        <span className="text-white font-mono text-sm">{preview.worker.maxConcurrent}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Memory Limit:</span>
                        <span className="text-white font-mono text-sm">{preview.worker.maxMemory}</span>
                      </div>

                      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <Check className="w-4 h-4" />
                          <span>Configuration valid - ready to create</span>
                        </div>
                      </div>
                    </div>
                  ) : preview && !preview.valid ? (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm font-semibold mb-2">Configuration Errors:</p>
                      <ul className="text-red-300 text-xs space-y-1">
                        {preview.errors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Configure worker to see preview...
                    </p>
                  )}
                </div>

                {/* Selected Template Info */}
                {selectedTemplate && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-300 text-sm mb-2">
                      Using Template: {selectedTemplate.name}
                    </h4>
                    <p className="text-gray-300 text-xs mb-3">
                      {selectedTemplate.description}
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Script:</span>
                        <span className="text-white font-mono">{selectedTemplate.script}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Default Memory:</span>
                        <span className="text-white font-mono">{selectedTemplate.maxMemory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Default Concurrent:</span>
                        <span className="text-white font-mono">{selectedTemplate.maxConcurrent}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={loadPreview}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Refresh Preview
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={isCreating || (preview && !preview.valid)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg disabled:shadow-none flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : workerToClone ? (
                  <>
                    <Copy className="w-4 h-4" />
                    Clone Worker
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Worker
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CreateWorkerModal


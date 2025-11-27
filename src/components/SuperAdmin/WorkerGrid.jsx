import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import WorkerCard from './WorkerCard'
import CreateWorkerModal from './CreateWorkerModal'

const WorkerGrid = () => {
  const [workers, setWorkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [workerToClone, setWorkerToClone] = useState(null)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    loadWorkers()
    loadSuggestions()
    
    let interval = null
    if (autoRefresh) {
      interval = setInterval(() => {
        loadWorkers()
        loadSuggestions()
      }, 30000) // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const loadWorkers = async () => {
    try {
      const response = await fetch('http://103.190.93.28:3001/orchestration/workers')
      if (response.ok) {
        const data = await response.json()
        setWorkers(data.workers || [])
      } else {
        toast.error('Failed to load workers')
      }
    } catch (error) {
      console.error('Failed to load workers:', error)
      toast.error('Failed to connect to orchestration API')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      const response = await fetch('http://103.190.93.28:3001/orchestration/workers/suggestions')
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    }
  }

  const handleStartWorker = async (worker) => {
    try {
      const response = await fetch(
        `http://103.190.93.28:3001/orchestration/pm2/${worker.id}/start`,
        { method: 'POST' }
      )
      if (response.ok) {
        toast.success(`Worker ${worker.name} started`)
        setTimeout(loadWorkers, 2000)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to start worker')
      }
    } catch (error) {
      toast.error(`Failed to start worker: ${error.message}`)
    }
  }

  const handleStopWorker = async (worker) => {
    try {
      if (!confirm(`Stop worker ${worker.name}? Active jobs will be interrupted.`)) {
        return
      }

      const response = await fetch(
        `http://103.190.93.28:3001/orchestration/pm2/${worker.id}/stop`,
        { method: 'POST' }
      )
      if (response.ok) {
        toast.success(`Worker ${worker.name} stopped`)
        setTimeout(loadWorkers, 2000)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to stop worker')
      }
    } catch (error) {
      toast.error(`Failed to stop worker: ${error.message}`)
    }
  }

  const handleRestartWorker = async (worker) => {
    try {
      const response = await fetch(
        `http://103.190.93.28:3001/orchestration/pm2/${worker.id}/restart`,
        { method: 'POST' }
      )
      if (response.ok) {
        toast.success(`Worker ${worker.name} restarted`)
        setTimeout(loadWorkers, 2000)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to restart worker')
      }
    } catch (error) {
      toast.error(`Failed to restart worker: ${error.message}`)
    }
  }

  const handleCloneWorker = (worker) => {
    setWorkerToClone(worker)
    setShowCreateModal(true)
  }

  const handleDeleteWorker = async (worker) => {
    try {
      const response = await fetch(
        `http://103.190.93.28:3001/orchestration/workers/${worker.id}/delete`,
        { method: 'DELETE' }
      )
      if (response.ok) {
        toast.success(`Worker ${worker.name} deleted`)
        loadWorkers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete worker')
      }
    } catch (error) {
      toast.error(`Failed to delete worker: ${error.message}`)
    }
  }

  const handleConfigureWorker = (worker) => {
    toast.info('Worker configuration coming soon!')
    // TODO: Open worker configuration modal
  }

  const handleWorkerCreated = (worker) => {
    toast.success(`Worker ${worker.name} created successfully!`)
    setShowCreateModal(false)
    setWorkerToClone(null)
    loadWorkers()
  }

  const handleQuickCreate = (templateId) => {
    // Quick create with template
    setShowCreateModal(true)
    // Could pre-select template in modal
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Server className="w-7 h-7 text-blue-400" />
            </div>
            Worker Grid
          </h2>
          <p className="text-gray-400 mt-1">
            {workers.length} worker{workers.length !== 1 ? 's' : ''} running
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Refresh Toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span>Auto Refresh</span>
          </label>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadWorkers}
            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>

          {/* Create Worker Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setWorkerToClone(null)
              setShowCreateModal(true)
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Worker
          </motion.button>
        </div>
      </motion.div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-300 mb-2">Smart Suggestions</h3>
              <div className="space-y-2">
                {suggestions.slice(0, 3).map((suggestion, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">{suggestion.reason}</p>
                    {suggestion.type === 'create' && (
                      <button
                        onClick={() => handleQuickCreate(suggestion.template)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-xs font-semibold transition-colors"
                      >
                        Create
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Worker Grid/List */}
      {workers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center"
        >
          <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Workers Found</h3>
          <p className="text-gray-500 mb-6">
            Create your first worker to get started with the orchestration system.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create First Worker
          </motion.button>
        </motion.div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {workers.map((worker, index) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <WorkerCard
                worker={worker}
                onStart={handleStartWorker}
                onStop={handleStopWorker}
                onRestart={handleRestartWorker}
                onClone={handleCloneWorker}
                onDelete={handleDeleteWorker}
                onConfigure={handleConfigureWorker}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Worker Modal */}
      <CreateWorkerModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setWorkerToClone(null)
        }}
        onWorkerCreated={handleWorkerCreated}
        workerToClone={workerToClone}
      />
    </div>
  )
}

export default WorkerGrid


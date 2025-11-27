import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Server,
  Zap,
  Play,
  Square,
  RotateCcw,
  Copy,
  Trash2,
  Settings,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Cpu,
  HardDrive,
  Activity,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

const WorkerCard = ({ worker, onStart, onStop, onRestart, onClone, onDelete, onConfigure }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get status color and icon
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'healthy':
        return 'bg-green-500'
      case 'starting':
      case 'stopping':
        return 'bg-yellow-500 animate-pulse'
      case 'offline':
      case 'stopped':
        return 'bg-gray-500'
      case 'error':
      case 'errored':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />
      case 'error':
      case 'errored':
        return <AlertCircle className="w-4 h-4" />
      case 'starting':
      case 'stopping':
        return <AlertTriangle className="w-4 h-4 animate-pulse" />
      default:
        return <Server className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'lean':
        return <Zap className="w-5 h-5 text-green-400" />
      case 'queue':
        return <Activity className="w-5 h-5 text-teal-400" />
      case 'gpu':
        return <Cpu className="w-5 h-5 text-purple-400" />
      default:
        return <Server className="w-5 h-5 text-blue-400" />
    }
  }

  const formatBytes = (bytes) => {
    if (!bytes) return 'N/A'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const handleAction = async (action, actionFn) => {
    setIsLoading(true)
    setShowMenu(false)
    try {
      await actionFn(worker)
      toast.success(`${action} successful`)
    } catch (error) {
      toast.error(`${action} failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative"
    >
      <div
        className={`
          bg-gradient-to-br from-gray-800 to-gray-900 
          rounded-xl border border-gray-700 
          shadow-lg hover:shadow-xl 
          transition-all duration-300 
          overflow-hidden
          ${worker.status === 'online' ? 'hover:border-blue-500/50' : 'hover:border-gray-600'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getTypeIcon(worker.type)}
              <h3 className="font-bold text-white truncate">{worker.name}</h3>
            </div>
            
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Type & Port Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded">
              {worker.type || 'standard'}
            </span>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded">
              :{worker.port}
            </span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(worker.status)}`}></div>
              <span className="text-xs text-gray-400">{worker.status || 'unknown'}</span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              CPU
            </span>
            <span className="text-white font-mono">{worker.cpu ? `${worker.cpu}%` : 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              Memory
            </span>
            <span className="text-white font-mono">{formatBytes(worker.memory)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Active Jobs
            </span>
            <span className="text-white font-mono">
              {worker.metrics?.activeJobs || 0}/{worker.capacity || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Uptime
            </span>
            <span className="text-white font-mono">{formatUptime(worker.uptime)}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 bg-gray-900/50 border-t border-gray-700/50 flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction('Start', onStart)}
            disabled={worker.status === 'online' || isLoading}
            className="flex-1 p-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <Play className="w-3 h-3" />
            Start
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction('Stop', onStop)}
            disabled={worker.status !== 'online' || isLoading}
            className="flex-1 p-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <Square className="w-3 h-3" />
            Stop
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction('Restart', onRestart)}
            disabled={isLoading}
            className="flex-1 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Restart
          </motion.button>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 right-4 bg-gray-800 rounded-lg border border-gray-700 shadow-2xl z-10 overflow-hidden min-w-[180px]"
            >
              <button
                onClick={() => {
                  setShowMenu(false)
                  onConfigure(worker)
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure
              </button>

              <button
                onClick={() => {
                  setShowMenu(false)
                  onClone(worker)
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Clone Worker
              </button>

              <div className="border-t border-gray-700" />

              <button
                onClick={() => {
                  setShowMenu(false)
                  if (confirm(`Delete worker ${worker.name}? This cannot be undone.`)) {
                    handleAction('Delete', onDelete)
                  }
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Worker
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  )
}

export default WorkerCard


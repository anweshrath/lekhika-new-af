import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Server, 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Power,
  Trash2,
  Download,
  Eye,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Play,
  Square,
  RotateCcw,
  Settings,
  BarChart3,
  Terminal,
  FileText,
  AlertCircle,
  Info,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Copy,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

const WorkerControlDashboard = () => {
  const [workerStatus, setWorkerStatus] = useState({ status: 'loading', error: 'Loading...' })
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [logFilter, setLogFilter] = useState('all') // all, error, info
  const [selectedExecution, setSelectedExecution] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isEmergencyCommandsOpen, setIsEmergencyCommandsOpen] = useState(false)
  const [queueStatus, setQueueStatus] = useState({
    enabled: false,
    stats: null,
    loading: true,
    error: null,
    message: null
  })
  const [queueExecutionId, setQueueExecutionId] = useState('')

  // Worker status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'overloaded': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'overloaded': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />
      default: return <Server className="w-5 h-5 text-gray-400" />
    }
  }

  // Fetch worker status
  const fetchWorkerStatus = async () => {
    try {
      const response = await fetch('http://157.254.24.49:3001/health')
      if (response.ok) {
        const data = await response.json()
        setWorkerStatus(data)
      } else {
        setWorkerStatus({ status: 'error', error: 'Worker not responding' })
      }
    } catch (error) {
      setWorkerStatus({ status: 'error', error: error.message })
    }
  }

  // Fetch queue status (Redis queue)
  const fetchQueueStatus = async () => {
    try {
      const response = await fetch('http://157.254.24.49:3001/queue/stats')
      if (!response.ok) {
        setQueueStatus(prev => ({
          ...prev,
          loading: false,
          error: `HTTP ${response.status}`
        }))
        return
      }

      const data = await response.json()
      setQueueStatus({
        enabled: !!data.enabled,
        stats: data.stats || null,
        loading: false,
        error: null,
        message: data.message || null
      })
    } catch (error) {
      setQueueStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }

  // Fetch worker logs
  const fetchLogs = async () => {
    try {
      // SURGICAL FIX: Add timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      // Try to fetch logs with retry logic
      let response
      let lastError
      
      try {
        response = await fetch('http://157.254.24.49:3001/logs?limit=50', {
          cache: 'no-cache',
          signal: controller.signal,
          mode: 'cors', // Explicitly request CORS
          credentials: 'omit', // Don't send credentials
          headers: {
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      } catch (fetchError) {
        lastError = fetchError
        // Retry once after short delay if network error
        if (fetchError.name !== 'AbortError') {
          await new Promise(resolve => setTimeout(resolve, 1000))
          try {
            response = await fetch('http://157.254.24.49:3001/logs?limit=50', {
              cache: 'no-cache',
              signal: controller.signal,
              mode: 'cors',
              credentials: 'omit',
              headers: {
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            })
          } catch (retryError) {
            throw retryError // If retry also fails, throw the error
          }
        } else {
          throw fetchError // Re-throw abort errors immediately
        }
      }
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
        const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch logs')
      }
      
      // SURGICAL FIX: Parse timestamps correctly and filter out old/supabase config errors
      const sanitizedLogs = (data.logs || []).map(log => {
        let timestamp = log.timestamp
        
        // Handle various timestamp formats
        if (typeof timestamp === 'string') {
          // Try parsing ISO string
          const parsed = new Date(timestamp)
          if (!isNaN(parsed.getTime())) {
            timestamp = parsed
          } else if (log.rawTimestamp) {
            // Try parsing raw timestamp format (YYYY-MM-DD HH:mm:ss)
            const rawParsed = new Date(log.rawTimestamp)
            timestamp = !isNaN(rawParsed.getTime()) ? rawParsed : new Date()
          } else {
            timestamp = new Date()
          }
        } else if (!(timestamp instanceof Date)) {
          timestamp = new Date()
        }
        
        // Filter out stale Supabase config errors (these were fixed, old logs)
        const isOldSupabaseError = log.message && 
          log.message.includes('Missing Supabase configuration') &&
          timestamp < new Date(Date.now() - 24 * 60 * 60 * 1000) // Older than 24 hours
        
        if (isOldSupabaseError) {
          return null // Filter out
        }
        
        return {
          ...log,
          timestamp,
          type: log.type || log.level || 'info',
          level: log.level || 'info'
        }
      }).filter(log => log !== null) // Remove filtered logs
      
      setLogs(sanitizedLogs)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      
      // SURGICAL FIX: Better error handling - don't replace logs, just append error if needed
      if (error.name === 'AbortError') {
        // Timeout - don't spam errors
        console.warn('Log fetch timeout - will retry on next refresh')
        return // Don't add error log for timeouts
      }
      
      // Network error or fetch failure - only show if logs are empty or last error was different
      setLogs(prev => {
        // Only add error if we have no logs OR if the last error is different/old
        if (prev.length === 0) {
          return [{
            timestamp: new Date(),
            level: 'error',
            message: `Cannot connect to worker logs: ${error.message}. Check if worker is running.`,
            type: 'error'
          }]
        }
        
        // Check last log - don't spam same error
        const lastLog = prev[prev.length - 1]
        const lastErrorTime = lastLog.timestamp instanceof Date 
          ? lastLog.timestamp 
          : new Date(lastLog.timestamp || Date.now())
        const timeSinceLastError = Date.now() - lastErrorTime.getTime()
        
        // Only add new error if different message OR last error was more than 30 seconds ago
        if (lastLog.message !== `Cannot connect to worker logs: ${error.message}. Check if worker is running.` ||
            timeSinceLastError > 30000) {
          return [...prev, {
            timestamp: new Date(),
            level: 'error',
            message: `Cannot connect to worker logs: ${error.message}. Check if worker is running.`,
            type: 'error'
          }].slice(-50) // Keep last 50 logs
        }
        
        return prev // Keep existing logs, don't spam
      })
    }
  }

  // Worker control functions
  const restartWorker = async () => {
    try {
      const response = await fetch('http://157.254.24.49:3001/restart', { method: 'POST' })
      if (response.ok) {
        toast.success('Worker restart initiated')
        setTimeout(fetchWorkerStatus, 2000)
      } else {
        toast.error('Failed to restart worker')
      }
    } catch (error) {
      toast.error('Failed to restart worker')
    }
  }

  const stopWorker = async () => {
    if (!confirm('Are you sure you want to stop the worker? This will stop all executions.')) {
      return
    }
    try {
      const response = await fetch('http://157.254.24.49:3001/stop-worker', { method: 'POST' })
      if (response.ok) {
        toast.success('Worker stop initiated')
        setTimeout(fetchWorkerStatus, 2000)
      } else {
        toast.error('Failed to stop worker')
      }
    } catch (error) {
      // If connection refused, worker might already be down
      if (error.message?.includes('CONNECTION_REFUSED') || error.message?.includes('Failed to fetch')) {
        toast.error('Worker appears to be down already. Check status or use Emergency Terminal Commands.', { duration: 5000 })
      } else {
        toast.error('Failed to stop worker: ' + error.message)
      }
    }
  }

  const startWorker = async () => {
    try {
      const response = await fetch('http://157.254.24.49:3001/start-worker', { method: 'POST' })
      if (response.ok) {
        toast.success('Worker start initiated')
        setTimeout(fetchWorkerStatus, 2000)
      } else {
        toast.error('Failed to start worker')
      }
    } catch (error) {
      // If connection refused, worker is down - can't start via API
      if (error.message?.includes('CONNECTION_REFUSED') || error.message?.includes('Failed to fetch')) {
        toast.error(
          'Worker is down - cannot start via API. Use Emergency Terminal Commands below to start via SSH.',
          { duration: 6000 }
        )
      } else {
        toast.error('Failed to start worker: ' + error.message)
      }
    }
  }

  const cleanupExecutions = async () => {
    try {
      const response = await fetch('http://157.254.24.49:3001/cleanup', { method: 'POST' })
      if (response.ok) {
        const result = await response.json()
        toast.success(`Cleanup completed: ${result.activeExecutions} executions cleared`)
        fetchWorkerStatus()
      } else {
        toast.error('Failed to cleanup executions')
      }
    } catch (error) {
      toast.error('Failed to cleanup executions')
    }
  }

  const stopExecution = async (executionId) => {
    try {
      const response = await fetch(`http://157.254.24.49:3001/stop/${executionId}`, { method: 'POST' })
      if (response.ok) {
        toast.success(`Execution ${executionId} stopped`)
        fetchWorkerStatus()
      } else {
        toast.error('Failed to stop execution')
      }
    } catch (error) {
      toast.error('Failed to stop execution')
    }
  }

  // Retry a queued execution by executionId
  const retryQueuedExecution = async () => {
    const trimmed = queueExecutionId.trim()
    if (!trimmed) {
      toast.error('Enter an executionId to retry in queue')
      return
    }

    try {
      const response = await fetch(`http://157.254.24.49:3001/queue/retry/${trimmed}`, {
        method: 'POST'
      })
      if (response.ok) {
        toast.success(`Queue retry requested for ${trimmed}`)
        setQueueExecutionId('')
        fetchQueueStatus()
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || 'Failed to retry queued execution')
      }
    } catch (error) {
      toast.error('Failed to retry queued execution: ' + error.message)
    }
  }

  const pauseQueue = async () => {
    try {
      const response = await fetch('http://157.254.24.49:3001/queue/pause', { method: 'POST' })
      if (response.ok) {
        toast.success('Queue paused')
        fetchQueueStatus()
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || 'Failed to pause queue')
      }
    } catch (error) {
      toast.error('Failed to pause queue: ' + error.message)
    }
  }

  const resumeQueue = async () => {
    try {
      const response = await fetch('http://157.254.24.49:3001/queue/resume', { method: 'POST' })
      if (response.ok) {
        toast.success('Queue resumed')
        fetchQueueStatus()
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || 'Failed to resume queue')
      }
    } catch (error) {
      toast.error('Failed to resume queue: ' + error.message)
    }
  }

  const clearFailedQueueJobs = async () => {
    if (!confirm('Clear ALL failed jobs from the queue? This cannot be undone.')) return
    try {
      const response = await fetch('http://157.254.24.49:3001/queue/clear/failed', { method: 'POST' })
      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.success(data.message || 'Cleared failed queue jobs')
        fetchQueueStatus()
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || 'Failed to clear failed jobs')
      }
    } catch (error) {
      toast.error('Failed to clear failed jobs: ' + error.message)
    }
  }

  const clearDelayedQueueJobs = async () => {
    if (!confirm('Clear ALL delayed jobs from the queue? This cannot be undone.')) return
    try {
      const response = await fetch('http://157.254.24.49:3001/queue/clear/delayed', { method: 'POST' })
      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.success(data.message || 'Cleared delayed queue jobs')
        fetchQueueStatus()
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || 'Failed to clear delayed jobs')
      }
    } catch (error) {
      toast.error('Failed to clear delayed jobs: ' + error.message)
    }
  }

  const clearWaitingQueueJobs = async () => {
    if (!confirm('Clear ALL waiting jobs from the queue? This will drop jobs that have not started yet.')) return
    try {
      const response = await fetch('http://157.254.24.49:3001/queue/clear/waiting', { method: 'POST' })
      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.success(data.message || 'Cleared waiting queue jobs')
        fetchQueueStatus()
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || 'Failed to clear waiting jobs')
      }
    } catch (error) {
      toast.error('Failed to clear waiting jobs: ' + error.message)
    }
  }

  const hardResetQueue = async () => {
    if (!confirm('⚠️ HARD RESET QUEUE?\n\nThis will clear ALL waiting, delayed and failed jobs.\nActive executions must be stopped separately.\n\nAre you absolutely sure?')) {
      return
    }
    try {
      const response = await fetch('http://157.254.24.49:3001/queue/reset', { method: 'POST' })
      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.success(data.message || 'Queue reset applied')
        fetchQueueStatus()
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || 'Failed to reset queue')
      }
    } catch (error) {
      toast.error('Failed to reset queue: ' + error.message)
    }
  }

  // Auto-refresh
  useEffect(() => {
    let isMounted = true
    
    const initialFetch = async () => {
      try {
        await Promise.all([fetchWorkerStatus(), fetchLogs(), fetchQueueStatus()])
      } catch (error) {
        console.error('Initial fetch failed:', error)
      } finally {
        if (isMounted) {
    setIsLoading(false)
        }
      }
    }

    initialFetch()

    let interval = null
    if (autoRefresh) {
      interval = setInterval(async () => {
        if (isMounted) {
          try {
            await Promise.all([fetchWorkerStatus(), fetchLogs(), fetchQueueStatus()])
          } catch (error) {
            console.error('Auto-refresh failed:', error)
          }
        }
      }, 60000) // Refresh every 60 seconds
    }

    return () => {
      isMounted = false
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoRefresh])

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timeInterval)
  }, [])

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  // SURGICAL FIX: Filter logs and sort by timestamp descending (newest first) - ALWAYS
  const filteredLogs = [...logs]
    .filter(log => {
      if (logFilter === 'all') return true
      return log.type === logFilter
    })
    .sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime()
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime()
      return timeB - timeA // Descending order (newest first)
    })

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
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 shadow-lg">
              <Server className="w-8 h-8 text-blue-400" />
            </div>
            Worker Control Dashboard
          </h1>
          <p className="text-gray-400 text-lg mb-2">Monitor and control the Lekhika VPS Worker</p>
          <p className="text-gray-500 text-sm">
            Last Updated: <span className="text-blue-400 font-mono font-semibold">{currentTime.toLocaleTimeString()}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="group-hover:text-white transition-colors">Auto Refresh</span>
          </label>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchWorkerStatus}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-blue-500/50 border border-blue-500/30"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Worker Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Health Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg p-6 hover:border-blue-500/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {workerStatus ? getStatusIcon(workerStatus.status) : <Server className="w-6 h-6 text-gray-400" />}
              <h3 className="text-lg font-bold text-white">Health Status</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={`font-medium ${workerStatus ? getStatusColor(workerStatus.status) : 'text-gray-400'}`}>
                {workerStatus?.status || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime:</span>
              <span className="text-white font-mono">
                {workerStatus?.uptime ? formatUptime(workerStatus.uptime) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span className="text-white">{workerStatus?.version || 'N/A'}</span>
            </div>
          </div>
        </motion.div>

        {/* Memory Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg p-6 hover:border-purple-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HardDrive className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Memory Usage</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">RSS:</span>
              <span className="text-white font-mono">
                {workerStatus?.memory?.rss ? formatBytes(workerStatus.memory.rss) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Heap Total:</span>
              <span className="text-white font-mono">
                {workerStatus?.memory?.heapTotal ? formatBytes(workerStatus.memory.heapTotal) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Heap Used:</span>
              <span className="text-white font-mono">
                {workerStatus?.memory?.heapUsed ? formatBytes(workerStatus.memory.heapUsed) : 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Active Executions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg p-6 hover:border-green-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-bold text-white">Active Executions</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Current:</span>
              <span className="text-white font-mono">
                {workerStatus?.activeExecutions || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Capacity:</span>
              <span className="text-white font-mono">
                {workerStatus?.maxConcurrent || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Capacity:</span>
              <span className="text-white font-mono">
                {workerStatus?.capacity || 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg p-6 hover:border-blue-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Performance</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">External:</span>
              <span className="text-white font-mono">
                {workerStatus?.memory?.external ? formatBytes(workerStatus.memory.external) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Array Buffers:</span>
              <span className="text-white font-mono">
                {workerStatus?.memory?.arrayBuffers ? formatBytes(workerStatus.memory.arrayBuffers) : 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Queue Status (Redis) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg p-6 mb-6 hover:border-teal-500/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Queue Status (Redis)
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    queueStatus.enabled
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-gray-700/40 text-gray-300 border border-gray-600/60'
                  }`}
                >
                  {queueStatus.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Real-time job counts from the Redis-backed execution queue.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/70">
            <p className="text-xs text-gray-400 mb-1">Waiting</p>
            <p className="text-2xl font-bold text-teal-300">
              {queueStatus.stats?.wait ?? 0}
            </p>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/70">
            <p className="text-xs text-gray-400 mb-1">Active</p>
            <p className="text-2xl font-bold text-blue-300">
              {queueStatus.stats?.active ?? 0}
            </p>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/70">
            <p className="text-xs text-gray-400 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-300">
              {queueStatus.stats?.completed ?? 0}
            </p>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/70">
            <p className="text-xs text-gray-400 mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-300">
              {queueStatus.stats?.failed ?? 0}
            </p>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/70">
            <p className="text-xs text-gray-400 mb-1">Delayed</p>
            <p className="text-2xl font-bold text-yellow-300">
              {queueStatus.stats?.delayed ?? 0}
            </p>
          </div>
        </div>

        {(queueStatus.error || queueStatus.message) && (
          <div className="mt-3 text-xs text-gray-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span>
              {queueStatus.error
                ? `Queue status error: ${queueStatus.error}`
                : queueStatus.message}
            </span>
          </div>
        )}
      </motion.div>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Worker Control Panel</h2>
              <p className="text-gray-400 text-sm">Manage worker processes and executions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Start Worker */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startWorker}
            className="relative p-5 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group shadow-lg hover:shadow-green-500/50 border border-green-500/30"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-semibold text-base">Start Worker</span>
            <span className="text-xs text-green-100 opacity-75">Initialize worker process</span>
          </motion.button>

          {/* Stop Worker */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={stopWorker}
            className="relative p-5 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group shadow-lg hover:shadow-red-500/50 border border-red-500/30"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <Square className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-semibold text-base">Stop Worker</span>
            <span className="text-xs text-red-100 opacity-75">Stop all executions</span>
          </motion.button>

          {/* Restart Worker */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={restartWorker}
            className="relative p-5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group shadow-lg hover:shadow-blue-500/50 border border-blue-500/30"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <span className="font-semibold text-base">Restart Worker</span>
            <span className="text-xs text-blue-100 opacity-75">Reload worker process</span>
          </motion.button>

          {/* Cleanup Executions */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={cleanupExecutions}
            className="relative p-5 bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group shadow-lg hover:shadow-yellow-500/50 border border-yellow-500/30"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-semibold text-base">Cleanup Executions</span>
            <span className="text-xs text-yellow-100 opacity-75">Clear stuck executions</span>
          </motion.button>

          {/* Force Stop All */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (confirm('⚠️ Are you sure you want to force stop ALL executions? This cannot be undone.')) {
                cleanupExecutions()
              }
            }}
            className="relative p-5 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group shadow-lg hover:shadow-orange-500/50 border border-orange-500/30"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <AlertTriangle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-semibold text-base">Force Stop All</span>
            <span className="text-xs text-orange-100 opacity-75">Emergency stop all</span>
          </motion.button>

          {/* Download Logs */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const logText = filteredLogs.map(log => 
                `[${log.timestamp instanceof Date ? log.timestamp.toISOString() : new Date(log.timestamp || Date.now()).toISOString()}] ${log.level?.toUpperCase() || 'INFO'}: ${log.message}`
              ).join('\n')
              
              const blob = new Blob([logText], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `worker-logs-${new Date().toISOString().split('T')[0]}.txt`
              a.click()
              URL.revokeObjectURL(url)
              
              toast.success('Logs downloaded successfully!', { icon: '📥' })
            }}
            className="relative p-5 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group shadow-lg hover:shadow-purple-500/50 border border-purple-500/30"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <Download className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-semibold text-base">Download Logs</span>
            <span className="text-xs text-purple-100 opacity-75">Export log file</span>
          </motion.button>
        </div>

        {/* Queue Controls */}
        <div className="mt-8 pt-6 border-t border-gray-700/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Queue Controls (SuperAdmin)</h3>
                <p className="text-xs text-gray-400">
                  Inspect and control Redis-backed job queue for workflow executions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <input
              type="text"
              value={queueExecutionId}
              onChange={(e) => setQueueExecutionId(e.target.value)}
              placeholder="Enter executionId to retry in queue"
              className="flex-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={retryQueuedExecution}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 border border-teal-500/40 shadow-lg hover:shadow-teal-500/40"
            >
              <RotateCcw className="w-4 h-4" />
              Retry in Queue
            </motion.button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={pauseQueue}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded-lg border border-yellow-500/40 flex items-center gap-2"
            >
              <Square className="w-3 h-3 text-yellow-300" />
              Pause Queue
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resumeQueue}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded-lg border border-green-500/40 flex items-center gap-2"
            >
              <Play className="w-3 h-3 text-green-300" />
              Resume Queue
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearFailedQueueJobs}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded-lg border border-red-500/50 flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3 text-red-300" />
              Clear Failed
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearDelayedQueueJobs}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded-lg border border-orange-500/50 flex items-center gap-2"
            >
              <Clock className="w-3 h-3 text-orange-300" />
              Clear Delayed
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearWaitingQueueJobs}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded-lg border border-sky-500/50 flex items-center gap-2"
            >
              <Zap className="w-3 h-3 text-sky-300" />
              Clear Waiting
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={hardResetQueue}
              className="px-3 py-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-xs text-white rounded-lg border border-red-500/70 flex items-center gap-2 shadow-lg shadow-red-500/40"
            >
              <AlertTriangle className="w-3 h-3 text-red-200" />
              Reset Queue (Nuke)
            </motion.button>
          </div>

          {!queueStatus.enabled && (
            <p className="mt-2 text-xs text-yellow-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Queue is currently disabled in worker .env (QUEUE_ENABLED=false). Retries will only work when queue is enabled.
            </p>
          )}
        </div>
      </motion.div>

      {/* Active Executions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Active Executions (Live)</h3>
              <p className="text-xs text-gray-400">
                These are executions the worker thinks are currently running. You can stop them individually.
              </p>
            </div>
          </div>
        </div>

        {Array.isArray(workerStatus?.activeExecutionIds) && workerStatus.activeExecutionIds.length > 0 ? (
          <div className="space-y-2">
            {workerStatus.activeExecutionIds.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700/70"
              >
                <span className="font-mono text-xs text-gray-200 truncate">{id}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => stopExecution(id)}
                  className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-1"
                >
                  <StopCircle className="w-3 h-3" />
                  Stop
                </motion.button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No active executions tracked by the worker.</p>
        )}
      </motion.div>

      {/* Emergency Terminal Commands - Collapsible Accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-orange-500/30 shadow-xl overflow-hidden"
      >
        {/* Accordion Header */}
        <button
          onClick={() => setIsEmergencyCommandsOpen(!isEmergencyCommandsOpen)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-800/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Emergency Terminal Commands
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded">8 Commands</span>
              </h2>
              <p className="text-gray-400 text-sm mt-1">If buttons fail, copy/paste these commands via SSH</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isEmergencyCommandsOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-lg bg-gray-700/50 group-hover:bg-gray-700 transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </button>

        {/* Accordion Content */}
        <AnimatePresence>
          {isEmergencyCommandsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-4">
                {/* SSH Command */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-green-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <p className="text-gray-300 text-sm font-medium">SSH to VPS</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('ssh lekhi7866@157.254.24.49')
                        toast.success('SSH command copied to clipboard!', { icon: '📋' })
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-sm text-green-400 border border-green-500/20">
                    <code className="break-all">ssh lekhi7866@157.254.24.49</code>
                  </div>
                </div>

                {/* Stop Worker */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-red-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <p className="text-gray-300 text-sm font-medium">Stop Worker</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && cd ~/vps-worker && pm2 stop lekhika-worker')
                        toast.success('Stop command copied!', { icon: '📋' })
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-red-400 border border-red-500/20">
                    <code className="break-all">export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && cd ~/vps-worker && pm2 stop lekhika-worker</code>
                  </div>
                </div>

                {/* Start Worker */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-green-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <p className="text-gray-300 text-sm font-medium">Start Worker</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && cd ~/vps-worker && pm2 start ecosystem.config.js')
                        toast.success('Start command copied!', { icon: '📋' })
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-green-400 border border-green-500/20">
                    <code className="break-all">export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && cd ~/vps-worker && pm2 start ecosystem.config.js</code>
                  </div>
                </div>

                {/* Restart Worker */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <p className="text-gray-300 text-sm font-medium">Restart Worker</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && cd ~/vps-worker && pm2 restart lekhika-worker')
                        toast.success('Restart command copied!', { icon: '📋' })
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-blue-400 border border-blue-500/20">
                    <code className="break-all">export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && cd ~/vps-worker && pm2 restart lekhika-worker</code>
                  </div>
                </div>

                {/* Kill Worker */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-red-600/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      <p className="text-gray-300 text-sm font-medium">Kill Worker (Force Stop)</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && cd ~/vps-worker && pm2 delete lekhika-worker')
                        toast.success('Kill command copied!', { icon: '📋' })
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-red-500 border border-red-600/20">
                    <code className="break-all">export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && cd ~/vps-worker && pm2 delete lekhika-worker</code>
                  </div>
                </div>

                {/* Check Status */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-yellow-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <p className="text-gray-300 text-sm font-medium">Check Worker Status</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && pm2 status')
                        toast.success('Status command copied!', { icon: '📋' })
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-yellow-400 border border-yellow-500/20">
                    <code className="break-all">export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && pm2 status</code>
                  </div>
                </div>

                {/* View Logs */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <p className="text-gray-300 text-sm font-medium">View Live Logs</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && pm2 logs lekhika-worker --lines 50')
                        toast.success('Logs command copied!', { icon: '📋' })
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-purple-400 border border-purple-500/20">
                    <code className="break-all">export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && pm2 logs lekhika-worker --lines 50</code>
                  </div>
                </div>

                {/* Nuclear Restart */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                      <p className="text-gray-300 text-sm font-medium">Nuclear Restart (Delete + Start)</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && cd ~/vps-worker && pm2 delete lekhika-worker ; pm2 start ecosystem.config.js')
                        toast.success('Nuclear restart command copied!', { icon: '📋' })
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-orange-400 border border-orange-500/20">
                    <code className="break-all">export NVM_DIR="/home/lekhika.online/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && cd ~/vps-worker && pm2 delete lekhika-worker ; pm2 start ecosystem.config.js</code>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Live Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-3">
            <Terminal className="w-6 h-6 text-green-400" />
            Live Worker Logs
          </h2>
          
          <div className="flex items-center gap-3">
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Logs</option>
              <option value="info">Info</option>
              <option value="error">Errors</option>
            </select>
          </div>
        </div>

        <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          <AnimatePresence>
            {filteredLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-start gap-3 py-1 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'info' ? 'text-green-400' : 'text-gray-300'
                }`}
              >
                <span className="text-gray-500 text-xs mt-0.5">
                  {(() => {
                    try {
                      const logTime = log.timestamp instanceof Date 
                        ? log.timestamp 
                        : new Date(log.timestamp || Date.now())
                      
                      // Check if timestamp is valid and recent (not older than 7 days)
                      const now = new Date()
                      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                      
                      if (isNaN(logTime.getTime()) || logTime < sevenDaysAgo) {
                        return '--:--:--'
                      }
                      
                      return logTime.toLocaleTimeString('en-US', { 
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    } catch (error) {
                      return '--:--:--'
                    }
                  })()}
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400 uppercase text-xs">
                  {log.level}
                </span>
                <span className="text-gray-500">|</span>
                <span className="flex-1">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredLogs.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              No logs available
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default WorkerControlDashboard

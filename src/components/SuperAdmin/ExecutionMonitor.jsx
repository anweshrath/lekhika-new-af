import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Eye,
  RefreshCw,
  Filter,
  Download,
  TrendingUp,
  Users,
  Server,
  Cpu
} from 'lucide-react'
import { executionMonitorService } from '../../services/executionMonitorService'
import toast from 'react-hot-toast'

const ExecutionMonitor = ({ serviceStatus }) => {
  const [activeExecutions, setActiveExecutions] = useState([])
  const [executionHistory, setExecutionHistory] = useState([])
  const [stats, setStats] = useState({})
  const [systemLoad, setSystemLoad] = useState({})
  const [serviceMetrics, setServiceMetrics] = useState({})
  const [selectedExecution, setSelectedExecution] = useState(null)
  const [filter, setFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadData()
    
    // Set up real-time updates
    const unsubscribe = executionMonitorService.addListener((event, data) => {
      console.log('Execution event:', event, data)
      loadData() // Refresh data on any execution event
      
      // Show notifications for important events
      switch (event) {
        case 'execution_completed':
          toast.success(`Execution completed: ${data.id}`)
          break
        case 'execution_failed':
          toast.error(`Execution failed: ${data.id}`)
          break
        case 'execution_cancelled':
          toast.info(`Execution cancelled: ${data.id}`)
          break
      }
    })

    // Auto-refresh interval
    let interval
    if (autoRefresh) {
      interval = setInterval(loadData, 60000) // Refresh every 60 seconds
    }

    return () => {
      unsubscribe()
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const loadData = async () => {
    try {
      const [active, history, executionStats, load, metrics] = await Promise.all([
        Promise.resolve(executionMonitorService.getActiveExecutions()),
        Promise.resolve(executionMonitorService.getExecutionHistory(50)),
        Promise.resolve(executionMonitorService.getExecutionStats()),
        Promise.resolve(executionMonitorService.getSystemLoad()),
        Promise.resolve(executionMonitorService.getServiceMetrics())
      ])

      setActiveExecutions(active)
      setExecutionHistory(history)
      setStats(executionStats)
      setSystemLoad(load)
      setServiceMetrics(metrics)
    } catch (error) {
      console.error('Error loading execution data:', error)
    }
  }

  const handlePauseExecution = async (executionId) => {
    try {
      await executionMonitorService.pauseExecution(executionId)
      toast.success('Execution paused')
      loadData()
    } catch (error) {
      console.error('Error pausing execution:', error)
      toast.error('Failed to pause execution')
    }
  }

  const handleResumeExecution = async (executionId) => {
    try {
      await executionMonitorService.resumeExecution(executionId)
      toast.success('Execution resumed')
      loadData()
    } catch (error) {
      console.error('Error resuming execution:', error)
      toast.error('Failed to resume execution')
    }
  }

  const handleCancelExecution = async (executionId) => {
    if (!confirm('Are you sure you want to cancel this execution?')) return
    
    try {
      await executionMonitorService.cancelExecution(executionId)
      toast.success('Execution cancelled')
      loadData()
    } catch (error) {
      console.error('Error cancelling execution:', error)
      toast.error('Failed to cancel execution')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-green-400" />
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-400" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'cancelled':
        return <Square className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-900/20'
      case 'paused':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'completed':
        return 'text-blue-400 bg-blue-900/20'
      case 'failed':
        return 'text-red-400 bg-red-900/20'
      case 'cancelled':
        return 'text-gray-400 bg-gray-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const formatDuration = (ms) => {
    if (!ms) return '0s'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const filteredHistory = executionHistory.filter(execution => {
    if (filter === 'all') return true
    return execution.status === filter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-400" />
              Execution Monitor
            </h2>
            <p className="text-gray-400 mt-1">
              Real-time monitoring of AI workflow executions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-300">Active</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.active || 0}</div>
          </div>
          <div className="p-4 bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-300">Completed</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{stats.completed || 0}</div>
          </div>
          <div className="p-4 bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-300">Failed</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{stats.failed || 0}</div>
          </div>
          <div className="p-4 bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-purple-300">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {stats.successRate ? `${Math.round(stats.successRate)}%` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* System Load */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          System Load
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Active Executions</span>
              <span className="text-white font-semibold">{systemLoad.activeExecutions || 0}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((systemLoad.activeExecutions || 0) / 10 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Running Steps</span>
              <span className="text-white font-semibold">{systemLoad.runningSteps || 0}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((systemLoad.runningSteps || 0) / 20 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">System Load</span>
              <span className="text-white font-semibold">{Math.round(systemLoad.systemLoad || 0)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  (systemLoad.systemLoad || 0) > 80 ? 'bg-red-500' :
                  (systemLoad.systemLoad || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemLoad.systemLoad || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Executions */}
      {activeExecutions.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Active Executions ({activeExecutions.length})
          </h3>
          
          <div className="space-y-4">
            {activeExecutions.map(execution => (
              <div key={execution.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(execution.status)}
                      <span className="font-semibold text-white">{execution.id}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-2">
                      Workflow: {execution.workflowId} • Started: {formatDuration(Date.now() - execution.startTime)} ago
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs text-gray-400">{execution.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${execution.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Current Step */}
                    {execution.currentStep && (
                      <div className="text-sm text-blue-400">
                        Current: {execution.currentStep}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedExecution(execution)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {execution.status === 'running' && (
                      <button
                        onClick={() => handlePauseExecution(execution.id)}
                        className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    
                    {execution.status === 'paused' && (
                      <button
                        onClick={() => handleResumeExecution(execution.id)}
                        className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                        title="Resume"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleCancelExecution(execution.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Cancel"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Metrics */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Tokens: {execution.metrics?.tokensUsed || 0}</span>
                  <span>Cost: ${(execution.metrics?.cost || 0).toFixed(4)}</span>
                  <span>API Calls: {execution.metrics?.apiCalls || 0}</span>
                  {execution.metrics?.retries > 0 && (
                    <span className="text-yellow-400">Retries: {execution.metrics.retries}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Metrics */}
      {Object.keys(serviceMetrics).length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            Service Metrics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(serviceMetrics).map(([service, metrics]) => (
              <div key={service} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white capitalize">{service}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    serviceStatus[service]?.status === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {serviceStatus[service]?.status || 'unknown'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Calls:</span>
                    <span className="text-white">{metrics.calls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Success Rate:</span>
                    <span className="text-white">{Math.round(metrics.successRate || 0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Duration:</span>
                    <span className="text-white">{formatDuration(metrics.avgDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tokens:</span>
                    <span className="text-white">{metrics.tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-white">${metrics.cost.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution History */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Execution History
          </h3>
          
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No execution history found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map(execution => (
              <div key={execution.id} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <span className="font-medium text-white">{execution.id}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{formatDuration(execution.endTime - execution.startTime)}</span>
                    <span>{execution.metrics?.tokensUsed || 0} tokens</span>
                    <span>${(execution.metrics?.cost || 0).toFixed(4)}</span>
                    <button
                      onClick={() => setSelectedExecution(execution)}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Execution Detail Modal */}
      {selectedExecution && (
        <ExecutionDetailModal
          execution={selectedExecution}
          onClose={() => setSelectedExecution(null)}
        />
      )}
    </div>
  )
}

// Execution Detail Modal Component
const ExecutionDetailModal = ({ execution, onClose }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-green-400" />
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-400" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'cancelled':
        return <Square className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-900/20'
      case 'paused':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'completed':
        return 'text-blue-400 bg-blue-900/20'
      case 'failed':
        return 'text-red-400 bg-red-900/20'
      case 'cancelled':
        return 'text-gray-400 bg-gray-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const formatDuration = (ms) => {
    if (!ms) return '0s'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Execution Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Execution Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Execution Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID:</span>
                  <span className="text-white font-mono">{execution.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(execution.status)}`}>
                    {execution.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Workflow:</span>
                  <span className="text-white">{execution.workflowId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Progress:</span>
                  <span className="text-white">{execution.progress}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Timing</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Started:</span>
                  <span className="text-white">{new Date(execution.startTime).toLocaleString()}</span>
                </div>
                {execution.endTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ended:</span>
                    <span className="text-white">{new Date(execution.endTime).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">
                    {formatDuration((execution.endTime || Date.now()) - execution.startTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          {execution.metrics && (
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{execution.metrics.tokensUsed || 0}</div>
                  <div className="text-gray-400">Tokens Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">${(execution.metrics.cost || 0).toFixed(4)}</div>
                  <div className="text-gray-400">Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{execution.metrics.apiCalls || 0}</div>
                  <div className="text-gray-400">API Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{execution.metrics.retries || 0}</div>
                  <div className="text-gray-400">Retries</div>
                </div>
              </div>
            </div>
          )}

          {/* Steps */}
          {execution.steps && execution.steps.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-4">Execution Steps</h4>
              <div className="space-y-3">
                {execution.steps.map((step, index) => (
                  <div key={step.id} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">#{index + 1}</span>
                        {getStatusIcon(step.status)}
                        <span className="font-medium text-white">{step.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(step.status)}`}>
                          {step.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        {step.service && (
                          <span className="px-2 py-1 bg-gray-600 rounded text-xs mr-2">
                            {step.service}
                          </span>
                        )}
                        {step.metrics?.duration && formatDuration(step.metrics.duration)}
                      </div>
                    </div>
                    
                    {step.metrics && (
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Tokens: {step.metrics.tokensUsed || 0}</span>
                        <span>Cost: ${(step.metrics.cost || 0).toFixed(4)}</span>
                        {step.metrics.retries > 0 && (
                          <span className="text-yellow-400">Retries: {step.metrics.retries}</span>
                        )}
                      </div>
                    )}
                    
                    {step.errors && step.errors.length > 0 && (
                      <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-600">
                        <div className="text-xs text-red-400">Errors:</div>
                        {step.errors.map((error, idx) => (
                          <div key={idx} className="text-xs text-red-300 mt-1">{error}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Details */}
          {execution.error && (
            <div className="p-4 bg-red-900/20 rounded-lg border border-red-600">
              <h4 className="font-semibold text-red-400 mb-2">Error Details</h4>
              <div className="text-sm text-red-300">{execution.error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExecutionMonitor

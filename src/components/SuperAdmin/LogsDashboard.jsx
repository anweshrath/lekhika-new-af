import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Filter, 
  RefreshCw, 
  Search, 
  TrendingUp, 
  Users, 
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react'
import systemLoggingService from '../../services/systemLoggingService'
import { toast } from 'react-hot-toast'

const LogsDashboard = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [logs, setLogs] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [performance, setPerformance] = useState([])
  const [userUsage, setUserUsage] = useState([])
  const [errorAnalysis, setErrorAnalysis] = useState([])
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')
  const [filters, setFilters] = useState({
    logLevel: [],
    category: [],
    status: [],
    search: ''
  })

  // Load data on component mount
  useEffect(() => {
    if (isVisible) {
      loadAllData()
    }
  }, [isVisible, timeRange])

  // Load all dashboard data
  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadLogs(),
        loadAnalytics(),
        loadPerformance(),
        loadUserUsage(),
        loadErrorAnalysis()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Load logs
  const loadLogs = async () => {
    try {
      const logsData = await systemLoggingService.getLogs({
        limit: 100,
        dateFrom: getDateFromTimeRange(timeRange)
      })
      setLogs(logsData)
    } catch (error) {
      console.error('Error loading logs:', error)
    }
  }

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      const analyticsData = await systemLoggingService.getAnalyticsData(timeRange)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  // Load performance data
  const loadPerformance = async () => {
    try {
      const performanceData = await systemLoggingService.getPerformanceData(timeRange)
      setPerformance(performanceData)
    } catch (error) {
      console.error('Error loading performance data:', error)
    }
  }

  // Load user usage data
  const loadUserUsage = async () => {
    try {
      const userUsageData = await systemLoggingService.getUserUsageData(timeRange)
      setUserUsage(userUsageData)
    } catch (error) {
      console.error('Error loading user usage data:', error)
    }
  }

  // Load error analysis data
  const loadErrorAnalysis = async () => {
    try {
      const errorAnalysisData = await systemLoggingService.getErrorAnalysisData(timeRange)
      setErrorAnalysis(errorAnalysisData)
    } catch (error) {
      console.error('Error loading error analysis data:', error)
    }
  }

  // Helper function to get date from time range
  const getDateFromTimeRange = (range) => {
    const now = new Date()
    switch (range) {
      case '1d': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  // Calculate summary stats
  const getSummaryStats = () => {
    const totalExecutions = logs.length
    const successfulExecutions = logs.filter(log => log.status === 'success').length
    const failedExecutions = logs.filter(log => log.status === 'failed').length
    const totalCost = logs.reduce((sum, log) => sum + (log.execution_cost || 0), 0)
    const totalTokens = logs.reduce((sum, log) => sum + (log.total_tokens || 0), 0)
    const avgExecutionTime = logs.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) / totalExecutions

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100).toFixed(1) : 0,
      totalCost,
      totalTokens,
      avgExecutionTime: avgExecutionTime ? Math.round(avgExecutionTime) : 0
    }
  }

  const stats = getSummaryStats()

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Logs Dashboard</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Real-time monitoring and analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            {/* Refresh Button */}
            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Executions</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExecutions}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.failedExecutions}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</span>
              </div>
              <p className="text-2xl font-bold text-green-600">${stats.totalCost.toFixed(4)}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tokens</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.totalTokens.toLocaleString()}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Time</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.avgExecutionTime}ms</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{new Set(logs.map(log => log.user_id)).size}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'logs', label: 'Live Logs', icon: Activity },
            { id: 'analytics', label: 'Cost Analytics', icon: TrendingUp },
            { id: 'performance', label: 'Performance', icon: LineChart },
            { id: 'errors', label: 'Error Analysis', icon: AlertCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && <OverviewTab stats={stats} analytics={analytics} performance={performance} />}
          {activeTab === 'logs' && <LogsTab logs={logs} filters={filters} setFilters={setFilters} />}
          {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} userUsage={userUsage} />}
          {activeTab === 'performance' && <PerformanceTab performance={performance} />}
          {activeTab === 'errors' && <ErrorsTab errorAnalysis={errorAnalysis} />}
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component
const OverviewTab = ({ stats, analytics, performance }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cost Trend Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Trends</h3>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>Cost trend chart will be displayed here</p>
          </div>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
            <span className="font-semibold text-green-600">{stats.successRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Avg Response Time</span>
            <span className="font-semibold text-blue-600">{stats.avgExecutionTime}ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Total Executions</span>
            <span className="font-semibold text-gray-900 dark:text-white">{stats.totalExecutions}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Logs Tab Component
const LogsTab = ({ logs, filters, setFilters }) => (
  <div className="space-y-4">
    {/* Filters */}
    <div className="flex gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search logs..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>
      
      <select
        value={filters.logLevel}
        onChange={(e) => setFilters({...filters, logLevel: e.target.value})}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="">All Levels</option>
        <option value="DEBUG">DEBUG</option>
        <option value="INFO">INFO</option>
        <option value="WARN">WARN</option>
        <option value="ERROR">ERROR</option>
        <option value="CRITICAL">CRITICAL</option>
      </select>
      
      <select
        value={filters.category}
        onChange={(e) => setFilters({...filters, category: e.target.value})}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="">All Categories</option>
        <option value="WORKFLOW">WORKFLOW</option>
        <option value="AI_API">AI_API</option>
        <option value="DATABASE">DATABASE</option>
        <option value="USER_ACTION">USER_ACTION</option>
        <option value="SYSTEM">SYSTEM</option>
      </select>
    </div>
    
    {/* Logs List */}
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="max-h-96 overflow-auto">
        {logs.map((log, index) => (
          <div key={log.id} className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
            log.log_level === 'ERROR' ? 'bg-red-50 dark:bg-red-900/20' :
            log.log_level === 'WARN' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
            'bg-white dark:bg-gray-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.log_level === 'ERROR' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    log.log_level === 'WARN' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    log.log_level === 'INFO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {log.log_level}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                    {log.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-900 dark:text-white mb-1">{log.message}</p>
                {log.ai_model_name && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    AI Model: {log.ai_provider_name} {log.ai_model_name} | Cost: ${log.execution_cost?.toFixed(4)} | Tokens: {log.total_tokens}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Analytics Tab Component
const AnalyticsTab = ({ analytics, userUsage }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cost by Provider */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost by AI Provider</h3>
        <div className="space-y-3">
          {analytics.slice(0, 5).map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">{item.ai_provider_name}</span>
              <span className="font-semibold text-green-600">${item.total_cost?.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Users by Usage */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Users by Cost</h3>
        <div className="space-y-3">
          {userUsage.slice(0, 5).map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">{item.user_email || 'Unknown User'}</span>
              <span className="font-semibold text-blue-600">${item.total_cost?.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Performance Tab Component
const PerformanceTab = ({ performance }) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {performance.slice(0, 6).map((item, index) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.ai_provider_name}</span>
              <span className="text-sm font-semibold text-green-600">{item.success_rate_percentage}%</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Executions: {item.total_executions}</p>
              <p>Avg Time: {item.avg_execution_time_ms}ms</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Errors Tab Component
const ErrorsTab = ({ errorAnalysis }) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Error Analysis</h3>
      <div className="space-y-4">
        {errorAnalysis.slice(0, 10).map((error, index) => (
          <div key={index} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-semibold text-red-800 dark:text-red-200">{error.error_code || 'Unknown Error'}</span>
                <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs">
                  {error.bug_category}
                </span>
              </div>
              <span className="text-sm text-red-600 dark:text-red-400">{error.error_count} occurrences</span>
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              <p>Provider: {error.ai_provider_name} | Model: {error.ai_model_name}</p>
              <p>Affected Users: {error.affected_users} | Cost of Errors: ${error.cost_of_errors?.toFixed(4)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default LogsDashboard

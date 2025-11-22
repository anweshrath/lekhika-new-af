import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  Users,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { tokenAnalyticsService } from '../../services/tokenAnalyticsService'
import toast from 'react-hot-toast'

const TokenAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedView, setSelectedView] = useState('overview') // overview, users, engines, trends

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  const views = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'users', label: 'Top Users', icon: Users },
    { value: 'engines', label: 'Engine Analytics', icon: Target },
    { value: 'trends', label: 'Daily Trends', icon: TrendingUp }
  ]

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await tokenAnalyticsService.getSuperAdminTokenAnalytics(selectedPeriod)
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading token analytics:', error)
      toast.error('Failed to load token analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalytics()
    setRefreshing(false)
    toast.success('Token analytics refreshed')
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const formatCost = (cost) => {
    return `$${cost.toFixed(4)}`
  }

  const exportData = () => {
    if (!analytics) return
    
    const dataToExport = {
      period: selectedPeriod,
      generated_at: new Date().toISOString(),
      ...analytics
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `token-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Analytics data exported')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Token Analytics Dashboard</h2>
          <p className="text-gray-400 mt-1">System-wide token usage and cost analytics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={exportData}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
        {views.map((view) => {
          const Icon = view.icon
          return (
            <button
              key={view.value}
              onClick={() => setSelectedView(view.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === view.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{view.label}</span>
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.summary.totalUsers}
                  </p>
                </div>
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Tokens</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(analytics.summary.totalTokens)}
                  </p>
                </div>
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Cost</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCost(analytics.summary.totalCost)}
                  </p>
                </div>
                <div className="p-3 bg-green-600 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.summary.successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-orange-600 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top Engines */}
          {analytics.byEngine.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Top Engines by Usage</h3>
              <div className="space-y-4">
                {analytics.byEngine.slice(0, 5).map((engine, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{engine.name}</p>
                        <p className="text-sm text-gray-400">{engine.executions} executions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {formatNumber(engine.tokens)} tokens
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatCost(engine.cost)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Top Users Tab */}
      {selectedView === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Top Users by Token Usage</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Total Tokens</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Total Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Executions</th>
                </tr>
              </thead>
              <tbody>
                {analytics.byUser.map((user, index) => (
                  <tr key={user.user.id} className="border-b border-gray-700">
                    <td className="py-3 px-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-white">{user.user.full_name || user.user.email}</p>
                        <p className="text-sm text-gray-400">{user.user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {formatNumber(user.tokens)}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {formatCost(user.cost)}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {user.executions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Engine Analytics Tab */}
      {selectedView === 'engines' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {analytics.byEngine.map((engine, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{engine.name}</h3>
                  <p className="text-gray-400">{engine.executions} total executions</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{formatNumber(engine.tokens)}</p>
                  <p className="text-gray-400">tokens used</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Cost</p>
                  <p className="text-xl font-semibold text-white">{formatCost(engine.cost)}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Avg Tokens/Execution</p>
                  <p className="text-xl font-semibold text-white">
                    {formatNumber(engine.executions > 0 ? engine.tokens / engine.executions : 0)}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Avg Cost/Execution</p>
                  <p className="text-xl font-semibold text-white">
                    {formatCost(engine.executions > 0 ? engine.cost / engine.executions : 0)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Daily Trends Tab */}
      {selectedView === 'trends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Daily Usage Trends</h3>
          <div className="space-y-4">
            {analytics.recentExecutions.slice(0, 10).map((execution) => (
              <div key={execution.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {execution.ai_engines?.name || 'Unknown Engine'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {execution.users?.email || 'Unknown User'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {formatNumber(execution.tokens_used || 0)} tokens
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatCost(execution.cost_estimate || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default TokenAnalyticsDashboard

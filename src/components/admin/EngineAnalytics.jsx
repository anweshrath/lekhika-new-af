import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react'
// COMMENTED OUT - FAKE ENGINE SERVICE
// import { aiEngineService } from '../../services/aiEngineService'

const EngineAnalytics = ({ engines, serviceStatus }) => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    loadAnalytics()
  }, [engines, timeRange])

  const loadAnalytics = async () => {
    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // const data = await aiEngineService.getEngineAnalytics()
      const data = {}
      
      // Calculate additional metrics
      const enhancedAnalytics = {
        ...data,
        healthScore: calculateHealthScore(engines, serviceStatus),
        performanceMetrics: calculatePerformanceMetrics(engines, serviceStatus),
        usageStats: calculateUsageStats(engines),
        recommendations: generateRecommendations(engines, serviceStatus)
      }
      
      setAnalytics(enhancedAnalytics)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateHealthScore = (engines, serviceStatus) => {
    if (engines.length === 0) return 0

    let totalScore = 0
    let totalEngines = engines.length

    engines.forEach(engine => {
      let engineScore = 0
      
      // Active status (20%)
      if (engine.active) engineScore += 20
      
      // Model availability (40%)
      const workingModels = engine.models.filter(model => 
        serviceStatus[model.service]?.valid
      ).length
      const modelScore = engine.models.length > 0 ? (workingModels / engine.models.length) * 40 : 0
      engineScore += modelScore
      
      // Fallback configuration (20%)
      if (engine.fallbackConfig?.enabled) engineScore += 20
      
      // Task assignments (20%)
      if (engine.taskAssignments?.length > 0) engineScore += 20
      
      totalScore += engineScore
    })

    return Math.round(totalScore / totalEngines)
  }

  const calculatePerformanceMetrics = (engines, serviceStatus) => {
    const metrics = {
      totalModels: 0,
      workingModels: 0,
      averageModelsPerEngine: 0,
      fallbackEnabled: 0,
      parallelEngines: 0
    }

    engines.forEach(engine => {
      metrics.totalModels += engine.models.length
      metrics.workingModels += engine.models.filter(model => 
        serviceStatus[model.service]?.valid
      ).length
      
      if (engine.fallbackConfig?.enabled) metrics.fallbackEnabled++
      if (engine.executionMode === 'parallel') metrics.parallelEngines++
    })

    metrics.averageModelsPerEngine = engines.length > 0 ? 
      Math.round((metrics.totalModels / engines.length) * 10) / 10 : 0

    return metrics
  }

  const calculateUsageStats = (engines) => {
    const stats = {
      taskDistribution: {},
      tierDistribution: {},
      executionModes: {}
    }

    engines.forEach(engine => {
      // Task distribution
      engine.taskAssignments?.forEach(task => {
        stats.taskDistribution[task] = (stats.taskDistribution[task] || 0) + 1
      })

      // Tier distribution
      const tier = engine.tier || 'unassigned'
      stats.tierDistribution[tier] = (stats.tierDistribution[tier] || 0) + 1

      // Execution modes
      stats.executionModes[engine.executionMode] = (stats.executionModes[engine.executionMode] || 0) + 1
    })

    return stats
  }

  const generateRecommendations = (engines, serviceStatus) => {
    const recommendations = []

    // Check for engines without fallback
    const noFallback = engines.filter(e => !e.fallbackConfig?.enabled).length
    if (noFallback > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Enable Fallback Systems',
        description: `${noFallback} engines don't have fallback enabled. This could cause failures.`,
        action: 'Configure fallback for all engines'
      })
    }

    // Check for offline services
    const offlineServices = Object.entries(serviceStatus).filter(([_, status]) => !status?.valid)
    if (offlineServices.length > 0) {
      recommendations.push({
        type: 'error',
        title: 'Service Connectivity Issues',
        description: `${offlineServices.length} AI services are offline: ${offlineServices.map(([name]) => name).join(', ')}`,
        action: 'Check API keys and service status'
      })
    }

    // Check for unassigned engines
    const unassigned = engines.filter(e => !e.taskAssignments || e.taskAssignments.length === 0).length
    if (unassigned > 0) {
      recommendations.push({
        type: 'info',
        title: 'Unassigned Engines',
        description: `${unassigned} engines have no task assignments.`,
        action: 'Assign tasks to optimize engine utilization'
      })
    }

    // Performance recommendations
    const parallelEngines = engines.filter(e => e.executionMode === 'parallel').length
    if (parallelEngines === 0 && engines.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Consider Parallel Processing',
        description: 'No engines are configured for parallel execution. This could improve performance.',
        action: 'Configure some engines for parallel processing'
      })
    }

    return recommendations
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Unable to load analytics data. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Health Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.healthScore}%</p>
            </div>
            <div className={`p-3 rounded-full ${
              analytics.healthScore >= 80 ? 'bg-green-100' :
              analytics.healthScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <CheckCircle className={`w-6 h-6 ${
                analytics.healthScore >= 80 ? 'text-green-600' :
                analytics.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Engines</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeEngines}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Working Models</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.performanceMetrics.workingModels}/{analytics.performanceMetrics.totalModels}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Models/Engine</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.performanceMetrics.averageModelsPerEngine}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Modes</h3>
          <div className="space-y-3">
            {Object.entries(analytics.usageStats.executionModes).map(([mode, count]) => (
              <div key={mode} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{mode}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / engines.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-900 font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.usageStats.tierDistribution).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{tier}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(count / engines.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-900 font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        {analytics.recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-600 font-medium">All systems optimal!</p>
            <p className="text-gray-600 text-sm">No recommendations at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                rec.type === 'error' ? 'border-red-200 bg-red-50' :
                rec.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded ${
                    rec.type === 'error' ? 'text-red-600' :
                    rec.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {rec.type === 'error' ? <AlertTriangle className="w-5 h-5" /> :
                     rec.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                     <Target className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                    <p className="text-xs text-gray-600 mt-2">Action: {rec.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EngineAnalytics

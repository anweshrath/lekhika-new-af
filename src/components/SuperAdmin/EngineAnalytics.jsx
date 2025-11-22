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
        title: 'Consider

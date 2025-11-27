import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  Cpu,
  Users,
  Activity,
  RefreshCw,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const RoutingStrategySelector = () => {
  const [strategies, setStrategies] = useState([])
  const [currentStrategy, setCurrentStrategy] = useState(null)
  const [routingMetrics, setRoutingMetrics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRoutingConfig()
  }, [])

  const loadRoutingConfig = async () => {
    try {
      const response = await fetch('http://103.190.93.28:3001/orchestration/routing/config')
      if (response.ok) {
        const data = await response.json()
        setStrategies(data.availableStrategies || [])
        setCurrentStrategy(data.strategy)
        setRoutingMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Failed to load routing config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetStrategy = async (strategyId) => {
    try {
      const response = await fetch(`http://103.190.93.28:3001/orchestration/routing/strategy/${strategyId}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setCurrentStrategy(strategyId)
        toast.success(`Routing strategy changed to: ${strategyId.replace('_', ' ')}`)
        loadRoutingConfig()
      } else {
        toast.error('Failed to change routing strategy')
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`)
    }
  }

  const getStrategyIcon = (strategyId) => {
    const icons = {
      round_robin: BarChart3,
      least_loaded: Activity,
      weighted: TrendingUp,
      health_based: CheckCircle,
      affinity_based: Target,
      priority_based: Zap,
      latency_based: Clock,
      capacity_aware: Cpu,
      sticky_session: Users,
      resource_based: Cpu
    }
    return icons[strategyId] || Activity
  }

  const getStrategyColor = (strategyId) => {
    const colors = {
      round_robin: 'blue',
      least_loaded: 'green',
      weighted: 'purple',
      health_based: 'emerald',
      affinity_based: 'orange',
      priority_based: 'red',
      latency_based: 'yellow',
      capacity_aware: 'cyan',
      sticky_session: 'pink',
      resource_based: 'indigo'
    }
    return colors[strategyId] || 'gray'
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            Routing Strategy
          </h2>
          <p className="text-gray-400 mt-1">
            Choose how jobs are distributed across workers
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadRoutingConfig}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </motion.button>
      </div>

      {/* Current Strategy Banner */}
      {currentStrategy && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Active Strategy:</p>
                <p className="text-lg font-bold text-white">
                  {currentStrategy.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
            {routingMetrics && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Routed:</p>
                <p className="text-2xl font-bold text-blue-400">{routingMetrics.totalRouted}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.map((strategy, index) => {
          const Icon = getStrategyIcon(strategy.id)
          const color = getStrategyColor(strategy.id)
          const isActive = currentStrategy === strategy.id

          return (
            <motion.button
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSetStrategy(strategy.id)}
              className={`
                p-5 rounded-xl border-2 text-left transition-all duration-300
                ${isActive
                  ? `border-${color}-500 bg-${color}-500/20 shadow-lg shadow-${color}-500/20`
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-6 h-6 ${isActive ? `text-${color}-400` : 'text-gray-400'}`} />
                {isActive && (
                  <CheckCircle className={`w-5 h-5 text-${color}-400`} />
                )}
              </div>

              <h3 className={`font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                {strategy.name}
              </h3>

              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                {strategy.description}
              </p>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Use case:</span> {strategy.useCase}
                </p>
              </div>

              {isActive && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>ACTIVE</span>
                  </div>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Routing Metrics */}
      {routingMetrics && routingMetrics.byWorker && routingMetrics.byWorker.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl border border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Routing Distribution
          </h3>

          <div className="space-y-3">
            {routingMetrics.byWorker.map((metric) => (
              <div key={metric.workerId} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300 font-mono">{metric.workerId}</span>
                    <span className="text-sm text-gray-400">{metric.count} jobs ({metric.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default RoutingStrategySelector


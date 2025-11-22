import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  PieChart,
  BookOpen,
  Cpu,
  Gauge,
  Download,
  File,
  FileCheck
} from 'lucide-react'
import { tokenAnalyticsService } from '../services/tokenAnalyticsService'
import { useUserAuth } from '../contexts/UserAuthContext'
import useTokenWallet from '../hooks/useTokenWallet'
import UltraCard from './UltraCard'
import UltraButton from './UltraButton'
import UltraLoader from './UltraLoader'
import { ultraToast } from '../utils/ultraToast'

const TokenUsageDashboard = () => {
  const { user } = useUserAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedLimit, setSelectedLimit] = useState(10)
  const [refreshing, setRefreshing] = useState(false)
  const { stats: walletStats, loading: walletLoading } = useTokenWallet()

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  const executionLimits = [
    { value: 5, label: '5 executions' },
    { value: 10, label: '10 executions' },
    { value: 50, label: '50 executions' },
    { value: 100, label: '100 executions' }
  ]

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user, selectedPeriod])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const userId = user?.user_id || user?.id
      console.log('🔍 Token Analytics - User object:', user)
      console.log('🔍 Token Analytics - Using userId:', userId)
      if (!userId) {
        throw new Error('User ID not found')
      }

      const data = await tokenAnalyticsService.getUserTokenAnalytics(userId, selectedPeriod)
      console.log('📊 Token Analytics data:', data)
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading token analytics:', error)
      ultraToast.error('Failed to load token usage data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalytics()
    setRefreshing(false)
    ultraToast.success('Token usage data refreshed')
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const formatDuration = (seconds = 0) => {
    if (!seconds || Number.isNaN(seconds)) return '—'
    const totalSeconds = Math.max(0, Math.round(seconds))
    if (totalSeconds < 60) {
      return `${totalSeconds}s`
    }
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDateTime = (value) => {
    if (!value) return '—'
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(value))
    } catch (error) {
      return value
    }
  }

  const getStatusBadge = (status = '') => {
    const normalized = status.toLowerCase()
    const styles = {
      completed: { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
      running: { background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
      failed: { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
      cancelled: { background: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af' }
    }
    const style = styles[normalized] || styles.completed
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
        style={style}
      >
        {normalized || 'completed'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ background: 'var(--color-background)' }}>
        <UltraLoader type="pulse" size="lg" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8" style={{ background: 'var(--color-background)' }}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>No token usage data available</p>
      </div>
    )
  }

  const {
    summary,
    byEngine = [],
    flowBreakdown = [],
    modelBreakdown = [],
    recentExecutions = [],
    topEngines = []
  } = analytics
  const limitedExecutions = recentExecutions.slice(0, selectedLimit)
  const primaryEngineUsage = topEngines.length > 0 ? topEngines : byEngine
  const avgDurationSeconds =
    limitedExecutions.length > 0
      ? limitedExecutions.reduce((sum, exec) => sum + (exec.durationSeconds || 0), 0) / limitedExecutions.length
      : 0

  const formattedEngines = primaryEngineUsage.map(engine => ({
    name: engine.name || 'Unnamed Engine',
    tokens: engine.tokens || 0,
    executions: engine.executions || 0,
    models: engine.models || []
  }))

  // SURGICAL FIX: ALWAYS use wallet balance, NEVER use summary.totalTokens (that's historical usage, not balance)
  // summary.totalTokens = total tokens USED historically (431k), NOT the wallet balance
  // walletStats.total = actual wallet balance (currentTokens + lifetimeTokens)
  const totalAllocated = walletStats.total || walletStats.rawTotal || 0 // NEVER fallback to summary.totalTokens
  const totalUsed = walletStats.used || 0 // NEVER fallback to summary.totalTokens
  const totalAvailable = walletStats.available != null
    ? walletStats.available
    : Math.max(totalAllocated - totalUsed, 0)

  const summaryCards = [
    {
      label: 'Tokens Used',
      value: formatNumber(totalUsed),
      subtitle: `${formatNumber(totalAllocated)} allocated · ${formatNumber(totalAvailable)} available`,
      icon: Zap,
      accent: 'var(--theme-primary)'
    },
    {
      label: 'Active Engines',
      value: formatNumber(formattedEngines.length),
      subtitle: `${formattedEngines.length} engines with recent activity`,
      icon: Cpu,
      accent: 'var(--theme-secondary)',
      detail: formattedEngines
    },
    {
      label: 'Avg Tokens / Execution',
      value: formatNumber(summary.avgTokensPerExecution),
      subtitle: `Across ${summary.completedExecutions} successful runs`,
      icon: Gauge,
      accent: 'var(--theme-accent)'
    },
    {
      label: 'Success Rate',
      value: `${summary.successRate.toFixed(1)}%`,
      subtitle: `${summary.completedExecutions} completed · ${summary.failedExecutions} failed`,
      icon: CheckCircle,
      accent: 'var(--theme-success)'
    }
  ]

  return (
    <div className="space-y-6" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">
            Token Usage Analytics
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
              <Zap className="h-3.5 w-3.5 text-emerald-300" />
              {formatNumber(walletStats.used || 0)}
              <span className="text-[11px] font-medium">
                {' '}/ {formatNumber(walletStats.total || walletStats.rawTotal || 0)} tokens
              </span>
            </span>
            <span>
              {summary?.totalExecutions || 0} executions · {summary?.completedExecutions || 0} completed · {summary?.failedExecutions || 0} failed
            </span>
            {walletStats.total > 0 && (
              <span>
                {formatNumber(walletStats.remaining)} tokens remaining
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-lg focus:shadow-lg focus:outline-none"
            style={{ 
              background: 'var(--color-surface)', 
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)'
            }}
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>

          <select
            value={selectedLimit}
            onChange={(e) => setSelectedLimit(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-lg focus:shadow-lg focus:outline-none"
            style={{ 
              background: 'var(--color-surface)', 
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)'
            }}
          >
            {executionLimits.map(limit => (
              <option key={limit.value} value={limit.value}>
                {limit.label}
              </option>
            ))}
          </select>

          <UltraButton
            variant="primary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Refresh
          </UltraButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.06)',
              transition: { duration: 0.2 }
            }}
          >
            <UltraCard className="p-6 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    {card.label}
                  </p>
                  <p className="text-3xl font-extrabold text-gradient tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    {card.subtitle}
                  </p>
                </div>
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: `${card.accent}20`,
                    color: card.accent
                  }}
                >
                  <card.icon className="w-5 h-5" />
                </div>
              </div>

              {Array.isArray(card.detail) && card.detail.length > 0 && (
                <div className="mt-4 space-y-2">
                  {card.detail.map(engine => (
                    <div key={engine.name} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                          {engine.name}
                        </span>
                        <span className="ml-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {engine.executions} runs
                        </span>
                      </div>
                      <div className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        {formatNumber(engine.tokens)} tokens
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </UltraCard>
          </motion.div>
        ))}
      </div>

      {/* Engine & Model Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <UltraCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gradient">Usage by Engine</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Tokens & executions across your engines
                </p>
              </div>
            </div>
            {primaryEngineUsage.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No engine activity yet.</p>
            ) : (
              <div className="space-y-4">
                {primaryEngineUsage.map((engine, index) => (
                  <motion.div
                    key={`${engine.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                          {engine.name}
                        </p>
                        <p className="text-xs mt-1 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                          {engine.kind || engine.modelType || 'General Workflow'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gradient">{formatNumber(engine.tokens)} tokens</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {engine.executions} runs
                          </p>
                        </div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--theme-primary)15' }}
                        >
                          <Cpu className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-2 mt-3 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-hover)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(engine.share || 0, 1) * 100}%`,
                          background: 'var(--theme-primary)'
                        }}
                      />
                    </div>
                    {engine.models && engine.models.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {engine.models.map(modelKey => (
                          <span
                            key={`${engine.name}-${modelKey}`}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
                            style={{
                              backgroundColor: 'rgba(59,130,246,0.12)',
                              color: 'var(--theme-primary)'
                            }}
                          >
                            {modelKey}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </UltraCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <UltraCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gradient">Model Mix</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Distribution across AI models & providers
                </p>
              </div>
            </div>
            {modelBreakdown && modelBreakdown.length > 0 ? (
              <div className="space-y-4">
                {modelBreakdown.slice(0, 6).map((model, index) => (
                  <motion.div
                    key={`${model.model}-${index}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl border hover:shadow-md transition-all duration-200"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                          {model.model}
                        </p>
                        <p className="uppercase text-xs tracking-wide mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {model.provider || 'Unknown Provider'}
                        </p>
                        {model.engines.length > 0 && (
                          <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
                            Engines: {model.engines.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gradient">
                          {formatNumber(model.tokens)} tokens
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {model.executions} runs · {(model.share * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-2 mt-3 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-hover)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(model.share || 0, 1) * 100}%`,
                          background: 'var(--theme-secondary)'
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No model data found.</p>
            )}
          </UltraCard>
        </motion.div>
      </div>

      {/* Flow Insights */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <UltraCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gradient">Flow Category Breakdown</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Token share by content type
                </p>
              </div>
              <PieChart className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
            </div>
            {flowBreakdown && flowBreakdown.length > 0 ? (
              <div className="space-y-3">
                {flowBreakdown.slice(0, 6).map((flow, index) => (
                  <div
                    key={`${flow.label}-${index}`}
                    className="p-3 rounded-xl"
                    style={{ background: 'var(--color-surface)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(99,102,241,0.15)' }}
                        >
                          <BookOpen className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                            {flow.label}
                          </p>
                          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                            {formatNumber(flow.tokens)} tokens · {(flow.share * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {flow.executions} executions
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-2 mt-3 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-hover)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(flow.share || 0, 1) * 100}%`,
                          background: 'var(--theme-accent)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No flow analytics available.</p>
            )}
          </UltraCard>
        </motion.div>
      </div>

      {/* Recent Executions */}
      {limitedExecutions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <UltraCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gradient">
                Recent Executions
              </h3>
              <select
                value={selectedLimit}
                onChange={(e) => setSelectedLimit(parseInt(e.target.value))}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                style={{ 
                  background: 'var(--color-surface)', 
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                {executionLimits.map(limit => (
                  <option key={limit.value} value={limit.value}>
                    {limit.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>Flow</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>Category</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>Models</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>Tokens</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>Duration</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>Status</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {limitedExecutions.map((execution, index) => (
                    <motion.tr 
                      key={execution.id} 
                      className="hover:shadow-md transition-all duration-200 cursor-pointer"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                      whileHover={{ backgroundColor: 'var(--color-surface-hover)' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{execution.flowTitle || 'Untitled Flow'}</span>
                          <span className="text-xs uppercase tracking-wide mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            {execution.engineName || 'Unknown Engine'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ 
                          backgroundColor: 'rgba(99,102,241,0.15)',
                          color: 'var(--theme-primary)'
                        }}>
                          {execution.flowCategory || execution.engineKind || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap gap-2">
                            {(execution.models && execution.models.length > 0
                              ? execution.models
                              : [execution.model || 'Unknown Model']
                            ).map(modelKey => (
                              <span
                                key={`${execution.id}-${modelKey}`}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                                style={{
                                  backgroundColor: 'rgba(14,165,233,0.12)',
                                  color: 'var(--theme-secondary)'
                                }}
                              >
                                {modelKey}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                            {execution.provider || 'Unknown Provider'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gradient font-semibold">
                        {formatNumber(execution.tokens || execution.tokens_used || 0)}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>
                        {formatDuration(execution.durationSeconds)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(execution.status)}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                        {formatDateTime(execution.createdAt)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </UltraCard>
        </motion.div>
      )}

      {!primaryEngineUsage.length && !limitedExecutions.length && (
        <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
          No detailed token usage data available yet. Run some executions to populate analytics.
              </div>
      )}
    </div>
  )
}

export default TokenUsageDashboard

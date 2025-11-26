import React from 'react'
import { motion } from 'framer-motion'
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react'

/**
 * CREDIT USAGE BAR - Visual credit usage indicator
 * Shows current usage vs limit with color-coded warnings
 */
const CreditUsageBar = ({
  used = 0,
  total = 1000,
  label = 'Credits',
  showNumbers = true,
  size = 'md', // sm, md, lg
  warningThreshold = 0.75, // Show warning at 75%
  dangerThreshold = 0.9, // Show danger at 90%
  animated = true,
  className = ''
}) => {
  const percentage = total > 0 ? (used / total) * 100 : 0
  const remaining = Math.max(0, total - used)
  
  // Determine color based on usage
  const getColor = () => {
    const ratio = used / total
    if (ratio >= dangerThreshold) {
      return {
        gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        icon: AlertTriangle,
        status: 'danger'
      }
    } else if (ratio >= warningThreshold) {
      return {
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        icon: AlertTriangle,
        status: 'warning'
      }
    } else {
      return {
        gradient: 'var(--theme-gradient-primary)',
        icon: CheckCircle,
        status: 'good'
      }
    }
  }

  const colorConfig = getColor()
  const StatusIcon = colorConfig.icon

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {label}
          </span>
        </div>
        
        {showNumbers && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-gradient">
              {used.toLocaleString()}
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              / {total.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div 
        className={`progress-ultra ${sizeClasses[size]} relative`}
        style={{
          background: 'var(--color-surface)',
          borderRadius: '9999px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)'
        }}
      >
        <motion.div
          className="h-full relative"
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? {
            duration: 1.5,
            ease: [0.4, 0, 0.2, 1]
          } : {}}
          style={{
            background: colorConfig.gradient,
            borderRadius: 'inherit'
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'shimmer 2s infinite'
            }}
          />
        </motion.div>
      </div>

      {/* Status Info */}
      <div className="flex items-center justify-between mt-2">
        <motion.div 
          className="flex items-center gap-2"
          initial={animated ? { opacity: 0, x: -10 } : {}}
          animate={{ opacity: 1, x: 0 }}
          transition={animated ? { delay: 0.5 } : {}}
        >
          <StatusIcon 
            className="w-4 h-4" 
            style={{ 
              color: colorConfig.status === 'danger' 
                ? '#EF4444' 
                : colorConfig.status === 'warning'
                ? '#F59E0B'
                : '#10B981'
            }} 
          />
          <span 
            className="text-xs font-semibold"
            style={{
              color: colorConfig.status === 'danger' 
                ? '#EF4444' 
                : colorConfig.status === 'warning'
                ? '#F59E0B'
                : '#10B981'
            }}
          >
            {remaining.toLocaleString()} remaining
          </span>
        </motion.div>
        
        <motion.span
          className="text-xs font-bold"
          style={{ color: 'var(--theme-primary)' }}
          initial={animated ? { opacity: 0, x: 10 } : {}}
          animate={{ opacity: 1, x: 0 }}
          transition={animated ? { delay: 0.5 } : {}}
        >
          {percentage.toFixed(1)}% used
        </motion.span>
      </div>
    </div>
  )
}

export default CreditUsageBar


import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * STAT CARD - Beautiful stat display with trend indicators
 */
const StatCard = ({
  label,
  value,
  unit = '',
  icon: Icon,
  trend, // { direction: 'up'|'down'|'neutral', value: '12%', label: 'vs last month' }
  gradient = false,
  color = 'var(--theme-primary)',
  animated = true,
  onClick,
  className = ''
}) => {
  
  const getTrendIcon = () => {
    if (!trend) return null
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />
      case 'down':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return 'var(--color-text-muted)'
    switch (trend.direction) {
      case 'up':
        return '#10B981' // Green
      case 'down':
        return '#EF4444' // Red
      default:
        return 'var(--color-text-muted)'
    }
  }

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: gradient ? 'var(--theme-gradient-surface)' : 'var(--color-surface)',
        border: '1px solid var(--color-border)'
      }}
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={animated ? {
        type: "spring",
        stiffness: 100
      } : {}}
      whileHover={onClick ? {
        y: -4,
        boxShadow: '0 10px 40px -10px var(--theme-primary)',
        borderColor: color
      } : {}}
      onClick={onClick}
    >
      {/* Icon */}
      {Icon && (
        <motion.div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md"
          style={{
            background: gradient ? color : `linear-gradient(135deg, ${color}, ${color}90)`
          }}
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      )}

      {/* Label */}
      <p 
        className="text-sm font-semibold mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </p>

      {/* Value */}
      <motion.div
        className="text-4xl font-black text-gradient mb-2"
        initial={animated ? { scale: 0 } : {}}
        animate={{ scale: 1 }}
        transition={animated ? {
          type: "spring",
          delay: 0.2,
          stiffness: 200
        } : {}}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && (
          <span className="text-lg ml-1" style={{ color: 'var(--color-text-muted)' }}>
            {unit}
          </span>
        )}
      </motion.div>

      {/* Trend Indicator */}
      {trend && (
        <motion.div
          className="flex items-center gap-2"
          initial={animated ? { opacity: 0, x: -10 } : {}}
          animate={{ opacity: 1, x: 0 }}
          transition={animated ? { delay: 0.4 } : {}}
        >
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{
              background: `${getTrendColor()}20`,
              color: getTrendColor()
            }}
          >
            {getTrendIcon()}
            <span>{trend.value}</span>
          </div>
          {trend.label && (
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {trend.label}
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default StatCard


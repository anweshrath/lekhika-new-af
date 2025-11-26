import React from 'react'
import { motion } from 'framer-motion'

/**
 * ULTRA PROGRESS - Animated progress bar with gradient
 */
const UltraProgress = ({
  value = 0, // 0-100
  showLabel = true,
  label,
  size = 'md', // sm, md, lg
  animated = true,
  className = ''
}) => {
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-sm font-bold text-gradient">
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`progress-ultra ${sizeClasses[size]}`} style={{
        background: 'var(--color-surface)',
        borderRadius: '9999px',
        overflow: 'hidden'
      }}>
        <motion.div
          className="progress-ultra-bar"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{
            duration: animated ? 0.5 : 0,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{
            height: '100%',
            background: 'var(--theme-gradient-primary)',
            borderRadius: 'inherit',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default UltraProgress


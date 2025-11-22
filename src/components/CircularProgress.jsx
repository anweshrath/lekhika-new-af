import React from 'react'
import { motion } from 'framer-motion'

/**
 * CIRCULAR PROGRESS - Beautiful circular progress indicator
 * Perfect for profile completion, skill levels, goals
 */
const CircularProgress = ({
  value = 0, // 0-100
  size = 120,
  strokeWidth = 8,
  color = 'var(--theme-primary)',
  backgroundColor = 'var(--color-surface-hover)',
  showPercentage = true,
  label,
  icon: Icon,
  animated = true,
  glowing = false,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
          animate={{ strokeDashoffset: offset }}
          transition={animated ? {
            duration: 1.5,
            ease: [0.4, 0, 0.2, 1]
          } : {}}
          style={{
            filter: glowing ? `drop-shadow(0 0 8px ${color})` : 'none'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
        style={{ width: size * 0.7, height: size * 0.7 }}
      >
        {Icon && (
          <motion.div
            initial={animated ? { scale: 0 } : {}}
            animate={{ scale: 1 }}
            transition={animated ? { delay: 0.5, type: "spring", stiffness: 200 } : {}}
          >
            <Icon 
              className="w-8 h-8 mb-1" 
              style={{ color }}
            />
          </motion.div>
        )}
        {showPercentage && (
          <motion.div
            initial={animated ? { opacity: 0 } : {}}
            animate={{ opacity: 1 }}
            transition={animated ? { delay: 0.8 } : {}}
            className="text-2xl font-black text-gradient"
          >
            {Math.round(value)}%
          </motion.div>
        )}
      </div>
      
      {/* Label */}
      {label && (
        <motion.p
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={animated ? { delay: 1 } : {}}
          className="mt-3 text-sm font-semibold text-center"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {label}
        </motion.p>
      )}
    </div>
  )
}

export default CircularProgress


import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, Lock } from 'lucide-react'

/**
 * MILESTONE TRACKER - Visual milestone progress
 * Shows achievements and locked milestones
 */
const MilestoneTracker = ({
  milestones = [],
  currentValue = 0,
  vertical = false,
  animated = true,
  className = ''
}) => {
  
  return (
    <div className={`${vertical ? 'flex flex-col' : 'flex items-center'} ${className}`}>
      {milestones.map((milestone, index) => {
        const isCompleted = currentValue >= milestone.value
        const isActive = !isCompleted && index === milestones.findIndex(m => currentValue < m.value)
        const isLocked = currentValue < milestone.value && !isActive
        
        return (
          <div 
            key={milestone.id || index}
            className={`${vertical ? 'flex items-start gap-4 mb-6' : 'flex flex-col items-center flex-1'}`}
          >
            {/* Connector line (not for first item in horizontal, not for last in vertical) */}
            {!vertical && index > 0 && (
              <div 
                className="absolute h-1 -ml-2"
                style={{
                  width: '100%',
                  top: '20px',
                  left: '-50%',
                  background: isCompleted 
                    ? 'var(--theme-gradient-primary)' 
                    : 'var(--color-surface-hover)',
                  zIndex: 0
                }}
              />
            )}
            
            {vertical && index > 0 && (
              <div 
                className="absolute w-1 -mt-6 ml-5"
                style={{
                  height: '48px',
                  background: isCompleted 
                    ? 'var(--theme-gradient-primary)' 
                    : 'var(--color-surface-hover)'
                }}
              />
            )}

            {/* Icon/Circle */}
            <motion.div
              className={`relative z-10 rounded-full flex items-center justify-center ${
                isCompleted ? 'shadow-gradient-glow' : ''
              }`}
              style={{
                width: 44,
                height: 44,
                background: isCompleted 
                  ? 'var(--theme-gradient-primary)' 
                  : isActive
                  ? 'var(--color-surface)'
                  : 'var(--color-surface-hover)',
                border: isCompleted 
                  ? 'none'
                  : `3px solid ${isActive ? 'var(--theme-primary)' : 'var(--color-border)'}`
              }}
              initial={animated ? { scale: 0, rotate: -180 } : {}}
              animate={{ scale: 1, rotate: 0 }}
              transition={animated ? {
                delay: index * 0.2,
                type: "spring",
                stiffness: 200
              } : {}}
              whileHover={{ scale: 1.1 }}
            >
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : isLocked ? (
                <Lock className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              ) : (
                <Circle className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
              )}
              
              {/* Pulse animation for active milestone */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: 'var(--theme-primary)' }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.8, 0, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>

            {/* Label */}
            <motion.div
              className={`${vertical ? 'flex-1' : 'text-center mt-3'}`}
              initial={animated ? { opacity: 0, y: 10 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={animated ? { delay: index * 0.2 + 0.3 } : {}}
            >
              <p 
                className="text-sm font-bold mb-1"
                style={{ 
                  color: isCompleted 
                    ? 'var(--theme-primary)' 
                    : isActive 
                    ? 'var(--color-text)' 
                    : 'var(--color-text-muted)' 
                }}
              >
                {milestone.label}
              </p>
              <p 
                className="text-xs font-semibold"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {milestone.value.toLocaleString()} {milestone.unit || ''}
              </p>
              {milestone.reward && isCompleted && (
                <motion.p
                  className="text-xs font-bold mt-1"
                  style={{ color: 'var(--theme-accent)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: index * 0.2 + 0.5 }}
                >
                  🎁 {milestone.reward}
                </motion.p>
              )}
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

export default MilestoneTracker


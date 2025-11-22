import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Zap, Crown, Target, Award, Flame } from 'lucide-react'

/**
 * ULTRA BADGE - Achievement badges with pop animation
 */
const UltraBadge = ({
  type = 'default', // default, achievement, milestone, streak, quality, speed
  value,
  label,
  size = 'md',
  animated = true,
  className = ''
}) => {
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14'
  }

  const badges = {
    achievement: {
      icon: Trophy,
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      borderColor: '#FFD700'
    },
    milestone: {
      icon: Star,
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      borderColor: '#8B5CF6'
    },
    streak: {
      icon: Flame,
      gradient: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)',
      borderColor: '#EF4444'
    },
    quality: {
      icon: Award,
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      borderColor: '#10B981'
    },
    speed: {
      icon: Zap,
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
      borderColor: '#3B82F6'
    },
    default: {
      icon: Crown,
      gradient: 'var(--theme-gradient-primary)',
      borderColor: 'var(--theme-primary)'
    }
  }

  const config = badges[type] || badges.default
  const Icon = config.icon

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 ${className}`}
      initial={animated ? { scale: 0, rotate: -180 } : {}}
      animate={animated ? { scale: 1, rotate: 0 } : {}}
      transition={animated ? {
        type: "spring",
        stiffness: 200,
        damping: 15
      } : {}}
    >
      <motion.div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative shadow-2xl`}
        style={{
          background: config.gradient,
          border: `3px solid ${config.borderColor}`
        }}
        whileHover={animated ? {
          scale: 1.1,
          rotate: [0, -5, 5, -5, 0],
          boxShadow: `0 0 30px ${config.borderColor}`
        } : {}}
        animate={animated ? {
          boxShadow: [
            `0 0 20px ${config.borderColor}`,
            `0 0 40px ${config.borderColor}`,
            `0 0 20px ${config.borderColor}`
          ]
        } : {}}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <Icon className={`${iconSizes[size]} text-white`} />
        
        {value && (
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
              border: '2px solid white',
              color: 'white'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          >
            {value}
          </motion.div>
        )}
      </motion.div>

      {label && (
        <motion.p
          className="text-sm font-bold text-center"
          style={{ color: 'var(--color-text)' }}
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={animated ? { opacity: 1, y: 0 } : {}}
          transition={animated ? { delay: 0.4 } : {}}
        >
          {label}
        </motion.p>
      )}
    </motion.div>
  )
}

export default UltraBadge


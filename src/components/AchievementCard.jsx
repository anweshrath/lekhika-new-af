import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Star, Trophy, Target, Zap, Award } from 'lucide-react'
import UltraProgress from './UltraProgress'

/**
 * ACHIEVEMENT CARD - Shows individual achievement with progress
 */
const AchievementCard = ({
  achievement,
  unlocked = false,
  progress = 0, // 0-100
  animated = true,
  onClick,
  className = ''
}) => {
  
  const rarityColors = {
    common: {
      gradient: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
      glow: '#9CA3AF'
    },
    rare: {
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      glow: '#3B82F6'
    },
    epic: {
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      glow: '#8B5CF6'
    },
    legendary: {
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      glow: '#FFD700'
    }
  }

  const rarity = achievement.rarity || 'common'
  const colors = rarityColors[rarity]

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl cursor-pointer ${className}`}
      style={{
        background: 'var(--color-surface)',
        border: unlocked ? `2px solid ${colors.glow}` : '2px solid var(--color-border)',
        opacity: unlocked ? 1 : 0.6
      }}
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: unlocked ? 1 : 0.6, y: 0 }}
      transition={animated ? { type: "spring", stiffness: 100 } : {}}
      whileHover={unlocked ? { 
        y: -4, 
        boxShadow: `0 10px 40px -10px ${colors.glow}`
      } : {}}
      onClick={onClick}
    >
      {/* Unlocked glow effect */}
      {unlocked && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{ background: colors.gradient }}
        />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: unlocked ? colors.gradient : 'var(--color-surface-hover)'
            }}
            animate={unlocked && animated ? {
              boxShadow: [
                `0 0 20px ${colors.glow}`,
                `0 0 40px ${colors.glow}`,
                `0 0 20px ${colors.glow}`
              ]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {unlocked ? (
              <Trophy className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
            )}
          </motion.div>

          {/* Rarity badge */}
          <motion.div
            className="px-3 py-1 rounded-full text-xs font-black uppercase"
            style={{
              background: colors.gradient,
              color: 'white'
            }}
            whileHover={{ scale: 1.05 }}
          >
            {rarity}
          </motion.div>
        </div>

        {/* Title and Description */}
        <h3 
          className="text-lg font-bold mb-2"
          style={{ 
            color: unlocked ? 'var(--color-text)' : 'var(--color-text-muted)'
          }}
        >
          {achievement.title}
        </h3>
        
        <p 
          className="text-sm mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {achievement.description}
        </p>

        {/* Progress (for locked achievements) */}
        {!unlocked && progress > 0 && (
          <div className="mb-3">
            <UltraProgress
              value={progress}
              size="sm"
              showLabel={true}
              animated={animated}
            />
          </div>
        )}

        {/* Reward */}
        {achievement.reward && (
          <div 
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ 
              color: unlocked ? 'var(--theme-accent)' : 'var(--color-text-muted)'
            }}
          >
            <Star className="w-4 h-4" style={{ 
              color: 'var(--theme-accent)',
              fill: unlocked ? 'var(--theme-accent)' : 'none'
            }} />
            {achievement.reward}
          </div>
        )}

        {/* Unlocked date */}
        {unlocked && achievement.unlockedAt && (
          <p className="text-xs mt-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default AchievementCard


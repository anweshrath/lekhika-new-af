import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Sparkles, Trophy, Star, Zap, Download, Eye, X } from 'lucide-react'
import { useSoundEffects } from '../hooks/useSoundEffects'
import { Confetti } from './ParticleSystem'
import UltraButton from './UltraButton'

/**
 * CELEBRATION MODAL - Maximum dopamine celebration
 * Shows when book generation completes successfully
 */
const CelebrationModal = ({
  isOpen,
  onClose,
  title = 'Success!',
  message = 'Your content has been generated!',
  stats = {},
  onDownload,
  onView
}) => {
  const { playComplete, playSuccess } = useSoundEffects()
  const [confetti, setConfetti] = useState([])
  
  useEffect(() => {
    if (isOpen) {
      playComplete()
      // Generate confetti
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5
      }))
      setConfetti(newConfetti)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Confetti */}
          {confetti.map(piece => (
            <motion.div
              key={piece.id}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                background: piece.color,
                left: `${piece.x}%`,
                top: `${piece.y}%`
              }}
              initial={{ y: -100, rotate: 0, opacity: 1 }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: 720,
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 3,
                delay: piece.delay,
                ease: [0.22, 0.61, 0.36, 1]
              }}
            />
          ))}

          {/* Modal */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="relative max-w-lg w-full rounded-3xl overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              border: '2px solid var(--theme-primary)',
              boxShadow: '0 0 60px var(--theme-primary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button
              className="absolute top-4 right-4 p-2 rounded-lg z-10"
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)'
              }}
            >
              <X className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
            </motion.button>

            {/* Glowing background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'var(--theme-gradient-primary)'
              }}
            />

            {/* Content */}
            <div className="relative p-10 text-center">
              {/* Trophy Icon */}
              <motion.div
                className="mx-auto mb-6"
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  delay: 0.2,
                  stiffness: 200 
                }}
              >
                <div 
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center glow-breathe"
                  style={{
                    background: 'var(--theme-gradient-primary)',
                    boxShadow: '0 10px 40px var(--theme-primary)'
                  }}
                >
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-4xl font-black mb-4 text-gradient-animated"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {title}
              </motion.h2>

              {/* Message */}
              <motion.p
                className="text-lg font-medium mb-8"
                style={{ color: 'var(--color-text-muted)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {message}
              </motion.p>

              {/* Stats */}
              {stats && Object.keys(stats).length > 0 && (
                <motion.div
                  className="grid grid-cols-3 gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {stats.wordCount && (
                    <div 
                      className="p-4 rounded-xl"
                      style={{
                        background: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div className="text-3xl font-black text-gradient mb-1">
                        {stats.wordCount.toLocaleString()}
                      </div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                        Words
                      </div>
                    </div>
                  )}
                  {stats.tokensUsed && (
                    <div 
                      className="p-4 rounded-xl"
                      style={{
                        background: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div className="text-3xl font-black text-gradient mb-1">
                        {stats.tokensUsed.toLocaleString()}
                      </div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                        Tokens
                      </div>
                    </div>
                  )}
                  {stats.timeMs && (
                    <div 
                      className="p-4 rounded-xl"
                      style={{
                        background: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div className="text-3xl font-black text-gradient mb-1">
                        {(stats.timeMs / 1000).toFixed(1)}s
                      </div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                        Time
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {onView && (
                  <UltraButton
                    onClick={onView}
                    icon={Eye}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    View Content
                  </UltraButton>
                )}
                {onDownload && (
                  <UltraButton
                    onClick={onDownload}
                    icon={Download}
                    variant="secondary"
                    size="lg"
                  >
                    Download
                  </UltraButton>
                )}
              </motion.div>

              {/* Sparkles */}
              <div className="absolute top-10 left-10">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-6 h-6" style={{ color: 'var(--theme-accent)' }} />
                </motion.div>
              </div>
              
              <div className="absolute bottom-10 right-10">
                <motion.div
                  animate={{
                    rotate: [360, 0],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Zap className="w-6 h-6" style={{ color: 'var(--theme-secondary)' }} />
                </motion.div>
              </div>

              <div className="absolute top-1/2 left-6">
                <motion.div
                  animate={{
                    y: [-10, 10, -10],
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Star className="w-5 h-5" style={{ color: 'var(--theme-success)', fill: 'var(--theme-success)' }} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CelebrationModal


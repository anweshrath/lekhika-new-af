import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, Zap } from 'lucide-react'

/**
 * ULTRA LOADER - Beautiful loading states
 */
const UltraLoader = ({
  type = 'spinner', // spinner, shimmer, pulse, dots
  size = 'md',
  message,
  fullPage = false
}) => {
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  }

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <div 
              className={`spinner-ultra ${sizeClasses[size]}`}
              style={{
                borderTopColor: 'var(--theme-primary)',
                borderRightColor: 'var(--theme-secondary)'
              }}
            />
          </motion.div>
        )
      
      case 'pulse':
        return (
          <motion.div
            className={`rounded-full ${sizeClasses[size]}`}
            style={{
              background: 'var(--theme-gradient-primary)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-full h-full p-3 text-white" />
          </motion.div>
        )
      
      case 'dots':
        return (
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-4 h-4 rounded-full"
                style={{
                  background: 'var(--theme-primary)'
                }}
                animate={{
                  y: [-10, 10, -10],
                  scale: [1, 1.3, 1]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )
      
      case 'shimmer':
        return (
          <div className={`${sizeClasses[size]} rounded-xl skeleton-ultra`} />
        )
        
      default:
        return (
          <Loader2 className={`${sizeClasses[size]} animate-spin`} style={{ color: 'var(--theme-primary)' }} />
        )
    }
  }

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullPage ? 'min-h-screen' : 'py-12'}`}>
      {renderLoader()}
      {message && (
        <motion.p
          className="text-lg font-semibold"
          style={{ color: 'var(--color-text-muted)' }}
          animate={{
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div 
        className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center"
        style={{
          background: 'var(--color-background)',
          opacity: 0.98
        }}
      >
        {content}
      </div>
    )
  }

  return content
}

/**
 * SKELETON LOADER - For content placeholders
 */
export const SkeletonLoader = ({ 
  type = 'text', // text, card, list, image
  count = 1,
  className = ''
}) => {
  const skeletons = {
    text: (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-ultra h-4 w-full rounded-lg" />
        ))}
      </div>
    ),
    card: (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-ultra h-48 w-full rounded-2xl" />
        ))}
      </div>
    ),
    list: (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton-ultra w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-ultra h-4 w-3/4 rounded-lg" />
              <div className="skeleton-ultra h-3 w-1/2 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    ),
    image: (
      <div className={className}>
        <div className="skeleton-ultra aspect-video rounded-2xl" />
      </div>
    )
  }

  return skeletons[type] || skeletons.text
}

export default UltraLoader


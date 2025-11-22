import React from 'react'
import { motion } from 'framer-motion'

/**
 * ULTRA CARD - Maximum dopamine card component
 * Features: Lift on hover, glow pulse, smooth transitions
 */
const UltraCard = ({
  children,
  onClick,
  className = '',
  hover = true,
  glow = false,
  gradient = false,
  ...props
}) => {
  
  const baseStyle = {
    background: gradient ? 'var(--theme-gradient-surface)' : 'var(--color-surface)',
    borderRadius: '16px',
    border: '1px solid var(--color-border)',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden'
  }

  return (
    <motion.div
      className={`card-ultra ${hover ? 'cursor-ultra' : ''} ${glow ? 'glow-on-hover' : ''} ${className}`}
      style={baseStyle}
      onClick={onClick}
      whileHover={hover ? {
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--theme-primary)'
      } : {}}
      whileTap={onClick && hover ? {
        y: -4,
        scale: 1.01
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default UltraCard


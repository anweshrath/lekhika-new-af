import React from 'react'
import { motion } from 'framer-motion'
import { useSoundEffects } from '../hooks/useSoundEffects'
import { useTheme } from '../contexts/ThemeContext'

/**
 * ULTRA BUTTON - Maximum dopamine button component
 * Features: Gradient background, glow, ripple, shimmer, bounce
 */
const UltraButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary', // primary, secondary, success, danger, ghost
  size = 'md', // sm, md, lg, xl
  fullWidth = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const { playClick, playHover } = useSoundEffects()
  const { currentTheme, isDark } = useTheme()
  
  const handleClick = (e) => {
    if (disabled || loading) return
    playClick()
    onClick?.(e)
  }

  const handleMouseEnter = () => {
    if (!disabled && !loading) {
      playHover()
    }
  }
  
  const baseClasses = 'btn-ultra cursor-ultra relative font-semibold rounded-xl transition-smooth flex items-center justify-center gap-2'
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  }
  
  const variantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    success: 'text-white',
    danger: 'text-white',
    ghost: 'border-2'
  }
  
  const getVariantStyles = () => {
    const primaryGradient = currentTheme.gradients.primary
    const secondaryGradient = `linear-gradient(135deg, ${currentTheme.colors.secondary} 0%, ${currentTheme.colors.accent} 100%)`
    
    return {
      primary: {
        background: primaryGradient,
        border: 'none',
        color: '#FFFFFF'
      },
      secondary: {
        background: secondaryGradient,
        border: 'none',
        color: '#FFFFFF'
      },
      success: {
        background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        border: 'none',
        color: '#FFFFFF'
      },
      danger: {
        background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
        border: 'none',
        color: '#FFFFFF'
      },
      ghost: {
        background: 'transparent',
        border: `2px solid ${currentTheme.colors.primary}`,
        color: currentTheme.colors.primary
      }
    }
  }
  
  const variantStyles = getVariantStyles()
  
  const disabledStyle = {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none'
  }

  return (
    <motion.button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={disabled ? disabledStyle : variantStyles[variant]}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { 
        scale: 1.02,
        boxShadow: `0 10px 40px -10px ${currentTheme.colors.primary}, 0 0 0 1px ${currentTheme.colors.primary}`
      } : {}}
      whileTap={!disabled && !loading ? { 
        scale: 0.98 
      } : {}}
      {...props}
    >
      {loading && (
        <div className="spinner-ultra w-5 h-5" />
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-5 h-5" />
      )}
      
      {!loading && children}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-5 h-5" />
      )}
    </motion.button>
  )
}

export default UltraButton


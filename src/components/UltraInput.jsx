import React, { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * ULTRA INPUT - Maximum dopamine input component
 * Features: Glow on focus, animated border, smooth transitions
 */
const UltraInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold mb-2 transition-smooth" style={{
          color: isFocused ? 'var(--theme-primary)' : 'var(--color-text-secondary)'
        }}>
          {label}
          {required && <span style={{ color: 'var(--theme-error)' }}> *</span>}
        </label>
      )}
      
      <div className="input-ultra-wrapper relative">
        {Icon && (
          <div 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-smooth"
            style={{
              color: isFocused ? 'var(--theme-primary)' : 'var(--color-text-muted)'
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <motion.input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            input-ultra
            w-full
            px-4
            py-3
            rounded-xl
            font-medium
            transition-smooth
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-2' : 'border-2'}
          `}
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderColor: error 
              ? 'var(--theme-error)' 
              : isFocused 
                ? 'var(--theme-primary)' 
                : 'var(--color-border)'
          }}
          whileFocus={{
            scale: 1.01
          }}
          {...props}
        />
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm mt-2 font-medium"
            style={{ color: 'var(--theme-error)' }}
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}

export default UltraInput


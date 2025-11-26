import React from 'react'
import { motion } from 'framer-motion'
import UltraInput from './UltraInput'
import {
  Mail,
  Lock,
  User,
  FileText,
  Hash,
  Link as LinkIcon,
  Calendar,
  DollarSign,
  Phone,
  MapPin,
  Briefcase,
  Tag
} from 'lucide-react'

/**
 * ULTRA FORM FIELD - Ultra-satisfying form field renderer
 * Auto-selects icons based on field name/type
 */
const UltraFormField = ({
  field,
  value,
  onChange,
  error,
  className = ''
}) => {
  
  // Auto-select icon based on field name/type
  const getIcon = (field) => {
    const name = field.name?.toLowerCase() || ''
    const label = field.label?.toLowerCase() || ''
    
    if (name.includes('email') || label.includes('email')) return Mail
    if (name.includes('password')) return Lock
    if (name.includes('name') && !name.includes('username')) return User
    if (name.includes('username')) return User
    if (name.includes('title') || label.includes('title')) return FileText
    if (name.includes('description')) return FileText
    if (name.includes('url') || name.includes('link')) return LinkIcon
    if (name.includes('date')) return Calendar
    if (name.includes('price') || name.includes('cost') || name.includes('amount')) return DollarSign
    if (name.includes('phone')) return Phone
    if (name.includes('address') || name.includes('location')) return MapPin
    if (name.includes('company') || name.includes('business')) return Briefcase
    if (name.includes('tag') || name.includes('category')) return Tag
    if (field.type === 'number') return Hash
    
    return null
  }

  const Icon = field.icon || getIcon(field)

  // Handle different field types
  switch (field.type) {
    case 'textarea':
      return (
        <div className={className}>
          {field.label && (
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              {field.label}
              {field.required && <span style={{ color: 'var(--theme-error)' }}> *</span>}
            </label>
          )}
          <motion.textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows || 4}
            className="input-ultra w-full px-4 py-3 rounded-xl font-medium transition-smooth"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              borderColor: error ? 'var(--theme-error)' : 'var(--color-border)',
              border: '2px solid',
              resize: 'vertical'
            }}
            whileFocus={{
              scale: 1.01,
              boxShadow: '0 0 0 3px var(--theme-primary), 0 10px 40px -10px var(--theme-primary)'
            }}
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
      )

    case 'select':
      return (
        <div className={className}>
          {field.label && (
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              {field.label}
              {field.required && <span style={{ color: 'var(--theme-error)' }}> *</span>}
            </label>
          )}
          <div className="input-ultra-wrapper relative">
            <motion.select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required={field.required}
              className="input-ultra w-full px-4 py-3 rounded-xl font-medium transition-smooth appearance-none"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                borderColor: error ? 'var(--theme-error)' : 'var(--color-border)',
                border: '2px solid'
              }}
              whileFocus={{
                scale: 1.01
              }}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </motion.select>
            {/* Dropdown arrow */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
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
      )

    case 'checkbox':
      return (
        <motion.label
          className={`flex items-center gap-3 cursor-ultra ${className}`}
          whileHover={{ x: 4 }}
        >
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="checkbox-ultra"
          />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {field.label}
          </span>
        </motion.label>
      )

    case 'radio':
      return (
        <div className={className}>
          {field.label && (
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              {field.label}
              {field.required && <span style={{ color: 'var(--theme-error)' }}> *</span>}
            </label>
          )}
          <div className="space-y-2">
            {field.options?.map((option) => (
              <motion.label
                key={option}
                className="flex items-center gap-3 cursor-ultra"
                whileHover={{ x: 4 }}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-5 h-5 transition-smooth"
                  style={{
                    accentColor: 'var(--theme-primary)'
                  }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {option}
                </span>
              </motion.label>
            ))}
          </div>
        </div>
      )

    default:
      // Use UltraInput for text, email, number, etc.
      return (
        <UltraInput
          label={field.label}
          type={field.type || 'text'}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          required={field.required}
          icon={Icon}
          className={className}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      )
  }
}

export default UltraFormField


import React from 'react'
import { 
  Calendar, 
  Upload, 
  Link, 
  Mail, 
  Hash, 
  Type, 
  List, 
  CheckSquare,
  FileText,
  Image,
  Video,
  Music,
  Sparkles,
  Wand2,
  BookOpen,
  Zap,
  Star,
  Trophy,
  Target,
  Play,
  Award,
  Flame,
  Rocket,
  CheckCircle,
  AlertCircle,
  Database,
  Settings
} from 'lucide-react'

const FormFieldRenderer = ({ 
  field, 
  value, 
  onChange, 
  error, 
  disabled = false 
}) => {
  const handleChange = (e) => {
    const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    onChange(field.variable, newValue)
  }

  // Format option values to readable labels (snake_case → Title Case)
  const formatOptionLabel = (value) => {
    if (!value) return ''
    // If value is a number, convert to string first
    if (typeof value === 'number') return String(value)
    
    // Convert to string and format
    const strValue = String(value)
    
    // Convert snake_case or kebab-case to Title Case
    return strValue
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formatFieldName = (name) => {
    if (!name) return ''
    
    // Handle common field names with proper formatting
    const fieldMappings = {
      'book_name': 'Book Name',
      'book_title': 'Book Title',
      'target_audience': 'Target Audience',
      'word_count': 'Word Count',
      'content_type': 'Content Type',
      'tone': 'Tone',
      'genre': 'Genre',
      'description': 'Description',
      'title': 'Title',
      'output_formats': 'Output Formats',
      'outputFormats': 'Output Formats',
      'exportFormats': 'Export Formats',
      'generate_cover': 'Generate Cover',
      'include_toc': 'Include Table of Contents',
      'include_images': 'Include Images',
      'custom_requirements': 'Custom Requirements',
      'additional_requirements': 'Additional Requirements',
      'content_goal': 'Content Goal',
      'tone_style': 'Tone Style',
      'content_length': 'Content Length',
      'customer_industry': 'Industry',
      'customer_tier': 'Plan Tier',
      'customer_goals': 'Goals'
    }
    
    // Check if we have a mapping
    if (fieldMappings[name]) {
      return fieldMappings[name]
    }
    
    // Convert snake_case and camelCase to Title Case
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const getFieldIcon = (type, fieldName = '') => {
    // Try to get icon from field config first
    if (field.icon) {
      const icons = {
        Sparkles, Wand2, BookOpen, FileText, Zap, Star, Trophy, Target,
        Play, Award, Flame, Rocket, CheckCircle, AlertCircle, Database, Settings,
        Calendar, Upload, Link, Mail, Hash, Type, List, CheckSquare, Image, Video, Music
      };
      const IconComponent = icons[field.icon] || Type;
      return <IconComponent className="w-4 h-4 text-blue-400" />;
    }

    // Fallback to type-based icons with smart naming
    const name = fieldName.toLowerCase();
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-blue-400" />
      case 'url': return <Link className="w-4 h-4 text-green-400" />
      case 'number': return <Hash className="w-4 h-4 text-purple-400" />
      case 'date': return <Calendar className="w-4 h-4 text-orange-400" />
      case 'file': return <Upload className="w-4 h-4 text-indigo-400" />
      case 'textarea': return <FileText className="w-4 h-4 text-cyan-400" />
      case 'checkbox': return <CheckSquare className="w-4 h-4 text-pink-400" />
      case 'select': return <List className="w-4 h-4 text-yellow-400" />
      case 'multiselect': return <CheckSquare className="w-4 h-4 text-blue-400" />
      default: 
        // Smart icon selection based on field name
        if (name.includes('book')) return <BookOpen className="w-4 h-4 text-blue-400" />
        if (name.includes('content')) return <Sparkles className="w-4 h-4 text-purple-400" />
        if (name.includes('title')) return <Star className="w-4 h-4 text-yellow-400" />
        if (name.includes('target')) return <Target className="w-4 h-4 text-red-400" />
        if (name.includes('goal')) return <Trophy className="w-4 h-4 text-orange-400" />
        if (name.includes('format') || name.includes('export')) return <CheckSquare className="w-4 h-4 text-blue-400" />
        return <Type className="w-4 h-4 text-gray-400" />
    }
  }

  const renderField = () => {
    const baseClasses = "w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]"
    const baseStyles = {
      background: 'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(255,255,255,0.02) 100%)',
      border: `2px solid ${error ? 'var(--theme-error)' : 'var(--border-subtle)'}`,
      color: 'var(--text-primary)',
      boxShadow: error ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 4px 20px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)'
    }
    const errorClasses = error ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'number':
        return (
          <input
            type={field.type}
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
            className={`${baseClasses} ${errorClasses}`}
            style={baseStyles}
            disabled={disabled}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
            className={`${baseClasses} ${errorClasses} min-h-[100px] resize-y`}
            style={baseStyles}
            disabled={disabled}
            required={field.required}
            rows={field.rows || 4}
          />
        )

      case 'select':
        // If multiple is true, render as multiselect
        if (field.multiple) {
          return (
            <div className="space-y-3">
              {field.options?.map((option, index) => {
                const optionValue = typeof option === 'object' ? option.value : option
                let rawLabel
                if (typeof option === 'object') {
                  rawLabel = option.label || optionValue
                } else {
                  rawLabel = option
                }
                const optionLabel = formatOptionLabel(rawLabel)
                const isSelected = (value || []).includes(optionValue)
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (disabled) return
                      const currentValues = value || []
                      const newValues = isSelected
                        ? currentValues.filter(v => v !== optionValue)
                        : [...currentValues, optionValue]
                      onChange(field.variable, newValues)
                    }}
                    className={`
                      flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03] hover:shadow-lg'}
                      ${isSelected ? 'animate-pulse-glow' : ''}
                    `}
                    style={{
                      borderColor: isSelected ? 'var(--theme-primary)' : 'var(--border-subtle)',
                      background: isSelected 
                        ? 'linear-gradient(135deg, var(--theme-primary-bg) 0%, rgba(59, 130, 246, 0.1) 100%)'
                        : 'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(255,255,255,0.02) 100%)',
                      color: 'var(--text-primary)',
                      boxShadow: isSelected 
                        ? '0 8px 32px rgba(59, 130, 246, 0.3)'
                        : '0 4px 20px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent div onClick
                        className="w-5 h-5 rounded-md focus:ring-2 focus:ring-blue-500 opacity-0 absolute"
                        style={{
                          accentColor: 'var(--theme-primary)'
                        }}
                        disabled={disabled}
                      />
                      <div className={`
                        w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                        ${isSelected 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 shadow-lg' 
                          : 'border-gray-400 bg-transparent group-hover:border-blue-400'
                        }
                      `}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{optionLabel}</div>
                      {typeof option === 'object' && option.description && (
                        <div className="text-sm mt-1 opacity-75" style={{ color: 'var(--text-secondary)' }}>{option.description}</div>
                      )}
                    </div>
                  </div>
                )
              })}
              {(!field.options || field.options.length === 0) && (
                <div className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>No options available</div>
              )}
            </div>
          )
        }
        
        // Regular single select - Custom styled dropdown
        return (
          <div className="relative">
            <select
              value={value || ''}
              onChange={handleChange}
              className={`${baseClasses} ${errorClasses} appearance-none cursor-pointer pr-10`}
              style={{
                ...baseStyles,
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 12px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px'
              }}
              disabled={disabled}
              required={field.required}
            >
              <option value="" disabled>Select an option...</option>
              {field.options?.map((option, index) => {
                const optionValue = typeof option === 'object' ? option.value : option
                const rawLabel = typeof option === 'object' ? (option.label || option.value) : option
                const label = formatOptionLabel(rawLabel)
                return (
                  <option key={index} value={optionValue}>
                    {label}
                  </option>
                )
              })}
            </select>
          </div>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]" 
               style={{
                 borderColor: 'var(--border-subtle)',
                 background: 'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(255,255,255,0.02) 100%)',
                 backdropFilter: 'blur(10px)'
               }}
               onClick={() => {
                 if (!disabled) {
                   onChange(field.variable, !value)
                 }
               }}>
            <div className="relative">
              <input
                type="checkbox"
                checked={value || false}
                onChange={() => {}} // Handled by parent div onClick
                className="w-5 h-5 rounded-md focus:ring-2 focus:ring-blue-500 opacity-0 absolute"
                disabled={disabled}
              />
              <div className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                ${value 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 shadow-lg' 
                  : 'border-gray-400 bg-transparent'
                }
              `}>
                {value && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              {field.label || field.name}
            </span>
          </div>
        )

      case 'multiselect':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option
              const optionLabel = typeof option === 'object' ? option.label : option
              // Ensure value is always an array
              const currentValues = Array.isArray(value) ? value : []
              const isSelected = currentValues.includes(optionValue)
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (disabled) return
                    const newValues = isSelected
                      ? currentValues.filter(v => v !== optionValue)
                      : [...currentValues, optionValue]
                    onChange(field.variable, newValues)
                  }}
                  className={`
                    flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03] hover:shadow-lg'}
                    ${isSelected ? 'animate-pulse-glow' : ''}
                  `}
                  style={{
                    borderColor: isSelected ? 'var(--theme-primary)' : 'var(--border-subtle)',
                    background: isSelected 
                      ? 'linear-gradient(135deg, var(--theme-primary-bg) 0%, rgba(59, 130, 246, 0.1) 100%)'
                      : 'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(255,255,255,0.02) 100%)',
                    color: 'var(--text-primary)',
                    boxShadow: isSelected 
                      ? '0 8px 32px rgba(59, 130, 246, 0.3)'
                      : '0 4px 20px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by parent div onClick
                      className="w-5 h-5 rounded-md focus:ring-2 focus:ring-blue-500 opacity-0 absolute"
                      style={{
                        accentColor: 'var(--theme-primary)'
                      }}
                      disabled={disabled}
                    />
                    <div className={`
                      w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                      ${isSelected 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 shadow-lg' 
                        : 'border-gray-400 bg-transparent group-hover:border-blue-400'
                      }
                    `}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{optionLabel}</div>
                    {typeof option === 'object' && option.description && (
                      <div className="text-sm mt-1 opacity-75" style={{ color: 'var(--text-secondary)' }}>{option.description}</div>
                    )}
                  </div>
                </div>
              )
            })}
            {(!field.options || field.options.length === 0) && (
              <div className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>No options available</div>
            )}
          </div>
        )

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0]
                onChange(field.variable, file)
              }}
              className={`${baseClasses} ${errorClasses} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-600 file:text-white hover:file:bg-orange-700`}
              disabled={disabled}
              accept={field.accept || '*'}
            />
            {value && (
              <div className="text-sm text-gray-400">
                Selected: {value.name || value}
              </div>
            )}
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={handleChange}
            className={`${baseClasses} ${errorClasses}`}
            style={baseStyles}
            disabled={disabled}
            required={field.required}
          />
        )

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              value={value || field.min || 0}
              onChange={handleChange}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              disabled={disabled}
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{field.min || 0}</span>
              <span className="font-medium text-white">{value || field.min || 0}</span>
              <span>{field.max || 100}</span>
            </div>
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
            className={`${baseClasses} ${errorClasses}`}
            style={baseStyles}
            disabled={disabled}
            required={field.required}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        <div className="flex items-center gap-2">
          {getFieldIcon(field.type, field.name)}
          <span>{field.label || formatFieldName(field.name)}</span>
          {field.required && (
            <span style={{ color: 'var(--theme-error)' }}>*</span>
          )}
        </div>
        {field.description && (
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {field.description}
          </div>
        )}
      </label>
      
      {renderField()}
      
      {error && (
        <div className="text-sm flex items-center gap-1" style={{ color: 'var(--theme-error)' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default FormFieldRenderer

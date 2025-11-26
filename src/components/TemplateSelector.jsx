/**
 * TEMPLATE SELECTION COMPONENT - HYBRID APPROACH
 * Pre-generation category selection + Post-generation detailed application
 * Professional, surgical implementation
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Stethoscope, 
  DollarSign, 
  Crown,
  Monitor,
  Sparkles,
  Check,
  ArrowRight,
  Info,
  Eye,
  Download
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { EBOOK_TEMPLATES, getTemplateById, getTemplatesByCategory } from '../data/ebookTemplates'
import UltraButton from './UltraButton'
import UltraCard from './UltraCard'
import UltraLoader from './UltraLoader'

const TemplateSelector = ({ 
  onTemplateSelect, 
  selectedTemplate = null, 
  mode = 'pre-generation', // 'pre-generation' or 'post-generation'
  onClose = null,
  showPreview = true 
}) => {
  const { isDark } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState('business')
  const [selectedTemplateId, setSelectedTemplateId] = useState(selectedTemplate?.id || null)
  const [selectedSize, setSelectedSize] = useState('A4')
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(false)

  const categories = [
    { id: 'business', name: 'Business & Professional', icon: Briefcase, color: 'blue' },
    { id: 'creative', name: 'Creative & Design', icon: Palette, color: 'purple' },
    { id: 'academic', name: 'Academic & Educational', icon: GraduationCap, color: 'green' },
    { id: 'self-help', name: 'Self-Help & Wellness', icon: Heart, color: 'pink' },
    { id: 'medical', name: 'Medical & Healthcare', icon: Stethoscope, color: 'red' },
    { id: 'finance', name: 'Finance & Investment', icon: DollarSign, color: 'emerald' },
    { id: 'luxury', name: 'Luxury & Premium', icon: Crown, color: 'amber' },
    { id: 'technology', name: 'Technology & Modern', icon: Monitor, color: 'cyan' }
  ]

  const templates = getTemplatesByCategory(selectedCategory)
  const currentTemplate = selectedTemplateId ? getTemplateById(selectedTemplateId) : null

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId)
    if (mode === 'pre-generation') {
      onTemplateSelect?.(templateId, 'A4') // Default size for pre-generation
    }
  }

  const handleSizeSelect = (size) => {
    setSelectedSize(size)
    if (mode === 'post-generation') {
      onTemplateSelect?.(selectedTemplateId, size)
    }
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId) return
    
    setLoading(true)
    try {
      await onTemplateSelect?.(selectedTemplateId, selectedSize)
      if (onClose) onClose()
    } catch (error) {
      console.error('Error applying template:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.icon || BookOpen
  }

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.color || 'blue'
  }

  const getSizeDimensions = (templateId, sizeKey) => {
    const template = getTemplateById(templateId)
    if (!template || !template.sizes[sizeKey]) return null
    
    const size = template.sizes[sizeKey]
    return `${size.width} × ${size.height} ${size.unit}`
  }

  return (
    <div className="template-selector-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {mode === 'pre-generation' ? '🎨 Choose Template Style' : '✨ Apply Template'}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {mode === 'pre-generation' 
              ? 'Select a template category to guide your content generation'
              : 'Choose your preferred template and size for final formatting'
            }
          </p>
        </div>
        {onClose && (
          <UltraButton
            onClick={onClose}
            variant="secondary"
            size="sm"
            icon={ArrowRight}
          >
            Close
          </UltraButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Selection */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Template Categories
          </h3>
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id
              
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    isSelected 
                      ? 'bg-primary-500 text-white shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Template Selection */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {categories.find(c => c.id === selectedCategory)?.name} Templates
            </h3>
            {showPreview && (
              <UltraButton
                onClick={() => setPreviewMode(!previewMode)}
                variant="secondary"
                size="sm"
                icon={Eye}
              >
                {previewMode ? 'Hide Preview' : 'Show Preview'}
              </UltraButton>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => {
              const isSelected = selectedTemplateId === template.id
              const Icon = getCategoryIcon(template.category)
              
              return (
                <UltraCard
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary-500 shadow-lg' : ''
                  }`}
                  hover
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${getCategoryColor(template.category)}-500 to-${getCategoryColor(template.category)}-600 flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* Template Features */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>Sizes: {Object.keys(template.sizes).join(', ')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Palette className="w-4 h-4 mr-2" />
                        <span>Typography: {template.typography.primary}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span>Features: {template.features.length}</span>
                      </div>
                    </div>

                    {/* Preview Mode */}
                    {previewMode && isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="text-sm">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <span className="font-medium">Primary Font:</span>
                              <span className="ml-2">{template.typography.primary}</span>
                            </div>
                            <div>
                              <span className="font-medium">Secondary Font:</span>
                              <span className="ml-2">{template.typography.secondary}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Colors: {template.colors.primary}, {template.colors.secondary}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </UltraCard>
              )
            })}
          </div>
        </div>
      </div>

      {/* Size Selection (Post-Generation Mode) */}
      {mode === 'post-generation' && currentTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            Choose Size Variant
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(currentTemplate.sizes).map(([sizeKey, sizeData]) => (
              <motion.button
                key={sizeKey}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSizeSelect(sizeKey)}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedSize === sizeKey
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{sizeKey}</div>
                <div className="text-xs opacity-75">
                  {sizeData.width} × {sizeData.height} {sizeData.unit}
                </div>
                <div className="text-xs opacity-60">
                  {sizeData.orientation}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedTemplateId ? (
            <>
              <Info className="w-4 h-4 inline mr-1" />
              Selected: {currentTemplate?.name} 
              {mode === 'post-generation' && ` (${selectedSize})`}
            </>
          ) : (
            'No template selected'
          )}
        </div>
        
        <div className="flex space-x-3">
          {mode === 'post-generation' && (
            <UltraButton
              onClick={handleApplyTemplate}
              disabled={!selectedTemplateId || loading}
              variant="primary"
              icon={loading ? UltraLoader : Download}
            >
              {loading ? 'Applying...' : 'Apply Template'}
            </UltraButton>
          )}
        </div>
      </div>
    </div>
  )
}

export default TemplateSelector

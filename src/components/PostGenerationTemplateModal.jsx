/**
 * POST-GENERATION TEMPLATE APPLICATION MODAL
 * Allows users to apply templates after content generation
 * Professional, surgical implementation with preview
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Download, 
  Eye, 
  Palette, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Sparkles,
  Settings,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { EBOOK_TEMPLATES, getTemplateById, applyTemplateToContent } from '../data/ebookTemplates'
import UltraButton from './UltraButton'
import UltraCard from './UltraCard'
import UltraLoader from './UltraLoader'
import { ultraToast } from '../utils/ultraToast'

const PostGenerationTemplateModal = ({ 
  isOpen, 
  onClose, 
  generatedContent, 
  onApplyTemplate,
  onDownload 
}) => {
  const { isDark } = useTheme()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedSize, setSelectedSize] = useState('A4')
  const [previewMode, setPreviewMode] = useState('desktop') // desktop, tablet, mobile
  const [applyingTemplate, setApplyingTemplate] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [previewContent, setPreviewContent] = useState(null)

  useEffect(() => {
    if (isOpen && generatedContent) {
      // Initialize with first template for preview
      const firstTemplate = Object.values(EBOOK_TEMPLATES)[0]
      if (firstTemplate) {
        setSelectedTemplate(firstTemplate)
        generatePreview(firstTemplate, 'A4')
      }
    }
  }, [isOpen, generatedContent])

  const generatePreview = async (template, size) => {
    if (!generatedContent) return
    
    try {
      // Apply template to content for preview
      const templatedContent = applyTemplateToContent(generatedContent, template.id, size)
      setPreviewContent(templatedContent)
    } catch (error) {
      console.error('Error generating preview:', error)
      ultraToast.error('Failed to generate preview')
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    generatePreview(template, selectedSize)
  }

  const handleSizeSelect = (size) => {
    setSelectedSize(size)
    if (selectedTemplate) {
      generatePreview(selectedTemplate, size)
    }
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !generatedContent) return
    
    setApplyingTemplate(true)
    try {
      await onApplyTemplate?.(selectedTemplate, selectedSize)
      ultraToast.success('Template applied successfully!')
    } catch (error) {
      console.error('Error applying template:', error)
      ultraToast.error('Failed to apply template')
    } finally {
      setApplyingTemplate(false)
    }
  }

  const handleDownload = async () => {
    if (!selectedTemplate || !generatedContent) return
    
    setDownloading(true)
    try {
      await onDownload?.(selectedTemplate, selectedSize)
      ultraToast.success('Download started!')
    } catch (error) {
      console.error('Error downloading:', error)
      ultraToast.error('Failed to download')
    } finally {
      setDownloading(false)
    }
  }

  const getPreviewDimensions = () => {
    if (!selectedTemplate || !selectedTemplate.sizes[selectedSize]) return { width: '100%', height: '600px' }
    
    const size = selectedTemplate.sizes[selectedSize]
    const aspectRatio = parseFloat(size.height) / parseFloat(size.width)
    
    switch (previewMode) {
      case 'mobile':
        return { width: '320px', height: `${320 * aspectRatio}px` }
      case 'tablet':
        return { width: '768px', height: `${768 * aspectRatio}px` }
      default:
        return { width: '100%', height: '600px' }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                ✨ Apply Professional Template
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Choose your preferred template and size for final formatting
              </p>
            </div>
            <UltraButton
              onClick={onClose}
              variant="secondary"
              size="sm"
              icon={X}
            >
              Close
            </UltraButton>
          </div>

          <div className="flex h-[calc(95vh-120px)]">
            {/* Template Selection Sidebar */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                  Choose Template
                </h3>
                
                <div className="space-y-3">
                  {Object.values(EBOOK_TEMPLATES).map((template) => {
                    const isSelected = selectedTemplate?.id === template.id
                    
                    return (
                      <UltraCard
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-primary-500 shadow-lg' : ''
                        }`}
                        hover
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {template.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {template.description}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                            )}
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-500">
                            <div>Category: {template.category}</div>
                            <div>Sizes: {Object.keys(template.sizes).join(', ')}</div>
                            <div>Font: {template.typography.primary}</div>
                          </div>
                        </div>
                      </UltraCard>
                    )
                  })}
                </div>

                {/* Size Selection */}
                {selectedTemplate && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                      Choose Size
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedTemplate.sizes).map(([sizeKey, sizeData]) => (
                        <motion.button
                          key={sizeKey}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSizeSelect(sizeKey)}
                          className={`p-3 rounded-lg text-center transition-all ${
                            selectedSize === sizeKey
                              ? 'bg-primary-500 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="font-medium text-sm">{sizeKey}</div>
                          <div className="text-xs opacity-75">
                            {sizeData.width} × {sizeData.height} {sizeData.unit}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 flex flex-col">
              {/* Preview Controls */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                      Live Preview
                    </h3>
                    <div className="flex items-center space-x-2">
                      <UltraButton
                        onClick={() => setPreviewMode('desktop')}
                        variant={previewMode === 'desktop' ? 'primary' : 'secondary'}
                        size="sm"
                        icon={Monitor}
                      >
                        Desktop
                      </UltraButton>
                      <UltraButton
                        onClick={() => setPreviewMode('tablet')}
                        variant={previewMode === 'tablet' ? 'primary' : 'secondary'}
                        size="sm"
                        icon={Tablet}
                      >
                        Tablet
                      </UltraButton>
                      <UltraButton
                        onClick={() => setPreviewMode('mobile')}
                        variant={previewMode === 'mobile' ? 'primary' : 'secondary'}
                        size="sm"
                        icon={Smartphone}
                      >
                        Mobile
                      </UltraButton>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <UltraButton
                      onClick={() => setPreviewMode(previewMode === 'preview' ? 'edit' : 'preview')}
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                    >
                      {previewMode === 'preview' ? 'Edit Mode' : 'Preview Mode'}
                    </UltraButton>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-center">
                  <div 
                    className="bg-white shadow-lg rounded-lg overflow-hidden"
                    style={getPreviewDimensions()}
                  >
                    {previewContent ? (
                      <div className="h-full overflow-y-auto">
                        {/* Template Preview Content */}
                        <div 
                          className="p-8 h-full"
                          style={{
                            fontFamily: selectedTemplate?.typography.primary || 'Inter',
                            backgroundColor: selectedTemplate?.colors.background || '#ffffff',
                            color: selectedTemplate?.colors.text || '#000000',
                            lineHeight: selectedTemplate?.layout.lineHeight || '1.6'
                          }}
                        >
                          {/* Cover Page Preview */}
                          <div className="text-center mb-8">
                            <h1 
                              className="text-3xl font-bold mb-4"
                              style={{ color: selectedTemplate?.colors.primary || '#000000' }}
                            >
                              {generatedContent?.title || 'Your Book Title'}
                            </h1>
                            <p 
                              className="text-lg"
                              style={{ color: selectedTemplate?.colors.secondary || '#666666' }}
                            >
                              {generatedContent?.author || 'Author Name'}
                            </p>
                          </div>

                          {/* Content Preview */}
                          <div className="space-y-4">
                            <h2 
                              className="text-xl font-semibold"
                              style={{ color: selectedTemplate?.colors.primary || '#000000' }}
                            >
                              Chapter 1: Introduction
                            </h2>
                            <p>
                              {generatedContent?.content?.substring(0, 500) || 
                               'This is a preview of how your content will look with the selected template. The actual content will be formatted according to the template specifications...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <UltraLoader type="pulse" size="lg" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTemplate ? (
                      <>
                        <Palette className="w-4 h-4 inline mr-1" />
                        {selectedTemplate.name} • {selectedSize} • {previewMode}
                      </>
                    ) : (
                      'No template selected'
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <UltraButton
                      onClick={handleApplyTemplate}
                      disabled={!selectedTemplate || applyingTemplate}
                      variant="secondary"
                      icon={applyingTemplate ? UltraLoader : Settings}
                    >
                      {applyingTemplate ? 'Applying...' : 'Apply Template'}
                    </UltraButton>
                    
                    <UltraButton
                      onClick={handleDownload}
                      disabled={!selectedTemplate || downloading}
                      variant="primary"
                      icon={downloading ? UltraLoader : Download}
                    >
                      {downloading ? 'Downloading...' : 'Download'}
                    </UltraButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PostGenerationTemplateModal

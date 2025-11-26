/**
 * PROFESSIONAL EBOOK TEMPLATES - 10 HIGH-END DESIGNS
 * Surgical implementation with size variants and professional standards
 * Each template includes multiple size options and professional formatting
 */

export const EBOOK_TEMPLATES = {
  
  // ==================== BUSINESS & PROFESSIONAL TEMPLATES ====================
  
  corporate_executive: {
    id: 'corporate_executive',
    name: 'Corporate Executive',
    description: 'Professional business template for executives and corporate content',
    category: 'business',
    sizes: {
      'A4': { width: '8.27', height: '11.69', unit: 'in', orientation: 'portrait' },
      'Letter': { width: '8.5', height: '11', unit: 'in', orientation: 'portrait' },
      'A5': { width: '5.83', height: '8.27', unit: 'in', orientation: 'portrait' },
      '6x9': { width: '6', height: '9', unit: 'in', orientation: 'portrait' }
    },
    typography: {
      primary: 'Inter',
      secondary: 'Source Serif Pro',
      accent: 'Roboto Mono'
    },
    colors: {
      primary: '#1a365d',
      secondary: '#2d3748',
      accent: '#3182ce',
      background: '#ffffff',
      text: '#2d3748'
    },
    layout: {
      margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
      lineHeight: '1.6',
      fontSize: '12pt',
      chapterSpacing: '2em'
    },
    features: ['professional_header', 'executive_summary', 'data_visualization', 'corporate_footer']
  },
  
  modern_minimalist: {
    id: 'modern_minimalist',
    name: 'Modern Minimalist',
    description: 'Clean, minimal design for contemporary content',
    category: 'modern',
    sizes: {
      'A4': { width: '8.27', height: '11.69', unit: 'in', orientation: 'portrait' },
      'Letter': { width: '8.5', height: '11', unit: 'in', orientation: 'portrait' },
      'A5': { width: '5.83', height: '8.27', unit: 'in', orientation: 'portrait' },
      '5.5x8.5': { width: '5.5', height: '8.5', unit: 'in', orientation: 'portrait' }
    },
    typography: {
      primary: 'Helvetica Neue',
      secondary: 'Georgia',
      accent: 'SF Mono'
    },
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#007aff',
      background: '#ffffff',
      text: '#000000'
    },
    layout: {
      margins: { top: '0.75in', bottom: '0.75in', left: '0.75in', right: '0.75in' },
      lineHeight: '1.5',
      fontSize: '11pt',
      chapterSpacing: '1.5em'
    },
    features: ['minimal_header', 'clean_typography', 'white_space', 'simple_footer']
  },
  
  academic_scholar: {
    id: 'academic_scholar',
    name: 'Academic Scholar',
    description: 'Traditional academic template for research and scholarly content',
    category: 'academic',
    sizes: {
      'A4': { width: '8.27', height: '11.69', unit: 'in', orientation: 'portrait' },
      'Letter': { width: '8.5', height: '11', unit: 'in', orientation: 'portrait' },
      'B5': { width: '6.93', height: '9.84', unit: 'in', orientation: 'portrait' }
    },
    typography: {
      primary: 'Times New Roman',
      secondary: 'Times New Roman',
      accent: 'Courier New'
    },
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#800000',
      background: '#ffffff',
      text: '#000000'
    },
    layout: {
      margins: { top: '1in', bottom: '1in', left: '1.25in', right: '1in' },
      lineHeight: '2',
      fontSize: '12pt',
      chapterSpacing: '3em'
    },
    features: ['academic_header', 'citation_format', 'footnotes', 'bibliography', 'scholarly_footer']
  },
  
  // ==================== CREATIVE & DESIGN TEMPLATES ====================
  
  creative_showcase: {
    id: 'creative_showcase',
    name: 'Creative Showcase',
    description: 'Bold, creative design for artistic and innovative content',
    category: 'creative',
    sizes: {
      'A4': { width: '8.27', height: '11.69', unit: 'in', orientation: 'portrait' },
      'Letter': { width: '8.5', height: '11', unit: 'in', orientation: 'portrait' },
      'Square': { width: '8.5', height: '8.5', unit: 'in', orientation: 'square' },
      '6x9': { width: '6', height: '9', unit: 'in', orientation: 'portrait' }
    },
    typography: {
      primary: 'Montserrat',
      secondary: 'Playfair Display',
      accent: 'Fira Code'
    },
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#45b7d1',
      background: '#ffffff',
      text: '#2c3e50'
    },
    layout: {
      margins: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
      lineHeight: '1.4',
      fontSize: '11pt',
      chapterSpacing: '2em'
    },
    features: ['bold_headers', 'color_accent', 'creative_layout', 'visual_elements', 'artistic_footer']
  },
  
  tech_modern: {
    id: 'tech_modern',
    name: 'Tech Modern',
    description: 'Contemporary tech-focused template for digital content',
    category: 'technology',
    sizes: {
      'A4': { width: '8.27', height: '11.69', unit: 'in', orientation: 'portrait' },
      'Letter': { width: '8.5', height: '11', unit: 'in', orientation: 'portrait' },
      'A5': { width: '5.83', height: '8.27', unit: 'in', orientation: 'portrait' },
      '6x9': { width: '6', height: '9', unit: 'in', orientation: 'portrait' }
    },
    typography: {
      primary: 'Roboto',
      secondary: 'Open Sans',
      accent: 'JetBrains Mono'
    },
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      text: '#1e293b'
    },
    layout: {
      margins: { top: '0.75in', bottom: '0.75in', left: '0.75in', right: '0.75in' },
      lineHeight: '1.5',
      fontSize: '11pt',
      chapterSpacing: '1.5em'
    },
    features: ['tech_header', 'code_blocks', 'data_tables', 'modern_icons', 'tech_footer']
  },
  
  // ==================== EDUCATIONAL & INSTRUCTIONAL TEMPLATES ====================
  
  educational_guide: {
    id: 'educational_guide',
    name: 'Educational Guide',
    description: 'Structured template for educational and instructional content',
    category: 'education',
    sizes: {
      'A4': { width: '8.27', height: '11.69', unit: 'in', orientation: 'portrait' },
      'Letter': { width: '8.5', height: '11', unit: 'in', orientation: 'portrait' },
      'A5': { width: '5.83', height: '8.27', unit: 'in', orientation: 'portrait' },
      '5.5x8.5': { width: '5.5', height: '8.5', unit: 'in', orientation: 'portrait' }
    },
    typography: {
      primary: 'Lato',
      secondary: 'Merriweather',
      accent: 'Source Code Pro'
    },
    colors: {
      primary: '#059669',
      secondary: '#374151',
      accent: '#dc2626',
      background: '#ffffff',
      text: '#111827'
    },
    layout: {
      margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
      lineHeight: '1.6',
      fontSize: '12pt',
      chapterSpacing: '2em'
    },
    features: ['learning_objectives', 'step_by_step', 'exercises', 'key_points', 'educational_footer']
  },
  
  self_help_coach: {
    id: 'self_help_coach',
    name: 'Self-Help Coach',
    description: 'Warm, encouraging template for personal development content',
    category: 'self-help',
    sizes: {
      'A4': { width: '8.27', height: '11.69', unit: 'in', orientation: 'portrait' },
      'Letter': { width: '8.5', height: '11', unit: 'in', orientation: 'portrait' },
      'A5': { width: '5.83', height: '8.27', unit: 'in', orientation: 'portrait' },
      '6x9': { width: '6', height: '9', unit: 'in', orientation: 'portrait' }
    },
    typography: {
      primary: 'Nunito',
      secondary: 'Crimson Text',
      accent: 'Fira Sans'
    },
    colors: {
      primary: '#7c3aed',
      secondary: '#6b7280',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#374151'
    },
    layout: {
      margins: { top: '0.75in', bottom: '0.75in', left: '0.75in', right: '0.75in' },
      lineHeight: '1.6',
      fontSize: '12pt',
      chapterSpacing: '2em'
    },
    features: ['motivational_quotes', 'action_items', 'reflection_boxes', 'progress_tracking', 'coaching_footer']
  },
  
  // ==================== SPECIALIZED TEMPLATES ====================
  
  medical_professional: {
    id: 'medical_professional',
    name: 'Medical Professional',
    description: 'Clinical template for medical and healthcare content',
    category: 'medical',
    sizes: {
      'A4': { width: '8.27', height: '11.69', unit: 'in', orientation: 'portrait' },
      'Letter': { width: '8.5', height: '11', unit: 'in', orientation: 'portrait' },
      'A5': { width: '5.83', height: '8.27', unit: 'in', orientation: 'portrait' }
    },
    typography: {
      primary: 'Arial',
      secondary: 'Times New Roman',
      accent: 'Consolas'
    },
    colors: {
      primary: '#1e40af',
      secondary: '#374151',
      accent: '#dc2626',
      background: '#ffffff',
      text: '#111827'
    },
    layout: {
      margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
      lineHeight: '1.5',
      fontSize: '11pt',
      chapterSpacing: '2em'
    },
    features: ['medical_header', 'clinical_tables', 'warning_boxes', 'reference_format', 'medical_footer']
  },
  
  financial_advisor: {
    id: 'financial_advisor',
    name: 'Financial Advisor',
    description: 'Professional template for financial and investment content',
    category: 'finance',
    sizes: {
      'A4': { width: '8.27', height: '11.69', unit: 'in', orientation: 'portrait' },
      'Letter': { width: '8.5', height: '11', unit: 'in', orientation: 'portrait' },
      'A5': { width: '5.83', height: '8.27', unit: 'in', orientation: 'portrait' },
      '6x9': { width: '6', height: '9', unit: 'in', orientation: 'portrait' }
    },
    typography: {
      primary: 'Inter',
      secondary: 'Source Serif Pro',
      accent: 'JetBrains Mono'
    },
    colors: {
      primary: '#059669',
      secondary: '#374151',
      accent: '#dc2626',
      background: '#ffffff',
      text: '#111827'
    },
    layout: {
      margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
      lineHeight: '1.5',
      fontSize: '11pt',
      chapterSpacing: '2em'
    },
    features: ['financial_charts', 'risk_warnings', 'calculation_tables', 'compliance_footer', 'disclaimer_boxes']
  },
  
  luxury_premium: {
    id: 'luxury_premium',
    name: 'Luxury Premium',
    description: 'High-end template for premium and luxury content',
    category: 'luxury',
    sizes: {
      'A4': { width: '8.27', height: '11.69', unit: 'in', orientation: 'portrait' },
      'Letter': { width: '8.5', height: '11', unit: 'in', orientation: 'portrait' },
      'A5': { width: '5.83', height: '8.27', unit: 'in', orientation: 'portrait' },
      'Custom': { width: '7', height: '10', unit: 'in', orientation: 'portrait' }
    },
    typography: {
      primary: 'Playfair Display',
      secondary: 'Crimson Text',
      accent: 'EB Garamond'
    },
    colors: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
      accent: '#d4af37',
      background: '#ffffff',
      text: '#1a1a1a'
    },
    layout: {
      margins: { top: '1.25in', bottom: '1.25in', left: '1.25in', right: '1.25in' },
      lineHeight: '1.7',
      fontSize: '12pt',
      chapterSpacing: '3em'
    },
    features: ['luxury_header', 'gold_accent', 'premium_spacing', 'elegant_typography', 'luxury_footer']
  }
}

// Helper functions for template management
export const getTemplateById = (templateId) => {
  return EBOOK_TEMPLATES[templateId] || null
}

export const getTemplatesByCategory = (category) => {
  return Object.values(EBOOK_TEMPLATES).filter(template => template.category === category)
}

export const getAllTemplates = () => {
  return Object.values(EBOOK_TEMPLATES)
}

export const getTemplateSizes = (templateId) => {
  const template = getTemplateById(templateId)
  return template ? template.sizes : null
}

export const getTemplateSizeDimensions = (templateId, sizeKey) => {
  const template = getTemplateById(templateId)
  if (!template || !template.sizes[sizeKey]) return null
  
  const size = template.sizes[sizeKey]
  return {
    width: `${size.width}${size.unit}`,
    height: `${size.height}${size.unit}`,
    orientation: size.orientation
  }
}

// Template validation
export const validateTemplate = (templateId, sizeKey) => {
  const template = getTemplateById(templateId)
  if (!template) return { valid: false, error: 'Template not found' }
  
  if (sizeKey && !template.sizes[sizeKey]) {
    return { valid: false, error: `Size ${sizeKey} not available for template ${templateId}` }
  }
  
  return { valid: true }
}

// Template application helper
export const applyTemplateToContent = (content, templateId, sizeKey = 'A4') => {
  const template = getTemplateById(templateId)
  if (!template) return content
  
  const size = template.sizes[sizeKey]
  if (!size) return content
  
  return {
    ...content,
    template: {
      id: templateId,
      name: template.name,
      size: sizeKey,
      dimensions: {
        width: `${size.width}${size.unit}`,
        height: `${size.height}${size.unit}`,
        orientation: size.orientation
      },
      typography: template.typography,
      colors: template.colors,
      layout: template.layout,
      features: template.features
    }
  }
}

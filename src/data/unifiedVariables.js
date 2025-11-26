/**
 * UNIFIED VARIABLE SYSTEM - SINGLE SOURCE OF TRUTH
 * Professional, clean, surgical implementation
 * All variables consolidated from multiple sources
 */

export const UNIFIED_VARIABLES = {
  // ==================== CORE CONTENT VARIABLES ====================
  book_title: {
    name: 'Book Title',
    type: 'text',
    required: true,
    placeholder: 'Enter your book title',
    description: 'Main title of your book or content piece',
    category: 'core',
    validation: { minLength: 3, maxLength: 200 }
  },
  
  author_name: {
    name: 'Author Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your name',
    description: 'Your name as the author/creator',
    category: 'core',
    validation: { minLength: 2, maxLength: 100 }
  },
  
  topic: {
    name: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'Main topic/subject',
    description: 'Primary subject or theme of your content',
    category: 'core',
    validation: { minLength: 3, maxLength: 200 }
  },
  
  subtitle: {
    name: 'Subtitle',
    type: 'text',
    required: false,
    placeholder: 'Enter subtitle',
    description: 'Secondary title or tagline for your content',
    category: 'core',
    validation: { maxLength: 300 }
  },
  
  author_bio: {
    name: 'Author Bio',
    type: 'textarea',
    required: false,
    placeholder: 'Brief biography',
    description: 'Short professional biography of the author',
    category: 'core',
    validation: { maxLength: 1000 }
  },

  // ==================== CONTENT STRUCTURE & DIMENSIONS ====================
  book_size: {
    name: 'Book Size',
    type: 'select',
    required: true,
    placeholder: 'Select book size',
    options: ['A4', 'Letter', 'A5', 'B5', '6x9', '5.5x8.5', 'custom'],
    description: 'Physical dimensions for the book',
    category: 'format',
    validation: { required: true }
  },
  
  custom_size: {
    name: 'Custom Size',
    type: 'text',
    required: false,
    placeholder: 'Enter custom size (e.g., 8.5x11 inches)',
    description: 'Custom dimensions for the book',
    category: 'format',
    conditional: 'book_size === "custom"',
    validation: { pattern: /^\d+(\.\d+)?x\d+(\.\d+)?\s*(inches?|cm|mm)?$/i }
  },
  
  book_template: {
    name: 'Book Template',
    type: 'select',
    required: false,
    placeholder: 'Select professional template (optional)',
    options: ['none', 'Classic Novel', 'Modern Business', 'Academic Technical', 'Minimalist', 'Literary Fiction', 'Self-Help Guide', 'Childrens Book', 'Poetry Collection', 'Corporate Report', 'Fantasy SciFi'],
    description: 'Professional formatting template for your book',
    category: 'format',
    validation: {}
  },
  
  word_count: {
    name: 'Word Count',
    type: 'select',
    required: true,
    placeholder: 'Select desired length',
    options: ['3000-5000', '5000-10000', '10000-20000', '20000-50000', '50000+'],
    description: 'Target length of your content in words',
    category: 'structure',
    validation: { required: true }
  },
  
  chapter_count: {
    name: 'Chapter Count',
    type: 'select',
    required: true,
    placeholder: 'Select chapters',
    options: ['3', '5', '8', '10', '12', '15', '20'],
    description: 'Number of chapters or sections to create',
    category: 'structure',
    validation: { required: true }
  },

  // ==================== CONTENT CLASSIFICATION ====================
  genre: {
    name: 'Genre',
    type: 'select',
    required: true,
    placeholder: 'Select genre',
    options: ['fiction', 'non-fiction', 'business', 'self-help', 'romance', 'thriller', 'fantasy', 'sci-fi', 'biography', 'how-to', 'technical', 'educational'],
    description: 'Literary or content genre classification',
    category: 'classification',
    validation: { required: true }
  },
  
  target_audience: {
    name: 'Target Audience',
    type: 'select',
    required: true,
    placeholder: 'Select your audience',
    options: ['general', 'young_adult', 'children', 'adults', 'professionals', 'students', 'entrepreneurs', 'executives', 'managers'],
    description: 'Primary demographic for your content',
    category: 'classification',
    validation: { required: true }
  },
  
  content_type: {
    name: 'Content Type',
    type: 'select',
    required: false,
    placeholder: 'Select type',
    options: ['educational', 'entertainment', 'reference', 'instructional', 'inspirational'],
    description: 'Primary purpose and function of content',
    category: 'classification'
  },

  // ==================== WRITING STYLE & TONE ====================
  tone: {
    name: 'Tone',
    type: 'select',
    required: true,
    placeholder: 'Select writing tone',
    options: ['friendly', 'authoritative', 'inspirational', 'informative', 'entertaining', 'serious', 'humorous', 'professional', 'conversational'],
    description: 'Overall mood and voice of your writing',
    category: 'style',
    validation: { required: true }
  },
  
  writing_style: {
    name: 'Writing Style',
    type: 'select',
    required: true,
    placeholder: 'Select style',
    options: ['conversational', 'professional', 'academic', 'casual', 'formal', 'creative', 'technical', 'descriptive'],
    description: 'How formal or casual your writing should be',
    category: 'style',
    validation: { required: true }
  },
  
  typography_style: {
    name: 'Typography Style',
    type: 'select',
    required: true,
    placeholder: 'Select typography',
    options: ['modern', 'classic', 'elegant', 'technical', 'creative', 'minimalist', 'professional'],
    description: 'Visual styling and typography theme',
    category: 'style',
    validation: { required: true }
  },

  // ==================== TEMPLATE & FORMATTING ====================
  template_category: {
    name: 'Template Category',
    type: 'select',
    required: false,
    placeholder: 'Select template style',
    options: ['business', 'creative', 'academic', 'self-help', 'medical', 'finance', 'luxury', 'technology'],
    description: 'Choose a template category to guide content generation',
    category: 'format'
  },
  
  template_id: {
    name: 'Specific Template',
    type: 'select',
    required: false,
    placeholder: 'Select specific template',
    options: ['corporate_executive', 'modern_minimalist', 'academic_scholar', 'creative_showcase', 'tech_modern', 'educational_guide', 'self_help_coach', 'medical_professional', 'financial_advisor', 'luxury_premium'],
    description: 'Choose a specific template for final formatting',
    category: 'format',
    conditional: 'template_category'
  },
  
  template_size: {
    name: 'Template Size',
    type: 'select',
    required: false,
    placeholder: 'Select size',
    options: ['A4', 'Letter', 'A5', 'B5', '6x9', '5.5x8.5', 'custom'],
    description: 'Choose the size variant for your template',
    category: 'format',
    conditional: 'template_id'
  },
  output_formats: {
    name: 'Output Formats',
    type: 'select',
    multiple: true,
    required: true,
    placeholder: 'Select output formats (multiple)',
    options: ['pdf', 'docx', 'txt', 'md', 'epub', 'html'],
    description: 'File formats for final output',
    category: 'output',
    validation: { required: true, minSelections: 1 }
  },
  
  cover_design: {
    name: 'Cover Design',
    type: 'select',
    required: true,
    placeholder: 'Select cover design style',
    options: ['auto_generate', 'minimal', 'professional', 'creative', 'custom'],
    description: 'Cover design style and approach',
    category: 'output',
    validation: { required: true }
  },

  // ==================== CONTENT FEATURES ====================
  include_case_studies: {
    name: 'Include Case Studies',
    type: 'checkbox',
    required: false,
    placeholder: 'Add case studies',
    description: 'Include real-world examples and case studies',
    category: 'features'
  },
  
  include_examples: {
    name: 'Include Examples',
    type: 'checkbox',
    required: false,
    placeholder: 'Add examples',
    description: 'Include practical examples throughout content',
    category: 'features'
  },
  
  include_templates: {
    name: 'Include Templates',
    type: 'checkbox',
    required: false,
    placeholder: 'Add templates',
    description: 'Include downloadable templates and tools',
    category: 'features'
  },
  
  include_images: {
    name: 'Include Images',
    type: 'checkbox',
    required: false,
    placeholder: 'Add images',
    description: 'Include relevant images and visuals',
    category: 'features'
  },

  // ==================== BUSINESS CONTEXT ====================
  industry_focus: {
    name: 'Industry Focus',
    type: 'select',
    required: false,
    placeholder: 'Select industry',
    options: ['technology', 'finance', 'marketing', 'healthcare', 'education', 'retail', 'manufacturing', 'consulting', 'media'],
    description: 'Primary industry or sector focus',
    category: 'business'
  },
  
  business_objective: {
    name: 'Business Objective',
    type: 'textarea',
    required: false,
    placeholder: 'Business goals',
    description: 'Main business goals this content should achieve',
    category: 'business',
    validation: { maxLength: 500 }
  },
  
  key_topics: {
    name: 'Key Topics',
    type: 'textarea',
    required: false,
    placeholder: 'List main topics',
    description: 'Essential topics that must be covered',
    category: 'business',
    validation: { maxLength: 1000 }
  },

  // ==================== QUALITY & DEPTH ====================
  complexity_level: {
    name: 'Complexity Level',
    type: 'select',
    required: false,
    placeholder: 'Select complexity',
    options: ['beginner', 'intermediate', 'advanced', 'expert'],
    description: 'Technical complexity and depth level',
    category: 'quality'
  },
  
  research_depth: {
    name: 'Research Depth',
    type: 'select',
    required: false,
    placeholder: 'Select research level',
    options: ['basic', 'moderate', 'comprehensive', 'scholarly'],
    description: 'Level of research and citations needed',
    category: 'quality'
  },
  
  include_references: {
    name: 'Include References',
    type: 'checkbox',
    required: false,
    placeholder: 'Add references',
    description: 'Include bibliography and source references',
    category: 'quality'
  },

  // ==================== CREATIVE ELEMENTS ====================
  theme: {
    name: 'Main Theme',
    type: 'textarea',
    required: false,
    placeholder: 'Core theme/message',
    description: 'Central theme or underlying message',
    category: 'creative',
    validation: { maxLength: 500 }
  },
  
  learning_objectives: {
    name: 'Learning Objectives',
    type: 'textarea',
    required: false,
    placeholder: 'Learning goals',
    description: 'What readers should learn or achieve',
    category: 'creative',
    validation: { maxLength: 1000 }
  },

  // ==================== MARKETING & CONVERSION ====================
  lead_magnet_type: {
    name: 'Lead Magnet Type',
    type: 'select',
    required: false,
    placeholder: 'Select type',
    options: ['checklist', 'template', 'guide', 'framework', 'worksheet'],
    description: 'Type of free resource to offer readers',
    category: 'marketing'
  },
  
  conversion_goal: {
    name: 'Conversion Goal',
    type: 'select',
    required: false,
    placeholder: 'Select goal',
    options: ['email_signup', 'product_sale', 'consultation', 'download', 'engagement'],
    description: 'Primary action you want readers to take',
    category: 'marketing'
  }
}

// Helper functions for clean access
export const getVariableByName = (variableName) => {
  return UNIFIED_VARIABLES[variableName] || null
}

export const getVariablesByCategory = () => {
  const categories = {}
  
  Object.entries(UNIFIED_VARIABLES).forEach(([key, variable]) => {
    if (!categories[variable.category]) {
      categories[variable.category] = []
    }
    categories[variable.category].push({
      variable: key,
      ...variable
    })
  })
  
  return categories
}

export const getAllVariables = () => {
  return Object.entries(UNIFIED_VARIABLES).map(([key, variable]) => ({
    variable: key,
    ...variable
  }))
}

export const getRequiredVariables = () => {
  return getAllVariables().filter(v => v.required)
}

export const getOptionalVariables = () => {
  return getAllVariables().filter(v => !v.required)
}

// Validation helper
export const validateVariableValue = (variableName, value) => {
  const variable = getVariableByName(variableName)
  if (!variable) return { valid: false, error: 'Variable not found' }
  
  if (variable.required && (!value || value.toString().trim() === '')) {
    return { valid: false, error: `${variable.name} is required` }
  }
  
  if (variable.validation) {
    const { minLength, maxLength, pattern } = variable.validation
    
    if (minLength && value && value.toString().length < minLength) {
      return { valid: false, error: `${variable.name} must be at least ${minLength} characters` }
    }
    
    if (maxLength && value && value.toString().length > maxLength) {
      return { valid: false, error: `${variable.name} must be no more than ${maxLength} characters` }
    }
    
    if (pattern && value && !pattern.test(value.toString())) {
      return { valid: false, error: `${variable.name} format is invalid` }
    }
  }
  
  return { valid: true }
}

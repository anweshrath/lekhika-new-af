/**
 * TEMPLATE APPLICATION SERVICE
 * Connects templates to generation and formatting services
 * Professional, surgical implementation
 */

import { EBOOK_TEMPLATES, getTemplateById, applyTemplateToContent } from '../data/ebookTemplates'

class TemplateApplicationService {
  constructor() {
    this.activeTemplate = null
    this.generationContext = null
  }

  /**
   * Set template for pre-generation context
   */
  setPreGenerationTemplate(templateId, size = 'A4') {
    const template = getTemplateById(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    this.activeTemplate = {
      id: templateId,
      size,
      template,
      mode: 'pre-generation'
    }

    console.log('🎨 Pre-generation template set:', {
      template: template.name,
      size,
      category: template.category
    })

    return this.activeTemplate
  }

  /**
   * Apply template to generated content
   */
  async applyPostGenerationTemplate(content, templateId, size = 'A4') {
    const template = getTemplateById(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    try {
      // Apply template to content
      const templatedContent = applyTemplateToContent(content, templateId, size)
      
      // Generate formatted output
      const formattedOutput = await this.generateFormattedOutput(templatedContent, template, size)
      
      console.log('✨ Post-generation template applied:', {
        template: template.name,
        size,
        contentLength: content.length,
        formattedOutput: formattedOutput.length
      })

      return {
        content: templatedContent,
        formattedOutput,
        template: template,
        size,
        metadata: {
          appliedAt: new Date().toISOString(),
          templateVersion: '1.0',
          sizeDimensions: template.sizes[size]
        }
      }
    } catch (error) {
      console.error('Error applying post-generation template:', error)
      throw error
    }
  }

  /**
   * Generate formatted output based on template
   */
  async generateFormattedOutput(content, template, size) {
    const sizeData = template.sizes[size]
    if (!sizeData) {
      throw new Error(`Size ${size} not available for template ${template.id}`)
    }

    // Create formatted output based on template specifications
    const formattedOutput = {
      // Document metadata
      metadata: {
        title: content.title || 'Untitled Document',
        author: content.author || 'Unknown Author',
        template: template.name,
        size: size,
        dimensions: sizeData,
        typography: template.typography,
        colors: template.colors,
        layout: template.layout,
        createdAt: new Date().toISOString()
      },

      // Content structure
      content: {
        cover: this.generateCoverPage(content, template),
        tableOfContents: this.generateTableOfContents(content, template),
        chapters: this.formatChapters(content, template),
        appendices: this.generateAppendices(content, template)
      },

      // Formatting instructions
      formatting: {
        fonts: {
          primary: template.typography.primary,
          secondary: template.typography.secondary,
          accent: template.typography.accent
        },
        colors: template.colors,
        layout: template.layout,
        features: template.features
      },

      // Export formats
      exports: {
        pdf: await this.generatePDFFormat(content, template, size),
        docx: await this.generateDOCXFormat(content, template, size),
        epub: await this.generateEPUBFormat(content, template, size),
        html: await this.generateHTMLFormat(content, template, size)
      }
    }

    return formattedOutput
  }

  /**
   * Generate cover page based on template
   */
  generateCoverPage(content, template) {
    return {
      title: content.title || 'Untitled Document',
      subtitle: content.subtitle || '',
      author: content.author || 'Unknown Author',
      template: template.name,
      styling: {
        backgroundColor: template.colors.background,
        textColor: template.colors.text,
        primaryColor: template.colors.primary,
        fontFamily: template.typography.primary,
        layout: template.layout
      }
    }
  }

  /**
   * Generate table of contents
   */
  generateTableOfContents(content, template) {
    if (!content.chapters || !Array.isArray(content.chapters)) {
      return []
    }

    return content.chapters.map((chapter, index) => ({
      number: index + 1,
      title: chapter.title || `Chapter ${index + 1}`,
      pageNumber: this.calculatePageNumber(index, template),
      level: 1
    }))
  }

  /**
   * Format chapters according to template
   */
  formatChapters(content, template) {
    if (!content.chapters || !Array.isArray(content.chapters)) {
      return []
    }

    return content.chapters.map((chapter, index) => ({
      ...chapter,
      formatting: {
        fontFamily: template.typography.primary,
        fontSize: template.layout.fontSize,
        lineHeight: template.layout.lineHeight,
        margins: template.layout.margins,
        chapterSpacing: template.layout.chapterSpacing
      },
      styling: {
        headingColor: template.colors.primary,
        textColor: template.colors.text,
        backgroundColor: template.colors.background
      }
    }))
  }

  /**
   * Generate appendices
   */
  generateAppendices(content, template) {
    const appendices = []

    // Add references if available
    if (content.references && content.references.length > 0) {
      appendices.push({
        type: 'references',
        title: 'References',
        content: content.references,
        formatting: template.layout
      })
    }

    // Add glossary if available
    if (content.glossary && content.glossary.length > 0) {
      appendices.push({
        type: 'glossary',
        title: 'Glossary',
        content: content.glossary,
        formatting: template.layout
      })
    }

    return appendices
  }

  /**
   * Calculate page number based on template layout
   */
  calculatePageNumber(chapterIndex, template) {
    // Simple calculation - can be enhanced based on actual content length
    const basePages = 2 // Cover + TOC
    const pagesPerChapter = 3 // Estimated
    return basePages + (chapterIndex * pagesPerChapter) + 1
  }

  /**
   * Generate PDF format
   */
  async generatePDFFormat(content, template, size) {
    return {
      format: 'pdf',
      size: template.sizes[size],
      typography: template.typography,
      colors: template.colors,
      layout: template.layout,
      features: template.features,
      content: content,
      metadata: {
        generatedAt: new Date().toISOString(),
        template: template.name,
        version: '1.0'
      }
    }
  }

  /**
   * Generate DOCX format
   */
  async generateDOCXFormat(content, template, size) {
    return {
      format: 'docx',
      size: template.sizes[size],
      typography: template.typography,
      colors: template.colors,
      layout: template.layout,
      content: content,
      metadata: {
        generatedAt: new Date().toISOString(),
        template: template.name,
        version: '1.0'
      }
    }
  }

  /**
   * Generate EPUB format
   */
  async generateEPUBFormat(content, template, size) {
    return {
      format: 'epub',
      size: template.sizes[size],
      typography: template.typography,
      colors: template.colors,
      layout: template.layout,
      content: content,
      metadata: {
        generatedAt: new Date().toISOString(),
        template: template.name,
        version: '1.0'
      }
    }
  }

  /**
   * Generate HTML format
   */
  async generateHTMLFormat(content, template, size) {
    return {
      format: 'html',
      size: template.sizes[size],
      typography: template.typography,
      colors: template.colors,
      layout: template.layout,
      content: content,
      css: this.generateCSS(template),
      metadata: {
        generatedAt: new Date().toISOString(),
        template: template.name,
        version: '1.0'
      }
    }
  }

  /**
   * Generate CSS for HTML format
   */
  generateCSS(template) {
    return `
      body {
        font-family: '${template.typography.primary}', sans-serif;
        font-size: ${template.layout.fontSize};
        line-height: ${template.layout.lineHeight};
        color: ${template.colors.text};
        background-color: ${template.colors.background};
        margin: ${template.layout.margins.top} ${template.layout.margins.right} ${template.layout.margins.bottom} ${template.layout.margins.left};
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: ${template.colors.primary};
        font-family: '${template.typography.secondary}', serif;
      }
      
      .chapter {
        margin-bottom: ${template.layout.chapterSpacing};
      }
      
      .cover-page {
        text-align: center;
        padding: 2rem 0;
      }
      
      .table-of-contents {
        margin: 2rem 0;
      }
    `
  }

  /**
   * Get template recommendations based on content
   */
  getTemplateRecommendations(content) {
    const recommendations = []

    // Analyze content to suggest appropriate templates
    if (content.type === 'business' || content.genre === 'business') {
      recommendations.push('corporate_executive', 'modern_minimalist')
    }

    if (content.type === 'academic' || content.genre === 'educational') {
      recommendations.push('academic_scholar', 'educational_guide')
    }

    if (content.type === 'creative' || content.genre === 'fiction') {
      recommendations.push('creative_showcase', 'luxury_premium')
    }

    if (content.type === 'medical' || content.genre === 'health') {
      recommendations.push('medical_professional', 'self_help_coach')
    }

    if (content.type === 'finance' || content.genre === 'finance') {
      recommendations.push('financial_advisor', 'corporate_executive')
    }

    // Return template objects
    return recommendations.map(id => getTemplateById(id)).filter(Boolean)
  }

  /**
   * Validate template compatibility
   */
  validateTemplateCompatibility(content, templateId) {
    const template = getTemplateById(templateId)
    if (!template) {
      return { valid: false, error: 'Template not found' }
    }

    const issues = []

    // Check content length vs template recommendations
    if (content.wordCount) {
      const wordCount = parseInt(content.wordCount.split('-')[0])
      if (wordCount < 5000 && template.category === 'academic') {
        issues.push('Academic template may be too formal for short content')
      }
    }

    // Check content type vs template category
    if (content.type && content.type !== template.category) {
      issues.push(`Content type (${content.type}) doesn't match template category (${template.category})`)
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? this.getTemplateRecommendations(content) : []
    }
  }

  /**
   * Get current active template
   */
  getActiveTemplate() {
    return this.activeTemplate
  }

  /**
   * Clear active template
   */
  clearActiveTemplate() {
    this.activeTemplate = null
    this.generationContext = null
  }
}

// Export singleton instance
export const templateApplicationService = new TemplateApplicationService()
export default templateApplicationService

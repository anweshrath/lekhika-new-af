/**
 * OUTPUT HELPERS MODULE
 * 
 * Purpose: Centralize all output formatting logic extracted from workflowExecutionService.js
 * 
 * Location: workflow/helpers/outputHelpers.js
 * 
 * Responsibilities:
 * - Format compiled content into multiple output formats (HTML, PDF, DOCX, etc.)
 * - Generate deliverable files metadata
 * - Handle MIME type mapping
 * 
 * Dependencies:
 * - professionalBookFormatter: For beautiful formatting
 * - exportService: For binary format conversion (PDF, DOCX, EPUB)
 * - sanitizeUtils: For content sanitization (fixes __sanitizePermissions error)
 * 
 * Extracted from: workflowExecutionService.js (lines 1750-2072)
 * Extraction date: Phase 1.1 - Immediate fix for __sanitizePermissions error
 * 
 * Methods extracted:
 * - formatFinalOutput() (async)
 * - generateDeliverables()
 * - getMimeType()
 * 
 * Usage:
 *   const { formatFinalOutput, generateDeliverables, getMimeType } = require('./workflow/helpers/outputHelpers')
 */

const { professionalBookFormatter } = require('../../professionalBookFormatter.js')
const exportService = require('../../exportService.js')
const { sanitizePermissions } = require('../../sanitizeUtils.js')

/**
 * Get MIME type for format
 * Extracted from: workflowExecutionService.js - getMimeType() method
 */
function getMimeType(format = '') {
  const normalized = String(format || '').toLowerCase()
  const mimeTypes = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    html: 'text/html',
    markdown: 'text/markdown',
    md: 'text/markdown',
    txt: 'text/plain',
    text: 'text/plain',
    json: 'application/json',
    epub: 'application/epub+zip',
    xml: 'application/xml',
    rtf: 'application/rtf',
    odt: 'application/vnd.oasis.opendocument.text',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4'
  }
  return mimeTypes[normalized] || 'text/plain'
}

/**
 * Format final output for multiple formats
 * Extracted from: workflowExecutionService.js - formatFinalOutput() method
 * 
 * FIXES APPLIED:
 * - Replaced all 5 occurrences of this.__sanitizePermissions() with sanitizePermissions()
 * - Now uses imported sanitizePermissions from sanitizeUtils.js
 * 
 * @param {Object} compiledContent - Compiled workflow content with sections, userInput, etc.
 * @param {Object} formatOptions - Format options (outputFormat, exportFormats)
 * @returns {Object} Formatted output with all formats and preview content
 */
async function formatFinalOutput(compiledContent, formatOptions) {
  const { outputFormat = 'markdown', exportFormats = [] } = formatOptions
  
  // If exportFormats is provided (from input node), use those instead of single outputFormat
  let formatsToGenerate = exportFormats.length > 0 ? exportFormats : [outputFormat]
  
  // SURGICAL FIX: Normalize all formats to lowercase for consistency
  // Only generate formats that user selected - NO FORCED HTML
  formatsToGenerate = formatsToGenerate
    .map(f => {
      const formatStr = typeof f === 'string' ? f : String(f)
      return formatStr.trim().toLowerCase()
    })
    .filter(f => f && f.length >= 2) // Filter out empty or single-character formats
  
  console.log('🎯 Formatting output for formats (user-selected only):', formatsToGenerate)
  console.log('🎯 Format count:', formatsToGenerate.length)
  console.log('📊 Compiled content sections:', compiledContent.sections?.length || 0)
  
  const formattedOutputs = {}
  
  // Generate content for each requested format using PROFESSIONAL FORMATTER
  for (const format of formatsToGenerate) {
    // Format is already normalized to lowercase
    const formatStr = format
    console.log(`🎯 Processing format: "${formatStr}"`)
    
    // Skip if format is empty or just a single character (shouldn't happen after filtering, but double-check)
    if (!formatStr || formatStr.length < 2) {
      console.log(`⚠️ Skipping invalid format: "${formatStr}"`)
      continue
    }
    
    try {
      // Use PROFESSIONAL FORMATTER for all formats
      const userInput = compiledContent.userInput || {}
      
      // Extract the actual book content from the compiled workflow data
      // PRIORITY: Use sections (structured chapters) if available, otherwise fallback to generatedContent
      let bookContent = ''
      
      // CRITICAL FIX: Build bookContent from sections FIRST (this is where chapters are!)
      if (compiledContent.sections && Array.isArray(compiledContent.sections) && compiledContent.sections.length > 0) {
        console.log(`📚 Building bookContent from ${compiledContent.sections.length} sections`)
        // Build markdown from structured sections
        bookContent = compiledContent.sections
          .filter(section => section && section.content && typeof section.content === 'string' && section.content.trim().length > 0)
          .map((section, idx) => {
            const title = section.title || section.metadata?.title || `Chapter ${section.chapterNumber || section.metadata?.chapterNumber || (idx + 1)}`
            // FIXED: Use sanitizePermissions instead of this.__sanitizePermissions
            const body = sanitizePermissions(section.content || '')
            return `## ${title}\n\n${body}`
          })
          .join('\n\n---\n\n')
        console.log(`📚 Built bookContent from sections: ${bookContent.length} characters`)
      } else if (compiledContent.generatedContent) {
        // Fallback: Get the main content from the last process node that generated book content
        console.log(`📚 Building bookContent from generatedContent (fallback)`)
        const contentNodes = Object.values(compiledContent.generatedContent)
        const lastContent = contentNodes[contentNodes.length - 1] || ''

        if (Array.isArray(lastContent)) {
          // Assemble markdown from chapters
          bookContent = lastContent
            .filter(ch => ch && typeof ch.content === 'string' && ch.content.trim().length > 0)
            .map((ch, idx) => {
              const title = ch.title || `Chapter ${ch.chapter || idx + 1}`
              // FIXED: Use sanitizePermissions instead of this.__sanitizePermissions
              const body = sanitizePermissions(ch.content || '')
              return `## ${title}\n\n${body}`
            })
            .join('\n\n---\n\n')
        } else if (typeof lastContent === 'string') {
          // CRITICAL FIX: Clean multi-chapter text before formatting
          // FIXED: Use sanitizePermissions instead of this.__sanitizePermissions
          bookContent = sanitizePermissions(lastContent)
            .replace(/<[^>]*>/g, '')
            .replace(/font-family[^;]*;?/g, '')
            .replace(/font-weight[^;]*;?/g, '')
            .replace(/font-size[^;]*;?/g, '')
            .replace(/margin[^;]*;?/g, '')
            .replace(/line-height[^;]*;?/g, '')
            .replace(/"[^"]*"/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
        } else {
          bookContent = ''
        }
      } else {
        // FIXED: Use sanitizePermissions instead of this.__sanitizePermissions
        bookContent = sanitizePermissions(compiledContent.content || compiledContent)
      }
      
      console.log(`📚 Generating ${formatStr} format`)
      console.log(`📚 Book content length:`, typeof bookContent === 'string' ? bookContent.length : 'Not a string')
      console.log(`📚 User input:`, Object.keys(userInput))
      
      // SURGICAL FIX: ALWAYS use professionalBookFormatter first for consistent beautiful formatting
      console.log(`📚 SURGICAL FIX: Using professionalBookFormatter for ALL formats: ${formatStr}`)
      
      // Extract user typography preferences with PROFESSIONAL DEFAULTS
      const typographyPrefs = {
        // Font families with professional hierarchy
        fontFamily: userInput.typography_combo || userInput.font_family || 'Georgia, serif',
        headingFont: userInput.heading_font || 'Impact, Arial Black, sans-serif',
        bodyFont: userInput.body_font || 'Tahoma, Arial, sans-serif',
        chapterFont: userInput.chapter_font || 'Georgia, Times New Roman, serif',
        
        // Font sizes with professional hierarchy  
        fontSize: userInput.font_size || '12pt',
        headingSize: userInput.heading_size || '36pt',
        chapterSize: userInput.chapter_size || '16pt',
        
        // Font weights with professional hierarchy
        fontWeight: userInput.font_weight || 'normal',
        headingWeight: userInput.heading_weight || 'bold',
        chapterWeight: userInput.chapter_weight || '600',
        
        // Layout and style
        writingStyle: userInput.writing_style || 'descriptive',
        tone: userInput.tone || 'professional',
        format: formatStr,
        pageSize: userInput.book_size || 'A5',
        margins: userInput.margins || '1in',
        lineHeight: userInput.line_height || '1.8',
        textAlign: userInput.text_align || 'justify',
        colorScheme: userInput.color_scheme || 'classic'
      }
      
      // SURGICAL: Load template if user specified one
      let templateData = null
      if (userInput.book_template && userInput.book_template !== 'none') {
        console.log(`📚 Loading template: ${userInput.book_template}`)
        templateData = await professionalBookFormatter.loadTemplate(userInput.book_template)
        if (templateData) {
          // Override typographyPrefs with template settings
          Object.assign(typographyPrefs, {
            fontFamily: templateData.font_family || typographyPrefs.fontFamily,
            headingFont: templateData.heading_font || typographyPrefs.headingFont,
            bodyFont: templateData.body_font || typographyPrefs.bodyFont,
            chapterFont: templateData.chapter_font || typographyPrefs.chapterFont,
            fontSize: templateData.font_size || typographyPrefs.fontSize,
            headingSize: templateData.heading_size || typographyPrefs.headingSize,
            chapterSize: templateData.chapter_size || typographyPrefs.chapterSize,
            fontWeight: templateData.font_weight || typographyPrefs.fontWeight,
            headingWeight: templateData.heading_weight || typographyPrefs.headingWeight,
            chapterWeight: templateData.chapter_weight || typographyPrefs.chapterWeight,
            pageSize: templateData.page_size || typographyPrefs.pageSize,
            margins: templateData.margins || typographyPrefs.margins,
            lineHeight: templateData.line_height || typographyPrefs.lineHeight,
            textAlign: templateData.text_align || typographyPrefs.textAlign,
            colorScheme: templateData.color_scheme || typographyPrefs.colorScheme
          })
          console.log(`✅ Template applied: ${userInput.book_template}`)
        }
      }
      
      // STEP 1: Generate beautiful formatted content using professionalBookFormatter
      // FIXED: Use sanitizePermissions instead of this.__sanitizePermissions (5th occurrence)
      const beautifulContent = await professionalBookFormatter.formatCompleteBook(
        compiledContent,
        userInput,
        formatStr,
        { ...typographyPrefs, template: templateData, rawContent: sanitizePermissions(bookContent) }
      )
      
      // STEP 2: For binary formats, pass beautiful content to exportService for conversion
      // formatStr is already normalized to lowercase
      if (['pdf', 'docx', 'epub'].includes(formatStr)) {
        console.log(`📚 Converting beautiful ${formatStr} content to binary format`)
        
        // Prepare enhanced data with beautiful pre-formatted content
        // SURGICAL FIX: Include ALL content (structural, sections, userInput) - single source of truth
        const enhancedData = {
          userInput: userInput,
          sections: compiledContent.sections || [],
          structural: compiledContent.structural || {}, // SURGICAL: Include structural (foreword, introduction, TOC)
          totalWords: compiledContent.totalWords || 0,
          metadata: compiledContent.metadata || {},
          content: bookContent,
          beautifulContent: beautifulContent,  // SURGICAL: Pass beautiful formatted content
          typographyPrefs: typographyPrefs     // SURGICAL: Pass typography preferences
        }
        
        // formatStr is already normalized to lowercase
        switch (formatStr) {
          case 'pdf':
            formattedOutputs[formatStr] = await exportService.generatePDF(enhancedData)
            break
          case 'docx':
            console.log('🔧 SURGICAL: Converting beautiful content to DOCX')
            formattedOutputs[formatStr] = await exportService.generateDOCX(enhancedData)
            break
          case 'epub':
            formattedOutputs[formatStr] = await exportService.generateEPUB(enhancedData)
            break
        }
      } else {
        // STEP 4: For text formats, use beautiful content directly
        console.log(`📚 Using beautiful ${formatStr} content directly`)
        formattedOutputs[formatStr] = beautifulContent
      }
      
      const contentLength = typeof formattedOutputs[formatStr] === 'string' ?
        formattedOutputs[formatStr].length :
        JSON.stringify(formattedOutputs[formatStr]).length
      
      console.log(`✅ Generated PROFESSIONAL ${formatStr} format (${contentLength} chars)`)
    } catch (error) {
      console.error(`❌ Error generating ${formatStr} format:`, error)
      // NO FALLBACK - FAIL FAST AND REPORT ERROR
      throw new Error(`Professional formatter failed for ${formatStr}: ${error.message}`)
    }
  }
  
  // Use first available format for preview display (fallback to markdown/text if available)
  const previewFormat = formattedOutputs['text'] || 
                        formattedOutputs['markdown'] || 
                        formattedOutputs['html'] || 
                        Object.values(formattedOutputs)[0] || 
                        ''
  const primaryFormat = formatsToGenerate[0] || 'markdown'  // Use first requested format as primary
  
  console.log('📄 Preview format content type:', typeof previewFormat)
  console.log('📄 All formats generated:', Object.keys(formattedOutputs))
  console.log('📄 Requested formats:', formatsToGenerate)
  console.log('📄 Primary format:', primaryFormat)
  
  return {
    content: previewFormat,  // First available format for display
    allFormats: formattedOutputs,  // All generated formats with normalized lowercase keys
    requestedFormats: formatsToGenerate,
    primaryFormat: primaryFormat
  }
}

/**
 * Generate deliverables from formatted output
 * Extracted from: workflowExecutionService.js - generateDeliverables() method
 * 
 * @param {Object} formattedOutput - Formatted output with allFormats
 * @param {Object} nodeData - Node data with exportFormats
 * @param {Function} getMimeTypeHelper - getMimeType function passed as helper
 * @returns {Array} Array of deliverable objects with format, content, filename, size, etc.
 */
function generateDeliverables(formattedOutput, nodeData = {}, getMimeTypeHelper) {
  const deliverables = []

  // Handle new format structure with multiple formats
  if (formattedOutput?.allFormats) {
    // New structure with multiple formats
    Object.entries(formattedOutput.allFormats).forEach(([format, content]) => {
      // Check if content is base64 data URI (for binary formats)
      if (typeof content === 'string' && content.startsWith('data:')) {
        const base64Data = content.split(',')[1] || ''
        deliverables.push({
          format,
          content: content, // Keep full data URI for download
          filename: `lekhika_generated_content.${format}`,
          size: base64Data.length,
          isPrimary: format === formattedOutput.primaryFormat,
          mimeType: content.split(':')[1]?.split(';')[0] || getMimeTypeHelper(format),
          isBinary: true
        })
        return
      }

      // CLEAN CONTENT - NO JSON GARBAGE
      let contentString = ''
      if (typeof content === 'string') {
        contentString = content
      } else if (content && typeof content === 'object') {
        // Extract clean content from nested structure
        if (content.content && typeof content.content === 'string') {
          contentString = content.content
        } else if (Array.isArray(content.chapters)) {
          // Multi-chapter content - compile chapters
          contentString = content.chapters.map(chapter =>
            typeof chapter === 'string' ? chapter :
            (chapter.content || chapter.text || JSON.stringify(chapter))
          ).join('\n\n')
        } else if (content.text || content.body) {
          contentString = content.text || content.body
        } else {
          // Last resort - try to extract any string content
          console.warn(`⚠️ Complex content structure for ${format}, attempting extraction`)
          contentString = JSON.stringify(content, null, 2)
        }
      } else {
        // Last resort - convert to string but this should not happen with professional formatter
        console.warn(`⚠️ Unexpected content structure for ${format}:`, typeof content)
        contentString = String(content)
      }

      deliverables.push({
        format,
        content: contentString,
        filename: `lekhika_generated_content.${format}`,
        size: contentString.length,
        isPrimary: format === formattedOutput.primaryFormat,
        mimeType: getMimeTypeHelper(format),
        isBinary: false
      })
    })
  } else {
    // Legacy structure with single format
    const exportFormats = nodeData.exportFormats || ['markdown']
    
    // CLEAN CONTENT - NO JSON GARBAGE FOR LEGACY STRUCTURE TOO
    let contentString = ''
    if (typeof formattedOutput === 'string') {
      contentString = formattedOutput
    } else if (formattedOutput && formattedOutput.content) {
      contentString = formattedOutput.content
    } else {
      console.warn('⚠️ Legacy structure: Unexpected format for content:', typeof formattedOutput)
      contentString = String(formattedOutput)
    }
    
    exportFormats.forEach(format => {
      deliverables.push({
        format,
        content: contentString,
        filename: `lekhika_generated_content.${format}`,
        size: contentString.length,
        isPrimary: true,
        mimeType: getMimeTypeHelper(format),
        isBinary: false
      })
    })
  }

  console.log('📦 Generated deliverables:', deliverables.map(d => `${d.format} (${d.size} chars)`))
  return deliverables
}

module.exports = {
  formatFinalOutput,
  generateDeliverables,
  getMimeType
}


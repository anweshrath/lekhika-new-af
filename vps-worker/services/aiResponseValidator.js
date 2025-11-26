/**
 * AI RESPONSE VALIDATOR
 * Comprehensive validation for AI-generated content
 * NO BAND-AIDS - Proper validation with detailed error reporting
 */

class AIResponseValidator {
  constructor() {
    this.validationRules = {
      minWordCount: 100,           // Dynamic minimum - will be calculated based on user input
      minCharCount: 500,           // Dynamic minimum - will be calculated based on user input
      maxConsecutiveDuplicates: 3, // Max repeated words in a row
      minUniqueSentences: 3,       // Minimum unique sentences
      requiredStructure: ['paragraph', 'content'] // Must have actual prose
    }
  }

  /**
   * MAIN VALIDATION: Check if AI response is valid and usable
   * @param {*} aiResponse - Raw AI response from any provider
   * @param {string} contentType - Type of content (chapter, outline, etc.)
   * @param {Object} userInput - User input parameters for dynamic validation
   * @param {Object} nodePermissions - Node permissions from NODE_ROLE_CONFIG
   * @returns {Object} - { isValid: boolean, content: string, errors: array, warnings: array }
   */
  validateResponse(aiResponse, contentType = 'chapter', userInput = {}, nodePermissions = null) {
    const validation = {
      isValid: false,
      content: null,
      errors: [],
      warnings: [],
      metadata: {
        contentType,
        timestamp: new Date().toISOString()
      }
    }

    // Step 1: Check if response exists
    if (!aiResponse) {
      validation.errors.push({
        code: 'NULL_RESPONSE',
        message: 'AI response is null or undefined',
        severity: 'critical'
      })
      return validation
    }

    // Step 2: Extract content from response
    const extractedContent = this.extractContent(aiResponse)
    
    if (!extractedContent) {
      validation.errors.push({
        code: 'NO_CONTENT',
        message: 'Could not extract content from AI response',
        severity: 'critical',
        responseType: typeof aiResponse,
        responsePreview: JSON.stringify(aiResponse).substring(0, 200)
      })
      return validation
    }

    validation.content = extractedContent

    // Step 3: Validate permissions if provided
    if (nodePermissions) {
      this.validatePermissions(extractedContent, contentType, nodePermissions, validation)
    }

    // Step 4: Validate content based on type
    if (contentType === 'chapter') {
      this.validateChapterContent(extractedContent, validation, userInput)
    } else if (contentType === 'outline') {
      this.validateOutlineContent(extractedContent, validation, userInput)
    } else {
      this.validateGenericContent(extractedContent, validation)
    }

    // Step 5: Set overall validity
    validation.isValid = validation.errors.filter(e => e.severity === 'critical').length === 0

    return validation
  }

  /**
   * Validate content against node permissions
   * @param {string} content - Extracted content
   * @param {string} contentType - Type of content
   * @param {Object} permissions - Node permissions from NODE_ROLE_CONFIG
   * @param {Object} validation - Validation object to update
   */
  validatePermissions(content, contentType, permissions, validation) {
    console.log('🔒 [VALIDATOR] Validating permissions:', permissions)
    
    // SURGICAL FIX: Be more lenient with permission validation
    // Only enforce strict permissions if they are explicitly set to false
    // If permissions are undefined or true, allow the content
    
    // Check if node is trying to write content when explicitly forbidden
    if (permissions.canWriteContent === false && contentType === 'chapter') {
      validation.errors.push({
        code: 'PERMISSION_VIOLATION',
        message: 'Node is explicitly forbidden from writing content but generated chapter content',
        severity: 'critical',
        permission: 'canWriteContent',
        expected: false,
        actual: true
      })
    }
    
    // Check if node is trying to edit structure when explicitly forbidden
    if (permissions.canEditStructure === false && contentType === 'outline') {
      validation.errors.push({
        code: 'PERMISSION_VIOLATION',
        message: 'Node is explicitly forbidden from editing structure but generated outline content',
        severity: 'critical',
        permission: 'canEditStructure',
        expected: false,
        actual: true
      })
    }
    
    // Check if node is trying to proofread when explicitly forbidden
    if (permissions.canProofRead === false && content.toLowerCase().includes('proofread')) {
      validation.warnings.push({
        code: 'PERMISSION_WARNING',
        message: 'Node is explicitly forbidden from proofreading but content mentions proofreading',
        severity: 'warning',
        permission: 'canProofRead',
        expected: false,
        actual: true
      })
    }
    
    console.log('🔒 [VALIDATOR] Permission validation complete. Errors:', validation.errors.length, 'Warnings:', validation.warnings.length)
  }

  /**
   * Extract content from various AI response formats
   * @param {*} response - AI response (can be string, object, etc.)
   * @returns {string|null} - Extracted content or null
   */
  extractContent(response) {
    console.log('🔍 [VALIDATOR] extractContent called with:', typeof response)
    console.log('🔍 [VALIDATOR] Response preview:', JSON.stringify(response).substring(0, 200))
    
    // Handle string responses
    if (typeof response === 'string') {
      console.log('🔍 [VALIDATOR] Processing string response, length:', response.length)
      // Check if it's valid string content (not stringified JSON)
      if (response.trim().startsWith('{') && response.trim().endsWith('}')) {
        try {
          const parsed = JSON.parse(response)
          return this.extractContent(parsed) // Recursive call with parsed object
        } catch (e) {
          // Not valid JSON, treat as string content
          return response.trim()
        }
      }
      const result = response.trim()
      console.log('🔍 [VALIDATOR] String result length:', result.length)
      return result
    }

    // Handle array responses (Claude/Anthropic format: [{type: "text", text: "..."}])
    if (Array.isArray(response)) {
      console.log('🔍 [VALIDATOR] Processing array response, length:', response.length)
      if (response[0]?.text) {
        const result = response[0].text.trim()
        console.log('🔍 [VALIDATOR] Array text result length:', result.length)
        return result
      }
      // Try extracting from first element
      if (response[0]) {
        return this.extractContent(response[0])
      }
    }

    // Handle object responses
    if (typeof response === 'object') {
      console.log('🔍 [VALIDATOR] Processing object response')
      console.log('🔍 [VALIDATOR] Object keys:', Object.keys(response))
      
      // Check for Claude/Anthropic format FIRST (before generic loop)
      if (response.content && Array.isArray(response.content) && response.content[0]) {
        console.log('🔍 [VALIDATOR] Found Claude format: content array with', response.content.length, 'elements')
        if (response.content[0].text) {
          const result = response.content[0].text.trim()
          console.log('🔍 [VALIDATOR] Claude text result length:', result.length)
          return result
        }
      }

      // Check for nested content in choices (OpenAI format)
      if (response.choices && Array.isArray(response.choices) && response.choices[0]) {
        if (response.choices[0].message?.content) {
          return response.choices[0].message.content.trim()
        }
        if (response.choices[0].text) {
          return response.choices[0].text.trim()
        }
      }

      // Try common content fields
      const contentFields = ['content', 'text', 'message', 'output', 'result', 'data']
      
      for (const field of contentFields) {
        if (response[field]) {
          // If field is string, return it
          if (typeof response[field] === 'string') {
            return response[field].trim()
          }
          // If field is array, handle it
          if (Array.isArray(response[field])) {
            return this.extractContent(response[field])
          }
          // If field is object, recursively extract
          if (typeof response[field] === 'object') {
            return this.extractContent(response[field])
          }
        }
      }
    }

    return null
  }

  /**
   * Attempt to extract a JSON object from text that may include markdown, code fences, or bullets
   */
  extractJsonFromText(text) {
    if (!text || typeof text !== 'string') return null

    const trimmed = text.trim()

    // 1) If it already looks like JSON, try parse directly
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try { return JSON.parse(trimmed) } catch (_) { /* fallthrough */ }
    }

    // 2) Try code-fenced JSON blocks ```json ... ``` or ``` ... ```
    const fenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi
    let match
    while ((match = fenceRegex.exec(text)) !== null) {
      let candidate = match[1].trim()
      try { return JSON.parse(candidate) } catch (_) {
        // Try cleaning bullets inside fenced block then parse
        const cleaned = candidate
          .split('\n')
          .map(l => l
            .replace(/^\s*[-*+•–]\s+/g, '')
            .replace(/^\s*\d+\.\s+/g, ''))
          .join('\n')
        try { return JSON.parse(cleaned) } catch (_) { /* try next */ }
      }
    }

    // 3) Remove common markdown bullets/prefixes and try to parse remaining braces block
    const lines = text
      .split('\n')
      .map(l => l
        .replace(/^\s*[-*+•–]\s+/g, '')
        .replace(/^\s*\d+\.\s+/g, ''))
      .join('\n')

    // Find the largest balanced curly-brace block
    const braceStart = lines.indexOf('{')
    if (braceStart !== -1) {
      const afterStart = lines.slice(braceStart)
      const braceEnd = afterStart.lastIndexOf('}')
      if (braceEnd !== -1) {
        const candidate = afterStart.slice(0, braceEnd + 1)
        try { return JSON.parse(candidate) } catch (_) { /* fallthrough */ }
      }
    }

    // 4) As a last attempt, try to match a JSON object/array with regex
    const jsonObjectRegex = /\{[\s\S]*\}/
    const jsonArrayRegex = /\[[\s\S]*\]/
    const obj = lines.match(jsonObjectRegex)
    if (obj) {
      try { return JSON.parse(obj[0]) } catch (_) { /* fallthrough */ }
    }
    const arr = lines.match(jsonArrayRegex)
    if (arr) {
      try { return JSON.parse(arr[0]) } catch (_) { /* fallthrough */ }
    }

    return null
  }

  /**
   * Validate chapter content specifically
   * @param {string} content - Extracted content
   * @param {Object} validation - Validation object to update
   */
  validateChapterContent(content, validation, userInput = {}) {
    // NO PER-CHAPTER VALIDATION - Let AI decide chapter lengths naturally
    // Only validate that content exists and has substance
    
    console.log('🔍 CHAPTER VALIDATION (VPS): No fixed length requirements')
    console.log('  - Content length:', content.length)
    console.log('  - Word count:', this.countWords(content))
    
    // Check 1: Content exists and has substance (minimum 50 words for any content)
    const wordCount = this.countWords(content)
    const charCount = content.length

    if (wordCount < 50) {
      validation.errors.push({
        code: 'INSUFFICIENT_LENGTH',
        message: `Chapter too short: ${wordCount} words (minimum: 50 words to ensure meaningful content)`,
        severity: 'critical',
        actual: wordCount,
        expected: 50
      })
    }

    // Check 2: Not just whitespace or special characters
    const meaningfulContent = content.replace(/[\s\n\r\t]/g, '')
    if (meaningfulContent.length < 100) {
      validation.errors.push({
        code: 'NO_MEANINGFUL_CONTENT',
        message: 'Content contains mostly whitespace or special characters',
        severity: 'critical'
      })
    }

    // Check 3: Has actual sentences
    const sentences = this.extractSentences(content)
    if (sentences.length < this.validationRules.minUniqueSentences) {
      validation.errors.push({
        code: 'INSUFFICIENT_SENTENCES',
        message: `Too few sentences: ${sentences.length} (minimum: ${this.validationRules.minUniqueSentences})`,
        severity: 'critical',
        actual: sentences.length,
        expected: this.validationRules.minUniqueSentences
      })
    }

    // Check 4: Not repetitive garbage
    const repetitionAnalysis = this.analyzeRepetitiveContent(content)
    if (repetitionAnalysis.isRepetitive) {
      validation.errors.push({
        code: 'REPETITIVE_CONTENT',
        message: repetitionAnalysis.sequence
          ? `Content contains excessive repetition (${repetitionAnalysis.occurrences} occurrences of "${repetitionAnalysis.sequence}")`
          : 'Content contains excessive repetition',
        severity: 'critical',
        details: repetitionAnalysis
      })
    }
    validation.metadata.repetitionAnalysis = repetitionAnalysis

    // Check 5: Not an error message disguised as content
    if (this.isErrorMessage(content)) {
      validation.errors.push({
        code: 'ERROR_AS_CONTENT',
        message: 'AI returned an error message instead of content',
        severity: 'critical',
        errorContent: content.substring(0, 200)
      })
    }

    // Check 6: Has paragraph structure
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50)
    if (paragraphs.length < 2) {
      validation.warnings.push({
        code: 'POOR_STRUCTURE',
        message: 'Content lacks proper paragraph structure',
        actual: paragraphs.length
      })
    }

    // Add metadata
    validation.metadata.wordCount = wordCount
    validation.metadata.charCount = charCount
    validation.metadata.sentenceCount = sentences.length
    validation.metadata.paragraphCount = paragraphs.length
  }

  /**
   * Validate outline/structured content
   */
  validateOutlineContent(content, validation) {
    // Try to parse as JSON
    try {
      let parsed = typeof content === 'string' ? null : content

      if (parsed === null) {
        // First, attempt direct JSON.parse
        try {
          parsed = JSON.parse(content)
        } catch (_) {
          // If that fails, try extracting JSON from markdown/bulleted text
          parsed = this.extractJsonFromText(content)
        }
      }
      
      if (!parsed || typeof parsed !== 'object') {
        // SURGICAL FIX: Be more lenient with outline content validation
        // If it's not JSON but looks like structured content (bullets, lists), accept it
        if (this.isStructuredTextContent(content)) {
          validation.warnings.push({
            code: 'NON_JSON_OUTLINE',
            message: 'Outline is structured text format, not JSON - this is acceptable',
            severity: 'warning'
          })
          validation.metadata.outlineFormat = 'structured_text'
          return // Accept as valid structured content
        }
        
        // SURGICAL FIX: Accept any content that looks like an outline (contains chapters, titles, etc.)
        if (this.looksLikeOutlineContent(content)) {
          validation.warnings.push({
            code: 'FREEFORM_OUTLINE',
            message: 'Outline is in freeform text format - this is acceptable',
            severity: 'warning'
          })
          validation.metadata.outlineFormat = 'freeform_text'
          return // Accept as valid outline content
        }
        
        validation.errors.push({
          code: 'INVALID_OUTLINE_FORMAT',
          message: 'Outline is not a valid object or structured content',
          severity: 'critical'
        })
        return
      }

      // SURGICAL FIX: Accept ANY valid JSON structure from architect/planning nodes
      // Planning nodes have complete freedom to structure their output however makes sense
      // Only reject if completely empty
      
      if (Object.keys(parsed).length === 0) {
        validation.errors.push({
          code: 'MISSING_OUTLINE_STRUCTURE',
          message: 'Outline appears empty',
          severity: 'critical'
        })
      } else {
        // Accept ANY structure with content - planning nodes decide their own format
        validation.metadata.outlineStructure = 'flexible_planning_format'
        validation.metadata.receivedKeys = Object.keys(parsed).join(', ')
      }

    } catch (e) {
      validation.errors.push({
        code: 'OUTLINE_PARSE_ERROR',
        message: `Failed to parse outline: ${e.message}`,
        severity: 'critical'
      })
    }
  }

  /**
   * Validate generic content
   */
  validateGenericContent(content, validation) {
    const wordCount = this.countWords(content)
    
    if (wordCount < 50) {
      validation.errors.push({
        code: 'INSUFFICIENT_CONTENT',
        message: `Content too short: ${wordCount} words`,
        severity: 'critical',
        actual: wordCount
      })
    }

    if (this.isErrorMessage(content)) {
      validation.errors.push({
        code: 'ERROR_AS_CONTENT',
        message: 'AI returned an error message instead of content',
        severity: 'critical'
      })
    }

    validation.metadata.wordCount = wordCount
  }

  /**
   * Count words in text
   */
  countWords(text) {
    if (!text || typeof text !== 'string') return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Extract sentences from text
   */
  extractSentences(text) {
    if (!text || typeof text !== 'string') return []
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10) // Filter out very short fragments
  }

  /**
   * Check if content is structured text (bullets, lists, etc.) rather than JSON
   */
  isStructuredTextContent(text) {
    if (!text || typeof text !== 'string') return false
    
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    if (lines.length < 2) return false
    
    // Check for bullet points, numbered lists, or structured content
    const bulletPatterns = [
      /^\s*[-*+•–]\s+/,  // Bullet points
      /^\s*\d+\.\s+/,     // Numbered lists
      /^\s*\d+\)\s+/,     // Numbered lists with parentheses
      /^\s*[a-zA-Z]\.\s+/, // Lettered lists
      /^\s*[IVX]+\.\s+/,  // Roman numerals
    ]
    
    let structuredLines = 0
    for (const line of lines) {
      for (const pattern of bulletPatterns) {
        if (pattern.test(line)) {
          structuredLines++
          break
        }
      }
    }
    
    // If more than 50% of lines are structured, consider it structured content
    return structuredLines >= Math.ceil(lines.length * 0.5)
  }

  /**
   * SURGICAL FIX: Check if content looks like outline content in any format
   */
  looksLikeOutlineContent(text) {
    if (!text || typeof text !== 'string') return false
    
    const textLower = text.toLowerCase()
    
    // Check for outline-related keywords
    const outlineKeywords = [
      'chapter', 'title', 'book', 'story', 'outline', 'plot', 'character',
      'foreword', 'introduction', 'table of contents', 'toc', 'summary',
      'synopsis', 'structure', 'arc', 'theme', 'setting'
    ]
    
    let keywordMatches = 0
    for (const keyword of outlineKeywords) {
      if (textLower.includes(keyword)) {
        keywordMatches++
      }
    }
    
    // If it contains multiple outline keywords, accept it
    if (keywordMatches >= 3) {
      return true
    }
    
    // Check for chapter-like patterns
    const chapterPatterns = [
      /chapter\s+\d+/i,
      /chapter\s+[ivx]+/i,
      /part\s+\d+/i,
      /section\s+\d+/i,
      /#\s*chapter/i,
      /##\s*chapter/i
    ]
    
    for (const pattern of chapterPatterns) {
      if (pattern.test(text)) {
        return true
      }
    }
    
    // If content is substantial and contains story-related terms, accept it
    const wordCount = text.trim().split(/\s+/).length
    return wordCount > 100 && keywordMatches >= 2
  }

  /**
   * Check if content is repetitive
   */
  analyzeRepetitiveContent(text) {
    if (!text || typeof text !== 'string') {
      return { isRepetitive: false, occurrences: 0, sequence: null }
    }
    
    const words = text.toLowerCase().split(/\s+/)
    if (words.length < 20) {
      return { isRepetitive: false, occurrences: 0, sequence: null }
    }

    let maxRepeat = 0
    let worstSequence = null

    for (let i = 0; i <= words.length - 5; i++) {
      const sequence = words.slice(i, i + 5).join(' ')
      const restOfText = words.slice(i + 5).join(' ')
      const escapedSequence = sequence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const occurrences = (restOfText.match(new RegExp(escapedSequence, 'g')) || []).length
      
      if (occurrences > maxRepeat) {
        maxRepeat = occurrences
        worstSequence = sequence
      }
    }

    const totalOccurrences = worstSequence ? maxRepeat + 1 : 0
    const isRepetitive = maxRepeat > 5

    return {
      isRepetitive,
      occurrences: totalOccurrences,
      sequence: worstSequence
    }
  }

  isRepetitiveContent(text) {
    return this.analyzeRepetitiveContent(text).isRepetitive
  }

  /**
   * Check if content is actually an error message
   */
  isErrorMessage(text) {
    if (!text || typeof text !== 'string') return true
    
    const lowerText = text.toLowerCase()
    const errorPatterns = [
      'sorry',
      'cannot',
      'can\'t',
      'unable to',
      'error',
      'failed',
      'something went wrong',
      'try again',
      'api key',
      'invalid request',
      'rate limit',
      'quota exceeded',
      'authentication failed',
      'unauthorized'
    ]

    // If content is short and contains error keywords, it's likely an error
    if (text.length < 200) {
      for (const pattern of errorPatterns) {
        if (lowerText.includes(pattern)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Create detailed error report
   */
  createErrorReport(validation) {
    const report = {
      timestamp: new Date().toISOString(),
      isValid: validation.isValid,
      summary: {
        criticalErrors: validation.errors.filter(e => e.severity === 'critical').length,
        warnings: validation.warnings.length,
        totalIssues: validation.errors.length + validation.warnings.length
      },
      errors: validation.errors,
      warnings: validation.warnings,
      metadata: validation.metadata
    }

    if (!validation.isValid) {
      report.recommendation = this.getRecommendation(validation.errors)
    }

    return report
  }

  /**
   * Get recommendation based on errors
   */
  getRecommendation(errors) {
    const errorCodes = errors.map(e => e.code)

    if (errorCodes.includes('NULL_RESPONSE')) {
      return 'AI provider returned no response. Check API key validity and provider status.'
    }

    if (errorCodes.includes('NO_CONTENT')) {
      return 'AI response has no extractable content. The response format may be incompatible.'
    }

    if (errorCodes.includes('INSUFFICIENT_LENGTH')) {
      return 'AI generated content that is too short. Try increasing maxTokens or adjusting the prompt.'
    }

    if (errorCodes.includes('ERROR_AS_CONTENT')) {
      return 'AI returned an error message. Check API key, rate limits, and request parameters.'
    }

    if (errorCodes.includes('REPETITIVE_CONTENT')) {
      return 'AI generated repetitive content. Try adjusting temperature or using a different model.'
    }

    return 'Multiple validation issues detected. Review errors above for specific recommendations.'
  }
}

// Export singleton instance
const aiResponseValidator = new AIResponseValidator()
module.exports = aiResponseValidator


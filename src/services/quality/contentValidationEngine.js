import { EventEmitter } from 'events'
import { aiServiceManager } from '../aiServiceManager'

class ContentValidationEngine extends EventEmitter {
  constructor() {
    super()
    this.isInitialized = false
    this.activeValidations = new Map()
    this.validationRules = new Map()
    this.validationHistory = []
    this.statistics = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      averageValidationTime: 0
    }
  }

  async initialize() {
    try {
      console.log('🔍 Initializing Content Validation Engine...')
      
      // Register default validation rules
      this.registerDefaultValidationRules()
      
      // Load validation history
      await this.loadValidationHistory()
      
      this.isInitialized = true
      console.log('✅ Content Validation Engine initialized')
      
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Content Validation Engine:', error)
      throw error
    }
  }

  registerDefaultValidationRules() {
    // Length validation
    this.validationRules.set('length', {
      name: 'Length Validation',
      description: 'Validates content length within specified bounds',
      validator: this.validateLength.bind(this)
    })

    // Readability validation
    this.validationRules.set('readability', {
      name: 'Readability Validation',
      description: 'Validates content readability level',
      validator: this.validateReadability.bind(this)
    })

    // Coherence validation
    this.validationRules.set('coherence', {
      name: 'Coherence Validation',
      description: 'Validates content coherence and flow',
      validator: this.validateCoherence.bind(this)
    })

    // Originality validation
    this.validationRules.set('originality', {
      name: 'Originality Validation',
      description: 'Validates content originality',
      validator: this.validateOriginality.bind(this)
    })

    // Grammar validation
    this.validationRules.set('grammar', {
      name: 'Grammar Validation',
      description: 'Validates grammar and language quality',
      validator: this.validateGrammar.bind(this)
    })

    // Structure validation
    this.validationRules.set('structure', {
      name: 'Structure Validation',
      description: 'Validates content structure and organization',
      validator: this.validateStructure.bind(this)
    })

    console.log(`✅ Registered ${this.validationRules.size} validation rules`)
  }

  async loadValidationHistory() {
    try {
      // In a real implementation, this would load from database
      this.validationHistory = []
      this.calculateStatistics()
    } catch (error) {
      console.error('❌ Failed to load validation history:', error)
    }
  }

  calculateStatistics() {
    if (this.validationHistory.length === 0) {
      this.statistics = {
        totalValidations: 0,
        passedValidations: 0,
        failedValidations: 0,
        averageValidationTime: 0
      }
      return
    }

    this.statistics.totalValidations = this.validationHistory.length
    this.statistics.passedValidations = this.validationHistory.filter(v => v.passed).length
    this.statistics.failedValidations = this.validationHistory.filter(v => !v.passed).length

    const validationTimes = this.validationHistory
      .filter(v => v.validationTime)
      .map(v => v.validationTime)

    if (validationTimes.length > 0) {
      this.statistics.averageValidationTime = validationTimes.reduce((sum, time) => sum + time, 0) / validationTimes.length
    }
  }

  async validateContent(content, rules, options = {}) {
    const validationId = crypto.randomUUID()
    const startTime = Date.now()

    try {
      console.log(`🔍 Starting content validation: ${validationId}`)

      const validation = {
        id: validationId,
        contentId: content.id || crypto.randomUUID(),
        rules,
        options,
        startTime,
        status: 'running',
        progress: 0,
        results: {
          passed: false,
          score: 0,
          ruleResults: [],
          issues: [],
          warnings: []
        }
      }

      this.activeValidations.set(validationId, validation)

      // Execute validation rules
      const ruleResults = []
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i]
        validation.progress = Math.round(((i + 1) / rules.length) * 100)

        try {
          console.log(`🔧 Executing validation rule: ${rule.type}`)
          const ruleResult = await this.executeValidationRule(content, rule)
          ruleResults.push(ruleResult)

          if (!ruleResult.passed) {
            validation.results.issues.push(...(ruleResult.issues || []))
          }
          if (ruleResult.warnings) {
            validation.results.warnings.push(...ruleResult.warnings)
          }

        } catch (error) {
          console.error(`❌ Validation rule failed: ${rule.type}`, error)
          ruleResults.push({
            rule: rule.type,
            passed: false,
            score: 0,
            error: error.message,
            issues: [`Validation rule ${rule.type} failed to execute`]
          })
        }
      }

      // Calculate overall results
      validation.results.ruleResults = ruleResults
      validation.results.score = this.calculateOverallScore(ruleResults)
      validation.results.passed = this.determineOverallPass(ruleResults, options.passThreshold || 0.7)

      // Complete validation
      validation.status = 'completed'
      validation.endTime = Date.now()
      validation.validationTime = validation.endTime - validation.startTime

      // Add to history
      this.validationHistory.unshift(validation)
      this.calculateStatistics()

      // Remove from active validations
      this.activeValidations.delete(validationId)

      // Emit completion event
      this.emit('validationComplete', validation)

      console.log(`✅ Content validation completed: ${validationId} (${validation.results.passed ? 'PASSED' : 'FAILED'})`)

      return validation.results

    } catch (error) {
      console.error(`❌ Content validation failed: ${validationId}`, error)
      
      // Mark as failed
      const validation = this.activeValidations.get(validationId)
      if (validation) {
        validation.status = 'failed'
        validation.error = error.message
        validation.endTime = Date.now()
        this.activeValidations.delete(validationId)
      }

      throw error
    }
  }

  async executeValidationRule(content, rule) {
    const ruleValidator = this.validationRules.get(rule.type)
    
    if (!ruleValidator) {
      throw new Error(`Unknown validation rule: ${rule.type}`)
    }

    try {
      const result = await ruleValidator.validator(content, rule.parameters || {})
      return {
        rule: rule.type,
        ...result
      }
    } catch (error) {
      console.error(`❌ Rule execution failed: ${rule.type}`, error)
      return {
        rule: rule.type,
        passed: false,
        score: 0,
        error: error.message,
        issues: [`Rule ${rule.type} execution failed`]
      }
    }
  }

  async validateLength(content, parameters) {
    const { minWords = 0, maxWords = Infinity, minChars = 0, maxChars = Infinity } = parameters
    
    const text = this.extractText(content)
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
    const charCount = text.length

    const issues = []
    const warnings = []

    if (wordCount < minWords) {
      issues.push(`Content too short: ${wordCount} words (minimum: ${minWords})`)
    }
    if (wordCount > maxWords) {
      issues.push(`Content too long: ${wordCount} words (maximum: ${maxWords})`)
    }
    if (charCount < minChars) {
      issues.push(`Content too short: ${charCount} characters (minimum: ${minChars})`)
    }
    if (charCount > maxChars) {
      issues.push(`Content too long: ${charCount} characters (maximum: ${maxChars})`)
    }

    // Warnings for edge cases
    if (wordCount < minWords * 1.2) {
      warnings.push('Content length is close to minimum threshold')
    }
    if (wordCount > maxWords * 0.8) {
      warnings.push('Content length is approaching maximum threshold')
    }

    const passed = issues.length === 0
    const score = this.calculateLengthScore(wordCount, minWords, maxWords)

    return {
      passed,
      score,
      issues,
      warnings,
      metrics: {
        wordCount,
        charCount,
        targetRange: `${minWords}-${maxWords} words`
      }
    }
  }

  calculateLengthScore(wordCount, minWords, maxWords) {
    if (wordCount < minWords) {
      return Math.max(0, wordCount / minWords)
    }
    if (wordCount > maxWords) {
      return Math.max(0, maxWords / wordCount)
    }
    return 1.0
  }

  async validateReadability(content, parameters) {
    const { maxGradeLevel = 12, targetAudience = 'general' } = parameters
    
    const text = this.extractText(content)
    const readabilityScore = this.calculateFleschKincaidGradeLevel(text)

    const issues = []
    const warnings = []

    if (readabilityScore > maxGradeLevel) {
      issues.push(`Content too complex: Grade level ${readabilityScore.toFixed(1)} (maximum: ${maxGradeLevel})`)
    }

    // Audience-specific warnings
    if (targetAudience === 'beginner' && readabilityScore > 8) {
      warnings.push('Content may be too complex for beginner audience')
    }
    if (targetAudience === 'expert' && readabilityScore < 10) {
      warnings.push('Content may be too simple for expert audience')
    }

    const passed = issues.length === 0
    const score = readabilityScore <= maxGradeLevel ? 1.0 : Math.max(0, maxGradeLevel / readabilityScore)

    return {
      passed,
      score,
      issues,
      warnings,
      metrics: {
        gradeLevel: readabilityScore,
        targetGradeLevel: maxGradeLevel,
        targetAudience
      }
    }
  }

  calculateFleschKincaidGradeLevel(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const words = text.split(/\s+/).filter(w => w.length > 0).length
    const syllables = this.countSyllables(text)

    if (sentences === 0 || words === 0) return 0

    const avgSentenceLength = words / sentences
    const avgSyllablesPerWord = syllables / words

    return 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59
  }

  countSyllables(text) {
    return text.toLowerCase()
      .split(/\s+/)
      .reduce((total, word) => {
        const syllableCount = word.match(/[aeiouy]+/g)?.length || 1
        return total + Math.max(1, syllableCount)
      }, 0)
  }

  async validateCoherence(content, parameters) {
    const { minScore = 0.6, useAI = true } = parameters
    
    try {
      let coherenceScore = 0.5 // Default fallback score

      if (useAI) {
        // Use AI to assess coherence
        const text = this.extractText(content)
        const prompt = `Analyze the coherence and flow of the following text. Rate the coherence on a scale of 0.0 to 1.0, where 1.0 is perfectly coherent and well-structured. Consider logical flow, transitions, and overall organization.

Text to analyze:
${text}

Respond with only a number between 0.0 and 1.0:`

        try {
          const response = await aiServiceManager.generateContent(
            'openai',
            'gpt-3.5-turbo',
            prompt,
            { maxTokens: 10, temperature: 0.1 }
          )

          const scoreMatch = response.match(/\d*\.?\d+/)
          if (scoreMatch) {
            coherenceScore = Math.min(1.0, Math.max(0.0, parseFloat(scoreMatch[0])))
          }
        } catch (error) {
          console.error('❌ AI coherence assessment failed, using fallback:', error)
          coherenceScore = this.calculateBasicCoherence(content)
        }
      } else {
        coherenceScore = this.calculateBasicCoherence(content)
      }

      const issues = []
      const warnings = []

      if (coherenceScore < minScore) {
        issues.push(`Content coherence below threshold: ${coherenceScore.toFixed(2)} (minimum: ${minScore})`)
      }

      if (coherenceScore < minScore * 1.2) {
        warnings.push('Content coherence is close to minimum threshold')
      }

      const passed = issues.length === 0

      return {
        passed,
        score: coherenceScore,
        issues,
        warnings,
        metrics: {
          coherenceScore,
          minScore,
          assessmentMethod: useAI ? 'AI-powered' : 'Basic'
        }
      }

    } catch (error) {
      console.error('❌ Coherence validation failed:', error)
      return {
        passed: false,
        score: 0,
        issues: ['Coherence validation failed to execute'],
        warnings: [],
        error: error.message
      }
    }
  }

  calculateBasicCoherence(content) {
    const text = this.extractText(content)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    if (sentences.length < 2) return 0.5

    // Basic coherence metrics
    let coherenceScore = 0.5

    // Check for transition words
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'additionally', 'consequently', 'meanwhile', 'similarly', 'in contrast', 'for example']
    const transitionCount = transitionWords.reduce((count, word) => {
      return count + (text.toLowerCase().includes(word) ? 1 : 0)
    }, 0)

    coherenceScore += Math.min(0.3, transitionCount * 0.05)

    // Check for consistent topic (repeated key terms)
    const words = text.toLowerCase().split(/\s+/)
    const wordFreq = {}
    words.forEach(word => {
      if (word.length > 4) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    })

    const repeatedWords = Object.values(wordFreq).filter(freq => freq > 1).length
    coherenceScore += Math.min(0.2, repeatedWords * 0.01)

    return Math.min(1.0, coherenceScore)
  }

  async validateOriginality(content, parameters) {
    const { minScore = 0.8, checkPlagiarism = false } = parameters
    
    // For now, implement basic originality check
    // In production, this would integrate with plagiarism detection services
    
    const text = this.extractText(content)
    let originalityScore = 0.9 // Default high score

    // Basic checks for common patterns that might indicate low originality
    const commonPhrases = [
      'lorem ipsum',
      'sample text',
      'placeholder content',
      'this is a test',
      'example content'
    ]

    const foundCommonPhrases = commonPhrases.filter(phrase => 
      text.toLowerCase().includes(phrase)
    )

    if (foundCommonPhrases.length > 0) {
      originalityScore -= foundCommonPhrases.length * 0.2
    }

    // Check for repetitive content
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()))
    const repetitionRatio = uniqueSentences.size / sentences.length

    originalityScore *= repetitionRatio

    originalityScore = Math.max(0, Math.min(1, originalityScore))

    const issues = []
    const warnings = []

    if (originalityScore < minScore) {
      issues.push(`Content originality below threshold: ${originalityScore.toFixed(2)} (minimum: ${minScore})`)
    }

    if (foundCommonPhrases.length > 0) {
      warnings.push(`Found common phrases: ${foundCommonPhrases.join(', ')}`)
    }

    if (repetitionRatio < 0.8) {
      warnings.push('Content contains repetitive sentences')
    }

    const passed = issues.length === 0

    return {
      passed,
      score: originalityScore,
      issues,
      warnings,
      metrics: {
        originalityScore,
        repetitionRatio,
        foundCommonPhrases,
        uniqueSentenceRatio: repetitionRatio
      }
    }
  }

  async validateGrammar(content, parameters) {
    const { maxErrors = 5, useAI = true } = parameters
    
    const text = this.extractText(content)
    let grammarErrors = []

    if (useAI) {
      try {
        // Use AI for grammar checking
        const prompt = `Check the following text for grammar errors. List each error with its location and correction. If there are no errors, respond with "No grammar errors found."

Text to check:
${text}

Format your response as:
Error 1: [description]
Error 2: [description]
etc.`

        const response = await aiServiceManager.generateContent(
          'openai',
          'gpt-3.5-turbo',
          prompt,
          { maxTokens: 500, temperature: 0.1 }
        )

        if (!response.toLowerCase().includes('no grammar errors')) {
          const errorMatches = response.match(/Error \d+: .+/g)
          if (errorMatches) {
            grammarErrors = errorMatches.map(error => error.replace(/Error \d+: /, ''))
          }
        }
      } catch (error) {
        console.error('❌ AI grammar check failed, using basic check:', error)
        grammarErrors = this.performBasicGrammarCheck(text)
      }
    } else {
      grammarErrors = this.performBasicGrammarCheck(text)
    }

    const issues = []
    const warnings = []

    if (grammarErrors.length > maxErrors) {
      issues.push(`Too many grammar errors: ${grammarErrors.length} (maximum: ${maxErrors})`)
    }

    if (grammarErrors.length > 0 && grammarErrors.length <= maxErrors) {
      warnings.push(`Found ${grammarErrors.length} grammar error(s)`)
    }

    const passed = grammarErrors.length <= maxErrors
    const score = Math.max(0, 1 - (grammarErrors.length / (maxErrors * 2)))

    return {
      passed,
      score,
      issues,
      warnings,
      metrics: {
        grammarErrors: grammarErrors.slice(0, 10), // Limit to first 10 errors
        errorCount: grammarErrors.length,
        maxErrors
      }
    }
  }

  performBasicGrammarCheck(text) {
    const errors = []

    // Basic grammar checks
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim()
      
      // Check for capitalization
      if (trimmed.length > 0 && !/^[A-Z]/.test(trimmed)) {
        errors.push(`Sentence ${index + 1}: Should start with capital letter`)
      }

      // Check for double spaces
      if (trimmed.includes('  ')) {
        errors.push(`Sentence ${index + 1}: Contains double spaces`)
      }

      // Check for basic punctuation issues
      if (trimmed.includes(',,') || trimmed.includes('..')) {
        errors.push(`Sentence ${index + 1}: Repeated punctuation`)
      }
    })

    return errors
  }

  async validateStructure(content, parameters) {
    const { requireHeadings = true, minSections = 1, maxSections = 20 } = parameters
    
    const text = this.extractText(content)
    const issues = []
    const warnings = []

    // Check for headings (markdown style or HTML)
    const headings = text.match(/^#+\s+.+$/gm) || text.match(/<h[1-6]>.+<\/h[1-6]>/gi) || []
    
    if (requireHeadings && headings.length === 0) {
      issues.push('Content should include headings for better structure')
    }

    if (headings.length < minSections) {
      issues.push(`Too few sections: ${headings.length} (minimum: ${minSections})`)
    }

    if (headings.length > maxSections) {
      issues.push(`Too many sections: ${headings.length} (maximum: ${maxSections})`)
    }

    // Check for paragraph structure
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    
    if (paragraphs.length < 2) {
      warnings.push('Content should be divided into multiple paragraphs')
    }

    // Check for very long paragraphs
    const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 200)
    if (longParagraphs.length > 0) {
      warnings.push(`${longParagraphs.length} paragraph(s) are very long and could be split`)
    }

    const passed = issues.length === 0
    const score = Math.max(0, 1 - (issues.length * 0.2))

    return {
      passed,
      score,
      issues,
      warnings,
      metrics: {
        headingCount: headings.length,
        paragraphCount: paragraphs.length,
        averageParagraphLength: paragraphs.length > 0 ? 
          paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length : 0,
        longParagraphCount: longParagraphs.length
      }
    }
  }

  extractText(content) {
    if (typeof content === 'string') {
      return content
    }
    
    if (content.content) {
      return typeof content.content === 'string' ? content.content : JSON.stringify(content.content)
    }
    
    if (content.title && content.body) {
      return `${content.title}\n\n${content.body}`
    }
    
    return JSON.stringify(content)
  }

  calculateOverallScore(ruleResults) {
    if (ruleResults.length === 0) return 0

    const totalScore = ruleResults.reduce((sum, result) => sum + (result.score || 0), 0)
    return totalScore / ruleResults.length
  }

  determineOverallPass(ruleResults, passThreshold) {
    const overallScore = this.calculateOverallScore(ruleResults)
    const criticalFailures = ruleResults.filter(result => !result.passed && result.critical)
    
    return overallScore >= passThreshold && criticalFailures.length === 0
  }

  // Public API methods
  getValidationStatistics() {
    return {
      ...this.statistics,
      activeValidations: this.activeValidations.size,
      availableRules: this.validationRules.size
    }
  }

  getActiveValidations() {
    return Array.from(this.activeValidations.values())
  }

  getActiveValidationCount() {
    return this.activeValidations.size
  }

  getAvailableRules() {
    return Array.from(this.validationRules.entries()).map(([type, rule]) => ({
      type,
      name: rule.name,
      description: rule.description
    }))
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      activeValidations: this.activeValidations.size,
      statistics: this.statistics,
      availableRules: this.validationRules.size
    }
  }
}

export const contentValidationEngine = new ContentValidationEngine()

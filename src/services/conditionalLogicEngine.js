class ConditionalLogicEngine {
  constructor() {
    this.operators = {
      'equals': (a, b) => a === b,
      'not_equals': (a, b) => a !== b,
      'greater': (a, b) => parseFloat(a) > parseFloat(b),
      'less': (a, b) => parseFloat(a) < parseFloat(b),
      'greater_equal': (a, b) => parseFloat(a) >= parseFloat(b),
      'less_equal': (a, b) => parseFloat(a) <= parseFloat(b),
      'contains': (a, b) => String(a).toLowerCase().includes(String(b).toLowerCase()),
      'not_contains': (a, b) => !String(a).toLowerCase().includes(String(b).toLowerCase()),
      'starts_with': (a, b) => String(a).toLowerCase().startsWith(String(b).toLowerCase()),
      'ends_with': (a, b) => String(a).toLowerCase().endsWith(String(b).toLowerCase()),
      'in': (a, b) => Array.isArray(b) ? b.includes(a) : false,
      'not_in': (a, b) => Array.isArray(b) ? !b.includes(a) : true
    }
  }

  evaluateCondition(condition, context) {
    try {
      const { field, operator, value } = condition
      const contextValue = this.getNestedValue(context, field)
      
      if (!this.operators[operator]) {
        console.warn(`Unknown operator: ${operator}`)
        return false
      }
      
      const result = this.operators[operator](contextValue, value)
      
      console.log(`Condition evaluation: ${field} (${contextValue}) ${operator} ${value} = ${result}`)
      return result
      
    } catch (error) {
      console.error('Error evaluating condition:', error)
      return false
    }
  }

  evaluateConditions(conditions, context, logic = 'AND') {
    if (!conditions || conditions.length === 0) {
      return true
    }
    
    const results = conditions.map(condition => this.evaluateCondition(condition, context))
    
    if (logic === 'OR') {
      return results.some(result => result)
    } else {
      return results.every(result => result)
    }
  }

  findMatchingRoute(routingNode, context) {
    const { conditions, defaultTarget } = routingNode.data
    
    if (!conditions || conditions.length === 0) {
      return defaultTarget
    }
    
    for (const condition of conditions) {
      if (this.evaluateCondition(condition, context)) {
        console.log(`Route matched: ${condition.target}`)
        return condition.target
      }
    }
    
    console.log(`No route matched, using default: ${defaultTarget}`)
    return defaultTarget
  }

  analyzeContent(content, bookConfig) {
    const analysis = {
      contentType: this.detectContentType(content, bookConfig),
      complexity: this.calculateComplexity(content),
      readabilityScore: this.calculateReadability(content),
      wordCount: this.countWords(content),
      technicalTerms: this.countTechnicalTerms(content),
      narrativeElements: this.detectNarrativeElements(content),
      userTier: bookConfig.userTier || 'basic',
      bookType: bookConfig.type || 'general'
    }
    
    console.log('Content analysis:', analysis)
    return analysis
  }

  detectContentType(content, bookConfig) {
    const contentLower = content.toLowerCase()
    const bookType = bookConfig.type?.toLowerCase() || ''
    
    // Check book configuration first
    if (bookType.includes('fiction') || bookType.includes('novel') || bookType.includes('story')) {
      return 'fiction'
    }
    
    if (bookType.includes('technical') || bookType.includes('manual') || bookType.includes('guide')) {
      return 'technical'
    }
    
    if (bookType.includes('academic') || bookType.includes('research') || bookType.includes('scientific')) {
      return 'academic'
    }
    
    // Analyze content patterns
    const fictionKeywords = ['character', 'plot', 'story', 'narrative', 'dialogue', 'scene', 'chapter']
    const technicalKeywords = ['algorithm', 'function', 'method', 'implementation', 'system', 'process', 'procedure']
    const academicKeywords = ['research', 'study', 'analysis', 'theory', 'hypothesis', 'methodology', 'conclusion']
    
    const fictionScore = this.countKeywords(contentLower, fictionKeywords)
    const technicalScore = this.countKeywords(contentLower, technicalKeywords)
    const academicScore = this.countKeywords(contentLower, academicKeywords)
    
    if (fictionScore > technicalScore && fictionScore > academicScore) {
      return 'fiction'
    } else if (technicalScore > academicScore) {
      return 'technical'
    } else if (academicScore > 0) {
      return 'academic'
    }
    
    return 'general'
  }

  calculateComplexity(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const avgWordsPerSentence = words.length / sentences.length
    
    const longWords = words.filter(w => w.length > 6).length
    const longWordRatio = longWords / words.length
    
    const complexityScore = (avgWordsPerSentence * 0.4) + (longWordRatio * 60)
    
    return Math.min(Math.max(Math.round(complexityScore), 1), 10)
  }

  calculateReadability(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const syllables = this.countSyllables(content)
    
    if (sentences.length === 0 || words.length === 0) return 0
    
    // Flesch Reading Ease Score
    const score = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length))
    
    return Math.min(Math.max(Math.round(score), 0), 100)
  }

  countWords(content) {
    return content.split(/\s+/).filter(w => w.length > 0).length
  }

  countTechnicalTerms(content) {
    const technicalPatterns = [
      /\b[A-Z]{2,}\b/g, // Acronyms
      /\b\w+\(\)/g, // Function calls
      /\b\d+\.\d+\b/g, // Version numbers
      /\b[a-z]+_[a-z]+\b/g, // Snake_case
      /\b[a-z]+[A-Z][a-z]+\b/g // camelCase
    ]
    
    let count = 0
    technicalPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) count += matches.length
    })
    
    return count
  }

  detectNarrativeElements(content) {
    const narrativeKeywords = [
      'said', 'asked', 'replied', 'whispered', 'shouted',
      'walked', 'ran', 'looked', 'saw', 'heard',
      'felt', 'thought', 'remembered', 'wondered',
      'suddenly', 'meanwhile', 'later', 'earlier'
    ]
    
    return this.countKeywords(content.toLowerCase(), narrativeKeywords)
  }

  countKeywords(content, keywords) {
    let count = 0
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = content.match(regex)
      if (matches) count += matches.length
    })
    return count
  }

  countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/)
    let syllableCount = 0
    
    words.forEach(word => {
      word = word.replace(/[^a-z]/g, '')
      if (word.length === 0) return
      
      const vowels = word.match(/[aeiouy]+/g)
      let count = vowels ? vowels.length : 0
      
      if (word.endsWith('e')) count--
      if (count === 0) count = 1
      
      syllableCount += count
    })
    
    return syllableCount
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  createRoutingContext(bookConfig, userProfile, systemStatus) {
    return {
      // Book configuration
      bookType: bookConfig.type,
      bookNiche: bookConfig.niche,
      targetAudience: bookConfig.targetAudience,
      wordCount: bookConfig.targetWordCount,
      chapters: bookConfig.numberOfChapters,
      
      // User profile
      userTier: userProfile.tier,
      userId: userProfile.id,
      userPreferences: userProfile.preferences,
      
      // System status
      serviceLatency: systemStatus.averageLatency,
      activeServices: systemStatus.activeServices,
      systemLoad: systemStatus.load,
      
      // Dynamic values (will be updated during execution)
      currentStep: null,
      previousResults: [],
      executionTime: 0,
      tokensUsed: 0
    }
  }
}

export const conditionalLogicEngine = new ConditionalLogicEngine()

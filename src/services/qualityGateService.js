class QualityGateService {
  constructor() {
    this.gates = {
      'word-count': this.createWordCountGate(),
      'readability': this.createReadabilityGate(),
      'coherence': this.createCoherenceGate(),
      'technical-depth': this.createTechnicalDepthGate(),
      'narrative-flow': this.createNarrativeFlowGate(),
      'character-consistency': this.createCharacterConsistencyGate(),
      'accuracy-check': this.createAccuracyCheckGate(),
      'citation-check': this.createCitationCheckGate(),
      'expert-review': this.createExpertReviewGate(),
      'style-consistency': this.createStyleConsistencyGate(),
      'basic-quality': this.createBasicQualityGate(),
      'pro-quality': this.createProQualityGate(),
      'premium-quality': this.createPremiumQualityGate()
    }
    
    this.retryStrategies = {
      'regenerate': this.regenerateStrategy(),
      'refine': this.refineStrategy(),
      'hybrid': this.hybridStrategy()
    }
  }

  async runQualityGate(gateName, content, context, options = {}) {
    const gate = this.gates[gateName]
    if (!gate) {
      throw new Error(`Quality gate '${gateName}' not found`)
    }

    const startTime = Date.now()
    
    try {
      console.log(`Running quality gate: ${gateName}`)
      
      const result = await gate.check(content, context, options)
      const duration = Date.now() - startTime
      
      const gateResult = {
        gateName,
        passed: result.passed,
        score: result.score,
        threshold: result.threshold,
        feedback: result.feedback,
        suggestions: result.suggestions || [],
        metrics: result.metrics || {},
        duration,
        timestamp: new Date().toISOString()
      }
      
      console.log(`Quality gate ${gateName} result:`, gateResult)
      return gateResult
      
    } catch (error) {
      console.error(`Quality gate ${gateName} error:`, error)
      return {
        gateName,
        passed: false,
        score: 0,
        threshold: 0,
        feedback: `Quality gate failed with error: ${error.message}`,
        suggestions: ['Review content and try again'],
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  async runMultipleGates(gateNames, content, context, options = {}) {
    const results = []
    
    for (const gateName of gateNames) {
      const result = await this.runQualityGate(gateName, content, context, options)
      results.push(result)
      
      // Stop on critical failure if specified
      if (!result.passed && options.stopOnFailure) {
        break
      }
    }
    
    const overallPassed = results.every(r => r.passed)
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
    
    return {
      passed: overallPassed,
      averageScore,
      results,
      summary: this.generateGateSummary(results)
    }
  }

  async retryWithStrategy(strategyName, content, context, gateResults, options = {}) {
    const strategy = this.retryStrategies[strategyName]
    if (!strategy) {
      throw new Error(`Retry strategy '${strategyName}' not found`)
    }

    console.log(`Applying retry strategy: ${strategyName}`)
    return await strategy.apply(content, context, gateResults, options)
  }

  // Quality Gate Implementations
  createWordCountGate() {
    return {
      check: async (content, context, options) => {
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
        const targetCount = context.targetWordCount || options.targetWordCount || 1000
        const tolerance = options.tolerance || 0.2
        
        const minCount = targetCount * (1 - tolerance)
        const maxCount = targetCount * (1 + tolerance)
        
        const passed = wordCount >= minCount && wordCount <= maxCount
        const score = Math.min((wordCount / targetCount) * 100, 100)
        
        return {
          passed,
          score,
          threshold: targetCount,
          feedback: `Word count: ${wordCount} (target: ${targetCount})`,
          metrics: { wordCount, targetCount, minCount, maxCount }
        }
      }
    }
  }

  createReadabilityGate() {
    return {
      check: async (content, context, options) => {
        const readabilityScore = this.calculateFleschScore(content)
        const threshold = options.minReadability || 60
        
        const passed = readabilityScore >= threshold
        
        return {
          passed,
          score: readabilityScore,
          threshold,
          feedback: `Readability score: ${readabilityScore} (${this.getReadabilityLevel(readabilityScore)})`,
          suggestions: readabilityScore < threshold ? [
            'Use shorter sentences',
            'Replace complex words with simpler alternatives',
            'Break up long paragraphs'
          ] : []
        }
      }
    }
  }

  createCoherenceGate() {
    return {
      check: async (content, context, options) => {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
        const coherenceScore = this.analyzeCoherence(sentences)
        const threshold = options.minCoherence || 70
        
        const passed = coherenceScore >= threshold
        
        return {
          passed,
          score: coherenceScore,
          threshold,
          feedback: `Coherence score: ${coherenceScore}%`,
          suggestions: coherenceScore < threshold ? [
            'Add transition words between sentences',
            'Ensure logical flow of ideas',
            'Use consistent terminology'
          ] : []
        }
      }
    }
  }

  createTechnicalDepthGate() {
    return {
      check: async (content, context, options) => {
        const technicalTerms = this.countTechnicalTerms(content)
        const codeExamples = (content.match(/```[\s\S]*?```/g) || []).length
        const explanations = this.countExplanations(content)
        
        const depthScore = Math.min(
          (technicalTerms * 2) + (codeExamples * 10) + (explanations * 5),
          100
        )
        
        const threshold = options.minDepth || 50
        const passed = depthScore >= threshold
        
        return {
          passed,
          score: depthScore,
          threshold,
          feedback: `Technical depth score: ${depthScore}`,
          metrics: { technicalTerms, codeExamples, explanations },
          suggestions: depthScore < threshold ? [
            'Add more technical examples',
            'Include code snippets where appropriate',
            'Provide detailed explanations of concepts'
          ] : []
        }
      }
    }
  }

  createNarrativeFlowGate() {
    return {
      check: async (content, context, options) => {
        const dialogueCount = (content.match(/["'].*?["']/g) || []).length
        const actionWords = this.countActionWords(content)
        const transitionWords = this.countTransitionWords(content)
        
        const flowScore = Math.min(
          (dialogueCount * 2) + (actionWords * 1.5) + (transitionWords * 3),
          100
        )
        
        const threshold = options.minFlow || 60
        const passed = flowScore >= threshold
        
        return {
          passed,
          score: flowScore,
          threshold,
          feedback: `Narrative flow score: ${flowScore}`,
          metrics: { dialogueCount, actionWords, transitionWords },
          suggestions: flowScore < threshold ? [
            'Add more dialogue between characters',
            'Include more action and movement',
            'Use transition words to connect scenes'
          ] : []
        }
      }
    }
  }

  createCharacterConsistencyGate() {
    return {
      check: async (content, context, options) => {
        const characters = this.extractCharacterNames(content)
        const consistencyScore = this.analyzeCharacterConsistency(content, characters)
        const threshold = options.minConsistency || 80
        
        const passed = consistencyScore >= threshold
        
        return {
          passed,
          score: consistencyScore,
          threshold,
          feedback: `Character consistency score: ${consistencyScore}%`,
          metrics: { characterCount: characters.length },
          suggestions: consistencyScore < threshold ? [
            'Maintain consistent character traits',
            'Use consistent names and descriptions',
            'Ensure character actions align with personality'
          ] : []
        }
      }
    }
  }

  createAccuracyCheckGate() {
    return {
      check: async (content, context, options) => {
        const factualClaims = this.extractFactualClaims(content)
        const citations = this.countCitations(content)
        const accuracyScore = Math.min((citations / Math.max(factualClaims, 1)) * 100, 100)
        
        const threshold = options.minAccuracy || 70
        const passed = accuracyScore >= threshold
        
        return {
          passed,
          score: accuracyScore,
          threshold,
          feedback: `Accuracy score: ${accuracyScore}% (${citations} citations for ${factualClaims} claims)`,
          metrics: { factualClaims, citations },
          suggestions: accuracyScore < threshold ? [
            'Add citations for factual claims',
            'Verify accuracy of statements',
            'Include references to credible sources'
          ] : []
        }
      }
    }
  }

  createCitationCheckGate() {
    return {
      check: async (content, context, options) => {
        const citations = this.countCitations(content)
        const references = this.countReferences(content)
        const minCitations = options.minCitations || 5
        
        const passed = citations >= minCitations
        const score = Math.min((citations / minCitations) * 100, 100)
        
        return {
          passed,
          score,
          threshold: minCitations,
          feedback: `Citations: ${citations}, References: ${references}`,
          metrics: { citations, references },
          suggestions: !passed ? [
            'Add more citations to support claims',
            'Include a reference list',
            'Use proper citation format'
          ] : []
        }
      }
    }
  }

  createExpertReviewGate() {
    return {
      check: async (content, context, options) => {
        const expertTerms = this.countExpertTerms(content)
        const depth = this.analyzeContentDepth(content)
        const complexity = this.analyzeComplexity(content)
        
        const expertScore = (expertTerms * 0.3) + (depth * 0.4) + (complexity * 0.3)
        const threshold = options.minExpertLevel || 80
        
        const passed = expertScore >= threshold
        
        return {
          passed,
          score: expertScore,
          threshold,
          feedback: `Expert level score: ${expertScore}`,
          metrics: { expertTerms, depth, complexity },
          suggestions: expertScore < threshold ? [
            'Include more advanced concepts',
            'Add expert-level analysis',
            'Provide deeper insights'
          ] : []
        }
      }
    }
  }

  createStyleConsistencyGate() {
    return {
      check: async (content, context, options) => {
        const styleScore = this.analyzeStyleConsistency(content)
        const threshold = options.minStyleConsistency || 75
        
        const passed = styleScore >= threshold
        
        return {
          passed,
          score: styleScore,
          threshold,
          feedback: `Style consistency score: ${styleScore}%`,
          suggestions: styleScore < threshold ? [
            'Maintain consistent tone throughout',
            'Use consistent formatting',
            'Keep vocabulary level consistent'
          ] : []
        }
      }
    }
  }

  createBasicQualityGate() {
    return {
      check: async (content, context, options) => {
        const wordCount = content.split(/\s+/).length
        const readability = this.calculateFleschScore(content)
        const basicScore = Math.min(
          (wordCount > 100 ? 50 : 0) + (readability > 50 ? 50 : readability),
          100
        )
        
        const threshold = 60
        const passed = basicScore >= threshold
        
        return {
          passed,
          score: basicScore,
          threshold,
          feedback: `Basic quality score: ${basicScore}`,
          suggestions: basicScore < threshold ? [
            'Ensure minimum word count',
            'Improve readability'
          ] : []
        }
      }
    }
  }

  createProQualityGate() {
    return {
      check: async (content, context, options) => {
        const readability = this.calculateFleschScore(content)
        const coherence = this.analyzeCoherence(content.split(/[.!?]+/))
        const proScore = (readability * 0.6) + (coherence * 0.4)
        
        const threshold = 75
        const passed = proScore >= threshold
        
        return {
          passed,
          score: proScore,
          threshold,
          feedback: `Pro quality score: ${proScore}`,
          suggestions: proScore < threshold ? [
            'Improve readability and flow',
            'Enhance content coherence',
            'Add professional polish'
          ] : []
        }
      }
    }
  }

  createPremiumQualityGate() {
    return {
      check: async (content, context, options) => {
        const readability = this.calculateFleschScore(content)
        const coherence = this.analyzeCoherence(content.split(/[.!?]+/))
        const style = this.analyzeStyleConsistency(content)
        const depth = this.analyzeContentDepth(content)
        
        const premiumScore = (readability * 0.25) + (coherence * 0.25) + (style * 0.25) + (depth * 0.25)
        
        const threshold = 85
        const passed = premiumScore >= threshold
        
        return {
          passed,
          score: premiumScore,
          threshold,
          feedback: `Premium quality score: ${premiumScore}`,
          suggestions: premiumScore < threshold ? [
            'Achieve premium-level readability',
            'Ensure perfect coherence',
            'Maintain consistent premium style',
            'Provide exceptional depth'
          ] : []
        }
      }
    }
  }

  // Retry Strategies
  regenerateStrategy() {
    return {
      apply: async (content, context, gateResults, options) => {
        console.log('Applying regenerate strategy')
        
        const failedGates = gateResults.results.filter(r => !r.passed)
        const suggestions = failedGates.flatMap(g => g.suggestions || [])
        
        return {
          action: 'regenerate',
          prompt: `Please regenerate the content addressing these issues: ${suggestions.join(', ')}`,
          context: { ...context, retryReason: 'quality_gate_failure', suggestions }
        }
      }
    }
  }

  refineStrategy() {
    return {
      apply: async (content, context, gateResults, options) => {
        console.log('Applying refine strategy')
        
        const failedGates = gateResults.results.filter(r => !r.passed)
        const refinements = failedGates.map(g => g.feedback).join('; ')
        
        return {
          action: 'refine',
          prompt: `Please refine the following content to address these issues: ${refinements}\n\nContent: ${content}`,
          context: { ...context, retryReason: 'refinement', originalContent: content }
        }
      }
    }
  }

  // REMOVED: fallbackStrategy() - NO FALLBACK TEMPLATES

  hybridStrategy() {
    return {
      apply: async (content, context, gateResults, options) => {
        console.log('Applying hybrid strategy')
        
        const averageScore = gateResults.averageScore
        
        if (averageScore < 40) {
          throw new Error(`Content quality too low (${averageScore}/100). No fallback templates allowed.`)
        } else if (averageScore < 70) {
          return this.regenerateStrategy().apply(content, context, gateResults, options)
        } else {
          return this.refineStrategy().apply(content, context, gateResults, options)
        }
      }
    }
  }

  // Helper Methods
  calculateFleschScore(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const syllables = this.countSyllables(text)
    
    if (sentences.length === 0 || words.length === 0) return 0
    
    const score = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length))
    return Math.min(Math.max(Math.round(score), 0), 100)
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

  getReadabilityLevel(score) {
    if (score >= 90) return 'Very Easy'
    if (score >= 80) return 'Easy'
    if (score >= 70) return 'Fairly Easy'
    if (score >= 60) return 'Standard'
    if (score >= 50) return 'Fairly Difficult'
    if (score >= 30) return 'Difficult'
    return 'Very Difficult'
  }

  analyzeCoherence(sentences) {
    if (sentences.length < 2) return 100
    
    let coherenceScore = 0
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'additionally', 'consequently']
    
    for (let i = 1; i < sentences.length; i++) {
      const sentence = sentences[i].toLowerCase()
      const hasTransition = transitionWords.some(word => sentence.includes(word))
      if (hasTransition) coherenceScore += 10
    }
    
    return Math.min(coherenceScore + 50, 100)
  }

  countTechnicalTerms(content) {
    const technicalPatterns = [
      /\b[A-Z]{2,}\b/g,
      /\b\w+\(\)/g,
      /\b\d+\.\d+\b/g,
      /\b[a-z]+_[a-z]+\b/g,
      /\b[a-z]+[A-Z][a-z]+\b/g
    ]
    
    let count = 0
    technicalPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) count += matches.length
    })
    
    return count
  }

  countExplanations(content) {
    const explanationPatterns = [
      /this means/gi,
      /in other words/gi,
      /for example/gi,
      /specifically/gi,
      /that is/gi
    ]
    
    let count = 0
    explanationPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) count += matches.length
    })
    
    return count
  }

  countActionWords(content) {
    const actionWords = ['walked', 'ran', 'jumped', 'moved', 'grabbed', 'threw', 'caught', 'hit', 'pushed', 'pulled']
    let count = 0
    
    actionWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = content.match(regex)
      if (matches) count += matches.length
    })
    
    return count
  }

  countTransitionWords(content) {
    const transitionWords = ['meanwhile', 'suddenly', 'then', 'next', 'finally', 'later', 'earlier', 'afterwards']
    let count = 0
    
    transitionWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = content.match(regex)
      if (matches) count += matches.length
    })
    
    return count
  }

  extractCharacterNames(content) {
    const namePattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g
    const matches = content.match(namePattern) || []
    return [...new Set(matches)]
  }

  analyzeCharacterConsistency(content, characters) {
    if (characters.length === 0) return 100
    
    let consistencyScore = 100
    characters.forEach(character => {
      const mentions = (content.match(new RegExp(`\\b${character}\\b`, 'g')) || []).length
      if (mentions < 2) consistencyScore -= 10
    })
    
    return Math.max(consistencyScore, 0)
  }

  extractFactualClaims(content) {
    const claimPatterns = [
      /\d+%/g,
      /according to/gi,
      /research shows/gi,
      /studies indicate/gi,
      /data suggests/gi
    ]
    
    let count = 0
    claimPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) count += matches.length
    })
    
    return count
  }

  countCitations(content) {
    const citationPatterns = [
      /\[\d+\]/g,
      /\(\d{4}\)/g,
      /et al\./gi,
      /\(.*?\d{4}.*?\)/g
    ]
    
    let count = 0
    citationPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) count += matches.length
    })
    
    return count
  }

  countReferences(content) {
    return (content.match(/references?:/gi) || []).length
  }

  countExpertTerms(content) {
    return this.countTechnicalTerms(content) * 2
  }

  analyzeContentDepth(content) {
    const depthIndicators = [
      /analysis/gi,
      /methodology/gi,
      /framework/gi,
      /comprehensive/gi,
      /detailed/gi
    ]
    
    let score = 0
    depthIndicators.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) score += matches.length * 5
    })
    
    return Math.min(score, 100)
  }

  analyzeComplexity(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const avgWordsPerSentence = words.length / sentences.length
    
    const longWords = words.filter(w => w.length > 6).length
    const longWordRatio = longWords / words.length
    
    return Math.min((avgWordsPerSentence * 2) + (longWordRatio * 50), 100)
  }

  analyzeStyleConsistency(content) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    if (paragraphs.length < 2) return 100
    
    const avgWordsPerParagraph = paragraphs.map(p => p.split(/\s+/).length)
    const variance = this.calculateVariance(avgWordsPerParagraph)
    
    return Math.max(100 - variance, 0)
  }

  calculateVariance(numbers) {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
    return squaredDiffs.reduce((sum, sq) => sum + sq, 0) / numbers.length
  }

  generateGateSummary(results) {
    const passed = results.filter(r => r.passed).length
    const total = results.length
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / total
    
    return {
      passedCount: passed,
      totalCount: total,
      passRate: (passed / total) * 100,
      averageScore: Math.round(averageScore),
      status: passed === total ? 'all_passed' : passed > total / 2 ? 'mostly_passed' : 'mostly_failed'
    }
  }
}

export const qualityGateService = new QualityGateService()

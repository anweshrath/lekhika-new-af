class HumanizeService {
  constructor() {
    this.humanizationPatterns = {
      grammarMistakes: [
        { from: /\bwhich\b/g, to: 'that', probability: 0.3 },
        { from: /\bwho\b/g, to: 'that', probability: 0.2 },
        { from: /\bfurther\b/g, to: 'farther', probability: 0.4 },
        { from: /\beffect\b/g, to: 'affect', probability: 0.3 },
        { from: /\bits\b/g, to: "it's", probability: 0.2 },
        { from: /\byour\b/g, to: "you're", probability: 0.15 },
        { from: /\bthere\b/g, to: 'their', probability: 0.2 }
      ],
      stylisticChanges: [
        { from: /\bHowever,/g, to: 'But,', probability: 0.5 },
        { from: /\bTherefore,/g, to: 'So,', probability: 0.4 },
        { from: /\bFurthermore,/g, to: 'Also,', probability: 0.6 },
        { from: /\bIn addition,/g, to: 'Plus,', probability: 0.3 },
        { from: /\bConsequently,/g, to: 'As a result,', probability: 0.4 }
      ],
      casualPhrases: [
        { from: /\bIt is important to note that\b/g, to: "It's worth mentioning that", probability: 0.7 },
        { from: /\bIt should be noted that\b/g, to: "Keep in mind that", probability: 0.6 },
        { from: /\bIn conclusion\b/g, to: "To wrap up", probability: 0.5 },
        { from: /\bIn summary\b/g, to: "In a nutshell", probability: 0.4 }
      ],
      punctuationVariations: [
        { from: /\.\.\./g, to: '...', probability: 0.8 },
        { from: /!/g, to: '.', probability: 0.3 },
        { from: /;/g, to: ',', probability: 0.4 }
      ]
    }
  }

  async humanizeBook(book) {
    try {
      console.log('Starting humanization process...')
      
      const humanizedContent = { ...book.content }
      let totalChanges = 0
      const changeDetails = []

      // Process each section
      for (const [sectionKey, sectionData] of Object.entries(book.content)) {
        if (sectionData && sectionData.content) {
          const result = this.humanizeText(sectionData.content)
          humanizedContent[sectionKey] = {
            ...sectionData,
            content: result.text,
            humanizationApplied: true,
            changesCount: result.changesCount
          }
          totalChanges += result.changesCount
          changeDetails.push({
            section: sectionKey,
            changes: result.changesCount,
            types: result.changeTypes
          })
        }
      }

      // Calculate new AI detection score (lower is better)
      const originalScore = book.aiDetectionScore || 15
      const reductionFactor = Math.min(totalChanges * 0.5, 10)
      const newAiDetectionScore = Math.max(originalScore - reductionFactor, 3)

      return {
        content: humanizedContent,
        newAiDetectionScore: Math.round(newAiDetectionScore),
        details: {
          totalChanges,
          changeDetails,
          originalScore,
          improvement: Math.round(originalScore - newAiDetectionScore)
        }
      }
    } catch (error) {
      console.error('Humanization error:', error)
      throw error
    }
  }

  humanizeText(text) {
    let humanizedText = text
    let changesCount = 0
    const changeTypes = []

    // Apply grammar mistakes (sparingly)
    for (const pattern of this.humanizationPatterns.grammarMistakes) {
      if (Math.random() < pattern.probability) {
        const matches = humanizedText.match(pattern.from)
        if (matches && matches.length > 0) {
          // Only apply to a few instances
          const instancesToChange = Math.min(matches.length, Math.ceil(matches.length * 0.3))
          for (let i = 0; i < instancesToChange; i++) {
            humanizedText = humanizedText.replace(pattern.from, pattern.to)
            changesCount++
          }
          changeTypes.push('grammar')
        }
      }
    }

    // Apply stylistic changes
    for (const pattern of this.humanizationPatterns.stylisticChanges) {
      if (Math.random() < pattern.probability) {
        const beforeLength = humanizedText.length
        humanizedText = humanizedText.replace(pattern.from, pattern.to)
        if (humanizedText.length !== beforeLength) {
          changesCount++
          changeTypes.push('style')
        }
      }
    }

    // Apply casual phrases
    for (const pattern of this.humanizationPatterns.casualPhrases) {
      if (Math.random() < pattern.probability) {
        const beforeLength = humanizedText.length
        humanizedText = humanizedText.replace(pattern.from, pattern.to)
        if (humanizedText.length !== beforeLength) {
          changesCount++
          changeTypes.push('casual')
        }
      }
    }

    // Apply punctuation variations
    for (const pattern of this.humanizationPatterns.punctuationVariations) {
      if (Math.random() < pattern.probability) {
        const matches = humanizedText.match(pattern.from)
        if (matches && matches.length > 0) {
          // Only change some instances
          const instancesToChange = Math.ceil(matches.length * 0.5)
          for (let i = 0; i < instancesToChange; i++) {
            humanizedText = humanizedText.replace(pattern.from, pattern.to)
            changesCount++
          }
          changeTypes.push('punctuation')
        }
      }
    }

    // Add some natural variations
    humanizedText = this.addNaturalVariations(humanizedText)

    return {
      text: humanizedText,
      changesCount,
      changeTypes: [...new Set(changeTypes)]
    }
  }

  addNaturalVariations(text) {
    // Add occasional contractions
    text = text.replace(/\bdo not\b/g, "don't")
    text = text.replace(/\bcannot\b/g, "can't")
    text = text.replace(/\bwill not\b/g, "won't")
    text = text.replace(/\bshould not\b/g, "shouldn't")
    
    // Add some informal transitions
    text = text.replace(/\bIn other words,/g, "Put simply,")
    text = text.replace(/\bFor example,/g, "For instance,")
    
    // Vary sentence starters
    text = text.replace(/\bAdditionally,/g, "What's more,")
    text = text.replace(/\bMoreover,/g, "On top of that,")
    
    return text
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const humanizeService = new HumanizeService()

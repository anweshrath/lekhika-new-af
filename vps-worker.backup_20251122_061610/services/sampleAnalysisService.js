const { pdfProcessingService } = require('./pdfProcessingService.js')

class SampleAnalysisService {
  constructor() {
    this.supportedFormats = ['txt', 'pdf', 'docx', 'md']
    this.maxFileSize = 10 * 1024 * 1024 // 10MB
    this.pdfService = pdfProcessingService
  }

  async analyzeSampleBook(file) {
    try {
      // Validate file
      this.validateFile(file)
      
      // Extract text content
      const textContent = await this.extractTextFromFile(file)
      
      // Analyze the content
      const analysis = await this.analyzeContent(textContent)
      
      // Get enhanced metadata for PDFs
      let enhancedMetadata = null
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          enhancedMetadata = await this.getPDFEnhancedMetadata(file)
        } catch (metadataError) {
          console.warn('⚠️ Could not extract PDF metadata:', metadataError.message)
        }
      }
      
      return {
        success: true,
        analysis,
        enhancedMetadata,
        originalFile: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      }
    } catch (error) {
      console.error('Sample analysis error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  validateFile(file) {
    if (!file) {
      throw new Error('No file provided')
    }
    
    if (file.size > this.maxFileSize) {
      throw new Error('File size too large. Maximum size is 10MB.')
    }
    
    const extension = file.name.split('.').pop().toLowerCase()
    if (!this.supportedFormats.includes(extension)) {
      throw new Error(`Unsupported file format. Supported formats: ${this.supportedFormats.join(', ')}`)
    }
  }

  async extractTextFromFile(file) {
    const extension = file.name.split('.').pop().toLowerCase()
    
    switch (extension) {
      case 'txt':
      case 'md':
        return await this.extractTextFromTextFile(file)
      case 'pdf':
        return await this.extractTextFromPDF(file)
      case 'docx':
        return await this.extractTextFromDocx(file)
      default:
        throw new Error('Unsupported file format')
    }
  }

  async extractTextFromTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new Error('Failed to read text file'))
      reader.readAsText(file)
    })
  }

  async extractTextFromPDF(file) {
    try {
      console.log('📄 Using PDF Processing Service for text extraction...')
      
      // Use the dedicated PDF processing service
      const result = await this.pdfService.extractTextFromPDF(file)
      
      console.log('✅ PDF text extraction successful via PDF Processing Service')
      return result.text
    } catch (error) {
      console.error('❌ PDF text extraction failed:', error)
      throw new Error(`PDF processing failed: ${error.message}`)
    }
  }

  async extractTextFromDocx(file) {
    // For now, return a placeholder since DOCX parsing requires additional libraries
    // In a real implementation, you'd use mammoth.js or similar
    throw new Error('DOCX parsing not yet implemented. Please use TXT or MD files for now.')
  }

  async analyzeContent(textContent) {
    if (!textContent || textContent.trim().length < 100) {
      throw new Error('Content too short for analysis. Minimum 100 characters required.')
    }

    // Basic content analysis
    const analysis = {
      wordCount: this.countWords(textContent),
      characterCount: textContent.length,
      paragraphCount: this.countParagraphs(textContent),
      averageWordsPerParagraph: 0,
      writingStyle: this.analyzeWritingStyle(textContent),
      tone: this.analyzeTone(textContent),
      structure: this.analyzeStructure(textContent),
      keyPhrases: this.extractKeyPhrases(textContent),
      readabilityLevel: this.calculateReadability(textContent),
      contentThemes: this.identifyThemes(textContent)
    }

    analysis.averageWordsPerParagraph = Math.round(analysis.wordCount / Math.max(analysis.paragraphCount, 1))

    return analysis
  }

  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  countParagraphs(text) {
    return text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length
  }

  analyzeWritingStyle(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length
    
    const style = {
      averageSentenceLength: Math.round(avgSentenceLength),
      complexity: avgSentenceLength > 20 ? 'complex' : avgSentenceLength > 15 ? 'moderate' : 'simple',
      formalityLevel: this.detectFormality(text),
      punctuationStyle: this.analyzePunctuation(text)
    }

    return style
  }

  analyzeTone(text) {
    const lowerText = text.toLowerCase()
    
    // Simple keyword-based tone detection
    const toneIndicators = {
      professional: ['strategy', 'implement', 'framework', 'methodology', 'analysis', 'objective'],
      casual: ['you', 'your', 'we', 'our', 'let\'s', 'simple', 'easy'],
      academic: ['research', 'study', 'evidence', 'hypothesis', 'conclusion', 'furthermore'],
      persuasive: ['should', 'must', 'need to', 'important', 'crucial', 'essential'],
      humorous: ['funny', 'joke', 'laugh', 'amusing', 'witty', 'clever']
    }

    const toneScores = {}
    for (const [tone, keywords] of Object.entries(toneIndicators)) {
      toneScores[tone] = keywords.reduce((score, keyword) => {
        const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length
        return score + matches
      }, 0)
    }

    const dominantTone = Object.entries(toneScores).reduce((a, b) => toneScores[a[0]] > toneScores[b[0]] ? a : b)[0]
    
    return {
      primary: dominantTone,
      scores: toneScores,
      confidence: Math.min(toneScores[dominantTone] / 10, 1)
    }
  }

  analyzeStructure(text) {
    const lines = text.split('\n')
    const structure = {
      hasHeadings: /^#+\s/.test(text) || /^[A-Z][^.!?]*$/.test(text),
      hasBulletPoints: /^[\s]*[-*•]\s/.test(text),
      hasNumberedLists: /^\d+\.\s/.test(text),
      hasQuotes: /"[^"]*"/.test(text) || /^>\s/.test(text),
      paragraphStructure: 'standard',
      estimatedChapters: 0
    }

    // Estimate chapters based on major headings
    const majorHeadings = lines.filter(line => 
      /^#+\s/.test(line) || 
      /^Chapter\s+\d+/i.test(line) ||
      /^[A-Z][^.!?]*$/.test(line.trim())
    )
    structure.estimatedChapters = majorHeadings.length

    return structure
  }

  extractKeyPhrases(text) {
    // Simple key phrase extraction
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || []
    const frequency = {}
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ phrase: word, frequency: count }))
  }

  calculateReadability(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const words = this.countWords(text)
    const syllables = this.estimateSyllables(text)

    // Simplified Flesch Reading Ease
    const fleschScore = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
    
    let level = 'Graduate'
    if (fleschScore >= 90) level = 'Very Easy'
    else if (fleschScore >= 80) level = 'Easy'
    else if (fleschScore >= 70) level = 'Fairly Easy'
    else if (fleschScore >= 60) level = 'Standard'
    else if (fleschScore >= 50) level = 'Fairly Difficult'
    else if (fleschScore >= 30) level = 'Difficult'

    return {
      score: Math.round(fleschScore),
      level: level,
      averageWordsPerSentence: Math.round(words / sentences),
      averageSyllablesPerWord: Math.round((syllables / words) * 100) / 100
    }
  }

  estimateSyllables(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    return words.reduce((total, word) => {
      // Simple syllable estimation
      const vowels = word.match(/[aeiouy]+/g) || []
      let syllables = vowels.length
      if (word.endsWith('e')) syllables--
      return total + Math.max(syllables, 1)
    }, 0)
  }

  identifyThemes(text) {
    const lowerText = text.toLowerCase()
    
    const themes = {
      business: ['business', 'strategy', 'management', 'leadership', 'growth', 'profit', 'market'],
      technology: ['technology', 'software', 'digital', 'innovation', 'data', 'system', 'platform'],
      health: ['health', 'wellness', 'fitness', 'nutrition', 'medical', 'exercise', 'lifestyle'],
      education: ['education', 'learning', 'teaching', 'student', 'knowledge', 'skill', 'training'],
      finance: ['finance', 'money', 'investment', 'financial', 'budget', 'economic', 'wealth'],
      personal: ['personal', 'self', 'development', 'growth', 'improvement', 'success', 'goal']
    }

    const themeScores = {}
    for (const [theme, keywords] of Object.entries(themes)) {
      themeScores[theme] = keywords.reduce((score, keyword) => {
        const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length
        return score + matches
      }, 0)
    }

    return Object.entries(themeScores)
      .filter(([, score]) => score > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme, score]) => ({ theme, relevance: score }))
  }

  detectFormality(text) {
    const formalIndicators = ['therefore', 'furthermore', 'consequently', 'moreover', 'nevertheless']
    const informalIndicators = ['gonna', 'wanna', 'yeah', 'ok', 'cool', 'awesome']
    
    const formalCount = formalIndicators.reduce((count, word) => 
      count + (text.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0)
    const informalCount = informalIndicators.reduce((count, word) => 
      count + (text.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0)

    if (formalCount > informalCount) return 'formal'
    if (informalCount > formalCount) return 'informal'
    return 'neutral'
  }

  analyzePunctuation(text) {
    const exclamations = (text.match(/!/g) || []).length
    const questions = (text.match(/\?/g) || []).length
    const periods = (text.match(/\./g) || []).length
    const total = exclamations + questions + periods

    if (total === 0) return 'minimal'
    
    const exclamationRatio = exclamations / total
    const questionRatio = questions / total

    if (exclamationRatio > 0.1) return 'enthusiastic'
    if (questionRatio > 0.1) return 'inquisitive'
    return 'standard'
  }

  generateStylePrompt(analysis) {
    const { writingStyle, tone, structure, readabilityLevel } = analysis

    let stylePrompt = `Write in a ${tone.primary} tone with ${writingStyle.formalityLevel} formality. `
    
    stylePrompt += `Use ${writingStyle.complexity} sentence structures with an average of ${writingStyle.averageSentenceLength} words per sentence. `
    
    if (structure.hasHeadings) {
      stylePrompt += `Include clear headings and subheadings to organize content. `
    }
    
    if (structure.hasBulletPoints) {
      stylePrompt += `Use bullet points for lists and key information. `
    }
    
    if (structure.hasQuotes) {
      stylePrompt += `Include relevant quotes or citations where appropriate. `
    }
    
    stylePrompt += `Target a ${readabilityLevel.level.toLowerCase()} reading level. `
    
    if (analysis.contentThemes.length > 0) {
      const primaryTheme = analysis.contentThemes[0].theme
      stylePrompt += `Focus on ${primaryTheme}-related content and terminology. `
    }

    return stylePrompt
  }

  /**
   * Get enhanced PDF metadata and structure analysis
   */
  async getPDFEnhancedMetadata(file) {
    try {
      console.log('📊 Extracting enhanced PDF metadata...')
      
      const [structure, isImageBased] = await Promise.all([
        this.pdfService.analyzePDFStructure(file),
        this.pdfService.isImageBasedPDF(file)
      ])
      
      return {
        ...structure,
        isImageBased,
        extractionTimestamp: new Date().toISOString(),
        analysisVersion: '1.0'
      }
    } catch (error) {
      console.error('❌ Enhanced PDF metadata extraction failed:', error)
      throw new Error(`PDF metadata extraction failed: ${error.message}`)
    }
  }

  /**
   * Extract text from specific PDF pages
   */
  async extractTextFromPDFPages(file, pageNumbers) {
    try {
      console.log(`📄 Extracting text from PDF pages: ${pageNumbers.join(', ')}`)
      
      const result = await this.pdfService.extractTextFromPages(file, pageNumbers)
      
      console.log('✅ PDF page extraction successful')
      return result
    } catch (error) {
      console.error('❌ PDF page extraction failed:', error)
      throw new Error(`PDF page extraction failed: ${error.message}`)
    }
  }

  /**
   * Get PDF page count
   */
  async getPDFPageCount(file) {
    try {
      return await this.pdfService.getPDFPageCount(file)
    } catch (error) {
      console.error('❌ Failed to get PDF page count:', error)
      return 0
    }
  }
}

const sampleAnalysisService = new SampleAnalysisService()

module.exports = { sampleAnalysisService }

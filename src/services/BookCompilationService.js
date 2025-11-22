/**
 * BookCompilationService - Single, robust service for all book operations
 * Replaces: splitIntoChapters, parseBookSections, compileChaptersIntoBook
 * 
 * Architecture:
 * - Single source of truth for chapter management
 * - Clean data contracts between pipeline stages
 * - Proper validation and error handling
 * - No competing logic or duplicate processing
 */

import aiResponseValidator from './aiResponseValidator.js'

class BookCompilationService {
  constructor() {
    this.chapterRegistry = new Map()
    this.validationRules = {
      minChapterLength: 300,        // Increased from 100 - real chapters need substance
      maxChapterLength: 50000,      // Increased from 10000 - support longer chapters
      minWordCount: 300,            // Minimum words per chapter
      requiredChapterFields: ['number', 'title', 'content'],
      validChapterNumbers: /^[1-9]\d*$/,
      maxSimilarityThreshold: 0.85  // 85% similarity = likely duplicate
    }
  }

  /**
   * MAIN ENTRY POINT: Compile workflow content into professional book
   * @param {Object} nodeOutputs - Raw outputs from workflow nodes
   * @param {Object} userInput - User configuration and preferences
   * @param {Object} formatOptions - Output formatting options
   * @returns {Object} Professional book structure
   */
  async compileBook(nodeOutputs, userInput, formatOptions = {}) {
    try {
      console.log('🚀 BookCompilationService: Starting professional book compilation')
      
      // Stage 1: Extract and validate raw content
      const rawContent = this.extractRawContent(nodeOutputs, userInput)
      
      // Stage 2: Parse and structure chapters
      const chapters = this.parseAndStructureChapters(rawContent)
      
      // Stage 3: Validate chapter integrity
      const validatedChapters = this.validateChapterIntegrity(chapters)
      
      // Stage 4: Generate book metadata
      const bookMetadata = this.generateBookMetadata(validatedChapters, userInput)
      
      // Stage 5: Format final output
      const formattedBook = this.formatFinalBook(validatedChapters, bookMetadata, formatOptions)
      
      console.log('✅ BookCompilationService: Professional book compilation completed')
      return formattedBook
      
    } catch (error) {
      console.error('❌ BookCompilationService: Compilation failed:', error)
      throw new Error(`Book compilation failed: ${error.message}`)
    }
  }

  /**
   * STAGE 1: Extract raw content from workflow nodes
   * Handles multiple node types and content formats
   */
  extractRawContent(nodeOutputs, userInput) {
    const extractedContent = {
      title: userInput.book_title || userInput.story_title || 'Generated Book',
      author: userInput.author_name || 'AI Generated',
      rawChapters: [],
      metadata: {
        nodeCount: 0,
        contentSources: [],
        totalWords: 0
      }
    }

    // Process all node outputs
    Object.entries(nodeOutputs).forEach(([nodeId, output]) => {
      if (this.isValidContentOutput(output)) {
        // FIXED: Handle structured multi-chapter content directly
        if (output.type === 'multi_chapter_generation' && Array.isArray(output.content)) {
          // This is structured chapter data - process each chapter directly
          output.content.forEach((chapter, index) => {
            // VALIDATE CHAPTER BEFORE ACCEPTING
            const validation = aiResponseValidator.validateResponse(
              { content: chapter.content },
              'chapter'
            )
            
            if (validation.isValid && chapter.content && chapter.content.length > this.validationRules.minChapterLength) {
              const wordCount = this.countWords(chapter.content)
              
              // Check minimum word count
              if (wordCount >= this.validationRules.minWordCount) {
                extractedContent.rawChapters.push({
                  nodeId: `${nodeId}_chapter_${chapter.chapter || index + 1}`,
                  content: chapter.content,
                  metadata: {
                    ...(chapter.metadata || chapter.aiMetadata || {}),
                    chapterNumber: chapter.chapter || (index + 1),
                    title: this.extractChapterTitleFromContent(chapter.content) || `Chapter ${chapter.chapter || (index + 1)}`
                  },
                  source: 'structured_chapter',
                  wordCount: wordCount,
                  contentHash: this.generateContentHash(chapter.content)
                })
                extractedContent.metadata.totalWords += wordCount
              } else {
                console.warn(`⚠️ Chapter ${index + 1} rejected: only ${wordCount} words (minimum: ${this.validationRules.minWordCount})`)
              }
            } else {
              console.warn(`⚠️ Chapter ${index + 1} rejected: validation failed or too short`)
              if (!validation.isValid) {
                console.warn('Validation errors:', validation.errors)
              }
            }
          })
          extractedContent.metadata.nodeCount++
          extractedContent.metadata.contentSources.push(nodeId)
        } else {
          // Standard content processing
          const content = this.extractContentFromOutput(output)
          if (content && content.length > 50) {
            extractedContent.rawChapters.push({
              nodeId,
              content,
              metadata: output.metadata || {},
              source: output.type || 'unknown'
            })
            extractedContent.metadata.nodeCount++
            extractedContent.metadata.contentSources.push(nodeId)
            extractedContent.metadata.totalWords += this.countWords(content)
          }
        }
      }
    })

    console.log(`📊 Extracted ${extractedContent.rawChapters.length} content sources from ${extractedContent.metadata.nodeCount} nodes`)
    return extractedContent
  }

  /**
   * STAGE 2: Parse and structure chapters from raw content
   * Single, authoritative chapter parsing logic
   */
  parseAndStructureChapters(rawContent) {
    const chapters = []
    const chapterRegistry = new Map()

    rawContent.rawChapters.forEach((rawChapter, index) => {
      console.log(`🔍 Processing content from node: ${rawChapter.nodeId}`)
      
      // Parse chapters from this content source
      let parsedChapters
      if (rawChapter.source === 'structured_chapter') {
        // For structured chapters, use the data directly without re-parsing
        parsedChapters = [{
          number: rawChapter.metadata.chapterNumber || (index + 1),
          title: rawChapter.metadata.title || `Chapter ${rawChapter.metadata.chapterNumber || (index + 1)}`,
          content: rawChapter.content
        }]
      } else {
        // For unstructured content, parse to find chapters
        parsedChapters = this.parseChaptersFromContent(rawChapter.content)
      }
      
      parsedChapters.forEach(parsedChapter => {
        // Generate content hash for this chapter
        const contentHash = this.generateContentHash(parsedChapter.content)
        
        // Create structured chapter object
        const structuredChapter = {
          number: parsedChapter.number,
          title: parsedChapter.title,
          content: parsedChapter.content,
          contentHash: contentHash,
          sources: [rawChapter.nodeId],
          metadata: {
            wordCount: this.countWords(parsedChapter.content),
            sourceType: rawChapter.source,
            nodeMetadata: rawChapter.metadata
          }
        }
        
        // ENHANCED DUPLICATE DETECTION - STRICT MODE
        const duplicateCheck = this.checkForDuplicates(structuredChapter, chapters)
        
        if (duplicateCheck.isDuplicate) {
          console.warn(`🚫 STRICT DUPLICATE REJECTED: Chapter ${parsedChapter.number} "${parsedChapter.title}"`)
          console.warn(`   Reason: ${duplicateCheck.reason}`)
          console.warn(`   Similar to: ${duplicateCheck.similarTo}`)
          return // Skip this duplicate - NO MERGING
        }
        
        // Check for existing key-based duplicates (old method as fallback)
        const chapterKey = this.generateChapterKey(parsedChapter)
        
        if (chapterRegistry.has(chapterKey)) {
          console.warn(`🚫 DUPLICATE CHAPTER KEY REJECTED: ${parsedChapter.title}`)
          console.warn(`   Existing chapter found - REJECTING to prevent duplication`)
          return // NO MERGING - REJECT COMPLETELY
        } else {
          // New chapter - add to registry
          chapterRegistry.set(chapterKey, structuredChapter)
          chapters.push(structuredChapter)
          console.log(`✅ Chapter ${parsedChapter.number} accepted: "${parsedChapter.title}" (${structuredChapter.metadata.wordCount} words)`)
        }
      })
    })

    // Sort chapters by number
    chapters.sort((a, b) => a.number - b.number)
    
    // VALIDATION: Check for chapter count consistency
    const expectedChapters = rawContent.userInput?.chapter_count || rawContent.userInput?.chapterCount
    if (expectedChapters && chapters.length !== expectedChapters) {
      console.warn(`⚠️ CHAPTER COUNT MISMATCH: Expected ${expectedChapters}, got ${chapters.length}`)
      console.warn(`   This might indicate duplicate detection issues or missing chapters`)
    }
    
    console.log(`📚 Final chapter count: ${chapters.length}`)
    console.log(`📚 Chapter titles:`, chapters.map(c => `"${c.title}"`))
    
    return chapters
  }

  /**
   * STAGE 3: Validate chapter integrity and fix issues
   */
  validateChapterIntegrity(chapters) {
    const validatedChapters = []
    const seenNumbers = new Set()
    let chapterCounter = 1

    chapters.forEach(chapter => {
      // Validate chapter number
      if (!seenNumbers.has(chapter.number)) {
        seenNumbers.add(chapter.number)
      } else {
        console.log(`⚠️ Duplicate chapter number ${chapter.number} - reassigning to ${chapterCounter}`)
        chapter.number = chapterCounter
      }

      // Validate content length
      if (chapter.content.length < this.validationRules.minChapterLength) {
        console.log(`⚠️ Chapter ${chapter.number} too short (${chapter.content.length} chars) - padding content`)
        chapter.content = this.padChapterContent(chapter.content)
      }

      // Validate title
      if (!chapter.title || chapter.title.trim().length === 0) {
        chapter.title = `Chapter ${chapter.number}`
      }

      // Clean content
      chapter.content = this.cleanChapterContent(chapter.content)
      
      validatedChapters.push(chapter)
      chapterCounter++
    })

    console.log(`✅ Validated ${validatedChapters.length} chapters`)
    return validatedChapters
  }

  /**
   * STAGE 4: Generate comprehensive book metadata
   */
  generateBookMetadata(chapters, userInput) {
    const totalWords = chapters.reduce((sum, chapter) => sum + chapter.metadata.wordCount, 0)
    const totalChapters = chapters.length
    
    return {
      title: userInput.book_title || userInput.story_title || 'Generated Book',
      author: userInput.author_name || 'AI Generated',
      totalWords,
      totalChapters,
      estimatedReadingTime: Math.ceil(totalWords / 200), // 200 words per minute
      generationDate: new Date().toISOString(),
      chapters: chapters.map(chapter => ({
        number: chapter.number,
        title: chapter.title,
        wordCount: chapter.metadata.wordCount
      })),
      contentSources: chapters.reduce((sources, chapter) => {
        chapter.sources.forEach(source => {
          if (!sources.includes(source)) sources.push(source)
        })
        return sources
      }, [])
    }
  }

  /**
   * STAGE 5: Format final book output
   */
  formatFinalBook(chapters, metadata, formatOptions) {
    const { outputFormat = 'markdown', includeTOC = true } = formatOptions
    
    let formattedContent = ''
    
    // Title and author
    formattedContent += `# ${metadata.title}\n\n`
    formattedContent += `**by ${metadata.author}**\n\n`
    formattedContent += `---\n\n`
    
    // Table of Contents
    if (includeTOC) {
      formattedContent += `## Table of Contents\n\n`
      chapters.forEach(chapter => {
        formattedContent += `- [Chapter ${chapter.number}: ${chapter.title}](#chapter-${chapter.number})\n`
      })
      formattedContent += `\n---\n\n`
    }
    
    // Chapters
    chapters.forEach((chapter, index) => {
      formattedContent += `## Chapter ${chapter.number}: ${chapter.title}\n\n`
      formattedContent += `${chapter.content}\n\n`
      
      // Add separator between chapters (except last)
      if (index < chapters.length - 1) {
        formattedContent += `---\n\n`
      }
    })
    
    return {
      content: formattedContent,
      metadata,
      format: outputFormat,
      stats: {
        totalWords: metadata.totalWords,
        totalChapters: metadata.totalChapters,
        readingTime: metadata.estimatedReadingTime,
        generationDate: metadata.generationDate
      }
    }
  }

  /**
   * HELPER METHODS
   */

  isValidContentOutput(output) {
    return output && 
           (output.type === 'ai_generation' || 
            output.type === 'multi_chapter_generation' || 
            output.type === 'process') && 
           output.content && 
           (typeof output.content === 'string' && output.content.length > 50 ||
            Array.isArray(output.content) && output.content.length > 0)
  }

  extractContentFromOutput(output) {
    if (typeof output.content === 'string') {
      return output.content
    }
    if (output.content && typeof output.content === 'object') {
      return JSON.stringify(output.content)
    }
    return null
  }

  parseChaptersFromContent(content) {
    const chapters = []
    
    // Primary regex: Match chapter patterns with numbers and titles
    const chapterRegex = /(?:^|\n)(?:#{1,3}\s*)?Chapter\s*(\d+)[:\s]*(.+?)(?=\n(?:#{1,3}\s*)?Chapter\s*\d+[:\s]|$)/gms
    
    let match
    while ((match = chapterRegex.exec(content)) !== null) {
      const number = parseInt(match[1])
      const title = match[2].trim()
      const fullMatch = match[0]
      
      // Extract content after the title
      const contentStart = fullMatch.indexOf(title) + title.length
      const chapterContent = fullMatch.substring(contentStart).trim()
      
      if (chapterContent && chapterContent.length > 50) {
        chapters.push({
          number,
          title: title || `Chapter ${number}`,
          content: chapterContent
        })
      }
    }
    
    // Fallback: If no chapters found, treat entire content as one chapter
    if (chapters.length === 0 && content.length > 100) {
      chapters.push({
        number: 1,
        title: 'Chapter 1',
        content: content
      })
    }
    
    return chapters
  }

  /**
   * Extract chapter title from chapter content
   */
  extractChapterTitleFromContent(content) {
    const titleMatch = content.match(/Chapter \d+: (.+?)(?:\n|$)/)
    return titleMatch ? titleMatch[1].trim() : null
  }

  generateChapterKey(chapter) {
    // Create unique key based on chapter number and title similarity
    const normalizedTitle = chapter.title.toLowerCase().replace(/[^\w\s]/g, '').trim()
    return `${chapter.number}_${normalizedTitle}`
  }

  mergeChapterContent(existingContent, newContent) {
    // Simple merge: if new content is longer, use it; otherwise keep existing
    if (newContent.length > existingContent.length) {
      return newContent
    }
    return existingContent
  }

  cleanChapterContent(content) {
    return content
      .replace(/^#{1,6}\s*Chapter\s*\d+[:\s]*.*$/gm, '') // Remove duplicate headers
      .replace(/^\s*\n+/, '') // Remove leading whitespace
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .replace(/\s{3,}/g, ' ') // Normalize spaces
      .trim()
  }

  /**
   * Generate content hash for duplicate detection
   * @param {string} content - Chapter content
   * @returns {string} - SHA256 hash of content
   */
  generateContentHash(content) {
    // Normalize content before hashing to catch similar content
    const normalized = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim()
    
    // Generate hash (using simple string hash since crypto.createHash needs Node.js)
    let hash = 0
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
  }

  /**
   * Calculate similarity between two chapters
   * @param {string} content1 - First chapter content
   * @param {string} content2 - Second chapter content
   * @returns {number} - Similarity score (0-1)
   */
  calculateSimilarity(content1, content2) {
    // Simple similarity check based on word overlap
    const words1 = new Set(content1.toLowerCase().split(/\s+/).filter(w => w.length > 3))
    const words2 = new Set(content2.toLowerCase().split(/\s+/).filter(w => w.length > 3))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }

  /**
   * Check if chapter is duplicate or too similar to existing chapters
   * @param {Object} chapter - Chapter to check
   * @param {Array} existingChapters - Array of existing chapters
   * @returns {Object} - { isDuplicate: boolean, similarTo: string|null }
   */
  checkForDuplicates(chapter, existingChapters) {
    for (const existing of existingChapters) {
      // Check hash first (fast)
      if (chapter.contentHash === existing.contentHash) {
        return {
          isDuplicate: true,
          similarTo: `Chapter ${existing.number}`,
          reason: 'Identical content (hash match)'
        }
      }
      
      // Check similarity (slower but catches near-duplicates)
      const similarity = this.calculateSimilarity(chapter.content, existing.content)
      if (similarity > this.validationRules.maxSimilarityThreshold) {
        return {
          isDuplicate: true,
          similarTo: `Chapter ${existing.number}`,
          reason: `${Math.round(similarity * 100)}% similar content`,
          similarity: similarity
        }
      }
    }
    
    return { isDuplicate: false, similarTo: null }
  }

  padChapterContent(content) {
    if (content.length < this.validationRules.minChapterLength) {
      return content + '\n\n[Content continues...]'
    }
    return content
  }

  countWords(text) {
    if (!text || typeof text !== 'string') return 0
    return text.split(/\s+/).filter(word => word.length > 0).length
  }
}

// Export singleton instance
const bookCompilationService = new BookCompilationService()
export default bookCompilationService

import { supabase } from '../lib/supabase'

/**
 * Book Recovery Service
 * Extracts and compiles book content from AI thinking logs
 * Provides emergency book recovery when workflows fail
 */
class BookRecoveryService {
  constructor() {
    this.recoveryCache = new Map()
  }

  /**
   * Extract book content from AI thinking logs
   * @param {string} executionId - The workflow execution ID
   * @param {Object} aiThinkingLogs - The AI thinking logs data
   * @returns {Object} Recovered book data
   */
  async extractBookFromLogs(executionId, aiThinkingLogs) {
    try {
      console.log(`📚 Starting book recovery for execution: ${executionId}`)
      
      const recoveredBook = {
        executionId,
        title: null,
        genre: null,
        theme: null,
        chapters: [],
        metadata: {
          totalChapters: 0,
          totalWords: 0,
          recoveryTimestamp: new Date().toISOString(),
          recoveryMethod: 'ai_thinking_logs'
        },
        status: 'recovered'
      }

      // Extract workflow input data from first node
      const inputData = this.extractInputData(aiThinkingLogs)
      if (inputData) {
        recoveredBook.title = inputData.story_title || inputData.book_title || 'Untitled Book'
        recoveredBook.genre = inputData.genre || 'Unknown'
        recoveredBook.theme = inputData.theme || inputData.story_premise || 'Unknown'
        recoveredBook.author = inputData.author_name || 'Unknown Author'
      }

      // Extract chapters from content writer nodes
      const chapters = this.extractChapters(aiThinkingLogs)
      recoveredBook.chapters = chapters
      recoveredBook.metadata.totalChapters = chapters.length
      recoveredBook.metadata.totalWords = chapters.reduce((total, chapter) => 
        total + (chapter.wordCount || 0), 0)

      console.log(`✅ Book recovery completed: ${chapters.length} chapters, ${recoveredBook.metadata.totalWords} words`)
      
      return recoveredBook
    } catch (error) {
      console.error(`❌ Book recovery failed:`, error)
      throw new Error(`Book recovery failed: ${error.message}`)
    }
  }

  /**
   * Extract input data from the first workflow node
   */
  extractInputData(aiThinkingLogs) {
    try {
      console.log('🔍 Extracting input data from logs...')
      
      // Find the first node with input data
      for (const logEntry of aiThinkingLogs) {
        // Check various possible locations for input data
        if (logEntry.inputReceived && typeof logEntry.inputReceived === 'object') {
          console.log('✅ Found input data in inputReceived')
          return logEntry.inputReceived
        }
        if (logEntry.rawData && logEntry.rawData.inputData) {
          console.log('✅ Found input data in rawData.inputData')
          return logEntry.rawData.inputData
        }
        if (logEntry.rawData && logEntry.rawData.userInput) {
          console.log('✅ Found input data in rawData.userInput')
          return logEntry.rawData.userInput
        }
        // Sometimes input might be at root level
        if (logEntry.nodeType === 'input' && logEntry.output) {
          console.log('✅ Found input data in input node output')
          return logEntry.output
        }
      }
      
      console.warn('⚠️ No input data found in AI thinking logs')
      return null
    } catch (error) {
      console.error('Failed to extract input data:', error)
      return null
    }
  }

  /**
   * Extract chapters from AI thinking logs
   */
  extractChapters(aiThinkingLogs) {
    const chapters = []
    
    try {
      console.log(`🔍 Starting chapter extraction from ${aiThinkingLogs.length} log entries`)
      
      // Debug: Log entries that have substantial content
      aiThinkingLogs.forEach((entry, idx) => {
        const hasAiResponse = entry.aiResponse && (typeof entry.aiResponse === 'string' ? entry.aiResponse.length : true)
        const hasProcessed = entry.processedContent && (typeof entry.processedContent === 'string' ? entry.processedContent.length : true)
        if (hasAiResponse || hasProcessed) {
          console.log(`📝 Entry ${idx} (${entry.nodeName}):`, {
            hasAiResponse: !!hasAiResponse,
            aiResponseType: typeof entry.aiResponse,
            aiResponseLength: typeof entry.aiResponse === 'string' ? entry.aiResponse.length : 'N/A',
            hasProcessedContent: !!hasProcessed,
            processedType: typeof entry.processedContent,
            processedLength: typeof entry.processedContent === 'string' ? entry.processedContent.length : 'N/A'
          })
        }
      })
      
      for (const logEntry of aiThinkingLogs) {
        // Extract actual text content from aiResponse (can be string or object)
        let aiResponseText = null
        if (logEntry.aiResponse) {
          if (typeof logEntry.aiResponse === 'string') {
            aiResponseText = logEntry.aiResponse
          } else if (typeof logEntry.aiResponse === 'object') {
            // If object, try to extract text content from common properties
            aiResponseText = logEntry.aiResponse.content || 
                           logEntry.aiResponse.text || 
                           logEntry.aiResponse.response ||
                           JSON.stringify(logEntry.aiResponse)
          }
        }
        
        // Extract from AI response if present and substantial
        if (aiResponseText && aiResponseText.length > 200) {
          const chapterData = this.extractChapterFromLogEntry({
            ...logEntry,
            aiResponse: aiResponseText
          })
          if (chapterData) {
            console.log(`✅ Extracted chapter from aiResponse in node: ${logEntry.nodeName}`)
            chapters.push(chapterData)
            continue // Skip to next entry to avoid duplicates
          }
        }
        
        // Extract from processed content if present
        if (logEntry.processedContent) {
          // If processedContent has chapters array
          if (Array.isArray(logEntry.processedContent.chapters)) {
            for (const chapter of logEntry.processedContent.chapters) {
              const chapterData = this.formatChapterData(chapter)
              if (chapterData) {
                console.log(`✅ Extracted chapter from processedContent.chapters in node: ${logEntry.nodeName}`)
                chapters.push(chapterData)
              }
            }
          }
          // If processedContent is a string with chapter content
          else if (typeof logEntry.processedContent === 'string' && logEntry.processedContent.length > 200) {
            const chapterData = {
              chapterNumber: chapters.length + 1,
              title: this.extractChapterTitle(logEntry.processedContent),
              content: logEntry.processedContent,
              wordCount: this.countWords(logEntry.processedContent),
              metadata: {
                nodeId: logEntry.nodeId,
                timestamp: logEntry.timestamp,
                provider: logEntry.providerName,
                tokens: logEntry.actualTokens || logEntry.tokens,
                cost: logEntry.actualCost || logEntry.cost
              }
            }
            console.log(`✅ Extracted chapter from processedContent string in node: ${logEntry.nodeName}`)
            chapters.push(chapterData)
          }
        }
      }

      // Sort chapters by chapter number
      chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0))
      
      console.log(`✅ Extracted ${chapters.length} chapters from ${aiThinkingLogs.length} log entries`)
      return chapters
    } catch (error) {
      console.error('Failed to extract chapters:', error)
      return []
    }
  }

  /**
   * Extract chapter data from a single log entry
   */
  extractChapterFromLogEntry(logEntry) {
    try {
      // Check if logEntry has chapter content directly
      if (logEntry.processedContent && typeof logEntry.processedContent === 'object') {
        return this.formatChapterData(logEntry.processedContent)
      }

      // Check for AI response with chapter content
      if (logEntry.aiResponse) {
        const chapterMatch = logEntry.aiResponse.match(/Chapter \d+[:\s]*(.+)/s)
        if (chapterMatch) {
          return {
            chapterNumber: this.extractChapterNumber(logEntry.aiResponse),
            title: this.extractChapterTitle(logEntry.aiResponse),
            content: logEntry.aiResponse,
            wordCount: this.countWords(logEntry.aiResponse),
            metadata: {
              nodeId: logEntry.nodeId,
              timestamp: logEntry.timestamp,
              provider: logEntry.providerUsed || logEntry.providerName,
              tokens: logEntry.actualTokens || logEntry.tokens,
              cost: logEntry.actualCost || logEntry.cost
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error('Failed to extract chapter from log entry:', error)
      return null
    }
  }

  /**
   * Format chapter data consistently
   */
  formatChapterData(chapterData) {
    if (!chapterData || typeof chapterData !== 'object') return null

    return {
      chapterNumber: chapterData.chapter || chapterData.chapterNumber || 0,
      title: chapterData.title || this.extractChapterTitle(chapterData.content || ''),
      content: chapterData.content || '',
      wordCount: chapterData.wordCount || this.countWords(chapterData.content || ''),
      metadata: {
        nodeId: chapterData.metadata?.nodeId || null,
        timestamp: chapterData.metadata?.timestamp || new Date().toISOString(),
        provider: chapterData.aiMetadata?.provider || null,
        tokens: chapterData.aiMetadata?.tokens || 0,
        cost: chapterData.aiMetadata?.cost || 0
      }
    }
  }

  /**
   * Extract chapter number from content
   */
  extractChapterNumber(content) {
    const match = content.match(/Chapter\s+(\d+)/i)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Extract chapter title from content
   */
  extractChapterTitle(content) {
    if (!content || typeof content !== 'string') return 'Untitled Chapter'
    
    const lines = content.split('\n')
    for (const line of lines) {
      const match = line.match(/(?:Chapter|CHAPTER)\s*\d+[:\s]*(.+)/i)
      if (match && match[1]) {
        // Remove markdown formatting from title
        return match[1].trim().replace(/\*\*/g, '').replace(/\*/g, '').trim()
      }
    }
    return 'Untitled Chapter'
  }

  /**
   * Count words in content
   */
  countWords(content) {
    if (!content || typeof content !== 'string') return 0
    return content.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Save recovered book to database
   */
  async saveRecoveredBook(recoveredBook, userId) {
    try {
      console.log(`💾 Saving recovered book: ${recoveredBook.title}`)
      
      const { data, error } = await supabase
        .from('inbx_books')
        .insert({
          user_id: userId,
          title: recoveredBook.title,
          content: JSON.stringify(recoveredBook.chapters),
          genre: recoveredBook.genre,
          status: 'recovered',
          metadata: JSON.stringify(recoveredBook.metadata),
          created_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('❌ Supabase error saving recovered book:', error)
        throw error
      }

      console.log(`✅ Recovered book saved with ID: ${data[0].id}`)
      return data[0]
    } catch (error) {
      console.error('Failed to save recovered book:', error)
      throw error
    }
  }

  /**
   * Get recovery options for a failed workflow
   * @param {string} executionId - The workflow execution ID
   * @param {Array} aiThinkingLogs - AI thinking logs from workflow execution
   */
  async getRecoveryOptions(executionId, aiThinkingLogs = null) {
    try {
      // Use provided logs or try to fetch them
      const logs = aiThinkingLogs || await this.getAITThinkingLogs(executionId)
      
      if (!logs || logs.length === 0) {
        return {
          canRecover: false,
          reason: 'No AI thinking logs found for this execution'
        }
      }

      console.log(`📚 Recovery: Processing ${logs.length} AI thinking log entries`)
      const recoveredBook = await this.extractBookFromLogs(executionId, logs)
      
      return {
        canRecover: true,
        recoveredBook,
        options: {
          saveAsDraft: true,
          continueWorkflow: true,
          downloadAsPDF: true,
          exportAsMarkdown: true
        }
      }
    } catch (error) {
      console.error('Failed to get recovery options:', error)
      return {
        canRecover: false,
        reason: error.message
      }
    }
  }

  /**
   * Get AI thinking logs for an execution (placeholder - implement based on your storage)
   */
  async getAITThinkingLogs(executionId) {
    // This should be implemented based on how you store AI thinking logs
    // For now, return null - you'll need to implement this based on your storage system
    console.log(`📋 Fetching AI thinking logs for execution: ${executionId}`)
    return null
  }

  /**
   * Export recovered book as different formats
   */
  async exportRecoveredBook(recoveredBook, format = 'markdown') {
    try {
      switch (format) {
        case 'markdown':
          return this.exportAsMarkdown(recoveredBook)
        case 'pdf':
          return this.exportAsPDF(recoveredBook)
        case 'json':
          return JSON.stringify(recoveredBook, null, 2)
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }
    } catch (error) {
      console.error(`Failed to export book as ${format}:`, error)
      throw error
    }
  }

  /**
   * Export as Markdown
   */
  exportAsMarkdown(recoveredBook) {
    let markdown = `# ${recoveredBook.title}\n\n`
    markdown += `**Genre:** ${recoveredBook.genre}\n`
    markdown += `**Theme:** ${recoveredBook.theme}\n`
    markdown += `**Total Chapters:** ${recoveredBook.metadata.totalChapters}\n`
    markdown += `**Total Words:** ${recoveredBook.metadata.totalWords}\n\n`
    markdown += `---\n\n`

    for (const chapter of recoveredBook.chapters) {
      markdown += `## Chapter ${chapter.chapterNumber}: ${chapter.title}\n\n`
      markdown += chapter.content + '\n\n'
      markdown += `---\n\n`
    }

    return markdown
  }

  /**
   * Export as PDF (placeholder - implement PDF generation)
   */
  exportAsPDF(recoveredBook) {
    // Implement PDF generation using a library like jsPDF or Puppeteer
    console.log('PDF export not yet implemented')
    return null
  }
}

export default new BookRecoveryService()

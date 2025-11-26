/**
 * CONTENT HELPERS MODULE
 * 
 * Purpose: Centralize all content transformation and formatting logic
 * 
 * Location: workflow/helpers/contentHelpers.js
 * 
 * Responsibilities:
 * - Convert results arrays to node outputs format
 * - Extract chapter titles from content
 * - Transform content structures for different services
 * 
 * Dependencies: None (pure functions)
 * 
 * Extracted from: workflowExecutionService.js (Phase 5)
 * Extraction date: 2025-11-20
 * 
 * Methods extracted:
 * - convertResultsToNodeOutputs(results) - Convert results array to node outputs format
 * - extractChapterTitle(content) - Extract chapter title from content string
 * 
 * Usage:
 *   const { convertResultsToNodeOutputs, extractChapterTitle } = require('./workflow/helpers/contentHelpers')
 */

/**
 * Extract chapter title from chapter content
 * Extracted from: workflowExecutionService.js - extractChapterTitle()
 * 
 * @param {string} content - Chapter content string
 * @returns {string|null} Chapter title or null if not found
 */
function extractChapterTitle(content) {
  if (!content || typeof content !== 'string') return null
  
  // Try multiple patterns to extract chapter title from content
  const patterns = [
    /^#{1,2}\s*Chapter\s*\d+:\s*(.+?)(?:\n|$)/m,  // ## Chapter 1: Title
    /^Chapter\s*\d+:\s*(.+?)(?:\n|$)/m,           // Chapter 1: Title
    /^CHAPTER\s*\d+:\s*(.+?)(?:\n|$)/m,           // CHAPTER 1: Title
    /\*\*Chapter\s*\d+:\s*(.+?)\*\*/m,           // **Chapter 1: Title**
    /^#{1,2}\s*Chapter\s*\d+:\s*(.+?)(?:\s*$)/m   // ## Chapter 1: Title (end of line)
  ]
  
  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1] && match[1].trim()) {
      const title = match[1].trim().replace(/\*\*/g, '').trim()
      // Don't return generic titles like "Chapter 3" or "Chapter 4"
      if (title && !title.match(/^Chapter\s*\d+$/i)) {
        return title
      }
    }
  }
  
  return null
}

/**
 * Convert results array to node outputs format for BookCompilationService
 * Extracted from: workflowExecutionService.js - convertResultsToNodeOutputs()
 * 
 * FIXED: Pass structured chapters directly instead of breaking them up
 * 
 * @param {Array} results - Array of chapter results with chapter, content, aiMetadata
 * @returns {Object} Node outputs format with multi_chapter_book structure
 */
function convertResultsToNodeOutputs(results) {
  // Create a single structured output with all chapters
  const nodeOutputs = {
    'multi_chapter_book': {
      type: 'multi_chapter_generation',
      content: results, // Pass the structured chapters array directly
      metadata: {
        totalChapters: results.length,
        chapters: results.map(r => ({
          number: r.chapter,
          title: extractChapterTitle(r.content),
          content: r.content,
          metadata: r.aiMetadata || {}
        }))
      }
    }
  }
  
  return nodeOutputs
}

module.exports = {
  convertResultsToNodeOutputs,
  extractChapterTitle
}


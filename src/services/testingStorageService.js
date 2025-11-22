import { supabase } from '../lib/supabase'

/**
 * Testing Storage Service
 * Handles storage of test runs in the books table under "Testing" category
 */
class TestingStorageService {
  
  /**
   * Store a test run in the books table
   * @param {Object} testData - The test run data
   * @param {Object} userInput - User input from the workflow
   * @param {Object} workflowOutput - Generated content and metadata
   * @param {Object} executionStats - Execution statistics
   * @returns {Promise<Object>} - Stored book record
   */
  async storeTestRun(testData, userInput, workflowOutput, executionStats) {
    try {
      console.log('🧪 Storing test run in books table...')
      
      // Extract book information from user input
      const bookTitle = userInput.book_title || 'Test Run - ' + new Date().toLocaleString()
      const authorName = userInput.author_name || 'Test User'
      const bookType = this.determineBookType(userInput)
      
      // Prepare book data
      const bookData = {
        user_id: testData.userId || 'test-user', // This should come from auth context
        title: bookTitle,
        type: bookType,
        // category: 'testing', // Removed - column doesn't exist
        niche: userInput.industry_focus || userInput.target_audience || 'general',
        target_audience: userInput.target_audience || 'general',
        tone: userInput.tone || 'professional',
        status: 'completed', // Test runs are immediately completed
        content: {
          generated_content: workflowOutput.content,
          all_formats: workflowOutput.allFormats || {},
          requested_formats: workflowOutput.requestedFormats || [],
          primary_format: workflowOutput.primaryFormat || 'markdown',
          sections: workflowOutput.sections || [],
          metadata: workflowOutput.metadata || {}
        },
        metadata: {
          // User input metadata
          user_input: {
            book_title: userInput.book_title,
            author_name: userInput.author_name,
            author_bio: userInput.author_bio,
            word_count: userInput.word_count,
            chapter_count: userInput.chapter_count,
            tone: userInput.tone,
            accent: userInput.accent,
            target_audience: userInput.target_audience,
            industry_focus: userInput.industry_focus,
            custom_instructions: userInput.custom_instructions,
            output_formats: userInput.output_formats,
            book_size: userInput.book_size,
            custom_size: userInput.custom_size,
            typography_style: userInput.typography_style,
            cover_design: userInput.cover_design
          },
          // Execution metadata
          execution_stats: {
            total_cost: executionStats.totalCost || 0,
            total_tokens: executionStats.totalTokens || 0,
            total_words: executionStats.totalWords || 0,
            api_calls: executionStats.apiCalls || 0,
            execution_time: executionStats.executionTime || 0,
            ai_providers_used: executionStats.providersUsed || []
          },
          // Test run metadata
          test_run: {
            test_scenario: testData.scenarioName || 'Manual Test',
            test_timestamp: new Date().toISOString(),
            workflow_id: testData.workflowId || 'unknown',
            node_id: testData.nodeId || 'unknown',
            is_test_run: true
          }
        },
        ai_service: executionStats.providersUsed?.[0] || 'unknown',
        quality_score: this.calculateQualityScore(workflowOutput, executionStats),
        word_count: executionStats.totalWords || 0,
        is_public: false, // Test runs are never public
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('📚 Book data prepared:', {
        title: bookData.title,
        type: bookData.type,
        // category: bookData.category, // Removed - column doesn't exist
        word_count: bookData.word_count,
        quality_score: bookData.quality_score
      })
      
      // Insert into books table
      const { data, error } = await supabase
        .from('books')
        .insert([bookData])
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error storing test run:', error)
        throw new Error(`Failed to store test run: ${error.message}`)
      }
      
      console.log('✅ Test run stored successfully:', data.id)
      
      // Store individual sections if available
      if (workflowOutput.sections && workflowOutput.sections.length > 0) {
        await this.storeBookSections(data.id, workflowOutput.sections)
      }
      
      return data
      
    } catch (error) {
      console.error('❌ TestingStorageService.storeTestRun error:', error)
      throw error
    }
  }
  
  /**
   * Store individual book sections
   * @param {string} bookId - The book ID
   * @param {Array} sections - Array of section objects
   */
  async storeBookSections(bookId, sections) {
    try {
      const sectionData = sections.map((section, index) => ({
        book_id: bookId,
        title: section.title || `Section ${index + 1}`,
        content: section.content || '',
        section_type: section.type || 'chapter',
        section_order: index + 1,
        word_count: section.wordCount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      const { error } = await supabase
        .from('book_sections')
        .insert(sectionData)
      
      if (error) {
        console.error('❌ Error storing book sections:', error)
        throw new Error(`Failed to store book sections: ${error.message}`)
      }
      
      console.log(`✅ Stored ${sectionData.length} book sections`)
      
    } catch (error) {
      console.error('❌ TestingStorageService.storeBookSections error:', error)
      throw error
    }
  }
  
  /**
   * Determine book type from user input
   * @param {Object} userInput - User input data
   * @returns {string} - Book type
   */
  determineBookType(userInput) {
    // Map framework flow types to book types
    if (userInput.industry_focus) {
      switch (userInput.industry_focus.toLowerCase()) {
        case 'technology':
        case 'programming':
          return 'manual'
        case 'business':
        case 'finance':
          return 'guide'
        case 'health':
        case 'education':
          return 'course'
        default:
          return 'ebook'
      }
    }
    
    // Default based on content depth
    if (userInput.content_depth === 'expert' || userInput.content_depth === 'advanced') {
      return 'manual'
    } else if (userInput.content_depth === 'beginner' || userInput.content_depth === 'intermediate') {
      return 'guide'
    }
    
    return 'ebook' // Default
  }
  
  /**
   * Calculate quality score based on output and execution stats
   * @param {Object} workflowOutput - Generated content
   * @param {Object} executionStats - Execution statistics
   * @returns {number} - Quality score (0-100)
   */
  calculateQualityScore(workflowOutput, executionStats) {
    let score = 50 // Base score
    
    // Word count bonus
    const wordCount = executionStats.totalWords || 0
    if (wordCount > 1000) score += 10
    if (wordCount > 5000) score += 10
    if (wordCount > 10000) score += 10
    
    // Content quality indicators
    if (workflowOutput.sections && workflowOutput.sections.length > 3) score += 10
    if (workflowOutput.allFormats && Object.keys(workflowOutput.allFormats).length > 1) score += 10
    
    // Execution efficiency
    const costPerWord = executionStats.totalCost / Math.max(wordCount, 1)
    if (costPerWord < 0.001) score += 10 // Very efficient
    
    // Cap at 100
    return Math.min(score, 100)
  }
  
  /**
   * Get all test runs for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of test run records
   */
  async getTestRuns(userId) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'testing')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching test runs:', error)
        throw new Error(`Failed to fetch test runs: ${error.message}`)
      }
      
      return data || []
      
    } catch (error) {
      console.error('❌ TestingStorageService.getTestRuns error:', error)
      throw error
    }
  }
  
  /**
   * Delete a test run
   * @param {string} bookId - Book ID to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteTestRun(bookId) {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)
        .eq('type', 'testing')
      
      if (error) {
        console.error('❌ Error deleting test run:', error)
        throw new Error(`Failed to delete test run: ${error.message}`)
      }
      
      return true
      
    } catch (error) {
      console.error('❌ TestingStorageService.deleteTestRun error:', error)
      throw error
    }
  }
}

export default new TestingStorageService()

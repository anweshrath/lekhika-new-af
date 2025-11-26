import { supabase } from '../lib/supabase'
import { contentValidationEngine } from './quality/contentValidationEngine'
import { aiQualityAssessor } from './quality/aiQualityAssessor'
import { improvementSuggestionEngine } from './quality/improvementSuggestionEngine'

class QualityControlService {
  constructor() {
    this.isInitialized = false
    this.isMonitoring = false
    this.monitoringInterval = null
    this.qualityHistory = []
    this.systemMetrics = {
      totalAssessments: 0,
      totalValidations: 0,
      averageQualityScore: 0,
      passRate: 0,
      improvementSuggestions: 0
    }
  }

  async initialize() {
    try {
      console.log('🛡️ Initializing Quality Control Service...')
      
      // Initialize sub-services
      await contentValidationEngine.initialize()
      await aiQualityAssessor.initialize()
      await improvementSuggestionEngine.initialize()
      
      // Load quality history from database
      await this.loadQualityHistory()
      
      // Register quality event handlers
      this.registerQualityEventHandlers()
      
      this.isInitialized = true
      console.log('✅ Quality Control Service initialized successfully')
      
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Quality Control Service:', error)
      throw error
    }
  }

  async loadQualityHistory() {
    try {
      const { data, error } = await supabase
        .from('quality_assessments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      this.qualityHistory = data || []
      this.calculateSystemMetrics()
      
      console.log(`📚 Loaded ${this.qualityHistory.length} quality assessment records`)
    } catch (error) {
      console.error('❌ Failed to load quality history:', error)
      this.qualityHistory = []
    }
  }

  calculateSystemMetrics() {
    if (this.qualityHistory.length === 0) {
      this.systemMetrics = {
        totalAssessments: 0,
        totalValidations: 0,
        averageQualityScore: 0,
        passRate: 0,
        improvementSuggestions: 0
      }
      return
    }

    const assessments = this.qualityHistory.filter(item => item.type === 'assessment')
    const validations = this.qualityHistory.filter(item => item.type === 'validation')
    const suggestions = this.qualityHistory.filter(item => item.type === 'suggestion')

    this.systemMetrics.totalAssessments = assessments.length
    this.systemMetrics.totalValidations = validations.length
    this.systemMetrics.improvementSuggestions = suggestions.length

    // Calculate average quality score
    if (assessments.length > 0) {
      const totalScore = assessments.reduce((sum, assessment) => 
        sum + (assessment.results?.overallScore || 0), 0
      )
      this.systemMetrics.averageQualityScore = totalScore / assessments.length
    }

    // Calculate pass rate
    if (validations.length > 0) {
      const passedValidations = validations.filter(validation => 
        validation.results?.passed === true
      ).length
      this.systemMetrics.passRate = passedValidations / validations.length
    }
  }

  registerQualityEventHandlers() {
    // Handle quality assessment completion
    contentValidationEngine.on('validationComplete', async (validation) => {
      await this.handleValidationComplete(validation)
    })

    // Handle quality assessment completion
    aiQualityAssessor.on('assessmentComplete', async (assessment) => {
      await this.handleAssessmentComplete(assessment)
    })

    // Handle improvement suggestion generation
    improvementSuggestionEngine.on('suggestionGenerated', async (suggestion) => {
      await this.handleSuggestionGenerated(suggestion)
    })

    console.log('✅ Quality event handlers registered')
  }

  async handleValidationComplete(validation) {
    try {
      // Save validation to database
      await this.saveQualityRecord({
        type: 'validation',
        content_id: validation.contentId,
        results: validation.results,
        metadata: validation.metadata
      })

      // Update system metrics
      this.systemMetrics.totalValidations++
      if (validation.results.passed) {
        this.systemMetrics.passRate = (this.systemMetrics.passRate * (this.systemMetrics.totalValidations - 1) + 1) / this.systemMetrics.totalValidations
      } else {
        this.systemMetrics.passRate = (this.systemMetrics.passRate * (this.systemMetrics.totalValidations - 1)) / this.systemMetrics.totalValidations
      }

      console.log(`✅ Validation completed for content: ${validation.contentId}`)
    } catch (error) {
      console.error('❌ Error handling validation completion:', error)
    }
  }

  async handleAssessmentComplete(assessment) {
    try {
      // Save assessment to database
      await this.saveQualityRecord({
        type: 'assessment',
        content_id: assessment.contentId,
        results: assessment.results,
        metadata: assessment.metadata
      })

      // Update system metrics
      this.systemMetrics.totalAssessments++
      const newAverage = (this.systemMetrics.averageQualityScore * (this.systemMetrics.totalAssessments - 1) + assessment.results.overallScore) / this.systemMetrics.totalAssessments
      this.systemMetrics.averageQualityScore = newAverage

      console.log(`✅ Assessment completed for content: ${assessment.contentId}`)

      // Generate improvement suggestions if quality is below threshold
      if (assessment.results.overallScore < 0.7) {
        await this.generateImprovementSuggestions(assessment)
      }
    } catch (error) {
      console.error('❌ Error handling assessment completion:', error)
    }
  }

  async handleSuggestionGenerated(suggestion) {
    try {
      // Save suggestion to database
      await this.saveQualityRecord({
        type: 'suggestion',
        content_id: suggestion.contentId,
        results: suggestion.suggestions,
        metadata: suggestion.metadata
      })

      // Update system metrics
      this.systemMetrics.improvementSuggestions++

      console.log(`✅ Improvement suggestions generated for content: ${suggestion.contentId}`)
    } catch (error) {
      console.error('❌ Error handling suggestion generation:', error)
    }
  }

  async saveQualityRecord(record) {
    try {
      const { data, error } = await supabase
        .from('quality_assessments')
        .insert([{
          ...record,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      
      // Add to quality history
      this.qualityHistory.unshift(data)
      
      return data
    } catch (error) {
      console.error('❌ Failed to save quality record:', error)
      throw error
    }
  }

  async assessContentQuality(content, options = {}) {
    try {
      console.log(`🔍 Starting quality assessment for content: ${content.id || 'unknown'}`)
      
      // Perform AI quality assessment
      const assessment = await aiQualityAssessor.assessContent(content, {
        includeDetailedAnalysis: true,
        generateMetrics: true,
        ...options
      })

      // Perform content validation
      const validation = await contentValidationEngine.validateContent(
        content,
        options.validationRules || this.getDefaultValidationRules(),
        { generateReport: true }
      )

      // Combine results
      const combinedResults = {
        contentId: content.id || crypto.randomUUID(),
        qualityAssessment: assessment,
        validation: validation,
        overallScore: this.calculateOverallScore(assessment, validation),
        timestamp: new Date().toISOString()
      }

      // Generate improvement suggestions if needed
      if (combinedResults.overallScore < 0.7) {
        const suggestions = await improvementSuggestionEngine.generateSuggestions(
          content,
          {
            qualityScore: combinedResults.overallScore,
            assessmentResults: assessment,
            validationResults: validation
          }
        )
        combinedResults.improvementSuggestions = suggestions
      }

      console.log(`✅ Quality assessment completed: ${combinedResults.overallScore.toFixed(2)}`)
      return combinedResults

    } catch (error) {
      console.error('❌ Quality assessment failed:', error)
      throw error
    }
  }

  calculateOverallScore(assessment, validation) {
    const assessmentWeight = 0.7
    const validationWeight = 0.3

    const assessmentScore = assessment.overallScore || 0
    const validationScore = validation.passed ? 1.0 : (validation.score || 0)

    return (assessmentScore * assessmentWeight) + (validationScore * validationWeight)
  }

  getDefaultValidationRules() {
    return [
      { type: 'length', parameters: { minWords: 100, maxWords: 10000 } },
      { type: 'readability', parameters: { maxGradeLevel: 12 } },
      { type: 'coherence', parameters: { minScore: 0.6 } },
      { type: 'originality', parameters: { minScore: 0.8 } },
      { type: 'grammar', parameters: { maxErrors: 5 } },
      { type: 'structure', parameters: { requireHeadings: true } }
    ]
  }

  async generateImprovementSuggestions(assessment) {
    try {
      const suggestions = await improvementSuggestionEngine.generateSuggestions(
        { id: assessment.contentId },
        {
          qualityScore: assessment.results.overallScore,
          issues: assessment.results.issues || [],
          targetScore: 0.8
        }
      )

      return suggestions
    } catch (error) {
      console.error('❌ Failed to generate improvement suggestions:', error)
      return []
    }
  }

  async startContinuousMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Quality monitoring already active')
      return
    }

    this.isMonitoring = true
    
    // Start periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performMonitoringTasks()
      } catch (error) {
        console.error('❌ Quality monitoring task failed:', error)
      }
    }, 60000) // Every minute

    console.log('✅ Quality monitoring started')
  }

  async stopContinuousMonitoring() {
    if (!this.isMonitoring) {
      console.log('⚠️ Quality monitoring not active')
      return
    }

    this.isMonitoring = false
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    console.log('✅ Quality monitoring stopped')
  }

  async performMonitoringTasks() {
    try {
      // Check for content that needs quality assessment
      await this.checkPendingAssessments()
      
      // Update quality metrics
      await this.updateQualityMetrics()
      
      // Clean up old data
      await this.cleanupOldData()
      
      // Generate quality reports
      await this.generateQualityReports()
      
    } catch (error) {
      console.error('❌ Quality monitoring tasks failed:', error)
    }
  }

  async checkPendingAssessments() {
    try {
      // Get books that haven't been assessed recently
      const { data: books, error } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'completed')
        .is('quality_score', null)
        .limit(5)

      if (error) throw error

      for (const book of books || []) {
        try {
          console.log(`🔍 Auto-assessing book: ${book.id}`)
          
          const assessment = await this.assessContentQuality({
            id: book.id,
            title: book.title,
            content: book.content,
            type: book.type,
            metadata: book.metadata
          })

          // Update book with quality score
          await supabase
            .from('books')
            .update({
              quality_score: Math.round(assessment.overallScore * 100),
              ai_detection_score: Math.round((assessment.qualityAssessment.aiDetectionScore || 0) * 100)
            })
            .eq('id', book.id)

        } catch (error) {
          console.error(`❌ Failed to assess book ${book.id}:`, error)
        }
      }
    } catch (error) {
      console.error('❌ Failed to check pending assessments:', error)
    }
  }

  async updateQualityMetrics() {
    try {
      // Save current metrics to database
      await supabase
        .from('system_metrics')
        .insert([{
          metric_type: 'quality_control',
          metric_data: {
            ...this.systemMetrics,
            timestamp: new Date().toISOString()
          }
        }])
        
    } catch (error) {
      console.error('❌ Failed to update quality metrics:', error)
    }
  }

  async cleanupOldData() {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 30) // Keep 30 days of data
      
      // Clean up old quality assessments
      await supabase
        .from('quality_assessments')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        
    } catch (error) {
      console.error('❌ Failed to cleanup old quality data:', error)
    }
  }

  async generateQualityReports() {
    try {
      // Generate daily quality report
      const report = {
        date: new Date().toISOString().split('T')[0],
        metrics: this.systemMetrics,
        trends: await this.calculateQualityTrends(),
        recommendations: await this.generateQualityRecommendations()
      }

      await supabase
        .from('quality_reports')
        .insert([report])
        
    } catch (error) {
      console.error('❌ Failed to generate quality reports:', error)
    }
  }

  async calculateQualityTrends() {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('quality_assessments')
        .select('created_at, results')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('type', 'assessment')
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by day and calculate average scores
      const dailyScores = {}
      data?.forEach(assessment => {
        const date = assessment.created_at.split('T')[0]
        if (!dailyScores[date]) {
          dailyScores[date] = { scores: [], count: 0 }
        }
        dailyScores[date].scores.push(assessment.results?.overallScore || 0)
        dailyScores[date].count++
      })

      // Calculate daily averages
      const trends = Object.entries(dailyScores).map(([date, data]) => ({
        date,
        averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.count,
        assessmentCount: data.count
      }))

      return trends
    } catch (error) {
      console.error('❌ Failed to calculate quality trends:', error)
      return []
    }
  }

  async generateQualityRecommendations() {
    const recommendations = []

    // Analyze current metrics and generate recommendations
    if (this.systemMetrics.averageQualityScore < 0.7) {
      recommendations.push({
        type: 'quality_improvement',
        priority: 'high',
        message: 'Average quality score is below target. Consider reviewing content generation parameters.',
        action: 'adjust_ai_parameters'
      })
    }

    if (this.systemMetrics.passRate < 0.8) {
      recommendations.push({
        type: 'validation_improvement',
        priority: 'medium',
        message: 'Validation pass rate is low. Review validation rules for appropriateness.',
        action: 'review_validation_rules'
      })
    }

    return recommendations
  }

  // Public API methods
  async getQualityStatistics() {
    return {
      ...this.systemMetrics,
      activeValidations: contentValidationEngine.getActiveValidationCount(),
      lastUpdated: new Date().toISOString()
    }
  }

  async getRecentAssessments(limit = 10) {
    return this.qualityHistory
      .filter(item => item.type === 'assessment')
      .slice(0, limit)
      .map(assessment => ({
        id: assessment.id,
        contentId: assessment.content_id,
        contentTitle: assessment.results?.contentTitle,
        overallScore: assessment.results?.overallScore || 0,
        createdAt: assessment.created_at,
        issues: assessment.results?.issues || []
      }))
  }

  async getQualityTrends(days = 30) {
    return await this.calculateQualityTrends()
  }

  async getSystemStatus() {
    return {
      initialized: this.isInitialized,
      monitoring: this.isMonitoring,
      qualityStats: this.getQualityStatistics(),
      validationEngine: contentValidationEngine.getStatus(),
      assessmentEngine: aiQualityAssessor.getStatus(),
      improvementEngine: improvementSuggestionEngine.getStatus()
    }
  }

  async assessBook(bookId) {
    try {
      // Get book data
      const { data: book, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      if (error) throw error

      // Perform quality assessment
      const assessment = await this.assessContentQuality({
        id: book.id,
        title: book.title,
        content: book.content,
        type: book.type,
        metadata: book.metadata
      })

      // Update book with quality scores
      await supabase
        .from('books')
        .update({
          quality_score: Math.round(assessment.overallScore * 100),
          ai_detection_score: Math.round((assessment.qualityAssessment.aiDetectionScore || 0) * 100)
        })
        .eq('id', bookId)

      return assessment
    } catch (error) {
      console.error(`❌ Failed to assess book ${bookId}:`, error)
      throw error
    }
  }
}

export const qualityControlService = new QualityControlService()

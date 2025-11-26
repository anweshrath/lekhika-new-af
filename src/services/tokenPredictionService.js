// Token Prediction Service
// Provides intelligent token usage predictions for engines based on historical data and similarity matching

import { supabase } from '../lib/supabase'

class TokenPredictionService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Get token prediction for an engine
   * @param {Object} engine - Engine object with nodes, edges, metadata
   * @param {string} userId - User ID for personalized predictions
   * @returns {Promise<Object>} Prediction with tokens, confidence, and method
   */
  async getTokenPrediction(engine, userId = null) {
    try {
      const cacheKey = `prediction_${engine.id}_${userId || 'global'}`
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data
        }
      }

      let prediction

      // Method 1: Direct historical data (highest confidence)
      const directData = await this.getDirectTokenData(engine.id)
      if (directData) {
        prediction = {
          tokens: directData.averageTokens,
          confidence: 'high',
          method: 'historical',
          sampleSize: directData.sampleSize,
          minTokens: directData.minTokens,
          maxTokens: directData.maxTokens,
          lastUpdated: directData.lastUpdated
        }
      } else {
        // Method 2: Similarity-based prediction
        const similarityData = await this.getSimilarityBasedPrediction(engine, userId)
        prediction = {
          tokens: similarityData.predictedTokens,
          confidence: similarityData.confidence,
          method: 'similarity',
          similarEngines: similarityData.similarEngines,
          similarityScore: similarityData.similarityScore,
          factors: similarityData.factors
        }
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: prediction,
        timestamp: Date.now()
      })

      return prediction
    } catch (error) {
      console.error('Error getting token prediction:', error)
      return {
        tokens: 1000, // Fallback estimate
        confidence: 'low',
        method: 'fallback',
        error: error.message
      }
    }
  }

  /**
   * Get direct historical token data for an engine
   */
  async getDirectTokenData(engineId) {
    try {
      const { data, error } = await supabase
        .from('engine_executions')
        .select('tokens_used, created_at')
        .eq('engine_id', engineId)
        .not('tokens_used', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100) // Last 100 executions

      if (error) throw error
      if (!data || data.length === 0) return null

      const tokens = data.map(d => d.tokens_used).filter(t => t > 0)
      if (tokens.length === 0) return null

      const averageTokens = Math.round(tokens.reduce((sum, t) => sum + t, 0) / tokens.length)
      const minTokens = Math.min(...tokens)
      const maxTokens = Math.max(...tokens)
      const lastUpdated = data[0].created_at

      return {
        averageTokens,
        minTokens,
        maxTokens,
        sampleSize: tokens.length,
        lastUpdated
      }
    } catch (error) {
      console.error('Error getting direct token data:', error)
      return null
    }
  }

  /**
   * Get similarity-based prediction for an engine
   */
  async getSimilarityBasedPrediction(engine, userId = null) {
    try {
      // Get engine characteristics
      const characteristics = this.analyzeEngineCharacteristics(engine)
      
      // Find similar engines
      const similarEngines = await this.findSimilarEngines(characteristics, userId)
      
      if (similarEngines.length === 0) {
        return {
          predictedTokens: 1000,
          confidence: 'low',
          similarEngines: [],
          similarityScore: 0,
          factors: ['no_similar_engines']
        }
      }

      // Calculate weighted average based on similarity
      let totalWeightedTokens = 0
      let totalWeight = 0
      const factors = []

      for (const similar of similarEngines) {
        const weight = similar.similarityScore
        totalWeightedTokens += similar.averageTokens * weight
        totalWeight += weight
        
        if (similar.similarityScore > 0.7) {
          factors.push(`high_similarity_${similar.nodeCount}_nodes`)
        }
      }

      const predictedTokens = Math.round(totalWeightedTokens / totalWeight)
      const avgSimilarity = similarEngines.reduce((sum, s) => sum + s.similarityScore, 0) / similarEngines.length
      
      let confidence = 'low'
      if (avgSimilarity > 0.8) confidence = 'high'
      else if (avgSimilarity > 0.6) confidence = 'medium'

      return {
        predictedTokens,
        confidence,
        similarEngines: similarEngines.map(s => ({
          id: s.engineId,
          name: s.engineName,
          similarityScore: s.similarityScore,
          averageTokens: s.averageTokens
        })),
        similarityScore: avgSimilarity,
        factors
      }
    } catch (error) {
      console.error('Error getting similarity prediction:', error)
      return {
        predictedTokens: 1000,
        confidence: 'low',
        similarEngines: [],
        similarityScore: 0,
        factors: ['error']
      }
    }
  }

  /**
   * Analyze engine characteristics for similarity matching
   */
  analyzeEngineCharacteristics(engine) {
    const nodes = engine.nodes || []
    const edges = engine.edges || []
    const metadata = engine.metadata || {}

    // Count different node types
    const nodeTypes = {}
    nodes.forEach(node => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1
    })

    // Analyze AI models used
    const models = new Set()
    nodes.forEach(node => {
      if (node.data?.model) {
        models.add(node.data.model)
      }
    })

    // Calculate complexity metrics
    const complexity = {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      aiNodeCount: nodes.filter(n => n.type?.includes('ai') || n.type?.includes('llm')).length,
      modelCount: models.size,
      hasConditionals: nodes.some(n => n.type === 'conditional'),
      hasLoops: nodes.some(n => n.type === 'loop'),
      hasDataProcessing: nodes.some(n => n.type?.includes('data') || n.type?.includes('process')),
      estimatedContentLength: metadata.estimatedContentLength || 'medium'
    }

    return {
      nodeTypes,
      models: Array.from(models),
      complexity,
      tier: engine.tier || 'pro'
    }
  }

  /**
   * Find engines similar to the given characteristics
   */
  async findSimilarEngines(characteristics, userId = null) {
    try {
      // Get all engines with token data
      const { data: engines, error } = await supabase
        .from('ai_engines')
        .select(`
          id,
          name,
          nodes,
          edges,
          metadata,
          tier,
          engine_executions!inner(
            tokens_used,
            created_at
          )
        `)
        .not('engine_executions.tokens_used', 'is', null)

      if (error) throw error
      if (!engines) return []

      const similarEngines = []

      for (const engine of engines) {
        const engineChars = this.analyzeEngineCharacteristics(engine)
        const similarityScore = this.calculateSimilarityScore(characteristics, engineChars)
        
        if (similarityScore > 0.3) { // Minimum similarity threshold
          // Calculate average tokens for this engine
          const tokens = engine.engine_executions
            .map(e => e.tokens_used)
            .filter(t => t > 0)
          
          if (tokens.length > 0) {
            const averageTokens = Math.round(tokens.reduce((sum, t) => sum + t, 0) / tokens.length)
            
            similarEngines.push({
              engineId: engine.id,
              engineName: engine.name,
              similarityScore,
              averageTokens,
              nodeCount: engineChars.complexity.nodeCount,
              sampleSize: tokens.length
            })
          }
        }
      }

      // Sort by similarity score and return top matches
      return similarEngines
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10) // Top 10 similar engines
    } catch (error) {
      console.error('Error finding similar engines:', error)
      return []
    }
  }

  /**
   * Calculate similarity score between two engine characteristics
   */
  calculateSimilarityScore(chars1, chars2) {
    let score = 0
    let factors = 0

    // Node count similarity (weight: 0.3)
    const nodeCountDiff = Math.abs(chars1.complexity.nodeCount - chars2.complexity.nodeCount)
    const nodeCountScore = Math.max(0, 1 - (nodeCountDiff / Math.max(chars1.complexity.nodeCount, chars2.complexity.nodeCount)))
    score += nodeCountScore * 0.3
    factors += 0.3

    // AI node count similarity (weight: 0.2)
    const aiNodeDiff = Math.abs(chars1.complexity.aiNodeCount - chars2.complexity.aiNodeCount)
    const aiNodeScore = Math.max(0, 1 - (aiNodeDiff / Math.max(chars1.complexity.aiNodeCount, chars2.complexity.aiNodeCount, 1)))
    score += aiNodeScore * 0.2
    factors += 0.2

    // Model overlap (weight: 0.2)
    const modelOverlap = chars1.models.filter(m => chars2.models.includes(m)).length
    const modelScore = modelOverlap / Math.max(chars1.models.length, chars2.models.length, 1)
    score += modelScore * 0.2
    factors += 0.2

    // Tier similarity (weight: 0.1)
    const tierScore = chars1.tier === chars2.tier ? 1 : 0.5
    score += tierScore * 0.1
    factors += 0.1

    // Feature similarity (weight: 0.2)
    const featureScore = this.calculateFeatureSimilarity(chars1.complexity, chars2.complexity)
    score += featureScore * 0.2
    factors += 0.2

    return factors > 0 ? score / factors : 0
  }

  /**
   * Calculate feature similarity between two complexity objects
   */
  calculateFeatureSimilarity(comp1, comp2) {
    const features = ['hasConditionals', 'hasLoops', 'hasDataProcessing']
    let matches = 0
    
    features.forEach(feature => {
      if (comp1[feature] === comp2[feature]) {
        matches++
      }
    })

    return matches / features.length
  }

  /**
   * Get token usage statistics for a user
   */
  async getUserTokenStats(userId) {
    try {
      const { data, error } = await supabase
        .from('token_usage_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const totalTokens = data.reduce((sum, usage) => sum + (usage.tokens_used || 0), 0)
      const averagePerExecution = data.length > 0 ? Math.round(totalTokens / data.length) : 0

      return {
        totalTokens,
        averagePerExecution,
        executionCount: data.length,
        lastExecution: data[0]?.created_at || null
      }
    } catch (error) {
      console.error('Error getting user token stats:', error)
      return {
        totalTokens: 0,
        averagePerExecution: 0,
        executionCount: 0,
        lastExecution: null
      }
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }
}

// Export singleton instance
export const tokenPredictionService = new TokenPredictionService()
export default tokenPredictionService

import { supabase } from '../lib/supabase'

class TokenCostCalculator {
  async calculateTokenCost(modelId, inputTokens, outputTokens) {
    try {
      // Fetch model's token costs from Supabase
      const { data, error } = await supabase
        .from('ai_model_metadata')
        .select('input_cost_per_million, output_cost_per_million')
        .eq('model_id', modelId)
        .single()

      if (error) throw error

      const inputCost = (inputTokens / 1_000_000) * data.input_cost_per_million
      const outputCost = (outputTokens / 1_000_000) * data.output_cost_per_million
      
      return {
        inputTokens,
        outputTokens,
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
        modelId
      }
    } catch (error) {
      console.error('Token cost calculation error:', error)
      throw error
    }
  }

  async estimatePageEquivalent(modelId, tokens) {
    try {
      const { data, error } = await supabase
        .from('ai_model_metadata')
        .select('tokens_per_page')
        .eq('model_id', modelId)
        .single()

      if (error) throw error

      const tokensPerPage = data.tokens_per_page || 500
      const estimatedPages = tokens / tokensPerPage

      return {
        tokens,
        tokensPerPage,
        estimatedPages
      }
    } catch (error) {
      console.error('Page estimation error:', error)
      throw error
    }
  }
}

export const tokenCostCalculator = new TokenCostCalculator()
export default tokenCostCalculator

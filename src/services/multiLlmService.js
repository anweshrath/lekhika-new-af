import { openaiService } from './openaiService'
import { claudeService } from './claudeService'
import { geminiService } from './geminiService'
import { grokService } from './grokService'
import { perplexityService } from './perplexityService'

class MultiLLMService {
  constructor() {
    this.services = {
      openai: openaiService,
      claude: claudeService,
      gemini: geminiService,
      grok: grokService,
      perplexity: perplexityService
    }
  }

  async testAllConnections() {
    const results = {}
    
    for (const [name, service] of Object.entries(this.services)) {
      try {
        results[name] = await service.testConnection()
      } catch (error) {
        results[name] = { success: false, error: error.message }
      }
    }
    
    return results
  }

  async getAllModels() {
    const allModels = {}
    
    for (const [serviceName, service] of Object.entries(this.services)) {
      try {
        if (service.listModels) {
          allModels[serviceName] = await service.listModels()
        }
      } catch (error) {
        console.error(`Failed to fetch models for ${serviceName}:`, error)
        allModels[serviceName] = []
      }
    }
    
    return allModels
  }

  async generateWithMultipleLLMs(prompt, services = ['openai', 'claude', 'gemini']) {
    const results = {}
    const errors = {}
    
    for (const serviceName of services) {
      const service = this.services[serviceName]
      if (!service) continue
      
      try {
        console.log(`Generating with ${serviceName}...`)
        results[serviceName] = await service.generateContent(prompt)
      } catch (error) {
        console.error(`${serviceName} generation failed:`, error)
        errors[serviceName] = error.message
      }
    }
    
    return { results, errors }
  }

  async generateResearchWithMultipleLLMs(niche, type, targetAudience, tier = 'expert') {
    const services = tier === 'expert' ? ['gemini', 'openai', 'claude', 'grok', 'perplexity'] : ['gemini', 'openai']
    const results = {}
    const errors = {}
    
    for (const serviceName of services) {
      const service = this.services[serviceName]
      if (!service) continue
      
      try {
        console.log(`Generating research with ${serviceName}...`)
        results[serviceName] = await service.generateResearch(niche, type, targetAudience)
      } catch (error) {
        console.error(`${serviceName} research generation failed:`, error)
        errors[serviceName] = error.message
      }
    }
    
    // Combine results from all LLMs for expert tier
    if (tier === 'expert' && Object.keys(results).length > 1) {
      return this.combineResearchResults(results)
    }
    
    // Return single result for hobby tier or if only one succeeded
    const firstResult = Object.values(results)[0]
    return firstResult || this.getFallbackResearch(niche, type, targetAudience)
  }

  combineResearchResults(results) {
    const combined = {
      keyTopics: [],
      statistics: [],
      trends: [],
      targetInsights: {},
      sources: []
    }
    
    // Combine unique topics from all LLMs
    Object.values(results).forEach(result => {
      if (result.keyTopics) {
        result.keyTopics.forEach(topic => {
          if (!combined.keyTopics.includes(topic)) {
            combined.keyTopics.push(topic)
          }
        })
      }
      
      if (result.statistics) {
        combined.statistics.push(...result.statistics)
      }
      
      if (result.trends) {
        combined.trends.push(...result.trends)
      }
      
      if (result.sources) {
        combined.sources.push(...result.sources)
      }
    })
    
    // Use the most comprehensive target insights
    const insights = Object.values(results).find(r => r.targetInsights)?.targetInsights
    if (insights) {
      combined.targetInsights = insights
    }
    
    // Limit arrays to reasonable sizes
    combined.keyTopics = combined.keyTopics.slice(0, 10)
    combined.statistics = combined.statistics.slice(0, 8)
    combined.trends = combined.trends.slice(0, 8)
    combined.sources = combined.sources.slice(0, 8)
    
    return combined
  }

  async generateBookContentWithMultipleLLMs(section, research, tone, avatar, customPrompts, tier = 'expert') {
    const services = tier === 'expert' ? ['claude', 'gemini', 'openai', 'grok'] : ['gemini', 'openai']
    const results = {}
    
    for (const serviceName of services) {
      const service = this.services[serviceName]
      if (!service) continue
      
      try {
        console.log(`Generating ${section} with ${serviceName}...`)
        results[serviceName] = await service.generateBookContent(section, research, tone, avatar, customPrompts)
      } catch (error) {
        console.error(`${serviceName} content generation failed:`, error)
      }
    }
    
    // For expert tier, combine the best parts from multiple LLMs
    if (tier === 'expert' && Object.keys(results).length > 1) {
      return this.combineContentResults(results, section)
    }
    
    // Return single result for hobby tier or if only one succeeded
    return Object.values(results)[0] || this.getFallbackContent(section)
  }

  combineContentResults(results, section) {
    // For now, return the longest/most comprehensive result
    // In the future, this could be enhanced to actually merge content intelligently
    const sortedResults = Object.entries(results).sort(([,a], [,b]) => b.length - a.length)
    
    if (sortedResults.length > 0) {
      const [bestService, bestContent] = sortedResults[0]
      console.log(`Using ${bestService} content for ${section} (${bestContent.length} chars)`)
      return bestContent
    }
    
    return this.getFallbackContent(section)
  }

  async enhanceContentWithMultipleLLMs(content, tone, avatar, tier = 'expert') {
    const services = tier === 'expert' ? ['claude', 'gemini', 'openai', 'grok'] : ['gemini', 'openai']
    
    for (const serviceName of services) {
      const service = this.services[serviceName]
      if (!service) continue
      
      try {
        console.log(`Enhancing content with ${serviceName}...`)
        const enhanced = await service.enhanceContent(content, tone, avatar)
        if (enhanced && enhanced.length > content.length * 0.8) {
          return enhanced
        }
      } catch (error) {
        console.error(`${serviceName} content enhancement failed:`, error)
      }
    }
    
    // Return original if all enhancements fail
    return content
  }

  getFallbackResearch(niche, type, targetAudience) {
    return {
      keyTopics: [`${niche} fundamentals`, `${niche} strategies`, `${niche} implementation`, `${niche} optimization`, `${niche} trends`],
      statistics: [
        `80% of professionals in ${niche} report improved results with structured approaches`,
        `Market growth of 20% annually in the ${niche} sector`,
        `75% success rate when following proven ${niche} methodologies`
      ],
      trends: [
        `Digital transformation in ${niche}`,
        `Sustainability focus in ${niche}`,
        `Remote collaboration in ${niche}`
      ],
      targetInsights: {
        demographics: `${targetAudience} professionals`,
        painPoints: ['Time constraints', 'Resource limitations', 'Complexity'],
        goals: ['Efficiency', 'Growth', 'Success']
      },
      sources: [
        `${niche} Industry Report 2024`,
        `${niche} Best Practices Study`,
        `Future of ${niche} Analysis`
      ]
    }
  }

  getFallbackContent(section) {
    return `# ${section}

This section provides comprehensive insights and practical guidance for professionals looking to excel in their field.

## Key Concepts

The fundamental principles outlined here have been developed through extensive research and real-world application across various industries and contexts.

## Implementation Framework

A systematic approach to implementation ensures consistent results and sustainable progress toward your objectives.

## Best Practices

Following proven methodologies and established best practices significantly increases the likelihood of success and reduces common pitfalls.

## Moving Forward

The strategies and techniques presented in this section provide a solid foundation for continued growth and development in your professional journey.`
  }
}

export const multiLlmService = new MultiLLMService()

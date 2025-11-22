class AiServiceManager {
  constructor() {
    this.services = {
      openai: this.createOpenAIService(),
      anthropic: this.createAnthropicService(),
      google: this.createGoogleService(),
      perplexity: this.createPerplexityService()
    }
  }

  createOpenAIService() {
    return {
      name: 'OpenAI',
      generateContent: async (prompt, options = {}) => {
        const { apiKey, maxTokens = 2000 } = options
        
        if (!apiKey) {
          throw new Error('OpenAI API key is required')
        }

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [{ role: 'user', content: prompt }],
              max_tokens: maxTokens,
              temperature: 0.7
            })
          })

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`)
          }

          const data = await response.json()
          const content = data.choices?.[0]?.message?.content || ''
          
          return {
            content,
            tokensUsed: data.usage?.total_tokens || Math.ceil(prompt.length / 4),
            cost: (data.usage?.total_tokens || Math.ceil(prompt.length / 4)) * 0.00003
          }
        } catch (error) {
          console.error('OpenAI generation error:', error)
          throw error
        }
      }
    }
  }

  createAnthropicService() {
    return {
      name: 'Anthropic',
      generateContent: async (prompt, options = {}) => {
        const { apiKey, maxTokens = 2000 } = options
        
        if (!apiKey) {
          throw new Error('Anthropic API key is required')
        }

        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240229',
              max_tokens: maxTokens,
              messages: [{ role: 'user', content: prompt }]
            })
          })

          if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`)
          }

          const data = await response.json()
          const content = data.content?.[0]?.text || ''
          
          return {
            content,
            tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || Math.ceil(prompt.length / 4),
            cost: ((data.usage?.input_tokens || 0) * 0.000003) + ((data.usage?.output_tokens || 0) * 0.000015)
          }
        } catch (error) {
          console.error('Anthropic generation error:', error)
          throw error
        }
      }
    }
  }

  createGoogleService() {
    return {
      name: 'Google',
      generateContent: async (prompt, options = {}) => {
        const { apiKey, maxTokens = 2000 } = options
        
        if (!apiKey) {
          throw new Error('Google API key is required')
        }

        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: 0.7
              }
            })
          })

          if (!response.ok) {
            throw new Error(`Google API error: ${response.status}`)
          }

          const data = await response.json()
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          
          return {
            content,
            tokensUsed: Math.ceil(prompt.length / 4) + Math.ceil(content.length / 4),
            cost: Math.ceil(prompt.length / 4) * 0.000001
          }
        } catch (error) {
          console.error('Google generation error:', error)
          throw error
        }
      }
    }
  }

  createPerplexityService() {
    return {
      name: 'Perplexity',
      generateContent: async (prompt, options = {}) => {
        const { apiKey, maxTokens = 2000 } = options
        
        if (!apiKey) {
          throw new Error('Perplexity API key is required')
        }

        try {
          const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'llama-3.1-sonar-small-128k-online',
              messages: [{ role: 'user', content: prompt }],
              max_tokens: maxTokens,
              temperature: 0.7
            })
          })

          if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status}`)
          }

          const data = await response.json()
          const content = data.choices?.[0]?.message?.content || ''
          
          return {
            content,
            tokensUsed: data.usage?.total_tokens || Math.ceil(prompt.length / 4),
            cost: (data.usage?.total_tokens || Math.ceil(prompt.length / 4)) * 0.000001
          }
        } catch (error) {
          console.error('Perplexity generation error:', error)
          throw error
        }
      }
    }
  }

  async generateContent(serviceName, prompt, options = {}) {
    const service = this.services[serviceName]
    
    if (!service) {
      throw new Error(`Service ${serviceName} not found`)
    }

    return await service.generateContent(prompt, options)
  }

  getAvailableServices() {
    return Object.keys(this.services)
  }

  async testConnection(serviceName, apiKey) {
    try {
      const result = await this.generateContent(serviceName, 'Test connection. Respond with "OK".', {
        apiKey,
        maxTokens: 10
      })
      
      return {
        success: true,
        response: result.content,
        tokensUsed: result.tokensUsed
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export const aiServiceManager = new AiServiceManager()

class OpenAIService {
  constructor() {
    this.baseURL = 'https://api.openai.com/v1'
    this.apiKey = null
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found in environment variables')
      return
    }
    
    this.initialized = true
    console.log('OpenAI service initialized successfully')
  }

  ensureInitialized() {
    if (!this.initialized) {
      this.init()
    }
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.')
    }
  }

  async listModels() {
    try {
      this.ensureInitialized()
      
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }

      const data = await response.json()
      
      // Filter for chat completion models only
      const chatModels = data.data.filter(model => 
        model.id.includes('gpt') && 
        !model.id.includes('instruct') &&
        !model.id.includes('embedding') &&
        !model.id.includes('whisper') &&
        !model.id.includes('tts') &&
        !model.id.includes('dall-e')
      ).map(model => ({
        id: model.id,
        name: model.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: this.getModelDescription(model.id)
      }))

      return chatModels
    } catch (error) {
      console.error('Error fetching OpenAI models:', error)
      // Return default models if API call fails
      return [
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Most advanced multimodal model' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient model' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest GPT-4 with improved performance' },
        { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model for complex tasks' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective model' }
      ]
    }
  }

  getModelDescription(modelId) {
    const descriptions = {
      'gpt-4o': 'Most advanced multimodal model with vision capabilities',
      'gpt-4o-mini': 'Fast and efficient model for everyday tasks',
      'gpt-4-turbo': 'Latest GPT-4 with improved performance and speed',
      'gpt-4': 'Most capable model for complex reasoning tasks',
      'gpt-3.5-turbo': 'Fast and cost-effective model for general use'
    }
    return descriptions[modelId] || 'OpenAI language model'
  }

  async generateContent(prompt, maxTokens = 2000, model = 'gpt-4o') {
    try {
      this.ensureInitialized()
      
      console.log('Making OpenAI API request...')
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert content creator specializing in high-quality, engaging, and professional content across various niches and formats. Create content that is natural, human-like, and avoids AI detection patterns.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('OpenAI API error:', response.status, errorData)
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('OpenAI API response received successfully')
      return data.choices[0].message.content
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }

  async generateResearch(niche, type, targetAudience) {
    this.ensureInitialized()
    
    const prompt = `Generate comprehensive research data for a ${type} in the ${niche} niche targeting ${targetAudience}. 

    Create detailed, actionable research that includes:
    1. 5 key topics highly relevant to this niche and audience
    2. 3 current industry statistics with realistic numbers
    3. 3 emerging trends that are actually happening
    4. Target audience insights based on real demographics
    5. 3 credible sources that would exist for this topic
    
    Format as valid JSON with keys: keyTopics, statistics, trends, targetInsights, sources
    
    Make the content specific, actionable, and valuable for the target audience.`

    const result = await this.generateContent(prompt, 1500)
    
    try {
      return JSON.parse(result)
    } catch (error) {
      console.error('Failed to parse research JSON:', error)
      return {
        keyTopics: [`${niche} fundamentals`, `${niche} strategies`, `${niche} implementation`, `${niche} optimization`, `${niche} trends`],
        statistics: [
          `85% of professionals in ${niche} report improved results with structured approaches`,
          `Market growth of 23% annually in the ${niche} sector`,
          `78% success rate when following proven ${niche} methodologies`
        ],
        trends: [
          `AI integration transforming ${niche} practices`,
          `Sustainability focus driving innovation in ${niche}`,
          `Remote-first approaches reshaping ${niche} strategies`
        ],
        targetInsights: {
          demographics: `${targetAudience} professionals aged 25-45`,
          painPoints: ['Time constraints', 'Information overload', 'Implementation challenges'],
          goals: ['Improved efficiency', 'Better results', 'Professional growth']
        },
        sources: [
          `${niche} Industry Report 2024`,
          `Professional Development Study: ${niche}`,
          `Future of ${niche}: Expert Analysis`
        ]
      }
    }
  }

  async generateBookContent(section, research, tone, avatar, customPrompts = '') {
    this.ensureInitialized()
    
    const prompt = `Write a comprehensive ${section} for a professional book targeting ${avatar.name} (${avatar.demographics.profession}, ${avatar.demographics.age}).
    
    Research context: ${JSON.stringify(research)}
    Tone: ${tone}
    Custom requirements: ${customPrompts}
    
    Write 800-1200 words that are:
    - Highly engaging and professional
    - Tailored specifically to the target audience
    - Actionable and practical with real-world applications
    - Well-structured with clear points and subheadings
    - Natural and human-like (avoid AI detection patterns)
    - Include specific examples and case studies
    - Use varied sentence structures and natural flow
    
    Make this content valuable, unique, and worth reading. Avoid generic advice.`

    return await this.generateContent(prompt, 2500)
  }

  async enhanceContent(content, tone, avatar) {
    this.ensureInitialized()
    
    const prompt = `Enhance and polish this content for ${avatar.name} audience with ${tone} tone:
    
    ${content}
    
    Improve:
    - Flow and readability with natural transitions
    - Engagement level with compelling hooks
    - Professional quality while maintaining authenticity
    - Clarity and structure with better organization
    - Remove any AI detection patterns by varying sentence structure
    - Add more specific examples and actionable insights
    - Make it sound more human and conversational
    
    Return only the enhanced content. Make it significantly better than the original.`

    return await this.generateContent(prompt, 2000)
  }

  async generateCoverPrompt(title, niche, tone, type) {
    this.ensureInitialized()
    
    const prompt = `Create a detailed DALL-E prompt for a professional book cover with these specifications:
    
    Title: "${title}"
    Niche: ${niche}
    Tone: ${tone}
    Type: ${type}
    
    Generate a prompt that will create a stunning, professional book cover that:
    - Reflects the ${niche} industry
    - Matches the ${tone} tone
    - Looks like a bestselling ${type}
    - Uses appropriate colors and typography
    - Is visually striking and marketable
    
    Return only the DALL-E prompt, nothing else.`

    return await this.generateContent(prompt, 300)
  }

  async testConnection() {
    try {
      console.log('Testing OpenAI API connection...')
      this.ensureInitialized()
      
      const response = await this.generateContent('Say "API connection successful" if you can read this.', 50)
      console.log('API test response:', response)
      return { success: true, response }
    } catch (error) {
      console.error('API connection test failed:', error)
      return { success: false, error: error.message }
    }
  }
}

export const openaiService = new OpenAIService()

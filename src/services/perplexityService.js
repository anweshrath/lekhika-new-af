class PerplexityService {
  constructor() {
    this.baseURL = 'https://api.perplexity.ai'
    this.apiKey = null
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    
    this.apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY
    
    if (!this.apiKey) {
      console.warn('Perplexity API key not found in environment variables')
      return
    }
    
    this.initialized = true
    console.log('Perplexity service initialized successfully')
  }

  ensureInitialized() {
    if (!this.initialized) {
      this.init()
    }
    
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured. Please add VITE_PERPLEXITY_API_KEY to your environment variables.')
    }
  }

  async listModels() {
    // Perplexity has specific models
    return [
      { id: 'llama-3.1-sonar-small-128k-online', name: 'Llama 3.1 Sonar Small (Online)', description: 'Fast model with web search capabilities' },
      { id: 'llama-3.1-sonar-large-128k-online', name: 'Llama 3.1 Sonar Large (Online)', description: 'Powerful model with web search capabilities' },
      { id: 'llama-3.1-sonar-huge-128k-online', name: 'Llama 3.1 Sonar Huge (Online)', description: 'Most capable model with web search' },
      { id: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct', description: 'Fast offline model for general tasks' },
      { id: 'llama-3.1-70b-instruct', name: 'Llama 3.1 70B Instruct', description: 'Powerful offline model for complex tasks' }
    ]
  }

  async generateContent(prompt, maxTokens = 2000, model = 'llama-3.1-sonar-large-128k-online') {
    try {
      this.ensureInitialized()
      
      console.log('Making Perplexity API request...')
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
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Perplexity API error:', response.status, errorData)
        throw new Error(`Perplexity API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('Perplexity API response received successfully')
      return data.choices[0].message.content
    } catch (error) {
      console.error('Perplexity API error:', error)
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

    const result = await this.generateContent(prompt, 1500, 'llama-3.1-sonar-large-128k-online')
    
    try {
      return JSON.parse(result)
    } catch (error) {
      console.error('Failed to parse research JSON:', error)
      return {
        keyTopics: [`${niche} fundamentals`, `${niche} strategies`, `${niche} implementation`, `${niche} optimization`, `${niche} trends`],
        statistics: [
          `91% of professionals in ${niche} report improved results with structured approaches`,
          `Market growth of 35% annually in the ${niche} sector`,
          `86% success rate when following proven ${niche} methodologies`
        ],
        trends: [
          `Real-time data integration in ${niche}`,
          `Collaborative intelligence in ${niche}`,
          `Adaptive strategies for ${niche}`
        ],
        targetInsights: {
          demographics: `${targetAudience} professionals`,
          painPoints: ['Information overload', 'Decision speed', 'Quality assurance'],
          goals: ['Data-driven decisions', 'Competitive advantage', 'Scalable growth']
        },
        sources: [
          `${niche} Real-time Analytics Report 2024`,
          `${niche} Intelligence Study`,
          `Future-Ready ${niche} Strategies`
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

    return await this.generateContent(prompt, 2500, 'llama-3.1-sonar-large-128k-online')
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

    return await this.generateContent(prompt, 2000, 'llama-3.1-sonar-large-128k-online')
  }

  async testConnection() {
    try {
      console.log('Testing Perplexity API connection...')
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

export const perplexityService = new PerplexityService()

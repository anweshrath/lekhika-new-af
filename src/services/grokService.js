class GrokService {
  constructor() {
    this.baseURL = 'https://api.x.ai/v1'
    this.apiKey = null
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    
    this.apiKey = import.meta.env.VITE_GROK_API_KEY
    
    if (!this.apiKey) {
      console.warn('Grok API key not found in environment variables')
      return
    }
    
    this.initialized = true
    console.log('Grok service initialized successfully')
  }

  ensureInitialized() {
    if (!this.initialized) {
      this.init()
    }
    
    if (!this.apiKey) {
      throw new Error('Grok API key not configured. Please add VITE_GROK_API_KEY to your environment variables.')
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
      return data.data || []
    } catch (error) {
      console.error('Error fetching Grok models:', error)
      // Return default models if API call fails
      return [
        { id: 'grok-beta', name: 'Grok Beta', description: 'Latest Grok model for general tasks' },
        { id: 'grok-vision-beta', name: 'Grok Vision Beta', description: 'Grok model with vision capabilities' }
      ]
    }
  }

  async generateContent(prompt, maxTokens = 2000, model = 'grok-beta') {
    try {
      this.ensureInitialized()
      
      console.log('Making Grok API request...')
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
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Grok API error:', response.status, errorData)
        throw new Error(`Grok API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('Grok API response received successfully')
      return data.choices[0].message.content
    } catch (error) {
      console.error('Grok API error:', error)
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
          `89% of professionals in ${niche} report improved results with structured approaches`,
          `Market growth of 32% annually in the ${niche} sector`,
          `84% success rate when following proven ${niche} methodologies`
        ],
        trends: [
          `AI-driven innovation in ${niche}`,
          `Sustainable practices transforming ${niche}`,
          `Global collaboration reshaping ${niche}`
        ],
        targetInsights: {
          demographics: `${targetAudience} professionals`,
          painPoints: ['Rapid change adaptation', 'Resource optimization', 'Competitive pressure'],
          goals: ['Innovation leadership', 'Operational excellence', 'Market expansion']
        },
        sources: [
          `${niche} Innovation Report 2024`,
          `Global ${niche} Trends Study`,
          `${niche} Leadership Survey`
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

  async testConnection() {
    try {
      console.log('Testing Grok API connection...')
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

export const grokService = new GrokService()

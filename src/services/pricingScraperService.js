import Papa from 'papaparse'

class PricingScraperService {
  constructor() {
    this.supportedProviders = {
      'platform.openai.com': {
        name: 'OPENAI-01-1',
        baseUrl: 'https://platform.openai.com/pricing'
      },
      'console.anthropic.com': {
        name: 'CLAUD-01-1',
        baseUrl: 'https://console.anthropic.com/pricing'
      },
      'ai.google.dev': {
        name: 'GEMIN-02-2',
        baseUrl: 'https://ai.google.dev/pricing'
      },
      'console.mistral.ai': {
        name: 'MIST-01-1',
        baseUrl: 'https://console.mistral.ai/pricing'
      },
      'console.perplexity.ai': {
        name: 'PERP-01-1',
        baseUrl: 'https://console.perplexity.ai/pricing'
      },
      'console.x.ai': {
        name: 'GROK-01-1',
        baseUrl: 'https://console.x.ai/pricing'
      }
    }
  }

  /**
   * Scrape pricing data from a URL and return CSV format
   * @param {string} url - The pricing page URL
   * @returns {Promise<{success: boolean, data?: string, error?: string}>}
   */
  async scrapePricingData(url) {
    try {
      console.log(`🔍 Scraping pricing data from: ${url}`)
      
      // Extract provider name from URL
      const providerName = this.extractProviderName(url)
      console.log(`✅ Provider: ${providerName}`)
      
      // Make direct request - Vite proxy handles CORS
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      console.log(`📄 Fetched ${html.length} characters from ${url}`)
      
      // Parse the HTML to extract model data
      const models = this.parsePricingPage(html, providerName, url)
      
      if (models.length === 0) {
        return {
          success: false,
          error: 'No model data found on the pricing page'
        }
      }

      console.log(`✅ Extracted ${models.length} models from ${providerName}`)
      
      // Generate CSV data
      const csvData = this.generateCSVData(models, providerName)
      
      return {
        success: true,
        data: csvData,
        provider: providerName,
        modelCount: models.length
      }
      
    } catch (error) {
      console.error('❌ Scraping failed:', error)
      return {
        success: false,
        error: `Scraping failed: ${error.message}`
      }
    }
  }

  /**
   * Parse pricing page HTML to extract model data
   * @param {string} html 
   * @param {string} providerName 
   * @param {string} url 
   * @returns {Array}
   */
  parsePricingPage(html, providerName, url) {
    const models = []
    
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      // Try generic parsing first
      models.push(...this.parseGenericPricing(doc, providerName))
      
      // If no models found, try provider-specific parsing
      if (models.length === 0) {
        if (url.includes('openai')) {
          models.push(...this.parseOpenAIPricing(doc, providerName))
        } else if (url.includes('anthropic')) {
          models.push(...this.parseAnthropicPricing(doc, providerName))
        } else if (url.includes('google')) {
          models.push(...this.parseGooglePricing(doc, providerName))
        } else if (url.includes('mistral')) {
          models.push(...this.parseMistralPricing(doc, providerName))
        } else if (url.includes('perplexity')) {
          models.push(...this.parsePerplexityPricing(doc, providerName))
        } else if (url.includes('x.ai') || url.includes('grok')) {
          models.push(...this.parseGrokPricing(doc, providerName))
        }
      }
      
    } catch (error) {
      console.error('Error parsing HTML:', error)
    }
    
    return models
  }

  /**
   * Generic parsing for any pricing page
   */
  parseGenericPricing(doc, providerName) {
    const models = []
    
    // Look for common pricing table patterns
    const tableRows = doc.querySelectorAll('table tr, .pricing-row, .model-row, .price-row')
    const cards = doc.querySelectorAll('.model-card, .pricing-card, .plan-card')
    const allElements = [...tableRows, ...cards]
    
    allElements.forEach((element, index) => {
      try {
        // Extract model name from various possible selectors
        const modelName = this.extractText(element, '.model-name, .model-title, .plan-name, .product-name, td:first-child, th:first-child, h3, h4, .name') || 
                         this.extractText(element, 'td:nth-child(1), th:nth-child(1)') ||
                         `model-${index + 1}`
        
        // Extract costs from various possible selectors
        const inputCost = this.extractCost(element, '.input-cost, .input-price, .input, td:nth-child(2), td:nth-child(3), .price-input') ||
                         this.extractCost(element, 'td:nth-child(2), td:nth-child(3)')
        
        const outputCost = this.extractCost(element, '.output-cost, .output-price, .output, td:nth-child(3), td:nth-child(4), .price-output') ||
                          this.extractCost(element, 'td:nth-child(3), td:nth-child(4)')
        
        // Extract context window
        const contextWindow = this.extractNumber(element, '.context-window, .context, .tokens, td:nth-child(4), td:nth-child(5)') ||
                             this.extractNumber(element, 'td:nth-child(4), td:nth-child(5)')
        
        // Only add if we found meaningful data
        if (modelName && modelName.length > 2 && (inputCost || outputCost)) {
          models.push({
            provider: providerName,
            model_name: `models/${modelName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`,
            input_cost: inputCost || 0,
            output_cost: outputCost || 0,
            context_window: contextWindow || 0,
            specialties: 'AI Assistant, General Purpose',
            description: `${providerName} ${modelName} model`,
            is_active: 'TRUE'
          })
        }
      } catch (error) {
        console.error('Error parsing generic model:', error)
      }
    })
    
    return models
  }

  /**
   * Parse OpenAI pricing page
   */
  parseOpenAIPricing(doc, providerName) {
    const models = []
    
    // Look for model tables or cards
    const modelElements = doc.querySelectorAll('[data-testid*="model"], .model-card, .pricing-row, tr[data-model]')
    
    modelElements.forEach((element, index) => {
      try {
        const modelName = this.extractText(element, '.model-name, .model-title, td:first-child, [data-model-name]') || `gpt-model-${index + 1}`
        const inputCost = this.extractCost(element, '.input-cost, .input-price, td:nth-child(2)')
        const outputCost = this.extractCost(element, '.output-cost, .output-price, td:nth-child(3)')
        const contextWindow = this.extractNumber(element, '.context-window, .context, td:nth-child(4)')
        
        if (modelName && (inputCost || outputCost)) {
          models.push({
            provider: providerName,
            model_name: `models/${modelName.toLowerCase().replace(/\s+/g, '-')}`,
            input_cost: inputCost || 0,
            output_cost: outputCost || 0,
            context_window: contextWindow || 0,
            specialties: 'General Purpose, AI Assistant',
            description: `OpenAI ${modelName} model`,
            is_active: 'TRUE'
          })
        }
      } catch (error) {
        console.error('Error parsing OpenAI model:', error)
      }
    })
    
    return models
  }

  /**
   * Parse Anthropic pricing page
   */
  parseAnthropicPricing(doc, providerName) {
    const models = []
    
    const modelElements = doc.querySelectorAll('.model-row, .pricing-item, tr[data-model]')
    
    modelElements.forEach((element, index) => {
      try {
        const modelName = this.extractText(element, '.model-name, .model-title, td:first-child') || `claude-model-${index + 1}`
        const inputCost = this.extractCost(element, '.input-cost, .input-price, td:nth-child(2)')
        const outputCost = this.extractCost(element, '.output-cost, .output-price, td:nth-child(3)')
        const contextWindow = this.extractNumber(element, '.context-window, .context, td:nth-child(4)')
        
        if (modelName && (inputCost || outputCost)) {
          models.push({
            provider: providerName,
            model_name: `models/${modelName.toLowerCase().replace(/\s+/g, '-')}`,
            input_cost: inputCost || 0,
            output_cost: outputCost || 0,
            context_window: contextWindow || 0,
            specialties: 'Reasoning, Analysis, Coding',
            description: `Anthropic ${modelName} model`,
            is_active: 'TRUE'
          })
        }
    } catch (error) {
        console.error('Error parsing Anthropic model:', error)
      }
    })
    
    return models
  }

  /**
   * Parse Google pricing page
   */
  parseGooglePricing(doc, providerName) {
    const models = []
    
    const modelElements = doc.querySelectorAll('.model-card, .pricing-row, tr[data-model], .gemini-model')
    
    modelElements.forEach((element, index) => {
      try {
        const modelName = this.extractText(element, '.model-name, .model-title, td:first-child, .gemini-name') || `gemini-model-${index + 1}`
        const inputCost = this.extractCost(element, '.input-cost, .input-price, td:nth-child(2)')
        const outputCost = this.extractCost(element, '.output-cost, .output-price, td:nth-child(3)')
        const contextWindow = this.extractNumber(element, '.context-window, .context, td:nth-child(4)')
        
        if (modelName && (inputCost || outputCost)) {
          models.push({
            provider: providerName,
            model_name: `models/${modelName.toLowerCase().replace(/\s+/g, '-')}`,
            input_cost: inputCost || 0,
            output_cost: outputCost || 0,
            context_window: contextWindow || 0,
            specialties: 'Multimodal, Long Context, Reasoning',
            description: `Google ${modelName} model`,
            is_active: 'TRUE'
          })
        }
      } catch (error) {
        console.error('Error parsing Google model:', error)
      }
    })
    
    return models
  }

  /**
   * Parse Mistral pricing page
   */
  parseMistralPricing(doc, providerName) {
    const models = []
    
    const modelElements = doc.querySelectorAll('.model-row, .pricing-item, tr[data-model]')
    
    modelElements.forEach((element, index) => {
      try {
        const modelName = this.extractText(element, '.model-name, .model-title, td:first-child') || `mistral-model-${index + 1}`
        const inputCost = this.extractCost(element, '.input-cost, .input-price, td:nth-child(2)')
        const outputCost = this.extractCost(element, '.output-cost, .output-price, td:nth-child(3)')
        const contextWindow = this.extractNumber(element, '.context-window, .context, td:nth-child(4)')
        
        if (modelName && (inputCost || outputCost)) {
          models.push({
            provider: providerName,
            model_name: `models/${modelName.toLowerCase().replace(/\s+/g, '-')}`,
            input_cost: inputCost || 0,
            output_cost: outputCost || 0,
            context_window: contextWindow || 0,
            specialties: 'General Purpose, Multilingual',
            description: `Mistral ${modelName} model`,
            is_active: 'TRUE'
          })
        }
      } catch (error) {
        console.error('Error parsing Mistral model:', error)
      }
    })
    
    return models
  }

  /**
   * Parse Perplexity pricing page
   */
  parsePerplexityPricing(doc, providerName) {
    const models = []
    
    const modelElements = doc.querySelectorAll('.model-row, .pricing-item, tr[data-model]')
    
    modelElements.forEach((element, index) => {
      try {
        const modelName = this.extractText(element, '.model-name, .model-title, td:first-child') || `perplexity-model-${index + 1}`
        const inputCost = this.extractCost(element, '.input-cost, .input-price, td:nth-child(2)')
        const outputCost = this.extractCost(element, '.output-cost, .output-price, td:nth-child(3)')
        const contextWindow = this.extractNumber(element, '.context-window, .context, td:nth-child(4)')
        
        if (modelName && (inputCost || outputCost)) {
          models.push({
            provider: providerName,
            model_name: `models/${modelName.toLowerCase().replace(/\s+/g, '-')}`,
            input_cost: inputCost || 0,
            output_cost: outputCost || 0,
            context_window: contextWindow || 0,
            specialties: 'Search, Online, Real-time',
            description: `Perplexity ${modelName} model`,
            is_active: 'TRUE'
          })
        }
      } catch (error) {
        console.error('Error parsing Perplexity model:', error)
      }
    })
    
    return models
  }

  /**
   * Parse Grok pricing page
   */
  parseGrokPricing(doc, providerName) {
    const models = []
    
    const modelElements = doc.querySelectorAll('.model-row, .pricing-item, tr[data-model]')
    
    modelElements.forEach((element, index) => {
      try {
        const modelName = this.extractText(element, '.model-name, .model-title, td:first-child') || `grok-model-${index + 1}`
        const inputCost = this.extractCost(element, '.input-cost, .input-price, td:nth-child(2)')
        const outputCost = this.extractCost(element, '.output-cost, .output-price, td:nth-child(3)')
        const contextWindow = this.extractNumber(element, '.context-window, .context, td:nth-child(4)')
        
        if (modelName && (inputCost || outputCost)) {
          models.push({
            provider: providerName,
            model_name: `models/${modelName.toLowerCase().replace(/\s+/g, '-')}`,
            input_cost: inputCost || 0,
            output_cost: outputCost || 0,
            context_window: contextWindow || 0,
            specialties: 'General Purpose, Fast',
            description: `Grok ${modelName} model`,
            is_active: 'TRUE'
          })
        }
      } catch (error) {
        console.error('Error parsing Grok model:', error)
      }
    })
    
    return models
  }

  /**
   * Extract text content from element
   */
  extractText(element, selector) {
    const found = element.querySelector(selector)
    return found ? found.textContent.trim() : null
  }

  /**
   * Extract cost value from element
   */
  extractCost(element, selector) {
    const found = element.querySelector(selector)
    if (!found) return null
    
    const text = found.textContent.trim()
    const match = text.match(/\$?([\d,]+\.?\d*)/)
    return match ? parseFloat(match[1].replace(/,/g, '')) : null
  }

  /**
   * Extract number value from element
   */
  extractNumber(element, selector) {
    const found = element.querySelector(selector)
    if (!found) return null
    
    const text = found.textContent.trim()
    const match = text.match(/([\d,]+)/)
    return match ? parseInt(match[1].replace(/,/g, '')) : null
  }

  /**
   * Extract provider name from URL
   * @param {string} url 
   * @returns {string}
   */
  extractProviderName(url) {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      
      // Extract domain name and create provider identifier
      if (hostname.includes('openai')) return 'OPENAI-01-1'
      if (hostname.includes('anthropic')) return 'CLAUD-01-1'
      if (hostname.includes('google')) return 'GEMIN-02-2'
      if (hostname.includes('mistral')) return 'MIST-01-1'
      if (hostname.includes('perplexity')) return 'PERP-01-1'
      if (hostname.includes('x.ai') || hostname.includes('grok')) return 'GROK-01-1'
      
      // Default: extract domain and create generic provider name
      const domain = hostname.replace(/^(www\.|console\.|platform\.)/, '')
      const providerCode = domain.split('.')[0].toUpperCase()
      return `${providerCode}-01-1`
      
    } catch (error) {
      return 'UNKNOWN-01-1'
    }
  }

  /**
   * Find provider by URL
   * @param {string} url 
   * @returns {Object|null}
   */
  findProviderByUrl(url) {
    for (const [domain, provider] of Object.entries(this.supportedProviders)) {
      if (url.includes(domain)) {
        return provider
      }
    }
    return null
  }

  /**
   * Generate CSV data in the exact table format
   * @param {Array} models 
   * @param {string} providerName 
   * @returns {string}
   */
  generateCSVData(models, providerName) {
    const csvRows = []
    
    // Add header row
    csvRows.push([
      'provider',
      'model_name', 
      'input_cost',
      'output_cost',
      'context_window',
      'specialties',
      'description',
      'is_active'
    ])
    
    // Add data rows
    models.forEach(model => {
      csvRows.push([
        model.provider,
        model.model_name,
        model.input_cost,
        model.output_cost,
        model.context_window,
        model.specialties,
        model.description,
        model.is_active
      ])
    })
    
    // Convert to CSV string
    return Papa.unparse(csvRows)
  }

  /**
   * Download CSV file
   * @param {string} csvData 
   * @param {string} filename 
   */
  downloadCSV(csvData, filename = 'ai_models.csv') {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  /**
   * Get supported URLs
   * @returns {Array}
   */
  getSupportedUrls() {
    return Object.values(this.supportedProviders).map(p => p.baseUrl)
  }

  /**
   * Get provider info by name
   * @param {string} providerName 
   * @returns {Object|null}
   */
  getProviderInfo(providerName) {
    for (const provider of Object.values(this.supportedProviders)) {
      if (provider.name === providerName) {
        return provider
      }
    }
    return null
  }
}

export const pricingScraperService = new PricingScraperService()
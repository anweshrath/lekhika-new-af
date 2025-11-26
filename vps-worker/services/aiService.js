const { getSupabase } = require('./supabase');
const aiResponseValidator = require('./aiResponseValidator.js');

// AI Queue Service with WORKING Supabase Storage
class AIService {
  constructor() {
    // Initialize empty providers - will be populated dynamically from database
    this.providers = {};
    this.queue = [];
    this.currentIndex = 0;
    this.user = null;
    this.initialized = false;
  }

  // Provider-agnostic image generation
  async generateImage(prompt, options = {}) {
    const providerKey = options.provider || this.getNextProvider();
    const config = this.providers[providerKey];
    if (!config || !config.apiKey) {
      throw new Error(`No API key configured for ${providerKey}`);
    }
    const providerType = (config.providerType || '').toLowerCase();
    const model = options.model || config.model;

    const endpoint = this.getImageEndpoint(providerType, config.apiKey, model);
    const request = this.buildImageRequest(providerType, prompt, {
      ...options,
      model
    });

    const headers = this.buildImageHeaders(providerType, config.apiKey);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: providerType === 'huggingface' ? JSON.stringify({ inputs: prompt }) : JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      throw new Error(`${providerType} image API error: ${response.status} - ${errorMsg}`);
    }

    // Some providers return binary; here we expect JSON with base64 for the common cases we support
    const data = await response.json().catch(async () => {
      // Fallback: if not JSON, try to read as arrayBuffer and wrap as data URI (rare path)
      const ab = await response.arrayBuffer();
      const b64 = Buffer.from(new Uint8Array(ab)).toString('base64');
      return { dataUri: `data:image/png;base64,${b64}`, mimeType: 'image/png' };
    });

    const images = this.parseImageResponse(providerType, data);

    return {
      images: images.map(img => ({
        ...img,
        provider: providerKey,
        prompt
      }))
    };
  }

  getImageEndpoint(providerType, apiKey = null, model = null) {
    switch (providerType) {
      case 'openai':
        return 'https://api.openai.com/v1/images/generations';
      case 'stability':
      case 'stable_diffusion':
        // Text-to-image endpoint; model name can be in path for Stability v1 (keep generic if model unknown)
        return `https://api.stability.ai/v1/generation/${model || 'stable-diffusion-v1-6'}/text-to-image`;
      case 'huggingface':
        return `https://api-inference.huggingface.co/models/${model || 'runwayml/stable-diffusion-v1-5'}`;
      default:
        // Fall back to content endpoint if unknown (will likely fail, but avoids crash)
        return this.getEndpoint(providerType, apiKey, model);
    }
  }

  buildImageHeaders(providerType, apiKey) {
    const headers = { 'Content-Type': 'application/json' };
    switch (providerType) {
      case 'openai':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'stability':
      case 'stable_diffusion':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'huggingface':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      default:
        headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return headers;
  }

  buildImageRequest(providerType, prompt, opts = {}) {
    const width = opts.width || 1024;
    const height = opts.height || 1024;
    switch (providerType) {
      case 'openai':
        return {
          prompt,
          n: 1,
          size: `${width}x${height}`,
          response_format: 'b64_json'
        };
      case 'stability':
      case 'stable_diffusion':
        return {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height,
          width,
          samples: 1,
          steps: 30
        };
      case 'huggingface':
        // Body is built in fetch call for huggingface; here we just keep shape parity
        return { inputs: prompt };
      default:
        return { prompt };
    }
  }

  parseImageResponse(providerType, data) {
    switch (providerType) {
      case 'openai': {
        const b64 = data?.data?.[0]?.b64_json;
        if (!b64) return [];
        return [{ dataUri: `data:image/png;base64,${b64}`, mimeType: 'image/png' }];
      }
      case 'stability':
      case 'stable_diffusion': {
        const b64 = data?.artifacts?.[0]?.base64;
        if (!b64) return [];
        return [{ dataUri: `data:image/png;base64,${b64}`, mimeType: 'image/png' }];
      }
      case 'huggingface': {
        if (data?.dataUri) {
          return [{ dataUri: data.dataUri, mimeType: data.mimeType || 'image/png' }];
        }
        // Some models return an array of base64 strings under different keys; try common shapes
        const b64 = data?.b64_json || data?.image_base64;
        if (b64) return [{ dataUri: `data:image/png;base64,${b64}`, mimeType: 'image/png' }];
        return [];
      }
      default: {
        // Attempt generic extraction
        const b64 = data?.data?.[0]?.b64_json || data?.image_base64 || data?.base64;
        if (b64) return [{ dataUri: `data:image/png;base64,${b64}`, mimeType: 'image/png' }];
        const url = data?.images?.[0] || data?.url;
        if (url) return [{ url, mimeType: 'image/png' }];
        return [];
      }
    }
  }

  async setUser(user) {
    console.log('🔑 Setting user:', user?.email || 'null');
    this.user = user;
    
    if (user) {
      await this.loadSavedKeys();
    } else {
      // Clear local state on logout
      this.clearLocalState();
    }
    
    this.initialized = true;
  }

  clearLocalState() {
    Object.keys(this.providers).forEach(provider => {
      this.providers[provider].apiKey = null;
      this.providers[provider].available = false;
      this.providers[provider].failures = 0;
    });
    this.updateQueue();
  }

  mapProviderNameToType(providerName) {
    // Map provider names like "OPENA-01-first" to provider types like "openai"
    if (providerName.startsWith('OPENA')) return 'openai';
    if (providerName.startsWith('MISTR')) return 'mistral';
    if (providerName.startsWith('GEMIN')) return 'gemini';
    if (providerName.startsWith('CLAUD')) return 'claude';
    if (providerName.startsWith('PERPL')) return 'perplexity';
    if (providerName.startsWith('GROK')) return 'grok';
    if (providerName.startsWith('COHER')) return 'cohere';
    if (providerName.startsWith('STABL')) return 'stable_diffusion';
    if (providerName.startsWith('ELEVE')) return 'elevenlabs';
    if (providerName.startsWith('HUGGI')) return 'huggingface';
    if (providerName.startsWith('CRAIY')) return 'craiyon';
    if (providerName.startsWith('MODEL')) return 'modelslab';
    
    // If it doesn't match any pattern, try to extract from the name
    const lowerName = providerName.toLowerCase();
    if (lowerName.includes('openai')) return 'openai';
    if (lowerName.includes('mistral')) return 'mistral';
    if (lowerName.includes('gemini')) return 'gemini';
    if (lowerName.includes('claude')) return 'claude';
    if (lowerName.includes('perplexity')) return 'perplexity';
    if (lowerName.includes('grok')) return 'grok';
    if (lowerName.includes('stable') || lowerName.includes('diffusion')) return 'stable_diffusion';
    if (lowerName.includes('elevenlabs')) return 'elevenlabs';
    if (lowerName.includes('huggingface')) return 'huggingface';
    if (lowerName.includes('craiyon')) return 'craiyon';
    if (lowerName.includes('modelslab')) return 'modelslab';
    if (lowerName.includes('cohere')) return 'cohere';
    
    // Default fallback
    return providerName.toLowerCase();
  }

  async loadSavedKeys() {
    if (!this.user) {
      console.log('❌ No user logged in, cannot load API keys');
      return;
    }

    // Handle both regular user.id and SuperAdmin user.adminId
    const userId = this.user.id || this.user.adminId;
    if (!userId) {
      console.log('❌ No user ID found for loading API keys');
      return;
    }

    try {
      console.log('🔍 Loading API keys and models from Supabase for user:', userId);
      const supabase = getSupabase();
      
      // Load active providers - same method as AIManagement
      const { data: savedProviders, error: providerError } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true);

      if (providerError) {
        console.error('❌ Supabase error loading API keys:', providerError);
        throw providerError;
      }

      // Load active models for each provider
      const { data: activeModels, error: modelError } = await supabase
        .from('ai_model_metadata')
        .select('*')
        .eq('is_active', true);

      if (modelError) {
        console.error('❌ Supabase error loading models:', modelError);
        throw modelError;
      }

      console.log('📦 Raw providers from Supabase:', savedProviders);
      console.log('📦 Raw models from Supabase:', activeModels);

      // Clear existing providers
      this.providers = {};

      if (savedProviders && savedProviders.length > 0) {
        console.log('✅ Found saved providers:', savedProviders.map(p => p.provider));
        console.log('🔍 Provider names:', savedProviders.map(p => p.name));
        
        savedProviders.forEach(provider => {
          // Use the actual provider name as the key - NO MAPPING
          const providerKey = provider.name;
          
          // Find active models for this provider
          const providerModels = activeModels?.filter(model => 
            model.key_name === provider.name
          ) || [];

          // Get the first active model as default
          const defaultModel = providerModels.length > 0 ? providerModels[0].model_name : null;

          this.providers[providerKey] = {
            apiKey: provider.api_key,
            model: defaultModel,
            available: defaultModel !== null, // Only available if it has a model
            lastUsed: 0,
            failures: 0,
            availableModels: providerModels,
            providerType: provider.provider, // Store the actual provider type
            providerName: provider.name
          };

          console.log(`✅ Loaded ${providerKey} (${provider.provider}) with model ${defaultModel}`);
        });
        
        this.updateQueue();
        console.log('🔄 Queue updated with loaded providers:', this.getAvailableProviders());
      } else {
        console.log('📭 No saved API keys found in Supabase');
      }
    } catch (error) {
      console.error('💥 Error loading saved API keys:', error);
      this.providers = {}; // Empty providers on error
    }
  }

  async setApiKey(provider, apiKey, model = null) {
    console.log(`🚀 setApiKey called for ${provider} with user:`, this.user?.email || 'null')
    
    // If provider doesn't exist, create it dynamically (for custom providers)
    if (!this.providers[provider]) {
      this.providers[provider] = {
        apiKey: null,
        model: model || 'default',
        available: false,
        lastUsed: 0,
        failures: 0,
        isCustom: true
      };
      console.log(`🆕 Created dynamic provider: ${provider}`);
    }

    if (!this.user) {
      throw new Error('User must be logged in to save API keys');
    }
    
    console.log(`💾 Saving API key for ${provider} to Supabase`);
    console.log(`👤 User ID: ${this.user.id}, Email: ${this.user.email}`)
    
    try {
      // Update local state first
      this.providers[provider].apiKey = apiKey;
      this.providers[provider].available = true;
      this.providers[provider].failures = 0;
      
      if (model) {
        this.providers[provider].model = model;
      }
      
      // Save to Supabase with detailed logging
      const upsertData = {
        user_id: this.user.id,
        provider: provider,
        api_key: apiKey,
        model: this.providers[provider].model,
        is_active: true
      }
      
      console.log('📤 Upserting to Supabase:', upsertData);
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('ai_providers')
        .upsert(upsertData, {
          onConflict: 'user_id,provider'
        })
        .select();

      if (error) {
        console.error('❌ Supabase upsert error:', error);
        console.error('❌ Error details:', error.details, error.hint, error.code)
        throw new Error(`Failed to save ${provider} API key: ${error.message}`);
      }

      console.log('✅ Supabase upsert successful:', data);
      
      // SYNC MODEL METADATA
      await this.syncModelMetadata(provider, apiKey);
      
      this.updateQueue();
      console.log(`🎉 ${provider} API key saved successfully and added to queue`);
      
      return data;
    } catch (error) {
      console.error('💥 Error saving API key:', error);
      // Revert local state on error
      this.providers[provider].apiKey = null;
      this.providers[provider].available = false;
      throw error;
    }
  }

  async syncModelMetadata(provider, apiKey) {
    try {
      const modelDiscoveryService = await import('./aiModelDiscoveryService.js');
      await modelDiscoveryService.discoverModelsForProvider(provider, apiKey);
    } catch (error) {
      console.error(`❌ Failed to sync model metadata for ${provider}:`, error);
      // Non-blocking error, just log it
    }
  }

  async removeApiKey(provider) {
    if (!this.user) {
      throw new Error('User must be logged in to remove API keys');
    }

    try {
      console.log(`🗑️ Removing ${provider} API key from Supabase`);
      const supabase = getSupabase();

      const { error } = await supabase
        .from('ai_providers')
        .update({ is_active: false })
        .eq('user_id', this.user.id)
        .eq('provider', provider);

      if (error) {
        console.error('❌ Supabase remove error:', error);
        throw new Error(`Failed to remove ${provider} API key: ${error.message}`);
      }

      // Update local state
      if (this.providers[provider]) {
        this.providers[provider].apiKey = null;
        this.providers[provider].available = false;
        this.providers[provider].failures = 0;
      }

      this.updateQueue();
      console.log(`✅ ${provider} API key removed successfully`);
    } catch (error) {
      console.error('💥 Error removing API key:', error);
      throw error;
    }
  }

  updateQueue() {
    // Create queue of available providers, sorted by least recently used and fewest failures
    this.queue = Object.keys(this.providers)
      .filter(provider => this.providers[provider].available && this.providers[provider].apiKey)
      .sort((a, b) => {
        const aProvider = this.providers[a];
        const bProvider = this.providers[b];
        
        // Sort by failures first, then by last used time
        if (aProvider.failures !== bProvider.failures) {
          return aProvider.failures - bProvider.failures;
        }
        return aProvider.lastUsed - bProvider.lastUsed;
      });
    
    console.log('🔄 AI Queue updated:', this.queue);
  }

  getNextProvider() {
    if (this.queue.length === 0) {
      throw new Error('No AI providers available. Please configure at least one API key.');
    }
    
    // Get next provider in rotation
    const provider = this.queue[this.currentIndex % this.queue.length];
    this.currentIndex = (this.currentIndex + 1) % this.queue.length;
    
    return provider;
  }

  markProviderUsed(provider, success = true) {
    if (this.providers[provider]) {
      this.providers[provider].lastUsed = Date.now();
      if (!success) {
        this.providers[provider].failures++;
        console.warn(`❌ Provider ${provider} failed, failure count: ${this.providers[provider].failures}`);
      } else {
        this.providers[provider].failures = Math.max(0, this.providers[provider].failures - 1);
        console.log(`✅ Provider ${provider} succeeded`);
      }
      this.updateQueue();
    }
  }

  async generateBookOutline(topic, requirements) {
    const prompt = `Create a detailed book outline for: ${topic}

Requirements: ${requirements}

Please provide a JSON response with this exact structure:
{
  "title": "Book Title",
  "description": "Book description",
  "chapters": [
    {
      "title": "Chapter Title",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "description": "Chapter description"
    }
  ]
}

Make it comprehensive, practical, and valuable for readers.`;

    return await this.callAIWithQueue(prompt, 'outline');
  }

  async generateChapter(chapterOutline, bookContext) {
    const prompt = `Write a complete, comprehensive chapter based on:

Chapter Title: ${chapterOutline.title}
Chapter Description: ${chapterOutline.description}
Key Points to Cover: ${chapterOutline.keyPoints.join(', ')}

Book Context: ${bookContext}

Requirements:
- Write 2000-3000 words
- Use clear structure with headings and subheadings
- Include practical examples and actionable advice
- Write in a professional, engaging tone
- Make it valuable and informative
- Use markdown formatting
- Include real-world applications and case studies

Return ONLY the chapter content in markdown format.`;

    return await this.callAIWithQueue(prompt, 'chapter');
  }

  async generateContent(prompt, selectedProvider = null, maxTokens = 4000) {
    if (selectedProvider) {
      // Use specific provider if provided - NO QUEUE
      return await this.callProvider(selectedProvider, prompt, 'content', maxTokens);
    } else {
      // Fall back to queue if no specific provider
      return await this.callAIWithQueue(prompt, 'content');
    }
  }

  async callAIWithQueue(prompt, type, maxRetries = 3) {
    let lastError = null;
    let attempts = 0;
    
    // Try up to maxRetries times with different providers
    while (attempts < maxRetries && attempts < this.queue.length) {
      const provider = this.getNextProvider();
      attempts++;
      
      try {
        console.log(`🚀 Attempt ${attempts}: Using ${provider.toUpperCase()} for ${type}`);
        
        const result = await this.callProvider(provider, prompt, type);
        this.markProviderUsed(provider, true);
        
        console.log(`✅ ${provider.toUpperCase()} succeeded for ${type}`);
        return result;
        
      } catch (error) {
        console.error(`❌ ${provider.toUpperCase()} failed:`, error.message);
        this.markProviderUsed(provider, false);
        lastError = error;
        
        // Continue to next provider
        continue;
      }
    }
    
    // All providers failed
    throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  async callProvider(providerKey, prompt, type, maxTokens = 4000) {
    console.log(`🔍 AI Service callProvider called with: ${providerKey}`);
    console.log(`🔍 Available providers:`, Object.keys(this.providers));
    
    // Get config directly using provider key - NO FALLBACK BULLSHIT
    const config = this.providers[providerKey];

    if (!config) {
      console.error(`❌ Provider '${providerKey}' not found in active providers`);
      console.error(`❌ Available providers:`, Object.keys(this.providers));
      throw new Error(`Provider '${providerKey}' is not active or not configured. Available providers: ${Object.keys(this.providers).join(', ')}`);
    }

    if (!config.available) {
      console.error(`❌ Provider '${providerKey}' is marked as unavailable`);
      throw new Error(`Provider '${providerKey}' is currently unavailable. Check API key and configuration.`);
    }

    if (!config.apiKey) {
      console.error(`❌ Provider '${providerKey}' has no API key`);
      throw new Error(`Provider '${providerKey}' has no API key configured.`);
    }
    
    // DIRECT CALL - NO QUEUE, NO ROUND ROBIN
    return await this.callProviderDynamic(providerKey, prompt, type, config, maxTokens);
  }

  async callProviderDynamic(providerKey, prompt, type, config, maxTokens = 4000) {
    if (!config || !config.apiKey) {
      throw new Error(`No API key configured for ${providerKey}`);
    }

    // Use the stored provider type for API calls
    const providerType = config.providerType;
    if (!providerType) {
      throw new Error(`Provider type not found for ${providerKey}`);
    }

    // Use hardcoded logic based on provider type (no database columns needed)
    const requestConfig = this.buildRequestConfig(providerType, config.apiKey);
    let endpoint = this.getEndpoint(providerType, config.apiKey, config.model);
    const requestBody = this.buildRequestBody(providerType, prompt, config, maxTokens);

    console.log(`🔍 Calling ${providerType} API with endpoint: ${endpoint.replace(/\?key=[^&]+/, '?key=***')}`);
    console.log(`🔍 Model: ${config.model || 'default'}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: requestConfig.headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      console.error(`❌ ${providerType} API error: ${response.status} - ${errorMsg}`);
      console.error(`❌ Attempted endpoint: ${endpoint.replace(/\?key=[^&]+/, '?key=***')}`);
      console.error(`❌ Model used: ${config.model}`);
      throw new Error(`${providerType} API error: ${response.status} - ${errorMsg}`);
    }

    const data = await response.json();
    
    // VALIDATE RESPONSE BEFORE EXTRACTION
    console.log(`🔍 Validating ${providerType} response...`)
    const validation = aiResponseValidator.validateResponse(data, type || 'content')
    
    if (!validation.isValid) {
      const errorReport = aiResponseValidator.createErrorReport(validation)
      console.error(`❌ ${providerType} response validation failed:`, errorReport)
      
      const errorMessage = validation.errors
        .map(e => `${e.code}: ${e.message}`)
        .join('; ')
      
      throw new Error(`${providerType} returned invalid content: ${errorMessage}`)
    }
    
    console.log(`✅ ${providerType} response validated`)
    const content = validation.content

    return this.parseResponse(content, type, data);
  }

  buildRequestConfig(providerType, apiKey) {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Add auth header based on provider type
    switch (providerType) {
      case 'anthropic':
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case 'gemini':
        // Gemini uses API key in URL, not headers
        break;
      case 'elevenlabs':
        headers['xi-api-key'] = apiKey;
        break;
      case 'openai':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      default:
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    return { headers };
  }

  getEndpoint(providerType, apiKey = null, model = null) {
    switch (providerType) {
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions';
      case 'mistral':
        return 'https://api.mistral.ai/v1/chat/completions';
      case 'gemini':
        // Gemini requires full API URL with model and API key in query parameter
        const geminiModel = model || 'gemini-1.5-pro';
        return `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
      case 'anthropic':
        return 'https://api.anthropic.com/v1/messages';
      case 'perplexity':
        return 'https://api.perplexity.ai/chat/completions';
      case 'grok':
        return 'https://api.x.ai/v1/chat/completions';
      case 'cohere':
        return 'https://api.cohere.ai/v1/chat';
      default:
        return `https://api.${providerType}.com/v1/chat/completions`;
    }
  }

  buildRequestBody(providerType, prompt, config, maxTokens = 4000) {
    const baseBody = {
      model: config.model,
      max_tokens: maxTokens,
      temperature: 0.7
    };

    switch (providerType) {
      case 'gemini':
        return {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.7
          }
        };
      case 'anthropic':
        return {
          model: config.model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }]
        };
      case 'stability':
        return {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 20
        };
      case 'elevenlabs':
        return {
          text: prompt,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        };
      default:
        return {
          ...baseBody,
          messages: [{ role: 'user', content: prompt }]
        };
    }
  }

  extractContent(data, providerType) {
    // Extract content based on provider type
    switch (providerType) {
      case 'openai':
      case 'mistral':
      case 'perplexity':
      case 'grok':
        return data.choices?.[0]?.message?.content || 'No content generated';
      case 'gemini':
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated';
      case 'anthropic':
        return data.content?.[0]?.text || 'No content generated';
      case 'cohere':
        return data.generations?.[0]?.text || 'No content generated';
      case 'stability':
        return data.artifacts?.[0]?.base64 || 'No content generated';
      case 'elevenlabs':
        return data.audio_url || 'No content generated';
      case 'huggingface':
        return data[0]?.generated_image || 'No content generated';
      case 'craiyon':
      case 'modelslab':
        return data.images?.[0] || 'No content generated';
      default:
        return data.choices?.[0]?.message?.content || data.content?.[0]?.text || data.text || 'No content generated';
    }
  }

  parseResponse(content, type, fullResponse = null) {
    if (type === 'outline') {
      try {
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract valid JSON from AI response');
        }
      } catch (parseError) {
        throw new Error('AI did not return valid JSON format for outline');
      }
    } else if (type === 'chapter') {
      return {
        content: content,
        wordCount: content.split(' ').length
      };
    } else {
      // ALWAYS return full response object with usage data for content generation
      if (fullResponse && typeof fullResponse === 'object') {
        return {
          content: content,
          usage: fullResponse.usage,
          token_count: fullResponse.token_count,
          ...fullResponse
        };
      } else {
        return content;
      }
    }
  }

  // Status and info methods
  hasAnyProvider() {
    return this.queue.length > 0;
  }

  getAvailableProviders() {
    return this.queue;
  }

  getProviderInfo() {
    return {
      queue: this.queue,
      available: this.queue.length,
      total: Object.keys(this.providers).length,
      next: this.queue[this.currentIndex % this.queue.length] || null,
      status: Object.keys(this.providers).reduce((acc, provider) => {
        acc[provider] = {
          available: this.providers[provider].available,
          hasKey: !!this.providers[provider].apiKey,
          failures: this.providers[provider].failures,
          lastUsed: this.providers[provider].lastUsed
        };
        return acc;
      }, {})
    };
  }

  // Debug method to check Supabase connection
  async testSupabaseConnection() {
    try {
      console.log('🧪 Testing Supabase connection...');
      const { data, error } = await getSupabase().from('ai_providers').select('count').limit(1);
      
      if (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
      }
      
      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('💥 Supabase connection error:', error);
      return false;
    }
  }
}

const aiService = new AIService()
module.exports = { aiService, AIService }
module.exports = aiService

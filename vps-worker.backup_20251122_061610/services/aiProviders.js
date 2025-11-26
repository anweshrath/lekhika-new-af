const logger = require('../utils/logger');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

// Dynamic provider mapping based on common patterns
const PROVIDER_MAPPINGS = {
  'openai': 'openai',
  'anthropic': 'anthropic', 
  'claude': 'anthropic',
  'google': 'google',
  'gemini': 'google',
  'mistral': 'mistral',
  'elevenlabs': 'elevenlabs'
};

// Dynamic client creation based on provider type
async function createProviderClient(provider) {
  try {
    logger.info(`Creating client for provider: ${provider.name} (type: ${provider.provider})`);
    
    // Map provider name to actual client type
    const clientType = PROVIDER_MAPPINGS[provider.provider.toLowerCase()] || provider.provider.toLowerCase();
    
    switch (clientType) {
      case 'openai':
        return new OpenAI({
          apiKey: provider.api_key,
          dangerouslyAllowBrowser: false
        });
        
      case 'anthropic':
        return new Anthropic({
          apiKey: provider.api_key
        });
        
      case 'google':
        return new GoogleGenerativeAI(provider.api_key);
        
      case 'mistral':
        // Mistral uses OpenAI-compatible API
        return new OpenAI({
          apiKey: provider.api_key,
          baseURL: 'https://api.mistral.ai/v1',
          dangerouslyAllowBrowser: false
        });
        
      case 'elevenlabs':
        // ElevenLabs doesn't need a client object, just return the API key
        return { apiKey: provider.api_key };
        
      default:
        logger.warn(`Unknown provider type: ${clientType}, attempting OpenAI-compatible API`);
        return new OpenAI({
          apiKey: provider.api_key,
          baseURL: `https://api.${provider.provider.toLowerCase()}.com/v1`,
          dangerouslyAllowBrowser: false
        });
    }
  } catch (error) {
    logger.error(`Failed to create client for provider ${provider.name}:`, error);
    throw error;
  }
}

// Dynamic AI request handling
async function makeAIRequest(provider, model, messages, options = {}) {
  try {
    const client = await createProviderClient(provider);
    const clientType = PROVIDER_MAPPINGS[provider.provider.toLowerCase()] || provider.provider.toLowerCase();
    
    logger.info(`Making AI request to ${provider.name} (${clientType}) with model ${model}`);
    
    switch (clientType) {
      case 'openai':
      case 'mistral':
        const response = await client.chat.completions.create({
          model: model,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 4000
        });
        return {
          content: response.choices[0].message.content,
          usage: response.usage,
          model: response.model
        };
        
      case 'anthropic':
        const anthropicResponse = await client.messages.create({
          model: model,
          max_tokens: options.max_tokens || 4000,
          temperature: options.temperature || 0.7,
          messages: messages
        });
        return {
          content: anthropicResponse.content[0].text,
          usage: anthropicResponse.usage,
          model: anthropicResponse.model
        };
        
      case 'google':
        const genAI = client;
        const googleModel = genAI.getGenerativeModel({ model: model });
        const googleResponse = await googleModel.generateContent({
          contents: messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }]
          }))
        });
        return {
          content: googleResponse.response.text(),
          usage: googleResponse.response.usageMetadata,
          model: model
        };
        
      case 'elevenlabs':
        // ElevenLabs is for TTS, not text generation
        throw new Error('ElevenLabs is not supported for text generation');
        
      default:
        // Try OpenAI-compatible API
        logger.info(`Attempting OpenAI-compatible API for ${provider.name}`);
        const defaultResponse = await client.chat.completions.create({
          model: model,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 4000
        });
        return {
          content: defaultResponse.choices[0].message.content,
          usage: defaultResponse.usage,
          model: defaultResponse.model
        };
    }
  } catch (error) {
    logger.error(`AI request failed for ${provider.name}:`, error);
    throw error;
  }
}

module.exports = {
  createProviderClient,
  makeAIRequest
};
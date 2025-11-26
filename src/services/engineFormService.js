import { supabase } from '../lib/supabase'
// Migrate to canonical variables – SINGLE SOURCE OF TRUTH
// Alias names to avoid broad refactors in this file
import ULTIMATE_VARIABLES_DEFAULT, { STANDARD_OPTIONS as ULTIMATE_STANDARD_OPTIONS } from '../data/ULTIMATE_MASTER_VARIABLES.js'

class EngineFormService {
  constructor() {
    // Get Supabase URL from environment and construct Edge Function URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    
    if (supabaseUrl && supabaseUrl.includes('.supabase.co')) {
      // Use Supabase Edge Function URL
      this.baseURL = `${supabaseUrl}/functions/v1/engines-api`
      console.log('✅ Engine API URL:', this.baseURL)
    } else {
      // Fallback to local proxy for development
      this.baseURL = '/engines-api'
      console.warn('⚠️ Using local proxy for engines-api')
    }
  }

  /**
   * Get user's assigned engines
   */
  async getUserEngines(userId) {
    try {
      const { data, error } = await supabase
        .from('user_engines')
        .select(`
          *,
          ai_engines (
            id,
            name,
            description,
            nodes,
            edges,
            metadata
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error) throw error

      return data?.map(userEngine => ({
        ...userEngine,
        engine: userEngine.ai_engines
      })) || []
    } catch (error) {
      console.error('Error fetching user engines:', error)
      throw error
    }
  }

  /**
   * Get engine form configuration from engine's input node
   */
  getEngineFormConfig(engine) {
    try {
      if (!engine?.nodes) {
        throw new Error('Engine has no nodes')
      }

      // Parse nodes if it's a JSON string
      let nodes = engine.nodes
      if (typeof nodes === 'string') {
        nodes = JSON.parse(nodes)
      }

      // Find the input node
      const inputNode = nodes.find(node => 
        node.type === 'input' || 
        node.data?.type === 'input' ||
        node.id?.includes('input')
      )

      // If no input node found, create a default one with basic fields
      if (!inputNode) {
        console.warn('No input node found in engine, creating default input configuration')
        
        // Create a default input configuration based on engine type
        const defaultInputFields = this.getDefaultInputFields(engine)
        
        return {
          engineId: engine.id,
          engineName: engine.name,
          engineDescription: engine.description,
          inputFields: defaultInputFields,
          validation: {},
          instructions: engine.description || 'Please provide the required information to generate your content.',
          aiEnabled: true,
          maxTokens: 4000
        }
      }

      // Extract form configuration from existing input node
      let inputFields = inputNode.data?.inputFields || this.getDefaultInputFields(engine)
      
      // CRITICAL: Resolve optionsSource to actual options for each field
      inputFields = inputFields.map(field => {
        if (field.optionsSource && !field.options) {
          // Get options from ULTIMATE_STANDARD_OPTIONS using optionsSource
          const options = ULTIMATE_STANDARD_OPTIONS[field.optionsSource]
          if (options && Array.isArray(options)) {
            return {
              ...field,
              options: options
            }
          }
        }
        return field
      })
      
      const formConfig = {
        engineId: engine.id,
        engineName: engine.name,
        engineDescription: engine.description,
        inputFields,
        validation: inputNode.data?.validation || {},
        instructions: inputNode.data?.instructions || engine.description || 'Please provide the required information.',
        aiEnabled: inputNode.data?.aiEnabled !== undefined ? inputNode.data.aiEnabled : true,
        maxTokens: inputNode.data?.maxTokens || 4000
      }

      return formConfig
    } catch (error) {
      console.error('Error getting engine form config:', error)
      throw error
    }
  }

  /**
   * Get default input fields using MASTER VARIABLE SYSTEM
   * Surgically clean, no hardcoded values, all from master variables
   */
  getDefaultInputFields(engine) {
    const engineName = engine.name?.toLowerCase() || ''
    const engineDescription = engine.description?.toLowerCase() || ''
    
    // Get core universal fields that every engine needs
    const coreFields = this.getCoreFields()
    
    // Get specialized fields based on engine type
    let specializedFields = []
    
    if (engineName.includes('book') || engineDescription.includes('book')) {
      specializedFields = this.getBookFields()
    } else if (engineName.includes('business') || engineName.includes('report') || engineName.includes('analysis')) {
      specializedFields = this.getBusinessFields()
    } else if (engineName.includes('story') || engineName.includes('creative') || engineName.includes('fiction')) {
      specializedFields = this.getCreativeFields()
    } else if (engineName.includes('content') || engineDescription.includes('content')) {
      specializedFields = this.getContentFields()
    } else {
      specializedFields = this.getUniversalFields()
    }
    
    return [...coreFields, ...specializedFields].filter(field => field !== null)
  }

  /**
   * Get core fields that every engine needs
   */
  getCoreFields() {
    return [
      this.convertMasterVariableToField('book_title'),
      this.convertMasterVariableToField('topic'),
      this.convertMasterVariableToField('custom_instructions')
    ]
  }

  /**
   * Get fields for book/content creation engines
   */
  getBookFields() {
    return [
      this.convertMasterVariableToField('author_name'),
      this.convertMasterVariableToField('subtitle'),
      this.convertMasterVariableToField('genre'),
      this.convertMasterVariableToField('target_audience'),
      this.convertMasterVariableToField('word_count'),
      this.convertMasterVariableToField('chapter_count'),
      this.convertMasterVariableToField('tone'),
      this.convertMasterVariableToField('writing_style'),
      this.convertMasterVariableToField('include_case_studies'),
      this.convertMasterVariableToField('include_examples'),
      this.convertMasterVariableToField('output_formats')
    ]
  }

  /**
   * Get fields for business/report engines
   */
  getBusinessFields() {
    return [
      this.convertMasterVariableToField('industry_focus'),
      this.convertMasterVariableToField('business_model'),
      this.convertMasterVariableToField('target_audience'),
      this.convertMasterVariableToField('content_depth'),
      this.convertMasterVariableToField('tone'),
      this.convertMasterVariableToField('include_case_studies'),
      this.convertMasterVariableToField('include_diagrams'),
      this.convertMasterVariableToField('output_formats')
    ]
  }

  /**
   * Get fields for creative/story engines
   */
  getCreativeFields() {
    return [
      this.convertMasterVariableToField('author_name'),
      this.convertMasterVariableToField('genre'),
      this.convertMasterVariableToField('target_audience'),
      this.convertMasterVariableToField('word_count'),
      this.convertMasterVariableToField('tone'),
      this.convertMasterVariableToField('writing_style'),
      this.convertMasterVariableToField('accent'),
      this.convertMasterVariableToField('output_formats')
    ]
  }

  /**
   * Get fields for general content engines
   */
  getContentFields() {
    return [
      this.convertMasterVariableToField('target_audience'),
      this.convertMasterVariableToField('tone'),
      this.convertMasterVariableToField('writing_style'),
      this.convertMasterVariableToField('content_depth'),
      this.convertMasterVariableToField('output_formats')
    ]
  }

  /**
   * Get universal fields for general engines
   */
  getUniversalFields() {
    return [
      this.convertMasterVariableToField('target_audience'),
      this.convertMasterVariableToField('tone'),
      this.convertMasterVariableToField('content_depth'),
      this.convertMasterVariableToField('output_formats')
    ]
  }

  /**
   * Convert master variable definition to form field format
   * This ensures consistency and eliminates hardcoded values
   */
  convertMasterVariableToField(variableKey) {
    const masterVar = ULTIMATE_VARIABLES_DEFAULT[variableKey]
    if (!masterVar) {
      console.warn(`Master variable '${variableKey}' not found`)
      return null
    }

    const field = {
      id: variableKey,
      name: variableKey,
      variable: variableKey,
      label: masterVar.name,
      type: masterVar.type,
      required: masterVar.required,
      placeholder: masterVar.placeholder,
      description: masterVar.description,
      category: masterVar.category,
      validation: masterVar.validation
    }

    // Handle options for select/multiselect fields
    if (masterVar.options && Array.isArray(masterVar.options)) {
      field.options = masterVar.options // SURGICAL FIX: Return full objects for proper value matching
    } else if (typeof masterVar.options === 'string') {
      const opts = ULTIMATE_STANDARD_OPTIONS[masterVar.options]
      if (Array.isArray(opts)) {
        field.options = opts // SURGICAL FIX: Return full option objects, not mapped labels
      }
    }

    // Handle multiselect type mapping
    if (masterVar.type === 'multiselect') {
      field.type = 'multiselect'
      field.multiple = true
    }

    return field
  }

  /**
   * Validate form data against engine requirements
   */
  validateFormData(formData, formConfig) {
    const errors = {}
    const { inputFields, validation } = formConfig

    // Validate required fields
    inputFields.forEach(field => {
      const value = formData[field.variable]
      
      // Handle different field types for required validation
      if (field.required) {
        if (field.type === 'multiselect' || field.multiple) {
          // For multiselect/multiple fields, check if array is empty
          if (!value || !Array.isArray(value) || value.length === 0) {
            errors[field.variable] = `${field.label || field.name} is required`
          }
        } else if (field.type === 'checkbox') {
          // For checkboxes, check if it's true
          if (!value) {
            errors[field.variable] = `${field.label || field.name} is required`
          }
        } else {
          // For text/string fields, check if empty or only whitespace
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[field.variable] = `${field.label || field.name} is required`
          }
        }
      }
    })

    // Validate field types
    inputFields.forEach(field => {
      const value = formData[field.variable]
      if (value) {
        switch (field.type) {
          case 'email':
            if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors[field.variable] = 'Please enter a valid email address'
            }
            break
          case 'number':
            if (isNaN(Number(value))) {
              errors[field.variable] = 'Please enter a valid number'
            }
            break
          case 'url':
            if (typeof value === 'string') {
              try {
                new URL(value)
              } catch {
                errors[field.variable] = 'Please enter a valid URL'
              }
            }
            break
        }
      }
    })

    // Custom validation rules
    if (validation) {
      Object.entries(validation).forEach(([field, rules]) => {
        const value = formData[field]
        if (value) {
          if (rules.minLength && value.length < rules.minLength) {
            errors[field] = `Minimum length is ${rules.minLength} characters`
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            errors[field] = `Maximum length is ${rules.maxLength} characters`
          }
          if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
            errors[field] = rules.message || 'Invalid format'
          }
        }
      })
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Submit form data to engine API
   */
  async submitFormData(formData, engineId, userApiKey) {
    try {
      console.log('📤 Submitting to engine API:', {
        url: `${this.baseURL}/${engineId}/execute`,
        engineId,
        hasApiKey: !!userApiKey
      })
      
      const response = await fetch(`${this.baseURL}/${engineId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userApiKey}`,
          'X-API-Key': userApiKey
        },
        body: JSON.stringify({
          userInput: formData,
          options: {
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        throw new Error(errorData.error || errorData.message || `API request failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Engine API response:', result)
      return result
    } catch (error) {
      console.error('❌ Error submitting form data:', error)
      throw error
    }
  }

  /**
   * Get user's API key for an engine
   */
  async getUserApiKey(userId, engineId) {
    try {
      const { data, error } = await supabase
        .from('engine_api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .eq('engine_id', engineId)
        .single()

      if (error) throw error
      return data?.api_key
    } catch (error) {
      console.error('Error fetching user API key:', error)
      throw error
    }
  }

  /**
   * Get execution history for user
   */
  async getExecutionHistory(userId, engineId = null) {
    try {
      let query = supabase
        .from('engine_executions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (engineId) {
        query = query.eq('engine_id', engineId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching execution history:', error)
      throw error
    }
  }
}

export const engineFormService = new EngineFormService()

import { INPUT_OPTIONS } from '../data/inputOptions';

class FormGeneratorService {
  constructor() {
    this.inputOptions = INPUT_OPTIONS;
  }

  /**
   * Extract input fields from a flow's input node
   */
  extractInputFieldsFromFlow(flow) {
    const inputNode = flow.nodes?.find(node => node.type === 'input');
    
    if (!inputNode || !inputNode.data?.inputFields) {
      return [];
    }

    return inputNode.data.inputFields.map(field => this.enhanceField(field));
  }

  /**
   * Enhance field with additional properties for form generation
   */
  enhanceField(field) {
    const enhanced = {
      ...field,
      required: field.required || false,
      description: this.getFieldDescription(field.variable),
      options: this.getFieldOptions(field.variable, field.optionsSource),
      validation: this.getFieldValidation(field.variable, field.type)
    };

    return enhanced;
  }

  /**
   * Get field description based on variable name
   */
  getFieldDescription(variable) {
    const descriptions = {
      book_title: "The main title of your book or content piece",
      topic: "The primary subject or theme of your content",
      book_type: "The type of content you want to create",
      niche: "The industry or category your content belongs to",
      target_audience: "Who this content is intended for",
      word_count: "Approximate number of words for your content",
      chapter_count: "Number of chapters or sections to include",
      tone: "The writing style and voice for your content",
      accent: "The English dialect or regional variation",
      writing_style: "The overall approach to writing",
      include_images: "Whether to include images in your content",
      cover_image_option: "Cover image generation preference",
      cover_image_style: "Visual style for cover images",
      branding_style: "Your brand's visual identity",
      author_name: "Name of the content author",
      author_bio: "Brief biography of the author",
      author_expertise: "Author's area of expertise",
      publishing_goals: "What you want to achieve with this content",
      marketing_strategy: "How you plan to promote this content",
      distribution_channels: "Where you'll share or sell this content"
    };

    return descriptions[variable] || `Enter ${variable.replace(/_/g, ' ')}`;
  }

  /**
   * Get field options based on variable name and source
   */
  getFieldOptions(variable, optionsSource) {
    // If field already has options, use them
    if (optionsSource && this.inputOptions[optionsSource]) {
      return this.inputOptions[optionsSource];
    }

    // Default options based on variable name
    const defaultOptions = {
      book_type: this.inputOptions.bookTypes || [
        { id: 'ebook', name: 'eBook' },
        { id: 'guide', name: 'How-To Guide' },
        { id: 'manual', name: 'Training Manual' },
        { id: 'workbook', name: 'Interactive Workbook' }
      ],
      niche: this.inputOptions.niches || [
        'business', 'technology', 'self-help', 'finance', 
        'marketing', 'leadership', 'productivity', 'entrepreneurship'
      ],
      tone: this.inputOptions.tones || [
        { id: 'professional', name: 'Professional' },
        { id: 'conversational', name: 'Conversational' },
        { id: 'academic', name: 'Academic' },
        { id: 'inspirational', name: 'Inspirational' }
      ],
      accent: this.inputOptions.accents || [
        { id: 'american', name: 'American English' },
        { id: 'british', name: 'British English' },
        { id: 'neutral', name: 'Neutral International' }
      ],
      cover_image_option: [
        { id: 'generate', name: 'Generate AI Cover' },
        { id: 'upload', name: 'Upload Custom Image' },
        { id: 'none', name: 'No Cover Image' }
      ],
      cover_image_style: [
        { id: 'modern', name: 'Modern & Clean' },
        { id: 'vintage', name: 'Vintage & Classic' },
        { id: 'minimalist', name: 'Minimalist' },
        { id: 'bold', name: 'Bold & Colorful' }
      ],
      branding_style: [
        { id: 'corporate', name: 'Corporate & Professional' },
        { id: 'creative', name: 'Creative & Artistic' },
        { id: 'tech', name: 'Tech & Modern' },
        { id: 'lifestyle', name: 'Lifestyle & Personal' }
      ]
    };

    return defaultOptions[variable] || [];
  }

  /**
   * Get field validation rules
   */
  getFieldValidation(variable, type) {
    const validations = {
      word_count: { min: 100, max: 100000 },
      chapter_count: { min: 1, max: 50 },
      book_title: { minLength: 3, maxLength: 100 },
      topic: { minLength: 5, maxLength: 200 },
      author_name: { minLength: 2, maxLength: 50 }
    };

    return validations[variable] || {};
  }

  /**
   * Generate form configuration from flow
   */
  generateFormConfig(flow) {
    const inputFields = this.extractInputFieldsFromFlow(flow);
    
    return {
      flowId: flow.id,
      flowName: flow.name || 'Content Creation Flow',
      flowDescription: flow.description || 'Generate amazing content with AI',
      inputFields: inputFields,
      sections: this.groupFieldsIntoSections(inputFields),
      metadata: {
        totalFields: inputFields.length,
        requiredFields: inputFields.filter(f => f.required).length,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Group fields into logical sections
   */
  groupFieldsIntoSections(inputFields) {
    const sectionMap = {
      basic: ['book_title', 'topic', 'book_type', 'niche', 'target_audience'],
      content: ['word_count', 'chapter_count', 'tone', 'accent', 'writing_style'],
      advanced: ['include_images', 'cover_image_option', 'cover_image_style', 'branding_style'],
      author: ['author_name', 'author_bio', 'author_expertise'],
      publishing: ['publishing_goals', 'marketing_strategy', 'distribution_channels']
    };

    const sections = {};
    
    Object.entries(sectionMap).forEach(([sectionName, fieldVariables]) => {
      const sectionFields = inputFields.filter(field => 
        fieldVariables.includes(field.variable)
      );
      
      if (sectionFields.length > 0) {
        sections[sectionName] = sectionFields;
      }
    });

    return sections;
  }

  /**
   * Validate form data against field requirements
   */
  validateFormData(formData, inputFields) {
    const errors = {};
    
    inputFields.forEach(field => {
      const value = formData[field.variable];
      
      // Required field validation
      if (field.required && (!value || value.toString().trim() === '')) {
        errors[field.variable] = `${field.name} is required`;
        return;
      }
      
      // Type-specific validation
      if (value && field.type === 'number') {
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
          errors[field.variable] = `${field.name} must be a valid number`;
        } else if (field.validation?.min && numValue < field.validation.min) {
          errors[field.variable] = `${field.name} must be at least ${field.validation.min}`;
        } else if (field.validation?.max && numValue > field.validation.max) {
          errors[field.variable] = `${field.name} must be at most ${field.validation.max}`;
        }
      }
      
      if (value && field.type === 'text') {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          errors[field.variable] = `${field.name} must be at least ${field.validation.minLength} characters`;
        } else if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          errors[field.variable] = `${field.name} must be at most ${field.validation.maxLength} characters`;
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  /**
   * Transform form data to workflow input format
   */
  transformFormDataToWorkflowInput(formData, inputFields) {
    const workflowInput = {};
    
    inputFields.forEach(field => {
      const value = formData[field.variable];
      
      if (value !== undefined && value !== null && value !== '') {
        // Transform based on field type
        switch (field.type) {
          case 'number':
            workflowInput[field.variable] = parseInt(value);
            break;
          case 'boolean':
            workflowInput[field.variable] = Boolean(value);
            break;
          default:
            workflowInput[field.variable] = value.toString().trim();
        }
      }
    });
    
    return workflowInput;
  }
}

export const formGeneratorService = new FormGeneratorService();

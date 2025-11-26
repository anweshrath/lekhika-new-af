/**
 * ALCHEMIST VARIABLES
 * Dedicated variable system for Alchemist Flows
 * All variables end with _alc to avoid conflicts with main ai_flows
 */

export const alchemistVariables = {
  // INPUT NODE VARIABLES
  input: {
    topic_alc: {
      name: 'Topic',
      type: 'text',
      required: true,
      description: 'Main topic or subject for content creation',
      placeholder: 'Enter the main topic...',
      validation: {
        minLength: 3,
        maxLength: 200,
        pattern: /^[a-zA-Z0-9\s\-_.,!?]+$/
      },
      instructions: 'Provide a clear, specific topic that defines the content focus. Avoid vague or overly broad topics.',
      testInput: 'Digital Marketing Strategies for Small Businesses'
    },
    
    target_audience_alc: {
      name: 'Target Audience',
      type: 'select',
      required: true,
      description: 'Primary audience for the content',
      options: [
        'Small Business Owners',
        'Marketing Professionals',
        'Content Creators',
        'Entrepreneurs',
        'Students',
        'General Public',
        'Industry Experts',
        'Consumers',
        'B2B Clients',
        'B2C Customers'
      ],
      instructions: 'Select the primary audience that will consume this content. This affects tone, complexity, and examples used.',
      testInput: 'Small Business Owners'
    },
    
    content_tone_alc: {
      name: 'Content Tone',
      type: 'select',
      required: true,
      description: 'Tone and style for the content',
      options: [
        'Professional',
        'Conversational',
        'Authoritative',
        'Friendly',
        'Technical',
        'Educational',
        'Persuasive',
        'Inspirational',
        'Casual',
        'Formal'
      ],
      instructions: 'Choose the tone that best matches your brand voice and audience expectations.',
      testInput: 'Professional'
    },
    
    word_count_alc: {
      name: 'Word Count',
      type: 'number',
      required: true,
      description: 'Desired word count for the content',
      min: 100,
      max: 10000,
      step: 50,
      instructions: 'Specify the target word count. Consider your audience attention span and content depth needs.',
      testInput: 1500
    },
    
    keywords_alc: {
      name: 'Keywords',
      type: 'textarea',
      required: false,
      description: 'Primary keywords to include in the content',
      placeholder: 'Enter keywords separated by commas...',
      instructions: 'List relevant keywords that should be naturally incorporated into the content for SEO purposes.',
      testInput: 'digital marketing, small business, online presence, social media marketing'
    },
    
    content_purpose_alc: {
      name: 'Content Purpose',
      type: 'select',
      required: true,
      description: 'Primary purpose of the content',
      options: [
        'Educate',
        'Inform',
        'Persuade',
        'Entertain',
        'Convert',
        'Build Authority',
        'Generate Leads',
        'Increase Engagement',
        'Drive Sales',
        'Brand Awareness'
      ],
      instructions: 'Define the main objective this content should achieve for your business or audience.',
      testInput: 'Educate'
    },
    
    industry_focus_alc: {
      name: 'Industry Focus',
      type: 'text',
      required: false,
      description: 'Specific industry or niche focus',
      placeholder: 'e.g., Healthcare, Technology, Finance...',
      instructions: 'Specify the industry or niche to tailor content examples and terminology appropriately.',
      testInput: 'Technology'
    },
    
    content_format_alc: {
      name: 'Content Format',
      type: 'select',
      required: true,
      description: 'Desired content format',
      options: [
        'Blog Post',
        'Article',
        'Social Media Post',
        'Email Newsletter',
        'Sales Page',
        'Landing Page',
        'Product Description',
        'Case Study',
        'White Paper',
        'Press Release'
      ],
      instructions: 'Select the specific format that best serves your content distribution strategy.',
      testInput: 'Blog Post'
    },
    
    writing_tone_alc: {
      name: 'Writing Tone',
      type: 'select',
      required: true,
      description: 'Specific tone and personality for content',
      options: [
        'Professional & Authoritative',
        'Conversational & Friendly',
        'Technical & Detailed',
        'Persuasive & Sales-focused',
        'Educational & Informative',
        'Inspirational & Motivational',
        'Casual & Relatable',
        'Formal & Academic',
        'Humorous & Witty',
        'Empathetic & Supportive'
      ],
      instructions: 'Choose the tone that matches your brand personality and resonates with your target audience.',
      testInput: 'Professional & Authoritative'
    },
    
    content_series_alc: {
      name: 'Content Series',
      type: 'select',
      required: true,
      description: 'Single post or series of posts',
      options: [
        'Single Post',
        'Series - Sequential',
        'Series - Standalone',
        'Series - Tutorial',
        'Series - Case Study',
        'Series - Opinion',
        'Series - News',
        'Series - Review'
      ],
      instructions: 'Decide if this is a single post or part of a series. Sequential series create cliffhangers between posts.',
      testInput: 'Single Post'
    },
    
    series_structure_alc: {
      name: 'Series Structure',
      type: 'select',
      required: false,
      description: 'How series posts should be structured',
      options: [
        'Sequential with Cliffhangers',
        'Sequential without Cliffhangers',
        'Standalone but Related',
        'Progressive Difficulty',
        'Different Perspectives',
        'Chronological Order',
        'Topic-based Chapters',
        'Problem-Solution Flow'
      ],
      instructions: 'Define how posts in a series should connect and flow together.',
      testInput: 'Sequential with Cliffhangers'
    },
    
    post_count_alc: {
      name: 'Number of Posts',
      type: 'number',
      required: false,
      description: 'Total number of posts in the series',
      min: 1,
      max: 50,
      step: 1,
      instructions: 'Specify how many posts should be created for this series.',
      testInput: 5
    },
    
    current_post_alc: {
      name: 'Current Post Number',
      type: 'number',
      required: false,
      description: 'Which post in the series this is',
      min: 1,
      max: 50,
      step: 1,
      instructions: 'If this is part of a series, specify which post number this is.',
      testInput: 1
    },
    
    brand_personality_alc: {
      name: 'Brand Personality',
      type: 'textarea',
      required: false,
      description: 'Detailed brand personality traits',
      placeholder: 'Describe your brand personality, values, and unique voice...',
      instructions: 'Provide detailed information about your brand personality, values, and unique voice to ensure content matches your brand.',
      testInput: 'Innovative, trustworthy, customer-focused, data-driven, professional yet approachable'
    },
    
    competitor_analysis_alc: {
      name: 'Competitor Analysis',
      type: 'textarea',
      required: false,
      description: 'Key competitors and their content strategies',
      placeholder: 'List main competitors and their content approaches...',
      instructions: 'Provide information about your main competitors and their content strategies to differentiate your content.',
      testInput: 'Competitor A focuses on technical depth, Competitor B uses humor, Competitor C emphasizes case studies'
    },
    
    content_goals_alc: {
      name: 'Content Goals',
      type: 'select',
      required: true,
      description: 'Primary goals for this content',
      options: [
        'Increase Brand Awareness',
        'Generate Leads',
        'Drive Sales',
        'Educate Audience',
        'Build Authority',
        'Improve SEO Rankings',
        'Increase Engagement',
        'Support Product Launch',
        'Address Customer Pain Points',
        'Share Industry Insights'
      ],
      instructions: 'Select the primary goal this content should achieve for your business.',
      testInput: 'Build Authority'
    },
    
    seo_focus_alc: {
      name: 'SEO Focus Keywords',
      type: 'textarea',
      required: false,
      description: 'Primary SEO keywords to target',
      placeholder: 'Enter primary and secondary keywords...',
      instructions: 'List the primary and secondary keywords you want to rank for with this content.',
      testInput: 'digital marketing strategies, small business marketing, online marketing tips'
    },
    
    content_freshness_alc: {
      name: 'Content Freshness',
      type: 'select',
      required: true,
      description: 'How current should the content be',
      options: [
        'Breaking News',
        'Very Recent (Last Week)',
        'Recent (Last Month)',
        'Current (Last 3 Months)',
        'Timeless/Evergreen',
        'Seasonal',
        'Trending Topic',
        'Industry Update'
      ],
      instructions: 'Specify how current and fresh the content should be based on your content strategy.',
      testInput: 'Timeless/Evergreen'
    }
  },

  // PROCESS NODE VARIABLES
  process: {
    content_type_alc: {
      name: 'Content Type',
      type: 'select',
      required: true,
      description: 'Type of content to generate',
      options: [
        'Educational Content',
        'Promotional Content',
        'Informational Content',
        'Entertainment Content',
        'News Content',
        'Review Content',
        'Tutorial Content',
        'Opinion Content',
        'Case Study Content',
        'Research Content'
      ],
      instructions: 'Specify the type of content that aligns with your marketing objectives and audience needs.',
      testInput: 'Educational Content'
    },
    
    writing_style_alc: {
      name: 'Writing Style',
      type: 'select',
      required: true,
      description: 'Preferred writing style',
      options: [
        'Academic',
        'Journalistic',
        'Creative',
        'Technical',
        'Conversational',
        'Persuasive',
        'Narrative',
        'Descriptive',
        'Analytical',
        'Instructional'
      ],
      instructions: 'Choose the writing style that best matches your brand voice and content objectives.',
      testInput: 'Conversational'
    },
    
    research_depth_alc: {
      name: 'Research Depth',
      type: 'select',
      required: true,
      description: 'Level of research required',
      options: [
        'Basic',
        'Moderate',
        'Comprehensive',
        'Expert Level',
        'Minimal'
      ],
      instructions: 'Determine how much research and fact-checking should be included in the content generation process.',
      testInput: 'Moderate'
    },
    
    quality_level_alc: {
      name: 'Quality Level',
      type: 'select',
      required: true,
      description: 'Desired content quality level',
      options: [
        'Draft',
        'Standard',
        'High',
        'Premium',
        'Expert'
      ],
      instructions: 'Set the quality standard that matches your brand reputation and audience expectations.',
      testInput: 'High'
    },
    
    include_examples_alc: {
      name: 'Include Examples',
      type: 'checkbox',
      required: false,
      description: 'Include real-world examples and case studies',
      instructions: 'Enable to include relevant examples, case studies, and practical applications in the content.',
      testInput: true
    },
    
    include_statistics_alc: {
      name: 'Include Statistics',
      type: 'checkbox',
      required: false,
      description: 'Include relevant statistics and data',
      instructions: 'Enable to incorporate relevant statistics, data points, and research findings.',
      testInput: true
    },
    
    call_to_action_alc: {
      name: 'Call to Action',
      type: 'text',
      required: false,
      description: 'Desired call-to-action for the content',
      placeholder: 'e.g., "Download our free guide", "Contact us today"...',
      instructions: 'Specify the action you want readers to take after consuming this content.',
      testInput: 'Download our free marketing guide'
    }
  },

  // CONDITION NODE VARIABLES
  condition: {
    condition_type_alc: {
      name: 'Condition Type',
      type: 'select',
      required: true,
      description: 'Type of condition to evaluate',
      options: [
        'Content Quality Check',
        'Word Count Validation',
        'Keyword Density Check',
        'Readability Score',
        'Sentiment Analysis',
        'Topic Relevance',
        'Brand Voice Consistency',
        'SEO Optimization',
        'Fact Verification',
        'Custom Logic'
      ],
      instructions: 'Select the type of condition that will determine the next step in your workflow.',
      testInput: 'Content Quality Check'
    },
    
    threshold_value_alc: {
      name: 'Threshold Value',
      type: 'number',
      required: true,
      description: 'Threshold value for condition evaluation',
      min: 0,
      max: 100,
      step: 1,
      instructions: 'Set the threshold value that will trigger the condition (e.g., quality score, word count, etc.).',
      testInput: 75
    },
    
    comparison_operator_alc: {
      name: 'Comparison Operator',
      type: 'select',
      required: true,
      description: 'How to compare the value against threshold',
      options: [
        'Greater Than (>)',
        'Less Than (<)',
        'Equal To (=)',
        'Greater Than or Equal (>=)',
        'Less Than or Equal (<=)',
        'Not Equal (!=)'
      ],
      instructions: 'Choose how the condition value should be compared against the threshold.',
      testInput: 'Greater Than or Equal (>=)'
    },
    
    action_type_alc: {
      name: 'Action Type',
      type: 'select',
      required: true,
      description: 'Action to take when condition is met',
      options: [
        'Continue to Next Node',
        'Send for Review',
        'Auto-approve',
        'Reject and Restart',
        'Send to Different Branch',
        'Flag for Manual Review',
        'Apply Additional Processing',
        'Skip to End',
        'Loop Back',
        'Custom Action'
      ],
      instructions: 'Define what should happen when the condition evaluates to true.',
      testInput: 'Continue to Next Node'
    },
    
    fallback_action_alc: {
      name: 'Fallback Action',
      type: 'select',
      required: true,
      description: 'Action to take when condition fails',
      options: [
        'Retry Processing',
        'Send for Manual Review',
        'Use Alternative Path',
        'Generate Error Report',
        'Skip Node',
        'Apply Default Settings',
        'Escalate to Human',
        'Log and Continue',
        'Stop Workflow',
        'Custom Fallback'
      ],
      instructions: 'Specify what should happen when the condition evaluates to false.',
      testInput: 'Send for Manual Review'
    }
  },

  // STRUCTURAL NODE VARIABLES
  structural: {
    blueprint_type_alc: {
      name: 'Blueprint Type',
      type: 'select',
      required: true,
      description: 'Type of structural blueprint to apply',
      options: [
        'Blog Post Structure',
        'Article Structure',
        'Sales Page Structure',
        'Email Sequence Structure',
        'Social Media Structure',
        'Landing Page Structure',
        'Product Description Structure',
        'Case Study Structure',
        'White Paper Structure',
        'Press Release Structure'
      ],
      instructions: 'Select the structural blueprint that best fits your content format and objectives.',
      testInput: 'Blog Post Structure'
    },
    
    content_hierarchy_alc: {
      name: 'Content Hierarchy',
      type: 'select',
      required: true,
      description: 'How content should be organized',
      options: [
        'Chronological',
        'Importance-Based',
        'Problem-Solution',
        'Cause-Effect',
        'Compare-Contrast',
        'Step-by-Step',
        'Top-Down',
        'Bottom-Up',
        'Narrative Flow',
        'Custom Structure'
      ],
      instructions: 'Choose the organizational structure that will guide how information is presented.',
      testInput: 'Problem-Solution'
    },
    
    section_count_alc: {
      name: 'Section Count',
      type: 'number',
      required: true,
      description: 'Number of main sections in the content',
      min: 3,
      max: 20,
      step: 1,
      instructions: 'Specify how many main sections the content should be divided into.',
      testInput: 5
    },
    
    include_intro_alc: {
      name: 'Include Introduction',
      type: 'checkbox',
      required: false,
      description: 'Include an introduction section',
      instructions: 'Enable to include a dedicated introduction section that hooks the reader.',
      testInput: true
    },
    
    include_conclusion_alc: {
      name: 'Include Conclusion',
      type: 'checkbox',
      required: false,
      description: 'Include a conclusion section',
      instructions: 'Enable to include a conclusion section that summarizes key points.',
      testInput: true
    },
    
    include_subheadings_alc: {
      name: 'Include Subheadings',
      type: 'checkbox',
      required: false,
      description: 'Include subheadings for better organization',
      instructions: 'Enable to break content into smaller, digestible sections with subheadings.',
      testInput: true
    },
    
    template_preference_alc: {
      name: 'Template Preference',
      type: 'select',
      required: false,
      description: 'Preferred template style',
      options: [
        'Modern',
        'Classic',
        'Minimalist',
        'Detailed',
        'Creative',
        'Professional',
        'Casual',
        'Academic',
        'Marketing-Focused',
        'Custom'
      ],
      instructions: 'Choose the template style that aligns with your brand and content goals.',
      testInput: 'Professional'
    }
  },

  // OUTPUT NODE VARIABLES
  output: {
    output_format_alc: {
      name: 'Output Format',
      type: 'select',
      required: true,
      description: 'Format for the final output',
      options: [
        'HTML',
        'Markdown',
        'Plain Text',
        'PDF',
        'Word Document',
        'JSON',
        'XML',
        'CSV',
        'Rich Text',
        'Custom Format'
      ],
      instructions: 'Select the format that best serves your content distribution and publishing needs.',
      testInput: 'HTML'
    },
    
    quality_level_alc: {
      name: 'Output Quality Level',
      type: 'select',
      required: true,
      description: 'Quality level for final output',
      options: [
        'Draft',
        'Standard',
        'High',
        'Premium',
        'Publication Ready'
      ],
      instructions: 'Set the final quality standard for the output before delivery.',
      testInput: 'High'
    },
    
    customization_options_alc: {
      name: 'Customization Options',
      type: 'textarea',
      required: false,
      description: 'Specific customization requirements',
      placeholder: 'Enter any specific formatting or customization requirements...',
      instructions: 'Specify any particular formatting, styling, or customization requirements for the output.',
      testInput: 'Include company branding, use specific color scheme, add contact information'
    },
    
    delivery_method_alc: {
      name: 'Delivery Method',
      type: 'select',
      required: true,
      description: 'How the output should be delivered',
      options: [
        'Direct Download',
        'Email Delivery',
        'Cloud Storage',
        'API Response',
        'Database Storage',
        'File System',
        'Content Management System',
        'Social Media Platform',
        'Website Publishing',
        'Custom Integration'
      ],
      instructions: 'Choose how the final output should be delivered to the end user or system.',
      testInput: 'Direct Download'
    },
    
    include_metadata_alc: {
      name: 'Include Metadata',
      type: 'checkbox',
      required: false,
      description: 'Include metadata with the output',
      instructions: 'Enable to include metadata such as creation date, author, version, and other relevant information.',
      testInput: true
    },
    
    enable_logging_alc: {
      name: 'Enable Logging',
      type: 'checkbox',
      required: false,
      description: 'Enable detailed logging for the output process',
      instructions: 'Enable to log detailed information about the output generation process for debugging and optimization.',
      testInput: true
    },
    
    batch_processing_alc: {
      name: 'Batch Processing',
      type: 'checkbox',
      required: false,
      description: 'Process multiple outputs in batch',
      instructions: 'Enable to process multiple content pieces together for efficiency.',
      testInput: false
    }
  }
}

// Helper function to get all variables for a specific node type
export const getAlchemistVariablesByType = (nodeType) => {
  const typeMapping = {
    'dataCollector': 'input',
    'formBuilder': 'input',
    'variableManager': 'input',
    'contentWriter': 'process',
    'researchEngine': 'process',
    'qualityOptimizer': 'process',
    'logicGate': 'condition',
    'decisionTree': 'condition',
    'validationCheck': 'condition',
    'blueprintDesigner': 'structural',
    'templateManager': 'structural',
    'layoutEngine': 'structural',
    'multiFormatExporter': 'output',
    'previewGenerator': 'output',
    'deliveryManager': 'output'
  }
  
  const category = typeMapping[nodeType] || 'input'
  return alchemistVariables[category] || {}
}

// Helper function to get all available variables
export const getAllAlchemistVariables = () => {
  const allVariables = {}
  Object.keys(alchemistVariables).forEach(category => {
    Object.assign(allVariables, alchemistVariables[category])
  })
  return allVariables
}

// Helper function to get test input data for a node type
export const getTestInputForNodeType = (nodeType) => {
  const variables = getAlchemistVariablesByType(nodeType)
  const testInput = {}
  
  Object.keys(variables).forEach(key => {
    if (variables[key].testInput !== undefined) {
      testInput[key] = variables[key].testInput
    }
  })
  
  return testInput
}

// Helper function to validate variable values
export const validateAlchemistVariable = (variableKey, value) => {
  const allVariables = getAllAlchemistVariables()
  const variable = allVariables[variableKey]
  
  if (!variable) return { valid: false, error: 'Variable not found' }
  
  // Check required
  if (variable.required && (!value || value === '')) {
    return { valid: false, error: `${variable.name} is required` }
  }
  
  // Check type validation
  if (value && variable.validation) {
    if (variable.validation.minLength && value.length < variable.validation.minLength) {
      return { valid: false, error: `${variable.name} must be at least ${variable.validation.minLength} characters` }
    }
    
    if (variable.validation.maxLength && value.length > variable.validation.maxLength) {
      return { valid: false, error: `${variable.name} must be no more than ${variable.validation.maxLength} characters` }
    }
    
    if (variable.validation.pattern && !variable.validation.pattern.test(value)) {
      return { valid: false, error: `${variable.name} format is invalid` }
    }
  }
  
  // Check number validation
  if (variable.type === 'number' && value !== undefined) {
    const numValue = Number(value)
    if (variable.min !== undefined && numValue < variable.min) {
      return { valid: false, error: `${variable.name} must be at least ${variable.min}` }
    }
    if (variable.max !== undefined && numValue > variable.max) {
      return { valid: false, error: `${variable.name} must be no more than ${variable.max}` }
    }
  }
  
  return { valid: true }
}

export default alchemistVariables
/**
 * ALCHEMIST NODE ACTION SERVICE
 * Dynamic button text and action framework for extensible node system
 * Boss's Vision: Surgical precision with no hardcoded button text anywhere!
 */

/**
 * MASTER NODE ACTIONS
 * Each Master node has a specific purpose and button text
 */
export const MASTER_NODE_ACTIONS = {
  inputMaster: { 
    text: 'COLLECT INPUT', 
    icon: 'FileText',
    purpose: 'Gather user input through dynamic forms and validation',
    workflow: 'Starting point for content creation workflows'
  },
  processMaster: { 
    text: 'GENERATE CONTENT', 
    icon: 'Brain',
    purpose: 'AI-powered content generation and processing',
    workflow: 'Core content creation with multiple AI models'
  },
  conditionMaster: { 
    text: 'EVALUATE CONDITIONS', 
    icon: 'GitBranch',
    purpose: 'Logical evaluation and conditional routing',
    workflow: 'Decision points and workflow branching'
  },
  previewMaster: { 
    text: 'START REVIEW', 
    icon: 'CheckCircle',
    purpose: 'Multi-round content review and approval system',
    workflow: 'Quality assurance and stakeholder approval'
  },
  outputMaster: { 
    text: 'EXPORT CONTENT', 
    icon: 'Download',
    purpose: 'Multi-format content export and distribution',
    workflow: 'Final output and publishing step'
  }
}

/**
 * SUB-NODE ACTIONS
 * Specific actions for each specialized sub-node
 */
export const SUB_NODE_ACTIONS = {
  // INPUT SPECIALISTS
  textPromptInput: { 
    text: 'COLLECT TEXT', 
    icon: 'FileText',
    category: 'input',
    purpose: 'AI-assisted text collection and optimization'
  },
  voiceInput: { 
    text: 'RECORD & TRANSCRIBE', 
    icon: 'Mic',
    category: 'input',
    purpose: 'Speech-to-text transcription with 50+ languages'
  },
  fileUpload: { 
    text: 'UPLOAD & PROCESS', 
    icon: 'Upload',
    category: 'input',
    purpose: 'Multi-format file processing with OCR and parsing'
  },
  urlScrapeInput: { 
    text: 'SCRAPE CONTENT', 
    icon: 'Link',
    category: 'input',
    purpose: 'Deep web scraping with smart content extraction'
  },
  
  // PROCESS SPECIALISTS
  contentWriter: { 
    text: 'GENERATE CONTENT', 
    icon: 'Brain',
    category: 'process',
    purpose: 'Multi-AI content generation with brand voice'
  },
  researchEngine: { 
    text: 'RESEARCH & COMPILE', 
    icon: 'Search',
    category: 'process',
    purpose: 'Fact-checked research with academic and industry sources'
  },
  qualityOptimizer: { 
    text: 'OPTIMIZE CONTENT', 
    icon: 'Zap',
    category: 'process',
    purpose: 'SEO optimization and readability enhancement'
  },
  
  // CONDITION SPECIALISTS
  logicGate: { 
    text: 'EVALUATE LOGIC', 
    icon: 'GitBranch',
    category: 'condition',
    purpose: 'Boolean decision engine with AI-powered routing'
  },
  decisionTree: { 
    text: 'ANALYZE & ROUTE', 
    icon: 'GitBranch',
    category: 'condition',
    purpose: 'Hierarchical decision analysis with ML optimization'
  },
  validationCheck: { 
    text: 'VALIDATE QUALITY', 
    icon: 'CheckCircle',
    category: 'condition',
    purpose: 'Comprehensive quality assurance with 50+ checks'
  },
  
  // PREVIEW SPECIALISTS
  livePreview: { 
    text: 'SHOW PREVIEW', 
    icon: 'Eye',
    category: 'preview',
    purpose: 'Real-time content visualization with AI suggestions'
  },
  mobileDesktopSimulator: { 
    text: 'SIMULATE DEVICES', 
    icon: 'Smartphone',
    category: 'preview',
    purpose: 'Cross-platform device simulation for 100+ devices'
  },
  emailPreview: { 
    text: 'PREVIEW EMAIL', 
    icon: 'Mail',
    category: 'preview',
    purpose: 'Email client simulation with spam and deliverability checks'
  },
  
  // OUTPUT SPECIALISTS
  multiFormatExporter: { 
    text: 'EXPORT FILES', 
    icon: 'Download',
    category: 'output',
    purpose: 'Custom branded export in 20+ formats'
  },
  cloudStorage: { 
    text: 'SAVE TO CLOUD', 
    icon: 'Cloud',
    category: 'output',
    purpose: 'Multi-cloud distribution with auto-backup'
  },
  scheduler: { 
    text: 'SCHEDULE PUBLISH', 
    icon: 'Calendar',
    category: 'output',
    purpose: 'Intelligent publishing with optimal timing'
  }
}

/**
 * CATEGORY FALLBACK ACTIONS
 * Default actions for node categories when specific action not defined
 */
export const CATEGORY_FALLBACK_ACTIONS = {
  input: { text: 'COLLECT DATA', icon: 'FileText' },
  process: { text: 'PROCESS DATA', icon: 'Brain' },
  condition: { text: 'EVALUATE', icon: 'GitBranch' },
  preview: { text: 'SHOW PREVIEW', icon: 'Eye' },
  output: { text: 'EXPORT', icon: 'Download' }
}

/**
 * GET MASTER NODE ACTION
 * Returns appropriate action for Master nodes
 */
export const getMasterNodeAction = (nodeType) => {
  return MASTER_NODE_ACTIONS[nodeType] || { text: 'CONFIGURE NODE', icon: 'Settings' }
}

/**
 * GET SUB-NODE ACTION
 * Returns appropriate action for Sub-nodes with category fallback
 */
export const getSubNodeAction = (nodeType, category) => {
  // Check for specific node action first
  if (SUB_NODE_ACTIONS[nodeType]) {
    return SUB_NODE_ACTIONS[nodeType]
  }
  
  // Fall back to category default
  if (CATEGORY_FALLBACK_ACTIONS[category]) {
    return CATEGORY_FALLBACK_ACTIONS[category]
  }
  
  // Ultimate fallback
  return { text: 'EXECUTE', icon: 'Play' }
}

/**
 * REGISTER NEW NODE ACTION
 * For future extensibility - register new node types dynamically
 */
export const registerNodeAction = (nodeType, actionConfig, isMaster = false) => {
  if (isMaster) {
    MASTER_NODE_ACTIONS[nodeType] = actionConfig
  } else {
    SUB_NODE_ACTIONS[nodeType] = actionConfig
  }
}

/**
 * GET ALL REGISTERED ACTIONS
 * Returns all registered actions for debugging/admin purposes
 */
export const getAllRegisteredActions = () => {
  return {
    masterNodes: MASTER_NODE_ACTIONS,
    subNodes: SUB_NODE_ACTIONS,
    categoryFallbacks: CATEGORY_FALLBACK_ACTIONS
  }
}

/**
 * VALIDATE NODE ACTION
 * Ensures action config has required fields
 */
export const validateNodeAction = (actionConfig) => {
  const required = ['text', 'icon']
  const missing = required.filter(field => !actionConfig[field])
  
  if (missing.length > 0) {
    throw new Error(`Invalid action config: missing fields ${missing.join(', ')}`)
  }
  
  return true
}

export default {
  getMasterNodeAction,
  getSubNodeAction,
  registerNodeAction,
  getAllRegisteredActions,
  validateNodeAction
}

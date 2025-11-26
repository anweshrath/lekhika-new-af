// NODE PALETTES STUB FOR VPS WORKER
// Not needed for user workflow execution - users run pre-built engines only
// Superadmin creates workflows, users execute them

const NODE_PALETTES = {};

const WORKFLOW_FLOWS = {};

const NODE_ROLE_CONFIG = {
  // Input Roles
  universal_input: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'input_collection',
    outputType: 'structured_input',
    maxTokens: 0,
    temperature: 0
  },
  story_input: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'story_input_collection',
    outputType: 'story_structured_input',
    maxTokens: 0,
    temperature: 0
  },
  business_input: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'business_input_collection',
    outputType: 'business_structured_input',
    maxTokens: 0,
    temperature: 0
  },

  // Process Roles - Research
  researcher: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'data_gathering',
    outputType: 'research_data',
    maxTokens: 3000,
    temperature: 0.3
  },
  market_analyst: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'market_analysis',
    outputType: 'market_data',
    maxTokens: 2500,
    temperature: 0.4
  },
  fact_checker: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'information_validation',
    outputType: 'verification_report',
    maxTokens: 2000,
    temperature: 0.2
  },

  // Process Roles - Creative
  world_builder: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'world_creation',
    outputType: 'world_data',
    maxTokens: 4000,
    temperature: 0.7
  },
  character_developer: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'character_creation',
    outputType: 'character_data',
    maxTokens: 3500,
    temperature: 0.6
  },
  plot_architect: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'story_structure',
    outputType: 'plot_data',
    maxTokens: 3000,
    temperature: 0.5
  },

  // Process Roles - Content (FULL WRITERS)
  content_writer: {
    canWriteContent: true,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'content_generation',
    outputType: 'book_content',
    maxTokens: 8000,
    temperature: 0.7
  },
  technical_writer: {
    canWriteContent: true,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'technical_content_generation',
    outputType: 'technical_content',
    maxTokens: 7000,
    temperature: 0.5
  },
  copywriter: {
    canWriteContent: true,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'persuasive_content_generation',
    outputType: 'persuasive_content',
    maxTokens: 6000,
    temperature: 0.6
  },

  // Process Roles - Outlining (STRUCTURAL WRITERS)
  story_outliner: {
    canWriteContent: false,
    canEditStructure: true,
    canProofRead: false,
    primaryFunction: 'story_structure',
    outputType: 'story_outline',
    maxTokens: 3000,
    temperature: 0.7
  },
  narrative_architect: {
    canWriteContent: false,
    canEditStructure: true,
    canProofRead: false,
    primaryFunction: 'narrative_structure',
    outputType: 'narrative_outline',
    maxTokens: 3000,
    temperature: 0.7
  },
  content_architect: {
    canWriteContent: false,
    canEditStructure: true,
    canProofRead: false,
    primaryFunction: 'content_structure',
    outputType: 'content_outline',
    maxTokens: 3000,
    temperature: 0.7
  },

  // Process Roles - Polishing (STRUCTURAL EDITORS)
  end_to_end_polisher: {
    canWriteContent: false,
    canEditStructure: true,
    canProofRead: false,
    primaryFunction: 'format_polishing',
    outputType: 'polished_content',
    maxTokens: 3000,
    temperature: 0.7
  },

  // Process Roles - Quality (EDITORS & PROOFREADERS)
  editor: {
    canWriteContent: false,
    canEditStructure: true,
    canProofRead: true,
    primaryFunction: 'content_refinement',
    outputType: 'edited_content',
    maxTokens: 6000,
    temperature: 0.3
  },
  quality_checker: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: true,
    primaryFunction: 'quality_validation',
    outputType: 'quality_report',
    maxTokens: 2000,
    temperature: 0.2
  },
  proofreader: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: true,
    primaryFunction: 'error_detection',
    outputType: 'proofreading_report',
    maxTokens: 1500,
    temperature: 0.1
  },

  // Condition Roles
  preference_router: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'workflow_routing',
    outputType: 'routing_decision',
    maxTokens: 0,
    temperature: 0
  },
  content_type_router: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'content_type_routing',
    outputType: 'workflow_decision',
    maxTokens: 0,
    temperature: 0
  },
  quality_gate: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'quality_evaluation',
    outputType: 'quality_gate_decision',
    maxTokens: 1000,
    temperature: 0.2
  },

  // Preview Roles
  chapter_previewer: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'chapter_preview',
    outputType: 'preview_feedback',
    maxTokens: 0,
    temperature: 0
  },
  content_previewer: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'content_preview',
    outputType: 'section_preview_feedback',
    maxTokens: 0,
    temperature: 0
  },
  final_previewer: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'final_preview',
    outputType: 'final_preview_document',
    maxTokens: 0,
    temperature: 0
  },
  audiobook_previewer: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'audio_preview',
    outputType: 'audio_preview_with_feedback',
    maxTokens: 5000,
    temperature: 0.5
  },

  // Output Roles
  output_processor: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'format_generation',
    outputType: 'final_deliverables',
    maxTokens: 0,
    temperature: 0
  },
  audiobook_output: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'audiobook_generation',
    outputType: 'audiobook_chunks',
    maxTokens: 15000,
    temperature: 0.5
  },
  multi_format_output: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'multi_format_generation',
    outputType: 'multi_format_package',
    maxTokens: 0,
    temperature: 0
  },
  
  // Imaging Roles
  image_generator: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'image_generation',
    outputType: 'image_metadata',
    maxTokens: 500,
    temperature: 0.8
  },
  ecover_generator: {
    canWriteContent: false,
    canEditStructure: false,
    canProofRead: false,
    primaryFunction: 'cover_design',
    outputType: 'cover_metadata',
    maxTokens: 500,
    temperature: 0.8
  }
};

module.exports = { NODE_PALETTES, WORKFLOW_FLOWS, NODE_ROLE_CONFIG };

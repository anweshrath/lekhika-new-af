// DRAG-DROP NODE TEMPLATES FOR LEKHIKA WORKFLOWS
// Ready-to-use node templates for instant workflow creation

export const NODE_TEMPLATES = {
  // INPUT NODES
  input: {
    bookInput: {
      id: 'template-input-book',
      type: 'input',
      data: {
        label: 'Book Input',
        description: 'Basic book information and requirements',
        aiEnabled: false,
        selectedModels: [],
        inputFields: [
          { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter book title' },
          { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
          { id: 3, name: 'genre', type: 'select', required: true, variable: 'genre', options: ['fiction', 'non-fiction', 'business', 'self-help', 'romance', 'thriller', 'fantasy', 'sci-fi', 'biography', 'how-to'] },
          { id: 4, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['general', 'young_adult', 'children', 'adults', 'professionals', 'students', 'entrepreneurs'] },
          { id: 5, name: 'word_count', type: 'select', required: true, variable: 'word_count', options: ['5000-10000', '10000-20000', '20000-40000', '40000-80000', '80000+'] },
          { id: 6, name: 'chapter_count', type: 'select', required: true, variable: 'chapter_count', options: ['3-5', '5-8', '8-12', '12-20', '20+'] },
          { id: 7, name: 'writing_style', type: 'select', required: true, variable: 'writing_style', options: ['conversational', 'professional', 'academic', 'casual', 'formal', 'creative', 'technical'] },
          { id: 8, name: 'tone', type: 'select', required: true, variable: 'tone', options: ['friendly', 'authoritative', 'inspirational', 'informative', 'entertaining', 'serious', 'humorous'] }
        ]
      }
    },
    
    storyInput: {
      id: 'template-input-story',
      type: 'input',
      data: {
        label: 'Story Input',
        description: 'Fiction story requirements and premise',
        aiEnabled: false,
        selectedModels: [],
        inputFields: [
          { id: 1, name: 'story_title', type: 'text', required: true, variable: 'story_title', placeholder: 'Story title' },
          { id: 2, name: 'story_premise', type: 'textarea', required: true, variable: 'story_premise', placeholder: 'Brief story premise or concept' },
          { id: 3, name: 'genre', type: 'select', required: true, variable: 'genre', options: ['romance', 'thriller', 'mystery', 'fantasy', 'sci-fi', 'horror', 'adventure', 'drama', 'comedy', 'historical'] },
          { id: 4, name: 'setting', type: 'text', required: false, variable: 'setting', placeholder: 'Time period and location' },
          { id: 5, name: 'main_character', type: 'text', required: false, variable: 'main_character', placeholder: 'Main character description' },
          { id: 6, name: 'conflict', type: 'textarea', required: false, variable: 'conflict', placeholder: 'Central conflict or challenge' },
          { id: 7, name: 'target_length', type: 'select', required: true, variable: 'target_length', options: ['short story (1-5k)', 'novella (10-40k)', 'novel (50-100k)', 'epic (100k+)'] }
        ]
      }
    },
    
    businessInput: {
      id: 'template-input-business',
      type: 'input',
      data: {
        label: 'Business Content Input',
        description: 'Business book or content requirements',
        aiEnabled: false,
        selectedModels: [],
        inputFields: [
          { id: 1, name: 'business_topic', type: 'text', required: true, variable: 'business_topic', placeholder: 'Business topic or niche' },
          { id: 2, name: 'target_market', type: 'select', required: true, variable: 'target_market', options: ['entrepreneurs', 'small_business', 'enterprise', 'startups', 'executives', 'managers', 'consultants'] },
          { id: 3, name: 'content_type', type: 'select', required: true, variable: 'content_type', options: ['strategy_guide', 'how_to_manual', 'case_study', 'industry_analysis', 'leadership_guide', 'marketing_playbook'] },
          { id: 4, name: 'expertise_level', type: 'select', required: true, variable: 'expertise_level', options: ['beginner', 'intermediate', 'advanced', 'expert'] },
          { id: 5, name: 'include_examples', type: 'checkbox', required: false, variable: 'include_examples' },
          { id: 6, name: 'include_templates', type: 'checkbox', required: false, variable: 'include_templates' },
          { id: 7, name: 'include_case_studies', type: 'checkbox', required: false, variable: 'include_case_studies' }
        ]
      }
    }
  },
  
  // PROCESS NODES - SPECIALIZED ROLES
  process: {
    researcher: {
      id: 'template-process-research',
      type: 'process',
      data: {
        label: 'Research & Analysis',
        description: 'ROLE: Conducts research and gathers information - NO WRITING',
        aiEnabled: true,
        selectedModels: [],
        systemPrompt: 'You are a research specialist. Your ONLY role is to conduct thorough research and analysis. DO NOT WRITE CONTENT - only gather and organize information.',
        userPrompt: 'Conduct comprehensive research on: {business_topic || story_premise || book_title}. OUTPUT ONLY: 1) KEY RESEARCH FINDINGS: Facts, statistics, trends, 2) EXPERT INSIGHTS: Industry knowledge and best practices, 3) RELEVANT EXAMPLES: Case studies and real-world applications, 4) SUPPORTING DATA: Evidence and citations. Provide research foundation for other nodes to use.',
        maxTokens: 3000
      }
    },
    
    outliner: {
      id: 'template-process-outline',
      type: 'process',
      data: {
        label: 'Content Outliner',
        description: 'ROLE: Creates detailed content outlines and structure - NO WRITING',
        aiEnabled: true,
        selectedModels: [],
        systemPrompt: 'You are a content structure specialist. Your ONLY role is to create detailed outlines and content structures. DO NOT WRITE ACTUAL CONTENT.',
        userPrompt: 'Create DETAILED CONTENT OUTLINE for: {book_title || business_topic}. Using research provided, OUTPUT ONLY: 1) CHAPTER BREAKDOWN: What each chapter covers, 2) SECTION STRUCTURE: Key points and subtopics, 3) LOGICAL FLOW: How content builds progressively, 4) CONTENT PURPOSES: What each section accomplishes. Provide structural blueprint for writing nodes.',
        maxTokens: 2500
      }
    },
    
    worldBuilder: {
      id: 'template-process-worldbuilding',
      type: 'process',
      data: {
        label: 'World Builder',
        description: 'ROLE: Creates fictional worlds and settings - NO CHAPTER WRITING',
        aiEnabled: true,
        selectedModels: [],
        systemPrompt: 'You are a world-building specialist. Your ONLY role is to create detailed fictional worlds and settings. DO NOT WRITE STORY CHAPTERS.',
        userPrompt: 'Create WORLD FOUNDATION for: {story_title}. Genre: {genre}. Premise: {story_premise}. OUTPUT ONLY: 1) SETTING DETAILS: Locations, time period, environment, 2) WORLD RULES: How this world operates, 3) CULTURAL SYSTEMS: Society, customs, technology level, 4) ATMOSPHERE: Mood and tone of the world. Provide world context for story writing.',
        maxTokens: 3000
      }
    },
    
    characterDeveloper: {
      id: 'template-process-characters',
      type: 'process',
      data: {
        label: 'Character Developer',
        description: 'ROLE: Creates character profiles and relationships - NO STORY WRITING',
        aiEnabled: true,
        selectedModels: [],
        systemPrompt: 'You are a character development specialist. Your ONLY role is to create detailed character profiles. DO NOT WRITE STORY SCENES.',
        userPrompt: 'Create CHARACTER PROFILES for: {story_title}. Using story premise: {story_premise}. OUTPUT ONLY: 1) MAIN CHARACTERS: Names, ages, backgrounds, motivations, 2) CHARACTER RELATIONSHIPS: How they connect and interact, 3) CHARACTER ARCS: How each character grows, 4) PERSONALITY TRAITS: Unique voices and behaviors. Provide character foundation for story writing.',
        maxTokens: 2500
      }
    },
    
    plotArchitect: {
      id: 'template-process-plot',
      type: 'process',
      data: {
        label: 'Plot Architect',
        description: 'ROLE: Creates story structure and plot outline - NO CHAPTER WRITING',
        aiEnabled: true,
        selectedModels: [],
        systemPrompt: 'You are a plot structure specialist. Your ONLY role is to create detailed story outlines and plot structures. DO NOT WRITE ACTUAL CHAPTERS.',
        userPrompt: 'Create PLOT STRUCTURE for: {story_title}. Using world-building and character context. OUTPUT ONLY: 1) STORY OUTLINE: Chapter-by-chapter events, 2) PLOT POINTS: Key turning points and conflicts, 3) PACING STRUCTURE: How tension builds, 4) CHAPTER PURPOSES: What each chapter accomplishes. Provide plot blueprint for chapter writing.',
        maxTokens: 3000
      }
    },
    
    contentWriter: {
      id: 'template-process-writer',
      type: 'process',
      data: {
        label: 'Content Writer',
        description: 'ROLE: ONLY NODE THAT WRITES ACTUAL CONTENT - Creates chapters/sections',
        aiEnabled: true,
        selectedModels: [],
        systemPrompt: 'You are the CONTENT WRITER. You are the ONLY node that writes actual content. Use outlines, research, and context from previous nodes to write complete content.',
        userPrompt: 'WRITE THE ACTUAL CONTENT for: {book_title || story_title}. Using: 1) RESEARCH from research nodes, 2) OUTLINE from structure nodes, 3) CONTEXT from development nodes. Your job: WRITE COMPLETE CONTENT with engaging prose, clear explanations, and compelling narrative. Target: {chapter_count} sections totaling {word_count} words.',
        maxTokens: 6000
      }
    },
    
    editor: {
      id: 'template-process-editor',
      type: 'process',
      data: {
        label: 'Content Editor',
        description: 'ROLE: Edits and refines written content - NO NEW WRITING',
        aiEnabled: true,
        selectedModels: [],
        systemPrompt: 'You are a professional editor. Your ONLY role is to edit and refine existing content. DO NOT WRITE NEW CONTENT - only improve what exists.',
        userPrompt: 'EDIT AND REFINE the content provided. Focus on: 1) CLARITY: Make content clear and understandable, 2) FLOW: Improve transitions and pacing, 3) CONSISTENCY: Ensure consistent tone and style, 4) ENGAGEMENT: Enhance readability and interest. Return polished, professional content.',
        maxTokens: 4000
      }
    },
    
    formatter: {
      id: 'template-process-formatter',
      type: 'process',
      data: {
        label: 'Content Formatter',
        description: 'ROLE: Formats content for publication - NO CONTENT CHANGES',
        aiEnabled: true,
        selectedModels: [],
        systemPrompt: 'You are a publishing formatter. Your ONLY role is to format content for publication. DO NOT CHANGE CONTENT - only format it properly.',
        userPrompt: 'FORMAT the provided content for publication. Apply: 1) STRUCTURE: Proper headings and sections, 2) FORMATTING: Bold, italics, lists where appropriate, 3) LAYOUT: Professional spacing and organization, 4) CONSISTENCY: Uniform formatting throughout. Return publication-ready formatted content.',
        maxTokens: 2000
      }
    }
  },
  
  // OUTPUT NODES
  output: {
    basicOutput: {
      id: 'template-output-basic',
      type: 'output',
      data: {
        label: 'Basic Output',
        description: 'Standard output with multiple format options',
        aiEnabled: false,
        outputFormat: 'html',
        exportFormats: ['html', 'text', 'markdown', 'flipbook'],
        generateCover: false,
        includeImages: false,
        includeTOC: true,
        customFormatting: {
          pageSize: 'A4',
          fontFamily: 'Arial',
          fontSize: '12pt',
          margins: '1in'
        }
      }
    },
    
    professionalOutput: {
      id: 'template-output-professional',
      type: 'output',
      data: {
        label: 'Professional Output',
        description: 'Professional publishing output with all formats',
        aiEnabled: false,
        outputFormat: 'html',
        exportFormats: ['html', 'pdf', 'epub', 'docx', 'text', 'flipbook'],
        generateCover: true,
        includeImages: true,
        includeTOC: true,
        customFormatting: {
          pageSize: 'A5',
          fontFamily: 'Crimson Text',
          fontSize: '16px',
          margins: '1in',
          typographyStyle: 'professional',
          colorScheme: 'classic',
          pagination: true,
          headerFooter: true
        }
      }
    },
    
    ebookOutput: {
      id: 'template-output-ebook',
      type: 'output',
      data: {
        label: 'eBook Output',
        description: 'Optimized for eBook distribution and reading',
        aiEnabled: false,
        outputFormat: 'epub',
        exportFormats: ['epub', 'mobi', 'pdf', 'html', 'flipbook'],
        generateCover: true,
        includeImages: true,
        includeTOC: true,
        customFormatting: {
          pageSize: 'ebook',
          fontFamily: 'Georgia',
          fontSize: '14px',
          lineHeight: '1.6',
          textAlign: 'justify',
          colorScheme: 'reader-friendly'
        }
      }
    }
  },
  
  // COMPLETE WORKFLOW TEMPLATES
  workflows: {
    simpleBook: {
      name: 'Simple Book Creator',
      description: 'Basic 3-node workflow for simple book creation',
      nodes: [
        { ...NODE_TEMPLATES.input.bookInput, position: { x: 100, y: 100 } },
        { ...NODE_TEMPLATES.process.contentWriter, position: { x: 400, y: 100 } },
        { ...NODE_TEMPLATES.output.basicOutput, position: { x: 700, y: 100 } }
      ],
      edges: [
        { id: 'e1-2', source: 'template-input-book', target: 'template-process-writer' },
        { id: 'e2-3', source: 'template-process-writer', target: 'template-output-basic' }
      ]
    },
    
    researchBasedBook: {
      name: 'Research-Based Book',
      description: '4-node workflow with research foundation',
      nodes: [
        { ...NODE_TEMPLATES.input.businessInput, position: { x: 100, y: 100 } },
        { ...NODE_TEMPLATES.process.researcher, position: { x: 300, y: 100 } },
        { ...NODE_TEMPLATES.process.contentWriter, position: { x: 500, y: 100 } },
        { ...NODE_TEMPLATES.output.professionalOutput, position: { x: 700, y: 100 } }
      ],
      edges: [
        { id: 'e1-2', source: 'template-input-business', target: 'template-process-research' },
        { id: 'e2-3', source: 'template-process-research', target: 'template-process-writer' },
        { id: 'e3-4', source: 'template-process-writer', target: 'template-output-professional' }
      ]
    },
    
    fictionWorkflow: {
      name: 'Complete Fiction Creator',
      description: '6-node workflow for comprehensive fiction creation',
      nodes: [
        { ...NODE_TEMPLATES.input.storyInput, position: { x: 100, y: 100 } },
        { ...NODE_TEMPLATES.process.worldBuilder, position: { x: 300, y: 50 } },
        { ...NODE_TEMPLATES.process.characterDeveloper, position: { x: 300, y: 150 } },
        { ...NODE_TEMPLATES.process.plotArchitect, position: { x: 500, y: 100 } },
        { ...NODE_TEMPLATES.process.contentWriter, position: { x: 700, y: 100 } },
        { ...NODE_TEMPLATES.output.ebookOutput, position: { x: 900, y: 100 } }
      ],
      edges: [
        { id: 'e1-2', source: 'template-input-story', target: 'template-process-worldbuilding' },
        { id: 'e1-3', source: 'template-input-story', target: 'template-process-characters' },
        { id: 'e2-4', source: 'template-process-worldbuilding', target: 'template-process-plot' },
        { id: 'e3-4', source: 'template-process-characters', target: 'template-process-plot' },
        { id: 'e4-5', source: 'template-process-plot', target: 'template-process-writer' },
        { id: 'e5-6', source: 'template-process-writer', target: 'template-output-ebook' }
      ]
    },
    
    professionalWorkflow: {
      name: 'Professional Publishing Pipeline',
      description: '7-node workflow with research, writing, editing, and formatting',
      nodes: [
        { ...NODE_TEMPLATES.input.businessInput, position: { x: 100, y: 100 } },
        { ...NODE_TEMPLATES.process.researcher, position: { x: 250, y: 100 } },
        { ...NODE_TEMPLATES.process.outliner, position: { x: 400, y: 100 } },
        { ...NODE_TEMPLATES.process.contentWriter, position: { x: 550, y: 100 } },
        { ...NODE_TEMPLATES.process.editor, position: { x: 700, y: 100 } },
        { ...NODE_TEMPLATES.process.formatter, position: { x: 850, y: 100 } },
        { ...NODE_TEMPLATES.output.professionalOutput, position: { x: 1000, y: 100 } }
      ],
      edges: [
        { id: 'e1-2', source: 'template-input-business', target: 'template-process-research' },
        { id: 'e2-3', source: 'template-process-research', target: 'template-process-outline' },
        { id: 'e3-4', source: 'template-process-outline', target: 'template-process-writer' },
        { id: 'e4-5', source: 'template-process-writer', target: 'template-process-editor' },
        { id: 'e5-6', source: 'template-process-editor', target: 'template-process-formatter' },
        { id: 'e6-7', source: 'template-process-formatter', target: 'template-output-professional' }
      ]
    }
  }
};

// Helper function to create unique IDs for templates
export const createTemplateNode = (template, position = { x: 0, y: 0 }) => {
  const uniqueId = `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    ...template,
    id: uniqueId,
    position,
    data: {
      ...template.data,
      id: uniqueId
    }
  };
};

// Function to get template by category and type
export const getTemplate = (category, type) => {
  return NODE_TEMPLATES[category]?.[type] || null;
};

// Function to get all templates for a category
export const getTemplatesByCategory = (category) => {
  return NODE_TEMPLATES[category] || {};
};

// Function to get complete workflow template
export const getWorkflowTemplate = (workflowType) => {
  return NODE_TEMPLATES.workflows[workflowType] || null;
};

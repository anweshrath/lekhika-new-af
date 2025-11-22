// Complete Framework Flow Templates - All 12 Robust Templates
export const FRAMEWORK_FLOWS = {
  businessStrategyGuideShort: {
    id: 'frame-business-strategy-guide-short',
    name: 'Business Strategy Guide (Short)',
    description: 'Quick business strategy guide - 2-3 chapters, 3-8k words, essential frameworks only',
    type: 'framework',
    category: 'business',
    complexity: 'short',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          label: 'Business Strategy Requirements',
          description: 'Define your business strategy objectives and market positioning',
          aiEnabled: false,
          selectedModels: [],
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter your book title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: false, variable: 'author_bio', placeholder: 'Brief author biography for credibility' },
            { id: 4, name: 'word_count', type: 'select', required: true, variable: 'word_count', options: ['3000-5000', '5000-8000', '8000-12000'], placeholder: 'Select word count' },
            { id: 5, name: 'chapter_count', type: 'select', required: true, variable: 'chapter_count', options: ['2-3', '3-4', '4-5'], placeholder: 'Select chapter count' },
            { id: 6, name: 'tone', type: 'select', required: true, variable: 'tone', options: ['professional', 'conversational', 'authoritative', 'friendly'], placeholder: 'Select tone' },
            { id: 7, name: 'accent', type: 'select', required: true, variable: 'accent', options: ['american', 'british', 'australian', 'canadian'], placeholder: 'Select accent' },
            { id: 8, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['entrepreneurs', 'executives', 'managers', 'consultants', 'students'], placeholder: 'Select target audience' },
            { id: 9, name: 'industry_focus', type: 'select', required: true, variable: 'industry_focus', options: ['technology', 'finance', 'healthcare', 'retail', 'manufacturing', 'services'], placeholder: 'Select industry focus' },
            { id: 10, name: 'include_case_studies', type: 'checkbox', required: false, variable: 'include_case_studies', placeholder: 'Include real-world case studies' },
            { id: 11, name: 'include_templates', type: 'checkbox', required: false, variable: 'include_templates', placeholder: 'Include practical templates and worksheets' },
            { id: 12, name: 'include_worksheets', type: 'checkbox', required: false, variable: 'include_worksheets', placeholder: 'Include actionable worksheets' },
            { id: 13, name: 'custom_instructions', type: 'textarea', required: false, variable: 'custom_instructions', placeholder: 'Any specific requirements or focus areas' },
            { id: 14, name: 'publishing_format', type: 'select', required: true, variable: 'publishing_format', options: ['ebook', 'print', 'both'], placeholder: 'Select publishing format' },
            { id: 15, name: 'content_depth', type: 'select', required: true, variable: 'content_depth', options: ['overview', 'intermediate', 'comprehensive'], placeholder: 'Select content depth' },
            { id: 16, name: 'research_level', type: 'select', required: false, variable: 'research_level', options: ['basic', 'moderate', 'comprehensive'], placeholder: 'Select research level' },
            { id: 17, name: 'practical_applications', type: 'checkbox', required: false, variable: 'practical_applications', placeholder: 'Include practical implementation steps' },
            { id: 18, name: 'business_model', type: 'select', required: true, variable: 'business_model', options: ['b2b', 'b2c', 'b2b2c', 'marketplace'], placeholder: 'Select business model' },
            { id: 19, name: 'output_formats', type: 'select', required: true, variable: 'output_formats', optionsSource: 'outputFormats', multiple: true, placeholder: 'Select output formats' },
            { id: 20, name: 'book_size', type: 'select', required: true, variable: 'book_size', options: ['A4', 'Letter', 'A5', 'B5', '6x9', '5.5x8.5', 'custom'], placeholder: 'Select book size' },
            { id: 21, name: 'custom_size', type: 'text', required: false, variable: 'custom_size', placeholder: 'Enter custom size (e.g., 8.5x11 inches)', conditional: 'book_size === "custom"' },
            { id: 22, name: 'typography_style', type: 'select', required: true, variable: 'typography_style', options: ['modern', 'classic', 'minimalist', 'professional', 'creative', 'academic'], placeholder: 'Select typography style' },
            { id: 23, name: 'cover_design', type: 'select', required: true, variable: 'cover_design', options: ['auto_generate', 'minimal', 'professional', 'creative', 'custom'], placeholder: 'Select cover design style' }
          ],
          testScenarios: [
            {
              name: 'Quick Strategy Overview',
              data: {
                book_title: 'The Essential Business Strategy Playbook',
                author_name: 'Sarah Johnson',
                author_bio: 'Serial entrepreneur with 15+ years building successful startups across tech and retail sectors',
                word_count: '3000-5000',
                chapter_count: '2-3',
                tone: 'professional',
                accent: 'american',
                target_audience: 'entrepreneurs',
                industry_focus: 'technology',
                include_case_studies: true,
                include_templates: true,
                include_worksheets: true,
                custom_instructions: 'Focus on lean startup methodology and rapid market validation techniques',
                publishing_format: 'ebook',
                content_depth: 'overview',
                research_level: 'moderate',
                practical_applications: true,
                business_model: 'b2b',
                output_formats: ['pdf', 'docx', 'epub'],
                book_size: 'A4',
                custom_size: '',
                typography_style: 'professional',
                cover_design: 'professional'
              }
            },
            {
              name: 'Corporate Strategy Guide',
              data: {
                book_title: 'Corporate Strategy Excellence: A Manager\'s Guide',
                author_name: 'Michael Chen',
                author_bio: 'Former McKinsey consultant and Fortune 500 C-suite executive with expertise in strategic transformation',
                word_count: '5000-8000',
                chapter_count: '3-4',
                tone: 'authoritative',
                accent: 'british',
                target_audience: 'executives',
                industry_focus: 'finance',
                include_case_studies: true,
                include_templates: true,
                include_worksheets: false,
                custom_instructions: 'Emphasize data-driven decision making and competitive analysis frameworks',
                publishing_format: 'both',
                content_depth: 'intermediate',
                research_level: 'comprehensive',
                practical_applications: true,
                business_model: 'b2b',
                output_formats: ['pdf', 'docx', 'epub'],
                book_size: 'Letter',
                custom_size: '',
                typography_style: 'classic',
                cover_design: 'professional'
              }
            },
            {
              name: 'Startup Strategy Blueprint',
              data: {
                book_title: 'From Idea to IPO: The Complete Startup Strategy Blueprint',
                author_name: 'Alex Rodriguez',
                author_bio: 'Tech entrepreneur who scaled three startups to successful exits, now angel investor and startup advisor',
                word_count: '8000-12000',
                chapter_count: '4-5',
                tone: 'conversational',
                accent: 'american',
                target_audience: 'entrepreneurs',
                industry_focus: 'technology',
                include_case_studies: true,
                include_templates: true,
                include_worksheets: true,
                custom_instructions: 'Include fundraising strategies, team building, and scaling challenges',
                publishing_format: 'ebook',
                content_depth: 'comprehensive',
                research_level: 'comprehensive',
                practical_applications: true,
                business_model: 'b2c',
                output_formats: ['pdf', 'docx', 'epub'],
                book_size: '6x9',
                custom_size: '',
                typography_style: 'modern',
                cover_design: 'creative'
              }
            },
            {
              name: 'Small Business Strategy',
              data: {
                book_title: 'Small Business Success: Strategic Planning for Growth',
                author_name: 'Jennifer Williams',
                author_bio: 'Small business consultant with 20+ years helping local businesses scale and compete effectively',
                word_count: '3000-5000',
                chapter_count: '2-3',
                tone: 'friendly',
                accent: 'canadian',
                target_audience: 'managers',
                industry_focus: 'retail',
                include_case_studies: false,
                include_templates: true,
                include_worksheets: true,
                custom_instructions: 'Focus on local market penetration and customer retention strategies',
                publishing_format: 'print',
                content_depth: 'overview',
                research_level: 'basic',
                practical_applications: true,
                business_model: 'b2c',
                output_formats: ['pdf', 'docx', 'epub'],
                book_size: 'A5',
                custom_size: '',
                typography_style: 'professional',
                cover_design: 'minimal'
              }
            },
            {
              name: 'Enterprise Strategy Framework',
              data: {
                book_title: 'Enterprise Strategy in the Digital Age',
                author_name: 'Dr. Robert Kim',
                author_bio: 'Digital transformation expert and former IBM executive specializing in enterprise strategy and innovation',
                word_count: '5000-8000',
                chapter_count: '3-4',
                tone: 'authoritative',
                accent: 'american',
                target_audience: 'executives',
                industry_focus: 'technology',
                include_case_studies: true,
                include_templates: true,
                include_worksheets: false,
                custom_instructions: 'Emphasize digital transformation, AI integration, and agile methodologies',
                publishing_format: 'both',
                content_depth: 'intermediate',
                research_level: 'comprehensive',
                practical_applications: true,
                business_model: 'b2b',
                output_formats: ['pdf', 'docx', 'epub'],
                book_size: 'Letter',
                custom_size: '',
                typography_style: 'modern',
                cover_design: 'professional'
              }
            }
          ]
        }
      },
      {
        id: 'process-1',
        type: 'process',
        position: { x: 400, y: 100 },
        data: {
          label: 'Strategy Analysis',
          description: 'Analyze market conditions and competitive landscape',
          aiEnabled: true,
          selectedModels: []
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 700, y: 100 },
        data: {
          label: 'Strategy Document',
          description: 'Generate comprehensive strategy document',
          outputFormat: 'multi-format',
          generateCover: true,
          includeTOC: true
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'input-1', target: 'process-1' },
      { id: 'e2', source: 'process-1', target: 'output-1' }
    ]
  },
  businessStrategyGuideComplicated: {
    id: 'frame-business-strategy-guide-complicated',
    name: 'Business Strategy Guide (Complex)',
    description: 'Comprehensive business strategy guide - 6-8 chapters, 15-25k words, advanced frameworks',
    type: 'framework',
    category: 'business',
    complexity: 'complex',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          label: 'Advanced Business Strategy Requirements',
          description: 'Define comprehensive business strategy with advanced frameworks',
          aiEnabled: false,
          selectedModels: [],
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter your book title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: false, variable: 'author_bio', placeholder: 'Brief author biography for credibility' },
            { id: 4, name: 'word_count', type: 'select', required: true, variable: 'word_count', options: ['15000-20000', '20000-25000', '25000-30000'], placeholder: 'Select word count' },
            { id: 5, name: 'chapter_count', type: 'select', required: true, variable: 'chapter_count', options: ['6-8', '8-10', '10-12'], placeholder: 'Select chapter count' },
            { id: 6, name: 'tone', type: 'select', required: true, variable: 'tone', options: ['professional', 'conversational', 'authoritative', 'friendly'], placeholder: 'Select tone' },
            { id: 7, name: 'accent', type: 'select', required: true, variable: 'accent', options: ['american', 'british', 'australian', 'canadian'], placeholder: 'Select accent' },
            { id: 8, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['entrepreneurs', 'executives', 'managers', 'consultants', 'students'], placeholder: 'Select target audience' },
            { id: 9, name: 'industry_focus', type: 'select', required: true, variable: 'industry_focus', options: ['technology', 'finance', 'healthcare', 'retail', 'manufacturing', 'services'], placeholder: 'Select industry focus' },
            { id: 10, name: 'include_case_studies', type: 'checkbox', required: false, variable: 'include_case_studies', placeholder: 'Include real-world case studies' },
            { id: 11, name: 'include_templates', type: 'checkbox', required: false, variable: 'include_templates', placeholder: 'Include practical templates and worksheets' },
            { id: 12, name: 'include_worksheets', type: 'checkbox', required: false, variable: 'include_worksheets', placeholder: 'Include actionable worksheets' },
            { id: 13, name: 'custom_instructions', type: 'textarea', required: false, variable: 'custom_instructions', placeholder: 'Any specific requirements or focus areas' },
            { id: 14, name: 'publishing_format', type: 'select', required: true, variable: 'publishing_format', options: ['ebook', 'print', 'both'], placeholder: 'Select publishing format' },
            { id: 15, name: 'content_depth', type: 'select', required: true, variable: 'content_depth', options: ['overview', 'intermediate', 'comprehensive'], placeholder: 'Select content depth' },
            { id: 16, name: 'research_level', type: 'select', required: false, variable: 'research_level', options: ['basic', 'moderate', 'comprehensive'], placeholder: 'Select research level' },
            { id: 17, name: 'practical_applications', type: 'checkbox', required: false, variable: 'practical_applications', placeholder: 'Include practical implementation steps' },
            { id: 18, name: 'business_model', type: 'select', required: true, variable: 'business_model', options: ['b2b', 'b2c', 'b2b2c', 'marketplace'], placeholder: 'Select business model' },
            { id: 19, name: 'output_formats', type: 'select', required: true, variable: 'output_formats', optionsSource: 'outputFormats', multiple: true, placeholder: 'Select output formats' },
            { id: 20, name: 'book_size', type: 'select', required: true, variable: 'book_size', options: ['A4', 'Letter', 'A5', 'B5', '6x9', '5.5x8.5', 'custom'], placeholder: 'Select book size' },
            { id: 21, name: 'custom_size', type: 'text', required: false, variable: 'custom_size', placeholder: 'Enter custom size (e.g., 8.5x11 inches)', conditional: 'book_size === "custom"' },
            { id: 22, name: 'typography_style', type: 'select', required: true, variable: 'typography_style', options: ['modern', 'classic', 'minimalist', 'professional', 'creative', 'academic'], placeholder: 'Select typography style' },
            { id: 23, name: 'cover_design', type: 'select', required: true, variable: 'cover_design', options: ['auto_generate', 'minimal', 'professional', 'creative', 'custom'], placeholder: 'Select cover design style' }
          ],
          testScenarios: [
            {
              name: 'Enterprise Strategy Mastery',
              data: {
                book_title: 'The Complete Enterprise Strategy Playbook',
                author_name: 'Dr. Elizabeth Martinez',
                author_bio: 'Former McKinsey partner and Fortune 100 C-suite executive with 25+ years in strategic transformation',
                word_count: '20000-25000',
                chapter_count: '8-10',
                tone: 'authoritative',
                accent: 'american',
                target_audience: 'executives',
                industry_focus: 'technology',
                include_case_studies: true,
                include_templates: true,
                include_worksheets: true,
                custom_instructions: 'Focus on digital transformation, AI integration, and global market expansion strategies',
                publishing_format: 'both',
                content_depth: 'comprehensive',
                research_level: 'comprehensive',
                practical_applications: true,
                business_model: 'b2b',
                output_formats: ['pdf', 'docx', 'epub'],
                book_size: 'Letter',
                custom_size: '',
                typography_style: 'professional',
                cover_design: 'professional'
              }
            },
            {
              name: 'Advanced Startup Strategy',
              data: {
                book_title: 'Scaling to Success: Advanced Startup Strategy Framework',
                author_name: 'James Thompson',
                author_bio: 'Serial entrepreneur with 4 successful exits, now venture partner at leading VC firm',
                word_count: '15000-20000',
                chapter_count: '6-8',
                tone: 'conversational',
                accent: 'british',
                target_audience: 'entrepreneurs',
                industry_focus: 'technology',
                include_case_studies: true,
                include_templates: true,
                include_worksheets: true,
                custom_instructions: 'Include fundraising strategies, international expansion, and team scaling challenges',
                publishing_format: 'ebook',
                content_depth: 'comprehensive',
                research_level: 'comprehensive',
                practical_applications: true,
                business_model: 'b2c',
                output_formats: ['pdf', 'docx', 'epub'],
                book_size: '6x9',
                custom_size: '',
                typography_style: 'modern',
                cover_design: 'creative'
              }
            },
            {
              name: 'Corporate Transformation Guide',
              data: {
                book_title: 'Corporate Transformation: Strategic Change Management',
                author_name: 'Dr. Sarah Chen',
                author_bio: 'Organizational psychologist and former Deloitte consultant specializing in corporate transformation',
                word_count: '25000-30000',
                chapter_count: '10-12',
                tone: 'professional',
                accent: 'american',
                target_audience: 'executives',
                industry_focus: 'services',
                include_case_studies: true,
                include_templates: true,
                include_worksheets: false,
                custom_instructions: 'Emphasize change management, culture transformation, and stakeholder alignment',
                publishing_format: 'both',
                content_depth: 'comprehensive',
                research_level: 'comprehensive',
                practical_applications: true,
                business_model: 'b2b',
                output_formats: ['pdf', 'docx', 'epub'],
                book_size: 'A4',
                custom_size: '',
                typography_style: 'academic',
                cover_design: 'professional'
              }
            },
            {
              name: 'Global Business Strategy',
              data: {
                book_title: 'Global Business Strategy: Competing in International Markets',
                author_name: 'Michael Rodriguez',
                author_bio: 'International business expert and former P&G executive with experience in 40+ countries',
                word_count: '20000-25000',
                chapter_count: '8-10',
                tone: 'authoritative',
                accent: 'american',
                target_audience: 'executives',
                industry_focus: 'manufacturing',
                include_case_studies: true,
                include_templates: true,
                include_worksheets: true,
                custom_instructions: 'Focus on market entry strategies, cultural adaptation, and regulatory compliance',
                publishing_format: 'both',
                content_depth: 'comprehensive',
                research_level: 'comprehensive',
                practical_applications: true,
                business_model: 'b2b',
                output_formats: ['pdf', 'docx', 'epub'],
                book_size: 'Letter',
                custom_size: '',
                typography_style: 'professional',
                cover_design: 'professional'
              }
            },
            {
              name: 'Innovation Strategy Framework',
              data: {
                book_title: 'Innovation Strategy: Building Future-Ready Organizations',
                author_name: 'Dr. Anna Kowalski',
                author_bio: 'Innovation strategist and former Google executive specializing in disruptive innovation and R&D strategy',
                word_count: '15000-20000',
                chapter_count: '6-8',
                tone: 'conversational',
                accent: 'american',
                target_audience: 'executives',
                industry_focus: 'technology',
                include_case_studies: true,
                include_templates: true,
                include_worksheets: true,
                custom_instructions: 'Emphasize design thinking, agile innovation, and ecosystem partnerships',
                publishing_format: 'ebook',
                content_depth: 'comprehensive',
                research_level: 'comprehensive',
                practical_applications: true,
                business_model: 'b2b',
                output_formats: ['pdf', 'docx', 'epub'],
                book_size: '6x9',
                custom_size: '',
                typography_style: 'modern',
                cover_design: 'creative'
              }
            }
          ]
        }
      },
      {
        id: 'process-1',
        type: 'process',
        position: { x: 400, y: 100 },
        data: {
          label: 'Market Analysis',
          description: 'Comprehensive market and competitive analysis',
          aiEnabled: true,
          selectedModels: []
        }
      },
      {
        id: 'process-2',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          label: 'Strategy Development',
          description: 'Develop comprehensive business strategy',
          aiEnabled: true,
          selectedModels: []
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 1000, y: 100 },
        data: {
          label: 'Strategy Validation',
          description: 'Validate strategy against market conditions',
          condition: 'market_validation_required'
        }
      },
      {
        id: 'process-3',
        type: 'process',
        position: { x: 1300, y: 50 },
        data: {
          label: 'Implementation Planning',
          description: 'Create detailed implementation roadmap',
          aiEnabled: true,
          selectedModels: []
        }
      },
      {
        id: 'process-4',
        type: 'process',
        position: { x: 1300, y: 150 },
        data: {
          label: 'Risk Assessment',
          description: 'Assess and mitigate strategic risks',
          aiEnabled: true,
          selectedModels: []
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1600, y: 100 },
        data: {
          label: 'Comprehensive Strategy Document',
          description: 'Generate comprehensive strategy document with implementation plan',
          outputFormat: 'multi-format',
          generateCover: true,
          includeTOC: true
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'input-1', target: 'process-1' },
      { id: 'e2', source: 'process-1', target: 'process-2' },
      { id: 'e3', source: 'process-2', target: 'condition-1' },
      { id: 'e4', source: 'condition-1', target: 'process-3', condition: 'validation_passed' },
      { id: 'e5', source: 'condition-1', target: 'process-4', condition: 'validation_failed' },
      { id: 'e6', source: 'process-3', target: 'output-1' },
      { id: 'e7', source: 'process-4', target: 'output-1' }
    ]
  }
}

export default FRAMEWORK_FLOWS

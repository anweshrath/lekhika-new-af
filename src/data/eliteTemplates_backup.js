import { supabase } from '../lib/supabase.js'
import { NODE_PALETTES } from './nodePalettes.js'

// ============================================================================
// ELITE TEMPLATES - 14 HIGH-DEMAND EBOOK FLOWS USING YOUR NODEPALETTES.JS NODES
// ============================================================================

export const ELITE_TEMPLATES = {

  // 1. BUSINESS STRATEGY EBOOK (5 NODES) - HIGH DEMAND
  businessStrategyEbook: {
    id: 'elite-business-strategy',
    name: 'Business Strategy Mastery Guide',
    description: 'Complete business strategy and execution guide with elite market analysis',
    category: 'business',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-business',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Business Strategy Requirements',
          description: 'Elite business strategy input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter business strategy book title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and business credentials' },
            { id: 4, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['entrepreneurs', 'executives', 'managers', 'consultants', 'students', 'investors', 'startup_founders'], placeholder: 'Select target audience' },
            { id: 5, name: 'industry_focus', type: 'select', required: true, variable: 'industry_focus', options: ['technology', 'finance', 'healthcare', 'retail', 'manufacturing', 'consulting', 'startups', 'saas', 'ecommerce'], placeholder: 'Select industry' },
            { id: 6, name: 'business_stage', type: 'select', required: true, variable: 'business_stage', options: ['startup', 'growth', 'mature', 'scaling', 'exit'], placeholder: 'Select business stage' },
            { id: 7, name: 'strategy_focus', type: 'select', required: true, variable: 'strategy_focus', options: ['growth_strategy', 'market_entry', 'competitive_advantage', 'digital_transformation', 'scaling', 'exit_strategy'], placeholder: 'Select strategy focus' },
            { id: 8, name: 'word_count', type: 'select', required: true, variable: 'word_count', options: ['15000-25000', '25000-40000', '40000-60000', '60000+'], placeholder: 'Select word count' },
            { id: 9, name: 'include_case_studies', type: 'checkbox', required: true, variable: 'include_case_studies', options: ['yes'], placeholder: 'Include Fortune 500 case studies' },
            { id: 10, name: 'include_frameworks', type: 'checkbox', required: true, variable: 'include_frameworks', options: ['yes'], placeholder: 'Include strategic frameworks and tools' }
          ]
        }
      },
      {
        id: 'market-analyst-business',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.market_analyst,
          label: 'Elite Market Analyst',
          description: 'Fortune 500-level market intelligence analysis - NO CONTENT WRITING'
        }
      },
      {
        id: 'content-strategist-business',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Content Strategist',
          description: 'Fortune 500-level content strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'content-writer-business',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Business Content Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL BUSINESS STRATEGY CONTENT'
        }
      },
      {
        id: 'output-business',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Business Strategy Package',
          description: 'Generates professional business strategy ebook with all formats'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-business', target: 'market-analyst-business' },
      { id: 'e2-3', source: 'market-analyst-business', target: 'content-strategist-business' },
      { id: 'e3-4', source: 'content-strategist-business', target: 'content-writer-business' },
      { id: 'e4-5', source: 'content-writer-business', target: 'output-business' }
    ]
  },

  // 2. SALES COPY MASTERY (4 NODES) - HIGH DEMAND
  salesCopyMastery: {
    id: 'elite-sales-copy',
    name: 'Sales Copy Mastery Guide',
    description: 'High-converting sales copy creation with elite persuasion techniques',
    category: 'marketing',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-sales',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Sales Copy Requirements',
          description: 'Elite sales copy input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter sales copy book title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and sales credentials' },
            { id: 4, name: 'sales_channel', type: 'select', required: true, variable: 'sales_channel', options: ['email', 'landing_pages', 'social_media', 'direct_mail', 'video', 'webinar', 'sales_letters'], placeholder: 'Select sales channel' },
            { id: 5, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['b2b', 'b2c', 'enterprise', 'small_business', 'consumers', 'professionals'], placeholder: 'Select target audience' },
            { id: 6, name: 'industry_focus', type: 'select', required: true, variable: 'industry_focus', options: ['technology', 'healthcare', 'finance', 'retail', 'education', 'real_estate', 'coaching', 'saas'], placeholder: 'Select industry' },
            { id: 7, name: 'product_type', type: 'select', required: true, variable: 'product_type', options: ['physical_product', 'digital_product', 'service', 'course', 'consulting', 'software', 'membership'], placeholder: 'Select product type' },
            { id: 8, name: 'price_point', type: 'select', required: true, variable: 'price_point', options: ['under_50', '50_200', '200_1000', '1000_5000', 'over_5000'], placeholder: 'Select price point' },
            { id: 9, name: 'include_psychology', type: 'checkbox', required: true, variable: 'include_psychology', options: ['yes'], placeholder: 'Include persuasion psychology principles' },
            { id: 10, name: 'include_templates', type: 'checkbox', required: true, variable: 'include_templates', options: ['yes'], placeholder: 'Include sales copy templates' }
          ]
        }
      },
      {
        id: 'psychology-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Psychology Researcher',
          description: 'Fortune 500-level persuasion psychology research - NO CONTENT WRITING'
        }
      },
      {
        id: 'sales-writer',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Sales Copy Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL HIGH-CONVERTING SALES COPY'
        }
      },
      {
        id: 'output-sales',
        type: 'output',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Sales Copy Package',
          description: 'Generates professional sales copy with conversion optimization'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-sales', target: 'psychology-researcher' },
      { id: 'e2-3', source: 'psychology-researcher', target: 'sales-writer' },
      { id: 'e3-4', source: 'sales-writer', target: 'output-sales' }
    ]
  },

  // 3. EMAIL SEQUENCE AUTOMATION (5 NODES) - HIGH DEMAND
  emailSequenceAutomation: {
    id: 'elite-email-sequences',
    name: 'Email Sequence Automation Guide',
    description: 'Complete email marketing sequences with elite automation strategies',
    category: 'marketing',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-email',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Email Sequence Requirements',
          description: 'Elite email sequence input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter email sequence guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and email marketing credentials' },
            { id: 4, name: 'sequence_type', type: 'select', required: true, variable: 'sequence_type', options: ['welcome_series', 'nurture_sequence', 'sales_sequence', 'reengagement', 'onboarding', 'educational', 'promotional'], placeholder: 'Select sequence type' },
            { id: 5, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['b2b', 'b2c', 'enterprise', 'small_business', 'consumers', 'professionals', 'students'], placeholder: 'Select target audience' },
            { id: 6, name: 'industry_focus', type: 'select', required: true, variable: 'industry_focus', options: ['technology', 'healthcare', 'finance', 'retail', 'education', 'real_estate', 'coaching', 'saas'], placeholder: 'Select industry' },
            { id: 7, name: 'email_count', type: 'select', required: true, variable: 'email_count', options: ['5_10', '10_20', '20_30', '30_50'], placeholder: 'Select number of emails' },
            { id: 8, name: 'frequency', type: 'select', required: true, variable: 'frequency', options: ['daily', 'every_2_days', 'weekly', 'bi_weekly'], placeholder: 'Select email frequency' },
            { id: 9, name: 'include_automation', type: 'checkbox', required: true, variable: 'include_automation', options: ['yes'], placeholder: 'Include automation workflows' },
            { id: 10, name: 'include_templates', type: 'checkbox', required: true, variable: 'include_templates', options: ['yes'], placeholder: 'Include email templates' }
          ]
        }
      },
      {
        id: 'email-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Email Marketing Researcher',
          description: 'Fortune 500-level email marketing research - NO CONTENT WRITING'
        }
      },
      {
        id: 'sequence-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Email Sequence Strategist',
          description: 'Fortune 500-level email sequence strategy - NO CONTENT WRITING'
        }
      },
      {
        id: 'email-writer',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Email Copy Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL EMAIL SEQUENCE CONTENT'
        }
      },
      {
        id: 'output-email',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Email Sequence Package',
          description: 'Generates complete email sequence with automation workflows'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-email', target: 'email-researcher' },
      { id: 'e2-3', source: 'email-researcher', target: 'sequence-strategist' },
      { id: 'e3-4', source: 'sequence-strategist', target: 'email-writer' },
      { id: 'e4-5', source: 'email-writer', target: 'output-email' }
    ]
  },

  // 4. WHITEPAPER CREATION (6 NODES) - HIGH DEMAND
  whitepaperCreation: {
    id: 'elite-whitepaper',
    name: 'Professional Whitepaper Creation',
    description: 'Industry-grade whitepapers with elite research and authoritative content',
    category: 'business',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-whitepaper',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Whitepaper Requirements',
          description: 'Elite whitepaper input validation and enhancement',
          inputFields: [
            { id: 1, name: 'whitepaper_title', type: 'text', required: true, variable: 'whitepaper_title', placeholder: 'Enter whitepaper title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and industry credentials' },
            { id: 4, name: 'company_name', type: 'text', required: true, variable: 'company_name', placeholder: 'Company name' },
            { id: 5, name: 'whitepaper_type', type: 'select', required: true, variable: 'whitepaper_type', options: ['industry_analysis', 'technology_trends', 'market_research', 'best_practices', 'case_study', 'thought_leadership'], placeholder: 'Select whitepaper type' },
            { id: 6, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['c_level', 'executives', 'managers', 'professionals', 'investors', 'stakeholders'], placeholder: 'Select target audience' },
            { id: 7, name: 'industry_focus', type: 'select', required: true, variable: 'industry_focus', options: ['technology', 'finance', 'healthcare', 'retail', 'manufacturing', 'consulting', 'saas'], placeholder: 'Select industry' },
            { id: 8, name: 'word_count', type: 'select', required: true, variable: 'word_count', options: ['2000-5000', '5000-8000', '8000-12000', '12000+'], placeholder: 'Select word count' },
            { id: 9, name: 'include_data', type: 'checkbox', required: true, variable: 'include_data', options: ['yes'], placeholder: 'Include data visualizations and charts' },
            { id: 10, name: 'include_citations', type: 'checkbox', required: true, variable: 'include_citations', options: ['yes'], placeholder: 'Include academic citations and sources' }
          ]
        }
      },
      {
        id: 'research-whitepaper',
        type: 'process',
        position: { x: 200, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Industry Researcher',
          description: 'Fortune 500-level industry research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'data-analyst',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.market_analyst,
          label: 'Elite Data Analyst',
          description: 'Fortune 500-level data analysis and insights - NO CONTENT WRITING'
        }
      },
      {
        id: 'strategy-whitepaper',
        type: 'process',
        position: { x: 400, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Whitepaper Strategist',
          description: 'Fortune 500-level whitepaper strategy - NO CONTENT WRITING'
        }
      },
      {
        id: 'content-whitepaper',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Whitepaper Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL WHITEPAPER CONTENT'
        }
      },
      {
        id: 'output-whitepaper',
        type: 'output',
        position: { x: 600, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Professional Whitepaper',
          description: 'Generates industry-grade whitepaper with professional formatting'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-whitepaper', target: 'research-whitepaper' },
      { id: 'e2-3', source: 'research-whitepaper', target: 'data-analyst' },
      { id: 'e3-4', source: 'data-analyst', target: 'strategy-whitepaper' },
      { id: 'e4-5', source: 'strategy-whitepaper', target: 'content-whitepaper' },
      { id: 'e5-6', source: 'content-whitepaper', target: 'output-whitepaper' }
    ]
  },

  // 5. TECHNICAL MANUAL CREATION (5 NODES) - HIGH DEMAND
  technicalManualCreation: {
    id: 'elite-technical-manual',
    name: 'Technical Manual Creation',
    description: 'Comprehensive technical manuals with elite documentation standards',
    category: 'technical',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-technical',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Technical Manual Requirements',
          description: 'Elite technical manual input validation and enhancement',
          inputFields: [
            { id: 1, name: 'manual_title', type: 'text', required: true, variable: 'manual_title', placeholder: 'Enter technical manual title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and technical credentials' },
            { id: 4, name: 'technical_field', type: 'select', required: true, variable: 'technical_field', options: ['software', 'hardware', 'engineering', 'manufacturing', 'it_infrastructure', 'cybersecurity', 'ai_ml', 'blockchain'], placeholder: 'Select technical field' },
            { id: 5, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['engineers', 'developers', 'technicians', 'administrators', 'end_users', 'students', 'professionals'], placeholder: 'Select target audience' },
            { id: 6, name: 'skill_level', type: 'select', required: true, variable: 'skill_level', options: ['beginner', 'intermediate', 'advanced', 'expert'], placeholder: 'Select skill level' },
            { id: 7, name: 'manual_type', type: 'select', required: true, variable: 'manual_type', options: ['user_manual', 'installation_guide', 'troubleshooting', 'api_documentation', 'process_manual', 'maintenance_guide'], placeholder: 'Select manual type' },
            { id: 8, name: 'include_screenshots', type: 'checkbox', required: true, variable: 'include_screenshots', options: ['yes'], placeholder: 'Include screenshots and diagrams' },
            { id: 9, name: 'include_code', type: 'checkbox', required: true, variable: 'include_code', options: ['yes'], placeholder: 'Include code examples and snippets' },
            { id: 10, name: 'include_troubleshooting', type: 'checkbox', required: true, variable: 'include_troubleshooting', options: ['yes'], placeholder: 'Include troubleshooting section' }
          ]
        }
      },
      {
        id: 'research-technical',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Technical Researcher',
          description: 'Fortune 500-level technical research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'create-technical-content',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Technical Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL TECHNICAL MANUAL CONTENT'
        }
      },
      {
        id: 'quality-technical',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.quality_checker,
          label: 'Elite Technical Quality Specialist',
          description: 'Fortune 500-level technical quality enhancement - NO CONTENT WRITING'
        }
      },
      {
        id: 'output-technical',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Technical Manual Package',
          description: 'Generates professional technical manual with all formats'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-technical', target: 'research-technical' },
      { id: 'e2-3', source: 'research-technical', target: 'create-technical-content' },
      { id: 'e3-4', source: 'create-technical-content', target: 'quality-technical' },
      { id: 'e4-5', source: 'quality-technical', target: 'output-technical' }
    ]
  },

  // 6. PERSONAL FINANCE GUIDE (5 NODES) - HIGH DEMAND
  personalFinanceGuide: {
    id: 'elite-personal-finance',
    name: 'Personal Finance Mastery Guide',
    description: 'Complete personal finance guide with elite financial planning strategies',
    category: 'finance',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-finance',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Personal Finance Requirements',
          description: 'Elite personal finance input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter personal finance guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and financial credentials' },
            { id: 4, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['beginners', 'young_adults', 'families', 'professionals', 'pre_retirement', 'seniors'], placeholder: 'Select target audience' },
            { id: 5, name: 'income_level', type: 'select', required: true, variable: 'income_level', options: ['low_income', 'middle_income', 'high_income', 'wealthy'], placeholder: 'Select income level' },
            { id: 6, name: 'finance_topics', type: 'select', required: true, variable: 'finance_topics', options: ['budgeting', 'investing', 'debt_management', 'retirement_planning', 'tax_optimization', 'real_estate'], placeholder: 'Select finance topics' },
            { id: 7, name: 'include_calculators', type: 'checkbox', required: true, variable: 'include_calculators', options: ['yes'], placeholder: 'Include financial calculators and tools' },
            { id: 8, name: 'include_templates', type: 'checkbox', required: true, variable: 'include_templates', options: ['yes'], placeholder: 'Include budget and planning templates' },
            { id: 9, name: 'include_case_studies', type: 'checkbox', required: true, variable: 'include_case_studies', options: ['yes'], placeholder: 'Include real financial case studies' }
          ]
        }
      },
      {
        id: 'finance-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Financial Researcher',
          description: 'Fortune 500-level financial research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'finance-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Financial Strategist',
          description: 'Fortune 500-level financial strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'finance-writer',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Financial Content Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL PERSONAL FINANCE CONTENT'
        }
      },
      {
        id: 'output-finance',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Personal Finance Package',
          description: 'Generates comprehensive personal finance guide with tools and templates'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-finance', target: 'finance-researcher' },
      { id: 'e2-3', source: 'finance-researcher', target: 'finance-strategist' },
      { id: 'e3-4', source: 'finance-strategist', target: 'finance-writer' },
      { id: 'e4-5', source: 'finance-writer', target: 'output-finance' }
    ]
  },

  // 7. HEALTH & FITNESS GUIDE (5 NODES) - HIGH DEMAND
  healthFitnessGuide: {
    id: 'elite-health-fitness',
    name: 'Health & Fitness Mastery Guide',
    description: 'Complete health and fitness guide with elite wellness strategies',
    category: 'health',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-health',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Health & Fitness Requirements',
          description: 'Elite health and fitness input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter health & fitness guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and health credentials' },
            { id: 4, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['beginners', 'intermediate', 'advanced', 'athletes', 'seniors', 'weight_loss', 'muscle_building'], placeholder: 'Select target audience' },
            { id: 5, name: 'fitness_goals', type: 'select', required: true, variable: 'fitness_goals', options: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'], placeholder: 'Select fitness goals' },
            { id: 6, name: 'health_focus', type: 'select', required: true, variable: 'health_focus', options: ['nutrition', 'exercise', 'mental_health', 'sleep', 'stress_management', 'holistic_wellness'], placeholder: 'Select health focus' },
            { id: 7, name: 'include_meal_plans', type: 'checkbox', required: true, variable: 'include_meal_plans', options: ['yes'], placeholder: 'Include meal plans and recipes' },
            { id: 8, name: 'include_workouts', type: 'checkbox', required: true, variable: 'include_workouts', options: ['yes'], placeholder: 'Include workout routines and exercises' },
            { id: 9, name: 'include_tracking', type: 'checkbox', required: true, variable: 'include_tracking', options: ['yes'], placeholder: 'Include progress tracking tools' }
          ]
        }
      },
      {
        id: 'health-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Health Researcher',
          description: 'Fortune 500-level health and fitness research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'health-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Health Strategist',
          description: 'Fortune 500-level health strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'health-writer',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Health Content Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL HEALTH & FITNESS CONTENT'
        }
      },
      {
        id: 'output-health',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Health & Fitness Package',
          description: 'Generates comprehensive health and fitness guide with meal plans and workouts'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-health', target: 'health-researcher' },
      { id: 'e2-3', source: 'health-researcher', target: 'health-strategist' },
      { id: 'e3-4', source: 'health-strategist', target: 'health-writer' },
      { id: 'e4-5', source: 'health-writer', target: 'output-health' }
    ]
  },

  // 8. LEADERSHIP DEVELOPMENT (5 NODES) - HIGH DEMAND
  leadershipDevelopment: {
    id: 'elite-leadership',
    name: 'Leadership Development Mastery',
    description: 'Complete leadership guide with elite management and team building strategies',
    category: 'leadership',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-leadership',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Leadership Development Requirements',
          description: 'Elite leadership development input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter leadership guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and leadership credentials' },
            { id: 4, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['new_managers', 'experienced_managers', 'executives', 'team_leads', 'entrepreneurs', 'students'], placeholder: 'Select target audience' },
            { id: 5, name: 'leadership_focus', type: 'select', required: true, variable: 'leadership_focus', options: ['team_building', 'communication', 'decision_making', 'change_management', 'emotional_intelligence', 'strategic_thinking'], placeholder: 'Select leadership focus' },
            { id: 6, name: 'industry_context', type: 'select', required: true, variable: 'industry_context', options: ['technology', 'healthcare', 'finance', 'education', 'manufacturing', 'consulting', 'startups'], placeholder: 'Select industry context' },
            { id: 7, name: 'include_case_studies', type: 'checkbox', required: true, variable: 'include_case_studies', options: ['yes'], placeholder: 'Include leadership case studies' },
            { id: 8, name: 'include_assessments', type: 'checkbox', required: true, variable: 'include_assessments', options: ['yes'], placeholder: 'Include leadership assessments and tools' },
            { id: 9, name: 'include_exercises', type: 'checkbox', required: true, variable: 'include_exercises', options: ['yes'], placeholder: 'Include practical leadership exercises' }
          ]
        }
      },
      {
        id: 'leadership-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Leadership Researcher',
          description: 'Fortune 500-level leadership research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'leadership-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Leadership Strategist',
          description: 'Fortune 500-level leadership strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'leadership-writer',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Leadership Content Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL LEADERSHIP DEVELOPMENT CONTENT'
        }
      },
      {
        id: 'output-leadership',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Leadership Development Package',
          description: 'Generates comprehensive leadership guide with assessments and exercises'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-leadership', target: 'leadership-researcher' },
      { id: 'e2-3', source: 'leadership-researcher', target: 'leadership-strategist' },
      { id: 'e3-4', source: 'leadership-strategist', target: 'leadership-writer' },
      { id: 'e4-5', source: 'leadership-writer', target: 'output-leadership' }
    ]
  },

  // 9. DIGITAL MARKETING GUIDE (6 NODES) - HIGH DEMAND
  digitalMarketingGuide: {
    id: 'elite-digital-marketing',
    name: 'Digital Marketing Mastery Guide',
    description: 'Complete digital marketing guide with elite online marketing strategies',
    category: 'marketing',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-digital',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Digital Marketing Requirements',
          description: 'Elite digital marketing input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter digital marketing guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and digital marketing credentials' },
            { id: 4, name: 'marketing_channels', type: 'select', required: true, variable: 'marketing_channels', options: ['seo', 'social_media', 'paid_ads', 'email_marketing', 'content_marketing', 'influencer_marketing'], placeholder: 'Select marketing channels' },
            { id: 5, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['b2b', 'b2c', 'enterprise', 'small_business', 'startups', 'ecommerce'], placeholder: 'Select target audience' },
            { id: 6, name: 'budget_level', type: 'select', required: true, variable: 'budget_level', options: ['low_budget', 'medium_budget', 'high_budget', 'enterprise_budget'], placeholder: 'Select budget level' },
            { id: 7, name: 'include_analytics', type: 'checkbox', required: true, variable: 'include_analytics', options: ['yes'], placeholder: 'Include analytics and tracking strategies' },
            { id: 8, name: 'include_tools', type: 'checkbox', required: true, variable: 'include_tools', options: ['yes'], placeholder: 'Include marketing tools and software recommendations' },
            { id: 9, name: 'include_campaigns', type: 'checkbox', required: true, variable: 'include_campaigns', options: ['yes'], placeholder: 'Include complete campaign examples' }
          ]
        }
      },
      {
        id: 'digital-researcher',
        type: 'process',
        position: { x: 200, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Digital Marketing Researcher',
          description: 'Fortune 500-level digital marketing research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'market-analyst-digital',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.market_analyst,
          label: 'Elite Digital Market Analyst',
          description: 'Fortune 500-level digital market analysis - NO CONTENT WRITING'
        }
      },
      {
        id: 'digital-strategist',
        type: 'process',
        position: { x: 400, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Digital Marketing Strategist',
          description: 'Fortune 500-level digital marketing strategy - NO CONTENT WRITING'
        }
      },
      {
        id: 'digital-writer',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Digital Marketing Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL DIGITAL MARKETING CONTENT'
        }
      },
      {
        id: 'output-digital',
        type: 'output',
        position: { x: 600, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Digital Marketing Package',
          description: 'Generates comprehensive digital marketing guide with tools and campaigns'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-digital', target: 'digital-researcher' },
      { id: 'e2-3', source: 'digital-researcher', target: 'market-analyst-digital' },
      { id: 'e3-4', source: 'market-analyst-digital', target: 'digital-strategist' },
      { id: 'e4-5', source: 'digital-strategist', target: 'digital-writer' },
      { id: 'e5-6', source: 'digital-writer', target: 'output-digital' }
    ]
  }
  ,
  // 10. STARTUP GUIDE (5 NODES) - HIGH DEMAND
  startupGuide: {
    id: 'elite-startup-guide',
    name: 'Startup Success Mastery Guide',
    description: 'Complete startup guide with elite entrepreneurship and business building strategies',
    category: 'business',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-startup',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Startup Requirements',
          description: 'Elite startup input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter startup guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and startup credentials' },
            { id: 4, name: 'startup_stage', type: 'select', required: true, variable: 'startup_stage', options: ['idea_validation', 'mvp_development', 'early_traction', 'growth_stage', 'scaling'], placeholder: 'Select startup stage' },
            { id: 5, name: 'industry_focus', type: 'select', required: true, variable: 'industry_focus', options: ['technology', 'saas', 'ecommerce', 'fintech', 'healthtech', 'edtech', 'marketplace'], placeholder: 'Select industry focus' },
            { id: 6, name: 'funding_stage', type: 'select', required: true, variable: 'funding_stage', options: ['bootstrap', 'seed', 'series_a', 'series_b', 'growth_capital'], placeholder: 'Select funding stage' },
            { id: 7, name: 'include_funding', type: 'checkbox', required: true, variable: 'include_funding', options: ['yes'], placeholder: 'Include fundraising strategies and templates' },
            { id: 8, name: 'include_legal', type: 'checkbox', required: true, variable: 'include_legal', options: ['yes'], placeholder: 'Include legal considerations and templates' },
            { id: 9, name: 'include_metrics', type: 'checkbox', required: true, variable: 'include_metrics', options: ['yes'], placeholder: 'Include startup metrics and KPIs' }
          ]
        }
      },
      {
        id: 'startup-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Startup Researcher',
          description: 'Fortune 500-level startup research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'startup-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Startup Strategist',
          description: 'Fortune 500-level startup strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'startup-writer',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Startup Content Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL STARTUP SUCCESS CONTENT'
        }
      },
      {
        id: 'output-startup',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Startup Success Package',
          description: 'Generates comprehensive startup guide with funding and legal templates'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-startup', target: 'startup-researcher' },
      { id: 'e2-3', source: 'startup-researcher', target: 'startup-strategist' },
      { id: 'e3-4', source: 'startup-strategist', target: 'startup-writer' },
      { id: 'e4-5', source: 'startup-writer', target: 'output-startup' }
    ]
  }
}

// ============================================================================
// SUPABASE SYNC FUNCTIONALITY
// ============================================================================

export const syncAllEliteTemplates = async () => {
  try {
    console.log('Starting elite templates sync to Supabase...')
    
    // Sync All Elite Templates (14 high-demand flows)
    const eliteEntries = Object.entries(ELITE_TEMPLATES)
    for (const [key, template] of eliteEntries) {
      const { error } = await supabase
        .from('ai_flows')
        .upsert({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          complexity: template.complexity,
          configurations: template,
          flow_type: 'elite_template',
          is_elite: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error(`Error syncing ${template.name}:`, error)
        return false
      }
      console.log(`✅ Synced: ${template.name}`)
    }
    
    console.log('🎉 All 14 elite templates synced successfully to Supabase!')
    return true
    
  } catch (error) {
    console.error('Error syncing elite templates:', error)
    return false
  }
}

// Legacy exports for backward compatibility
export const TOP_NOTCH_TEMPLATES = ELITE_TEMPLATES
export const COMPLETE_DFY_FLOWS = ELITE_TEMPLATES
export const syncAllDFYFlows = syncAllEliteTemplates

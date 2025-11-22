import { NODE_PALETTES } from '../nodePalettes.js'

// ============================================================================
// PROFESSIONAL FLOWS - CLEAN & ORGANIZED
// ============================================================================

export const PROFESSIONAL_FLOWS = {

  // 1. LEADERSHIP DEVELOPMENT (5 NODES) - HIGH DEMAND
  leadershipDevelopment: {
    id: 'elite-leadership',
    name: 'Leadership Development Mastery Guide',
    description: 'Complete leadership development guide with elite management and team building strategies',
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
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter leadership development guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and leadership credentials' },
            { id: 4, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['new_managers', 'experienced_leaders', 'executives', 'team_leads', 'entrepreneurs', 'consultants'], placeholder: 'Select target audience' },
            { id: 5, name: 'leadership_level', type: 'select', required: true, variable: 'leadership_level', options: ['individual_contributor', 'team_lead', 'middle_management', 'senior_management', 'executive', 'ceo'], placeholder: 'Select leadership level' },
            { id: 6, name: 'leadership_focus', type: 'select', required: true, variable: 'leadership_focus', options: ['team_building', 'communication', 'decision_making', 'change_management', 'strategic_thinking', 'emotional_intelligence'], placeholder: 'Select leadership focus area' },
            { id: 7, name: 'team_size', type: 'select', required: true, variable: 'team_size', options: ['1_5', '6_15', '16_50', '51_200', '200_plus'], placeholder: 'Select typical team size' },
            { id: 8, name: 'include_case_studies', type: 'checkbox', required: true, variable: 'include_case_studies', options: ['yes'], placeholder: 'Include real-world leadership case studies' },
            { id: 9, name: 'include_tools', type: 'checkbox', required: true, variable: 'include_tools', options: ['yes'], placeholder: 'Include leadership assessment tools' }
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
          label: 'Elite Leadership Development Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL LEADERSHIP DEVELOPMENT MASTERY CONTENT'
        }
      },
      {
        id: 'output-leadership',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Leadership Development Mastery Package',
          description: 'Generates comprehensive leadership development guide with strategies and tools'
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

  // 2. TECHNICAL MANUAL CREATION (5 NODES) - HIGH DEMAND
  technicalManualCreation: {
    id: 'elite-technical-manual',
    name: 'Technical Manual Creation Guide',
    description: 'Complete technical manual creation guide with elite documentation and training strategies',
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
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter technical manual title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and technical credentials' },
            { id: 4, name: 'technical_domain', type: 'select', required: true, variable: 'technical_domain', options: ['software', 'hardware', 'engineering', 'manufacturing', 'scientific', 'medical'], placeholder: 'Select technical domain' },
            { id: 5, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['beginners', 'intermediate', 'advanced', 'professionals', 'technicians', 'engineers'], placeholder: 'Select target audience' },
            { id: 6, name: 'manual_type', type: 'select', required: true, variable: 'manual_type', options: ['user_manual', 'installation_guide', 'troubleshooting_guide', 'training_manual', 'reference_guide', 'safety_manual'], placeholder: 'Select manual type' },
            { id: 7, name: 'complexity_level', type: 'select', required: true, variable: 'complexity_level', options: ['basic', 'intermediate', 'advanced', 'expert'], placeholder: 'Select complexity level' },
            { id: 8, name: 'include_diagrams', type: 'checkbox', required: true, variable: 'include_diagrams', options: ['yes'], placeholder: 'Include technical diagrams and illustrations' },
            { id: 9, name: 'include_troubleshooting', type: 'checkbox', required: true, variable: 'include_troubleshooting', options: ['yes'], placeholder: 'Include troubleshooting sections' },
            { id: 10, name: 'include_examples', type: 'checkbox', required: true, variable: 'include_examples', options: ['yes'], placeholder: 'Include practical examples and case studies' }
          ]
        }
      },
      {
        id: 'technical-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Technical Researcher',
          description: 'Fortune 500-level technical research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'technical-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Technical Documentation Strategist',
          description: 'Fortune 500-level technical documentation strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'technical-writer',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Technical Manual Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL TECHNICAL MANUAL MASTERY CONTENT'
        }
      },
      {
        id: 'output-technical',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Technical Manual Mastery Package',
          description: 'Generates comprehensive technical manual with documentation and examples'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-technical', target: 'technical-researcher' },
      { id: 'e2-3', source: 'technical-researcher', target: 'technical-strategist' },
      { id: 'e3-4', source: 'technical-strategist', target: 'technical-writer' },
      { id: 'e4-5', source: 'technical-writer', target: 'output-technical' }
    ]
  },

  // 3. STARTUP GUIDE (5 NODES) - HIGH DEMAND
  startupGuide: {
    id: 'elite-startup-guide',
    name: 'Startup Mastery Guide',
    description: 'Complete startup guide with elite entrepreneurship and business development strategies',
    category: 'startup',
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
            { id: 4, name: 'startup_stage', type: 'select', required: true, variable: 'startup_stage', options: ['idea_phase', 'pre_seed', 'seed_stage', 'series_a', 'growth_stage', 'scale_up'], placeholder: 'Select startup stage' },
            { id: 5, name: 'industry_type', type: 'select', required: true, variable: 'industry_type', options: ['technology', 'fintech', 'healthcare', 'ecommerce', 'saas', 'biotech', 'edtech'], placeholder: 'Select industry type' },
            { id: 6, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['first_time_founders', 'serial_entrepreneurs', 'students', 'corporate_entrepreneurs', 'investors'], placeholder: 'Select target audience' },
            { id: 7, name: 'funding_goal', type: 'select', required: true, variable: 'funding_goal', options: ['bootstrap', 'under_100k', '100k_500k', '500k_2m', '2m_10m', '10m_plus'], placeholder: 'Select funding goal' },
            { id: 8, name: 'include_funding', type: 'checkbox', required: true, variable: 'include_funding', options: ['yes'], placeholder: 'Include fundraising strategies' },
            { id: 9, name: 'include_legal', type: 'checkbox', required: true, variable: 'include_legal', options: ['yes'], placeholder: 'Include legal and compliance guidance' },
            { id: 10, name: 'include_case_studies', type: 'checkbox', required: true, variable: 'include_case_studies', options: ['yes'], placeholder: 'Include successful startup case studies' }
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
          label: 'Elite Startup Guide Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL STARTUP MASTERY CONTENT'
        }
      },
      {
        id: 'output-startup',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Startup Mastery Package',
          description: 'Generates comprehensive startup guide with strategies and case studies'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-startup', target: 'startup-researcher' },
      { id: 'e2-3', source: 'startup-researcher', target: 'startup-strategist' },
      { id: 'e3-4', source: 'startup-strategist', target: 'startup-writer' },
      { id: 'e4-5', source: 'startup-writer', target: 'output-startup' }
    ]
  },

  // 4. WHITEPAPER CREATION (6 NODES) - HIGH DEMAND
  whitepaperCreation: {
    id: 'elite-whitepaper',
    name: 'Whitepaper Creation Mastery Guide',
    description: 'Complete whitepaper creation guide with elite research and thought leadership strategies',
    category: 'whitepaper',
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
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter whitepaper title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and industry credentials' },
            { id: 4, name: 'industry_focus', type: 'select', required: true, variable: 'industry_focus', options: ['technology', 'finance', 'healthcare', 'education', 'manufacturing', 'consulting'], placeholder: 'Select industry focus' },
            { id: 5, name: 'whitepaper_type', type: 'select', required: true, variable: 'whitepaper_type', options: ['research_based', 'thought_leadership', 'technical_analysis', 'market_analysis', 'policy_analysis', 'case_study'], placeholder: 'Select whitepaper type' },
            { id: 6, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['industry_experts', 'decision_makers', 'researchers', 'academics', 'investors', 'general_public'], placeholder: 'Select target audience' },
            { id: 7, name: 'research_depth', type: 'select', required: true, variable: 'research_depth', options: ['basic', 'intermediate', 'comprehensive', 'academic_level'], placeholder: 'Select research depth' },
            { id: 8, name: 'include_data', type: 'checkbox', required: true, variable: 'include_data', options: ['yes'], placeholder: 'Include data analysis and statistics' },
            { id: 9, name: 'include_references', type: 'checkbox', required: true, variable: 'include_references', options: ['yes'], placeholder: 'Include citations and references' },
            { id: 10, name: 'include_recommendations', type: 'checkbox', required: true, variable: 'include_recommendations', options: ['yes'], placeholder: 'Include actionable recommendations' }
          ]
        }
      },
      {
        id: 'whitepaper-researcher',
        type: 'process',
        position: { x: 200, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Whitepaper Researcher',
          description: 'Fortune 500-level whitepaper research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'whitepaper-strategist',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Whitepaper Strategist',
          description: 'Fortune 500-level whitepaper strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'whitepaper-writer',
        type: 'process',
        position: { x: 400, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Whitepaper Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL WHITEPAPER MASTERY CONTENT'
        }
      },
      {
        id: 'quality-whitepaper',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.quality_checker,
          label: 'Elite Whitepaper Quality Specialist',
          description: 'Fortune 500-level whitepaper quality enhancement - NO CONTENT WRITING'
        }
      },
      {
        id: 'output-whitepaper',
        type: 'output',
        position: { x: 600, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Whitepaper Mastery Package',
          description: 'Generates professional whitepaper with research and recommendations'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-whitepaper', target: 'whitepaper-researcher' },
      { id: 'e2-3', source: 'whitepaper-researcher', target: 'whitepaper-strategist' },
      { id: 'e3-4', source: 'whitepaper-strategist', target: 'whitepaper-writer' },
      { id: 'e4-5', source: 'whitepaper-writer', target: 'quality-whitepaper' },
      { id: 'e5-6', source: 'quality-whitepaper', target: 'output-whitepaper' }
    ]
  }

}

// ============================================================================
// SYNC FUNCTION FOR PROFESSIONAL FLOWS
// ============================================================================

export const syncProfessionalFlows = async (supabase) => {
  try {
    console.log('Starting professional flows sync to Supabase...')

    const professionalEntries = Object.entries(PROFESSIONAL_FLOWS)
    for (const [key, template] of professionalEntries) {
      const { error } = await supabase
        .from('ai_flows')
        .upsert({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          complexity: template.complexity,
          configurations: template,
          flow_type: 'professional_flow',
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

    console.log('🎉 All professional flows synced successfully to Supabase!')
    return true

  } catch (error) {
    console.error('Error syncing professional flows:', error)
    return false
  }
}

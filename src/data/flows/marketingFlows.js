import { NODE_PALETTES } from '../nodePalettes.js'

// ============================================================================
// MARKETING FLOWS - CLEAN & ORGANIZED
// ============================================================================

export const MARKETING_FLOWS = {

  // 1. EMAIL SEQUENCE AUTOMATION (5 NODES) - HIGH DEMAND
  emailSequenceAutomation: {
    id: 'elite-email-sequences',
    name: 'Email Sequence Automation Guide',
    description: 'Complete email marketing automation with elite sequences and conversion strategies',
    category: 'email_marketing',
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
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter email marketing guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and email marketing credentials' },
            { id: 4, name: 'business_type', type: 'select', required: true, variable: 'business_type', options: ['saas', 'ecommerce', 'coaching', 'consulting', 'digital_products', 'physical_products'], placeholder: 'Select business type' },
            { id: 5, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['b2b', 'b2c', 'enterprise', 'small_business', 'consumers', 'professionals'], placeholder: 'Select target audience' },
            { id: 6, name: 'sequence_type', type: 'select', required: true, variable: 'sequence_type', options: ['welcome_series', 'nurture_sequence', 'sales_sequence', 'reengagement', 'onboarding', 'retention'], placeholder: 'Select sequence type' },
            { id: 7, name: 'email_count', type: 'select', required: true, variable: 'email_count', options: ['5-10', '10-15', '15-20', '20-30', '30+'], placeholder: 'Select number of emails' },
            { id: 8, name: 'include_templates', type: 'checkbox', required: true, variable: 'include_templates', options: ['yes'], placeholder: 'Include email templates' },
            { id: 9, name: 'include_automation', type: 'checkbox', required: true, variable: 'include_automation', options: ['yes'], placeholder: 'Include automation workflows' },
            { id: 10, name: 'include_analytics', type: 'checkbox', required: true, variable: 'include_analytics', options: ['yes'], placeholder: 'Include tracking and analytics' }
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
          description: 'Fortune 500-level email marketing research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'email-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Email Strategist',
          description: 'Fortune 500-level email strategy development - NO CONTENT WRITING'
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
          description: 'Generates comprehensive email sequence guide with templates and automation'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-email', target: 'email-researcher' },
      { id: 'e2-3', source: 'email-researcher', target: 'email-strategist' },
      { id: 'e3-4', source: 'email-strategist', target: 'email-writer' },
      { id: 'e4-5', source: 'email-writer', target: 'output-email' }
    ]
  },

  // 2. DIGITAL MARKETING GUIDE (6 NODES) - HIGH DEMAND
  digitalMarketingGuide: {
    id: 'elite-digital-marketing',
    name: 'Digital Marketing Mastery Guide',
    description: 'Complete digital marketing guide with elite strategies and execution frameworks',
    category: 'digital_marketing',
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
            { id: 4, name: 'business_type', type: 'select', required: true, variable: 'business_type', options: ['saas', 'ecommerce', 'service_based', 'b2b', 'b2c', 'startup'], placeholder: 'Select business type' },
            { id: 5, name: 'marketing_channels', type: 'select', required: true, variable: 'marketing_channels', options: ['social_media', 'seo', 'paid_ads', 'content_marketing', 'email_marketing', 'influencer_marketing'], placeholder: 'Select marketing channels' },
            { id: 6, name: 'budget_range', type: 'select', required: true, variable: 'budget_range', options: ['under_1k', '1k_5k', '5k_25k', '25k_100k', '100k_plus'], placeholder: 'Select budget range' },
            { id: 7, name: 'include_strategies', type: 'checkbox', required: true, variable: 'include_strategies', options: ['yes'], placeholder: 'Include proven marketing strategies' },
            { id: 8, name: 'include_tools', type: 'checkbox', required: true, variable: 'include_tools', options: ['yes'], placeholder: 'Include marketing tools and platforms' },
            { id: 9, name: 'include_analytics', type: 'checkbox', required: true, variable: 'include_analytics', options: ['yes'], placeholder: 'Include tracking and analytics setup' }
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
        id: 'digital-strategist',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Digital Marketing Strategist',
          description: 'Fortune 500-level digital marketing strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'digital-writer',
        type: 'process',
        position: { x: 400, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Digital Marketing Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL DIGITAL MARKETING MASTERY CONTENT'
        }
      },
      {
        id: 'quality-digital',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.quality_checker,
          label: 'Elite Digital Marketing Quality Specialist',
          description: 'Fortune 500-level digital marketing quality enhancement - NO CONTENT WRITING'
        }
      },
      {
        id: 'output-digital',
        type: 'output',
        position: { x: 600, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Digital Marketing Mastery Package',
          description: 'Generates comprehensive digital marketing guide with strategies and tools'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-digital', target: 'digital-researcher' },
      { id: 'e2-3', source: 'digital-researcher', target: 'digital-strategist' },
      { id: 'e3-4', source: 'digital-strategist', target: 'digital-writer' },
      { id: 'e4-5', source: 'digital-writer', target: 'quality-digital' },
      { id: 'e5-6', source: 'quality-digital', target: 'output-digital' }
    ]
  },

  // 3. COPYWRITING MASTERY (5 NODES) - HIGH DEMAND
  copywritingMastery: {
    id: 'elite-copywriting',
    name: 'Copywriting Mastery Guide',
    description: 'Complete copywriting guide with elite persuasion and conversion strategies',
    category: 'copywriting',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-copywriting',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Copywriting Requirements',
          description: 'Elite copywriting input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter copywriting guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and copywriting credentials' },
            { id: 4, name: 'copywriting_type', type: 'select', required: true, variable: 'copywriting_type', options: ['sales_copy', 'email_copy', 'web_copy', 'ad_copy', 'social_media_copy', 'content_copy'], placeholder: 'Select copywriting type' },
            { id: 5, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['b2b', 'b2c', 'enterprise', 'small_business', 'consumers', 'professionals'], placeholder: 'Select target audience' },
            { id: 6, name: 'industry_focus', type: 'select', required: true, variable: 'industry_focus', options: ['technology', 'healthcare', 'finance', 'retail', 'education', 'real_estate', 'coaching'], placeholder: 'Select industry focus' },
            { id: 7, name: 'include_psychology', type: 'checkbox', required: true, variable: 'include_psychology', options: ['yes'], placeholder: 'Include persuasion psychology principles' },
            { id: 8, name: 'include_formulas', type: 'checkbox', required: true, variable: 'include_formulas', options: ['yes'], placeholder: 'Include proven copywriting formulas' },
            { id: 9, name: 'include_examples', type: 'checkbox', required: true, variable: 'include_examples', options: ['yes'], placeholder: 'Include real-world copy examples' }
          ]
        }
      },
      {
        id: 'copywriting-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Copywriting Researcher',
          description: 'Fortune 500-level copywriting research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'copywriting-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Copywriting Strategist',
          description: 'Fortune 500-level copywriting strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'copywriting-writer',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Copywriting Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL COPYWRITING MASTERY CONTENT'
        }
      },
      {
        id: 'output-copywriting',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Copywriting Mastery Package',
          description: 'Generates comprehensive copywriting guide with formulas and examples'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-copywriting', target: 'copywriting-researcher' },
      { id: 'e2-3', source: 'copywriting-researcher', target: 'copywriting-strategist' },
      { id: 'e3-4', source: 'copywriting-strategist', target: 'copywriting-writer' },
      { id: 'e4-5', source: 'copywriting-writer', target: 'output-copywriting' }
    ]
  }

}

// ============================================================================
// SYNC FUNCTION FOR MARKETING FLOWS
// ============================================================================

export const syncMarketingFlows = async (supabase) => {
  try {
    console.log('Starting marketing flows sync to Supabase...')

    const marketingEntries = Object.entries(MARKETING_FLOWS)
    for (const [key, template] of marketingEntries) {
      const { error } = await supabase
        .from('ai_flows')
        .upsert({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          complexity: template.complexity,
          configurations: template,
          flow_type: 'marketing_flow',
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

    console.log('🎉 All marketing flows synced successfully to Supabase!')
    return true

  } catch (error) {
    console.error('Error syncing marketing flows:', error)
    return false
  }
}

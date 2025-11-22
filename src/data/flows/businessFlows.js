import { NODE_PALETTES } from '../nodePalettes.js'

// ============================================================================
// BUSINESS FLOWS - CLEAN & ORGANIZED
// ============================================================================

export const BUSINESS_FLOWS = {

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
    description: 'Complete sales copywriting guide with elite persuasion and conversion strategies',
    category: 'sales',
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
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter sales copy guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and sales credentials' },
            { id: 4, name: 'product_type', type: 'select', required: true, variable: 'product_type', options: ['digital_products', 'physical_products', 'services', 'courses', 'software', 'consulting'], placeholder: 'Select product type' },
            { id: 5, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['b2b', 'b2c', 'enterprise', 'small_business', 'consumers', 'professionals'], placeholder: 'Select target audience' },
            { id: 6, name: 'sales_channel', type: 'select', required: true, variable: 'sales_channel', options: ['direct_sales', 'online_marketing', 'email_marketing', 'social_media', 'advertising', 'affiliate_marketing'], placeholder: 'Select sales channel' },
            { id: 7, name: 'include_psychology', type: 'checkbox', required: true, variable: 'include_psychology', options: ['yes'], placeholder: 'Include persuasion psychology principles' },
            { id: 8, name: 'include_formulas', type: 'checkbox', required: true, variable: 'include_formulas', options: ['yes'], placeholder: 'Include proven sales copy formulas' },
            { id: 9, name: 'include_examples', type: 'checkbox', required: true, variable: 'include_examples', options: ['yes'], placeholder: 'Include real-world sales copy examples' }
          ]
        }
      },
      {
        id: 'sales-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Sales Researcher',
          description: 'Fortune 500-level sales research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'sales-writer',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Sales Copy Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL SALES COPY MASTERY CONTENT'
        }
      },
      {
        id: 'output-sales',
        type: 'output',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Sales Copy Mastery Package',
          description: 'Generates comprehensive sales copy guide with formulas and examples'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-sales', target: 'sales-researcher' },
      { id: 'e2-3', source: 'sales-researcher', target: 'sales-writer' },
      { id: 'e3-4', source: 'sales-writer', target: 'output-sales' }
    ]
  }

}

// ============================================================================
// SYNC FUNCTION FOR BUSINESS FLOWS
// ============================================================================

export const syncBusinessFlows = async (supabase) => {
  try {
    console.log('Starting business flows sync to Supabase...')

    const businessEntries = Object.entries(BUSINESS_FLOWS)
    for (const [key, template] of businessEntries) {
      const { error } = await supabase
        .from('ai_flows')
        .upsert({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          complexity: template.complexity,
          configurations: template,
          flow_type: 'business_flow',
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

    console.log('🎉 All business flows synced successfully to Supabase!')
    return true

  } catch (error) {
    console.error('Error syncing business flows:', error)
    return false
  }
}

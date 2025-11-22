import { NODE_PALETTES } from '../nodePalettes.js'

// ============================================================================
// FINANCE FLOWS - CLEAN & ORGANIZED
// ============================================================================

export const FINANCE_FLOWS = {

  // 1. PERSONAL FINANCE GUIDE (5 NODES) - HIGH DEMAND
  personalFinanceGuide: {
    id: 'elite-personal-finance',
    name: 'Personal Finance Mastery Guide',
    description: 'Complete personal finance guide with elite money management and wealth building strategies',
    category: 'personal_finance',
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
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and finance credentials' },
            { id: 4, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['beginners', 'intermediate', 'advanced', 'young_adults', 'families', 'professionals'], placeholder: 'Select target audience' },
            { id: 5, name: 'income_level', type: 'select', required: true, variable: 'income_level', options: ['under_30k', '30k_50k', '50k_100k', '100k_200k', '200k_plus'], placeholder: 'Select income level' },
            { id: 6, name: 'financial_goals', type: 'select', required: true, variable: 'financial_goals', options: ['debt_freedom', 'emergency_fund', 'home_purchase', 'retirement', 'wealth_building', 'financial_independence'], placeholder: 'Select primary financial goal' },
            { id: 7, name: 'include_budgeting', type: 'checkbox', required: true, variable: 'include_budgeting', options: ['yes'], placeholder: 'Include budgeting strategies and tools' },
            { id: 8, name: 'include_investing', type: 'checkbox', required: true, variable: 'include_investing', options: ['yes'], placeholder: 'Include investment basics and strategies' },
            { id: 9, name: 'include_tools', type: 'checkbox', required: true, variable: 'include_tools', options: ['yes'], placeholder: 'Include financial tools and calculators' }
          ]
        }
      },
      {
        id: 'finance-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Personal Finance Researcher',
          description: 'Fortune 500-level personal finance research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'finance-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Personal Finance Strategist',
          description: 'Fortune 500-level personal finance strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'finance-writer',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Personal Finance Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL PERSONAL FINANCE MASTERY CONTENT'
        }
      },
      {
        id: 'output-finance',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Personal Finance Mastery Package',
          description: 'Generates comprehensive personal finance guide with tools and strategies'
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

  // 2. INVESTMENT GUIDE (5 NODES) - HIGH DEMAND
  investmentGuide: {
    id: 'elite-investment',
    name: 'Investment Mastery Guide',
    description: 'Complete investment guide with elite financial planning and wealth building strategies',
    category: 'investment',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-investment',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Investment Requirements',
          description: 'Elite investment input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter investment guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and investment credentials' },
            { id: 4, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['beginners', 'intermediate', 'advanced', 'retirees', 'young_adults', 'professionals'], placeholder: 'Select target audience' },
            { id: 5, name: 'investment_type', type: 'select', required: true, variable: 'investment_type', options: ['stocks', 'bonds', 'real_estate', 'crypto', 'mutual_funds', 'etfs', 'alternative_investments'], placeholder: 'Select investment type' },
            { id: 6, name: 'risk_tolerance', type: 'select', required: true, variable: 'risk_tolerance', options: ['conservative', 'moderate', 'aggressive', 'very_aggressive'], placeholder: 'Select risk tolerance' },
            { id: 7, name: 'investment_goal', type: 'select', required: true, variable: 'investment_goal', options: ['retirement', 'wealth_building', 'income_generation', 'capital_preservation', 'short_term_gains'], placeholder: 'Select investment goal' },
            { id: 8, name: 'include_strategies', type: 'checkbox', required: true, variable: 'include_strategies', options: ['yes'], placeholder: 'Include proven investment strategies' },
            { id: 9, name: 'include_tools', type: 'checkbox', required: true, variable: 'include_tools', options: ['yes'], placeholder: 'Include investment tools and calculators' },
            { id: 10, name: 'include_portfolios', type: 'checkbox', required: true, variable: 'include_portfolios', options: ['yes'], placeholder: 'Include sample portfolio examples' }
          ]
        }
      },
      {
        id: 'investment-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Investment Researcher',
          description: 'Fortune 500-level investment research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'investment-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Investment Strategist',
          description: 'Fortune 500-level investment strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'investment-writer',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Investment Content Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL INVESTMENT MASTERY CONTENT'
        }
      },
      {
        id: 'output-investment',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Investment Mastery Package',
          description: 'Generates comprehensive investment guide with strategies and tools'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-investment', target: 'investment-researcher' },
      { id: 'e2-3', source: 'investment-researcher', target: 'investment-strategist' },
      { id: 'e3-4', source: 'investment-strategist', target: 'investment-writer' },
      { id: 'e4-5', source: 'investment-writer', target: 'output-investment' }
    ]
  }

}

// ============================================================================
// SYNC FUNCTION FOR FINANCE FLOWS
// ============================================================================

export const syncFinanceFlows = async (supabase) => {
  try {
    console.log('Starting finance flows sync to Supabase...')

    const financeEntries = Object.entries(FINANCE_FLOWS)
    for (const [key, template] of financeEntries) {
      const { error } = await supabase
        .from('ai_flows')
        .upsert({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          complexity: template.complexity,
          configurations: template,
          flow_type: 'finance_flow',
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

    console.log('🎉 All finance flows synced successfully to Supabase!')
    return true

  } catch (error) {
    console.error('Error syncing finance flows:', error)
    return false
  }
}

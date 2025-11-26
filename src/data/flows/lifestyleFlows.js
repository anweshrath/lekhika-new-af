import { NODE_PALETTES } from '../nodePalettes.js'

// ============================================================================
// LIFESTYLE FLOWS - CLEAN & ORGANIZED
// ============================================================================

export const LIFESTYLE_FLOWS = {

  // 1. HEALTH & FITNESS GUIDE (5 NODES) - HIGH DEMAND
  healthFitnessGuide: {
    id: 'elite-health-fitness',
    name: 'Health & Fitness Mastery Guide',
    description: 'Complete health and fitness guide with elite wellness strategies and workout plans',
    category: 'health_fitness',
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
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter health and fitness guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and health credentials' },
            { id: 4, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['beginners', 'intermediate', 'advanced', 'seniors', 'athletes', 'busy_professionals'], placeholder: 'Select target audience' },
            { id: 5, name: 'fitness_goal', type: 'select', required: true, variable: 'fitness_goal', options: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'], placeholder: 'Select primary fitness goal' },
            { id: 6, name: 'workout_setting', type: 'select', required: true, variable: 'workout_setting', options: ['home', 'gym', 'outdoor', 'mixed', 'travel_friendly'], placeholder: 'Select workout setting' },
            { id: 7, name: 'time_commitment', type: 'select', required: true, variable: 'time_commitment', options: ['15_30_min', '30_45_min', '45_60_min', '60_90_min', 'flexible'], placeholder: 'Select time commitment' },
            { id: 8, name: 'include_nutrition', type: 'checkbox', required: true, variable: 'include_nutrition', options: ['yes'], placeholder: 'Include nutrition and meal planning' },
            { id: 9, name: 'include_mindfulness', type: 'checkbox', required: true, variable: 'include_mindfulness', options: ['yes'], placeholder: 'Include mindfulness and recovery' }
          ]
        }
      },
      {
        id: 'health-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Health & Fitness Researcher',
          description: 'Fortune 500-level health and fitness research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'health-strategist',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Health & Fitness Strategist',
          description: 'Fortune 500-level health and fitness strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'health-writer',
        type: 'process',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Health & Fitness Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL HEALTH AND FITNESS MASTERY CONTENT'
        }
      },
      {
        id: 'output-health',
        type: 'output',
        position: { x: 900, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Health & Fitness Mastery Package',
          description: 'Generates comprehensive health and fitness guide with workout plans and nutrition'
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

  // 2. PRODUCTIVITY MASTERY (4 NODES) - HIGH DEMAND
  productivityMastery: {
    id: 'elite-productivity',
    name: 'Productivity Mastery Guide',
    description: 'Complete productivity guide with elite time management and efficiency strategies',
    category: 'productivity',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-productivity',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Productivity Requirements',
          description: 'Elite productivity input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter productivity guide title' },
            { id: 2, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 3, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and productivity credentials' },
            { id: 4, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['entrepreneurs', 'professionals', 'students', 'remote_workers', 'executives', 'freelancers'], placeholder: 'Select target audience' },
            { id: 5, name: 'productivity_focus', type: 'select', required: true, variable: 'productivity_focus', options: ['time_management', 'task_organization', 'goal_setting', 'focus_techniques', 'workflow_optimization', 'energy_management'], placeholder: 'Select productivity focus' },
            { id: 6, name: 'work_environment', type: 'select', required: true, variable: 'work_environment', options: ['office', 'remote', 'hybrid', 'freelance', 'entrepreneur'], placeholder: 'Select work environment' },
            { id: 7, name: 'include_tools', type: 'checkbox', required: true, variable: 'include_tools', options: ['yes'], placeholder: 'Include productivity tools and apps' },
            { id: 8, name: 'include_templates', type: 'checkbox', required: true, variable: 'include_templates', options: ['yes'], placeholder: 'Include productivity templates and planners' },
            { id: 9, name: 'include_techniques', type: 'checkbox', required: true, variable: 'include_techniques', options: ['yes'], placeholder: 'Include proven productivity techniques' }
          ]
        }
      },
      {
        id: 'productivity-researcher',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Productivity Researcher',
          description: 'Fortune 500-level productivity research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'productivity-writer',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Productivity Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL PRODUCTIVITY MASTERY CONTENT'
        }
      },
      {
        id: 'output-productivity',
        type: 'output',
        position: { x: 700, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Productivity Mastery Package',
          description: 'Generates comprehensive productivity guide with tools and templates'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-productivity', target: 'productivity-researcher' },
      { id: 'e2-3', source: 'productivity-researcher', target: 'productivity-writer' },
      { id: 'e3-4', source: 'productivity-writer', target: 'output-productivity' }
    ]
  },

  // 3. BIOGRAPHY & MEMOIR CREATION (6 NODES) - HIGH DEMAND
  biographyMemoirCreation: {
    id: 'elite-biography-memoir',
    name: 'Biography & Memoir Creation Guide',
    description: 'Complete biography and memoir writing guide with elite storytelling and narrative strategies',
    category: 'biography',
    complexity: 'comprehensive',
    nodes: [
      {
        id: 'input-biography',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_PALETTES.input.universal_input,
          label: 'Biography & Memoir Requirements',
          description: 'Elite biography and memoir input validation and enhancement',
          inputFields: [
            { id: 1, name: 'book_title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter biography/memoir title' },
            { id: 2, name: 'subject_name', type: 'text', required: true, variable: 'subject_name', placeholder: 'Subject name (person being written about)' },
            { id: 3, name: 'author_name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author name' },
            { id: 4, name: 'author_bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Author biography and writing credentials' },
            { id: 5, name: 'book_type', type: 'select', required: true, variable: 'book_type', options: ['biography', 'autobiography', 'memoir', 'family_history', 'corporate_biography', 'celebrity_biography'], placeholder: 'Select book type' },
            { id: 6, name: 'target_audience', type: 'select', required: true, variable: 'target_audience', options: ['general_public', 'family_members', 'professionals', 'students', 'historians', 'fans'], placeholder: 'Select target audience' },
            { id: 7, name: 'time_period', type: 'select', required: true, variable: 'time_period', options: ['childhood', 'early_life', 'career_highlights', 'entire_life', 'specific_decade', 'recent_years'], placeholder: 'Select time period focus' },
            { id: 8, name: 'include_photos', type: 'checkbox', required: true, variable: 'include_photos', options: ['yes'], placeholder: 'Include photo sections and captions' },
            { id: 9, name: 'include_timeline', type: 'checkbox', required: true, variable: 'include_timeline', options: ['yes'], placeholder: 'Include chronological timeline' },
            { id: 10, name: 'include_interviews', type: 'checkbox', required: true, variable: 'include_interviews', options: ['yes'], placeholder: 'Include interview questions and frameworks' }
          ]
        }
      },
      {
        id: 'biography-researcher',
        type: 'process',
        position: { x: 200, y: 100 },
        data: {
          ...NODE_PALETTES.process.researcher,
          label: 'Elite Biography Researcher',
          description: 'Fortune 500-level biographical research intelligence - NO CONTENT WRITING'
        }
      },
      {
        id: 'story-strategist',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_strategist,
          label: 'Elite Story Strategist',
          description: 'Fortune 500-level narrative strategy development - NO CONTENT WRITING'
        }
      },
      {
        id: 'biography-writer',
        type: 'process',
        position: { x: 400, y: 100 },
        data: {
          ...NODE_PALETTES.process.content_writer,
          label: 'Elite Biography Writer',
          description: 'ONLY NODE THAT WRITES ACTUAL BIOGRAPHY AND MEMOIR CONTENT'
        }
      },
      {
        id: 'quality-biography',
        type: 'process',
        position: { x: 500, y: 100 },
        data: {
          ...NODE_PALETTES.process.quality_checker,
          label: 'Elite Biography Quality Specialist',
          description: 'Fortune 500-level biographical quality enhancement - NO CONTENT WRITING'
        }
      },
      {
        id: 'output-biography',
        type: 'output',
        position: { x: 600, y: 100 },
        data: {
          ...NODE_PALETTES.output.universal_output,
          label: 'Biography & Memoir Package',
          description: 'Generates professional biography/memoir with all formats and supporting materials'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-biography', target: 'biography-researcher' },
      { id: 'e2-3', source: 'biography-researcher', target: 'story-strategist' },
      { id: 'e3-4', source: 'story-strategist', target: 'biography-writer' },
      { id: 'e4-5', source: 'biography-writer', target: 'quality-biography' },
      { id: 'e5-6', source: 'quality-biography', target: 'output-biography' }
    ]
  }

}

// ============================================================================
// SYNC FUNCTION FOR LIFESTYLE FLOWS
// ============================================================================

export const syncLifestyleFlows = async (supabase) => {
  try {
    console.log('Starting lifestyle flows sync to Supabase...')

    const lifestyleEntries = Object.entries(LIFESTYLE_FLOWS)
    for (const [key, template] of lifestyleEntries) {
      const { error } = await supabase
        .from('ai_flows')
        .upsert({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          complexity: template.complexity,
          configurations: template,
          flow_type: 'lifestyle_flow',
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

    console.log('🎉 All lifestyle flows synced successfully to Supabase!')
    return true

  } catch (error) {
    console.error('Error syncing lifestyle flows:', error)
    return false
  }
}

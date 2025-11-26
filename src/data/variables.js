// TOP 50 UNIVERSAL VARIABLES - MOST USED ACROSS ALL CONTENT TYPES
// Clean, standardized, with tooltips for user-friendly experience

import { getSpecialtyVariables } from './specialtyVariables.js'

export const getAllAvailableVariables = () => {
  const universalVariables = [
    
    // ==================== CORE CONTENT VARIABLES ====================
    { variable: 'book_title', name: 'Book Title', type: 'text', required: true, placeholder: 'Enter your book title', options: [], description: 'Main title of your book or content piece', category: 'universal' },
    { variable: 'author_name', name: 'Author Name', type: 'text', required: true, placeholder: 'Enter your name', options: [], description: 'Your name as the author/creator', category: 'universal' },
    { variable: 'topic', name: 'Topic', type: 'text', required: true, placeholder: 'Main topic/subject', options: [], description: 'Primary subject or theme of your content', category: 'universal' },
    { variable: 'subtitle', name: 'Subtitle', type: 'text', required: false, placeholder: 'Enter subtitle', options: [], description: 'Secondary title or tagline for your content', category: 'universal' },
    { variable: 'author_bio', name: 'Author Bio', type: 'textarea', required: false, placeholder: 'Brief biography', options: [], description: 'Short professional biography of the author', category: 'universal' },
    
    // ==================== CONTENT CLASSIFICATION ====================
    { variable: 'genre', name: 'Genre', type: 'select', required: true, placeholder: 'Select genre', options: ['fiction', 'non-fiction', 'business', 'self-help', 'romance', 'thriller', 'fantasy', 'sci-fi', 'biography', 'how-to', 'technical', 'educational'], description: 'Literary or content genre classification', category: 'universal' },
    { variable: 'target_audience', name: 'Target Audience', type: 'select', required: true, placeholder: 'Select your audience', options: ['general', 'young_adult', 'children', 'adults', 'professionals', 'students', 'entrepreneurs', 'executives', 'managers'], description: 'Primary demographic for your content', category: 'universal' },
    { variable: 'content_type', name: 'Content Type', type: 'select', required: false, placeholder: 'Select type', options: ['educational', 'entertainment', 'reference', 'instructional', 'inspirational'], description: 'Primary purpose and function of content', category: 'universal' },
    
    // ==================== CONTENT STRUCTURE & LENGTH ====================
    { variable: 'word_count', name: 'Word Count', type: 'select', required: true, placeholder: 'Select desired length', options: ['3000-5000', '5000-10000', '10000-20000', '20000-50000', '50000+'], description: 'Target length of your content in words', category: 'universal' },
    { variable: 'chapter_count', name: 'Chapter Count', type: 'select', required: true, placeholder: 'Select chapters', options: ['3', '5', '8', '10', '12', '15', '20'], description: 'Number of chapters or sections to create', category: 'universal' },
    { variable: 'target_length', name: 'Target Length', type: 'select', required: false, placeholder: 'Select length', options: ['short_form', 'medium_form', 'long_form', 'comprehensive'], description: 'Overall content length category', category: 'universal' },
    { variable: 'approach', name: 'Content Approach', type: 'select', required: false, placeholder: 'Select approach', options: ['step_by_step', 'comprehensive_guide', 'reference_manual', 'story_driven', 'problem_solution'], description: 'Overall structure and organization method', category: 'universal' },
    
    // ==================== WRITING STYLE & TONE ====================
    { variable: 'tone', name: 'Tone', type: 'select', required: true, placeholder: 'Select writing tone', options: ['friendly', 'authoritative', 'inspirational', 'informative', 'entertaining', 'serious', 'humorous', 'professional', 'conversational'], description: 'Overall mood and voice of your writing', category: 'universal' },
    { variable: 'writing_style', name: 'Writing Style', type: 'select', required: true, placeholder: 'Select style', options: ['conversational', 'professional', 'academic', 'casual', 'formal', 'creative', 'technical', 'descriptive'], description: 'How formal or casual your writing should be', category: 'universal' },
    { variable: 'accent', name: 'Language Accent', type: 'select', required: false, placeholder: 'Select accent', options: ['american', 'british', 'australian', 'canadian', 'neutral'], description: 'Regional language style and expressions', category: 'universal' },
    { variable: 'authority_level', name: 'Authority Level', type: 'select', required: false, placeholder: 'Select authority', options: ['beginner_friendly', 'professional', 'expert', 'thought_leader'], description: 'Level of expertise and authority to convey', category: 'universal' },
    
    // ==================== CONTENT FEATURES & ENHANCEMENTS ====================
    { variable: 'include_case_studies', name: 'Include Case Studies', type: 'checkbox', required: false, placeholder: 'Add case studies', options: ['yes'], description: 'Include real-world examples and case studies', category: 'universal' },
    { variable: 'include_examples', name: 'Include Examples', type: 'checkbox', required: false, placeholder: 'Add examples', options: ['yes'], description: 'Include practical examples throughout content', category: 'universal' },
    { variable: 'include_exercises', name: 'Include Exercises', type: 'checkbox', required: false, placeholder: 'Add exercises', options: ['yes'], description: 'Include interactive exercises or activities', category: 'universal' },
    { variable: 'include_templates', name: 'Include Templates', type: 'checkbox', required: false, placeholder: 'Add templates', options: ['yes'], description: 'Include downloadable templates and tools', category: 'universal' },
    { variable: 'include_tools', name: 'Include Tools', type: 'checkbox', required: false, placeholder: 'Add tools/resources', options: ['yes'], description: 'Include practical tools and resources', category: 'universal' },
    
    // ==================== VISUAL & MEDIA ELEMENTS ====================
    { variable: 'include_images', name: 'Include Images', type: 'checkbox', required: false, placeholder: 'Add images', options: ['yes'], description: 'Include relevant images and visuals', category: 'universal' },
    { variable: 'include_diagrams', name: 'Include Diagrams', type: 'checkbox', required: false, placeholder: 'Add diagrams', options: ['yes'], description: 'Include explanatory diagrams and charts', category: 'universal' },
    { variable: 'include_cover', name: 'Generate Cover', type: 'checkbox', required: false, placeholder: 'Create cover', options: ['yes'], description: 'Generate a professional book cover', category: 'universal' },
    { variable: 'typography_combo', name: 'Typography Style', type: 'select', required: false, placeholder: 'Select typography', options: ['modern', 'classic', 'elegant', 'technical', 'creative'], description: 'Visual styling and typography theme', category: 'universal' },
    
    // ==================== OUTPUT & PUBLISHING ====================
    { variable: 'output_formats', name: 'Output Formats', type: 'select', multiple: true, required: true, placeholder: 'Select output formats (multiple)', options: ['pdf', 'docx', 'html', 'markdown', 'text'], description: 'File formats for final output', category: 'universal' },
    { variable: 'generate_audiobook', name: 'Generate Audiobook', type: 'checkbox', required: false, placeholder: 'Create audio version', options: ['yes'], description: 'Generate spoken audio version of content', category: 'universal' },
    { variable: 'voice_selection', name: 'Voice Type', type: 'select', required: false, placeholder: 'Select voice', options: ['male', 'female', 'neutral'], description: 'Voice type for audio generation', category: 'universal' },
    { variable: 'audio_quality', name: 'Audio Quality', type: 'select', required: false, placeholder: 'Select quality', options: ['standard', 'high', 'premium'], description: 'Audio recording quality level', category: 'universal' },
    
    // ==================== CONTENT DEPTH & QUALITY ====================
    { variable: 'complexity_level', name: 'Complexity Level', type: 'select', required: false, placeholder: 'Select complexity', options: ['beginner', 'intermediate', 'advanced', 'expert'], description: 'Technical complexity and depth level', category: 'universal' },
    { variable: 'skill_level', name: 'Skill Level', type: 'select', required: false, placeholder: 'Target skill level', options: ['beginner', 'novice', 'intermediate', 'advanced', 'expert'], description: 'Assumed skill level of the audience', category: 'universal' },
    { variable: 'research_depth', name: 'Research Depth', type: 'select', required: false, placeholder: 'Select research level', options: ['basic', 'moderate', 'comprehensive', 'scholarly'], description: 'Level of research and citations needed', category: 'universal' },
    { variable: 'include_references', name: 'Include References', type: 'checkbox', required: false, placeholder: 'Add references', options: ['yes'], description: 'Include bibliography and source references', category: 'universal' },
    { variable: 'fact_checking', name: 'Fact Checking', type: 'checkbox', required: false, placeholder: 'Enable fact checking', options: ['yes'], description: 'Verify facts and accuracy of content', category: 'universal' },
    
    // ==================== BUSINESS & INDUSTRY CONTEXT ====================
    { variable: 'industry_focus', name: 'Industry Focus', type: 'select', required: false, placeholder: 'Select industry', options: ['technology', 'finance', 'marketing', 'healthcare', 'education', 'retail', 'manufacturing', 'consulting', 'media'], description: 'Primary industry or sector focus', category: 'universal' },
    { variable: 'business_objective', name: 'Business Objective', type: 'textarea', required: false, placeholder: 'Business goals', options: [], description: 'Main business goals this content should achieve', category: 'universal' },
    { variable: 'key_topics', name: 'Key Topics', type: 'textarea', required: false, placeholder: 'List main topics', options: [], description: 'Essential topics that must be covered', category: 'universal' },
    
    // ==================== CREATIVE & STORYTELLING ====================
    { variable: 'setting', name: 'Setting', type: 'textarea', required: false, placeholder: 'Describe setting', options: [], description: 'Time, place, and environment context', category: 'universal' },
    { variable: 'theme', name: 'Main Theme', type: 'textarea', required: false, placeholder: 'Core theme/message', options: [], description: 'Central theme or underlying message', category: 'universal' },
    { variable: 'main_characters', name: 'Main Characters', type: 'textarea', required: false, placeholder: 'Character descriptions', options: [], description: 'Primary characters or personas involved', category: 'universal' },
    { variable: 'conflict', name: 'Central Conflict', type: 'textarea', required: false, placeholder: 'Main conflict/challenge', options: [], description: 'Primary challenge or problem to address', category: 'universal' },
    
    // ==================== LEARNING & EDUCATION ====================
    { variable: 'learning_objectives', name: 'Learning Objectives', type: 'textarea', required: false, placeholder: 'Learning goals', options: [], description: 'What readers should learn or achieve', category: 'universal' },
    { variable: 'include_frameworks', name: 'Include Frameworks', type: 'checkbox', required: false, placeholder: 'Add frameworks', options: ['yes'], description: 'Include strategic frameworks and models', category: 'universal' },
    { variable: 'time_commitment', name: 'Time Commitment', type: 'select', required: false, placeholder: 'Reading time', options: ['15_minutes', '30_minutes', '1_hour', '2_hours', 'multiple_sessions'], description: 'Expected time investment for readers', category: 'universal' },
    
    // ==================== MARKETING & CONVERSION ====================
    { variable: 'sales_copy_framework', name: 'Sales Copy Framework', type: 'select', required: false, placeholder: 'Choose framework', options: ['AIDA', 'PASTOR', 'PAS', 'BAB', 'STAR', 'QUEST'], description: 'Copywriting structure for persuasive content', category: 'universal' },
    { variable: 'lead_magnet_type', name: 'Lead Magnet Type', type: 'select', required: false, placeholder: 'Select type', options: ['checklist', 'template', 'guide', 'framework', 'worksheet'], description: 'Type of free resource to offer readers', category: 'universal' },
    { variable: 'conversion_goal', name: 'Conversion Goal', type: 'select', required: false, placeholder: 'Select goal', options: ['email_signup', 'product_sale', 'consultation', 'download', 'engagement'], description: 'Primary action you want readers to take', category: 'universal' },
    
    // ==================== QUALITY & ANALYTICS ====================
    { variable: 'include_analytics', name: 'Include Analytics', type: 'checkbox', required: false, placeholder: 'Add tracking', options: ['yes'], description: 'Include performance tracking and analytics', category: 'universal' },
    { variable: 'preview_duration', name: 'Preview Duration', type: 'number', required: false, placeholder: 'Minutes', options: [], description: 'Length of content preview in minutes', category: 'universal' },
    { variable: 'level', name: 'Content Level', type: 'select', required: false, placeholder: 'Select level', options: ['101', '201', '301', 'advanced', 'masterclass'], description: 'Educational progression level', category: 'universal' },
    { variable: 'author_expertise', name: 'Author Expertise', type: 'textarea', required: false, placeholder: 'Your expertise areas', options: [], description: 'Professional skills and knowledge areas', category: 'universal' }
  ]

  // Combine universal variables with specialty variables
  const specialtyVariables = getSpecialtyVariables()
  return [...universalVariables, ...specialtyVariables]
}

export const getVariableByName = (variableName) => {
  const variables = getAllAvailableVariables()
  return variables.find(v => v.variable === variableName)
}

// Helper function to get variables by category for organized display
export const getVariablesByCategory = () => {
  const variables = getAllAvailableVariables()
  const categories = {
    universal: [],
    business: [],
    technical: [],
    health: [],
    marketing: [],
    education: [],
    creative: [],
    professional: [],
    finance: []
  }
  
  variables.forEach(variable => {
    if (categories[variable.category]) {
      categories[variable.category].push(variable)
    }
  })
  
  return categories
}

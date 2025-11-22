// SINGLE SOURCE OF TRUTH FOR ALL VARIABLES
// All flows and components import from here

export const getAllAvailableVariables = () => {
  const allVariables = [
    // Core Book Variables
    { variable: 'bookTitle', name: 'Book Title', type: 'text', required: true, placeholder: 'Enter your book title', options: [] },
    { variable: 'subtitle', name: 'Book Subtitle', type: 'text', required: false, placeholder: 'Enter book subtitle', options: [] },
    { variable: 'authorName', name: 'Author Name', type: 'text', required: true, placeholder: 'Enter your name', options: [] },
    { variable: 'authorBio', name: 'Author Bio', type: 'textarea', required: false, placeholder: 'Brief author biography', options: [] },
    { variable: 'authorExpertise', name: 'Author Expertise', type: 'textarea', required: false, placeholder: 'Your expertise areas', options: [] },
    
    // Content Structure
    { variable: 'genre', name: 'Genre', type: 'select', required: true, placeholder: 'Select genre', options: ['fiction', 'non-fiction', 'business', 'self-help', 'romance', 'thriller', 'fantasy', 'sci-fi', 'biography', 'how-to'] },
    { variable: 'topic', name: 'Topic', type: 'text', required: true, placeholder: 'Main topic/niche', options: [] },
    { variable: 'targetAudience', name: 'Target Audience', type: 'select', required: true, placeholder: 'Select your target audience', options: ['general', 'young_adult', 'children', 'adults', 'professionals', 'students', 'entrepreneurs'] },
    { variable: 'wordCount', name: 'Word Count', type: 'select', required: true, placeholder: 'Select desired word count', options: ['5000-10000', '10000-20000', '20000-50000', '50000+'] },
    { variable: 'chapterCount', name: 'Chapter Count', type: 'select', required: true, placeholder: 'Select number of chapters', options: ['3-5', '5-8', '8-12', '12-20', '20+'] },
    
    // Writing Style
    { variable: 'tone', name: 'Tone', type: 'select', required: true, placeholder: 'Select writing tone', options: ['friendly', 'authoritative', 'inspirational', 'informative', 'entertaining', 'serious', 'humorous'] },
    { variable: 'writingStyle', name: 'Writing Style', type: 'select', required: true, placeholder: 'Select your writing style', options: ['conversational', 'professional', 'academic', 'casual', 'formal', 'creative', 'technical'] },
    
    // Additional Variables from Awesome Flows
    { variable: 'lead_magnet_type', name: 'Lead Magnet Type', type: 'select', required: false, placeholder: 'Select lead magnet type', options: ['checklist', 'template', 'guide', 'framework'] },
    
    // Sales Copy Framework Variables
    { 
      variable: 'sales_copy_framework', 
      name: 'Sales Copy Framework', 
      type: 'select', 
      required: true, 
      placeholder: 'Choose your copywriting framework', 
      options: [
        'AIDA (Attention, Interest, Desire, Action)',
        'PASTOR (Problem, Amplify, Story, Transformation, Offer, Response)', 
        'PAS (Problem, Agitate, Solution)',
        'BAB (Before, After, Bridge)',
        'STAR (Story, Transformation, Acceptance, Response)',
        'QUEST (Qualify, Understand, Educate, Stimulate, Transition)',
        'ACCA (Awareness, Comprehension, Conviction, Action)',
        'SCRAP (Situation, Complication, Resolution, Action, Polish)',
        'SLAP (Stop, Look, Act, Purchase)',
        'FOREST (Facts, Objectives, Reasons, Examples, Story, Theme)'
      ]
    }
  ]
  
  return allVariables
}

export const getVariableByName = (variableName) => {
  const variables = getAllAvailableVariables()
  return variables.find(v => v.variable === variableName)
}

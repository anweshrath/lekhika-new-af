// SPECIALTY VARIABLES BY CATEGORY - DOMAIN-SPECIFIC VARIABLES
// Organized by industry and use case for easy discovery

export const getSpecialtyVariables = () => {
  return [
    
    // ==================== BUSINESS & FINANCE SPECIALTY ====================
    { variable: 'business_stage', name: 'Business Stage', type: 'select', required: false, placeholder: 'Select stage', options: ['startup', 'growth', 'established', 'enterprise'], description: 'Current stage of business development', category: 'business' },
    { variable: 'budget_range', name: 'Budget Range', type: 'select', required: false, placeholder: 'Select budget', options: ['under_1k', '1k_5k', '5k_25k', '25k_plus'], description: 'Available budget for implementation', category: 'business' },
    { variable: 'team_size', name: 'Team Size', type: 'select', required: false, placeholder: 'Select team size', options: ['solo', '2_5', '6_15', '16_50', '50_plus'], description: 'Size of team or organization', category: 'business' },
    { variable: 'revenue_goal', name: 'Revenue Goal', type: 'select', required: false, placeholder: 'Select goal', options: ['under_10k', '10k_50k', '50k_250k', '250k_1m', '1m_plus'], description: 'Target revenue objectives', category: 'business' },
    { variable: 'business_type', name: 'Business Type', type: 'select', required: false, placeholder: 'Select type', options: ['b2b', 'b2c', 'saas', 'ecommerce', 'service_based', 'manufacturing'], description: 'Type of business model', category: 'business' },
    { variable: 'company_name', name: 'Company Name', type: 'text', required: false, placeholder: 'Enter company name', options: [], description: 'Name of the business or organization', category: 'business' },
    
    // FINANCE SPECIALTY
    { variable: 'investment_goal', name: 'Investment Goal', type: 'select', required: false, placeholder: 'Select goal', options: ['capital_preservation', 'steady_growth', 'aggressive_growth', 'retirement'], description: 'Primary investment objective', category: 'finance' },
    { variable: 'risk_tolerance', name: 'Risk Tolerance', type: 'select', required: false, placeholder: 'Select tolerance', options: ['conservative', 'moderate', 'aggressive', 'very_aggressive'], description: 'Acceptable level of financial risk', category: 'finance' },
    { variable: 'income_level', name: 'Income Level', type: 'select', required: false, placeholder: 'Select income', options: ['under_50k', '50k_100k', '100k_250k', '250k_plus'], description: 'Annual income range', category: 'finance' },
    { variable: 'financial_goals', name: 'Financial Goals', type: 'textarea', required: false, placeholder: 'Financial objectives', options: [], description: 'Specific financial targets and milestones', category: 'finance' },
    { variable: 'investment_type', name: 'Investment Type', type: 'select', required: false, placeholder: 'Select type', options: ['stocks', 'bonds', 'real_estate', 'crypto', 'commodities'], description: 'Primary investment vehicle', category: 'finance' },
    
    // ==================== TECHNICAL & PROGRAMMING SPECIALTY ====================  
    { variable: 'technical_field', name: 'Technical Field', type: 'select', required: false, placeholder: 'Select field', options: ['web_development', 'mobile_development', 'data_science', 'ai_ml', 'cybersecurity', 'devops'], description: 'Specific technology domain', category: 'technical' },
    { variable: 'include_code', name: 'Include Code Examples', type: 'checkbox', required: false, placeholder: 'Add code', options: ['yes'], description: 'Include programming code examples', category: 'technical' },
    { variable: 'include_troubleshooting', name: 'Include Troubleshooting', type: 'checkbox', required: false, placeholder: 'Add troubleshooting', options: ['yes'], description: 'Include problem-solving guides', category: 'technical' },
    { variable: 'include_screenshots', name: 'Include Screenshots', type: 'checkbox', required: false, placeholder: 'Add screenshots', options: ['yes'], description: 'Include visual interface examples', category: 'technical' },
    { variable: 'technical_domain', name: 'Technical Domain', type: 'select', required: false, placeholder: 'Select domain', options: ['frontend', 'backend', 'fullstack', 'mobile', 'desktop', 'embedded'], description: 'Specific technical specialization', category: 'technical' },
    { variable: 'user_level', name: 'User Level', type: 'select', required: false, placeholder: 'Select level', options: ['beginner', 'intermediate', 'advanced', 'expert'], description: 'Technical skill level of users', category: 'technical' },
    
    // ==================== HEALTH & FITNESS SPECIALTY ====================
    { variable: 'fitness_goal', name: 'Fitness Goal', type: 'select', required: false, placeholder: 'Select goal', options: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_health'], description: 'Primary fitness objective', category: 'health' },
    { variable: 'health_focus', name: 'Health Focus', type: 'select', required: false, placeholder: 'Select focus', options: ['nutrition', 'exercise', 'mental_health', 'preventive_care', 'chronic_conditions'], description: 'Primary health area of focus', category: 'health' },
    { variable: 'include_meal_plans', name: 'Include Meal Plans', type: 'checkbox', required: false, placeholder: 'Add meal plans', options: ['yes'], description: 'Include detailed nutrition planning', category: 'health' },
    { variable: 'include_workouts', name: 'Include Workout Plans', type: 'checkbox', required: false, placeholder: 'Add workouts', options: ['yes'], description: 'Include exercise routines and plans', category: 'health' },
    { variable: 'fitness_goals', name: 'Fitness Goals', type: 'textarea', required: false, placeholder: 'Fitness objectives', options: [], description: 'Specific fitness targets and outcomes', category: 'health' },
    { variable: 'workout_setting', name: 'Workout Setting', type: 'select', required: false, placeholder: 'Select setting', options: ['home', 'gym', 'outdoor', 'mixed'], description: 'Primary exercise environment', category: 'health' },
    { variable: 'include_nutrition', name: 'Include Nutrition', type: 'checkbox', required: false, placeholder: 'Add nutrition', options: ['yes'], description: 'Include nutritional guidance and advice', category: 'health' },
    { variable: 'include_mindfulness', name: 'Include Mindfulness', type: 'checkbox', required: false, placeholder: 'Add mindfulness', options: ['yes'], description: 'Include meditation and mental wellness', category: 'health' },
    { variable: 'include_psychology', name: 'Include Psychology', type: 'checkbox', required: false, placeholder: 'Add psychology', options: ['yes'], description: 'Include psychological aspects and mental health', category: 'health' },
    
    // ==================== MARKETING & SALES SPECIALTY ====================
    { variable: 'marketing_channels', name: 'Marketing Channels', type: 'select', required: false, placeholder: 'Select channels', options: ['social_media', 'email', 'content_marketing', 'paid_ads', 'seo'], description: 'Primary marketing channels to focus on', category: 'marketing' },
    { variable: 'sales_channel', name: 'Sales Channel', type: 'select', required: false, placeholder: 'Select channel', options: ['direct_sales', 'online_store', 'marketplace', 'affiliate', 'partnership'], description: 'Primary sales distribution method', category: 'marketing' },
    { variable: 'lead_capture', name: 'Lead Capture Strategy', type: 'select', required: false, placeholder: 'Select strategy', options: ['email_opt_in', 'free_trial', 'consultation', 'content_download'], description: 'Method for capturing potential customers', category: 'marketing' },
    { variable: 'target_market', name: 'Target Market', type: 'select', required: false, placeholder: 'Select market', options: ['local', 'national', 'international', 'niche', 'mass_market'], description: 'Geographic or demographic market scope', category: 'marketing' },
    { variable: 'price_point', name: 'Price Point', type: 'select', required: false, placeholder: 'Select price point', options: ['budget', 'mid_range', 'premium', 'luxury'], description: 'Product or service pricing category', category: 'marketing' },
    { variable: 'upsell_strategy', name: 'Upsell Strategy', type: 'select', required: false, placeholder: 'Select strategy', options: ['product_bundles', 'premium_tiers', 'add_ons', 'services'], description: 'Method for increasing customer value', category: 'marketing' },
    { variable: 'copywriting_type', name: 'Copywriting Type', type: 'select', required: false, placeholder: 'Select type', options: ['sales_page', 'email_sequence', 'ad_copy', 'landing_page', 'product_description'], description: 'Type of marketing copy to create', category: 'marketing' },
    { variable: 'include_campaigns', name: 'Include Campaigns', type: 'checkbox', required: false, placeholder: 'Add campaigns', options: ['yes'], description: 'Include marketing campaign strategies', category: 'marketing' },
    { variable: 'include_metrics', name: 'Include Metrics', type: 'checkbox', required: false, placeholder: 'Add metrics', options: ['yes'], description: 'Include performance tracking and KPIs', category: 'marketing' },
    { variable: 'include_automation', name: 'Include Automation', type: 'checkbox', required: false, placeholder: 'Add automation', options: ['yes'], description: 'Include marketing automation strategies', category: 'marketing' },
    
    // ==================== EDUCATION & TRAINING SPECIALTY ====================
    { variable: 'assessment_type', name: 'Assessment Type', type: 'select', required: false, placeholder: 'Select type', options: ['quiz', 'practical_exercise', 'project', 'certification_exam'], description: 'Type of knowledge assessment', category: 'education' },
    { variable: 'include_assessments', name: 'Include Assessments', type: 'checkbox', required: false, placeholder: 'Add assessments', options: ['yes'], description: 'Include knowledge testing elements', category: 'education' },
    { variable: 'exercise_integration', name: 'Exercise Integration', type: 'select', required: false, placeholder: 'Select integration', options: ['throughout_chapters', 'end_of_chapters', 'separate_section', 'downloadable'], description: 'How to integrate practice exercises', category: 'education' },
    { variable: 'expertise_level', name: 'Expertise Level', type: 'select', required: false, placeholder: 'Select level', options: ['novice', 'intermediate', 'advanced', 'expert', 'master'], description: 'Required expertise level for content', category: 'education' },
    { variable: 'subject', name: 'Subject', type: 'text', required: false, placeholder: 'Enter subject', options: [], description: 'Academic or training subject area', category: 'education' },
    { variable: 'subject_name', name: 'Subject Name', type: 'text', required: false, placeholder: 'Subject name', options: [], description: 'Specific name of the subject or course', category: 'education' },
    { variable: 'include_citations', name: 'Include Citations', type: 'checkbox', required: false, placeholder: 'Add citations', options: ['yes'], description: 'Include academic citations and sources', category: 'education' },
    { variable: 'data_sources', name: 'Data Sources', type: 'textarea', required: false, placeholder: 'List data sources', options: [], description: 'Primary sources of information and data', category: 'education' },
    { variable: 'include_data', name: 'Include Data', type: 'checkbox', required: false, placeholder: 'Add data', options: ['yes'], description: 'Include statistical data and research', category: 'education' },
    
    // ==================== CREATIVE & STORYTELLING SPECIALTY ====================  
    { variable: 'story_premise', name: 'Story Premise', type: 'textarea', required: false, placeholder: 'Story premise', options: [], description: 'Basic storyline and plot foundation', category: 'creative' },
    { variable: 'story_title', name: 'Story Title', type: 'text', required: false, placeholder: 'Story title', options: [], description: 'Title for fictional or narrative content', category: 'creative' },
    { variable: 'main_character', name: 'Main Character', type: 'textarea', required: false, placeholder: 'Character description', options: [], description: 'Primary protagonist or central figure', category: 'creative' },
    { variable: 'vulnerability_level', name: 'Vulnerability Level', type: 'select', required: false, placeholder: 'Select level', options: ['surface', 'moderate', 'deep', 'raw_honest'], description: 'Level of personal openness in content', category: 'creative' },
    { variable: 'memoir_type', name: 'Memoir Type', type: 'select', required: false, placeholder: 'Select type', options: ['personal_journey', 'professional_story', 'family_history', 'life_lessons'], description: 'Type of memoir or personal story', category: 'creative' },
    { variable: 'time_period', name: 'Time Period', type: 'text', required: false, placeholder: 'Time period', options: [], description: 'Historical or fictional time setting', category: 'creative' },
    { variable: 'key_events', name: 'Key Events', type: 'textarea', required: false, placeholder: 'Important events', options: [], description: 'Major events or turning points in story', category: 'creative' },
    { variable: 'transformation_goal', name: 'Transformation Goal', type: 'textarea', required: false, placeholder: 'Transformation goals', options: [], description: 'Character or reader transformation objectives', category: 'creative' },
    { variable: 'visual_elements', name: 'Visual Elements', type: 'select', required: false, placeholder: 'Select elements', options: ['illustrations', 'photos', 'graphics', 'charts'], description: 'Types of visual content to include', category: 'creative' },
    { variable: 'include_visuals', name: 'Include Visuals', type: 'checkbox', required: false, placeholder: 'Add visuals', options: ['yes'], description: 'Include visual storytelling elements', category: 'creative' },
    { variable: 'include_photos', name: 'Include Photos', type: 'checkbox', required: false, placeholder: 'Add photos', options: ['yes'], description: 'Include photographs and images', category: 'creative' },
    
    // ==================== PROFESSIONAL DEVELOPMENT SPECIALTY ====================
    { variable: 'leadership_level', name: 'Leadership Level', type: 'select', required: false, placeholder: 'Select level', options: ['individual_contributor', 'team_lead', 'middle_management', 'senior_management', 'executive'], description: 'Current or target leadership position', category: 'professional' },
    { variable: 'leadership_focus', name: 'Leadership Focus', type: 'select', required: false, placeholder: 'Select focus', options: ['team_building', 'communication', 'decision_making', 'change_management', 'strategic_thinking'], description: 'Primary leadership skill development area', category: 'professional' },
    { variable: 'work_environment', name: 'Work Environment', type: 'select', required: false, placeholder: 'Select environment', options: ['remote', 'hybrid', 'office', 'field_work', 'varied'], description: 'Primary work setting and context', category: 'professional' },
    { variable: 'productivity_focus', name: 'Productivity Focus', type: 'select', required: false, placeholder: 'Select focus', options: ['time_management', 'task_organization', 'goal_setting', 'efficiency', 'work_life_balance'], description: 'Primary productivity improvement area', category: 'professional' },
    { variable: 'strategy_focus', name: 'Strategy Focus', type: 'select', required: false, placeholder: 'Select focus', options: ['business_strategy', 'marketing_strategy', 'growth_strategy', 'competitive_strategy'], description: 'Strategic planning focus area', category: 'professional' },
    { variable: 'include_strategies', name: 'Include Strategies', type: 'checkbox', required: false, placeholder: 'Add strategies', options: ['yes'], description: 'Include strategic planning methods', category: 'professional' },
    { variable: 'include_techniques', name: 'Include Techniques', type: 'checkbox', required: false, placeholder: 'Add techniques', options: ['yes'], description: 'Include practical techniques and methods', category: 'professional' },
    { variable: 'include_recommendations', name: 'Include Recommendations', type: 'checkbox', required: false, placeholder: 'Add recommendations', options: ['yes'], description: 'Include specific recommendations and advice', category: 'professional' },
    { variable: 'include_tracking', name: 'Include Tracking', type: 'checkbox', required: false, placeholder: 'Add tracking', options: ['yes'], description: 'Include progress tracking methods', category: 'professional' },
    
    // ==================== STARTUP & ENTREPRENEURSHIP SPECIALTY ====================
    { variable: 'startup_stage', name: 'Startup Stage', type: 'select', required: false, placeholder: 'Select stage', options: ['idea', 'mvp', 'early_stage', 'growth', 'scale'], description: 'Current stage of startup development', category: 'startup' },
    { variable: 'funding_stage', name: 'Funding Stage', type: 'select', required: false, placeholder: 'Select stage', options: ['bootstrapped', 'pre_seed', 'seed', 'series_a', 'later_stage'], description: 'Current funding or investment stage', category: 'startup' },
    { variable: 'funding_goal', name: 'Funding Goal', type: 'select', required: false, placeholder: 'Select goal', options: ['under_100k', '100k_500k', '500k_2m', '2m_10m', '10m_plus'], description: 'Target funding amount', category: 'startup' },
    { variable: 'include_funding', name: 'Include Funding', type: 'checkbox', required: false, placeholder: 'Add funding', options: ['yes'], description: 'Include funding strategies and advice', category: 'startup' },
    { variable: 'include_legal', name: 'Include Legal', type: 'checkbox', required: false, placeholder: 'Add legal', options: ['yes'], description: 'Include legal considerations and advice', category: 'startup' },
    { variable: 'include_timeline', name: 'Include Timeline', type: 'checkbox', required: false, placeholder: 'Add timeline', options: ['yes'], description: 'Include project timelines and milestones', category: 'startup' },
    { variable: 'include_portfolios', name: 'Include Portfolios', type: 'checkbox', required: false, placeholder: 'Add portfolios', options: ['yes'], description: 'Include portfolio examples and templates', category: 'startup' },
    { variable: 'include_investing', name: 'Include Investing', type: 'checkbox', required: false, placeholder: 'Add investing', options: ['yes'], description: 'Include investment strategies and advice', category: 'startup' },
    { variable: 'include_budgeting', name: 'Include Budgeting', type: 'checkbox', required: false, placeholder: 'Add budgeting', options: ['yes'], description: 'Include budgeting and financial planning', category: 'startup' },
    
    // ==================== SPECIALIZED CONTENT TYPES ====================
    { variable: 'manual_type', name: 'Manual Type', type: 'select', required: false, placeholder: 'Select type', options: ['user_manual', 'training_manual', 'operations_manual', 'policy_manual'], description: 'Type of manual or guide to create', category: 'specialized' },
    { variable: 'manual_title', name: 'Manual Title', type: 'text', required: false, placeholder: 'Manual title', options: [], description: 'Title for manual or instructional content', category: 'specialized' },
    { variable: 'whitepaper_type', name: 'Whitepaper Type', type: 'select', required: false, placeholder: 'Select type', options: ['research', 'problem_solution', 'industry_analysis', 'technology_guide'], description: 'Type of whitepaper to create', category: 'specialized' },
    { variable: 'whitepaper_title', name: 'Whitepaper Title', type: 'text', required: false, placeholder: 'Whitepaper title', options: [], description: 'Title for whitepaper or research document', category: 'specialized' },
    { variable: 'paper_title', name: 'Paper Title', type: 'text', required: false, placeholder: 'Paper title', options: [], description: 'Title for academic or research paper', category: 'specialized' },
    { variable: 'product_name', name: 'Product Name', type: 'text', required: false, placeholder: 'Product name', options: [], description: 'Name of product or service being described', category: 'specialized' },
    { variable: 'product_type', name: 'Product Type', type: 'select', required: false, placeholder: 'Select type', options: ['physical_product', 'software', 'service', 'digital_product', 'subscription'], description: 'Type of product or offering', category: 'specialized' },
    { variable: 'niche', name: 'Niche', type: 'text', required: false, placeholder: 'Enter niche', options: [], description: 'Specific market niche or specialization', category: 'specialized' },
    { variable: 'business_niche', name: 'Business Niche', type: 'text', required: false, placeholder: 'Business niche', options: [], description: 'Specific business market or specialization', category: 'specialized' },
    { variable: 'industry_type', name: 'Industry Type', type: 'select', required: false, placeholder: 'Select industry', options: ['b2b_services', 'retail', 'manufacturing', 'healthcare', 'technology', 'finance'], description: 'Specific industry classification', category: 'specialized' },
    { variable: 'lead_magnet_title', name: 'Lead Magnet Title', type: 'text', required: false, placeholder: 'Lead magnet title', options: [], description: 'Title for lead generation content', category: 'specialized' },
    { variable: 'book_type', name: 'Book Type', type: 'select', required: false, placeholder: 'Select type', options: ['ebook', 'paperback', 'hardcover', 'audiobook', 'workbook'], description: 'Physical or digital book format', category: 'specialized' }
  ]
}

// Helper function to get specialty variables by category
export const getSpecialtyVariablesByCategory = () => {
  const variables = getSpecialtyVariables()
  const categories = {}
  
  variables.forEach(variable => {
    if (!categories[variable.category]) {
      categories[variable.category] = []
    }
    categories[variable.category].push(variable)
  })
  
  return categories
}

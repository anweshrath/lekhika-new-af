// Complete input options for form generation
export const INPUT_OPTIONS = {
  bookTypes: [
    { 
      id: 'ebook', 
      name: 'eBook', 
      description: 'Comprehensive digital book',
      chapters: '5-8',
      words: '15,000-25,000',
      icon: '📚'
    },
    { 
      id: 'guide', 
      name: 'How-To Guide', 
      description: 'Practical step-by-step guide',
      chapters: '3-5',
      words: '8,000-15,000',
      icon: '📖'
    },
    { 
      id: 'manual', 
      name: 'Training Manual', 
      description: 'Comprehensive training resource',
      chapters: '6-10',
      words: '20,000-35,000',
      icon: '📋'
    },
    { 
      id: 'workbook', 
      name: 'Interactive Workbook', 
      description: 'Exercises and activities',
      chapters: '4-7',
      words: '10,000-20,000',
      icon: '📝'
    },
    { 
      id: 'report', 
      name: 'Business Report', 
      description: 'Professional business analysis',
      chapters: '3-6',
      words: '5,000-15,000',
      icon: '📊'
    },
    { 
      id: 'case_study', 
      name: 'Case Study', 
      description: 'Detailed problem-solution analysis',
      chapters: '2-4',
      words: '3,000-8,000',
      icon: '🔍'
    },
    { 
      id: 'autobiography', 
      name: 'Autobiography', 
      description: 'Personal life story',
      chapters: '8-15',
      words: '25,000-50,000',
      icon: '👤'
    },
    { 
      id: 'whitepaper', 
      name: 'Whitepaper', 
      description: 'Technical research document',
      chapters: '4-8',
      words: '10,000-25,000',
      icon: '📄'
    },
    { 
      id: 'fiction', 
      name: 'Fiction', 
      description: 'Creative story or novel',
      chapters: '10-20',
      words: '30,000-80,000',
      icon: '📚'
    },
    { 
      id: 'cheat_sheet', 
      name: 'Cheat Sheet', 
      description: 'Quick reference guide',
      chapters: '1-3',
      words: '1,000-3,000',
      icon: '📋'
    }
  ],

  niches: [
    'business',
    'technology',
    'self-help',
    'finance',
    'marketing',
    'leadership',
    'productivity',
    'entrepreneurship',
    'personal-development',
    'career-growth',
    'health',
    'fitness',
    'education',
    'real-estate',
    'investing',
    'sales',
    'customer-service',
    'project-management',
    'data-science',
    'artificial-intelligence'
  ],

  tones: [
    { 
      id: 'professional', 
      name: 'Professional', 
      description: 'Formal, business-like tone',
      icon: '💼'
    },
    { 
      id: 'conversational', 
      name: 'Conversational', 
      description: 'Friendly, approachable tone',
      icon: '💬'
    },
    { 
      id: 'academic', 
      name: 'Academic', 
      description: 'Scholarly, research-based tone',
      icon: '🎓'
    },
    { 
      id: 'inspirational', 
      name: 'Inspirational', 
      description: 'Motivational, uplifting tone',
      icon: '✨'
    },
    { 
      id: 'instructional', 
      name: 'Instructional', 
      description: 'How-to, step-by-step tone',
      icon: '📚'
    },
    { 
      id: 'storytelling', 
      name: 'Storytelling', 
      description: 'Narrative, engaging tone',
      icon: '📖'
    },
    { 
      id: 'authoritative', 
      name: 'Authoritative', 
      description: 'Expert, confident tone',
      icon: '👑'
    },
    { 
      id: 'casual', 
      name: 'Casual', 
      description: 'Relaxed, informal tone',
      icon: '😊'
    }
  ],

  accents: [
    { 
      id: 'american', 
      name: 'American English',
      description: 'US English spelling and expressions',
      flag: '🇺🇸'
    },
    { 
      id: 'british', 
      name: 'British English',
      description: 'UK English spelling and expressions',
      flag: '🇬🇧'
    },
    { 
      id: 'australian', 
      name: 'Australian English',
      description: 'AU English spelling and expressions',
      flag: '🇦🇺'
    },
    { 
      id: 'neutral', 
      name: 'Neutral International',
      description: 'International English, no regional bias',
      flag: '🌍'
    },
    { 
      id: 'canadian', 
      name: 'Canadian English',
      description: 'CA English spelling and expressions',
      flag: '🇨🇦'
    },
    { 
      id: 'indian', 
      name: 'Indian English',
      description: 'Indian English expressions and style',
      flag: '🇮🇳'
    },
    { 
      id: 'hinglish', 
      name: 'Hinglish',
      description: 'Hindi-English mix popular in India',
      flag: '🇮🇳'
    }
  ],

  outputFormats: [
    { 
      id: 'html', 
      name: 'HTML',
      description: 'Web-friendly format with styling',
      icon: '🌐'
    },
    { 
      id: 'pdf', 
      name: 'PDF',
      description: 'Print-ready document format',
      icon: '📄'
    },
    { 
      id: 'epub', 
      name: 'EPUB',
      description: 'Standard eBook format',
      icon: '📚'
    },
    { 
      id: 'docx', 
      name: 'DOCX',
      description: 'Microsoft Word document',
      icon: '📝'
    },
    { 
      id: 'markdown', 
      name: 'Markdown',
      description: 'Plain text with formatting',
      icon: '📋'
    },
    { 
      id: 'text', 
      name: 'Plain Text',
      description: 'Simple text file',
      icon: '📄'
    },
    { 
      id: 'txt', 
      name: 'Text File',
      description: 'Plain text file (.txt)',
      icon: '📄'
    },
    { 
      id: 'md', 
      name: 'Markdown File',
      description: 'Markdown file (.md)',
      icon: '📋'
    },
    { 
      id: 'flipbook', 
      name: 'Interactive Flip Book',
      description: 'Realistic page-turning experience',
      icon: '📖'
    }
  ],

  targetAudiences: [
    {
      id: 'beginners',
      name: 'Beginners',
      description: 'People new to the topic',
      icon: '🌱'
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'People with some knowledge',
      icon: '🌿'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      description: 'Experienced professionals',
      icon: '🌳'
    },
    {
      id: 'students',
      name: 'Students',
      description: 'Academic learners',
      icon: '🎓'
    },
    {
      id: 'professionals',
      name: 'Professionals',
      description: 'Working professionals',
      icon: '💼'
    },
    {
      id: 'entrepreneurs',
      name: 'Entrepreneurs',
      description: 'Business owners and founders',
      icon: '🚀'
    },
    {
      id: 'managers',
      name: 'Managers',
      description: 'Team and project managers',
      icon: '👔'
    },
    {
      id: 'executives',
      name: 'Executives',
      description: 'Senior leadership',
      icon: '👑'
    }
  ],

  wordCounts: [
    { id: 'short', name: 'Short (1,000-3,000 words)', value: 2000 },
    { id: 'medium', name: 'Medium (3,000-8,000 words)', value: 5000 },
    { id: 'long', name: 'Long (8,000-15,000 words)', value: 10000 },
    { id: 'extended', name: 'Extended (15,000-25,000 words)', value: 20000 },
    { id: 'comprehensive', name: 'Comprehensive (25,000+ words)', value: 30000 }
  ],

  chapterCounts: [
    { id: 'minimal', name: 'Minimal (1-3 chapters)', value: 2 },
    { id: 'standard', name: 'Standard (4-6 chapters)', value: 5 },
    { id: 'detailed', name: 'Detailed (7-10 chapters)', value: 8 },
    { id: 'comprehensive', name: 'Comprehensive (11-15 chapters)', value: 12 },
    { id: 'extensive', name: 'Extensive (16+ chapters)', value: 18 }
  ],

  coverImageStyles: [
    { 
      id: 'modern', 
      name: 'Modern & Clean',
      description: 'Contemporary, minimalist design',
      colors: ['#3B82F6', '#1E40AF']
    },
    { 
      id: 'vintage', 
      name: 'Vintage & Classic',
      description: 'Retro, timeless aesthetic',
      colors: ['#92400E', '#451A03']
    },
    { 
      id: 'minimalist', 
      name: 'Minimalist',
      description: 'Simple, clean, focused',
      colors: ['#6B7280', '#111827']
    },
    { 
      id: 'bold', 
      name: 'Bold & Colorful',
      description: 'Vibrant, eye-catching design',
      colors: ['#EF4444', '#F59E0B']
    },
    { 
      id: 'corporate', 
      name: 'Corporate & Professional',
      description: 'Business-focused, trustworthy',
      colors: ['#1F2937', '#374151']
    },
    { 
      id: 'creative', 
      name: 'Creative & Artistic',
      description: 'Unique, imaginative design',
      colors: ['#8B5CF6', '#EC4899']
    }
  ],

  brandingStyles: [
    { 
      id: 'corporate', 
      name: 'Corporate & Professional',
      description: 'Business-focused, trustworthy branding',
      icon: '🏢'
    },
    { 
      id: 'creative', 
      name: 'Creative & Artistic',
      description: 'Unique, imaginative branding',
      icon: '🎨'
    },
    { 
      id: 'tech', 
      name: 'Tech & Modern',
      description: 'Cutting-edge, innovative branding',
      icon: '💻'
    },
    { 
      id: 'lifestyle', 
      name: 'Lifestyle & Personal',
      description: 'Personal, relatable branding',
      icon: '🌟'
    },
    { 
      id: 'luxury', 
      name: 'Luxury & Premium',
      description: 'High-end, exclusive branding',
      icon: '💎'
    },
    { 
      id: 'startup', 
      name: 'Startup & Dynamic',
      description: 'Energetic, growth-focused branding',
      icon: '🚀'
    }
  ],

  publishingGoals: [
    { 
      id: 'education', 
      name: 'Educational Content',
      description: 'Teach and inform readers',
      icon: '📚'
    },
    { 
      id: 'leadership', 
      name: 'Thought Leadership',
      description: 'Establish expertise and authority',
      icon: '👑'
    },
    { 
      id: 'marketing', 
      name: 'Marketing & Sales',
      description: 'Promote products or services',
      icon: '📈'
    },
    { 
      id: 'branding', 
      name: 'Brand Building',
      description: 'Build brand awareness and recognition',
      icon: '🏷️'
    },
    { 
      id: 'revenue', 
      name: 'Revenue Generation',
      description: 'Generate direct income',
      icon: '💰'
    },
    { 
      id: 'community', 
      name: 'Community Building',
      description: 'Build and engage audience',
      icon: '👥'
    }
  ],

  distributionChannels: [
    { 
      id: 'website', 
      name: 'Website/Blog',
      description: 'Publish on your own website',
      icon: '🌐'
    },
    { 
      id: 'amazon', 
      name: 'Amazon Kindle',
      description: 'Sell on Amazon marketplace',
      icon: '📱'
    },
    { 
      id: 'social', 
      name: 'Social Media',
      description: 'Share on social platforms',
      icon: '📱'
    },
    { 
      id: 'email', 
      name: 'Email Marketing',
      description: 'Send to email subscribers',
      icon: '📧'
    },
    { 
      id: 'courses', 
      name: 'Online Courses',
      description: 'Use in course materials',
      icon: '🎓'
    },
    { 
      id: 'presentations', 
      name: 'Presentations',
      description: 'Use in speaking engagements',
      icon: '🎤'
    }
  ],

  // CONSOLIDATED CUSTOMER CONTENT FLOWS (from customerContentFlows3.js)
  customerContentFlowsPart3: {
    // Fiction Creation Flows
    fictionShort: {
      name: 'Fiction Creator (Short)',
      description: 'Creative fiction story with plot, characters, and engaging narrative',
      type: 'simplified',
      contentType: 'fiction'
    },
    fictionLong: {
      name: 'Fiction Creator (Long)',
      description: 'Comprehensive novel with deep character development and complex plot',
      type: 'comprehensive',
      contentType: 'fiction'
    },
    manualShort: {
      name: 'Manual Creator (Short)',
      description: 'Quick reference manual with step-by-step instructions',
      type: 'simplified',
      contentType: 'manual'
    },
    manualLong: {
      name: 'Manual Creator (Long)',
      description: 'Comprehensive manual with detailed instructions and troubleshooting',
      type: 'comprehensive',
      contentType: 'manual'
    }
  },

  // CONSOLIDATED BEST FLOWS (from bestFlows.js)
  bestFlows: {
    businessStrategy: {
      name: 'Business Strategy Guide',
      description: 'Professional business strategy guide with market analysis',
      type: 'expert',
      category: 'business'
    },
    fiction: {
      name: 'Fiction Book',
      description: 'Creative fiction with compelling characters and plot',
      type: 'creative',
      category: 'fiction'
    },
    marketing: {
      name: 'Marketing Guide',
      description: 'Comprehensive marketing strategy and tactics',
      type: 'expert',
      category: 'business'
    },
    technical: {
      name: 'Technical Documentation',
      description: 'Professional technical documentation and guides',
      type: 'expert',
      category: 'technical'
    },
    selfHelp: {
      name: 'Self-Help Guide',
      description: 'Personal development and improvement guide',
      type: 'expert',
      category: 'personal'
    },
    autobiography: {
      name: 'Autobiography',
      description: 'Personal life story and experiences',
      type: 'personal',
      category: 'memoir'
    },
    report: {
      name: 'Professional Report',
      description: 'Business report with analysis and recommendations',
      type: 'expert',
      category: 'business'
    },
    caseStudy: {
      name: 'Case Study',
      description: 'Detailed analysis of specific business cases',
      type: 'expert',
      category: 'business'
    },
    whitepaper: {
      name: 'Whitepaper',
      description: 'Authoritative report on specific topics',
      type: 'expert',
      category: 'business'
    },
    simpleBook: {
      name: 'Simple Book',
      description: 'Basic book creation with essential content',
      type: 'simplified',
      category: 'general'
    }
  },

  // CONSOLIDATED FRAMEWORK FLOWS (from completeFrameworkFlows.js)
  frameworkFlows: {
    businessStrategyGuideShort: {
      id: 'frame-business-strategy-guide-short',
      name: 'Business Strategy Guide (Short)',
      description: 'Quick business strategy guide - 2-3 chapters, 3-8k words, essential frameworks only',
      type: 'framework',
      category: 'business',
      complexity: 'short'
    },
    businessStrategyGuideComplicated: {
      id: 'frame-business-strategy-guide-complicated',
      name: 'Business Strategy Guide (Comprehensive)',
      description: 'Complete business strategy guide - 8-12 chapters, 15-25k words, all frameworks',
      type: 'framework',
      category: 'business',
      complexity: 'comprehensive'
    }
  }
};

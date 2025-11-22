/**
 * ULTIMATE MASTER VARIABLE SYSTEM
 * SINGLE SOURCE OF TRUTH FOR ALL VARIABLES
 * Consolidates ALL 8+ variable systems into ONE comprehensive system
 * NO MORE SCATTERED VARIABLE FILES
 */

// ==================== ULTIMATE COMPREHENSIVE OPTIONS ====================
export const ULTIMATE_OPTIONS = {
  // Word Counts - COMPLETE RANGE
  word_counts: [
    { value: '250-500', label: '250-500 words (Micro)' },
    { value: '500-1000', label: '500-1,000 words (Mini)' },
    { value: '1000-1500', label: '1,000-1,500 words (Short)' },
    { value: '1500-3000', label: '1,500-3,000 words (Brief)' },
    { value: '3000-5000', label: '3,000-5,000 words (Medium)' },
    { value: '5000-8000', label: '5,000-8,000 words (Extended)' },
    { value: '8000-12000', label: '8,000-12,000 words (Long)' },
    { value: '12000-20000', label: '12,000-20,000 words (Novella)' },
    { value: '20000-35000', label: '20,000-35,000 words (Short Book)' },
    { value: '35000-50000', label: '35,000-50,000 words (Book)' },
    { value: '50000-70000', label: '50,000-70,000 words (Full Book)' },
    { value: '70000-100000', label: '70,000-100,000 words (Epic Book)' },
    { value: '100000+', label: '100,000+ words (Mega Book)' }
  ],

  // Chapter Counts - COMPLETE RANGE
  chapter_counts: [
    { value: '1', label: '1 Chapter' },
    { value: '2', label: '2 Chapters' },
    { value: '3', label: '3 Chapters' },
    { value: '4', label: '4 Chapters' },
    { value: '5', label: '5 Chapters' },
    { value: '6', label: '6 Chapters' },
    { value: '7', label: '7 Chapters' },
    { value: '8', label: '8 Chapters' },
    { value: '9', label: '9 Chapters' },
    { value: '10', label: '10 Chapters' },
    { value: '12', label: '12 Chapters' },
    { value: '15', label: '15 Chapters' },
    { value: '18', label: '18 Chapters' },
    { value: '20', label: '20 Chapters' },
    { value: '25', label: '25 Chapters' },
    { value: '30', label: '30 Chapters' },
    { value: '40', label: '40 Chapters' },
    { value: '50', label: '50 Chapters' }
  ],

  // Output Formats - ALL FORMATS (Text + Audio)
  output_formats: [
    { value: 'txt', label: 'Plain Text (.txt)' },
    { value: 'md', label: 'Markdown (.md)' },
    { value: 'docx', label: 'Microsoft Word (.docx)' },
    { value: 'pdf', label: 'PDF Document (.pdf)' },
    { value: 'html', label: 'HTML Web Page (.html)' },
    { value: 'epub', label: 'EPUB eBook (.epub)' },
    { value: 'mp3', label: 'MP3 Audio (.mp3)' },
    { value: 'm4a', label: 'M4A Audio (.m4a)' },
    { value: 'wav', label: 'WAV Audio (.wav)' },
    { value: 'audiobook', label: 'Audiobook Package' }
  ],

  // Content Source Options - For Audiobook/Compilation Flows
  content_sources: [
    { value: 'write_new', label: 'Write New Content' },
    { value: 'from_transcript', label: 'Convert from Transcript' },
    { value: 'from_text', label: 'Use Existing Text' },
    { value: 'from_blog', label: 'Compile from Blog Posts' },
    { value: 'from_social', label: 'Expand from Social Posts' },
    { value: 'from_images', label: 'Generate from Images' }
  ],

  // Celebrity Author Styles - For Style Clone Flow (20 options)
  celebrity_styles: [
    { value: 'stephen_king', label: 'Stephen King' },
    { value: 'malcolm_gladwell', label: 'Malcolm Gladwell' },
    { value: 'jk_rowling', label: 'J.K. Rowling' },
    { value: 'james_clear', label: 'James Clear' },
    { value: 'brene_brown', label: 'Brené Brown' },
    { value: 'hemingway', label: 'Ernest Hemingway' },
    { value: 'jane_austen', label: 'Jane Austen' },
    { value: 'agatha_christie', label: 'Agatha Christie' },
    { value: 'neil_gaiman', label: 'Neil Gaiman' },
    { value: 'maya_angelou', label: 'Maya Angelou' },
    { value: 'haruki_murakami', label: 'Haruki Murakami' },
    { value: 'toni_morrison', label: 'Toni Morrison' },
    { value: 'tim_ferriss', label: 'Tim Ferriss' },
    { value: 'seth_godin', label: 'Seth Godin' },
    { value: 'simon_sinek', label: 'Simon Sinek' },
    { value: 'yuval_noah_harari', label: 'Yuval Noah Harari' },
    { value: 'cal_newport', label: 'Cal Newport' },
    { value: 'ryan_holiday', label: 'Ryan Holiday' },
    { value: 'elizabeth_gilbert', label: 'Elizabeth Gilbert' },
    { value: 'michael_lewis', label: 'Michael Lewis' }
  ],

  // Target Audiences - COMPREHENSIVE
  target_audiences: [
    { value: 'general', label: 'General Audience' },
    { value: 'children', label: 'Children (5-12)' },
    { value: 'teens', label: 'Teenagers (13-17)' },
    { value: 'young_adult', label: 'Young Adults (18-25)' },
    { value: 'adults', label: 'Adults (25-45)' },
    { value: 'middle_aged', label: 'Middle-Aged (45-65)' },
    { value: 'seniors', label: 'Seniors (65+)' },
    { value: 'professionals', label: 'Business Professionals' },
    { value: 'executives', label: 'Senior Executives & C-Suite' },
    { value: 'managers', label: 'Managers & Team Leaders' },
    { value: 'entrepreneurs', label: 'Entrepreneurs & Startup Founders' },
    { value: 'small_business', label: 'Small Business Owners' },
    { value: 'freelancers', label: 'Freelancers & Consultants' },
    { value: 'students', label: 'Students & Academics' },
    { value: 'researchers', label: 'Researchers & Scientists' },
    { value: 'teachers', label: 'Teachers & Educators' },
    { value: 'parents', label: 'Parents & Caregivers' },
    { value: 'retirees', label: 'Retirees & Pensioners' },
    { value: 'investors', label: 'Investors & Financial Advisors' },
    { value: 'developers', label: 'Software Developers & Engineers' },
    { value: 'designers', label: 'Designers & Creatives' },
    { value: 'marketers', label: 'Marketers & Sales Professionals' },
    { value: 'healthcare', label: 'Healthcare Professionals' },
    { value: 'legal', label: 'Legal Professionals & Lawyers' },
    { value: 'beginners', label: 'Beginners & Novices' },
    { value: 'intermediate', label: 'Intermediate Learners' },
    { value: 'advanced', label: 'Advanced Practitioners' },
    { value: 'experts', label: 'Industry Experts & Thought Leaders' }
  ],

  // Tones - COMPREHENSIVE
  tones: [
    { value: 'friendly', label: 'Friendly & Approachable' },
    { value: 'authoritative', label: 'Authoritative & Expert' },
    { value: 'inspirational', label: 'Inspirational & Motivational' },
    { value: 'informative', label: 'Informative & Educational' },
    { value: 'entertaining', label: 'Entertaining & Engaging' },
    { value: 'serious', label: 'Serious & Professional' },
    { value: 'humorous', label: 'Humorous & Witty' },
    { value: 'professional', label: 'Professional & Formal' },
    { value: 'conversational', label: 'Conversational & Casual' },
    { value: 'empathetic', label: 'Empathetic & Caring' },
    { value: 'confident', label: 'Confident & Assertive' },
    { value: 'warm', label: 'Warm & Personal' },
    { value: 'dramatic', label: 'Dramatic & Intense' },
    { value: 'playful', label: 'Playful & Fun' },
    { value: 'sophisticated', label: 'Sophisticated & Elegant' },
    { value: 'urgent', label: 'Urgent & Action-Oriented' },
    { value: 'calming', label: 'Calming & Reassuring' },
    { value: 'passionate', label: 'Passionate & Enthusiastic' },
    { value: 'mysterious', label: 'Mysterious & Intriguing' },
    { value: 'optimistic', label: 'Optimistic & Positive' },
    { value: 'analytical', label: 'Analytical & Data-Driven' },
    { value: 'creative', label: 'Creative & Innovative' },
    { value: 'supportive', label: 'Supportive & Encouraging' },
    { value: 'challenging', label: 'Challenging & Provocative' }
  ],

  // Writing Styles - COMPREHENSIVE
  writing_styles: [
    { value: 'conversational', label: 'Conversational' },
    { value: 'professional', label: 'Professional' },
    { value: 'academic', label: 'Academic' },
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'creative', label: 'Creative' },
    { value: 'technical', label: 'Technical' },
    { value: 'descriptive', label: 'Descriptive' },
    { value: 'narrative', label: 'Narrative' },
    { value: 'journalistic', label: 'Journalistic' },
    { value: 'storytelling', label: 'Storytelling' },
    { value: 'persuasive', label: 'Persuasive' },
    { value: 'instructional', label: 'Instructional' },
    { value: 'analytical', label: 'Analytical' },
    { value: 'expository', label: 'Expository' },
    { value: 'argumentative', label: 'Argumentative' },
    { value: 'poetic', label: 'Poetic' },
    { value: 'satirical', label: 'Satirical' }
  ],

  // Language Accents - COMPREHENSIVE
  accents: [
    { value: 'american', label: 'American English' },
    { value: 'british', label: 'British English' },
    { value: 'australian', label: 'Australian English' },
    { value: 'canadian', label: 'Canadian English' },
    { value: 'irish', label: 'Irish English' },
    { value: 'scottish', label: 'Scottish English' },
    { value: 'welsh', label: 'Welsh English' },
    { value: 'indian', label: 'Indian English' },
    { value: 'hinglish', label: 'Hinglish (Hindi-English Mix)' },
    { value: 'jamaican', label: 'Jamaican English' },
    { value: 'south_african', label: 'South African English' },
    { value: 'new_zealand', label: 'New Zealand English' },
    { value: 'singapore', label: 'Singaporean English' },
    { value: 'nigerian', label: 'Nigerian English' },
    { value: 'kenyan', label: 'Kenyan English' },
    { value: 'neutral', label: 'Neutral International' }
  ],

  // Genres - COMPREHENSIVE
  genres: [
    { value: 'fiction', label: 'Fiction' },
    { value: 'non_fiction', label: 'Non-Fiction' },
    { value: 'business', label: 'Business & Finance' },
    { value: 'self_help', label: 'Self-Help & Personal Development' },
    { value: 'romance', label: 'Romance' },
    { value: 'thriller', label: 'Thriller & Mystery' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'sci_fi', label: 'Science Fiction' },
    { value: 'biography', label: 'Biography & Memoir' },
    { value: 'how_to', label: 'How-To & Guides' },
    { value: 'technical', label: 'Technical & Academic' },
    { value: 'educational', label: 'Educational' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'cooking', label: 'Cooking & Food' },
    { value: 'travel', label: 'Travel & Adventure' },
    { value: 'history', label: 'History' },
    { value: 'science', label: 'Science & Nature' },
    { value: 'philosophy', label: 'Philosophy & Religion' },
    { value: 'art', label: 'Art & Design' },
    { value: 'music', label: 'Music & Entertainment' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'parenting', label: 'Parenting & Family' },
    { value: 'politics', label: 'Politics & Society' },
    { value: 'psychology', label: 'Psychology & Mental Health' }
  ],

  // Industry Focus - COMPREHENSIVE
  industry_focuses: [
    { value: 'technology', label: 'Technology & Software' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare & Medical' },
    { value: 'education', label: 'Education & Training' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing & Industrial' },
    { value: 'consulting', label: 'Consulting & Professional Services' },
    { value: 'startup', label: 'Startup & Entrepreneurship' },
    { value: 'enterprise', label: 'Enterprise & Corporate' },
    { value: 'marketing', label: 'Marketing & Advertising' },
    { value: 'real_estate', label: 'Real Estate & Property' },
    { value: 'automotive', label: 'Automotive & Transportation' },
    { value: 'energy', label: 'Energy & Utilities' },
    { value: 'agriculture', label: 'Agriculture & Food Production' },
    { value: 'entertainment', label: 'Entertainment & Media' },
    { value: 'hospitality', label: 'Hospitality & Tourism' },
    { value: 'legal', label: 'Legal & Law' },
    { value: 'nonprofit', label: 'Nonprofit & Social Impact' },
    { value: 'government', label: 'Government & Public Sector' },
    { value: 'construction', label: 'Construction & Architecture' }
  ],

  // Imaging & E‑Cover Options (Canonical)
  image_styles: [
    { value: 'photorealistic', label: 'Photorealistic' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'illustration', label: 'Illustration' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'oil_painting', label: 'Oil Painting' },
    { value: 'digital_painting', label: 'Digital Painting' },
    { value: 'anime', label: 'Anime / Manga' },
    { value: 'pixel_art', label: 'Pixel Art' },
    { value: 'line_art', label: 'Line Art' },
    { value: 'low_poly', label: 'Low Poly' }
  ],

  art_types: [
    { value: 'character', label: 'Character' },
    { value: 'scene', label: 'Scene / Environment' },
    { value: 'concept_art', label: 'Concept Art' },
    { value: 'poster', label: 'Poster' },
    { value: 'cover_art', label: 'Cover Art' },
    { value: 'icon', label: 'Icon / Symbol' }
  ],

  aspect_ratios: [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '4:5', label: 'Portrait (4:5)' },
    { value: '3:4', label: 'Portrait (3:4)' },
    { value: '16:9', label: 'Widescreen (16:9)' },
    { value: '9:16', label: 'Tall (9:16)' },
    { value: '2:3', label: 'Portrait (2:3)' }
  ],

  camera_angles: [
    { value: 'eye_level', label: 'Eye-Level' },
    { value: 'high_angle', label: 'High Angle' },
    { value: 'low_angle', label: 'Low Angle' },
    { value: 'bird_eye', label: "Bird's Eye" },
    { value: 'worm_eye', label: "Worm's Eye" },
    { value: 'over_the_shoulder', label: 'Over-the-Shoulder' },
    { value: 'close_up', label: 'Close-Up' },
    { value: 'wide', label: 'Wide Shot' }
  ],

  focal_lengths: [
    { value: '24mm', label: '24mm (Wide)' },
    { value: '35mm', label: '35mm' },
    { value: '50mm', label: '50mm (Standard)' },
    { value: '85mm', label: '85mm (Portrait)' },
    { value: '135mm', label: '135mm (Telephoto)' }
  ],

  lighting_styles: [
    { value: 'soft', label: 'Soft Light' },
    { value: 'hard', label: 'Hard Light' },
    { value: 'rim', label: 'Rim Light' },
    { value: 'dramatic', label: 'Dramatic / Film Noir' },
    { value: 'studio', label: 'Studio Lighting' },
    { value: 'natural', label: 'Natural / Sunlight' },
    { value: 'neon', label: 'Neon / Cyberpunk' }
  ],

  backgrounds: [
    { value: 'transparent', label: 'Transparent' },
    { value: 'solid', label: 'Solid Color' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'studio', label: 'Studio Backdrop' },
    { value: 'indoor_scene', label: 'Indoor Scene' },
    { value: 'outdoor_scene', label: 'Outdoor Scene' }
  ],

  color_palettes: [
    { value: 'mono_dark', label: 'Monochrome Dark' },
    { value: 'mono_light', label: 'Monochrome Light' },
    { value: 'vibrant', label: 'Vibrant / High Contrast' },
    { value: 'pastel', label: 'Pastel / Soft' },
    { value: 'earthy', label: 'Earthy / Natural' },
    { value: 'neon', label: 'Neon / Cyber' }
  ],

  image_moods: [
    { value: 'epic', label: 'Epic' },
    { value: 'moody', label: 'Moody' },
    { value: 'serene', label: 'Serene' },
    { value: 'playful', label: 'Playful' },
    { value: 'mysterious', label: 'Mysterious' },
    { value: 'romantic', label: 'Romantic' }
  ],

  compositions: [
    { value: 'rule_of_thirds', label: 'Rule of Thirds' },
    { value: 'centered', label: 'Centered / Symmetry' },
    { value: 'leading_lines', label: 'Leading Lines' },
    { value: 'golden_ratio', label: 'Golden Ratio' },
    { value: 'minimal', label: 'Minimal' }
  ],

  image_counts: [
    { value: '1', label: '1 Image' },
    { value: '2', label: '2 Images' },
    { value: '3', label: '3 Images' },
    { value: '4', label: '4 Images' },
    { value: '6', label: '6 Images' }
  ],

  upscalers: [
    { value: 'standard', label: 'Standard' },
    { value: 'high', label: 'High' },
    { value: 'ultra', label: 'Ultra' }
  ],

  ecover_layouts: [
    { value: 'title_top', label: 'Title Top, Artwork Center' },
    { value: 'title_center', label: 'Title Center Overlay' },
    { value: 'title_bottom', label: 'Title Bottom, Artwork Full' },
    { value: 'left_art_right_text', label: 'Left Art, Right Text' }
  ],

  ecover_styles: [
    { value: 'minimal', label: 'Minimal / Clean' },
    { value: 'bold', label: 'Bold / High Contrast' },
    { value: 'classic', label: 'Classic / Elegant' },
    { value: 'sci_fi', label: 'Sci‑Fi / Futuristic' },
    { value: 'fantasy', label: 'Fantasy / Magical' },
    { value: 'romance', label: 'Romance / Warm' }
  ],

  typography_combos: [
    { value: 'serif_display + sans_body', label: 'Serif Display + Sans Body' },
    { value: 'sans_display + serif_body', label: 'Sans Display + Serif Body' },
    { value: 'all_serif', label: 'All Serif' },
    { value: 'all_sans', label: 'All Sans' }
  ],
  // Formatting Options
  font_families: [
    { value: 'Georgia, serif', label: 'Georgia (Serif)' },
    { value: 'Times New Roman, serif', label: 'Times New Roman (Serif)' },
    { value: 'Arial, sans-serif', label: 'Arial (Sans)' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica (Sans)' },
    { value: 'Courier New, monospace', label: 'Courier New (Mono)' }
  ],
  body_font_sizes: [
    { value: '10', label: '10 pt' },
    { value: '11', label: '11 pt' },
    { value: '12', label: '12 pt' },
    { value: '13', label: '13 pt' }
  ],
  heading_scales: [
    { value: 'small', label: 'Small' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' }
  ],
  line_heights: [
    { value: '1.3', label: '1.3' },
    { value: '1.5', label: '1.5' },
    { value: '1.7', label: '1.7' }
  ],
  paragraph_spacings: [
    { value: '4', label: 'Compact' },
    { value: '8', label: 'Normal' },
    { value: '12', label: 'Relaxed' }
  ],
  page_sizes: [
    { value: 'A5', label: 'A5' },
    { value: 'A4', label: 'A4' },
    { value: 'Letter', label: 'US Letter' }
  ],
  page_margin_presets: [
    { value: 'narrow', label: 'Narrow' },
    { value: 'normal', label: 'Normal' },
    { value: 'wide', label: 'Wide' }
  ]
}

// ==================== ULTIMATE VARIABLE DEFINITIONS ====================
export const ULTIMATE_VARIABLES = {
  // Core Content
  book_title: {
    name: 'Book Title',
    type: 'text',
    required: true,
    placeholder: 'Enter your book title',
    description: 'Main title of your book or content piece',
    category: 'core'
  },

  author_name: {
    name: 'Author Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your name',
    description: 'Your name as the author/creator',
    category: 'core'
  },

  topic: {
    name: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'Main topic/subject',
    description: 'Primary subject or theme of your content',
    category: 'core'
  },

  subtitle: {
    name: 'Subtitle',
    type: 'text',
    required: false,
    placeholder: 'Enter subtitle (optional)',
    description: 'Secondary title or tagline for your content',
    category: 'core'
  },

  author_bio: {
    name: 'Author Bio',
    type: 'textarea',
    required: false,
    placeholder: 'Brief author biography',
    description: 'Short professional biography of the author',
    category: 'core'
  },

  // Classification
  genre: {
    name: 'Genre',
    type: 'select',
    required: true,
    placeholder: 'Select genre',
    options: 'genres',
    description: 'Literary or content genre classification',
    category: 'classification'
  },

  target_audience: {
    name: 'Target Audience',
    type: 'select',
    required: true,
    placeholder: 'Select your audience',
    options: 'target_audiences',
    description: 'Primary demographic for your content',
    category: 'classification'
  },

  // Structure & Length
  word_count: {
    name: 'Word Count',
    type: 'select',
    required: true,
    placeholder: 'Select desired length',
    options: 'word_counts',
    description: 'Target length of your content in words',
    category: 'structure'
  },

  chapter_count: {
    name: 'Chapter Count',
    type: 'select',
    required: true,
    placeholder: 'Select number of chapters',
    options: 'chapter_counts',
    description: 'Number of chapters or sections to create',
    category: 'structure'
  },

  // Style & Tone
  tone: {
    name: 'Tone',
    type: 'select',
    required: true,
    placeholder: 'Select writing tone',
    options: 'tones',
    description: 'Overall mood and voice of your writing',
    category: 'style'
  },

  writing_style: {
    name: 'Writing Style',
    type: 'select',
    required: true,
    placeholder: 'Select writing style',
    options: 'writing_styles',
    description: 'How formal or casual your writing should be',
    category: 'style'
  },

  accent: {
    name: 'Language Accent',
    type: 'select',
    required: false,
    placeholder: 'Select language style',
    options: 'accents',
    description: 'Regional language style and expressions',
    category: 'style'
  },

  // Business & Industry
  industry_focus: {
    name: 'Industry Focus',
    type: 'select',
    required: false,
    placeholder: 'Select industry (optional)',
    options: 'industry_focuses',
    description: 'Primary industry or sector focus',
    category: 'business'
  },

  business_objective: {
    name: 'Business Objective',
    type: 'textarea',
    required: false,
    placeholder: 'Business goals and objectives',
    description: 'Main business goals this content should achieve',
    category: 'business'
  },

  key_topics: {
    name: 'Key Topics',
    type: 'textarea',
    required: false,
    placeholder: 'List main topics to cover',
    description: 'Essential topics that must be covered',
    category: 'business'
  },

  // Output & Publishing
  output_formats: {
    name: 'Output Formats',
    type: 'multiselect',
    required: true,
    placeholder: 'Select output formats (multiple)',
    options: 'output_formats',
    description: 'File formats for final output',
    category: 'output'
  },

  // Features & Enhancements
  include_case_studies: {
    name: 'Include Case Studies',
    type: 'checkbox',
    required: false,
    placeholder: 'Add real-world case studies',
    description: 'Include practical examples and case studies',
    category: 'features'
  },

  include_examples: {
    name: 'Include Examples',
    type: 'checkbox',
    required: false,
    placeholder: 'Add practical examples',
    description: 'Include practical examples throughout content',
    category: 'features'
  },

  include_exercises: {
    name: 'Include Exercises',
    type: 'checkbox',
    required: false,
    placeholder: 'Add interactive exercises',
    description: 'Include interactive exercises or activities',
    category: 'features'
  },

  include_templates: {
    name: 'Include Templates',
    type: 'checkbox',
    required: false,
    placeholder: 'Add downloadable templates',
    description: 'Include downloadable templates and tools',
    category: 'features'
  },

  // Imaging Toggles
  include_images: {
    name: 'Include Images',
    type: 'checkbox',
    required: false,
    placeholder: 'Enable image generation',
    description: 'Generate images alongside text outputs',
    category: 'imaging'
  },
  include_ecover: {
    name: 'Include E‑Cover',
    type: 'checkbox',
    required: false,
    placeholder: 'Enable e‑cover generation',
    description: 'Generate a professional e‑cover',
    category: 'imaging'
  },

  // Imaging Controls
  image_placement: {
    name: 'Image Placement',
    type: 'select',
    required: false,
    placeholder: 'Choose how images are placed',
    defaultValue: 'auto',
    options: [
      { value: 'inline', label: 'Inline within chapter body' },
      { value: 'chapter_header', label: 'At the beginning of each chapter' },
      { value: 'auto', label: 'Let AI decide' }
    ],
    description: 'Control where generated images appear inside the book',
    category: 'imaging'
  },
  image_style: {
    name: 'Image Style',
    type: 'select',
    required: false,
    placeholder: 'Select image style',
    options: 'image_styles',
    description: 'Overall visual style of generated images',
    category: 'imaging'
  },
  art_type: {
    name: 'Art Type',
    type: 'select',
    required: false,
    placeholder: 'Select art type',
    options: 'art_types',
    description: 'Type of artwork to generate',
    category: 'imaging'
  },
  aspect_ratio: {
    name: 'Aspect Ratio',
    type: 'select',
    required: false,
    placeholder: 'Select aspect ratio',
    options: 'aspect_ratios',
    description: 'Canvas aspect ratio for images',
    category: 'imaging'
  },
  camera_angle: {
    name: 'Camera Angle',
    type: 'select',
    required: false,
    placeholder: 'Select camera angle',
    options: 'camera_angles',
    description: 'Point of view for shots',
    category: 'imaging'
  },
  focal_length: {
    name: 'Focal Length',
    type: 'select',
    required: false,
    placeholder: 'Select focal length',
    options: 'focal_lengths',
    description: 'Lens focal length for perspective',
    category: 'imaging'
  },
  lighting_style: {
    name: 'Lighting Style',
    type: 'select',
    required: false,
    placeholder: 'Select lighting style',
    options: 'lighting_styles',
    description: 'Lighting mood and setup',
    category: 'imaging'
  },
  background: {
    name: 'Background',
    type: 'select',
    required: false,
    placeholder: 'Select background type',
    options: 'backgrounds',
    description: 'Background type for images',
    category: 'imaging'
  },
  color_palette: {
    name: 'Color Palette',
    type: 'select',
    required: false,
    placeholder: 'Select color palette',
    options: 'color_palettes',
    description: 'Color palette to guide generation',
    category: 'imaging'
  },
  mood: {
    name: 'Mood',
    type: 'select',
    required: false,
    placeholder: 'Select mood',
    options: 'image_moods',
    description: 'Mood or vibe of the image',
    category: 'imaging'
  },
  composition: {
    name: 'Composition',
    type: 'select',
    required: false,
    placeholder: 'Select composition',
    options: 'compositions',
    description: 'Composition guideline to follow',
    category: 'imaging'
  },
  negative_prompt: {
    name: 'Negative Prompt',
    type: 'textarea',
    required: false,
    placeholder: 'Things to avoid in images',
    description: 'Hard constraints for image generation',
    category: 'imaging'
  },
  num_images: {
    name: 'Number of Images',
    type: 'select',
    required: false,
    placeholder: 'How many images to generate',
    options: 'image_counts',
    description: 'Batch size for image generation',
    category: 'imaging'
  },
  seed: {
    name: 'Seed',
    type: 'text',
    required: false,
    placeholder: 'Optional numeric seed',
    description: 'Seed for reproducible results',
    category: 'imaging'
  },
  upscaler: {
    name: 'Upscaler / Quality',
    type: 'select',
    required: false,
    placeholder: 'Select quality mode',
    options: 'upscalers',
    description: 'Quality/upscaler mode for final images',
    category: 'imaging'
  },

  // E‑Cover Controls
  ecover_layout: {
    name: 'E‑Cover Layout',
    type: 'select',
    required: false,
    placeholder: 'Select cover layout',
    options: 'ecover_layouts',
    description: 'Layout template for the e‑cover',
    category: 'imaging'
  },
  ecover_style: {
    name: 'E‑Cover Style',
    type: 'select',
    required: false,
    placeholder: 'Select cover style',
    options: 'ecover_styles',
    description: 'Stylistic direction for the e‑cover',
    category: 'imaging'
  },
  title_text: {
    name: 'Cover Title Text',
    type: 'text',
    required: false,
    placeholder: 'Override title (optional)',
    description: 'Custom title for the cover if different',
    category: 'imaging'
  },
  subtitle_text: {
    name: 'Cover Subtitle Text',
    type: 'text',
    required: false,
    placeholder: 'Override subtitle (optional)',
    description: 'Custom subtitle for the cover if different',
    category: 'imaging'
  },
  author_text: {
    name: 'Cover Author Text',
    type: 'text',
    required: false,
    placeholder: 'Override author name (optional)',
    description: 'Custom author text for the cover',
    category: 'imaging'
  },
  typography_combo: {
    name: 'Typography Combo',
    type: 'select',
    required: false,
    placeholder: 'Select typography combo',
    options: 'typography_combos',
    description: 'Font pairing for the e‑cover',
    category: 'imaging'
  },
  brand_colors: {
    name: 'Brand Colors',
    type: 'text',
    required: false,
    placeholder: 'Hex codes or brand palette',
    description: 'Brand colors to honor in the design',
    category: 'imaging'
  },
  logo_url: {
    name: 'Logo URL',
    type: 'text',
    required: false,
    placeholder: 'https://... (optional)',
    description: 'Public URL to a logo to place on cover',
    category: 'imaging'
  },

  // Custom Instructions
  custom_instructions: {
    name: 'Custom Instructions',
    type: 'textarea',
    required: false,
    placeholder: 'Any specific requirements or focus areas...',
    description: 'Additional instructions or specific requirements',
    category: 'custom'
  },
  // Formatting (optional)
  heading_font_family: {
    name: 'Heading Font',
    type: 'select',
    required: false,
    placeholder: 'Select heading font',
    options: 'font_families',
    description: 'Font family for headings and titles',
    category: 'formatting'
  },
  body_font_family: {
    name: 'Body Font',
    type: 'select',
    required: false,
    placeholder: 'Select body font',
    options: 'font_families',
    description: 'Font family for body text',
    category: 'formatting'
  },
  body_font_size: {
    name: 'Body Font Size',
    type: 'select',
    required: false,
    placeholder: 'Select body font size',
    options: 'body_font_sizes',
    description: 'Base font size for body text (pt)',
    category: 'formatting'
  },
  heading_scale: {
    name: 'Heading Scale',
    type: 'select',
    required: false,
    placeholder: 'Select heading scale',
    options: 'heading_scales',
    description: 'Relative size for headings',
    category: 'formatting'
  },
  line_height: {
    name: 'Line Height',
    type: 'select',
    required: false,
    placeholder: 'Select line height',
    options: 'line_heights',
    description: 'Line spacing in text',
    category: 'formatting'
  },
  paragraph_spacing: {
    name: 'Paragraph Spacing',
    type: 'select',
    required: false,
    placeholder: 'Select paragraph spacing',
    options: 'paragraph_spacings',
    description: 'Space between paragraphs',
    category: 'formatting'
  },
  page_size: {
    name: 'Page Size',
    type: 'select',
    required: false,
    placeholder: 'Select page size',
    options: 'page_sizes',
    description: 'Paper/page size for PDF/DOCX',
    category: 'formatting'
  },
  page_margins: {
    name: 'Page Margins',
    type: 'select',
    required: false,
    placeholder: 'Select margin preset',
    options: 'page_margin_presets',
    description: 'Margin preset for PDF/DOCX',
    category: 'formatting'
  },
  include_toc: {
    name: 'Include TOC',
    type: 'checkbox',
    required: false,
    placeholder: 'Include table of contents',
    description: 'Generate a table of contents',
    category: 'formatting'
  },
  include_title_page: {
    name: 'Include Title Page',
    type: 'checkbox',
    required: false,
    placeholder: 'Include title page',
    description: 'Generate a title page',
    category: 'formatting'
  },
  about_author_position: {
    name: 'About Author Position',
    type: 'select',
    required: false,
    placeholder: 'Choose where to place About the Author',
    options: [
      { value: 'start', label: 'After Foreword/Introduction' },
      { value: 'end', label: 'End of Book' }
    ],
    description: 'Place the About the Author section either near the beginning or at the end',
    category: 'formatting'
  },

  // ==================== AUDIOBOOK-SPECIFIC VARIABLES ====================
  content_source: {
    name: 'Content Source',
    type: 'select',
    required: false,
    placeholder: 'How to create content?',
    options: 'content_sources',
    description: 'Source method for content creation',
    category: 'audiobook'
  },
  source_content: {
    name: 'Source Content',
    type: 'textarea',
    required: false,
    placeholder: 'Paste existing text or transcript',
    description: 'Existing content to convert (transcript, text, blog posts, etc.)',
    category: 'audiobook',
    rows: 8
  },
  voice_settings: {
    name: 'Voice Settings',
    type: 'textarea',
    required: false,
    placeholder: 'Voice speed, pitch, accent preferences',
    description: 'Audio narration voice configuration',
    category: 'audiobook',
    rows: 3
  },
  include_chapter_markers: {
    name: 'Chapter Markers',
    type: 'checkbox',
    required: false,
    placeholder: 'Add chapter navigation markers',
    description: 'Include chapter markers for audio navigation',
    category: 'audiobook'
  },
  include_background_music: {
    name: 'Background Music',
    type: 'checkbox',
    required: false,
    placeholder: 'Add background music',
    description: 'Include subtle background music or ambience',
    category: 'audiobook'
  },

  // ==================== IMAGE-BASED FLOW VARIABLES ====================
  image_urls: {
    name: 'Image URLs',
    type: 'textarea',
    required: false,
    placeholder: 'Paste image URLs (one per line)',
    description: 'Image URLs to analyze and create content from',
    category: 'image_based',
    rows: 6
  },
  image_uploads: {
    name: 'Upload Images',
    type: 'file',
    required: false,
    placeholder: 'Upload images',
    description: 'Upload images directly from your device',
    category: 'image_based',
    accept: 'image/*',
    multiple: true,
    maxFiles: 12
  },

  // ==================== CONTENT TRANSFORMATION VARIABLES ====================
  transcript_content: {
    name: 'Transcript Content',
    type: 'textarea',
    required: false,
    placeholder: 'Paste transcript text',
    description: 'Podcast, interview, or video transcript to convert',
    category: 'transformation',
    rows: 10
  },
  thread_content: {
    name: 'Thread Content',
    type: 'textarea',
    required: false,
    placeholder: 'Paste social media thread',
    description: 'Twitter thread, Reddit post, or LinkedIn series',
    category: 'transformation',
    rows: 8
  },
  blog_content: {
    name: 'Blog Posts',
    type: 'textarea',
    required: false,
    placeholder: 'Paste blog post content',
    description: 'Your blog posts to compile into a book',
    category: 'transformation',
    rows: 10
  },

  // ==================== EXPERTISE EXTRACTION VARIABLES ====================
  key_insights: {
    name: 'Key Insights',
    type: 'textarea',
    required: false,
    placeholder: 'Your most important insights',
    description: '5-10 key insights or frameworks from your expertise',
    category: 'expertise',
    rows: 6
  },
  case_examples: {
    name: 'Case Examples',
    type: 'textarea',
    required: false,
    placeholder: 'Real examples and case studies',
    description: 'Specific situations where you applied your expertise',
    category: 'expertise',
    rows: 6
  },
  common_mistakes: {
    name: 'Common Mistakes',
    type: 'textarea',
    required: false,
    placeholder: 'Common mistakes in your field',
    description: 'What mistakes do people typically make?',
    category: 'expertise',
    rows: 4
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get options for a field - handles both string references and direct arrays
 */
export const getFieldOptions = (field) => {
  if (!field) return []
  
  // If field has optionsSource, use it to get from ULTIMATE_OPTIONS
  if (field.optionsSource && ULTIMATE_OPTIONS[field.optionsSource]) {
    return ULTIMATE_OPTIONS[field.optionsSource]
  }
  
  // If field.options is a string, treat it as a reference to ULTIMATE_OPTIONS
  if (typeof field.options === 'string' && ULTIMATE_OPTIONS[field.options]) {
    return ULTIMATE_OPTIONS[field.options]
  }
  
  // If field.options is an array, return it directly
  if (Array.isArray(field.options)) {
    return field.options
  }
  
  // If variable definition has options reference
  const variableConfig = ULTIMATE_VARIABLES[field.variable]
  if (variableConfig && typeof variableConfig.options === 'string' && ULTIMATE_OPTIONS[variableConfig.options]) {
    return ULTIMATE_OPTIONS[variableConfig.options]
  }
  
  return []
}

/**
 * Get proper field name - converts underscore to proper case
 */
export const getFieldName = (field) => {
  // First try to get from ULTIMATE_VARIABLES
  const variableConfig = ULTIMATE_VARIABLES[field.variable]
  if (variableConfig && variableConfig.name) {
    return variableConfig.name
  }
  
  // If field has a proper name, use it
  if (field.name && !field.name.includes('_')) {
    return field.name
  }
  
  // Convert variable name to proper case
  const variableName = field.variable || field.name || 'Field'
  return variableName.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

/**
 * Get all variables formatted for form generation
 */
export const getUltimateFormVariables = (categories = null) => {
  const variables = categories 
    ? Object.entries(ULTIMATE_VARIABLES).filter(([key, config]) => categories.includes(config.category))
    : Object.entries(ULTIMATE_VARIABLES)
  
  return variables.map(([key, config]) => ({
    id: key,
    variable: key,
    name: config.name,
    type: config.type,
    required: config.required,
    placeholder: config.placeholder,
    options: typeof config.options === 'string' ? ULTIMATE_OPTIONS[config.options] : (config.options || []),
    description: config.description,
    category: config.category
  }))
}

// Export everything
export { ULTIMATE_OPTIONS as STANDARD_OPTIONS }
export default ULTIMATE_VARIABLES

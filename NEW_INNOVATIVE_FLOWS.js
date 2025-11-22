/**
 * 5 INNOVATIVE CLIENT FLOWS
 * High-demand, creative, unique use cases
 * Using ONLY nodePalettes nodes
 */

export const NEW_CLIENT_FLOWS = {
  
  // ============================================================
  // 1. IMAGE TO STORY FLOW
  // ============================================================
  image_to_story: {
    id: 'client-innovative-1',
    name: 'Image to Story Writer',
    description: 'Upload images, AI creates complete story based on visual narrative',
    category: 'Creative Innovation',
    difficulty: 'Advanced',
    flow_key: 'image_to_story',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Image Upload & Story Settings',
          description: 'Upload images and basic story preferences',
          role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Book Title', type: 'text', required: false, variable: 'book_title', placeholder: 'Leave blank for AI to generate from images' },
            { id: 2, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Your name' },
            { id: 3, name: 'Image URLs', type: 'textarea', required: true, variable: 'image_urls', placeholder: 'Paste image URLs (one per line, 2-12 images)', description: 'Upload 2-12 images that will inspire the story' },
            { id: 4, name: 'Genre Preference', type: 'select', required: false, variable: 'genre', optionsSource: 'genres', placeholder: 'Let AI decide from images' },
            { id: 5, name: 'Target Audience', type: 'select', required: false, variable: 'target_audience', optionsSource: 'target_audiences', placeholder: 'AI will infer from images' },
            { id: 6, name: 'Desired Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 7, name: 'Tone Preference', type: 'select', required: false, variable: 'tone', optionsSource: 'tones', placeholder: 'AI will match image mood' },
            { id: 8, name: 'Custom Instructions', type: 'textarea', required: false, variable: 'custom_instructions', placeholder: 'Any specific narrative direction, character traits, plot elements (optional)' },
            { id: 9, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      {
        id: 'analyzer-1',
        type: 'process',
        position: { x: 400, y: 200 },
        data: {
          label: 'Image Analyzer',
          description: 'Analyzes uploaded images for story elements',
          role: 'world_builder',
          aiEnabled: true
        }
      },
      {
        id: 'architect-1',
        type: 'process',
        position: { x: 700, y: 200 },
        data: {
          label: 'Story Architect',
          description: 'Creates narrative structure from image analysis',
          role: 'story_outliner',
          aiEnabled: true
        }
      },
      {
        id: 'writer-1',
        type: 'process',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Story Writer',
          description: 'Writes complete story incorporating all images',
          role: 'content_writer',
          aiEnabled: true
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Output',
          description: 'Multi-format story with embedded images',
          role: 'output_processor'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'analyzer-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'analyzer-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'writer-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  // ============================================================
  // 2. TRANSCRIPT TO BOOK FLOW
  // ============================================================
  transcript_to_book: {
    id: 'client-innovative-2',
    name: 'Transcript to Book',
    description: 'Transform podcast/interview transcripts into professional books',
    category: 'Content Transformation',
    difficulty: 'Professional',
    flow_key: 'transcript_to_book',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Transcript Upload',
          description: 'Upload transcript and book preferences',
          role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Transcript Text', type: 'textarea', required: true, variable: 'transcript_content', placeholder: 'Paste your podcast/interview transcript here', description: 'Can be from Otter.ai, Descript, or any transcription service' },
            { id: 2, name: 'Book Title', type: 'text', required: false, variable: 'book_title', placeholder: 'AI will generate from content' },
            { id: 3, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Speaker/author name' },
            { id: 4, name: 'Book Type', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 5, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 6, name: 'Desired Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 7, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 8, name: 'Writing Style', type: 'select', required: true, variable: 'writing_style', optionsSource: 'writing_styles' },
            { id: 9, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      {
        id: 'extractor-1',
        type: 'process',
        position: { x: 400, y: 200 },
        data: {
          label: 'Knowledge Extractor',
          description: 'Extracts key insights and themes from transcript',
          role: 'researcher',
          aiEnabled: true
        }
      },
      {
        id: 'architect-1',
        type: 'process',
        position: { x: 700, y: 200 },
        data: {
          label: 'Book Architect',
          description: 'Structures transcript insights into book outline',
          role: 'content_architect',
          aiEnabled: true
        }
      },
      {
        id: 'writer-1',
        type: 'process',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Content Writer',
          description: 'Transforms transcript into polished book chapters',
          role: 'content_writer',
          aiEnabled: true
        }
      },
      {
        id: 'editor-1',
        type: 'process',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Editor',
          description: 'Polishes and refines book content',
          role: 'editor',
          aiEnabled: true
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1600, y: 200 },
        data: {
          label: 'Output',
          description: 'Publication-ready book',
          role: 'output_processor'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'extractor-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'extractor-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'writer-1', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'editor-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  // ============================================================
  // 3. IDEA TO BESTSELLER FLOW
  // ============================================================
  idea_to_bestseller: {
    id: 'client-innovative-3',
    name: 'Idea to Bestseller',
    description: 'From rough concept to complete book - AI handles everything',
    category: 'Full Automation',
    difficulty: 'Premium',
    flow_key: 'idea_to_bestseller',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Book Concept',
          description: 'Just your idea - AI does the rest',
          role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Book Concept', type: 'textarea', required: true, variable: 'topic', placeholder: 'Describe your book idea in 2-5 sentences', description: 'Just the core concept - AI will expand' },
            { id: 2, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Your name' },
            { id: 3, name: 'Genre', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 4, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 5, name: 'Desired Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 6, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      {
        id: 'research-1',
        type: 'process',
        position: { x: 400, y: 150 },
        data: {
          label: 'Deep Researcher',
          description: 'Researches topic thoroughly',
          role: 'researcher',
          aiEnabled: true
        }
      },
      {
        id: 'world-1',
        type: 'process',
        position: { x: 400, y: 250 },
        data: {
          label: 'World Builder',
          description: 'Creates rich world/setting',
          role: 'world_builder',
          aiEnabled: true
        }
      },
      {
        id: 'character-1',
        type: 'process',
        position: { x: 700, y: 150 },
        data: {
          label: 'Character Developer',
          description: 'Develops compelling characters',
          role: 'character_developer',
          aiEnabled: true
        }
      },
      {
        id: 'plot-1',
        type: 'process',
        position: { x: 700, y: 250 },
        data: {
          label: 'Plot Architect',
          description: 'Designs story structure',
          role: 'plot_architect',
          aiEnabled: true
        }
      },
      {
        id: 'writer-1',
        type: 'process',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Master Writer',
          description: 'Writes complete book',
          role: 'content_writer',
          aiEnabled: true
        }
      },
      {
        id: 'editor-1',
        type: 'process',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Editor',
          description: 'Professional polish',
          role: 'editor',
          aiEnabled: true
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1600, y: 200 },
        data: {
          label: 'Output',
          description: 'Complete professional book',
          role: 'multi_format_output'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'research-1', type: 'smoothstep', animated: true },
      { id: 'e1-3', source: 'input-1', target: 'world-1', type: 'smoothstep', animated: true },
      { id: 'e2-4', source: 'research-1', target: 'character-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'world-1', target: 'character-1', type: 'smoothstep', animated: true },
      { id: 'e2-5', source: 'research-1', target: 'plot-1', type: 'smoothstep', animated: true },
      { id: 'e3-5', source: 'world-1', target: 'plot-1', type: 'smoothstep', animated: true },
      { id: 'e4-6', source: 'character-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'plot-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e6-7', source: 'writer-1', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e7-8', source: 'editor-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  // ============================================================
  // 2. TRANSCRIPT TO BOOK FLOW
  // ============================================================
  transcript_to_book: {
    id: 'client-innovative-2',
    name: 'Transcript to Book',
    description: 'Transform podcasts, interviews, or speeches into professional books',
    category: 'Content Transformation',
    difficulty: 'Professional',
    flow_key: 'transcript_to_book',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Transcript Input',
          description: 'Upload transcript and book settings',
          role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Transcript', type: 'textarea', required: true, variable: 'transcript_content', placeholder: 'Paste your transcript (from Otter, Descript, YouTube, etc.)', description: 'Can be multiple episodes or one long interview' },
            { id: 2, name: 'Book Title', type: 'text', required: false, variable: 'book_title', placeholder: 'AI will generate from content' },
            { id: 3, name: 'Author/Speaker Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Primary speaker/author name' },
            { id: 4, name: 'Book Type', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 5, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 6, name: 'Target Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 7, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 8, name: 'Writing Style', type: 'select', required: true, variable: 'writing_style', optionsSource: 'writing_styles' },
            { id: 9, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      {
        id: 'extractor-1',
        type: 'process',
        position: { x: 400, y: 200 },
        data: {
          label: 'Insight Extractor',
          description: 'Extracts key insights and quotes from transcript',
          role: 'researcher',
          aiEnabled: true
        }
      },
      {
        id: 'architect-1',
        type: 'process',
        position: { x: 700, y: 200 },
        data: {
          label: 'Book Architect',
          description: 'Structures insights into book outline',
          role: 'content_architect',
          aiEnabled: true
        }
      },
      {
        id: 'writer-1',
        type: 'process',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Content Writer',
          description: 'Transforms transcript into polished book',
          role: 'content_writer',
          aiEnabled: true
        }
      },
      {
        id: 'editor-1',
        type: 'process',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Editor',
          description: 'Professional editing and polish',
          role: 'editor',
          aiEnabled: true
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1600, y: 200 },
        data: {
          label: 'Output',
          description: 'Professional book from transcript',
          role: 'output_processor'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'extractor-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'extractor-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'writer-1', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'editor-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  // ============================================================
  // 3. VIRAL THREAD TO EBOOK FLOW
  // ============================================================
  thread_to_ebook: {
    id: 'client-innovative-3',
    name: 'Viral Thread to eBook',
    description: 'Expand Twitter/Reddit threads into professional eBooks',
    category: 'Viral Content',
    difficulty: 'Fast',
    flow_key: 'thread_to_ebook',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Thread Content',
          description: 'Paste viral thread or posts',
          role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Thread Content', type: 'textarea', required: true, variable: 'thread_content', placeholder: 'Paste your Twitter thread, Reddit post, or LinkedIn series', description: 'Copy the entire thread including all tweets/posts' },
            { id: 2, name: 'eBook Title', type: 'text', required: false, variable: 'book_title', placeholder: 'AI will generate catchy title' },
            { id: 3, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Your name' },
            { id: 4, name: 'Content Type', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 5, name: 'Target Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts', description: 'AI will expand thread to this length' },
            { id: 6, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 7, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 8, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      {
        id: 'expander-1',
        type: 'process',
        position: { x: 400, y: 200 },
        data: {
          label: 'Thread Expander',
          description: 'Expands thread into detailed content',
          role: 'content_writer',
          aiEnabled: true
        }
      },
      {
        id: 'structure-1',
        type: 'process',
        position: { x: 700, y: 200 },
        data: {
          label: 'Structure Optimizer',
          description: 'Organizes expanded content into chapters',
          role: 'content_architect',
          aiEnabled: true
        }
      },
      {
        id: 'polish-1',
        type: 'process',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Polisher',
          description: 'Professional formatting and polish',
          role: 'end_to_end_polisher',
          aiEnabled: true
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Output',
          description: 'Professional eBook',
          role: 'output_processor'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'expander-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'expander-1', target: 'structure-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'structure-1', target: 'polish-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'polish-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  // ============================================================
  // 4. EXPERTISE EXTRACTION FLOW
  // ============================================================
  expertise_to_authority: {
    id: 'client-innovative-4',
    name: 'Expertise to Authority Book',
    description: 'AI interviews you, extracts expertise, creates authority positioning book',
    category: 'Thought Leadership',
    difficulty: 'Premium',
    flow_key: 'expertise_extraction',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Expertise Questionnaire',
          description: 'Answer questions about your expertise',
          role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Your Expertise Area', type: 'text', required: true, variable: 'topic', placeholder: 'e.g., "SaaS customer retention strategies"' },
            { id: 2, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Your name' },
            { id: 3, name: 'Author Bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Your credentials and experience (2-3 sentences)' },
            { id: 4, name: 'Key Insights', type: 'textarea', required: true, variable: 'key_insights', placeholder: 'Your 5-10 most important insights or frameworks in your field', description: 'Bullet points or paragraphs - AI will structure' },
            { id: 5, name: 'Real Examples', type: 'textarea', required: true, variable: 'case_examples', placeholder: 'Describe 2-3 real situations where you applied your expertise', description: 'These become case studies' },
            { id: 6, name: 'Common Mistakes', type: 'textarea', required: true, variable: 'common_mistakes', placeholder: 'What mistakes do people make in your field?' },
            { id: 7, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 8, name: 'Book Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 9, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 10, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      {
        id: 'synthesizer-1',
        type: 'process',
        position: { x: 400, y: 200 },
        data: {
          label: 'Knowledge Synthesizer',
          description: 'Synthesizes your expertise into frameworks',
          role: 'researcher',
          aiEnabled: true
        }
      },
      {
        id: 'architect-1',
        type: 'process',
        position: { x: 700, y: 200 },
        data: {
          label: 'Book Architect',
          description: 'Structures expertise into authority book',
          role: 'content_architect',
          aiEnabled: true
        }
      },
      {
        id: 'writer-1',
        type: 'process',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Authority Writer',
          description: 'Writes complete authority positioning book',
          role: 'technical_writer',
          aiEnabled: true
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Output',
          description: 'Authority book showcasing your expertise',
          role: 'output_processor'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'synthesizer-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'synthesizer-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'writer-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  // ============================================================
  // 5. SOCIAL PROOF TO AUTHORITY FLOW
  // ============================================================
  testimonials_to_book: {
    id: 'client-innovative-5',
    name: 'Social Proof to Authority',
    description: 'Transform customer testimonials and reviews into authority positioning book',
    category: 'Authority Building',
    difficulty: 'Professional',
    flow_key: 'social_proof_book',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Social Proof Collection',
          description: 'Upload testimonials, reviews, case results',
          role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Your Method/System', type: 'text', required: true, variable: 'topic', placeholder: 'e.g., "The 90-Day Transformation Method"', description: 'What method are you teaching/selling?' },
            { id: 2, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Your name' },
            { id: 3, name: 'Customer Testimonials', type: 'textarea', required: true, variable: 'testimonials', placeholder: 'Paste 10-20 customer testimonials/reviews', description: 'AI will extract themes and success patterns' },
            { id: 4, name: 'Before/After Results', type: 'textarea', required: true, variable: 'case_results', placeholder: 'Describe 5-10 customer transformations with specific metrics', description: 'e.g., "Client A: Lost 45 lbs in 90 days"' },
            { id: 5, name: 'Your Methodology', type: 'textarea', required: true, variable: 'methodology', placeholder: 'Describe your process/framework in 3-5 sentences' },
            { id: 6, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 7, name: 'Book Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 8, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 9, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      {
        id: 'analyzer-1',
        type: 'process',
        position: { x: 400, y: 200 },
        data: {
          label: 'Pattern Analyzer',
          description: 'Analyzes testimonials for success patterns',
          role: 'researcher',
          aiEnabled: true
        }
      },
      {
        id: 'architect-1',
        type: 'process',
        position: { x: 700, y: 200 },
        data: {
          label: 'Book Architect',
          description: 'Structures methodology book with proof',
          role: 'content_architect',
          aiEnabled: true
        }
      },
      {
        id: 'writer-1',
        type: 'process',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Authority Writer',
          description: 'Writes methodology book with testimonials woven in',
          role: 'copywriter',
          aiEnabled: true
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Output',
          description: 'Authority book with social proof',
          role: 'output_processor'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'analyzer-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'analyzer-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'writer-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  // ============================================================
  // 5. BLOG TO BOOK COMPILER FLOW
  // ============================================================
  blog_to_book: {
    id: 'client-innovative-5',
    name: 'Blog to Book Compiler',
    description: 'Compile your best blog posts into a cohesive, professional book',
    category: 'Content Compilation',
    difficulty: 'Professional',
    flow_key: 'blog_to_book',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Blog Content Collection',
          description: 'Upload your blog posts and book preferences',
          role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Blog Posts', type: 'textarea', required: true, variable: 'blog_content', placeholder: 'Paste 5-20 of your best blog posts (copy full text)', description: 'AI will identify themes and organize coherently' },
            { id: 2, name: 'Book Title', type: 'text', required: false, variable: 'book_title', placeholder: 'AI will create compelling title from themes' },
            { id: 3, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Your name' },
            { id: 4, name: 'Author Bio', type: 'textarea', required: false, variable: 'author_bio', placeholder: 'Brief bio to include in book' },
            { id: 5, name: 'Book Type', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 6, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 7, name: 'Desired Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts', description: 'AI will expand/condense to reach target' },
            { id: 8, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 9, name: 'Writing Style', type: 'select', required: true, variable: 'writing_style', optionsSource: 'writing_styles' },
            { id: 10, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      {
        id: 'analyzer-1',
        type: 'process',
        position: { x: 400, y: 200 },
        data: {
          label: 'Theme Analyzer',
          description: 'Identifies themes and clusters related posts',
          role: 'researcher',
          aiEnabled: true
        }
      },
      {
        id: 'architect-1',
        type: 'process',
        position: { x: 700, y: 200 },
        data: {
          label: 'Book Architect',
          description: 'Creates cohesive book structure from blog clusters',
          role: 'content_architect',
          aiEnabled: true
        }
      },
      {
        id: 'compiler-1',
        type: 'process',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Content Compiler',
          description: 'Compiles and expands blog posts into book chapters',
          role: 'content_writer',
          aiEnabled: true
        }
      },
      {
        id: 'polish-1',
        type: 'process',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Professional Polish',
          description: 'Ensures cohesive voice and professional presentation',
          role: 'editor',
          aiEnabled: true
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1600, y: 200 },
        data: {
          label: 'Output',
          description: 'Professional book from blog content',
          role: 'output_processor'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'analyzer-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'analyzer-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'architect-1', target: 'compiler-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'compiler-1', target: 'polish-1', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'polish-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  }
};

export default NEW_CLIENT_FLOWS;


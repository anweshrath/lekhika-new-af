/**
 * ALCHEMIST PRE-BUILT FLOWS - TOP 10 CONTENT MANUFACTURING POWERHOUSES
 * Boss's Vision: Quick, specialized flows that create AMAZING content instantly!
 * Format: Input → Process 1 → Process 2 (Writing) → Output
 */

export const alchemistPreBuiltFlows = [
  // ============================================================================
  // 1. 📝 BLOG POST MANUFACTURING FLOW
  // ============================================================================
  {
    id: 'blog_post_flow',
    name: '📝 Blog Post Powerhouse',
    description: 'Complete blog post creation from topic to published content',
    category: 'Content Creation',
    estimatedTime: '5-8 minutes',
    difficulty: 'Easy',
    outputFormats: ['HTML', 'Markdown', 'WordPress Ready'],
    nodes: [
      {
        id: 'input_1',
        type: 'textPromptInput',
        position: { x: 100, y: 200 },
        data: {
          label: 'Blog Topic Input',
          description: 'Collect blog topic, audience, and requirements',
          inputFields: [
            { variable: 'topic_alc', name: 'Blog Topic', type: 'text', required: true, description: 'Main topic for the blog post' },
            { variable: 'target_audience_alc', name: 'Target Audience', type: 'select', required: true, description: 'Primary readers for this blog' },
            { variable: 'content_tone_alc', name: 'Content Tone', type: 'select', required: true, description: 'Writing tone and style' },
            { variable: 'word_count_alc', name: 'Word Count', type: 'select', required: false, description: 'Desired article length' },
            { variable: 'keywords_alc', name: 'SEO Keywords', type: 'textarea', required: false, description: 'Target keywords for SEO' },
            { variable: 'content_purpose_alc', name: 'Content Purpose', type: 'select', required: true, description: 'Goal of the blog post' }
          ],
          variables: [
            'topic_alc',
            'target_audience_alc', 
            'content_tone_alc',
            'word_count_alc',
            'keywords_alc',
            'content_purpose_alc'
          ],
          instructions: 'Enter your blog topic and target audience details'
        }
      },
      {
        id: 'process_1',
        type: 'researchEngine',
        position: { x: 400, y: 200 },
        data: {
          label: 'Research & Data Gathering',
          description: 'Deep research with facts, stats, and competitive analysis',
          config: {
            researchDepth: 'comprehensive',
            includeStatistics: true,
            factCheck: true,
            competitorAnalysis: true
          }
        }
      },
      {
        id: 'process_2',
        type: 'contentWriter',
        position: { x: 700, y: 200 },
        data: {
          label: 'AI Blog Writer',
          description: 'Generate engaging blog post with SEO optimization',
          config: {
            writingStyle: 'engaging_blog',
            includeSubheadings: true,
            seoOptimized: true,
            callToAction: true,
            structure: 'problem_solution'
          }
        }
      },
      {
        id: 'condition_1',
        type: 'validationCheck',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Quality Gate',
          description: 'Validate content quality and SEO compliance',
          config: {
            qualityThreshold: 85,
            seoScore: 80,
            readabilityCheck: true,
            plagiarismCheck: true
          }
        }
      },
      {
        id: 'output_1',
        type: 'multiFormatExporter',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Blog Export',
          description: 'Export in blog-ready formats with meta tags',
          config: {
            formats: ['html', 'markdown', 'wordpress'],
            includeMeta: true,
            addImages: true,
            socialTags: true
          }
        }
      }
    ],
    connections: [
      { source: 'input_1', target: 'process_1' },
      { source: 'process_1', target: 'process_2' },
      { source: 'process_2', target: 'condition_1' },
      { source: 'condition_1', target: 'output_1' }
    ]
  },

  // ============================================================================
  // 2. 📧 EMAIL SEQUENCE DESTROYER FLOW
  // ============================================================================
  {
    id: 'email_sequence_flow',
    name: '📧 Email Sequence Destroyer',
    description: 'Multi-email sequence generator for lead nurturing and sales',
    category: 'Email Marketing',
    estimatedTime: '8-12 minutes',
    difficulty: 'Medium',
    outputFormats: ['HTML Email', 'Plain Text', 'Email Platform Ready'],
    nodes: [
      {
        id: 'input_1',
        type: 'textPromptInput',
        position: { x: 100, y: 200 },
        data: {
          label: 'Email Campaign Input',
          description: 'Define email campaign goals and audience',
          inputFields: [
            { variable: 'target_audience_alc', name: 'Target Audience', type: 'select', required: true, description: 'Email subscribers audience' },
            { variable: 'content_purpose_alc', name: 'Campaign Purpose', type: 'select', required: true, description: 'Goal of email sequence' },
            { variable: 'brand_personality_alc', name: 'Brand Personality', type: 'select', required: true, description: 'Brand voice and style' },
            { variable: 'content_series_alc', name: 'Email Sequence', type: 'select', required: true, description: 'Type of email series' },
            { variable: 'post_count_alc', name: 'Number of Emails', type: 'select', required: false, description: 'Total emails in sequence' },
            { variable: 'call_to_action_alc', name: 'Call to Action', type: 'text', required: true, description: 'Primary action for subscribers' }
          ],
          variables: [
            'target_audience_alc',
            'content_purpose_alc',
            'brand_personality_alc',
            'content_series_alc',
            'post_count_alc',
            'call_to_action_alc'
          ]
        }
      },
      {
        id: 'process_1',
        type: 'contentWriter',
        position: { x: 400, y: 200 },
        data: {
          label: 'Email Sequence Writer',
          description: 'Generate complete email sequence with perfect timing',
          config: {
            emailTypes: ['welcome', 'nurture', 'sales', 'follow_up'],
            personalization: true,
            subjectLines: true,
            ctaOptimization: true
          }
        }
      },
      {
        id: 'preview_1',
        type: 'emailPreview',
        position: { x: 700, y: 200 },
        data: {
          label: 'Email Client Preview',
          description: 'Preview across all major email clients',
          config: {
            emailClients: ['gmail', 'outlook', 'apple_mail', 'mobile'],
            spamCheck: true,
            deliverabilityScore: true
          }
        }
      },
      {
        id: 'output_1',
        type: 'scheduler',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Email Scheduler',
          description: 'Schedule and deploy email sequence',
          config: {
            platforms: ['mailchimp', 'constant_contact', 'sendgrid'],
            optimalTiming: true,
            a_b_testing: true
          }
        }
      }
    ],
    connections: [
      { source: 'input_1', target: 'process_1' },
      { source: 'process_1', target: 'preview_1' },
      { source: 'preview_1', target: 'output_1' }
    ]
  },

  // ============================================================================
  // 3. 🎯 SALES PAGE CONVERTER FLOW
  // ============================================================================
  {
    id: 'sales_page_flow',
    name: '🎯 Sales Page Converter',
    description: 'High-converting sales page with psychological triggers',
    category: 'Sales & Marketing',
    estimatedTime: '10-15 minutes',
    difficulty: 'Advanced',
    outputFormats: ['Landing Page HTML', 'Sales Funnel Ready', 'A/B Test Versions'],
    nodes: [
      {
        id: 'input_1',
        type: 'textPromptInput',
        position: { x: 100, y: 200 },
        data: {
          label: 'Product & Audience Input',
          description: 'Define product, target audience, and sales goals',
          inputFields: [
            { variable: 'content_purpose_alc', name: 'Sales Purpose', type: 'select', required: true, description: 'Primary sales objective' },
            { variable: 'target_audience_alc', name: 'Target Audience', type: 'select', required: true, description: 'Ideal customer profile' },
            { variable: 'brand_personality_alc', name: 'Brand Personality', type: 'select', required: true, description: 'Brand voice for sales page' },
            { variable: 'competitor_analysis_alc', name: 'Competitor Analysis', type: 'textarea', required: false, description: 'Key competitors to analyze' },
            { variable: 'content_goals_alc', name: 'Sales Goals', type: 'select', required: true, description: 'Conversion objectives' }
          ],
          variables: [
            'content_purpose_alc',
            'target_audience_alc',
            'brand_personality_alc',
            'competitor_analysis_alc',
            'content_goals_alc'
          ]
        }
      },
      {
        id: 'process_1',
        type: 'researchEngine',
        position: { x: 400, y: 200 },
        data: {
          label: 'Market Research',
          description: 'Analyze competitors and market psychology',
          config: {
            competitorAnalysis: true,
            painPointResearch: true,
            buyerPersona: true,
            marketTrends: true
          }
        }
      },
      {
        id: 'process_2',
        type: 'contentWriter',
        position: { x: 700, y: 150 },
        data: {
          label: 'Sales Copy Writer',
          description: 'Generate persuasive sales copy with proven frameworks',
          config: {
            framework: 'AIDA_PAS_FAB',
            psychologyTriggers: true,
            socialProof: true,
            urgencyScarcity: true,
            guarantees: true
          }
        }
      },
      {
        id: 'process_3',
        type: 'qualityOptimizer',
        position: { x: 700, y: 250 },
        data: {
          label: 'Conversion Optimizer',
          description: 'Optimize for maximum conversion rates',
          config: {
            conversionOptimization: true,
            readabilityScore: true,
            trustFactors: true,
            mobileFriendly: true
          }
        }
      },
      {
        id: 'preview_1',
        type: 'livePreview',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Sales Page Preview',
          description: 'Preview sales page with conversion heatmaps',
          config: {
            conversionTracking: true,
            heatmapSimulation: true,
            mobilePreview: true
          }
        }
      },
      {
        id: 'output_1',
        type: 'multiFormatExporter',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Sales Page Export',
          description: 'Export optimized sales page with tracking',
          config: {
            formats: ['html', 'wordpress', 'leadpages'],
            analytics: true,
            abTestVersions: 2
          }
        }
      }
    ],
    connections: [
      { source: 'input_1', target: 'process_1' },
      { source: 'process_1', target: 'process_2' },
      { source: 'process_1', target: 'process_3' },
      { source: 'process_2', target: 'preview_1' },
      { source: 'process_3', target: 'preview_1' },
      { source: 'preview_1', target: 'output_1' }
    ]
  },

  // ============================================================================
  // 4. 📱 SOCIAL MEDIA DOMINATOR FLOW
  // ============================================================================
  {
    id: 'social_media_flow',
    name: '📱 Social Media Dominator',
    description: 'Multi-platform social content with platform optimization',
    category: 'Social Media',
    estimatedTime: '6-10 minutes',
    difficulty: 'Easy',
    outputFormats: ['Instagram Ready', 'LinkedIn Posts', 'Twitter Threads', 'Facebook Posts'],
    nodes: [
      {
        id: 'input_1',
        type: 'textPromptInput',
        position: { x: 100, y: 200 },
        data: {
          label: 'Social Campaign Input',
          description: 'Define social media campaign and platforms',
          inputFields: [
            { variable: 'topic_alc', name: 'Social Topic', type: 'text', required: true, description: 'Main topic for social posts' },
            { variable: 'target_audience_alc', name: 'Target Audience', type: 'select', required: true, description: 'Social media audience' },
            { variable: 'content_tone_alc', name: 'Content Tone', type: 'select', required: true, description: 'Social media voice' },
            { variable: 'content_format_alc', name: 'Content Format', type: 'select', required: true, description: 'Type of social content' },
            { variable: 'content_freshness_alc', name: 'Content Style', type: 'select', required: false, description: 'Trending or evergreen content' }
          ],
          variables: [
            'topic_alc',
            'target_audience_alc',
            'content_tone_alc',
            'content_format_alc',
            'content_freshness_alc'
          ]
        }
      },
      {
        id: 'process_1',
        type: 'contentWriter',
        position: { x: 400, y: 200 },
        data: {
          label: 'Social Content Writer',
          description: 'Generate platform-specific social content',
          config: {
            platforms: ['instagram', 'linkedin', 'twitter', 'facebook'],
            hashtags: true,
            engagement: true,
            viral_potential: true
          }
        }
      },
      {
        id: 'preview_1',
        type: 'mobileDesktopSimulator',
        position: { x: 700, y: 200 },
        data: {
          label: 'Platform Preview',
          description: 'Preview across all social platforms',
          config: {
            platforms: ['instagram_feed', 'linkedin_post', 'twitter_card', 'facebook_post'],
            engagementPredict: true
          }
        }
      },
      {
        id: 'output_1',
        type: 'scheduler',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Social Scheduler',
          description: 'Schedule across all platforms with optimal timing',
          config: {
            platforms: ['hootsuite', 'buffer', 'sprout_social'],
            optimalTiming: true,
            crossPosting: true
          }
        }
      }
    ],
    connections: [
      { source: 'input_1', target: 'process_1' },
      { source: 'process_1', target: 'preview_1' },
      { source: 'preview_1', target: 'output_1' }
    ]
  },

  // ============================================================================
  // 5. 📰 PRESS RELEASE AUTHORITY FLOW
  // ============================================================================
  {
    id: 'press_release_flow',
    name: '📰 Press Release Authority',
    description: 'Professional press release with media distribution',
    category: 'Public Relations',
    estimatedTime: '8-12 minutes',
    difficulty: 'Medium',
    outputFormats: ['AP Style', 'Media Kit', 'Distribution Ready'],
    nodes: [
      {
        id: 'input_1',
        type: 'textPromptInput',
        position: { x: 100, y: 200 },
        data: {
          label: 'Press Release Input',
          description: 'Define news announcement and target media',
          inputFields: [
            { variable: 'topic_alc', name: 'News Topic', type: 'text', required: true, description: 'Main news announcement' },
            { variable: 'content_purpose_alc', name: 'Press Purpose', type: 'select', required: true, description: 'Goal of press release' },
            { variable: 'industry_focus_alc', name: 'Industry Focus', type: 'select', required: true, description: 'Target industry sector' },
            { variable: 'content_freshness_alc', name: 'News Urgency', type: 'select', required: false, description: 'Breaking or scheduled news' },
            { variable: 'brand_personality_alc', name: 'Brand Voice', type: 'select', required: true, description: 'Corporate communication style' }
          ],
          variables: [
            'topic_alc',
            'content_purpose_alc',
            'industry_focus_alc',
            'content_freshness_alc',
            'brand_personality_alc'
          ]
        }
      },
      {
        id: 'process_1',
        type: 'researchEngine',
        position: { x: 400, y: 200 },
        data: {
          label: 'News Research',
          description: 'Research industry context and news angle',
          config: {
            industryNews: true,
            competitorNews: true,
            mediaTrends: true,
            factVerification: true
          }
        }
      },
      {
        id: 'process_2',
        type: 'contentWriter',
        position: { x: 700, y: 200 },
        data: {
          label: 'Press Release Writer',
          description: 'Generate AP-style press release with quotes',
          config: {
            style: 'AP_journalism',
            structure: 'inverted_pyramid',
            quotes: true,
            contactInfo: true,
            boilerplate: true
          }
        }
      },
      {
        id: 'condition_1',
        type: 'validationCheck',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Media Standards Check',
          description: 'Validate against journalism standards',
          config: {
            apStyleCheck: true,
            factCheck: true,
            legalCompliance: true,
            mediaStandards: true
          }
        }
      },
      {
        id: 'output_1',
        type: 'multiFormatExporter',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Media Distribution',
          description: 'Export for media distribution networks',
          config: {
            formats: ['ap_style', 'media_kit', 'pdf'],
            wireServices: true,
            mediaContacts: true
          }
        }
      }
    ],
    connections: [
      { source: 'input_1', target: 'process_1' },
      { source: 'process_1', target: 'process_2' },
      { source: 'process_2', target: 'condition_1' },
      { source: 'condition_1', target: 'output_1' }
    ]
  },

  // ============================================================================
  // 6. 🎬 VIDEO SCRIPT CREATOR FLOW
  // ============================================================================
  {
    id: 'video_script_flow',
    name: '🎬 Video Script Creator',
    description: 'Engaging video scripts with scene breakdowns and timing',
    category: 'Video Content',
    estimatedTime: '10-15 minutes',
    difficulty: 'Medium',
    outputFormats: ['Script PDF', 'Teleprompter Ready', 'Scene Storyboard'],
    nodes: [
      {
        id: 'input_1',
        type: 'textPromptInput',
        position: { x: 100, y: 200 },
        data: {
          label: 'Video Concept Input',
          description: 'Define video concept, duration, and style',
          inputFields: [
            { variable: 'topic_alc', name: 'Video Topic', type: 'text', required: true, description: 'Main video subject' },
            { variable: 'target_audience_alc', name: 'Target Audience', type: 'select', required: true, description: 'Video viewers demographic' },
            { variable: 'content_tone_alc', name: 'Video Tone', type: 'select', required: true, description: 'Style and mood of video' },
            { variable: 'content_format_alc', name: 'Video Format', type: 'select', required: true, description: 'Type of video content' },
            { variable: 'content_purpose_alc', name: 'Video Purpose', type: 'select', required: true, description: 'Goal of the video' }
          ],
          variables: [
            'topic_alc',
            'target_audience_alc',
            'content_tone_alc',
            'content_format_alc',
            'content_purpose_alc'
          ]
        }
      },
      {
        id: 'process_1',
        type: 'contentWriter',
        position: { x: 400, y: 200 },
        data: {
          label: 'Script Writer',
          description: 'Generate engaging video script with timing',
          config: {
            scriptFormat: 'professional',
            sceneBreakdown: true,
            timing: true,
            cues: true,
            hooks: true
          }
        }
      },
      {
        id: 'process_2',
        type: 'qualityOptimizer',
        position: { x: 700, y: 200 },
        data: {
          label: 'Engagement Optimizer',
          description: 'Optimize for viewer retention and engagement',
          config: {
            retentionOptimization: true,
            hookStrength: true,
            pacing: true,
            callToActionOptimization: true
          }
        }
      },
      {
        id: 'preview_1',
        type: 'livePreview',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Script Preview',
          description: 'Preview script with timing and visual cues',
          config: {
            timingVisualization: true,
            teleprompterView: true,
            sceneVisualization: true
          }
        }
      },
      {
        id: 'output_1',
        type: 'multiFormatExporter',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Script Export',
          description: 'Export in production-ready formats',
          config: {
            formats: ['pdf', 'teleprompter', 'final_draft'],
            storyboard: true,
            shotList: true
          }
        }
      }
    ],
    connections: [
      { source: 'input_1', target: 'process_1' },
      { source: 'process_1', target: 'process_2' },
      { source: 'process_2', target: 'preview_1' },
      { source: 'preview_1', target: 'output_1' }
    ]
  },

  // ============================================================================
  // 7. 🛒 PRODUCT DESCRIPTION POWERHOUSE FLOW
  // ============================================================================
  {
    id: 'product_description_flow',
    name: '🛒 Product Description Powerhouse',
    description: 'Compelling product descriptions that convert browsers to buyers',
    category: 'E-commerce',
    estimatedTime: '5-8 minutes',
    difficulty: 'Easy',
    outputFormats: ['Shopify Ready', 'Amazon Listing', 'WooCommerce'],
    nodes: [
      {
        id: 'input_1',
        type: 'textPromptInput',
        position: { x: 100, y: 200 },
        data: {
          label: 'Product Details Input',
          description: 'Enter product specifications and target market',
          inputFields: [
            { variable: 'target_audience_alc', name: 'Target Market', type: 'select', required: true, description: 'Product buyers demographic' },
            { variable: 'content_purpose_alc', name: 'Sales Purpose', type: 'select', required: true, description: 'Product marketing goal' },
            { variable: 'brand_personality_alc', name: 'Brand Voice', type: 'select', required: true, description: 'Brand communication style' },
            { variable: 'keywords_alc', name: 'Product Keywords', type: 'textarea', required: false, description: 'SEO keywords for product' },
            { variable: 'competitor_analysis_alc', name: 'Competitor Products', type: 'textarea', required: false, description: 'Similar products to analyze' }
          ],
          variables: [
            'target_audience_alc',
            'content_purpose_alc',
            'brand_personality_alc',
            'keywords_alc',
            'competitor_analysis_alc'
          ]
        }
      },
      {
        id: 'process_1',
        type: 'researchEngine',
        position: { x: 400, y: 200 },
        data: {
          label: 'Market Research',
          description: 'Analyze competitor products and pricing',
          config: {
            competitorAnalysis: true,
            priceComparison: true,
            featureAnalysis: true,
            reviewAnalysis: true
          }
        }
      },
      {
        id: 'process_2',
        type: 'contentWriter',
        position: { x: 700, y: 200 },
        data: {
          label: 'Product Copy Writer',
          description: 'Generate persuasive product descriptions',
          config: {
            copyStyle: 'persuasive_ecommerce',
            benefitsFocus: true,
            seoOptimized: true,
            bulletPoints: true,
            urgency: true
          }
        }
      },
      {
        id: 'condition_1',
        type: 'validationCheck',
        position: { x: 1000, y: 200 },
        data: {
          label: 'E-commerce Standards',
          description: 'Validate against platform requirements',
          config: {
            platformCompliance: true,
            seoValidation: true,
            lengthOptimization: true,
            keywordDensity: true
          }
        }
      },
      {
        id: 'output_1',
        type: 'multiFormatExporter',
        position: { x: 1300, y: 200 },
        data: {
          label: 'E-commerce Export',
          description: 'Export for all major e-commerce platforms',
          config: {
            formats: ['shopify', 'amazon', 'woocommerce', 'ebay'],
            seoMetadata: true,
            variants: true
          }
        }
      }
    ],
    connections: [
      { source: 'input_1', target: 'process_1' },
      { source: 'process_1', target: 'process_2' },
      { source: 'process_2', target: 'condition_1' },
      { source: 'condition_1', target: 'output_1' }
    ]
  },

  // ============================================================================
  // 8. 📊 CASE STUDY AUTHORITY FLOW
  // ============================================================================
  {
    id: 'case_study_flow',
    name: '📊 Case Study Authority',
    description: 'Data-driven case studies that build credibility and trust',
    category: 'Business Content',
    estimatedTime: '12-18 minutes',
    difficulty: 'Advanced',
    outputFormats: ['Professional PDF', 'Web Article', 'Presentation Slides'],
    nodes: [
      {
        id: 'input_1',
        type: 'textPromptInput',
        position: { x: 100, y: 200 },
        data: {
          label: 'Case Study Input',
          description: 'Define the case study subject and objectives',
          inputFields: [
            { variable: 'topic_alc', name: 'Case Study Topic', type: 'text', required: true, description: 'Main subject of case study' },
            { variable: 'industry_focus_alc', name: 'Industry Focus', type: 'select', required: true, description: 'Relevant industry sector' },
            { variable: 'content_purpose_alc', name: 'Study Purpose', type: 'select', required: true, description: 'Goal of the case study' },
            { variable: 'target_audience_alc', name: 'Target Audience', type: 'select', required: true, description: 'Professional audience reading study' },
            { variable: 'quality_level_alc', name: 'Quality Level', type: 'select', required: false, description: 'Depth and rigor of analysis' }
          ],
          variables: [
            'topic_alc',
            'industry_focus_alc',
            'content_purpose_alc',
            'target_audience_alc',
            'quality_level_alc'
          ]
        }
      },
      {
        id: 'process_1',
        type: 'researchEngine',
        position: { x: 400, y: 200 },
        data: {
          label: 'Data Collection',
          description: 'Gather metrics, data points, and evidence',
          config: {
            dataCollection: true,
            metricsAnalysis: true,
            industryBenchmarks: true,
            competitorCaseStudies: true
          }
        }
      },
      {
        id: 'process_2',
        type: 'contentWriter',
        position: { x: 700, y: 200 },
        data: {
          label: 'Case Study Writer',
          description: 'Structure case study with problem-solution-results format',
          config: {
            structure: 'problem_solution_results',
            dataVisualization: true,
            testimonials: true,
            methodology: true,
            lessons: true
          }
        }
      },
      {
        id: 'condition_1',
        type: 'validationCheck',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Credibility Check',
          description: 'Validate data accuracy and credibility',
          config: {
            factVerification: true,
            dataAccuracy: true,
            sourceValidation: true,
            professionalStandards: true
          }
        }
      },
      {
        id: 'output_1',
        type: 'multiFormatExporter',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Professional Export',
          description: 'Export in business-ready formats',
          config: {
            formats: ['professional_pdf', 'presentation', 'web_article'],
            dataCharts: true,
            branding: true
          }
        }
      }
    ],
    connections: [
      { source: 'input_1', target: 'process_1' },
      { source: 'process_1', target: 'process_2' },
      { source: 'process_2', target: 'condition_1' },
      { source: 'condition_1', target: 'output_1' }
    ]
  },

  // ============================================================================
  // 9. 📢 AD COPY CONVERTER FLOW
  // ============================================================================
  {
    id: 'ad_copy_flow',
    name: '📢 Ad Copy Converter',
    description: 'High-converting ad copy for Facebook, Google, and LinkedIn',
    category: 'Advertising',
    estimatedTime: '6-10 minutes',
    difficulty: 'Medium',
    outputFormats: ['Facebook Ads', 'Google Ads', 'LinkedIn Ads', 'Multi-Platform'],
    nodes: [
      {
        id: 'input_1',
        type: 'textPromptInput',
        position: { x: 100, y: 200 },
        data: {
          label: 'Ad Campaign Input',
          description: 'Define ad objective, audience, and platform',
          inputFields: [
            { variable: 'target_audience_alc', name: 'Target Audience', type: 'select', required: true, description: 'Ad targeting demographic' },
            { variable: 'content_purpose_alc', name: 'Campaign Purpose', type: 'select', required: true, description: 'Advertising objective' },
            { variable: 'content_tone_alc', name: 'Ad Tone', type: 'select', required: true, description: 'Voice and style for ads' },
            { variable: 'call_to_action_alc', name: 'Call to Action', type: 'text', required: true, description: 'Primary CTA for ads' },
            { variable: 'competitor_analysis_alc', name: 'Competitor Ads', type: 'textarea', required: false, description: 'Competing ad campaigns to analyze' }
          ],
          variables: [
            'target_audience_alc',
            'content_purpose_alc',
            'content_tone_alc',
            'call_to_action_alc',
            'competitor_analysis_alc'
          ]
        }
      },
      {
        id: 'process_1',
        type: 'researchEngine',
        position: { x: 400, y: 200 },
        data: {
          label: 'Ad Intelligence',
          description: 'Research competitor ads and audience psychology',
          config: {
            competitorAds: true,
            audiencePsychology: true,
            adPerformance: true,
            keywordResearch: true
          }
        }
      },
      {
        id: 'process_2',
        type: 'contentWriter',
        position: { x: 700, y: 200 },
        data: {
          label: 'Ad Copy Writer',
          description: 'Generate platform-specific ad copy with variations',
          config: {
            platforms: ['facebook', 'google', 'linkedin', 'twitter'],
            variations: 5,
            psychology: true,
            urgency: true,
            testing: true
          }
        }
      },
      {
        id: 'condition_1',
        type: 'validationCheck',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Ad Policy Check',
          description: 'Validate against platform advertising policies',
          config: {
            policyCompliance: true,
            characterLimits: true,
            prohibitedContent: true,
            brandSafety: true
          }
        }
      },
      {
        id: 'output_1',
        type: 'multiFormatExporter',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Ad Campaign Export',
          description: 'Export campaign-ready ad copy with testing variants',
          config: {
            formats: ['csv', 'excel', 'ad_manager'],
            abTestVersions: 3,
            platforms: ['facebook', 'google', 'linkedin']
          }
        }
      }
    ],
    connections: [
      { source: 'input_1', target: 'process_1' },
      { source: 'process_1', target: 'process_2' },
      { source: 'process_2', target: 'condition_1' },
      { source: 'condition_1', target: 'output_1' }
    ]
  },

  // ============================================================================
  // 10. 📚 WHITE PAPER AUTHORITY FLOW
  // ============================================================================
  {
    id: 'white_paper_flow',
    name: '📚 White Paper Authority',
    description: 'Research-heavy white papers that establish thought leadership',
    category: 'Thought Leadership',
    estimatedTime: '15-25 minutes',
    difficulty: 'Expert',
    outputFormats: ['Professional PDF', 'Interactive Web Version', 'Executive Summary'],
    nodes: [
      {
        id: 'input_1',
        type: 'textPromptInput',
        position: { x: 100, y: 200 },
        data: {
          label: 'White Paper Topic',
          description: 'Define research topic and target executive audience',
          inputFields: [
            { variable: 'topic_alc', name: 'Research Topic', type: 'text', required: true, description: 'Main research subject' },
            { variable: 'industry_focus_alc', name: 'Industry Focus', type: 'select', required: true, description: 'Target industry sector' },
            { variable: 'target_audience_alc', name: 'Executive Audience', type: 'select', required: true, description: 'Decision-maker audience' },
            { variable: 'research_depth_alc', name: 'Research Depth', type: 'select', required: false, description: 'Thoroughness of research' },
            { variable: 'quality_level_alc', name: 'Quality Level', type: 'select', required: false, description: 'Authority and credibility level' }
          ],
          variables: [
            'topic_alc',
            'industry_focus_alc',
            'target_audience_alc',
            'research_depth_alc',
            'quality_level_alc'
          ]
        }
      },
      {
        id: 'process_1',
        type: 'researchEngine',
        position: { x: 400, y: 150 },
        data: {
          label: 'Deep Research',
          description: 'Comprehensive industry research with data analysis',
          config: {
            researchDepth: 'expert',
            industryReports: true,
            academicSources: true,
            interviews: true,
            dataAnalysis: true
          }
        }
      },
      {
        id: 'process_2',
        type: 'contentWriter',
        position: { x: 400, y: 250 },
        data: {
          label: 'White Paper Writer',
          description: 'Generate authoritative white paper with citations',
          config: {
            style: 'academic_business',
            citations: true,
            executiveSummary: true,
            dataVisualization: true,
            recommendations: true
          }
        }
      },
      {
        id: 'process_3',
        type: 'qualityOptimizer',
        position: { x: 700, y: 200 },
        data: {
          label: 'Authority Optimizer',
          description: 'Optimize for credibility and thought leadership',
          config: {
            credibilityCheck: true,
            expertLanguage: true,
            factVerification: true,
            professionalTone: true
          }
        }
      },
      {
        id: 'preview_1',
        type: 'livePreview',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Professional Preview',
          description: 'Preview in professional document format',
          config: {
            professionalLayout: true,
            dataVisualization: true,
            tableOfContents: true,
            executiveView: true
          }
        }
      },
      {
        id: 'output_1',
        type: 'multiFormatExporter',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Authority Publication',
          description: 'Export in thought leadership formats',
          config: {
            formats: ['professional_pdf', 'interactive_web', 'executive_summary'],
            branding: true,
            shareableAssets: true
          }
        }
      }
    ],
    connections: [
      { source: 'input_1', target: 'process_1' },
      { source: 'input_1', target: 'process_2' },
      { source: 'process_1', target: 'process_3' },
      { source: 'process_2', target: 'process_3' },
      { source: 'process_3', target: 'preview_1' },
      { source: 'preview_1', target: 'output_1' }
    ]
  }
]

// Helper function to get flow by ID
export const getFlowById = (flowId) => {
  return alchemistPreBuiltFlows.find(flow => flow.id === flowId)
}

// Helper function to get flows by category
export const getFlowsByCategory = (category) => {
  return alchemistPreBuiltFlows.filter(flow => flow.category === category)
}

// Helper function to get flows by difficulty
export const getFlowsByDifficulty = (difficulty) => {
  return alchemistPreBuiltFlows.filter(flow => flow.difficulty === difficulty)
}

// Export categories for filtering
export const flowCategories = [
  'Content Creation',
  'Email Marketing', 
  'Sales & Marketing',
  'Social Media',
  'Public Relations',
  'Video Content',
  'E-commerce',
  'Business Content',
  'Advertising',
  'Thought Leadership'
]

// Export difficulty levels
export const difficultyLevels = ['Easy', 'Medium', 'Advanced', 'Expert']

export default alchemistPreBuiltFlows

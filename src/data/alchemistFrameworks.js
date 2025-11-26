/**
 * ALCHEMIST FRAMEWORKS SYSTEM
 * Distinctive, advanced frameworks for each service type
 * Each service gets its own specialized framework options
 */

export const getAlchemistFrameworks = () => {
  return {
    // === CONTENT CREATION FRAMEWORKS ===
    contentCreation: {
      blogPost: [
        {
          id: 'inverted_pyramid',
          name: 'Inverted Pyramid',
          description: 'Lead with the most important information, then provide supporting details',
          bestFor: 'News articles, breaking news, press releases',
          tooltip: 'Journalistic style that puts the most critical information first, perfect for news and updates'
        },
        {
          id: 'storytelling',
          name: 'Storytelling',
          description: 'Narrative structure with beginning, middle, and end',
          bestFor: 'Personal stories, case studies, brand stories',
          tooltip: 'Engaging narrative that takes readers on a journey, ideal for emotional connection'
        },
        {
          id: 'how_to_guide',
          name: 'How-To Guide',
          description: 'Step-by-step instructional format',
          bestFor: 'Tutorials, educational content, process explanations',
          tooltip: 'Clear, actionable steps that teach readers how to accomplish something'
        },
        {
          id: 'listicle',
          name: 'Listicle',
          description: 'Numbered or bulleted list format',
          bestFor: 'Tips, resources, comparisons, roundups',
          tooltip: 'Scannable format that makes content easy to digest and share'
        },
        {
          id: 'problem_solution',
          name: 'Problem-Solution',
          description: 'Identify a problem and provide solutions',
          bestFor: 'Industry insights, troubleshooting, advice columns',
          tooltip: 'Addresses reader pain points and positions you as the solution provider'
        },
        {
          id: 'compare_contrast',
          name: 'Compare & Contrast',
          description: 'Analyze similarities and differences between topics',
          bestFor: 'Product reviews, market analysis, feature comparisons',
          tooltip: 'Helps readers make informed decisions by weighing options'
        },
        {
          id: 'other',
          name: 'Other',
          description: 'Custom framework',
          bestFor: 'Unique content needs',
          tooltip: 'Define your own structure and approach'
        }
      ],

      videoScript: [
        {
          id: 'hook_story_payoff',
          name: 'Hook-Story-Payoff',
          description: 'Grab attention, tell a story, deliver value',
          bestFor: 'Educational videos, tutorials, brand stories',
          tooltip: 'Classic video structure that keeps viewers engaged from start to finish'
        },
        {
          id: 'problem_agitate_solve',
          name: 'Problem-Agitate-Solve',
          description: 'Identify problem, make it worse, provide solution',
          bestFor: 'Product demos, sales videos, educational content',
          tooltip: 'Creates urgency and positions your solution as the answer'
        },
        {
          id: 'before_after_bridge',
          name: 'Before-After-Bridge',
          description: 'Show current state, desired state, how to get there',
          bestFor: 'Transformation stories, product launches, motivational content',
          tooltip: 'Visual storytelling that shows clear transformation and path forward'
        },
        {
          id: 'tutorial_step_by_step',
          name: 'Tutorial Step-by-Step',
          description: 'Clear instructions with visual cues',
          bestFor: 'How-to videos, educational content, process explanations',
          tooltip: 'Systematic approach that teaches viewers exactly what to do'
        },
        {
          id: 'interview_format',
          name: 'Interview Format',
          description: 'Q&A structure with expert or customer',
          bestFor: 'Expert insights, customer testimonials, thought leadership',
          tooltip: 'Conversational format that feels authentic and builds trust'
        },
        {
          id: 'day_in_life',
          name: 'Day in the Life',
          description: 'Follow someone through their daily routine',
          bestFor: 'Behind-the-scenes, lifestyle content, brand storytelling',
          tooltip: 'Personal and relatable content that builds connection'
        },
        {
          id: 'other',
          name: 'Other',
          description: 'Custom video structure',
          bestFor: 'Unique video needs',
          tooltip: 'Define your own video format and approach'
        }
      ],

      caseStudy: [
        {
          id: 'star_method',
          name: 'STAR Method',
          description: 'Situation, Task, Action, Result',
          bestFor: 'Professional case studies, job interviews, project documentation',
          tooltip: 'Structured approach that clearly shows context, challenge, solution, and outcome'
        },
        {
          id: 'challenge_solution_outcome',
          name: 'Challenge-Solution-Outcome',
          description: 'Problem, approach, results',
          bestFor: 'Business case studies, client success stories',
          tooltip: 'Simple three-part structure that focuses on results and impact'
        },
        {
          id: 'before_during_after',
          name: 'Before-During-After',
          description: 'Initial state, process, final state',
          bestFor: 'Transformation stories, process improvements, change management',
          tooltip: 'Shows clear progression and transformation over time'
        },
        {
          id: 'testimonial_focused',
          name: 'Testimonial Focused',
          description: 'Client voice and perspective throughout',
          bestFor: 'Client success stories, customer testimonials, referral content',
          tooltip: 'Puts the client at the center and lets their voice tell the story'
        },
        {
          id: 'data_driven',
          name: 'Data-Driven',
          description: 'Metrics and analytics throughout',
          bestFor: 'ROI-focused case studies, performance improvements, measurable results',
          tooltip: 'Emphasizes quantifiable results and measurable impact'
        },
        {
          id: 'other',
          name: 'Other',
          description: 'Custom case study structure',
          bestFor: 'Unique case study needs',
          tooltip: 'Define your own case study format and approach'
        }
      ]
    },

    // === MARKETING FRAMEWORKS ===
    marketing: {
      emailMarketing: [
        {
          id: 'welcome_series',
          name: 'Welcome Series',
          description: 'Onboarding sequence for new subscribers',
          bestFor: 'New subscriber onboarding, brand introduction, relationship building',
          tooltip: 'Builds trust and introduces your brand to new subscribers over time'
        },
        {
          id: 'nurture_sequence',
          name: 'Nurture Sequence',
          description: 'Educational content that builds trust',
          bestFor: 'Lead nurturing, education-based marketing, thought leadership',
          tooltip: 'Focuses on providing value and building relationships before selling'
        },
        {
          id: 'product_launch',
          name: 'Product Launch',
          description: 'Announcement and promotion sequence',
          bestFor: 'New product launches, feature announcements, special offers',
          tooltip: 'Creates excitement and drives action for new products or services'
        },
        {
          id: 're_engagement',
          name: 'Re-engagement',
          description: 'Win back inactive subscribers',
          bestFor: 'Inactive subscriber campaigns, retention efforts, win-back campaigns',
          tooltip: 'Designed to re-engage subscribers who have become inactive'
        },
        {
          id: 'sales_sequence',
          name: 'Sales Sequence',
          description: 'Direct sales-focused emails',
          bestFor: 'Sales campaigns, promotional offers, conversion-focused marketing',
          tooltip: 'Direct approach focused on driving sales and conversions'
        },
        {
          id: 'other',
          name: 'Other',
          description: 'Custom email sequence',
          bestFor: 'Unique email marketing needs',
          tooltip: 'Define your own email sequence structure and approach'
        }
      ],

      socialMedia: [
        {
          id: 'content_pillar',
          name: 'Content Pillar',
          description: 'Balanced mix of content types',
          bestFor: 'Brand building, community engagement, long-term growth',
          tooltip: 'Strategic mix of educational, entertaining, and promotional content'
        },
        {
          id: 'trending_topics',
          name: 'Trending Topics',
          description: 'Capitalize on current trends and hashtags',
          bestFor: 'Viral content, increased reach, trend participation',
          tooltip: 'Leverages current trends and popular hashtags for maximum visibility'
        },
        {
          id: 'user_generated',
          name: 'User Generated Content',
          description: 'Feature customer content and testimonials',
          bestFor: 'Social proof, community building, authentic content',
          tooltip: 'Amplifies customer voices and builds community through shared content'
        },
        {
          id: 'educational_series',
          name: 'Educational Series',
          description: 'Teach your audience something valuable',
          bestFor: 'Thought leadership, expertise demonstration, value provision',
          tooltip: 'Positions you as an expert while providing genuine value to followers'
        },
        {
          id: 'behind_scenes',
          name: 'Behind the Scenes',
          description: 'Show the human side of your brand',
          bestFor: 'Brand personality, team building, authenticity',
          tooltip: 'Humanizes your brand and builds personal connections with your audience'
        },
        {
          id: 'other',
          name: 'Other',
          description: 'Custom social media strategy',
          bestFor: 'Unique social media needs',
          tooltip: 'Define your own social media content strategy and approach'
        }
      ],

      adCopy: [
        {
          id: 'aida',
          name: 'AIDA',
          description: 'Attention, Interest, Desire, Action',
          bestFor: 'General advertising, product promotion, sales campaigns',
          tooltip: 'Classic advertising framework that guides prospects through the buying journey'
        },
        {
          id: 'pain_agitate_solve',
          name: 'Pain-Agitate-Solve',
          description: 'Identify pain, make it worse, offer solution',
          bestFor: 'Problem-solving products, service-based businesses, pain point targeting',
          tooltip: 'Creates urgency by amplifying existing pain points and positioning your solution'
        },
        {
          id: 'benefit_feature_advantage',
          name: 'Benefit-Feature-Advantage',
          description: 'Lead with benefits, support with features',
          bestFor: 'Product advertising, feature-heavy products, technical products',
          tooltip: 'Focuses on customer benefits while supporting claims with specific features'
        },
        {
          id: 'social_proof_heavy',
          name: 'Social Proof Heavy',
          description: 'Emphasize testimonials and reviews',
          bestFor: 'New products, trust-building, credibility establishment',
          tooltip: 'Builds trust and credibility through customer testimonials and social proof'
        },
        {
          id: 'urgency_scarcity',
          name: 'Urgency & Scarcity',
          description: 'Create time-sensitive offers',
          bestFor: 'Limited-time offers, flash sales, exclusive deals',
          tooltip: 'Creates immediate action through time-sensitive offers and limited availability'
        },
        {
          id: 'other',
          name: 'Other',
          description: 'Custom ad copy framework',
          bestFor: 'Unique advertising needs',
          tooltip: 'Define your own advertising approach and structure'
        }
      ]
    },

    // === SALES FRAMEWORKS ===
    sales: {
      salesPage: [
        {
          id: 'aida',
          name: 'AIDA',
          description: 'Attention, Interest, Desire, Action',
          bestFor: 'General sales pages, product promotion, conversion optimization',
          tooltip: 'Classic sales framework that guides visitors through the buying process'
        },
        {
          id: 'pastor',
          name: 'PASTOR',
          description: 'Problem, Amplify, Story, Transformation, Offer, Response',
          bestFor: 'High-value products, coaching services, transformation-based offers',
          tooltip: 'Comprehensive framework that builds emotional connection and drives action'
        },
        {
          id: 'four_p',
          name: '4P Framework',
          description: 'Picture, Promise, Proof, Push',
          bestFor: 'Visual products, lifestyle offers, aspirational purchases',
          tooltip: 'Creates vivid mental pictures and provides proof to support claims'
        },
        {
          id: 'pas',
          name: 'PAS',
          description: 'Problem, Agitate, Solution',
          bestFor: 'Problem-solving products, pain point targeting, solution-focused offers',
          tooltip: 'Simple three-step process that amplifies problems and positions your solution'
        },
        {
          id: 'bab',
          name: 'BAB',
          description: 'Before, After, Bridge',
          bestFor: 'Transformation products, coaching services, lifestyle changes',
          tooltip: 'Shows clear transformation and provides the path to get there'
        },
        {
          id: 'quest',
          name: 'QUEST',
          description: 'Qualify, Understand, Educate, Stimulate, Transition',
          bestFor: 'Complex products, B2B sales, high-consideration purchases',
          tooltip: 'Systematic approach for complex sales that require education and trust-building'
        },
        {
          id: 'acca',
          name: 'ACCA',
          description: 'Awareness, Comprehension, Conviction, Action',
          bestFor: 'New products, market education, awareness-building campaigns',
          tooltip: 'Focuses on building understanding and conviction before asking for action'
        },
        {
          id: 'idca',
          name: 'IDCA',
          description: 'Interest, Desire, Conviction, Action',
          bestFor: 'Established products, repeat customers, known market needs',
          tooltip: 'Assumes awareness and focuses on building desire and conviction'
        },
        {
          id: 'aidca',
          name: 'AIDCA',
          description: 'Attention, Interest, Desire, Conviction, Action',
          bestFor: 'High-value products, complex sales, trust-building required',
          tooltip: 'Comprehensive framework that includes conviction-building for complex purchases'
        },
        {
          id: 'other',
          name: 'Other',
          description: 'Custom sales framework',
          bestFor: 'Unique sales page needs',
          tooltip: 'Define your own sales page structure and approach'
        }
      ],

      landingPage: [
        {
          id: 'value_proposition',
          name: 'Value Proposition',
          description: 'Lead with clear value and benefit',
          bestFor: 'Lead generation, email signups, free offers',
          tooltip: 'Focuses on the core value proposition and what visitors will gain'
        },
        {
          id: 'social_proof',
          name: 'Social Proof',
          description: 'Emphasize testimonials and credibility',
          bestFor: 'New brands, trust-building, credibility establishment',
          tooltip: 'Builds trust and credibility through customer testimonials and social proof'
        },
        {
          id: 'urgency_scarcity',
          name: 'Urgency & Scarcity',
          description: 'Create time-sensitive offers',
          bestFor: 'Limited-time offers, exclusive deals, flash sales',
          tooltip: 'Creates immediate action through time-sensitive offers and limited availability'
        },
        {
          id: 'problem_solution',
          name: 'Problem-Solution',
          description: 'Identify problem and position as solution',
          bestFor: 'Problem-solving products, service-based businesses, pain point targeting',
          tooltip: 'Addresses specific problems and positions your offer as the solution'
        },
        {
          id: 'benefit_focused',
          name: 'Benefit-Focused',
          description: 'Lead with customer benefits',
          bestFor: 'Feature-heavy products, technical products, complex offers',
          tooltip: 'Focuses on customer benefits rather than product features'
        },
        {
          id: 'other',
          name: 'Other',
          description: 'Custom landing page framework',
          bestFor: 'Unique landing page needs',
          tooltip: 'Define your own landing page structure and approach'
        }
      ],

      productDescription: [
        {
          id: 'benefit_feature',
          name: 'Benefit-Feature',
          description: 'Lead with benefits, support with features',
          bestFor: 'Feature-heavy products, technical products, complex products',
          tooltip: 'Focuses on customer benefits while supporting claims with specific features'
        },
        {
          id: 'storytelling',
          name: 'Storytelling',
          description: 'Narrative approach to product description',
          bestFor: 'Lifestyle products, aspirational purchases, emotional products',
          tooltip: 'Creates emotional connection through storytelling and narrative'
        },
        {
          id: 'comparison',
          name: 'Comparison',
          description: 'Compare against competitors or alternatives',
          bestFor: 'Competitive products, market differentiation, value positioning',
          tooltip: 'Helps customers understand why your product is the best choice'
        },
        {
          id: 'social_proof',
          name: 'Social Proof',
          description: 'Emphasize reviews and testimonials',
          bestFor: 'New products, trust-building, credibility establishment',
          tooltip: 'Builds trust and credibility through customer reviews and testimonials'
        },
        {
          id: 'technical_specs',
          name: 'Technical Specs',
          description: 'Detailed technical information',
          bestFor: 'Technical products, B2B products, specification-heavy items',
          tooltip: 'Provides detailed technical information for informed decision-making'
        },
        {
          id: 'other',
          name: 'Other',
          description: 'Custom product description framework',
          bestFor: 'Unique product description needs',
          tooltip: 'Define your own product description structure and approach'
        }
      ]
    },

    // === PR & COMMUNICATIONS FRAMEWORKS ===
    pr: {
      pressRelease: [
        {
          id: 'inverted_pyramid',
          name: 'Inverted Pyramid',
          description: 'Most important information first',
          bestFor: 'Breaking news, announcements, time-sensitive news',
          tooltip: 'Journalistic style that puts the most critical information first'
        },
        {
          id: 'feature_story',
          name: 'Feature Story',
          description: 'In-depth, narrative approach',
          bestFor: 'Company profiles, human interest stories, in-depth coverage',
          tooltip: 'Comprehensive storytelling approach for detailed coverage'
        },
        {
          id: 'announcement',
          name: 'Announcement',
          description: 'Direct announcement format',
          bestFor: 'Product launches, company news, official announcements',
          tooltip: 'Clear, direct format for official company announcements'
        },
        {
          id: 'crisis_communication',
          name: 'Crisis Communication',
          description: 'Addressing issues and concerns',
          bestFor: 'Crisis management, issue resolution, damage control',
          tooltip: 'Structured approach for addressing and resolving company issues'
        },
        {
          id: 'other',
          name: 'Other',
          description: 'Custom press release framework',
          bestFor: 'Unique press release needs',
          tooltip: 'Define your own press release structure and approach'
        }
      ]
    }
  }
}

/**
 * Get frameworks for a specific service
 * @param {string} serviceId - Service identifier
 * @returns {Array} Array of frameworks for the service
 */
export const getServiceFrameworks = (serviceId) => {
  const allFrameworks = getAlchemistFrameworks()
  
  // Map service IDs to their framework categories
  const serviceMap = {
    'blog-post-generator': allFrameworks.contentCreation.blogPost,
    'video-script-generator': allFrameworks.contentCreation.videoScript,
    'case-study-generator': allFrameworks.contentCreation.caseStudy,
    'email-sequence-generator': allFrameworks.marketing.emailMarketing,
    'social-media-generator': allFrameworks.marketing.socialMedia,
    'ad-copy-generator': allFrameworks.marketing.adCopy,
    'sales-copy-generator': allFrameworks.sales.salesPage,
    'landing-page-generator': allFrameworks.sales.landingPage,
    'product-description-generator': allFrameworks.sales.productDescription,
    'press-release-generator': allFrameworks.pr.pressRelease
  }

  return serviceMap[serviceId] || []
}

export default {
  getAlchemistFrameworks,
  getServiceFrameworks
}

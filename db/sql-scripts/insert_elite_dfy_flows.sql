-- INSERT PROFESSIONAL DFY WORKFLOW FLOWS INTO ai_flows TABLE
-- Professional-grade, sellable workflows for $18M project

-- 1. BUSINESS STRATEGY MASTERY FLOW
INSERT INTO ai_flows (
  name, 
  description,
  type,
  steps,
  configurations,
  created_by
) VALUES (
  'Business Strategy Mastery Guide',
  'Complete business strategy guide with market intelligence, competitive analysis, and actionable frameworks',
  'full',
  ARRAY['input', 'research', 'analysis', 'verification', 'content', 'quality', 'output'],
  '{"nodes": [
    {
      "id": "input-business-strategy",
      "type": "input",
      "position": {"x": 100, "y": 100},
      "data": {
        "label": "Business Strategy Requirements",
        "description": "Collect comprehensive business strategy specifications",
        "nodeTemplate": "business_input"
      }
    },
    {
      "id": "research-market-intelligence", 
      "type": "process",
      "position": {"x": 300, "y": 100},
      "data": {
        "label": "Market Intelligence Research",
        "description": "Comprehensive market research and competitive intelligence gathering",
        "nodeTemplate": "researcher"
      }
    },
    {
      "id": "analyze-market-dynamics",
      "type": "process", 
      "position": {"x": 500, "y": 100},
      "data": {
        "label": "Market Dynamics Analysis",
        "description": "Strategic market analysis and competitive positioning",
        "nodeTemplate": "market_analyst"
      }
    },
    {
      "id": "verify-business-data",
      "type": "process",
      "position": {"x": 700, "y": 100},
      "data": {
        "label": "Business Data Verification", 
        "description": "Fact-check all business claims and market data",
        "nodeTemplate": "fact_checker"
      }
    },
    {
      "id": "create-strategy-content",
      "type": "process",
      "position": {"x": 900, "y": 100},
      "data": {
        "label": "Strategy Content Creation",
        "description": "Write comprehensive business strategy guide using all research",
        "nodeTemplate": "content_writer"
      }
    },
    {
      "id": "quality-gate-business",
      "type": "condition",
      "position": {"x": 1100, "y": 100},
      "data": {
        "label": "Business Content Quality Gate",
        "description": "Evaluate content quality and decide on next steps",
        "nodeTemplate": "quality_gate"
      }
    },
    {
      "id": "final-business-output",
      "type": "output",
      "position": {"x": 1300, "y": 100},
      "data": {
        "label": "Business Strategy Deliverables",
        "description": "Generate final business strategy guide in all formats",
        "nodeTemplate": "multi_format_output"
      }
    }
  ], "edges": [{"id": "e1-2", "source": "input-business-strategy", "target": "research-market-intelligence"}, {"id": "e2-3", "source": "research-market-intelligence", "target": "analyze-market-dynamics"}, {"id": "e3-4", "source": "analyze-market-dynamics", "target": "verify-business-data"}, {"id": "e4-5", "source": "verify-business-data", "target": "create-strategy-content"}, {"id": "e5-6", "source": "create-strategy-content", "target": "quality-gate-business"}, {"id": "e6-7", "source": "quality-gate-business", "target": "final-business-output"}]}'::jsonb,
  '5950cad6-810b-4c5b-9d40-4485ea249770' -- SuperAdmin UUID
);

-- 2. EPIC FANTASY NOVEL FLOW
INSERT INTO ai_flows (
  name,
  description,
  type,
  steps,
  configurations,
  created_by
) VALUES (
  'Epic Fantasy Novel Creation',
  'Complete fantasy novel with world-building, character development, and compelling plot architecture',
  'full',
  ARRAY['input', 'world_building', 'character_dev', 'plot', 'content', 'preview', 'output'],
  '{"nodes": [
    {
      "id": "input-fantasy-story",
      "type": "input",
      "position": {"x": 100, "y": 100},
      "data": {
        "label": "Fantasy Story Requirements",
        "description": "Collect fantasy genre specifications, world concepts, and story elements",
        "nodeTemplate": "story_input"
      }
    },
    {
      "id": "build-fantasy-world",
      "type": "process",
      "position": {"x": 300, "y": 50},
      "data": {
        "label": "Fantasy World Architecture",
        "description": "Create comprehensive fantasy world with magic systems and cultures",
        "nodeTemplate": "world_builder"
      }
    },
    {
      "id": "develop-fantasy-characters",
      "type": "process",
      "position": {"x": 300, "y": 150},
      "data": {
        "label": "Fantasy Character Development",
        "description": "Develop complex characters with backstories and motivations",
        "nodeTemplate": "character_developer"
      }
    },
    {
      "id": "architect-fantasy-plot",
      "type": "process",
      "position": {"x": 500, "y": 100},
      "data": {
        "label": "Fantasy Plot Architecture",
        "description": "Design compelling plot structure with epic story elements",
        "nodeTemplate": "plot_architect"
      }
    },
    {
      "id": "write-fantasy-content",
      "type": "process",
      "position": {"x": 700, "y": 100},
      "data": {
        "label": "Fantasy Content Creation",
        "description": "Write complete fantasy novel using world, characters, and plot",
        "nodeTemplate": "content_writer"
      }
    },
    {
      "id": "preview-fantasy-chapters",
      "type": "preview",
      "position": {"x": 900, "y": 100},
      "data": {
        "label": "Fantasy Chapter Preview",
        "description": "Preview fantasy chapters for engagement and flow",
        "nodeTemplate": "chapter_preview"
      }
    },
    {
      "id": "final-fantasy-output",
      "type": "output",
      "position": {"x": 1100, "y": 100},
      "data": {
        "label": "Fantasy Novel Deliverables",
        "description": "Generate final fantasy novel in all requested formats",
        "nodeTemplate": "output_processor"
      }
    }
  ], "edges": [{"id": "e1-2", "source": "input-fantasy-story", "target": "build-fantasy-world"}, {"id": "e1-3", "source": "input-fantasy-story", "target": "develop-fantasy-characters"}, {"id": "e2-4", "source": "build-fantasy-world", "target": "architect-fantasy-plot"}, {"id": "e3-4", "source": "develop-fantasy-characters", "target": "architect-fantasy-plot"}, {"id": "e4-5", "source": "architect-fantasy-plot", "target": "write-fantasy-content"}, {"id": "e5-6", "source": "write-fantasy-content", "target": "preview-fantasy-chapters"}, {"id": "e6-7", "source": "preview-fantasy-chapters", "target": "final-fantasy-output"}]}'::jsonb,
  '5950cad6-810b-4c5b-9d40-4485ea249770' -- SuperAdmin UUID
);

-- 3. SELF-HELP TRANSFORMATION FLOW
INSERT INTO ai_flows (
  name,
  description,
  type,
  steps,
  configurations,
  created_by
) VALUES (
  'Self-Help Transformation Guide',
  'Comprehensive personal development guide with psychological frameworks and actionable strategies',
  'full',
  ARRAY['input', 'research', 'verification', 'content', 'routing', 'preview', 'output'],
  '{"nodes": [
    {
      "id": "input-transformation-goals",
      "type": "input",
      "position": {"x": 100, "y": 100},
      "data": {
        "label": "Transformation Requirements",
        "description": "Collect personal development goals and transformation objectives",
        "nodeTemplate": "universal_input"
      }
    },
    {
      "id": "research-psychology-frameworks",
      "type": "process",
      "position": {"x": 300, "y": 100},
      "data": {
        "label": "Psychology Research Foundation",
        "description": "Research psychological principles and transformation methodologies",
        "nodeTemplate": "researcher"
      }
    },
    {
      "id": "verify-psychological-claims",
      "type": "process",
      "position": {"x": 500, "y": 100},
      "data": {
        "label": "Psychology Claims Verification",
        "description": "Verify all psychological concepts and transformation strategies",
        "nodeTemplate": "fact_checker"
      }
    },
    {
      "id": "create-transformation-content",
      "type": "process",
      "position": {"x": 700, "y": 100},
      "data": {
        "label": "Transformation Content Creation",
        "description": "Write actionable self-help guide with practical frameworks",
        "nodeTemplate": "content_writer"
      }
    },
    {
      "id": "route-content-preferences",
      "type": "condition",
      "position": {"x": 900, "y": 100},
      "data": {
        "label": "Content Preference Routing",
        "description": "Route based on user preferences for additional features",
        "nodeTemplate": "user_preference_router"
      }
    },
    {
      "id": "preview-transformation-content",
      "type": "preview",
      "position": {"x": 1100, "y": 100},
      "data": {
        "label": "Transformation Content Preview",
        "description": "Preview self-help content for effectiveness and clarity",
        "nodeTemplate": "content_preview"
      }
    },
    {
      "id": "final-transformation-output",
      "type": "output",
      "position": {"x": 1300, "y": 100},
      "data": {
        "label": "Transformation Guide Deliverables",
        "description": "Generate final self-help guide with all enhancements",
        "nodeTemplate": "multi_format_output"
      }
    }
  ], "edges": [{"id": "e1-2", "source": "input-transformation-goals", "target": "research-psychology-frameworks"}, {"id": "e2-3", "source": "research-psychology-frameworks", "target": "verify-psychological-claims"}, {"id": "e3-4", "source": "verify-psychological-claims", "target": "create-transformation-content"}, {"id": "e4-5", "source": "create-transformation-content", "target": "route-content-preferences"}, {"id": "e5-6", "source": "route-content-preferences", "target": "preview-transformation-content"}, {"id": "e6-7", "source": "preview-transformation-content", "target": "final-transformation-output"}]}'::jsonb,
  '5950cad6-810b-4c5b-9d40-4485ea249770' -- SuperAdmin UUID
);

-- 4. TECHNICAL PROGRAMMING GUIDE FLOW
INSERT INTO ai_flows (name, description, type, steps, configurations, created_by) VALUES (
  'Technical Programming Mastery',
  'Comprehensive programming guide with hands-on examples, best practices, and real-world applications',
  'full',
  ARRAY['input', 'research', 'verification', 'technical_writing', 'preview', 'output'],
  '{"nodes": [{"id": "input-technical-requirements", "type": "input", "position": {"x": 100, "y": 100}, "data": {"label": "Technical Guide Requirements", "description": "Collect programming language, skill level, and project specifications", "nodeTemplate": "business_input"}}, {"id": "research-technical-foundations", "type": "process", "position": {"x": 300, "y": 100}, "data": {"label": "Technical Research Foundation", "description": "Research latest programming practices, frameworks, and industry standards", "nodeTemplate": "researcher"}}, {"id": "verify-technical-accuracy", "type": "process", "position": {"x": 500, "y": 100}, "data": {"label": "Technical Accuracy Verification", "description": "Verify all code examples, technical concepts, and best practices", "nodeTemplate": "fact_checker"}}, {"id": "create-technical-content", "type": "process", "position": {"x": 700, "y": 100}, "data": {"label": "Technical Content Creation", "description": "Write comprehensive programming guide with code examples and projects", "nodeTemplate": "technical_writer"}}, {"id": "preview-technical-chapters", "type": "preview", "position": {"x": 900, "y": 100}, "data": {"label": "Technical Chapter Preview", "description": "Preview technical chapters for accuracy and clarity", "nodeTemplate": "chapter_preview"}}, {"id": "final-technical-output", "type": "output", "position": {"x": 1100, "y": 100}, "data": {"label": "Technical Guide Deliverables", "description": "Generate final technical guide with code examples and resources", "nodeTemplate": "output_processor"}}], "edges": [{"id": "e1-2", "source": "input-technical-requirements", "target": "research-technical-foundations"}, {"id": "e2-3", "source": "research-technical-foundations", "target": "verify-technical-accuracy"}, {"id": "e3-4", "source": "verify-technical-accuracy", "target": "create-technical-content"}, {"id": "e4-5", "source": "create-technical-content", "target": "preview-technical-chapters"}, {"id": "e5-6", "source": "preview-technical-chapters", "target": "final-technical-output"}]}'::jsonb,
  '5950cad6-810b-4c5b-9d40-4485ea249770'
);

-- 5. ROMANCE BESTSELLER FLOW
INSERT INTO ai_flows (name, description, type, steps, configurations, created_by) VALUES (
  'Romance Bestseller Creation',
  'Compelling romance novel with character chemistry, emotional depth, and engaging relationship dynamics',
  'full',
  ARRAY['input', 'character_dev', 'world_building', 'plot', 'content', 'preview', 'output'],
  '{"nodes": [{"id": "input-romance-story", "type": "input", "position": {"x": 100, "y": 100}, "data": {"label": "Romance Story Requirements", "description": "Collect romance genre specifications and relationship dynamics", "nodeTemplate": "story_input"}}, {"id": "develop-romance-characters", "type": "process", "position": {"x": 300, "y": 50}, "data": {"label": "Romance Character Development", "description": "Create compelling romantic leads with chemistry and depth", "nodeTemplate": "character_developer"}}, {"id": "build-romance-world", "type": "process", "position": {"x": 300, "y": 150}, "data": {"label": "Romance Setting Creation", "description": "Build romantic settings and atmospheric environments", "nodeTemplate": "world_builder"}}, {"id": "architect-romance-plot", "type": "process", "position": {"x": 500, "y": 100}, "data": {"label": "Romance Plot Architecture", "description": "Design romantic plot with tension, conflict, and resolution", "nodeTemplate": "plot_architect"}}, {"id": "write-romance-content", "type": "process", "position": {"x": 700, "y": 100}, "data": {"label": "Romance Content Creation", "description": "Write engaging romance novel with emotional depth", "nodeTemplate": "content_writer"}}, {"id": "preview-romance-chapters", "type": "preview", "position": {"x": 900, "y": 100}, "data": {"label": "Romance Chapter Preview", "description": "Preview romance chapters for emotional impact and engagement", "nodeTemplate": "chapter_preview"}}, {"id": "final-romance-output", "type": "output", "position": {"x": 1100, "y": 100}, "data": {"label": "Romance Novel Deliverables", "description": "Generate final romance novel in all formats", "nodeTemplate": "output_processor"}}], "edges": [{"id": "e1-2", "source": "input-romance-story", "target": "develop-romance-characters"}, {"id": "e1-3", "source": "input-romance-story", "target": "build-romance-world"}, {"id": "e2-4", "source": "develop-romance-characters", "target": "architect-romance-plot"}, {"id": "e3-4", "source": "build-romance-world", "target": "architect-romance-plot"}, {"id": "e4-5", "source": "architect-romance-plot", "target": "write-romance-content"}, {"id": "e5-6", "source": "write-romance-content", "target": "preview-romance-chapters"}, {"id": "e6-7", "source": "preview-romance-chapters", "target": "final-romance-output"}]}'::jsonb,
  '5950cad6-810b-4c5b-9d40-4485ea249770'
);

-- 6. THRILLER MYSTERY FLOW
INSERT INTO ai_flows (name, description, type, steps, configurations, created_by) VALUES (
  'Thriller Mystery Creation',
  'Suspenseful thriller with plot twists, psychological depth, and gripping narrative tension',
  'full',
  ARRAY['input', 'character_psychology', 'plot_engineering', 'content', 'quality_gate', 'output'],
  '{"nodes": [{"id": "input-thriller-concept", "type": "input", "position": {"x": 100, "y": 100}, "data": {"label": "Thriller Concept Requirements", "description": "Collect thriller elements, mystery components, and suspense specifications", "nodeTemplate": "story_input"}}, {"id": "develop-thriller-characters", "type": "process", "position": {"x": 300, "y": 100}, "data": {"label": "Thriller Character Psychology", "description": "Create complex characters with psychological depth and hidden motives", "nodeTemplate": "character_developer"}}, {"id": "architect-thriller-plot", "type": "process", "position": {"x": 500, "y": 100}, "data": {"label": "Thriller Plot Engineering", "description": "Design intricate plot with twists, red herrings, and suspense building", "nodeTemplate": "plot_architect"}}, {"id": "write-thriller-content", "type": "process", "position": {"x": 700, "y": 100}, "data": {"label": "Thriller Content Creation", "description": "Write gripping thriller with psychological tension and plot twists", "nodeTemplate": "content_writer"}}, {"id": "quality-gate-thriller", "type": "condition", "position": {"x": 900, "y": 100}, "data": {"label": "Thriller Quality Evaluation", "description": "Evaluate suspense, pacing, and narrative tension", "nodeTemplate": "quality_gate"}}, {"id": "final-thriller-output", "type": "output", "position": {"x": 1100, "y": 100}, "data": {"label": "Thriller Novel Deliverables", "description": "Generate final thriller novel with optimal formatting", "nodeTemplate": "output_processor"}}], "edges": [{"id": "e1-2", "source": "input-thriller-concept", "target": "develop-thriller-characters"}, {"id": "e2-3", "source": "develop-thriller-characters", "target": "architect-thriller-plot"}, {"id": "e3-4", "source": "architect-thriller-plot", "target": "write-thriller-content"}, {"id": "e4-5", "source": "write-thriller-content", "target": "quality-gate-thriller"}, {"id": "e5-6", "source": "quality-gate-thriller", "target": "final-thriller-output"}]}'::jsonb,
  '5950cad6-810b-4c5b-9d40-4485ea249770'
);

-- 7. HEALTH WELLNESS GUIDE FLOW
INSERT INTO ai_flows (name, description, type, steps, configurations, created_by) VALUES (
  'Health & Wellness Mastery',
  'Evidence-based health guide with medical research, practical advice, and lifestyle integration',
  'full',
  ARRAY['input', 'medical_research', 'verification', 'content', 'preview', 'output'],
  '{"nodes": [{"id": "input-health-requirements", "type": "input", "position": {"x": 100, "y": 100}, "data": {"label": "Health Guide Requirements", "description": "Collect health focus areas and wellness objectives", "nodeTemplate": "universal_input"}}, {"id": "research-medical-evidence", "type": "process", "position": {"x": 300, "y": 100}, "data": {"label": "Medical Research Foundation", "description": "Research evidence-based health practices and medical studies", "nodeTemplate": "researcher"}}, {"id": "verify-health-claims", "type": "process", "position": {"x": 500, "y": 100}, "data": {"label": "Health Claims Verification", "description": "Verify all medical claims and health recommendations", "nodeTemplate": "fact_checker"}}, {"id": "create-wellness-content", "type": "process", "position": {"x": 700, "y": 100}, "data": {"label": "Wellness Content Creation", "description": "Write comprehensive health guide with practical strategies", "nodeTemplate": "content_writer"}}, {"id": "preview-health-sections", "type": "preview", "position": {"x": 900, "y": 100}, "data": {"label": "Health Content Preview", "description": "Preview health content for accuracy and practicality", "nodeTemplate": "content_preview"}}, {"id": "final-wellness-output", "type": "output", "position": {"x": 1100, "y": 100}, "data": {"label": "Wellness Guide Deliverables", "description": "Generate final health guide with all formats", "nodeTemplate": "multi_format_output"}}], "edges": [{"id": "e1-2", "source": "input-health-requirements", "target": "research-medical-evidence"}, {"id": "e2-3", "source": "research-medical-evidence", "target": "verify-health-claims"}, {"id": "e3-4", "source": "verify-health-claims", "target": "create-wellness-content"}, {"id": "e4-5", "source": "create-wellness-content", "target": "preview-health-sections"}, {"id": "e5-6", "source": "preview-health-sections", "target": "final-wellness-output"}]}'::jsonb,
  '5950cad6-810b-4c5b-9d40-4485ea249770'
);

-- 8. FINANCIAL INVESTMENT GUIDE FLOW
INSERT INTO ai_flows (name, description, type, steps, configurations, created_by) VALUES (
  'Financial Investment Mastery',
  'Comprehensive investment guide with market analysis, strategy frameworks, and risk management',
  'full',
  ARRAY['input', 'financial_research', 'market_analysis', 'verification', 'content', 'output'],
  '{"nodes": [{"id": "input-investment-objectives", "type": "input", "position": {"x": 100, "y": 100}, "data": {"label": "Investment Strategy Requirements", "description": "Collect investment goals, risk tolerance, and financial objectives", "nodeTemplate": "business_input"}}, {"id": "research-financial-markets", "type": "process", "position": {"x": 300, "y": 100}, "data": {"label": "Financial Market Research", "description": "Research current market conditions and investment opportunities", "nodeTemplate": "researcher"}}, {"id": "analyze-market-trends", "type": "process", "position": {"x": 500, "y": 100}, "data": {"label": "Market Trend Analysis", "description": "Analyze market trends and investment landscape", "nodeTemplate": "market_analyst"}}, {"id": "verify-financial-data", "type": "process", "position": {"x": 700, "y": 100}, "data": {"label": "Financial Data Verification", "description": "Verify all financial data and investment strategies", "nodeTemplate": "fact_checker"}}, {"id": "create-investment-content", "type": "process", "position": {"x": 900, "y": 100}, "data": {"label": "Investment Content Creation", "description": "Write comprehensive investment guide with proven strategies", "nodeTemplate": "content_writer"}}, {"id": "final-investment-output", "type": "output", "position": {"x": 1100, "y": 100}, "data": {"label": "Investment Guide Deliverables", "description": "Generate final investment guide with professional formatting", "nodeTemplate": "output_processor"}}], "edges": [{"id": "e1-2", "source": "input-investment-objectives", "target": "research-financial-markets"}, {"id": "e2-3", "source": "research-financial-markets", "target": "analyze-market-trends"}, {"id": "e3-4", "source": "analyze-market-trends", "target": "verify-financial-data"}, {"id": "e4-5", "source": "verify-financial-data", "target": "create-investment-content"}, {"id": "e5-6", "source": "create-investment-content", "target": "final-investment-output"}]}'::jsonb,
  '5950cad6-810b-4c5b-9d40-4485ea249770'
);

-- 9. CREATIVE WRITING MASTERCLASS FLOW
INSERT INTO ai_flows (name, description, type, steps, configurations, created_by) VALUES (
  'Creative Writing Masterclass',
  'Comprehensive writing course with technique analysis, practical exercises, and skill development',
  'full',
  ARRAY['input', 'research', 'content', 'routing', 'preview', 'output'],
  '{"nodes": [{"id": "input-writing-objectives", "type": "input", "position": {"x": 100, "y": 100}, "data": {"label": "Writing Course Requirements", "description": "Collect writing goals, skill level, and learning objectives", "nodeTemplate": "universal_input"}}, {"id": "research-writing-techniques", "type": "process", "position": {"x": 300, "y": 100}, "data": {"label": "Writing Technique Research", "description": "Research proven writing techniques and methodologies", "nodeTemplate": "researcher"}}, {"id": "create-masterclass-content", "type": "process", "position": {"x": 500, "y": 100}, "data": {"label": "Masterclass Content Creation", "description": "Create comprehensive writing course with exercises and examples", "nodeTemplate": "content_writer"}}, {"id": "route-learning-preferences", "type": "condition", "position": {"x": 700, "y": 100}, "data": {"label": "Learning Style Routing", "description": "Route based on learning preferences and content type", "nodeTemplate": "content_type_router"}}, {"id": "preview-masterclass-content", "type": "preview", "position": {"x": 900, "y": 100}, "data": {"label": "Masterclass Content Preview", "description": "Preview writing course content for effectiveness", "nodeTemplate": "content_preview"}}, {"id": "final-masterclass-output", "type": "output", "position": {"x": 1100, "y": 100}, "data": {"label": "Writing Masterclass Deliverables", "description": "Generate final writing course with all materials", "nodeTemplate": "multi_format_output"}}], "edges": [{"id": "e1-2", "source": "input-writing-objectives", "target": "research-writing-techniques"}, {"id": "e2-3", "source": "research-writing-techniques", "target": "create-masterclass-content"}, {"id": "e3-4", "source": "create-masterclass-content", "target": "route-learning-preferences"}, {"id": "e4-5", "source": "route-learning-preferences", "target": "preview-masterclass-content"}, {"id": "e5-6", "source": "preview-masterclass-content", "target": "final-masterclass-output"}]}'::jsonb,
  '5950cad6-810b-4c5b-9d40-4485ea249770'
);

-- 10. BIOGRAPHY MEMOIR FLOW
INSERT INTO ai_flows (name, description, type, steps, configurations, created_by) VALUES (
  'Biography Memoir Creation',
  'Compelling life story with research validation, narrative structure, and emotional storytelling',
  'full',
  ARRAY['input', 'research', 'verification', 'plot_structure', 'content', 'final_preview', 'output'],
  '{"nodes": [{"id": "input-biography-details", "type": "input", "position": {"x": 100, "y": 100}, "data": {"label": "Biography Requirements", "description": "Collect life story details, timeline, and narrative objectives", "nodeTemplate": "universal_input"}}, {"id": "research-biographical-facts", "type": "process", "position": {"x": 300, "y": 100}, "data": {"label": "Biographical Research", "description": "Research historical context and verify life events", "nodeTemplate": "researcher"}}, {"id": "verify-biographical-accuracy", "type": "process", "position": {"x": 500, "y": 100}, "data": {"label": "Biographical Fact Verification", "description": "Verify all biographical claims and historical accuracy", "nodeTemplate": "fact_checker"}}, {"id": "architect-life-narrative", "type": "process", "position": {"x": 700, "y": 100}, "data": {"label": "Life Narrative Structure", "description": "Structure life story with compelling narrative arc", "nodeTemplate": "plot_architect"}}, {"id": "write-biography-content", "type": "process", "position": {"x": 900, "y": 100}, "data": {"label": "Biography Content Creation", "description": "Write engaging biography with emotional depth and accuracy", "nodeTemplate": "content_writer"}}, {"id": "preview-biography-final", "type": "preview", "position": {"x": 1100, "y": 100}, "data": {"label": "Biography Final Preview", "description": "Final preview of complete biography for approval", "nodeTemplate": "final_preview"}}, {"id": "final-biography-output", "type": "output", "position": {"x": 1300, "y": 100}, "data": {"label": "Biography Deliverables", "description": "Generate final biography in all requested formats", "nodeTemplate": "output_processor"}}], "edges": [{"id": "e1-2", "source": "input-biography-details", "target": "research-biographical-facts"}, {"id": "e2-3", "source": "research-biographical-facts", "target": "verify-biographical-accuracy"}, {"id": "e3-4", "source": "verify-biographical-accuracy", "target": "architect-life-narrative"}, {"id": "e4-5", "source": "architect-life-narrative", "target": "write-biography-content"}, {"id": "e5-6", "source": "write-biography-content", "target": "preview-biography-final"}, {"id": "e6-7", "source": "preview-biography-final", "target": "final-biography-output"}]}'::jsonb,
  '5950cad6-810b-4c5b-9d40-4485ea249770'
);

SELECT 'ALL 10 Professional DFY flows inserted successfully - run this script to add flows to ai_flows table' as status;

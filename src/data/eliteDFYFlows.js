// ELITE DFY FLOWS - SUPER PREMIUM SERIES
// Using ONLY nodes from nodePalettes.js - Complete, Dynamic, Ready to Deploy
// Mind-blowing content generation with professional formatting and premium features

import { NODE_PALETTES } from './nodePalettes.js'

export const ELITE_DFY_FLOWS = {
  // FICTION FLOWS - Super Premium Elite Flows
  fiction: {
    
    // 1. EPIC FANTASY NOVEL CREATOR - ELABORATE VERSION
    epic_fantasy_novel_elaborate: {
      id: 'flow-epic-fantasy-elaborate',
      name: 'Epic Fantasy Novel Creator (Elaborate)',
      description: 'Complete 9-node fantasy novel creation system with world-building, character development, story outlining, narrative architecture, preview approval, content writing, editing, and multi-format output. Generates 150-200 pages of mind-blowing fantasy content with E-covers and internal images.',
      type: 'fiction',
      category: 'elite',
      complexity: 'advanced',
      is_elite: true,
      is_active: true,
      created_by: '5950cad6-810b-4c5b-9d40-4485ea249770',
      configurations: {
        nodes: [
          {
            id: 'input-1',
            type: 'input',
            role: 'story_input',
            position: { x: 100, y: 200 },
            data: {
              ...NODE_PALETTES.input.story_input,
              label: 'Fantasy Novel Input',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              inputFields: NODE_PALETTES.input.story_input.configuration.inputFields,
              testInputEnabled: true,
              testInputValues: {
                story_title: "The Dragon's Prophecy: Rise of the Shadow Mages",
                genre: "fantasy",
                author_name: "Anwesh Rath",
                story_premise: "In the mystical realm of Eldoria, where ancient magic flows through ley lines and dragons once ruled the skies, a young orphan named Kael discovers he is the last descendant of the legendary Shadow Mages - a bloodline thought extinct for a thousand years. When the Dark Lord Malachar begins his final assault to plunge the world into eternal darkness, Kael must master his inherited powers, unite the scattered dragon eggs, and fulfill an ancient prophecy that could either save Eldoria or destroy it forever. His journey takes him through enchanted forests, ancient dragon sanctuaries, and the ruins of the old kingdom where he must confront both external enemies and his own inner doubts about his destiny.",
                main_characters: "Kael Stormwind (17, reluctant hero with untapped magical abilities and a mysterious birthmark that glows when dragons are near), Princess Lyra (19, exiled royal seeking redemption for her family's betrayal of the dragons), Elder Zara (ancient dragon keeper mentor who has lived for centuries and holds the secrets of dragon magic), Lord Malachar (dark sorcerer seeking to control dragon power and resurrect the ancient dragon god), Luna (Kael's childhood friend and skilled archer who joins the quest)",
                setting: "The mystical realm of Eldoria: A land of floating islands connected by magical bridges, crystal forests where trees sing ancient melodies, ancient ruins of the Dragon Empire, and majestic mountains where dragons once soared through enchanted skies. The realm is divided into five territories, each with its own magical properties and dangers.",
                theme: "The responsibility that comes with power and the importance of choosing courage over fear. The story explores themes of destiny versus choice, the burden of legacy, and the power of friendship in overcoming seemingly impossible odds.",
                word_count: "50000+",
                chapter_count: "20",
                tone: "dramatic",
                accent: "american",
                writing_style: "descriptive",
                output_formats: ["pdf", "epub", "docx", "html"],
                typography_combo: "literary"
              }
            }
          },
          {
            id: 'world-builder',
            type: 'process',
            role: 'world_builder',
            position: { x: 400, y: 200 },
            data: {
              ...NODE_PALETTES.process.world_builder,
              label: 'Fantasy World Builder',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.process.world_builder.configuration,
                systemPrompt: "You are an ELITE Fantasy World Builder with 20+ years of experience creating immersive, believable fantasy worlds. Your mission: Create a mind-blowing, detailed fantasy realm that rivals Tolkien's Middle-earth or Martin's Westeros. Focus on creating a living, breathing world with deep history, complex magic systems, unique cultures, and stunning geography that will captivate readers from page one.",
                userPrompt: "Create an extraordinary fantasy world for this story. Develop: 1) Unique geography with magical landmarks, 2) Complex magic system with clear rules and limitations, 3) Rich history spanning thousands of years, 4) Diverse cultures and civilizations, 5) Political structures and conflicts, 6) Flora and fauna unique to this world, 7) Ancient prophecies and legends. Make it so detailed and immersive that readers feel they could actually live there."
              }
            }
          },
          {
            id: 'character-developer',
            type: 'process',
            role: 'character_developer',
            position: { x: 700, y: 200 },
            data: {
              ...NODE_PALETTES.process.character_developer,
              label: 'Character Developer',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.process.character_developer.configuration,
                systemPrompt: "You are a MASTER Character Developer specializing in creating unforgettable fantasy characters. Your expertise: Crafting complex, multi-dimensional characters with deep backstories, realistic motivations, character arcs, and relationships that readers will love, hate, and remember forever. Focus on psychological depth, emotional complexity, and character growth that drives the plot forward.",
                userPrompt: "Develop extraordinary characters for this fantasy novel. Create: 1) Detailed backstories and motivations for each character, 2) Character arcs and growth trajectories, 3) Complex relationships and dynamics between characters, 4) Unique personality traits and flaws, 5) Character-specific dialogue patterns, 6) Internal conflicts and external challenges, 7) Character goals and obstacles. Make each character feel like a real person with hopes, fears, and dreams."
              }
            }
          },
          {
            id: 'story-outliner',
            type: 'process',
            role: 'story_outliner',
            position: { x: 1000, y: 200 },
            data: {
              ...NODE_PALETTES.process.story_outliner,
              label: 'Story Outliner',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.process.story_outliner.configuration,
                systemPrompt: "You are a BRILLIANT Story Outliner who creates compelling narrative structures that keep readers turning pages. Your specialty: Crafting intricate plots with perfect pacing, unexpected twists, satisfying character arcs, and emotional resonance. You excel at creating three-act structures, subplot integration, and climactic moments that leave readers breathless.",
                userPrompt: "Create an exceptional story outline for this fantasy novel. Develop: 1) Three-act structure with clear plot points, 2) Chapter-by-chapter breakdown with key events, 3) Subplot integration and resolution, 4) Pacing and tension management, 5) Character arc progression, 6) Foreshadowing and plot twists, 7) Climactic moments and resolution. Write a compelling foreword, introduction, and detailed table of contents. DO NOT write actual chapters - only structure and opening content."
              }
            }
          },
          {
            id: 'narrative-architect',
            type: 'process',
            role: 'narrative_architect',
            position: { x: 1300, y: 200 },
            data: {
              ...NODE_PALETTES.process.narrative_architect,
              label: 'Narrative Architect',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.process.narrative_architect.configuration,
                systemPrompt: "You are a NARRATIVE ARCHITECT who designs story frameworks that captivate readers from the first sentence to the last. Your expertise: Creating narrative structures that balance action, emotion, and character development while maintaining perfect pacing and reader engagement. You specialize in crafting opening sequences that hook readers immediately.",
                userPrompt: "Design the narrative framework for this fantasy novel. Create: 1) Opening hook that grabs readers immediately, 2) Narrative pacing strategy, 3) Point of view and voice decisions, 4) Chapter structure and transitions, 5) Emotional beats and tension curves, 6) Reader engagement strategies, 7) Opening chapter outline and introduction. Focus on creating a narrative structure that keeps readers completely absorbed."
              }
            }
          },
          {
            id: 'preview-approval',
            type: 'preview',
            role: 'chapter_preview',
            position: { x: 1600, y: 200 },
            data: {
              ...NODE_PALETTES.preview.chapter_preview,
              label: 'Chapter Preview & Approval',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              previewLength: '1 Chapter Sample (3000-4000 words)',
              approvalRequired: true,
              configuration: {
                ...NODE_PALETTES.preview.chapter_preview.configuration,
                systemPrompt: "You are a PREVIEW SPECIALIST who creates compelling chapter samples that demonstrate the full potential of the story. Your mission: Generate one complete, polished chapter that showcases the world-building, character development, plot progression, and writing style. This preview must be so engaging that readers immediately want to read the entire book.",
                userPrompt: "Create an exceptional chapter preview for this fantasy novel. Generate: 1) One complete chapter (3000-4000 words) that showcases the story's potential, 2) Professional formatting with proper paragraph breaks and dialogue, 3) Compelling opening that hooks readers, 4) Character development and world-building integration, 5) Plot progression that leaves readers wanting more, 6) Consistent tone and style throughout. Make this preview absolutely irresistible to readers."
              }
            }
          },
          {
            id: 'content-writer',
            type: 'process',
            role: 'content_writer',
            position: { x: 1900, y: 200 },
            data: {
              ...NODE_PALETTES.process.content_writer,
              label: 'Fantasy Content Writer',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.process.content_writer.configuration,
                systemPrompt: "You are a MASTER Fantasy Content Writer with the ability to create epic, immersive fantasy novels that rival the greatest works in the genre. Your expertise: Crafting compelling narratives with rich world-building, complex characters, and plot twists that keep readers completely absorbed. You excel at creating emotional resonance, vivid descriptions, and dialogue that brings characters to life.",
                userPrompt: "Write the complete fantasy novel based on the approved outline and preview. Create: 1) All remaining chapters with consistent quality, 2) Rich, immersive descriptions that bring the fantasy world to life, 3) Compelling dialogue that reveals character personality, 4) Action sequences that are thrilling and easy to follow, 5) Emotional moments that resonate with readers, 6) Plot twists and revelations that surprise and satisfy, 7) A satisfying conclusion that ties up all plot threads. Maintain the approved tone, style, and character development throughout."
              }
            }
          },
          {
            id: 'editor',
            type: 'process',
            role: 'editor',
            position: { x: 2200, y: 200 },
            data: {
              ...NODE_PALETTES.process.editor,
              label: 'Fantasy Editor',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.process.editor.configuration,
                systemPrompt: "You are an ELITE Fantasy Editor with extensive experience polishing fantasy novels for publication. Your specialty: Enhancing prose, improving pacing, strengthening character development, and ensuring consistency throughout the narrative. You excel at maintaining the author's voice while elevating the overall quality to professional publishing standards.",
                userPrompt: "Edit and polish this fantasy novel to perfection. Focus on: 1) Prose enhancement and flow improvement, 2) Character consistency and development, 3) Plot pacing and tension management, 4) Dialogue refinement and authenticity, 5) World-building consistency, 6) Grammar and style refinement, 7) Overall narrative cohesion. Maintain the author's voice while elevating the quality to professional publishing standards."
              }
            }
          },
          {
            id: 'output-formatter',
            type: 'output',
            role: 'multi_format_output',
            position: { x: 2500, y: 200 },
            data: {
              ...NODE_PALETTES.output.multi_format_output,
              label: 'Multi-Format Output',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.output.multi_format_output.configuration,
                systemPrompt: "You are a PROFESSIONAL Book Formatter specializing in creating publication-ready outputs across multiple formats. Your expertise: Formatting books for PDF, EPUB, DOCX, and HTML with professional typography, proper chapter breaks, table of contents, and all necessary publishing elements. You excel at creating visually appealing layouts that enhance the reading experience.",
                userPrompt: "Format this fantasy novel for professional publication. Create: 1) PDF format with professional typography and layout, 2) EPUB format optimized for e-readers, 3) DOCX format for editing and printing, 4) HTML format for web display, 5) Professional table of contents, 6) Chapter formatting with proper breaks, 7) E-cover design and internal image placement. Ensure all formats are publication-ready and visually stunning."
              }
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'input-1', target: 'world-builder' },
          { id: 'e2', source: 'world-builder', target: 'character-developer' },
          { id: 'e3', source: 'character-developer', target: 'story-outliner' },
          { id: 'e4', source: 'story-outliner', target: 'narrative-architect' },
          { id: 'e5', source: 'narrative-architect', target: 'preview-approval' },
          { id: 'e6', source: 'preview-approval', target: 'content-writer' },
          { id: 'e7', source: 'content-writer', target: 'editor' },
          { id: 'e8', source: 'editor', target: 'output-formatter' }
        ]
      },
      metadata: {
        nodeCount: 9,
        hasAI: true,
        estimatedDuration: '45-60 minutes',
        outputFormats: ['pdf', 'epub', 'docx', 'html'],
        targetWordCount: '50000-60000',
        targetPages: '150-200',
        genre: 'fantasy',
        difficulty: 'advanced',
        features: ['E-cover generation', 'Internal images', 'Professional formatting', 'Preview approval system']
      }
    },

    // 2. EPIC FANTASY NOVEL CREATOR - SHORT VERSION
    epic_fantasy_novel_short: {
      id: 'flow-epic-fantasy-short',
      name: 'Epic Fantasy Novel Creator (Short)',
      description: 'Streamlined 5-node fantasy novel creation system with world-building, story outlining, preview approval, content writing, and multi-format output. Generates 80-120 pages of high-quality fantasy content with E-covers and professional formatting.',
      type: 'fiction',
      category: 'elite',
      complexity: 'intermediate',
      is_elite: true,
      is_active: true,
      created_by: '5950cad6-810b-4c5b-9d40-4485ea249770',
      configurations: {
        nodes: [
          {
            id: 'input-1',
            type: 'input',
            role: 'story_input',
            position: { x: 100, y: 200 },
            data: {
              ...NODE_PALETTES.input.story_input,
              label: 'Fantasy Novel Input',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              inputFields: NODE_PALETTES.input.story_input.configuration.inputFields,
              testInputEnabled: true,
              testInputValues: {
                story_title: "The Dragon's Prophecy: Rise of the Shadow Mages",
                genre: "fantasy",
                author_name: "Anwesh Rath",
                story_premise: "In the mystical realm of Eldoria, where ancient magic flows through ley lines and dragons once ruled the skies, a young orphan named Kael discovers he is the last descendant of the legendary Shadow Mages - a bloodline thought extinct for a thousand years. When the Dark Lord Malachar begins his final assault to plunge the world into eternal darkness, Kael must master his inherited powers, unite the scattered dragon eggs, and fulfill an ancient prophecy that could either save Eldoria or destroy it forever.",
                main_characters: "Kael Stormwind (17, reluctant hero with untapped magical abilities), Princess Lyra (19, exiled royal seeking redemption), Elder Zara (ancient dragon keeper mentor), Lord Malachar (dark sorcerer), Luna (Kael's childhood friend and skilled archer)",
                setting: "The mystical realm of Eldoria: A land of floating islands connected by magical bridges, crystal forests where trees sing ancient melodies, ancient ruins of the Dragon Empire, and majestic mountains where dragons once soared through enchanted skies.",
                theme: "The responsibility that comes with power and the importance of choosing courage over fear. Destiny versus choice, the burden of legacy, and the power of friendship in overcoming seemingly impossible odds.",
                word_count: "25000-35000",
                chapter_count: "12",
                tone: "dramatic",
                accent: "american",
                writing_style: "descriptive",
                output_formats: ["pdf", "epub", "docx"],
                typography_combo: "literary"
              }
            }
          },
          {
            id: 'world-builder',
            type: 'process',
            role: 'world_builder',
            position: { x: 400, y: 200 },
            data: {
              ...NODE_PALETTES.process.world_builder,
              label: 'Fantasy World Builder',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.process.world_builder.configuration,
                systemPrompt: "You are an ELITE Fantasy World Builder creating immersive, believable fantasy worlds. Create a mind-blowing fantasy realm with deep history, complex magic systems, unique cultures, and stunning geography that captivates readers.",
                userPrompt: "Create an extraordinary fantasy world. Develop: 1) Unique geography with magical landmarks, 2) Complex magic system with clear rules, 3) Rich history spanning thousands of years, 4) Diverse cultures and civilizations, 5) Political structures and conflicts, 6) Flora and fauna unique to this world, 7) Ancient prophecies and legends."
              }
            }
          },
          {
            id: 'story-outliner',
            type: 'process',
            role: 'story_outliner',
            position: { x: 700, y: 200 },
            data: {
              ...NODE_PALETTES.process.story_outliner,
              label: 'Story Outliner',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.process.story_outliner.configuration,
                systemPrompt: "You are a BRILLIANT Story Outliner creating compelling narrative structures. Craft intricate plots with perfect pacing, unexpected twists, satisfying character arcs, and emotional resonance.",
                userPrompt: "Create an exceptional story outline. Develop: 1) Three-act structure with clear plot points, 2) Chapter-by-chapter breakdown, 3) Subplot integration, 4) Pacing and tension management, 5) Character arc progression, 6) Foreshadowing and plot twists, 7) Compelling foreword, introduction, and table of contents. DO NOT write actual chapters."
              }
            }
          },
          {
            id: 'preview-approval',
            type: 'preview',
            role: 'chapter_preview',
            position: { x: 1000, y: 200 },
            data: {
              ...NODE_PALETTES.preview.chapter_preview,
              label: 'Chapter Preview & Approval',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              previewLength: '1 Chapter Sample (2500-3000 words)',
              approvalRequired: true,
              configuration: {
                ...NODE_PALETTES.preview.chapter_preview.configuration,
                systemPrompt: "You are a PREVIEW SPECIALIST creating compelling chapter samples. Generate one complete, polished chapter that showcases world-building, character development, and writing style.",
                userPrompt: "Create an exceptional chapter preview. Generate: 1) One complete chapter (2500-3000 words), 2) Professional formatting, 3) Compelling opening that hooks readers, 4) Character development and world-building, 5) Plot progression that leaves readers wanting more, 6) Consistent tone and style."
              }
            }
          },
          {
            id: 'content-writer',
            type: 'process',
            role: 'content_writer',
            position: { x: 1300, y: 200 },
            data: {
              ...NODE_PALETTES.process.content_writer,
              label: 'Fantasy Content Writer',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.process.content_writer.configuration,
                systemPrompt: "You are a MASTER Fantasy Content Writer creating epic, immersive fantasy novels. Craft compelling narratives with rich world-building, complex characters, and plot twists that keep readers absorbed.",
                userPrompt: "Write the complete fantasy novel. Create: 1) All remaining chapters with consistent quality, 2) Rich, immersive descriptions, 3) Compelling dialogue, 4) Thrilling action sequences, 5) Emotional moments, 6) Plot twists and revelations, 7) Satisfying conclusion. Maintain approved tone and style."
              }
            }
          },
          {
            id: 'output-formatter',
            type: 'output',
            role: 'multi_format_output',
            position: { x: 1600, y: 200 },
            data: {
              ...NODE_PALETTES.output.multi_format_output,
              label: 'Multi-Format Output',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              configuration: {
                ...NODE_PALETTES.output.multi_format_output.configuration,
                systemPrompt: "You are a PROFESSIONAL Book Formatter creating publication-ready outputs. Format books for PDF, EPUB, and DOCX with professional typography and layouts.",
                userPrompt: "Format this fantasy novel for publication. Create: 1) PDF with professional typography, 2) EPUB optimized for e-readers, 3) DOCX for editing and printing, 4) Professional table of contents, 5) Chapter formatting, 6) E-cover design. Ensure all formats are publication-ready."
              }
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'input-1', target: 'world-builder' },
          { id: 'e2', source: 'world-builder', target: 'story-outliner' },
          { id: 'e3', source: 'story-outliner', target: 'preview-approval' },
          { id: 'e4', source: 'preview-approval', target: 'content-writer' },
          { id: 'e5', source: 'content-writer', target: 'output-formatter' }
        ]
      },
      metadata: {
        nodeCount: 6,
        hasAI: true,
        estimatedDuration: '25-35 minutes',
        outputFormats: ['pdf', 'epub', 'docx'],
        targetWordCount: '25000-35000',
        targetPages: '80-120',
        genre: 'fantasy',
        difficulty: 'intermediate',
        features: ['E-cover generation', 'Professional formatting', 'Preview approval system']
      }
    }
  },

  // SELF-HELP TRANSFORMATION FLOWS - Super Premium Elite Flows
  selfhelp: {
    
    // 1. EPIC FANTASY NOVEL CREATOR
    epic_fantasy_novel: {
      id: 'flow-epic-fantasy-novel',
      name: 'Epic Fantasy Novel Creator',
      description: 'Complete fantasy novel creation system - from world-building to publication-ready output',
      type: 'fiction',
      category: 'elite',
      complexity: 'advanced',
      is_elite: true,
      is_active: true,
      created_by: '5950cad6-810b-4c5b-9d40-4485ea249770', // SuperAdmin ID
      configurations: {
        nodes: [
          {
            id: 'input-1',
            type: 'input',
            role: 'story_input',
            position: { x: 100, y: 200 },
            data: {
              ...NODE_PALETTES.input.story_input,
              label: 'Story Input - Fantasy Novel',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              inputFields: NODE_PALETTES.input.story_input.configuration.inputFields,
              testInputEnabled: true,
              testInputValues: {
                story_title: "The Chronicles of Eldoria",
                genre: "fantasy",
                story_premise: "A young mage discovers an ancient prophecy that could save or destroy their magical realm",
                main_characters: "Elena, a 17-year-old mage; Marcus, her mentor; Zara, the dark sorceress",
                setting: "Medieval fantasy world with magic, dragons, and ancient kingdoms",
                theme: "Power, destiny, and the choice between good and evil",
                word_count: "50000+",
                chapter_count: "20",
                writing_style: "descriptive"
              }
            }
          },
          {
            id: 'process-1',
            type: 'process',
            role: 'world_builder',
            position: { x: 400, y: 200 },
            data: {
              ...NODE_PALETTES.process.world_builder,
              label: 'Fantasy World Builder',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-2',
            type: 'process',
            role: 'character_developer',
            position: { x: 700, y: 200 },
            data: {
              ...NODE_PALETTES.process.character_developer,
              label: 'Character Developer',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-3',
            type: 'process',
            role: 'plot_architect',
            position: { x: 1000, y: 200 },
            data: {
              ...NODE_PALETTES.process.plot_architect,
              label: 'Plot Architect',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-4',
            type: 'process',
            role: 'content_writer',
            position: { x: 1300, y: 200 },
            data: {
              ...NODE_PALETTES.process.content_writer,
              label: 'Content Writer',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-5',
            type: 'process',
            role: 'editor',
            position: { x: 1600, y: 200 },
            data: {
              ...NODE_PALETTES.process.editor,
              label: 'Editor',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-6',
            type: 'process',
            role: 'quality_checker',
            position: { x: 1900, y: 200 },
            data: {
              ...NODE_PALETTES.process.quality_checker,
              label: 'Quality Checker',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'preview-1',
            type: 'preview',
            role: 'final_previewer',
            position: { x: 2200, y: 200 },
            data: {
              ...NODE_PALETTES.preview.final_preview,
              label: 'Final Preview',
              aiEnabled: false,
              maxAttempts: 3,
              previewLength: 'Complete Book',
              approvalRequired: true,
              currentAttempt: 0,
              customerFeedback: '',
              isApproved: false
            }
          },
          {
            id: 'output-1',
            type: 'output',
            role: 'multi_format_output',
            position: { x: 2500, y: 200 },
            data: {
              ...NODE_PALETTES.output.multi_format_output,
              label: 'Multi-Format Output',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'input-1', target: 'process-1' },
          { id: 'e2', source: 'process-1', target: 'process-2' },
          { id: 'e3', source: 'process-2', target: 'process-3' },
          { id: 'e4', source: 'process-3', target: 'process-4' },
          { id: 'e5', source: 'process-4', target: 'process-5' },
          { id: 'e6', source: 'process-5', target: 'process-6' },
          { id: 'e7', source: 'process-6', target: 'preview-1' },
          { id: 'e8', source: 'preview-1', target: 'output-1' }
        ]
      },
      metadata: {
        nodeCount: 9,
        hasAI: true,
        estimatedDuration: '45-60 minutes',
        outputFormats: ['pdf', 'epub', 'docx', 'html', 'text'],
        targetWordCount: '50000+',
        genre: 'fantasy',
        difficulty: 'advanced'
      },
      steps: [
        { step: 1, name: 'Story Input Collection', description: 'Gather fantasy story requirements and specifications' },
        { step: 2, name: 'World Building', description: 'Create immersive fantasy world with magic systems and geography' },
        { step: 3, name: 'Character Development', description: 'Develop compelling characters with depth and motivations' },
        { step: 4, name: 'Plot Architecture', description: 'Design epic plot structure with conflicts and resolution' },
        { step: 5, name: 'Content Writing', description: 'Write complete fantasy novel with engaging narrative' },
        { step: 6, name: 'Editing', description: 'Refine content for clarity, flow, and engagement' },
        { step: 7, name: 'Quality Check', description: 'Final quality assurance and consistency review' },
        { step: 8, name: 'Final Preview', description: 'Complete book preview for user approval' },
        { step: 9, name: 'Multi-Format Output', description: 'Generate publication-ready formats' }
      ]
    },

    // 2. ROMANCE BESTSELLER MAKER
    romance_bestseller: {
      id: 'flow-romance-bestseller',
      name: 'Romance Bestseller Maker',
      description: 'Professional romance novel creation system with emotional depth and compelling relationships',
      type: 'fiction',
      category: 'elite',
      complexity: 'advanced',
      is_elite: true,
      is_active: true,
      created_by: '5950cad6-810b-4c5b-9d40-4485ea249770',
      configurations: {
        nodes: [
          {
            id: 'input-1',
            type: 'input',
            role: 'story_input',
            position: { x: 100, y: 200 },
            data: {
              ...NODE_PALETTES.input.story_input,
              label: 'Story Input - Romance Novel',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              inputFields: NODE_PALETTES.input.story_input.configuration.inputFields,
              testInputEnabled: true,
              testInputValues: {
                story_title: "Love in the City of Lights",
                genre: "romance",
                story_premise: "A successful businesswoman finds unexpected love with a charming artist in Paris",
                main_characters: "Sophie, a 28-year-old marketing executive; Alexandre, a 30-year-old painter",
                setting: "Modern-day Paris with cafes, art galleries, and romantic locations",
                theme: "Love, sacrifice, and finding true happiness",
                word_count: "25000-50000",
                chapter_count: "15",
                writing_style: "conversational"
              }
            }
          },
          {
            id: 'process-1',
            type: 'process',
            role: 'character_developer',
            position: { x: 400, y: 200 },
            data: {
              ...NODE_PALETTES.process.character_developer,
              label: 'Character Developer',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-2',
            type: 'process',
            role: 'plot_architect',
            position: { x: 700, y: 200 },
            data: {
              ...NODE_PALETTES.process.plot_architect,
              label: 'Plot Architect',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-3',
            type: 'process',
            role: 'content_writer',
            position: { x: 1000, y: 200 },
            data: {
              ...NODE_PALETTES.process.content_writer,
              label: 'Content Writer',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-4',
            type: 'process',
            role: 'editor',
            position: { x: 1300, y: 200 },
            data: {
              ...NODE_PALETTES.process.editor,
              label: 'Editor',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-5',
            type: 'process',
            role: 'quality_checker',
            position: { x: 1600, y: 200 },
            data: {
              ...NODE_PALETTES.process.quality_checker,
              label: 'Quality Checker',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'preview-1',
            type: 'preview',
            role: 'final_previewer',
            position: { x: 1900, y: 200 },
            data: {
              ...NODE_PALETTES.preview.final_preview,
              label: 'Final Preview',
              aiEnabled: false,
              maxAttempts: 3,
              previewLength: 'Complete Book',
              approvalRequired: true,
              currentAttempt: 0,
              customerFeedback: '',
              isApproved: false
            }
          },
          {
            id: 'output-1',
            type: 'output',
            role: 'multi_format_output',
            position: { x: 2200, y: 200 },
            data: {
              ...NODE_PALETTES.output.multi_format_output,
              label: 'Multi-Format Output',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'input-1', target: 'process-1' },
          { id: 'e2', source: 'process-1', target: 'process-2' },
          { id: 'e3', source: 'process-2', target: 'process-3' },
          { id: 'e4', source: 'process-3', target: 'process-4' },
          { id: 'e5', source: 'process-4', target: 'process-5' },
          { id: 'e6', source: 'process-5', target: 'preview-1' },
          { id: 'e7', source: 'preview-1', target: 'output-1' }
        ]
      },
      metadata: {
        nodeCount: 8,
        hasAI: true,
        estimatedDuration: '35-45 minutes',
        outputFormats: ['pdf', 'epub', 'docx', 'html', 'text'],
        targetWordCount: '25000-50000',
        genre: 'romance',
        difficulty: 'advanced'
      },
      steps: [
        { step: 1, name: 'Story Input Collection', description: 'Gather romance story requirements and character details' },
        { step: 2, name: 'Character Development', description: 'Develop compelling romantic leads with chemistry and depth' },
        { step: 3, name: 'Plot Architecture', description: 'Design romantic plot with tension, conflict, and resolution' },
        { step: 4, name: 'Content Writing', description: 'Write engaging romance novel with emotional depth' },
        { step: 5, name: 'Editing', description: 'Refine content for emotional impact and readability' },
        { step: 6, name: 'Quality Check', description: 'Final quality assurance and consistency review' },
        { step: 7, name: 'Final Preview', description: 'Complete book preview for user approval' },
        { step: 8, name: 'Multi-Format Output', description: 'Generate publication-ready formats' }
      ]
    },

    // 3. THRILLER & SUSPENSE GENERATOR
    thriller_suspense: {
      id: 'flow-thriller-suspense',
      name: 'Thriller & Suspense Generator',
      description: 'High-intensity thriller creation system with plot twists and psychological depth',
      type: 'fiction',
      category: 'elite',
      complexity: 'advanced',
      is_elite: true,
      is_active: true,
      created_by: '5950cad6-810b-4c5b-9d40-4485ea249770',
      configurations: {
        nodes: [
          {
            id: 'input-1',
            type: 'input',
            role: 'story_input',
            position: { x: 100, y: 200 },
            data: {
              ...NODE_PALETTES.input.story_input,
              label: 'Story Input - Thriller Novel',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first'],
              inputFields: NODE_PALETTES.input.story_input.configuration.inputFields,
              testInputEnabled: true,
              testInputValues: {
                story_title: "The Silent Witness",
                genre: "thriller",
                story_premise: "A detective must solve a series of murders before the killer strikes again",
                main_characters: "Detective Sarah Chen, a 35-year-old homicide detective; The Shadow, a mysterious serial killer",
                setting: "Modern-day New York City with dark alleys and crime scenes",
                theme: "Justice, revenge, and the thin line between good and evil",
                word_count: "25000-50000",
                chapter_count: "12",
                writing_style: "dramatic"
              }
            }
          },
          {
            id: 'process-1',
            type: 'process',
            role: 'researcher',
            position: { x: 400, y: 200 },
            data: {
              ...NODE_PALETTES.process.researcher,
              label: 'Crime Research Specialist',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-2',
            type: 'process',
            role: 'character_developer',
            position: { x: 700, y: 200 },
            data: {
              ...NODE_PALETTES.process.character_developer,
              label: 'Character Developer',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-3',
            type: 'process',
            role: 'plot_architect',
            position: { x: 1000, y: 200 },
            data: {
              ...NODE_PALETTES.process.plot_architect,
              label: 'Plot Architect',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-4',
            type: 'process',
            role: 'content_writer',
            position: { x: 1300, y: 200 },
            data: {
              ...NODE_PALETTES.process.content_writer,
              label: 'Content Writer',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-5',
            type: 'process',
            role: 'editor',
            position: { x: 1600, y: 200 },
            data: {
              ...NODE_PALETTES.process.editor,
              label: 'Editor',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'process-6',
            type: 'process',
            role: 'quality_checker',
            position: { x: 1900, y: 200 },
            data: {
              ...NODE_PALETTES.process.quality_checker,
              label: 'Quality Checker',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          },
          {
            id: 'preview-1',
            type: 'preview',
            role: 'final_previewer',
            position: { x: 2200, y: 200 },
            data: {
              ...NODE_PALETTES.preview.final_preview,
              label: 'Final Preview',
              aiEnabled: false,
              maxAttempts: 3,
              previewLength: 'Complete Book',
              approvalRequired: true,
              currentAttempt: 0,
              customerFeedback: '',
              isApproved: false
            }
          },
          {
            id: 'output-1',
            type: 'output',
            role: 'multi_format_output',
            position: { x: 2500, y: 200 },
            data: {
              ...NODE_PALETTES.output.multi_format_output,
              label: 'Multi-Format Output',
              aiEnabled: true,
              selectedModels: ['OPENA-01-first']
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'input-1', target: 'process-1' },
          { id: 'e2', source: 'process-1', target: 'process-2' },
          { id: 'e3', source: 'process-2', target: 'process-3' },
          { id: 'e4', source: 'process-3', target: 'process-4' },
          { id: 'e5', source: 'process-4', target: 'process-5' },
          { id: 'e6', source: 'process-5', target: 'process-6' },
          { id: 'e7', source: 'process-6', target: 'preview-1' },
          { id: 'e8', source: 'preview-1', target: 'output-1' }
        ]
      },
      metadata: {
        nodeCount: 9,
        hasAI: true,
        estimatedDuration: '40-50 minutes',
        outputFormats: ['pdf', 'epub', 'docx', 'html', 'text'],
        targetWordCount: '25000-50000',
        genre: 'thriller',
        difficulty: 'advanced'
      },
      steps: [
        { step: 1, name: 'Story Input Collection', description: 'Gather thriller story requirements and crime details' },
        { step: 2, name: 'Crime Research', description: 'Research realistic crime scenarios and investigation procedures' },
        { step: 3, name: 'Character Development', description: 'Develop compelling detective and antagonist characters' },
        { step: 4, name: 'Plot Architecture', description: 'Design suspenseful plot with twists and reveals' },
        { step: 5, name: 'Content Writing', description: 'Write gripping thriller with tension and suspense' },
        { step: 6, name: 'Editing', description: 'Refine content for maximum suspense and pacing' },
        { step: 7, name: 'Quality Check', description: 'Final quality assurance and consistency review' },
        { step: 8, name: 'Final Preview', description: 'Complete book preview for user approval' },
        { step: 9, name: 'Multi-Format Output', description: 'Generate publication-ready formats' }
      ]
    }
  }
}

export default ELITE_DFY_FLOWS

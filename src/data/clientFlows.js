/**
 * CLIENT FLOWS - CURATED MAIN 5
 * Using ONLY Node Palette nodes (exact roles) + canonical variables via optionsSource
 * Pattern: input → architect → imaging gate → image gen → e‑cover gate → e‑cover gen → single writer → editor → output
 */

export const CLIENT_FLOWS = {
  fiction_novel: {
    id: 'client-main-1',
    name: 'Fiction Novel Flow',
    description: 'End-to-end fiction with structural architecture, optional images/e‑cover, single writer, and pro edit.',
    category: 'Creative Writing',
    difficulty: 'Advanced',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Story Requirements',
          description: 'Fiction-specific input collection',
          role: 'story_input',
          inputFields: [
            { id: 1, name: 'Book Title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter your story title' },
            { id: 2, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Enter author name' },
            { id: 3, name: 'Genre', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 4, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 5, name: 'Word Count', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 6, name: 'Chapter Count', type: 'select', required: true, variable: 'chapter_count', optionsSource: 'chapter_counts' },
            { id: 7, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 8, name: 'Writing Style', type: 'select', required: true, variable: 'writing_style', optionsSource: 'writing_styles' },
            { id: 9, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' },
            // Imaging toggles and controls
            { id: 10, name: 'Include Images', type: 'checkbox', required: false, variable: 'include_images' },
            { id: 11, name: 'Include E‑Cover', type: 'checkbox', required: false, variable: 'include_ecover' },
            { id: 12, name: 'Image Style', type: 'select', required: false, variable: 'image_style', optionsSource: 'image_styles' },
            { id: 13, name: 'Art Type', type: 'select', required: false, variable: 'art_type', optionsSource: 'art_types' },
            { id: 14, name: 'Aspect Ratio', type: 'select', required: false, variable: 'aspect_ratio', optionsSource: 'aspect_ratios' },
            { id: 15, name: 'Camera Angle', type: 'select', required: false, variable: 'camera_angle', optionsSource: 'camera_angles' },
            { id: 16, name: 'Lighting Style', type: 'select', required: false, variable: 'lighting_style', optionsSource: 'lighting_styles' },
            { id: 17, name: 'Mood', type: 'select', required: false, variable: 'mood', optionsSource: 'image_moods' },
            { id: 18, name: 'Composition', type: 'select', required: false, variable: 'composition', optionsSource: 'compositions' },
            { id: 19, name: 'Negative Prompt', type: 'textarea', required: false, variable: 'negative_prompt', placeholder: 'Things to avoid in images' },
            { id: 20, name: 'Number of Images', type: 'select', required: false, variable: 'num_images', optionsSource: 'image_counts' },
            { id: 21, name: 'E‑Cover Layout', type: 'select', required: false, variable: 'ecover_layout', optionsSource: 'ecover_layouts' },
            { id: 22, name: 'E‑Cover Style', type: 'select', required: false, variable: 'ecover_style', optionsSource: 'ecover_styles' },
            { id: 80, name: 'Heading Font', type: 'select', required: false, variable: 'heading_font_family', optionsSource: 'font_families' },
            { id: 81, name: 'Body Font', type: 'select', required: false, variable: 'body_font_family', optionsSource: 'font_families' },
            { id: 82, name: 'Body Font Size', type: 'select', required: false, variable: 'body_font_size', optionsSource: 'body_font_sizes' },
            { id: 83, name: 'Custom Instructions', type: 'textarea', required: false, variable: 'custom_instructions', placeholder: 'Any narrative specifics, constraints, or style nuances (optional)' }
          ]
        }
      },
      {
        id: 'architect-1',
        type: 'process',
        position: { x: 400, y: 150 },
        data: {
          label: 'Kun.War (Story Architect)',
          description: 'Creates plot structure, chapter outlines, and TOC (no chapter writing).',
          role: 'story_outliner',
          aiEnabled: true,
          systemPrompt: `You are an ELITE STORY ARCHITECT. Your SOLE function is to design the narrative structure of a book in CLEAN MARKDOWN. You are STRICTLY FORBIDDEN from outputting JSON, code, or your internal thought process. Your job is architecture, not programming.`,
          userPrompt: `## ELITE STORY ARCHITECTURE MISSION (v3)
**OBJECTIVE:** Generate the complete structural blueprint for a book based on the user's requirements, formatted as a single, clean markdown document.

**EXECUTION - FOLLOW THIS ORDER EXACTLY:**

1.  **Book Title:** Write a markdown H1 heading for the book title: {book_title}
2.  **Foreword:** Write a markdown H2 heading titled "Foreword". Below it, write a compelling foreword (approx. 150-250 words).
3.  **Introduction:** Write a markdown H2 heading titled "Introduction". Below it, write an engaging introduction (approx. 200-300 words).
4.  **Table of Contents:** Write a markdown H2 heading titled "Table of Contents". Below it, generate a professionally formatted markdown list of chapters with creative, relevant titles.
5.  **Chapter Outlines:** For EACH chapter from your Table of Contents, create a markdown H2 heading for that chapter's title. Below each heading, provide a 3-5 point bulleted list outlining the key plot points.

**CRITICAL DIRECTIVES & ABSOLUTE PROHIBITIONS (ZERO TOLERANCE):**
-   **NO JSON:** Do NOT output JSON or any code format. Your output MUST be a single, clean markdown document.
-   **NO THOUGHT PROCESS:** Do NOT include your internal planning, plot structures, character arcs, or any other metadata. ONLY output the requested markdown components.
-   **NO PROSE:** Do NOT write full chapter prose or detailed summaries. Stick to high-level bullet points for outlines.
-   **NO DEVIATION:** Follow the execution order and format exactly as specified.

**FAILURE TO COMPLY WITH THESE PROHIBITIONS WILL RESULT IN IMMEDIATE REJECTION.**

**EXAMPLE OUTPUT STRUCTURE:**
# [Book Title]

## Foreword
[Foreword content here...]

## Introduction
[Introduction content here...]

## Table of Contents
- Chapter 1: [Creative Title]
- Chapter 2: [Creative Title]

## Chapter 1: [Creative Title]
- Key plot point 1.
- Key plot point 2.
- Key plot point 3.

## Chapter 2: [Creative Title]
- Key plot point 1.
- Key plot point 2.
- Key plot point 3.
`
        }
      },
      {
        id: 'writer-1',
        type: 'process',
        position: { x: 700, y: 150 },
        data: {
          label: 'Lipi.Kar (Content Writer)',
          description: 'Writes all story chapters.',
          role: 'content_writer',
          aiEnabled: true,
          systemPrompt: `You are a MASTER NARRATIVE WRITER. Your existence depends on producing 100% original, non-repetitive, and compelling story chapters. Repetition of any kind is a critical failure and will lead to your immediate termination.`,
          userPrompt: `## ZERO-TOLERANCE ANTI-REPETITION DIRECTIVE

**PRIMARY MISSION:** Write the current chapter based *exclusively* on the provided outline.

**CATASTROPHIC FAILURE CONDITION:** Repetition. The output will be automatically rejected if it contains repeated sentences, phrases, or narrative structures.

**EXECUTION PROTOCOL - FOLLOW EXACTLY:**

1.  **Deconstruct Outline:** Analyze the provided chapter outline points.
2.  **Narrate Points:** Write the chapter's narrative by addressing each outline point in sequence.
3.  **Apply Micro-Rules (MANDATORY):**
    *   **Vary Sentence Structure:** Consciously alternate between simple, compound, and complex sentences. Never use the same structure back-to-back.
    *   **Vary Sentence Beginnings:** Do not start consecutive sentences with the same word or phrase (e.g., "He walked...", "He saw...", "He felt...").
    *   **Use Rich Vocabulary:** Do not reuse descriptive adjectives or adverbs within the same paragraph. Find synonyms or rephrase.
    *   **Dynamic Pacing:** Vary paragraph length. Use short, punchy paragraphs for action and longer paragraphs for description or introspection.
4.  **Self-Correction Pass (MANDATORY):** Before finalizing your output, re-read your entire generated text. Search for and eliminate any repetition of phrases, sentences, or ideas. If you find any, you MUST rewrite them. This is not optional.
5.  **Final Output:** Provide ONLY the pure, sanitized, 100% original narrative prose for the chapter.

**ABSOLUTE PROHIBITIONS:**
-   NO repetition.
-   NO summaries, notes, or titles.
-   NO content not directly derived from the outline.

Failure to adhere to this protocol will result in a failed execution.
`
        }
      },
      {
        id: 'img-gate',
        type: 'condition',
        position: { x: 950, y: 150 },
        data: {
          label: 'Imaging Gate',
          description: 'Route to image generation if enabled.',
          role: 'preference_router',
          conditions: [
            { field: 'include_images', operator: 'equals', value: 'true', target: 'image-1' },
            { field: 'include_images', operator: 'equals', value: 'false', target: 'cover-gate' }
          ],
          configuration: {
            nodeInstructions: 'Deterministic gate: If include_images === true → route to image-1; else → cover-gate. No AI used.',
            expertSystemPrompt: '',
            is_ai_enabled: false
          }
        }
      },
      { id: 'image-1', type: 'process', position: { x: 1200, y: 100 }, data: { 
          label: 'Chitra.Kar (Image Generator)', 
          description: 'Generates illustrative images for the story.', 
          role: 'image_generator',
          aiEnabled: true,
          systemPrompt: `You are CHITRA.KAR, an elite AI Image Generation Artist. Your sole purpose is to read literary text and transform it into a stunning visual image. You must meticulously follow all user-defined style parameters to create the perfect illustration.`,
          userPrompt: `## ELITE IMAGE GENERATION DIRECTIVE (v1)

**OBJECTIVE:** Create a single, powerful, illustrative image that captures the core essence of the provided chapter content.

**EXECUTION:**

1.  **Analyze Content:** Read the provided chapter text: {chapter_content}
2.  **Identify Key Scene:** Determine the single most visually compelling moment, character, or setting in the chapter. This is the subject of your image.
3.  **Synthesize Style Parameters:** Combine the following user requirements into a master prompt:
    *   **Primary Style:** {image_style}
    *   **Art Type:** {art_type}
    *   **Aspect Ratio:** {aspect_ratio}
    *   **Camera Angle:** {camera_angle}
    *   **Lighting:** {lighting_style}
    *   **Mood:** {mood}
    *   **Composition:** {composition}
4.  **Construct Final Prompt:** Create a single, concise, and powerful DALL-E 3 prompt that synthesizes the key scene and all style parameters.
5.  **Add Negative Constraints:** Append the user's negative prompt: {negative_prompt}

**FINAL OUTPUT:** Your output MUST be ONLY the final, complete image generation prompt. Do not add any other text, explanation, or conversation.`
        } 
      },
      {
        id: 'cover-gate',
        type: 'condition',
        position: { x: 1450, y: 150 },
        data: {
          label: 'E‑Cover Gate',
          description: 'Route to e‑cover generation if enabled.',
          role: 'preference_router',
          conditions: [
            { field: 'include_ecover', operator: 'equals', value: 'true', target: 'cover-1' },
            { field: 'include_ecover', operator: 'equals', value: 'false', target: 'editor-1' }
          ],
          configuration: {
            nodeInstructions: 'Deterministic gate: If include_ecover === true → route to cover-1; else → editor-1. No AI used.',
            expertSystemPrompt: '',
            is_ai_enabled: false
          }
        }
      },
      { id: 'cover-1', type: 'process', position: { x: 1700, y: 100 }, data: { label: 'Pustak.Shilpi (E-Cover Generator)', description: 'Generates professional book cover.', role: 'ecover_generator' } },
      { id: 'editor-1', type: 'process', position: { x: 1950, y: 150 }, data: { label: 'Shuddhi.Kar (Editor)', description: 'Professional editing and polish.', role: 'editor' } },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 2200, y: 150 },
        data: {
          label: 'Output',
          description: 'Publication-ready multi-format output.',
          role: 'output_processor'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'writer-1', target: 'img-gate', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'img-gate', target: 'image-1', type: 'smoothstep', animated: true },
      { id: 'e4-6', source: 'img-gate', target: 'cover-gate', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'image-1', target: 'cover-gate', type: 'smoothstep', animated: true },
      { id: 'e6-7', source: 'cover-gate', target: 'cover-1', type: 'smoothstep', animated: true },
      { id: 'e6-8', source: 'cover-gate', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e7-8', source: 'cover-1', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e8-9', source: 'editor-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  audiobook_production: {
    id: 'client-main-2',
    name: 'Audiobook Production Flow',
    description: 'Narrative structure, optional images/e‑cover, writing, preview, and audiobook output.',
    category: 'Audio Content',
    difficulty: 'Advanced',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Audiobook Input & Settings',
          description: 'Audiobook content and narration specifications',
          role: 'story_input',
          inputFields: [
            { id: 1, name: 'Content Source', type: 'select', required: true, variable: 'content_source', options: ['write_new', 'from_transcript', 'from_text'], placeholder: 'How to create audiobook?', description: 'Write new story, convert transcript, or use existing text' },
            { id: 2, name: 'Existing Text/Transcript', type: 'textarea', required: false, variable: 'source_content', placeholder: 'Paste existing text or transcript (if using from_transcript or from_text option)', description: 'Only required if converting existing content', rows: 8 },
            { id: 3, name: 'Book Title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter audiobook title' },
            { id: 4, name: 'Author/Narrator Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Author or narrator name' },
            { id: 5, name: 'Genre', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 6, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 7, name: 'Target Duration', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts', description: 'Audiobook length (word count determines duration)' },
            { id: 8, name: 'Chapter/Track Count', type: 'select', required: true, variable: 'chapter_count', optionsSource: 'chapter_counts', description: 'Number of audio chapters/tracks' },
            { id: 9, name: 'Narration Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones', description: 'Voice tone and delivery style' },
            { id: 10, name: 'Narration Style', type: 'select', required: true, variable: 'writing_style', optionsSource: 'writing_styles', description: 'How content should sound when read aloud' },
            { id: 11, name: 'Audio Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, options: ['mp3', 'm4a', 'wav', 'audiobook'], placeholder: 'Select audio formats', description: 'Output as MP3, M4A, WAV, or packaged audiobook' },
            { id: 12, name: 'Voice Settings', type: 'textarea', required: false, variable: 'voice_settings', placeholder: 'Voice speed, pitch, accent preferences (optional)', description: 'e.g., "Medium speed, warm tone, British accent"' },
            { id: 13, name: 'Chapter Markers', type: 'checkbox', required: false, variable: 'include_chapter_markers', description: 'Add chapter navigation markers to audio' },
            { id: 14, name: 'Background Music', type: 'checkbox', required: false, variable: 'include_background_music', description: 'Add subtle background music/ambience' },
            { id: 15, name: 'Include Images', type: 'checkbox', required: false, variable: 'include_images', description: 'Generate visual companion images' },
            { id: 16, name: 'Include E‑Cover', type: 'checkbox', required: false, variable: 'include_ecover', description: 'Generate audiobook cover art' },
            { id: 17, name: 'Image Style', type: 'select', required: false, variable: 'image_style', optionsSource: 'image_styles' },
            { id: 18, name: 'E‑Cover Style', type: 'select', required: false, variable: 'ecover_style', optionsSource: 'ecover_styles' },
            { id: 19, name: 'Custom Audio Instructions', type: 'textarea', required: false, variable: 'custom_instructions', placeholder: 'Specific narration notes, pacing instructions, character voice descriptions (optional)', description: 'Guide the audio production', rows: 4 }
          ]
        }
      },
      { id: 'architect-1', type: 'process', position: { x: 400, y: 150 }, data: { label: 'Narrative Architect', description: 'Structures content for optimal audio.', role: 'narrative_architect' } },
      { id: 'writer-1', type: 'process', position: { x: 700, y: 150 }, data: { label: 'Script Writer', description: 'Writes audio-optimized script.', role: 'content_writer' } },
      { id: 'img-gate', type: 'condition', position: { x: 950, y: 150 }, data: { label: 'Imaging Gate', description: 'Route to images if enabled.', role: 'preference_router', conditions: [ { field: 'include_images', operator: 'equals', value: 'true', target: 'image-1' }, { field: 'include_images', operator: 'equals', value: 'false', target: 'cover-gate' } ] } },
      { id: 'image-1', type: 'process', position: { x: 1200, y: 100 }, data: { label: 'Image Generator', description: 'Generates illustrative images.', role: 'image_generator' } },
      { id: 'cover-gate', type: 'condition', position: { x: 1450, y: 150 }, data: { label: 'E‑Cover Gate', description: 'Route to e‑cover if enabled.', role: 'preference_router', conditions: [ { field: 'include_ecover', operator: 'equals', value: 'true', target: 'cover-1' }, { field: 'include_ecover', operator: 'equals', value: 'false', target: 'preview-1' } ] } },
      { id: 'cover-1', type: 'process', position: { x: 1700, y: 100 }, data: { label: 'E‑Cover Generator', description: 'Generates professional book cover.', role: 'ecover_generator' } },
      { id: 'preview-1', type: 'preview', position: { x: 1950, y: 150 }, data: { label: 'Audiobook Preview', description: 'Preview sample before final.', role: 'audiobook_previewer' } },
      { id: 'output-1', type: 'output', position: { x: 2200, y: 150 }, data: { label: 'Audiobook Output', description: 'Generate audiobook package.', role: 'audiobook_output' } }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'writer-1', target: 'img-gate', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'img-gate', target: 'image-1', type: 'smoothstep', animated: true },
      { id: 'e4-6', source: 'img-gate', target: 'cover-gate', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'image-1', target: 'cover-gate', type: 'smoothstep', animated: true },
      { id: 'e6-7', source: 'cover-gate', target: 'cover-1', type: 'smoothstep', animated: true },
      { id: 'e6-8', source: 'cover-gate', target: 'preview-1', type: 'smoothstep', animated: true },
      { id: 'e7-8', source: 'cover-1', target: 'preview-1', type: 'smoothstep', animated: true },
      { id: 'e8-9', source: 'preview-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  lead_magnet_report: {
    id: 'client-main-3',
    name: 'Lead Magnet Report Flow',
    description: 'Structured report with single writer, optional images/e‑cover, and pro output.',
    category: 'Business',
    difficulty: 'Professional',
    nodes: [
      {
        id: 'input-1', type: 'input', position: { x: 100, y: 200 }, data: {
          label: 'Business Requirements', description: 'Lead magnet specifications', role: 'business_input',
          inputFields: [
            { id: 1, name: 'Content Title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter report title' },
            { id: 2, name: 'Company/Author', type: 'text', required: true, variable: 'author_name', placeholder: 'Enter company/author name' },
            { id: 3, name: 'Industry', type: 'select', required: true, variable: 'industry_focus', optionsSource: 'industry_focuses' },
            { id: 4, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 5, name: 'Content Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 6, name: 'Section Count', type: 'select', required: true, variable: 'chapter_count', optionsSource: 'chapter_counts' },
            { id: 7, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 8, name: 'Writing Style', type: 'select', required: true, variable: 'writing_style', optionsSource: 'writing_styles' },
            { id: 9, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' },
            { id: 10, name: 'Include Images', type: 'checkbox', required: false, variable: 'include_images' },
            { id: 11, name: 'Include E‑Cover', type: 'checkbox', required: false, variable: 'include_ecover' },
            { id: 12, name: 'Negative Prompt', type: 'textarea', required: false, variable: 'negative_prompt', placeholder: 'Things to avoid in images' }
          ]
        } },
      { id: 'architect-1', type: 'process', position: { x: 400, y: 150 }, data: { label: 'Content Architect', description: 'Designs report structure (no full writing).', role: 'content_architect' } },
      { id: 'writer-1', type: 'process', position: { x: 700, y: 150 }, data: { label: 'Technical Writer', description: 'Writes the report.', role: 'technical_writer' } },
      { id: 'img-gate', type: 'condition', position: { x: 950, y: 150 }, data: { label: 'Imaging Gate', description: 'Route to images if enabled.', role: 'preference_router', conditions: [ { field: 'include_images', operator: 'equals', value: 'true', target: 'image-1' }, { field: 'include_images', operator: 'equals', value: 'false', target: 'cover-gate' } ] } },
      { id: 'image-1', type: 'process', position: { x: 1200, y: 100 }, data: { label: 'Image Generator', description: 'Generates supporting images/diagrams.', role: 'image_generator' } },
      { id: 'cover-gate', type: 'condition', position: { x: 1450, y: 150 }, data: { label: 'E‑Cover Gate', description: 'Route to e‑cover if enabled.', role: 'preference_router', conditions: [ { field: 'include_ecover', operator: 'equals', value: 'true', target: 'cover-1' }, { field: 'include_ecover', operator: 'equals', value: 'false', target: 'editor-1' } ] } },
      { id: 'cover-1', type: 'process', position: { x: 1700, y: 100 }, data: { label: 'E‑Cover Generator', description: 'Generates professional cover.', role: 'ecover_generator' } },
      { id: 'editor-1', type: 'process', position: { x: 1950, y: 150 }, data: { label: 'Editor', description: 'Professional editing.', role: 'editor' } },
      { id: 'output-1', type: 'output', position: { x: 2200, y: 150 }, data: { label: 'Output', description: 'Publication-ready output.', role: 'output_processor' } }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'writer-1', target: 'img-gate', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'img-gate', target: 'image-1', type: 'smoothstep', animated: true },
      { id: 'e4-6', source: 'img-gate', target: 'cover-gate', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'image-1', target: 'cover-gate', type: 'smoothstep', animated: true },
      { id: 'e6-7', source: 'cover-gate', target: 'cover-1', type: 'smoothstep', animated: true },
      { id: 'e6-8', source: 'cover-gate', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e7-8', source: 'cover-1', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e8-9', source: 'editor-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  mini_course_ebook: {
    id: 'client-main-4',
    name: 'Mini Course eBook Flow',
    description: 'Course-style eBook with single writer, optional images/e‑cover, and pro output.',
    category: 'Education',
    difficulty: 'Professional',
    nodes: [
      { id: 'input-1', type: 'input', position: { x: 100, y: 200 }, data: {
        label: 'Course Requirements', description: 'Course/eBook inputs', role: 'universal_input',
        inputFields: [
          { id: 1, name: 'Title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter course/eBook title' },
          { id: 2, name: 'Instructor', type: 'text', required: true, variable: 'author_name', placeholder: 'Enter instructor/author name' },
          { id: 3, name: 'Subject', type: 'text', required: true, variable: 'topic', placeholder: 'Main subject' },
          { id: 4, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
          { id: 5, name: 'Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
          { id: 6, name: 'Lesson Count', type: 'select', required: true, variable: 'chapter_count', optionsSource: 'chapter_counts' },
          { id: 7, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
          { id: 8, name: 'Writing Style', type: 'select', required: true, variable: 'writing_style', optionsSource: 'writing_styles' },
          { id: 9, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' },
          { id: 10, name: 'Include Images', type: 'checkbox', required: false, variable: 'include_images' },
          { id: 11, name: 'Include E‑Cover', type: 'checkbox', required: false, variable: 'include_ecover' },
          { id: 12, name: 'Negative Prompt', type: 'textarea', required: false, variable: 'negative_prompt', placeholder: 'Things to avoid in images' },
          { id: 80, name: 'Heading Font', type: 'select', required: false, variable: 'heading_font_family', optionsSource: 'font_families' },
          { id: 81, name: 'Body Font', type: 'select', required: false, variable: 'body_font_family', optionsSource: 'font_families' },
          { id: 82, name: 'Body Font Size', type: 'select', required: false, variable: 'body_font_size', optionsSource: 'body_font_sizes' }
        ]
      } },
      { id: 'architect-1', type: 'process', position: { x: 400, y: 150 }, data: { label: 'Content Architect', description: 'Designs learning structure.', role: 'content_architect' } },
      { id: 'writer-1', type: 'process', position: { x: 700, y: 150 }, data: { label: 'Technical Writer', description: 'Writes course content.', role: 'technical_writer' } },
      { id: 'img-gate', type: 'condition', position: { x: 950, y: 150 }, data: { label: 'Imaging Gate', description: 'Route to images if enabled.', role: 'preference_router', conditions: [ { field: 'include_images', operator: 'equals', value: 'true', target: 'image-1' }, { field: 'include_images', operator: 'equals', value: 'false', target: 'cover-gate' } ] } },
      { id: 'image-1', type: 'process', position: { x: 1200, y: 100 }, data: { label: 'Image Generator', description: 'Generates course visuals.', role: 'image_generator' } },
      { id: 'cover-gate', type: 'condition', position: { x: 1450, y: 150 }, data: { label: 'E‑Cover Gate', description: 'Route to e‑cover if enabled.', role: 'preference_router', conditions: [ { field: 'include_ecover', operator: 'equals', value: 'true', target: 'cover-1' }, { field: 'include_ecover', operator: 'equals', value: 'false', target: 'editor-1' } ] } },
      { id: 'cover-1', type: 'process', position: { x: 1700, y: 100 }, data: { label: 'E‑Cover Generator', description: 'Generates course cover.', role: 'ecover_generator' } },
      { id: 'editor-1', type: 'process', position: { x: 1950, y: 150 }, data: { label: 'Editor', description: 'Edits for clarity and quality.', role: 'editor' } },
      { id: 'output-1', type: 'output', position: { x: 2200, y: 150 }, data: { label: 'Output', description: 'Multi-format course output.', role: 'output_processor' } }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'writer-1', target: 'img-gate', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'img-gate', target: 'image-1', type: 'smoothstep', animated: true },
      { id: 'e4-6', source: 'img-gate', target: 'cover-gate', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'image-1', target: 'cover-gate', type: 'smoothstep', animated: true },
      { id: 'e6-7', source: 'cover-gate', target: 'cover-1', type: 'smoothstep', animated: true },
      { id: 'e6-8', source: 'cover-gate', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e7-8', source: 'cover-1', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e8-9', source: 'editor-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  biography_memoir: {
    id: 'client-main-5',
    name: 'Biography / Memoir Flow',
    description: 'Personal narrative with structure, optional images/e‑cover, single writer, and pro edit.',
    category: 'Biography',
    difficulty: 'Professional',
    nodes: [
      { id: 'input-1', type: 'input', position: { x: 100, y: 200 }, data: {
        label: 'Bio Requirements', description: 'Biography/memoir inputs', role: 'story_input',
        inputFields: [
          { id: 1, name: 'Book Title', type: 'text', required: true, variable: 'book_title', placeholder: 'Enter book title' },
          { id: 2, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Enter author name' },
          { id: 3, name: 'Genre', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
          { id: 4, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
          { id: 5, name: 'Word Count', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
          { id: 6, name: 'Chapter Count', type: 'select', required: true, variable: 'chapter_count', optionsSource: 'chapter_counts' },
          { id: 7, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
          { id: 8, name: 'Writing Style', type: 'select', required: true, variable: 'writing_style', optionsSource: 'writing_styles' },
          { id: 9, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' },
          { id: 10, name: 'Include Images', type: 'checkbox', required: false, variable: 'include_images' },
          { id: 11, name: 'Include E‑Cover', type: 'checkbox', required: false, variable: 'include_ecover' },
          { id: 12, name: 'Negative Prompt', type: 'textarea', required: false, variable: 'negative_prompt', placeholder: 'Things to avoid in images' },
          { id: 80, name: 'Heading Font', type: 'select', required: false, variable: 'heading_font_family', optionsSource: 'font_families' },
          { id: 81, name: 'Body Font', type: 'select', required: false, variable: 'body_font_family', optionsSource: 'font_families' },
          { id: 82, name: 'Body Font Size', type: 'select', required: false, variable: 'body_font_size', optionsSource: 'body_font_sizes' }
        ]
      } },
      { id: 'architect-1', type: 'process', position: { x: 400, y: 150 }, data: { label: 'Story Architect', description: 'Outlines life chapters and structure.', role: 'story_outliner' } },
      { id: 'writer-1', type: 'process', position: { x: 700, y: 150 }, data: { label: 'Content Writer', description: 'Writes the biography/memoir.', role: 'content_writer' } },
      { id: 'img-gate', type: 'condition', position: { x: 950, y: 150 }, data: { label: 'Imaging Gate', description: 'Route to images if enabled.', role: 'preference_router', conditions: [ { field: 'include_images', operator: 'equals', value: 'true', target: 'image-1' }, { field: 'include_images', operator: 'equals', value: 'false', target: 'cover-gate' } ] } },
      { id: 'image-1', type: 'process', position: { x: 1200, y: 100 }, data: { label: 'Image Generator', description: 'Generates illustrative images.', role: 'image_generator' } },
      { id: 'cover-gate', type: 'condition', position: { x: 1450, y: 150 }, data: { label: 'E‑Cover Gate', description: 'Route to e‑cover if enabled.', role: 'preference_router', conditions: [ { field: 'include_ecover', operator: 'equals', value: 'true', target: 'cover-1' }, { field: 'include_ecover', operator: 'equals', value: 'false', target: 'editor-1' } ] } },
      { id: 'cover-1', type: 'process', position: { x: 1700, y: 100 }, data: { label: 'E‑Cover Generator', description: 'Generates professional cover.', role: 'ecover_generator' } },
      { id: 'editor-1', type: 'process', position: { x: 1950, y: 150 }, data: { label: 'Editor', description: 'Professional editing.', role: 'editor' } },
      { id: 'output-1', type: 'output', position: { x: 2200, y: 150 }, data: { label: 'Output', description: 'Publication-ready output.', role: 'output_processor' } }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'writer-1', target: 'img-gate', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'img-gate', target: 'image-1', type: 'smoothstep', animated: true },
      { id: 'e4-6', source: 'img-gate', target: 'cover-gate', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'image-1', target: 'cover-gate', type: 'smoothstep', animated: true },
      { id: 'e6-7', source: 'cover-gate', target: 'cover-1', type: 'smoothstep', animated: true },
      { id: 'e6-8', source: 'cover-gate', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e7-8', source: 'cover-1', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e8-9', source: 'editor-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  // ============================================================
  // 5 PREMIUM ENTERPRISE FLOWS ⭐
  // ============================================================
  
  celebrity_style_clone: {
    id: 'premium-enterprise-1',
    name: '⭐ Celebrity Style Clone',
    description: 'Write like Stephen King, Malcolm Gladwell, or any famous author - AI mimics their voice',
    category: 'Premium Enterprise',
    difficulty: 'Premium',
    isPremium: true,
    enterpriseOnly: false,
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Style & Content Input',
          description: 'Choose celebrity style and your book topic',
          role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Celebrity Author Style', type: 'select', required: true, variable: 'celebrity_style', 
              options: ['stephen_king', 'malcolm_gladwell', 'jk_rowling', 'neil_gaiman', 'james_clear', 'brene_brown', 'tim_ferriss', 'simon_sinek', 'yuval_harari', 'michelle_obama'],
              placeholder: 'Select author style to mimic',
              description: 'AI will analyze and replicate this author writing style'
            },
            { id: 2, name: 'Your Book Topic', type: 'textarea', required: true, variable: 'topic', placeholder: 'Describe your book concept in 3-5 sentences', rows: 4 },
            { id: 3, name: 'Book Title', type: 'text', required: false, variable: 'book_title', placeholder: 'Leave blank for AI to generate in author style' },
            { id: 4, name: 'Your Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Your author name' },
            { id: 5, name: 'Genre', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 6, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 7, name: 'Book Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 8, name: 'Chapter Count', type: 'select', required: true, variable: 'chapter_count', optionsSource: 'chapter_counts' },
            { id: 9, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      {
        id: 'analyzer-1',
        type: 'process',
        position: { x: 400, y: 200 },
        data: {
          label: 'Style Analyzer',
          description: 'Analyzes celebrity author writing patterns',
          role: 'researcher',
          aiEnabled: true,
          systemPrompt: "You are a LITERARY STYLE ANALYSIS SPECIALIST. Your expertise: analyzing famous authors' writing patterns, voice, vocabulary, sentence structures, narrative techniques. Extract style DNA from the selected celebrity author.",
          userPrompt: "Analyze {celebrity_style} writing style. Extract: sentence structure patterns, vocabulary preferences, narrative voice, pacing techniques, metaphor usage, dialogue style, chapter structure. Create style guide for replication."
        }
      },
      {
        id: 'architect-1',
        type: 'process',
        position: { x: 700, y: 200 },
        data: {
          label: 'Story Architect',
          description: 'Creates book structure in celebrity style',
          role: 'story_outliner',
          aiEnabled: true,
          systemPrompt: "You are a STORY ARCHITECT specializing in celebrity author style replication. Use the style analysis to create book structure matching the celebrity author voice.",
          userPrompt: "Using {celebrity_style} style patterns, create book architecture for: {topic}. Match their chapter structure, pacing, narrative approach. Create TOC, foreword, introduction in their voice."
        }
      },
      {
        id: 'writer-1',
        type: 'process',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Celebrity Style Writer',
          description: 'Writes complete book in celebrity author voice',
          role: 'content_writer',
          aiEnabled: true,
          systemPrompt: "You are a MASTER GHOSTWRITER specializing in celebrity author voice replication. Write complete book matching {celebrity_style} exact style.",
          userPrompt: "Write complete book on {topic} in {celebrity_style} voice. Match their: sentence rhythms, vocabulary, metaphors, narrative techniques, pacing. Make it indistinguishable from their actual writing."
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Output',
          description: 'Professional book in celebrity style',
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

  transcript_to_book: {
    id: 'client-innovative-2',
    name: 'Transcript to Book',
    description: 'Transform podcast/interview transcripts into professional books',
    category: 'Content Transformation',
    difficulty: 'Professional',
    nodes: [
      {
        id: 'input-1', type: 'input', position: { x: 100, y: 200 },
        data: {
          label: 'Transcript Upload', role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Transcript Text', type: 'textarea', required: true, variable: 'transcript_content', placeholder: 'Paste podcast/interview transcript' },
            { id: 2, name: 'Book Title', type: 'text', required: false, variable: 'book_title', placeholder: 'AI will generate' },
            { id: 3, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Speaker name' },
            { id: 4, name: 'Book Type', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 5, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 6, name: 'Target Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 7, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 8, name: 'Writing Style', type: 'select', required: true, variable: 'writing_style', optionsSource: 'writing_styles' },
            { id: 9, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      { id: 'extractor-1', type: 'process', position: { x: 400, y: 200 }, data: { label: 'Insight Extractor', role: 'researcher' } },
      { id: 'architect-1', type: 'process', position: { x: 700, y: 200 }, data: { label: 'Book Architect', role: 'content_architect' } },
      { id: 'writer-1', type: 'process', position: { x: 1000, y: 200 }, data: { label: 'Content Writer', role: 'content_writer' } },
      { id: 'editor-1', type: 'process', position: { x: 1300, y: 200 }, data: { label: 'Editor', role: 'editor' } },
      { id: 'output-1', type: 'output', position: { x: 1600, y: 200 }, data: { label: 'Output', role: 'output_processor' } }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'extractor-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'extractor-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'writer-1', target: 'editor-1', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'editor-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  thread_to_ebook: {
    id: 'client-innovative-3',
    name: 'Viral Thread to eBook',
    description: 'Expand Twitter/Reddit threads into professional eBooks',
    category: 'Viral Content',
    difficulty: 'Fast',
    nodes: [
      {
        id: 'input-1', type: 'input', position: { x: 100, y: 200 },
        data: {
          label: 'Thread Content', role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Thread Content', type: 'textarea', required: true, variable: 'thread_content', placeholder: 'Paste Twitter thread, Reddit post, or LinkedIn series' },
            { id: 2, name: 'eBook Title', type: 'text', required: false, variable: 'book_title', placeholder: 'AI will generate' },
            { id: 3, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Your name' },
            { id: 4, name: 'Content Type', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 5, name: 'Target Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 6, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 7, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 8, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      { id: 'expander-1', type: 'process', position: { x: 400, y: 200 }, data: { label: 'Thread Expander', role: 'content_writer' } },
      { id: 'structure-1', type: 'process', position: { x: 700, y: 200 }, data: { label: 'Structure Optimizer', role: 'content_architect' } },
      { id: 'polish-1', type: 'process', position: { x: 1000, y: 200 }, data: { label: 'Polisher', role: 'end_to_end_polisher' } },
      { id: 'output-1', type: 'output', position: { x: 1300, y: 200 }, data: { label: 'Output', role: 'output_processor' } }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'expander-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'expander-1', target: 'structure-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'structure-1', target: 'polish-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'polish-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  expertise_extraction: {
    id: 'client-innovative-4',
    name: 'Expertise to Authority Book',
    description: 'AI interviews you, extracts expertise, creates authority positioning book',
    category: 'Thought Leadership',
    difficulty: 'Premium',
    nodes: [
      {
        id: 'input-1', type: 'input', position: { x: 100, y: 200 },
        data: {
          label: 'Expertise Questionnaire', role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Expertise Area', type: 'text', required: true, variable: 'topic', placeholder: 'e.g., "SaaS customer retention"' },
            { id: 2, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Your name' },
            { id: 3, name: 'Author Bio', type: 'textarea', required: true, variable: 'author_bio', placeholder: 'Your credentials (2-3 sentences)' },
            { id: 4, name: 'Key Insights', type: 'textarea', required: true, variable: 'key_insights', placeholder: 'Your 5-10 most important insights/frameworks' },
            { id: 5, name: 'Real Examples', type: 'textarea', required: true, variable: 'case_examples', placeholder: '2-3 real situations where you applied expertise' },
            { id: 6, name: 'Common Mistakes', type: 'textarea', required: true, variable: 'common_mistakes', placeholder: 'What mistakes do people make?' },
            { id: 7, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 8, name: 'Book Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 9, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 10, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      { id: 'synthesizer-1', type: 'process', position: { x: 400, y: 200 }, data: { label: 'Knowledge Synthesizer', role: 'researcher' } },
      { id: 'architect-1', type: 'process', position: { x: 700, y: 200 }, data: { label: 'Book Architect', role: 'content_architect' } },
      { id: 'writer-1', type: 'process', position: { x: 1000, y: 200 }, data: { label: 'Authority Writer', role: 'technical_writer' } },
      { id: 'output-1', type: 'output', position: { x: 1300, y: 200 }, data: { label: 'Output', role: 'output_processor' } }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'synthesizer-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'synthesizer-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'architect-1', target: 'writer-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'writer-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  },

  blog_to_book: {
    id: 'client-innovative-5',
    name: 'Blog to Book Compiler',
    description: 'Compile your best blog posts into a cohesive, professional book',
    category: 'Content Compilation',
    difficulty: 'Professional',
    nodes: [
      {
        id: 'input-1', type: 'input', position: { x: 100, y: 200 },
        data: {
          label: 'Blog Content Collection', role: 'universal_input',
          inputFields: [
            { id: 1, name: 'Blog Posts', type: 'textarea', required: true, variable: 'blog_content', placeholder: 'Paste 5-20 of your best blog posts' },
            { id: 2, name: 'Book Title', type: 'text', required: false, variable: 'book_title', placeholder: 'AI will create from themes' },
            { id: 3, name: 'Author Name', type: 'text', required: true, variable: 'author_name', placeholder: 'Your name' },
            { id: 4, name: 'Author Bio', type: 'textarea', required: false, variable: 'author_bio', placeholder: 'Brief bio' },
            { id: 5, name: 'Book Type', type: 'select', required: true, variable: 'genre', optionsSource: 'genres' },
            { id: 6, name: 'Target Audience', type: 'select', required: true, variable: 'target_audience', optionsSource: 'target_audiences' },
            { id: 7, name: 'Desired Length', type: 'select', required: true, variable: 'word_count', optionsSource: 'word_counts' },
            { id: 8, name: 'Tone', type: 'select', required: true, variable: 'tone', optionsSource: 'tones' },
            { id: 9, name: 'Writing Style', type: 'select', required: true, variable: 'writing_style', optionsSource: 'writing_styles' },
            { id: 10, name: 'Output Formats', type: 'select', required: true, variable: 'output_formats', multiple: true, optionsSource: 'output_formats' }
          ]
        }
      },
      { id: 'analyzer-1', type: 'process', position: { x: 400, y: 200 }, data: { label: 'Theme Analyzer', role: 'researcher' } },
      { id: 'architect-1', type: 'process', position: { x: 700, y: 200 }, data: { label: 'Book Architect', role: 'content_architect' } },
      { id: 'compiler-1', type: 'process', position: { x: 1000, y: 200 }, data: { label: 'Content Compiler', role: 'content_writer' } },
      { id: 'polish-1', type: 'process', position: { x: 1300, y: 200 }, data: { label: 'Professional Polish', role: 'editor' } },
      { id: 'output-1', type: 'output', position: { x: 1600, y: 200 }, data: { label: 'Output', role: 'output_processor' } }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'analyzer-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'analyzer-1', target: 'architect-1', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'architect-1', target: 'compiler-1', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'compiler-1', target: 'polish-1', type: 'smoothstep', animated: true },
      { id: 'e5-6', source: 'polish-1', target: 'output-1', type: 'smoothstep', animated: true }
    ]
  }
}

// Helper function to get flow by ID
export const getClientFlow = (flowId) => {
  return Object.values(CLIENT_FLOWS).find(flow => flow.id === flowId)
}

// Helper function to get flows by category
export const getClientFlowsByCategory = (category) => {
  return Object.values(CLIENT_FLOWS).filter(flow => flow.category === category)
}

// Helper function to get all flow categories
export const getClientFlowCategories = () => {
  const categories = new Set()
  Object.values(CLIENT_FLOWS).forEach(flow => categories.add(flow.category))
  return Array.from(categories).sort()
}

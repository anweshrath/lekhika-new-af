-- ====================================================================
-- COMPLETE PRESET UPDATE - ALL FIELDS POPULATED
-- Updates all existing presets to include values for ALL optional fields
-- Properly curated based on flow type and genre
-- ====================================================================

-- Fiction Novel Flow Presets (fiction_novel) - FULL IMAGING + FONTS
UPDATE client_flow_input_sets
SET variables = (
  variables || 
  jsonb_build_object(
    'include_images', true,
    'include_ecover', true,
    'image_style', CASE 
      WHEN variant_key LIKE '%fantasy%' THEN 'fantasy_art'
      WHEN variant_key LIKE '%scifi%' THEN 'sci_fi'
      WHEN variant_key LIKE '%romance%' THEN 'romantic'
      WHEN variant_key LIKE '%thriller%' THEN 'dark_moody'
      ELSE 'digital_painting'
    END,
    'art_type', 'scene',
    'aspect_ratio', '16:9',
    'camera_angle', 'eye_level',
    'lighting_style', CASE 
      WHEN variant_key LIKE '%fantasy%' THEN 'magical'
      WHEN variant_key LIKE '%scifi%' THEN 'neon'
      WHEN variant_key LIKE '%romance%' THEN 'soft'
      WHEN variant_key LIKE '%thriller%' THEN 'dramatic'
      ELSE 'natural'
    END,
    'mood', CASE 
      WHEN variant_key LIKE '%fantasy%' THEN 'epic'
      WHEN variant_key LIKE '%scifi%' THEN 'mysterious'
      WHEN variant_key LIKE '%romance%' THEN 'romantic'
      WHEN variant_key LIKE '%thriller%' THEN 'tense'
      ELSE 'neutral'
    END,
    'composition', 'rule_of_thirds',
    'negative_prompt', 'blurry, low quality, distorted, text, watermark',
    'num_images', '3',
    'ecover_layout', 'title_center',
    'ecover_style', CASE 
      WHEN variant_key LIKE '%fantasy%' THEN 'fantasy'
      WHEN variant_key LIKE '%scifi%' THEN 'sci_fi'
      WHEN variant_key LIKE '%romance%' THEN 'romance'
      WHEN variant_key LIKE '%thriller%' THEN 'thriller'
      ELSE 'modern_bold'
    END,
    'heading_font_family', 'Georgia, serif',
    'body_font_family', 'Georgia, serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'fiction_novel';

-- Fiction Story Creation Flow Presets (fiction_story_creation) - FULL IMAGING + FONTS
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'genre', CASE 
      WHEN variant_key = 'fantasy_novella' THEN 'fantasy'
      WHEN variant_key = 'scifi_mystery' THEN 'science_fiction'
      WHEN variant_key = 'romance_meet_cute' THEN 'romance'
      WHEN variant_key = 'thriller_cold_open' THEN 'thriller'
      WHEN variant_key = 'literary_vignette' THEN 'literary_fiction'
      ELSE 'fiction'
    END,
    'include_images', true,
    'include_ecover', true,
    'image_style', CASE 
      WHEN variant_key = 'fantasy_novella' THEN 'fantasy_art'
      WHEN variant_key = 'scifi_mystery' THEN 'sci_fi'
      WHEN variant_key = 'romance_meet_cute' THEN 'romantic'
      WHEN variant_key = 'thriller_cold_open' THEN 'dark_moody'
      WHEN variant_key = 'literary_vignette' THEN 'artistic'
      ELSE 'digital_painting'
    END,
    'art_type', 'scene',
    'aspect_ratio', '16:9',
    'camera_angle', 'eye_level',
    'lighting_style', CASE 
      WHEN variant_key = 'fantasy_novella' THEN 'magical'
      WHEN variant_key = 'scifi_mystery' THEN 'neon'
      WHEN variant_key = 'romance_meet_cute' THEN 'soft'
      WHEN variant_key = 'thriller_cold_open' THEN 'dramatic'
      WHEN variant_key = 'literary_vignette' THEN 'natural'
      ELSE 'natural'
    END,
    'mood', CASE 
      WHEN variant_key = 'fantasy_novella' THEN 'epic'
      WHEN variant_key = 'scifi_mystery' THEN 'mysterious'
      WHEN variant_key = 'romance_meet_cute' THEN 'romantic'
      WHEN variant_key = 'thriller_cold_open' THEN 'tense'
      WHEN variant_key = 'literary_vignette' THEN 'contemplative'
      ELSE 'neutral'
    END,
    'composition', 'rule_of_thirds',
    'negative_prompt', 'blurry, low quality, distorted, text, watermark',
    'num_images', '2',
    'ecover_layout', 'title_center',
    'ecover_style', CASE 
      WHEN variant_key = 'fantasy_novella' THEN 'fantasy'
      WHEN variant_key = 'scifi_mystery' THEN 'sci_fi'
      WHEN variant_key = 'romance_meet_cute' THEN 'romance'
      WHEN variant_key = 'thriller_cold_open' THEN 'thriller'
      WHEN variant_key = 'literary_vignette' THEN 'literary'
      ELSE 'modern'
    END,
    'heading_font_family', 'Georgia, serif',
    'body_font_family', 'Georgia, serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'fiction_story_creation';

-- Creative Writing Flow Presets (creative_writing_flow) - MINIMAL IMAGING
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'genre', CASE 
      WHEN variant_key = 'poetry_cycle' THEN 'poetry'
      WHEN variant_key = 'screenplay_beats' THEN 'screenplay'
      WHEN variant_key = 'cnf_essay' THEN 'creative_nonfiction'
      WHEN variant_key = 'flash_fiction' THEN 'flash_fiction'
      WHEN variant_key = 'novel_excerpt' THEN 'literary_fiction'
      ELSE 'creative_writing'
    END,
    'include_images', false,
    'include_ecover', false,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'mood', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', '',
    'ecover_style', '',
    'heading_font_family', 'Georgia, serif',
    'body_font_family', 'Georgia, serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'creative_writing_flow';

-- Educational Content Flow Presets (educational_content_flow) - NO IMAGING
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'author_name', 'Education Team',
    'genre', 'educational',
    'include_images', false,
    'include_ecover', false,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'mood', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', '',
    'ecover_style', '',
    'heading_font_family', 'Arial, sans-serif',
    'body_font_family', 'Arial, sans-serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'educational_content_flow';

-- Audiobook Creation Flow Presets (audiobook_creation_flow) - NO IMAGING
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'author_name', 'Audiobook Team',
    'genre', 'audiobook',
    'include_images', false,
    'include_ecover', false,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'mood', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', '',
    'ecover_style', '',
    'heading_font_family', 'Arial, sans-serif',
    'body_font_family', 'Arial, sans-serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'audiobook_creation_flow';

-- Audiobook Production Flow Presets (audiobook_production) - NO IMAGING
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'author_name', 'Audiobook Team',
    'genre', 'audiobook',
    'include_images', false,
    'include_ecover', false,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'mood', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', '',
    'ecover_style', '',
    'heading_font_family', 'Arial, sans-serif',
    'body_font_family', 'Arial, sans-serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'audiobook_production';

-- Research Analysis Flow Presets (research_analysis_flow) - NO IMAGING
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'author_name', 'Research Team',
    'genre', 'research',
    'include_images', false,
    'include_ecover', false,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'mood', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', '',
    'ecover_style', '',
    'heading_font_family', 'Arial, sans-serif',
    'body_font_family', 'Arial, sans-serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'research_analysis_flow';

-- Content Marketing Flow Presets (content_marketing_flow) - NO IMAGING
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'author_name', 'Marketing Team',
    'genre', 'marketing',
    'include_images', false,
    'include_ecover', false,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'mood', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', '',
    'ecover_style', '',
    'heading_font_family', 'Arial, sans-serif',
    'body_font_family', 'Arial, sans-serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'content_marketing_flow';

-- Complete Book Creation Flow Presets (complete_book_creation) - SELECTIVE IMAGING
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'author_name', CASE 
      WHEN variant_key LIKE '%business%' THEN 'Business Author'
      WHEN variant_key LIKE '%self_help%' THEN 'Self-Help Author'
      WHEN variant_key LIKE '%technical%' THEN 'Technical Expert'
      WHEN variant_key LIKE '%biography%' THEN 'Biographer'
      WHEN variant_key LIKE '%how_to%' THEN 'How-To Expert'
      ELSE 'Professional Author'
    END,
    'genre', CASE 
      WHEN variant_key LIKE '%business%' THEN 'business'
      WHEN variant_key LIKE '%self_help%' THEN 'self_help'
      WHEN variant_key LIKE '%technical%' THEN 'technical'
      WHEN variant_key LIKE '%biography%' THEN 'biography'
      WHEN variant_key LIKE '%how_to%' THEN 'how_to'
      ELSE 'non_fiction'
    END,
    'include_images', false,
    'include_ecover', true,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'mood', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', 'title_center',
    'ecover_style', CASE 
      WHEN variant_key LIKE '%business%' THEN 'professional'
      WHEN variant_key LIKE '%self_help%' THEN 'inspirational'
      WHEN variant_key LIKE '%technical%' THEN 'modern_clean'
      WHEN variant_key LIKE '%biography%' THEN 'classic'
      WHEN variant_key LIKE '%how_to%' THEN 'modern_bold'
      ELSE 'professional'
    END,
    'heading_font_family', 'Arial, sans-serif',
    'body_font_family', 'Arial, sans-serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'complete_book_creation';

-- Rapid Content Flow Presets (rapid_content_flow) - NO IMAGING
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'author_name', 'Content Team',
    'genre', 'content_marketing',
    'include_images', false,
    'include_ecover', false,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'mood', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', '',
    'ecover_style', '',
    'heading_font_family', 'Arial, sans-serif',
    'body_font_family', 'Arial, sans-serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'rapid_content_flow';

-- Premium Quality Flow Presets (premium_quality_flow) - MINIMAL IMAGING, E-COVER ONLY
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'author_name', 'Premium Author',
    'genre', CASE 
      WHEN variant_key LIKE '%white_paper%' THEN 'white_paper'
      WHEN variant_key LIKE '%executive%' THEN 'executive_report'
      WHEN variant_key LIKE '%thought%' THEN 'thought_leadership'
      WHEN variant_key LIKE '%research%' THEN 'research_paper'
      WHEN variant_key LIKE '%guide%' THEN 'premium_guide'
      ELSE 'non_fiction'
    END,
    'include_images', false,
    'include_ecover', true,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'mood', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', 'title_center',
    'ecover_style', 'professional',
    'heading_font_family', 'Arial, sans-serif',
    'body_font_family', 'Arial, sans-serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'premium_quality_flow';

-- Lead Magnet Report Flow Presets (lead_magnet_report) - NO IMAGING
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'author_name', 'Marketing Team',
    'genre', 'lead_magnet',
    'tone', 'professional',
    'include_images', false,
    'include_ecover', false,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', '',
    'ecover_style', '',
    'heading_font_family', 'Arial, sans-serif',
    'body_font_family', 'Arial, sans-serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'lead_magnet_report';

-- Mini Course eBook Flow Presets (mini_course_ebook) - E-COVER ONLY
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'author_name', 'Course Creator',
    'genre', 'educational',
    'tone', 'informative',
    'include_images', false,
    'include_ecover', true,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', 'title_center',
    'ecover_style', 'modern_clean',
    'heading_font_family', 'Arial, sans-serif',
    'body_font_family', 'Arial, sans-serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'mini_course_ebook';

-- Biography Memoir Flow Presets (biography_memoir) - SELECTIVE IMAGING
UPDATE client_flow_input_sets
SET variables = (
  variables::jsonb || 
  jsonb_build_object(
    'genre', 'biography',
    'include_images', false,
    'include_ecover', true,
    'image_style', '',
    'art_type', '',
    'aspect_ratio', '',
    'camera_angle', '',
    'lighting_style', '',
    'mood', '',
    'composition', '',
    'negative_prompt', '',
    'num_images', '',
    'ecover_layout', 'title_center',
    'ecover_style', 'classic',
    'heading_font_family', 'Georgia, serif',
    'body_font_family', 'Georgia, serif',
    'body_font_size', '11'
  )
)
WHERE flow_key = 'biography_memoir';

-- Verify the updates
SELECT 
  flow_key, 
  variant_key, 
  name,
  (variables::jsonb)->>'include_images' as has_images,
  (variables::jsonb)->>'include_ecover' as has_ecover,
  (variables::jsonb)->>'heading_font_family' as heading_font,
  jsonb_object_keys(variables::jsonb) as all_keys
FROM client_flow_input_sets
WHERE flow_key IN ('fiction_novel', 'fiction_story_creation')
ORDER BY flow_key, weight
LIMIT 20;


-- SURGICAL FIX: Add professional book templates system
-- Boss: Multi-tenant template system for beautiful ebook formatting

-- Step 1: Create book_templates table
CREATE TABLE IF NOT EXISTS book_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  
  -- Typography Configuration
  font_family TEXT NOT NULL,
  heading_font TEXT,
  body_font TEXT,
  chapter_font TEXT,
  
  font_size TEXT,
  heading_size TEXT,
  chapter_size TEXT,
  
  font_weight TEXT,
  heading_weight TEXT,
  chapter_weight TEXT,
  
  -- Layout Configuration
  page_size VARCHAR(50) NOT NULL,
  margins TEXT,
  line_height TEXT,
  text_align TEXT,
  
  -- Design Configuration
  color_scheme VARCHAR(50) NOT NULL,
  cover_design VARCHAR(50),
  
  -- Content Options
  include_toc BOOLEAN DEFAULT true,
  include_title_page BOOLEAN DEFAULT true,
  include_foreword BOOLEAN DEFAULT false,
  include_introduction BOOLEAN DEFAULT false,
  include_about_author BOOLEAN DEFAULT false,
  
  -- Advanced Options
  pagination BOOLEAN DEFAULT true,
  header_footer BOOLEAN DEFAULT true,
  professional_layout BOOLEAN DEFAULT true,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Insert 10 professional templates
INSERT INTO book_templates (name, category, description, font_family, heading_font, body_font, chapter_font, font_size, heading_size, chapter_size, font_weight, heading_weight, chapter_weight, page_size, margins, line_height, text_align, color_scheme, cover_design, include_toc, include_title_page) VALUES
-- Classic Novel Template
('Classic Novel', 'fiction', 'Timeless literary design with serif typography perfect for novels and literary fiction', 'Georgia, serif', 'Times New Roman, serif', 'Georgia, serif', 'Times New Roman, serif', '12pt', '36pt', '16pt', 'normal', 'bold', '600', 'A5', '1in', '1.8', 'justify', 'classic', 'minimal', true, true),

-- Modern Business Template
('Modern Business', 'business', 'Clean, professional sans-serif design for corporate and business publications', 'Helvetica, Arial, sans-serif', 'Helvetica, Arial Black, sans-serif', 'Helvetica, Arial, sans-serif', 'Helvetica, Arial, sans-serif', '11pt', '34pt', '14pt', 'normal', 'bold', '600', 'A4', '1in', '1.6', 'left', 'modern', 'professional', true, true),

-- Academic/Technical Template
('Academic Technical', 'academic', 'Traditional serif typography optimized for academic papers and technical documentation', 'Garamond, serif', 'Garamond, serif', 'Garamond, serif', 'Garamond, serif', '11pt', '32pt', '14pt', 'normal', 'bold', '600', 'Letter', '1.5in', '1.5', 'justify', 'academic', 'minimal', true, true),

-- Minimalist Template
('Minimalist', 'general', 'Ultra-clean design with generous whitespace for contemporary publishing', 'Open Sans, sans-serif', 'Open Sans, sans-serif', 'Open Sans, sans-serif', 'Open Sans, sans-serif', '10pt', '30pt', '14pt', 'light', 'bold', '500', 'A5', '1.5in', '2.0', 'left', 'minimal', 'ultra-minimal', true, true),

-- Literary Fiction Template
('Literary Fiction', 'fiction', 'Elegant typography with refined spacing for literary works', 'Crimson Text, Garamond, serif', 'Crimson Text, serif', 'Crimson Text, serif', 'Crimson Text, serif', '13pt', '36pt', '16pt', 'normal', 'bold', '600', 'A5', '1in', '1.7', 'justify', 'classic', 'elegant', true, true),

-- Self-Help Template
('Self-Help Guide', 'self-help', 'Friendly, approachable design with readable sans-serif typography', 'Inter, sans-serif', 'Inter, sans-serif', 'Inter, sans-serif', 'Inter, sans-serif', '12pt', '32pt', '15pt', 'normal', 'bold', '600', 'A5', '1in', '1.8', 'left', 'warm', 'inviting', true, true),

-- Childrens Template
('Childrens Book', 'children', 'Playful, colorful design with large, readable fonts for young readers', 'Comic Sans MS, sans-serif', 'Impact, sans-serif', 'Comic Sans MS, sans-serif', 'Impact, sans-serif', '14pt', '40pt', '18pt', 'normal', 'bold', '700', '8x10', '0.75in', '1.8', 'left', 'colorful', 'playful', true, true),

-- Poetry Template
('Poetry Collection', 'poetry', 'Centered layout with elegant typography perfect for poems and verses', 'Playfair Display, serif', 'Playfair Display, serif', 'Crimson Text, serif', 'Playfair Display, serif', '13pt', '38pt', '18pt', 'normal', 'bold', 'italic', '6x9', '1in', '2.2', 'center', 'elegant', 'minimal', false, true),

-- Corporate Template
('Corporate Report', 'business', 'Professional blue-themed design for business reports and corporate documents', 'Roboto, sans-serif', 'Roboto, sans-serif', 'Roboto, sans-serif', 'Roboto, sans-serif', '11pt', '32pt', '14pt', 'normal', 'bold', '600', 'A4', '1in', '1.7', 'justify', 'corporate', 'professional', true, true),

-- Fantasy/Sci-Fi Template
('Fantasy SciFi', 'fiction', 'Mysterious dark theme with decorative typography for genre fiction', 'Cinzel, serif', 'Cinzel, serif', 'Josefin Sans, sans-serif', 'Cinzel, serif', '12pt', '38pt', '16pt', 'normal', 'bold', '600', 'A5', '1in', '1.8', 'justify', 'dark', 'mystical', true, true)

ON CONFLICT (name) DO NOTHING;

-- Step 3: Add index for performance
CREATE INDEX IF NOT EXISTS idx_book_templates_category ON book_templates(category, is_active);
CREATE INDEX IF NOT EXISTS idx_book_templates_active ON book_templates(is_active);

-- Step 4: Add comment documentation
COMMENT ON TABLE book_templates IS 'Professional book templates for ebook formatting - applies typography, layout, and design settings';
COMMENT ON COLUMN book_templates.color_scheme IS 'Theme: classic, modern, academic, minimal, warm, colorful, elegant, corporate, dark';
COMMENT ON COLUMN book_templates.page_size IS 'Standard sizes: A5, A4, Letter, 6x9, 8x10, custom';
COMMENT ON COLUMN book_templates.is_premium IS 'Premium templates require subscription access';

-- SUCCESS: book_templates system created with 10 professional templates


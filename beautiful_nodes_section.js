// ============================================================================
// STRUCTURAL SUB-NODES (3 sub-nodes for Structural Master)
// ============================================================================

// Structural Sub-nodes using Beautiful Template
export const BlueprintDesignerNode = createBeautifulNode(
  'structural',
  'BLUEPRINT DESIGNER',
  'Structure Design',
  Building2,
  ['Visual blueprints', 'Layout planning', 'Structure templates'],
  'GPT-4o'
)

export const TemplateManagerNode = createBeautifulNode(
  'structural',
  'TEMPLATE MANAGER',
  'Template System',
  FileText,
  ['Template library', 'Dynamic templates', 'Custom layouts'],
  'Claude-3'
)

export const LayoutEngineNode = createBeautifulNode(
  'structural',
  'LAYOUT ENGINE',
  'Content Layout',
  Building2,
  ['Responsive design', 'Auto-layout', 'Style consistency'],
  'GPT-4'
)

// ============================================================================
// OUTPUT SUB-NODES (3 sub-nodes for Output Master)
// ============================================================================

// Output Sub-nodes using Beautiful Template
export const MultiFormatExporterNode = createBeautifulNode(
  'output',
  'MULTI-FORMAT EXPORTER',
  'Format Export',
  Download,
  ['PDF, DOCX, HTML', 'Custom formats', 'Batch export'],
  'GPT-4o'
)

export const PreviewGeneratorNode = createBeautifulNode(
  'output',
  'PREVIEW GENERATOR',
  'Content Preview',
  Eye,
  ['Live preview', 'Multiple views', 'Interactive preview'],
  'Claude-3'
)

export const DeliveryManagerNode = createBeautifulNode(
  'output',
  'DELIVERY MANAGER',
  'Content Delivery',
  Download,
  ['Automated delivery', 'Scheduling', 'Multi-channel'],
  'Gemini-Pro'
)

// ============================================================================
// ALCHEMIST TEMPLATE-SPECIFIC SUB-NODES (10 Content Generation Nodes)
// ============================================================================

// Content Creation Sub-nodes using Beautiful Template
export const BlogPostGeneratorNode = createBeautifulNode(
  'process',
  'BLOG POST GENERATOR',
  'Blog Content Creation',
  FileText,
  ['SEO optimization', 'Multiple formats', 'Engagement tracking'],
  'GPT-4o'
)

export const VideoScriptWriterNode = createBeautifulNode(
  'process',
  'VIDEO SCRIPT WRITER',
  'Video Content Scripts',
  FileText,
  ['Scene breakdowns', 'Hook creation', 'CTA integration'],
  'Claude-3'
)

export const CaseStudyWriterNode = createBeautifulNode(
  'process',
  'CASE STUDY WRITER',
  'Success Story Content',
  FileText,
  ['Data analysis', 'Story structure', 'Results highlighting'],
  'GPT-4'
)

export const EmailSequenceGeneratorNode = createBeautifulNode(
  'process',
  'EMAIL SEQUENCE GENERATOR',
  'Email Campaign Content',
  FileText,
  ['Drip campaigns', 'Personalization', 'A/B testing'],
  'GPT-4o'
)

export const SocialMediaGeneratorNode = createBeautifulNode(
  'process',
  'SOCIAL MEDIA GENERATOR',
  'Social Content Creation',
  FileText,
  ['Platform optimization', 'Hashtag research', 'Engagement hooks'],
  'Claude-3'
)

export const AdCopyGeneratorNode = createBeautifulNode(
  'process',
  'AD COPY GENERATOR',
  'Advertisement Content',
  FileText,
  ['Conversion optimization', 'Platform targeting', 'Creative variations'],
  'GPT-4'
)

export const SalesPageGeneratorNode = createBeautifulNode(
  'process',
  'SALES PAGE GENERATOR',
  'High-Converting Sales Copy',
  FileText,
  ['Conversion frameworks', 'Psychology triggers', 'Split testing'],
  'GPT-4o'
)

export const LandingPageGeneratorNode = createBeautifulNode(
  'process',
  'LANDING PAGE GENERATOR',
  'Landing Page Content',
  FileText,
  ['Conversion optimization', 'Lead magnets', 'CRO best practices'],
  'Claude-3'
)

export const ProductDescriptionGeneratorNode = createBeautifulNode(
  'process',
  'PRODUCT DESCRIPTION GENERATOR',
  'E-commerce Content',
  FileText,
  ['Feature highlighting', 'Benefit focus', 'SEO optimization'],
  'GPT-4'
)

export const PressReleaseGeneratorNode = createBeautifulNode(
  'process',
  'PRESS RELEASE GENERATOR',
  'Media Announcement Content',
  FileText,
  ['Media formatting', 'Newsworthy angles', 'Distribution ready'],
  'Gemini-Pro'
)




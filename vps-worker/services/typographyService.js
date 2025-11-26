/**
 * Typography Service - Professional Font Family Combinations
 * Provides 5 curated 3-font combinations for professional book formatting
 */

const TYPOGRAPHY_COMBOS = {
  classic: {
    id: 'classic',
    name: 'Classic & Traditional',
    description: 'Timeless typography perfect for academic and formal content',
    headlineFont: 'Georgia',
    subheadlineFont: 'Times New Roman', 
    bodyFont: 'Calibri',
    css: {
      headline: 'font-family: Georgia, "Times New Roman", serif; font-weight: 700;',
      subheadline: 'font-family: "Times New Roman", Times, serif; font-weight: 600;',
      body: 'font-family: Calibri, "Segoe UI", Tahoma, sans-serif; font-weight: 400;'
    },
    useCase: 'Academic papers, technical documentation, formal reports'
  },
  
  modern: {
    id: 'modern',
    name: 'Modern & Clean',
    description: 'Contemporary design with excellent readability',
    headlineFont: 'Playfair Display',
    subheadlineFont: 'Open Sans',
    bodyFont: 'Source Sans Pro',
    css: {
      headline: 'font-family: "Playfair Display", Georgia, serif; font-weight: 700;',
      subheadline: 'font-family: "Open Sans", "Helvetica Neue", sans-serif; font-weight: 600;',
      body: 'font-family: "Source Sans Pro", "Segoe UI", sans-serif; font-weight: 400;'
    },
    useCase: 'Modern business books, contemporary fiction, lifestyle content'
  },
  
  tech: {
    id: 'tech',
    name: 'Tech & Digital',
    description: 'Sleek typography optimized for digital reading',
    headlineFont: 'Montserrat',
    subheadlineFont: 'Roboto',
    bodyFont: 'Lato',
    css: {
      headline: 'font-family: Montserrat, "Helvetica Neue", sans-serif; font-weight: 700;',
      subheadline: 'font-family: Roboto, "Segoe UI", sans-serif; font-weight: 500;',
      body: 'font-family: Lato, "Segoe UI", sans-serif; font-weight: 400;'
    },
    useCase: 'Technology books, startup guides, digital marketing'
  },
  
  literary: {
    id: 'literary',
    name: 'Literary & Elegant',
    description: 'Sophisticated typography for creative and literary works',
    headlineFont: 'Crimson Text',
    subheadlineFont: 'Lora',
    bodyFont: 'Merriweather',
    css: {
      headline: 'font-family: "Crimson Text", Georgia, serif; font-weight: 700;',
      subheadline: 'font-family: Lora, Georgia, serif; font-weight: 600;',
      body: 'font-family: Merriweather, Georgia, serif; font-weight: 400;'
    },
    useCase: 'Fiction novels, poetry collections, creative writing'
  },
  
  business: {
    id: 'business',
    name: 'Business & Professional',
    description: 'Professional typography for corporate and business content',
    headlineFont: 'Inter',
    subheadlineFont: 'Poppins',
    bodyFont: 'Nunito Sans',
    css: {
      headline: 'font-family: Inter, "Segoe UI", sans-serif; font-weight: 700;',
      subheadline: 'font-family: Poppins, "Helvetica Neue", sans-serif; font-weight: 600;',
      body: 'font-family: "Nunito Sans", "Segoe UI", sans-serif; font-weight: 400;'
    },
    useCase: 'Business strategies, leadership books, professional development'
  }
}

class TypographyService {
  constructor() {
    this.defaultCombo = 'modern'
  }

  /**
   * Get all available typography combinations
   */
  getAllCombos() {
    return Object.values(TYPOGRAPHY_COMBOS)
  }

  /**
   * Get specific typography combo by ID
   */
  getCombo(comboId) {
    return TYPOGRAPHY_COMBOS[comboId] || TYPOGRAPHY_COMBOS[this.defaultCombo]
  }

  /**
   * Get CSS styles for a specific combo
   */
  getComboCSS(comboId) {
    const combo = this.getCombo(comboId)
    return combo.css
  }

  /**
   * Generate typography instructions for AI prompts
   */
  generateTypographyInstructions(comboId) {
    const combo = this.getCombo(comboId)
    
    return `
TYPOGRAPHY FORMATTING INSTRUCTIONS:
- Headlines and Main Titles: Use "${combo.headlineFont}" font family
- Chapter Titles and Subheadings: Use "${combo.subheadlineFont}" font family  
- Body Text and Paragraphs: Use "${combo.bodyFont}" font family

FORMATTING RULES:
- Apply proper heading hierarchy (H1 for main title, H2 for chapters, H3 for sections)
- Use consistent paragraph spacing
- Ensure proper line height for readability
- Apply appropriate font weights as specified above
- Maintain typography consistency throughout the document

This typography choice (${combo.name}) is optimized for: ${combo.useCase}
`
  }

  /**
   * Apply typography styles to HTML content
   */
  applyTypographyToHTML(htmlContent, comboId) {
    const combo = this.getCombo(comboId)
    
    // Create a wrapper with typography styles
    const styledHTML = `
    <div class="book-content" style="
      ${combo.css.body}
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    ">
      <style>
        .book-content h1 { ${combo.css.headline} font-size: 2.5em; margin-bottom: 0.5em; }
        .book-content h2 { ${combo.css.subheadline} font-size: 2em; margin: 1.5em 0 0.5em 0; }
        .book-content h3 { ${combo.css.subheadline} font-size: 1.5em; margin: 1.2em 0 0.3em 0; }
        .book-content h4 { ${combo.css.subheadline} font-size: 1.3em; margin: 1em 0 0.3em 0; }
        .book-content h5 { ${combo.css.subheadline} font-size: 1.1em; margin: 0.8em 0 0.2em 0; }
        .book-content h6 { ${combo.css.subheadline} font-size: 1em; margin: 0.6em 0 0.2em 0; }
        .book-content p { margin-bottom: 1em; text-align: justify; }
        .book-content .chapter-break { page-break-before: always; margin-top: 3em; }
        .book-content .title-page { text-align: center; margin: 2em 0; }
      </style>
      ${htmlContent}
    </div>
    `
    
    return styledHTML
  }

  /**
   * Get typography options for form dropdowns
   */
  getTypographyOptions() {
    return Object.values(TYPOGRAPHY_COMBOS).map(combo => ({
      value: combo.id,
      label: `${combo.name} (${combo.headlineFont} + ${combo.subheadlineFont} + ${combo.bodyFont})`,
      description: combo.description
    }))
  }
}

const typographyService = new TypographyService()

module.exports = { typographyService, TYPOGRAPHY_COMBOS }

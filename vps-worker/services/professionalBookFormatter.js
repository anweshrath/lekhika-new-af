/**
 * Professional Book Formatter Service
 * Formats generated content like a real publisher with proper typography,
 * margins, pagination, title pages, and professional layout
 */

const { getSupabase } = require('./supabase')
const { sanitizePermissions } = require('./sanitizeUtils')

class ProfessionalBookFormatter {
  constructor() {
    this.pageBreak = '\n\n<div style="page-break-before: always;"></div>\n\n'
    this.sectionBreak = '\n\n---\n\n'
  }

  /**
   * Load professional book template from database
   * Used for post-generation template application
   */
  async loadTemplate(templateName) {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('book_templates')
        .select('*')
        .eq('name', templateName)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        console.warn(`⚠️ Template "${templateName}" not found, using defaults`)
        return null
      }

      console.log(`✅ Loaded template: ${templateName}`)
      return data
    } catch (error) {
      console.error(`❌ Error loading template: ${error.message}`)
      return null
    }
  }

  /**
   * Format complete book with professional layout using dynamic formatting options
   */
  formatCompleteBook(compiledInput, userInput, format = 'html', formatOptions = {}) {
    const bookTitle = userInput.book_title || userInput.story_title || 'Generated Book'
    const authorName = userInput.author_name || 'The Author'
    const normalizedBook = this.normalizeBookData(compiledInput, userInput, formatOptions.rawContent || '')
    
    // SURGICAL: Override with template if provided
    let templateSettings = {}
    if (userInput.book_template) {
      // Template will be loaded externally and passed here
      templateSettings = formatOptions.template || {}
    }
    
    // Merge user formatting preferences with intelligent defaults
    const finalFormatOptions = {
      // Page settings
      pageSize: templateSettings.page_size || userInput.book_size || formatOptions.pageSize || 'A5',
      customSize: userInput.custom_size || formatOptions.customSize || '',
      
      // Typography
      typographyStyle: userInput.typography_style || formatOptions.typographyStyle || 'professional',
      fontFamily: templateSettings.font_family || userInput.font_family || formatOptions.fontFamily || 'Georgia, serif',
      fontSize: templateSettings.font_size || userInput.font_size || formatOptions.fontSize || '16px',
      lineHeight: templateSettings.line_height || userInput.line_height || formatOptions.lineHeight || '1.8',
      
      // Layout
      margins: templateSettings.margins || userInput.margins || formatOptions.margins || '1in',
      textAlign: templateSettings.text_align || userInput.text_align || formatOptions.textAlign || 'justify',
      
      // Design
      coverDesign: userInput.cover_design || formatOptions.coverDesign || 'minimal',
      colorScheme: templateSettings.color_scheme || userInput.color_scheme || formatOptions.colorScheme || 'classic',
      
      // Content options
      includeTOC: templateSettings.include_toc !== undefined ? templateSettings.include_toc : (userInput.include_toc !== false),
      includeForeword: templateSettings.include_foreword !== undefined ? templateSettings.include_foreword : (userInput.include_foreword !== false),
      includeIntroduction: templateSettings.include_introduction !== undefined ? templateSettings.include_introduction : (userInput.include_introduction !== false),
      includeAboutAuthor: templateSettings.include_about_author !== undefined ? templateSettings.include_about_author : (userInput.include_about_author !== false),
      
      // Advanced options
      pagination: templateSettings.pagination !== undefined ? templateSettings.pagination : (userInput.pagination !== false),
      headerFooter: templateSettings.header_footer !== undefined ? templateSettings.header_footer : (userInput.header_footer !== false),
      professionalLayout: templateSettings.professional_layout !== undefined ? templateSettings.professional_layout : (userInput.professional_layout !== false)
    }
    
    if (templateSettings.font_family) {
      console.log('📖 Using template settings from:', userInput.book_template)
    }
    console.log('📖 Using formatting options:', finalFormatOptions)
    
    switch (format.toLowerCase()) {
      case 'html':
        return this.formatAsHTML(normalizedBook, bookTitle, authorName, userInput, finalFormatOptions)
      case 'markdown':
        return this.formatAsMarkdown(normalizedBook, bookTitle, authorName, userInput, finalFormatOptions)
      case 'docx':
        return this.formatAsDocx(normalizedBook, bookTitle, authorName, userInput, finalFormatOptions)
      case 'pdf':
        return this.formatAsPDF(normalizedBook, bookTitle, authorName, userInput, finalFormatOptions)
      default:
        return this.formatAsPlainText(normalizedBook, bookTitle, authorName, userInput, finalFormatOptions)
    }
  }

  /**
   * Format as professional HTML with CSS styling
   */
  formatAsHTML(bookData, bookTitle, authorName, userInput, formatOptions) {
    const chapters = bookData.chapters || []
    const structural = bookData.structural || {}
    const forewordSection = this.renderStructuralSection(structural.foreword, 'foreword', 'Foreword')
    const introductionSection = this.renderStructuralSection(structural.introduction, 'introduction', 'Introduction')
    const tocSection = this.generateTableOfContents(structural, chapters)
    const aboutAuthorSection = userInput.author_bio ? this.generateAboutAuthor(userInput) : ''
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${bookTitle} by ${authorName}</title>
    <style>
        /* PROFESSIONAL BOOK STYLING */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${formatOptions.fontFamily};
            font-size: ${formatOptions.fontSize};
            line-height: ${formatOptions.lineHeight};
            color: ${formatOptions.colorScheme === 'dark' ? '#e2e8f0' : '#2c3e50'};
            background: ${formatOptions.colorScheme === 'dark' ? '#1a202c' : '#ffffff'};
            /* RESPONSIVE: Wide for screens, narrow for print */
            max-width: 100%;
            width: 100%;
            margin: 0 auto;
            padding: 2rem;
            text-align: ${formatOptions.textAlign};
            hyphens: auto;
        }
        
        /* RESPONSIVE CONTAINER FOR READING */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        /* TITLE PAGE */
        .title-page {
            text-align: center;
            page-break-after: always;
            padding: 3in 0;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px solid #dee2e6;
            margin: -1in;
            padding: 4in 2in;
        }
        
        .book-title {
            font-family: ${formatOptions.fontFamily};
            font-size: 3.5em;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 0.5em;
            text-transform: uppercase;
            letter-spacing: 3px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .book-subtitle {
            font-family: ${formatOptions.fontFamily};
            font-size: 1.8em;
            font-style: italic;
            color: #4a5568;
            margin-bottom: 2em;
        }
        
        .author-name {
            font-family: ${formatOptions.fontFamily};
            font-size: 2em;
            font-weight: 600;
            color: #2d3748;
            margin-top: 3em;
            border-top: 3px solid #e2e8f0;
            padding-top: 1em;
        }
        
        /* CHAPTER STYLING */
        .chapter {
            page-break-before: always;
            margin-bottom: 2em;
        }
        
        .chapter-title {
            font-family: ${formatOptions.fontFamily};
            font-size: 2.5em;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 1em;
            text-align: center;
            border-bottom: 3px solid #e2e8f0;
            padding-bottom: 0.5em;
        }
        
        .chapter-number {
            font-family: ${formatOptions.fontFamily};
            font-size: 1.2em;
            font-weight: 400;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 0.5em;
            text-align: center;
        }
        
        /* PARAGRAPH STYLING */
        p {
            margin-bottom: 1.2em;
            text-indent: 1.5em;
            orphans: 2;
            widows: 2;
        }
        
        p:first-of-type {
            text-indent: 0;
        }
        
        /* DIALOGUE STYLING */
        .dialogue {
            font-style: italic;
            margin: 1em 2em;
            color: #4a5568;
        }
        
        /* EMPHASIS STYLING */
        em, .emphasis {
            font-style: italic;
            font-weight: 500;
            color: #2d3748;
        }
        
        strong, .important {
            font-weight: 600;
            color: #1a202c;
        }
        
        /* SECTION HEADERS */
        h1, h2, h3 {
            font-family: ${formatOptions.fontFamily};
            color: #1a202c;
            margin: 2em 0 1em 0;
            page-break-after: avoid;
        }
        
        h1 { font-size: 2.2em; font-weight: 700; }
        h2 { font-size: 1.8em; font-weight: 600; }
        h3 { font-size: 1.4em; font-weight: 600; }
        
        /* TABLE OF CONTENTS */
        .toc {
            page-break-before: always;
            page-break-after: always;
        }
        
        .toc-title {
            font-family: ${formatOptions.fontFamily};
            font-size: 2.5em;
            font-weight: 700;
            text-align: center;
            margin-bottom: 2em;
            color: #1a202c;
        }
        
        .toc-entry {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.8em;
            border-bottom: 1px dotted #cbd5e0;
            padding-bottom: 0.3em;
        }
        
        .toc-title-text {
            font-weight: 500;
        }
        
        .toc-page {
            font-weight: 400;
            color: #718096;
        }
        
        /* FOREWORD/INTRODUCTION STYLING */
        .foreword, .introduction {
            page-break-before: always;
            font-style: italic;
            color: #4a5568;
        }
        
        .section-title {
            font-family: ${formatOptions.fontFamily};
            font-size: 2.2em;
            font-weight: 700;
            text-align: center;
            margin-bottom: 1.5em;
            color: #1a202c;
            font-style: normal;
        }
        
        /* ABOUT AUTHOR */
        .about-author {
            page-break-before: always;
            background: #f8f9fa;
            padding: 2em;
            border-left: 5px solid #e2e8f0;
            margin-top: 2em;
        }
        
        /* RESPONSIVE DESIGN FOR MOBILE/TABLET */
        @media screen and (max-width: 768px) {
            body {
                font-size: 16px;
                padding: 1rem;
            }
            
            .container {
                padding: 0 0.5rem;
            }
            
            .book-title {
                font-size: 2em;
                letter-spacing: 1px;
            }
            
            .chapter-title {
                font-size: 1.8em;
            }
            
            .toc-title {
                font-size: 1.8em;
            }
            
            .toc-entry {
                font-size: 0.9em;
                flex-wrap: wrap;
            }
            
            .title-page {
                padding: 2rem 1rem;
                margin: -1rem;
            }
            
            h1 { font-size: 1.8em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.2em; }
            
            p {
                text-indent: 0;
                margin-bottom: 1em;
            }
        }
        
        @media screen and (min-width: 769px) and (max-width: 1024px) {
            body {
                padding: 2rem;
            }
            
            .container {
                max-width: 900px;
            }
        }
        
        @media screen and (min-width: 1025px) {
            body {
                padding: 3rem;
            }
            
            .container {
                max-width: 1200px;
            }
        }
        
        /* PRINT STYLES - Narrow width for paper */
        @media print {
            body {
                font-size: 12pt;
                line-height: 1.6;
                max-width: ${formatOptions.pageSize === 'A4' ? '8.27in' : formatOptions.pageSize === 'A5' ? '5.83in' : '8.5in'};
                margin: 0.75in auto;
                padding: 0.75in;
            }
            
            .title-page {
                background: none;
                border: none;
            }
            
            .chapter {
                page-break-before: always;
            }
        }
        
        /* PAGE NUMBERS */
        @page {
            margin: 1in;
            @bottom-center {
                content: counter(page);
                font-family: ${formatOptions.fontFamily};
                font-size: 10pt;
                color: #718096;
            }
        }
    </style>
</head>
<body>
    <div class="container">
    ${this.generateTitlePage(bookTitle, authorName, userInput)}
    ${tocSection}
    ${forewordSection}
    ${introductionSection}
    ${this.formatChapters(chapters)}
    ${aboutAuthorSection}
    </div>
</body>
</html>`
  }

  /**
   * Generate professional title page
   */
  generateTitlePage(bookTitle, authorName, userInput) {
    const subtitle = userInput.subtitle || ''
    const genre = userInput.genre || ''
    
    return `
    <div class="title-page">
        <div class="book-title">${bookTitle}</div>
        ${subtitle ? `<div class="book-subtitle">${subtitle}</div>` : ''}
        <div class="author-name">by ${authorName}</div>
        ${genre ? `<div style="margin-top: 2em; font-size: 1.2em; color: #718096; text-transform: uppercase; letter-spacing: 1px;">${genre}</div>` : ''}
    </div>`
  }

  /**
   * Generate professional table of contents
   */
  generateTableOfContents(structural, chapters) {
    const entries = this.getTableOfContentsEntries(structural, chapters)
    if (!entries.length) return ''
    
    let toc = `
    <div class="toc">
        <div class="toc-title">Table of Contents</div>
    `
    
    entries.forEach((entry, index) => {
      const pageNum = index * 15 + 1 // Estimate 15 pages per entry
      toc += `
        <div class="toc-entry">
            <span class="toc-title-text">${entry.label}</span>
            <span class="toc-page">${pageNum}</span>
        </div>`
    })
    
    toc += `
    </div>`
    
    return toc
  }

  /**
   * Generate AI-powered foreword (NO TEMPLATES)
   */
  generateForeword(userInput) {
    // NO TEMPLATE CONTENT - Only use if user provides foreword text
    return userInput.foreword_text || ''
  }

  /**
   * Generate professional introduction (NO TEMPLATES)
   */
  generateIntroduction(userInput) {
    // NO TEMPLATE CONTENT - Only use if user provides introduction text
    return userInput.introduction_text || ''
  }

  /**
   * Format chapters with professional typography
   */
  formatChapters(chapters) {
    if (!chapters || !Array.isArray(chapters)) {
      console.error('formatChapters: Invalid chapters input')
      return ''
    }
    
    return chapters
      .filter(chapter => chapter && chapter.content && typeof chapter.content === 'string')
      .map((chapter, index) => {
        const chapterTitle = this.extractChapterTitle(chapter.content) || chapter.title || `Chapter ${chapter.chapter || index + 1}`
        const cleanContent = this.formatChapterContent(chapter.content)
        
        return `
      <div class="chapter">
          <div class="chapter-number">Chapter ${chapter.chapter || index + 1}</div>
          <div class="chapter-title">${chapterTitle}</div>
          
          ${cleanContent}
      </div>`
      }).join('')
  }

  /**
   * Format individual chapter content with proper typography
   */
  formatChapterContent(content) {
    if (!content || typeof content !== 'string') {
      console.error('formatChapterContent: Invalid content input')
      return ''
    }
    
    let formatted = content
      // SURGICAL FIX: Remove markdown placeholders and TOC garbage FIRST
      .replace(/\[Chapter\s+[^\]]+\]\(#chapter-\d+\)/gi, '') // Remove markdown links like [Chapter New Beginnings](#chapter-1)
      .replace(/^[-*]\s*\[Chapter\s+[^\]]+\]\(#chapter-\d+\)/gmi, '') // Remove TOC markdown lists
      .replace(/^#+\s*Table\s+of\s+Contents?\s*$/gmi, '') // Remove TOC headings
      .replace(/^#+\s*Lund\s*$/gmi, '') // Remove book title headings
      .replace(/^\*\*by\s+[^\*]+\*\*\s*$/gmi, '') // Remove author metadata
      .replace(/^---+\s*$/gm, '') // Remove separators
      .replace(/^#{1,3}\s*Chapter\s*\d+:\s*[^\n]*\s*$/gmi, '') // Remove chapter headers that appear in content
      // Remove duplicate chapter headers
      .replace(/^#\s*Chapter\s*\d+:.*$/gm, '')
      .replace(/^##\s*Chapter\s*\d+:.*$/gm, '')
      .replace(/^\*\*Chapter\s*\d+:.*\*\*\s*$/gm, '')
      // Format dialogue with proper styling
      .replace(/"([^"]+)"/g, '<span class="dialogue">"$1"</span>')
      // Format emphasis and important words
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Format section headers (but not chapter headers)
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Clean up excessive whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      // Convert paragraphs
      .split('\n\n')
      .filter(para => para.trim() && para.trim().length > 0)
      .map(para => `<p>${para.trim()}</p>`)
      .join('\n\n')
    
    return formatted
  }

  /**
   * Generate professional About the Author section (NO TEMPLATES)
   */
  generateAboutAuthor(userInput) {
    const authorName = userInput.author_name || 'The Author'
    const authorBio = userInput.author_bio || ''
    const authorExpertise = userInput.author_expertise || ''
    
    // Only generate if user provided bio - NO TEMPLATE FALLBACKS
    if (!authorBio) return ''
    
    return `
    <div class="about-author">
        <div class="section-title">About the Author</div>
        
        <h2>${authorName}</h2>
        
        <p>${authorBio}</p>
        
        ${authorExpertise ? 
          `<h3>Areas of Expertise</h3>
           <p><em>${authorExpertise}</em></p>` : ''
        }
    </div>`
  }


  /**
   * Extract chapter title from content - FIXED VERSION
   */
  extractChapterTitle(content) {
    if (!content) return null
    
    // If content is an object with title property, use it
    if (typeof content === 'object' && content.title) {
      return content.title
    }
    
    // If content is not a string, can't extract title
    if (typeof content !== 'string') {
      return null
    }
    
    // Try multiple patterns to extract chapter title from string
    const patterns = [
      /^#{1,2}\s*Chapter\s*\d+:\s*(.+?)(?:\n|$)/m,  // ## Chapter 1: Title
      /^Chapter\s*\d+:\s*(.+?)(?:\n|$)/m,           // Chapter 1: Title
      /^CHAPTER\s*\d+:\s*(.+?)(?:\n|$)/m,           // CHAPTER 1: Title
      /^#{1,2}\s*Chapter\s*\d+:\s*(.+?)(?:\s*$)/m   // ## Chapter 1: Title (end of line)
    ]
    
    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match && match[1] && match[1].trim()) {
        const title = match[1].trim().replace(/\*\*/g, '').trim()
        // Don't return generic titles like "Chapter 3" or "Chapter 4"
        if (!title.match(/^Chapter\s*\d+$/i)) {
          return title
        }
      }
    }
    
    return null
  }

  /**
   * Clean content of technical garbage and JSON corruption
   */
  cleanContent(content) {
    if (!content || typeof content !== 'string') {
      console.error('cleanContent: Invalid content input, type:', typeof content)
      return ''
    }
    
    return content
      // 🔐 SURGICAL FIX: Remove NODE PERMISSIONS banners and instruction text
      .replace(/(^|\n)[═=]{6,}[\s\S]*?(Only perform tasks[\s\S]*?)?[═=]{6,}\s*/gm, '\n')
      .replace(/Only perform tasks you are explicitly authorized for above\.?/gim, '')
      .replace(/⚠️\s*CRITICAL:\s*Violating these permissions.*?$/gmi, '')
      .replace(/Only perform tasks.*?authorized.*?above\.?/gim, '')
      .replace(/^\s*(?:✅|🚫)\s*(AUTHORIZED|FORBIDDEN):.*$/gmi, '')
      .replace(/^\s*⚠️\s*CRITICAL:.*$/gmi, '')
      .replace(/^\s*NODE PERMISSIONS.*$/gmi, '')
      .replace(/^\s*🔐\s*NODE PERMISSIONS.*$/gmi, '')
      .replace(/^\s*STRICTLY ENFORCED.*$/gmi, '')
      .replace(/^\s*(instructions|node instructions|permission instructions)\s*[:\-]*\s*/gmi, '')
      .replace(/You are (only|explicitly) (authorized|allowed|permitted).*?above\.?/gi, '')
      .replace(/Violating (these )?permissions.*?$/gi, '')
      // SURGICAL FIX: Remove ALL instruction contamination
      .replace(/^Only perform tasks you are explicitly authorized for above\.?\s*$/gmi, '')
      
      // Remove chapter instruction blocks completely
      .replace(/📖\s*CHAPTER\s+\d+\s+OF\s+\d+[\s\S]*?(?=\n\n|\n#|\n\*\*|$)/gmi, '')
      .replace(/^This is the (opening|final|middle) chapter\..*?$/gmi, '')
      .replace(/^Establish the story world.*?$/gmi, '')
      .replace(/^Create a compelling beginning.*?$/gmi, '')
      .replace(/^Provide a satisfying conclusion.*?$/gmi, '')
      .replace(/^Advance the plot.*?$/gmi, '')
      
      // Remove writing guidelines blocks
      .replace(/WRITING GUIDELINES:[\s\S]*?(?=\n\n|\n#|\n\*\*|$)/gmi, '')
      .replace(/^- Maintain consistency.*?$/gmi, '')
      .replace(/^- Each chapter should.*?$/gmi, '')
      .replace(/^- Avoid repetitive.*?$/gmi, '')
      .replace(/^- Include dialogue.*?$/gmi, '')
      .replace(/^- End with.*?$/gmi, '')
      
      // Remove build upon previous chapters blocks
      .replace(/BUILD UPON PREVIOUS CHAPTERS:[\s\S]*?(?=\n\n|\n#|\n\*\*|$)/gmi, '')
      .replace(/^IMPORTANT: Do not repeat.*?$/gmi, '')
      
      // Remove AI instruction acknowledgments
      .replace(/^(Okay|Understood|Sure|Certainly|Absolutely|Of course|Yes|Alright|Right|Got it),?\s+(I (will|can|understand|shall|would|am|have|should)|Let me|Here('s| is)|This (is|will be)).*?(\n\n|\n(?=[A-Z#*]))/gmi, '')
      .replace(/^I (will|can|understand|shall|would|am|have) (craft|create|write|generate|build|develop|compose|produce).*?(\n\n|\n(?=[A-Z#*]))/gmi, '')
      .replace(/^(Here is|Here's|This is|This will be).*?(\n\n|\n(?=[A-Z#*]))/gmi, '')
      
      // Remove section labels that aren't part of actual content
      .replace(/^## (Section|Part) \d+.*?$/gmi, '')
      .replace(/^### (Section|Part) \d+.*?$/gmi, '')
      
      // Remove JSON structures that leak into markdown
      .replace(/\{[^}]*"title"[^}]*\}/g, '')
      .replace(/\{[^}]*"content"[^}]*\}/g, '')
      .replace(/\{[^}]*"chapter"[^}]*\}/g, '')
      .replace(/\{[^}]*"Chapter \d+"[^}]*\}/g, '')
      .replace(/\{[^}]*"heading"[^}]*\}/g, '')
      .replace(/\{[^}]*"body"[^}]*\}/g, '')
      .replace(/\{[^}]*"word_count"[^}]*\}/g, '')
      .replace(/\{[^}]*"notes"[^}]*\}/g, '')
      .replace(/\{[^}]*"about_the_author"[^}]*\}/g, '')
      .replace(/\{[^}]*"biography"[^}]*\}/g, '')
      
      // Remove JSON metadata
      .replace(/\{[^}]*"nodeId"[^}]*\}/g, '')
      .replace(/\{[^}]*"timestamp"[^}]*\}/g, '')
      .replace(/\{[^}]*"metadata"[^}]*\}/g, '')
      
      // Remove code blocks containing JSON
      .replace(/```json\s*\{[^}]*\}\s*```/g, '')
      .replace(/```\s*\{[^}]*\}\s*```/g, '')
      
      // Remove technical annotations
      .replace(/\*\*\(Word count:.*?\)\*\*/g, '')
      .replace(/\*\*Word Count:.*?\*\*/g, '')
      
      // Clean up malformed chapter titles
      .replace(/Chapter \d+:\s*Chapter \d+/g, (match) => {
        const chapterNum = match.match(/Chapter (\d+):/)[1]
        return `Chapter ${chapterNum}:`
      })
      
      // Remove extra commas and quotes from chapter titles
      .replace(/Chapter \d+:\s*([^,\n]+),?\s*"/g, 'Chapter $1')
      .replace(/Chapter \d+:\s*([^,\n]+),?\s*$/gm, 'Chapter $1')
      
      // Clean up excessive whitespace
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{3,}/g, ' ')
      .trim()
  }

  /**
   * Parse chapters from content without external service
   * Simple, fast, reliable chapter extraction
   */
  parseChaptersFromContent(content) {
    if (!content || typeof content !== 'string') {
      console.error('parseChaptersFromContent: Invalid content input')
      return []
    }
    
    const chapters = []
    
    // Split content by chapter markers
    const chapterPattern = /(?=^(?:Chapter|CHAPTER)\s*\d+:)/gm
    const chapterSplits = content.split(chapterPattern).filter(chunk => chunk && chunk.trim())
    
    chapterSplits.forEach((chapterText, index) => {
      if (!chapterText || !chapterText.trim()) return
      
      // Extract chapter number and title
      const titleMatch = chapterText.match(/^(?:Chapter|CHAPTER)\s*(\d+):?\s*(.+?)(?:\n|$)/m)
      const chapterNumber = titleMatch ? parseInt(titleMatch[1]) : index + 1
      const chapterTitle = titleMatch && titleMatch[2] ? titleMatch[2].trim().replace(/\*\*/g, '').trim() : `Chapter ${index + 1}`
      
      // Only add if has actual content
      const trimmedContent = chapterText.trim()
      if (trimmedContent && trimmedContent.length > 50) {  // Minimum 50 chars
        chapters.push({
          chapter: chapterNumber,
          title: chapterTitle,
          content: trimmedContent,
          wordCount: trimmedContent.split(/\s+/).filter(w => w.length > 0).length
        })
      }
    })
    
    // If no chapters found, treat entire content as one chapter
    if (chapters.length === 0 && content.trim() && content.trim().length > 50) {
      chapters.push({
        chapter: 1,
        title: 'Chapter 1',
        content: content.trim(),
        wordCount: content.split(/\s+/).filter(w => w.length > 0).length
      })
    }
    
    console.log(`📚 parseChaptersFromContent: Found ${chapters.length} chapters`)
    return chapters
  }

  /**
   * Format as clean markdown - FIXED VERSION
   */
  formatAsMarkdown(bookData, bookTitle, authorName, userInput) {
    const chapters = bookData.chapters || []
    const structural = bookData.structural || {}
    let markdown = `# ${bookTitle}\n\n**by ${authorName}**\n\n---\n\n`
    
    const tocEntries = this.getTableOfContentsEntries(structural, chapters)
    if (tocEntries.length > 0) {
      markdown += `## Table of Contents\n\n`
      
      tocEntries.forEach((entry, index) => {
        const chapterNum = entry.chapter || index + 1
        markdown += `- [${entry.label}](#chapter-${chapterNum})\n`
        })
      
      markdown += `\n---\n\n`
    }
    
    // Add structural sections
    markdown += this.generateStructuralMarkdown(structural.foreword, 'Foreword')
    markdown += this.generateStructuralMarkdown(structural.introduction, 'Introduction')
    
    // Add chapters in proper order
    chapters
      .filter(chapter => chapter && chapter.content)
      .forEach((chapter, index) => {
        const chapterTitle = chapter.title || `Chapter ${chapter.chapter || index + 1}`
        const chapterNum = chapter.chapter || index + 1
        markdown += `\n\n## Chapter ${chapterNum}: ${chapterTitle}\n\n`
        markdown += this.cleanChapterContent(chapter.content)
        markdown += `\n\n---\n\n`
      })
    
    markdown += this.generateAboutAuthorMarkdown(userInput)
    
    return markdown
  }

  /**
   * Format as PDF (returns clean text that can be converted to PDF)
   */
  formatAsPDF(bookData, bookTitle, authorName, userInput, formatOptions) {
    // Return clean, formatted text for PDF generation
    return this.formatAsPlainText(bookData, bookTitle, authorName, userInput, formatOptions)
  }

  /**
   * Format as DOCX (returns clean text for Word document)
   */
  formatAsDocx(bookData, bookTitle, authorName, userInput, formatOptions) {
    // Return clean, formatted text for DOCX generation
    return this.formatAsPlainText(bookData, bookTitle, authorName, userInput, formatOptions)
  }

  /**
   * Format as EPUB (returns clean text for eBook)
   */
  formatAsEpub(bookData, bookTitle, authorName, userInput, formatOptions) {
    // Return clean, formatted text for EPUB generation
    return this.formatAsPlainText(bookData, bookTitle, authorName, userInput, formatOptions)
  }

  /**
   * Format as plain text with proper formatting
   */
  formatAsPlainText(bookData, bookTitle, authorName, userInput, formatOptions) {
    if (!bookData) return ''
    // Return clean narrative content
    const narrative = bookData.narrative || ''
    // Clean it one more time to ensure no permissions contamination
    const cleaned = this.cleanContent(narrative)
    // Apply sanitizePermissions to remove any remaining permission text
    return sanitizePermissions(cleaned)
  }

  /**
   * Clean chapter content of technical garbage
   */
  cleanChapterContent(content) {
    if (!content || typeof content !== 'string') {
      console.error('cleanChapterContent: Invalid content input')
      return ''
    }
    
    return content
      .replace(/^#\s*Chapter\s*\d+:.*$/gm, '')
      .replace(/^##\s*Chapter\s*\d+:.*$/gm, '')
      .replace(/\*\*\(Word count:.*?\)\*\*/g, '')
      .replace(/\*\*Word Count:.*?\*\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // Additional helper methods for different formats...
  generateForewordMarkdown(userInput) {
    // NO TEMPLATE CONTENT - Return empty string or AI-generated content
    return ''
  }

  generateIntroductionMarkdown(userInput) {
    // NO TEMPLATE CONTENT - Return empty string or AI-generated content
    return ''
  }

  generateAboutAuthorMarkdown(userInput) {
    // NO TEMPLATE CONTENT - Return empty string or AI-generated content
    return ''
  }

  renderStructuralSection(content, className, label) {
    if (!content || typeof content !== 'string' || content.trim().length < 20) {
      return ''
    }

    const paragraphs = content
      .split(/\n{2,}/)
      .map(para => para.trim())
      .filter(Boolean)
      .map(para => `<p>${para}</p>`)
      .join('\n')

    return `
    <div class="${className}">
        <div class="section-title">${label}</div>
        ${paragraphs}
    </div>`
  }

  generateStructuralMarkdown(content, label) {
    if (!content || typeof content !== 'string' || !content.trim()) {
      return ''
    }
    return `\n\n## ${label}\n\n${content.trim()}\n\n`
  }

  getTableOfContentsEntries(structural, chapters) {
    if (structural?.tableOfContentsList && structural.tableOfContentsList.length > 0) {
      return structural.tableOfContentsList
        .map(item => item && item.toString().trim())
        .filter(Boolean)
        .map((entry, index) => ({
          label: entry.replace(/^\d+\.\s*/, ''),
          chapter: index + 1
        }))
    }

    if (structural?.tableOfContents) {
      return structural.tableOfContents
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map((entry, index) => ({
          label: entry.replace(/^\d+\.\s*/, ''),
          chapter: index + 1
        }))
    }

    // SURGICAL FIX: Use actual chapter titles, filter out invalid chapters
    return (chapters || [])
      .filter(chapter => chapter && (chapter.title || chapter.label)) // Only include chapters with titles
      .map((chapter, index) => {
        const chapterNum = chapter.chapter || index + 1
        // Use title from chapter object, or extract from label if title is missing
        const title = chapter.title || 
                     (chapter.label ? chapter.label.replace(/^Chapter\s+\d+:\s*/i, '').trim() : null) ||
                     null
        
        // If still no title, skip this chapter (don't use placeholder)
        if (!title || !title.trim()) {
          console.warn(`⚠️ Skipping chapter ${chapterNum} in TOC - no title available`)
          return null
        }
        
        return {
          label: `Chapter ${chapterNum}: ${title.trim()}`,
          chapter: chapterNum
        }
      })
      .filter(Boolean) // Remove null entries
  }

  normalizeBookData(compiledInput, userInput, rawContentFallback = '') {
    if (!compiledInput) {
      const fallbackNarrative = rawContentFallback ? this.cleanContent(rawContentFallback) : ''
      return {
        chapters: fallbackNarrative ? this.parseChaptersFromContent(fallbackNarrative) : [],
        structural: {},
        narrative: fallbackNarrative
      }
    }

    if (typeof compiledInput === 'string') {
      const cleaned = this.cleanContent(compiledInput)
      return {
        chapters: this.parseChaptersFromContent(cleaned),
        structural: {},
        narrative: cleaned
      }
    }

    const sections = Array.isArray(compiledInput.sections) ? compiledInput.sections : []
    // SURGICAL FIX: Use actual section titles - no placeholders
    // Filter out sections without titles OR extract titles from content
    const chapters = sections
      .filter(section => section && typeof section.content === 'string' && section.content.trim().length > 0)
      .map((section, index) => {
        const sanitized = this.cleanContent(section.content || '')
        // SURGICAL FIX: Extract title from content if not provided
        let chapterTitle = section.title || section.metadata?.title
        if (!chapterTitle || !chapterTitle.trim()) {
          // Try to extract title from content
          const extractedTitle = this.extractChapterTitle(sanitized)
          if (extractedTitle && extractedTitle.trim()) {
            chapterTitle = extractedTitle.trim()
            console.log(`📖 Extracted chapter title from content: "${chapterTitle}"`)
          } else {
            // Skip if no title available - don't use placeholder
            console.warn(`⚠️ Skipping section ${index + 1} in normalizeBookData - no title available`)
            return null
          }
        }
        return {
          chapter: section.chapterNumber || index + 1,
          title: chapterTitle.trim(),
          content: sanitized,
          metadata: section.metadata || {}
        }
      })
      .filter(Boolean) // Remove null entries

    const structural = {
      foreword: (compiledInput.structural?.foreword || '').trim(),
      introduction: (compiledInput.structural?.introduction || '').trim(),
      tableOfContents: (compiledInput.structural?.tableOfContents || '').trim(),
      tableOfContentsList: Array.isArray(compiledInput.structural?.tableOfContentsList)
        ? compiledInput.structural.tableOfContentsList.filter(Boolean)
        : null
    }

    const narrative = chapters.length > 0
      ? chapters.map(chapter => `Chapter ${chapter.chapter}: ${chapter.title}\n\n${this.cleanChapterContent(chapter.content)}`).join('\n\n')
      : (rawContentFallback ? this.cleanContent(rawContentFallback) : '')

    return {
      chapters,
      structural,
      narrative
    }
  }
}

const professionalBookFormatter = new ProfessionalBookFormatter()

module.exports = { professionalBookFormatter }

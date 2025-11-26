/**
 * Professional Book Formatter Service
 * Formats generated content like a real publisher with proper typography,
 * margins, pagination, title pages, and professional layout
 */

class ProfessionalBookFormatter {
  constructor() {
    this.pageBreak = '\n\n<div style="page-break-before: always;"></div>\n\n'
    this.sectionBreak = '\n\n---\n\n'
  }

  /**
   * Format complete book with professional layout using dynamic formatting options
   */
  formatCompleteBook(compiledInput, userInput, format = 'html', formatOptions = {}) {
    const bookTitle = userInput.book_title || userInput.story_title || 'Generated Book'
    const authorName = userInput.author_name || 'The Author'
    const normalizedBook = this.normalizeBookData(compiledInput, userInput, formatOptions.rawContent || '')
    
    // Merge user formatting preferences with intelligent defaults
    const finalFormatOptions = {
      // Page settings
      pageSize: userInput.book_size || formatOptions.pageSize || 'A5',
      customSize: userInput.custom_size || formatOptions.customSize || '',
      
      // Typography
      typographyStyle: userInput.typography_style || formatOptions.typographyStyle || 'professional',
      fontFamily: userInput.font_family || formatOptions.fontFamily || 'Georgia, serif',
      fontSize: userInput.font_size || formatOptions.fontSize || '16px',
      lineHeight: userInput.line_height || formatOptions.lineHeight || '1.8',
      
      // Layout
      margins: userInput.margins || formatOptions.margins || '1in',
      textAlign: userInput.text_align || formatOptions.textAlign || 'justify',
      
      // Design
      coverDesign: userInput.cover_design || formatOptions.coverDesign || 'minimal',
      colorScheme: userInput.color_scheme || formatOptions.colorScheme || 'classic',
      
      // Content options
      includeTOC: userInput.include_toc !== false,
      includeForeword: userInput.include_foreword !== false,
      includeIntroduction: userInput.include_introduction !== false,
      includeAboutAuthor: userInput.include_about_author !== false,
      
      // Advanced options
      pagination: userInput.pagination !== false,
      headerFooter: userInput.header_footer !== false,
      professionalLayout: userInput.professional_layout !== false
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
        return this.formatAsPlainText(normalizedBook)
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
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Source+Sans+Pro:wght@400;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: '${formatOptions.fontFamily}', serif;
            font-size: ${formatOptions.fontSize};
            line-height: ${formatOptions.lineHeight};
            color: ${formatOptions.colorScheme === 'dark' ? '#e2e8f0' : '#2c3e50'};
            background: ${formatOptions.colorScheme === 'dark' ? '#1a202c' : '#ffffff'};
            max-width: ${formatOptions.pageSize === 'A4' ? '8.27in' : formatOptions.pageSize === 'A5' ? '5.83in' : '8.5in'};
            margin: 0 auto;
            padding: ${formatOptions.margins};
            text-align: ${formatOptions.textAlign};
            hyphens: auto;
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
            font-family: 'Source Sans Pro', sans-serif;
            font-size: 3.5em;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 0.5em;
            text-transform: uppercase;
            letter-spacing: 3px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .book-subtitle {
            font-family: 'Crimson Text', serif;
            font-size: 1.8em;
            font-style: italic;
            color: #4a5568;
            margin-bottom: 2em;
        }
        
        .author-name {
            font-family: 'Source Sans Pro', sans-serif;
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
            font-family: 'Source Sans Pro', sans-serif;
            font-size: 2.5em;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 1em;
            text-align: center;
            border-bottom: 3px solid #e2e8f0;
            padding-bottom: 0.5em;
        }
        
        .chapter-number {
            font-family: 'Source Sans Pro', sans-serif;
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
            font-family: 'Source Sans Pro', sans-serif;
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
            font-family: 'Source Sans Pro', sans-serif;
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
            font-family: 'Source Sans Pro', sans-serif;
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
        
        /* PRINT STYLES */
        @media print {
            body {
                font-size: 12pt;
                line-height: 1.6;
                margin: 0.75in;
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
                font-family: 'Source Sans Pro', sans-serif;
                font-size: 10pt;
                color: #718096;
            }
        }
    </style>
</head>
<body>
    ${this.generateTitlePage(bookTitle, authorName, userInput)}
    ${tocSection}
    ${forewordSection}
    ${introductionSection}
    ${this.formatChapters(chapters)}
    ${aboutAuthorSection}
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
      // Remove duplicate chapter headers
      .replace(/^#\s*Chapter\s*\d+:.*$/gm, '')
      .replace(/^##\s*Chapter\s*\d+:.*$/gm, '')
      
      // Format dialogue with proper styling
      .replace(/"([^"]+)"/g, '<span class="dialogue">"$1"</span>')
      
      // Format emphasis and important words
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      
      // Format section headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      
      // Convert paragraphs
      .split('\n\n')
      .filter(para => para.trim())
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
    return this.formatAsPlainText(bookData)
  }

  /**
   * Format as DOCX (returns clean text for Word document)
   */
  formatAsDocx(bookData, bookTitle, authorName, userInput, formatOptions) {
    // Return clean, formatted text for DOCX generation
    return this.formatAsPlainText(bookData)
  }

  /**
   * Format as EPUB (returns clean text for eBook)
   */
  formatAsEpub(bookData, bookTitle, authorName, userInput, formatOptions) {
    // Return clean, formatted text for EPUB generation
    return this.formatAsPlainText(bookData)
  }

  /**
   * Format as plain text with proper formatting
   */
  formatAsPlainText(bookData) {
    return (bookData && bookData.narrative) || ''
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
    return ''
  }

  generateIntroductionMarkdown(userInput) {
    return ''
  }

  generateAboutAuthorMarkdown(userInput) {
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

    return (chapters || []).map((chapter, index) => ({
      label: `Chapter ${chapter.chapter || index + 1}: ${chapter.title || `Chapter ${chapter.chapter || index + 1}`}`,
      chapter: chapter.chapter || index + 1
    }))
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
    const chapters = sections
      .filter(section => section && typeof section.content === 'string' && section.content.trim().length > 0)
      .map((section, index) => {
        const sanitized = this.cleanContent(section.content || '')
        return {
          chapter: section.chapterNumber || index + 1,
          title: section.title || section.metadata?.title || `Chapter ${section.chapterNumber || index + 1}`,
          content: sanitized,
          metadata: section.metadata || {}
        }
      })

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

export const professionalBookFormatter = new ProfessionalBookFormatter()

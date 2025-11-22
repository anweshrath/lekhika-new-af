const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } = require('docx')
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
// TEMPORARILY DISABLED: epub-gen is a Node.js library and cannot run in browser
// const EPub = require('epub-gen')

class ExportService {
  /**
   * Strip markdown formatting from content for clean professional output
   */
  stripMarkdown(text) {
    if (!text || typeof text !== 'string') return text
    
    return text
      // Remove bold (**text** or __text__)
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      // Remove italic (*text* or _text_)
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      // Remove headers (# ## ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove strikethrough (~~text~~)
      .replace(/~~(.+?)~~/g, '$1')
      // Remove inline code (`text`)
      .replace(/`(.+?)`/g, '$1')
      // Remove links but keep text [text](url)
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Clean up any remaining special chars
      .trim()
  }

  cleanContentForExport(content) {
    if (!content || typeof content !== 'string') return content
    
    // Remove instruction text that leaks into content
    let cleaned = content
      .replace(/Only perform tasks you are explicitly authorized for above\.?/gi, '')
      .replace(/⚠️\s*CRITICAL:\s*Violating these permissions.*?$/gmi, '')
      .replace(/Only perform tasks.*?authorized.*?above\.?/gi, '')
      .replace(/(^|\n)[═=]{6,}[\s\S]*?(Only perform tasks[\s\S]*?)?[═=]{6,}\s*/g, '\n')
      .replace(/^\s*(?:✅|🚫)\s*(AUTHORIZED|FORBIDDEN):.*$/gmi, '')
      .replace(/^\s*⚠️\s*CRITICAL:.*$/gmi, '')
      .replace(/^\s*NODE PERMISSIONS.*$/gmi, '')
      .replace(/^\s*🔐\s*NODE PERMISSIONS.*$/gmi, '')
    
    // Use same cleaning logic as professionalBookFormatter
    cleaned = cleaned
      .replace(/^(Introduction|Section|Part|Chapter Summary|Transition|Closing|Epilogue):\s*[^\n]*/gm, '')
      .replace(/^(Setting the Stage|The Last Note|Reflection).*$/gm, '')
      .replace(/\{[^}]*"[^"]*"[^}]*\}/g, '')
      .replace(/\*\*\(Word count:.*?\)\*\*/gi, '')
      .replace(/by Unknown Author/g, '')
      .replace(/Powered by Lekhika AI/g, '')
      .replace(/\d{4}-\d{2}-\d{2}/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    
    return cleaned
  }

  async generateDOCX(compiledContent) {
    try {
      // SURGICAL FIX: Check if beautiful formatted content is provided
      if (compiledContent.beautifulContent && compiledContent.typographyPrefs) {
        console.log('📝 SURGICAL DOCX: Using beautiful pre-formatted content')
        return await this.generateDOCXFromBeautifulContent(compiledContent)
      }
      
      // FALLBACK: Legacy method for backward compatibility
      console.log('📝 DOCX: Using legacy section processing (fallback)')
      // Extract dynamic metadata - NO HARDCODED FALLBACKS
      const title = compiledContent.userInput?.book_title || 
                    compiledContent.userInput?.story_title || 
                    'Untitled'
      const author = compiledContent.userInput?.author_name || 'Unknown Author'
      const aboutAuthor = compiledContent.userInput?.about_author
      const aboutAuthorPosition = String(compiledContent.userInput?.about_author_position || 'end').toLowerCase()
      const fontFamily = compiledContent.userInput?.typography_combo || 
                        compiledContent.userInput?.font_family || 
                        'Georgia'
      
      // Map web fonts to Word-compatible fonts
      let docxFont = 'Georgia'
      if (fontFamily.toLowerCase().includes('arial') || fontFamily.toLowerCase().includes('helvetica') || fontFamily.toLowerCase().includes('sans')) {
        docxFont = 'Arial'
      } else if (fontFamily.toLowerCase().includes('courier') || fontFamily.toLowerCase().includes('mono')) {
        docxFont = 'Courier New'
      } else if (fontFamily.toLowerCase().includes('times')) {
        docxFont = 'Times New Roman'
      }
      
      // Flatten sections - handle both arrays and strings
      // STANDARDIZED: All sections now have title, chapterNumber, and content from compileWorkflowContent
      let flatSections = []
      const rawSections = compiledContent.sections || []
      
      console.log(`🔍 DOCX FLATTENING DEBUG: Raw sections count: ${rawSections.length}`)
      
      rawSections.forEach((section, idx) => {
        console.log(`🔍 Section ${idx + 1}:`, {
          hasTitle: !!section.title,
          title: section.title,
          contentType: typeof section.content,
          contentLength: typeof section.content === 'string' ? section.content.length : 'NOT_STRING',
          hasContent: typeof section.content === 'string' && section.content.trim().length > 0,
          chapterNumber: section.chapterNumber,
          isArray: Array.isArray(section.content)
        })
        
        if (Array.isArray(section.content)) {
          // Multi-chapter array - add each chapter
          section.content.forEach(ch => {
            // SURGICAL FIX: Use actual title - no placeholders
            const chapterTitle = ch.title || section.title
            if (!chapterTitle || !chapterTitle.trim()) {
              console.warn(`⚠️ Skipping chapter in DOCX - missing title`)
              return
            }
            flatSections.push({
              title: chapterTitle.trim(),
              content: this.cleanContentForExport(ch.content || ''),
              metadata: { 
                chapterNumber: ch.chapter || section.chapterNumber || flatSections.length + 1,
                ...(section.metadata || {})
              }
            })
          })
        } else if (typeof section.content === 'string' && section.content.trim()) {
          // STANDARDIZED: Use title and chapterNumber from standardized structure
          const cleanedContent = this.cleanContentForExport(section.content)
          console.log(`🔍 Section ${idx + 1} cleaned content length: ${cleanedContent.length}`)
          
          // SURGICAL FIX: Use actual section.title - no placeholders
          if (!section.title || !section.title.trim()) {
            console.warn(`⚠️ Skipping section ${idx + 1} in DOCX - missing title`)
            return
          }
          flatSections.push({
            title: section.title.trim(),
            content: cleanedContent,
            metadata: { 
              chapterNumber: section.chapterNumber || section.metadata?.chapterNumber || section.metadata?.chapter || (idx + 1),
              ...(section.metadata || {})
            }
          })
        } else {
          console.warn(`⚠️ Section ${idx + 1} skipped - content type: ${typeof section.content}, has content: ${!!section.content}`)
        }
      })
      
      const sections = flatSections
      
      console.log(`🔍 DOCX FLATTENING RESULT: ${sections.length} sections after flattening`)
      
      if (sections.length === 0) {
        console.error('❌ DOCX FLATTENING FAILED:')
        console.error('  Raw sections:', rawSections.length)
        console.error('  Raw sections details:', rawSections.map((s, i) => ({
          idx: i,
          title: s.title,
          contentType: typeof s.content,
          contentLength: typeof s.content === 'string' ? s.content.length : 0
        })))
        throw new Error('No valid chapters extracted for DOCX generation')
      }
      
      console.log(`📝 Generating DOCX: "${title}" by ${author}`)
      console.log(`📝 Flattened ${sections.length} chapters from ${rawSections.length} raw sections`)
      
      // Build document children array
      const documentChildren = []
      
      // ============================================================
      // TITLE PAGE
      // ============================================================
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 48,
              font: docxFont
            })
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400
          }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: `by ${author}`,
              italics: true,
              size: 32,
              font: docxFont
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 600
          }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${new Date().toLocaleDateString()}`,
              size: 20,
              font: docxFont
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 800
          }
        })
      )

      // Optional branding block on DOCX title page (controlled by user input)
      if (compiledContent.userInput?.include_branding && (compiledContent.userInput?.branding_text || '').trim().length > 0) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: compiledContent.userInput.branding_text.trim(),
                size: 20,
                font: docxFont
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400
            }
          })
        )
      }
      
      // ============================================================
      // TABLE OF CONTENTS
      // ============================================================
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Table of Contents',
              bold: true,
              size: 36,
              font: docxFont
            })
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 400,
            after: 300
          },
          pageBreakBefore: true
        })
      )
      
      // SURGICAL FIX: Use structural.tableOfContentsList if available (from Story Architect)
      // Otherwise build TOC from sections - no placeholders
      const tableOfContentsList = compiledContent.structural?.tableOfContentsList
      if (tableOfContentsList && Array.isArray(tableOfContentsList) && tableOfContentsList.length > 0) {
        // Use TOC entries from Story Architect - single source of truth
        tableOfContentsList.forEach((entry, idx) => {
          if (entry && entry.toString().trim()) {
            const cleanEntry = entry.toString().trim().replace(/^\d+\.\s*/, '') // Remove leading numbers
            documentChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${idx + 1}. ${cleanEntry}`,
                    size: 24,
                    font: docxFont
                  })
                ],
                spacing: {
                  after: 100
                }
              })
            )
          }
        })
      } else if (compiledContent.structural?.tableOfContents) {
        // Fallback: Use TOC string from Structural Node
        const tocLines = compiledContent.structural.tableOfContents.split('\n').filter(line => line.trim())
        tocLines.forEach((line, idx) => {
          const cleanLine = this.stripMarkdown(line.trim())
          if (cleanLine.length > 0) {
            documentChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${idx + 1}. ${cleanLine}`,
                    size: 24,
                    font: docxFont
                  })
                ],
                spacing: {
                  after: 100
                }
              })
            )
          }
        })
      } else {
        // Fallback: Build TOC from structural sections and chapters
        // Include Foreword/Introduction if available
        if (compiledContent.structural?.foreword) {
          documentChildren.push(
            new Paragraph({
              children: [ new TextRun({ text: 'Foreword', size: 24, font: docxFont }) ],
              spacing: { after: 100 }
            })
          )
        }
        if (compiledContent.structural?.introduction) {
          documentChildren.push(
            new Paragraph({
              children: [ new TextRun({ text: 'Introduction', size: 24, font: docxFont }) ],
              spacing: { after: 100 }
            })
          )
        }
        // SURGICAL FIX: Use actual section titles - no placeholders
        sections.forEach((section) => {
          if (!section.title || !section.title.trim()) {
            console.warn(`⚠️ Skipping section in DOCX TOC - missing title`)
            return
          }
          const chapterTitle = this.stripMarkdown(section.title.trim())
          const chapterNum = section.metadata?.chapterNumber || section.chapterNumber || 1
          
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${chapterNum}. ${chapterTitle}`,
                  size: 24,
                  font: docxFont
                })
              ],
              spacing: {
                after: 100
              }
            })
          )
        })
      }
      
        // Optionally include About Author in TOC if content is present and position is 'end' (to mirror final placement)
        if (aboutAuthor && aboutAuthor.trim() && aboutAuthorPosition === 'end') {
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'About the Author',
                  size: 24,
                  font: docxFont
                })
              ],
              spacing: { after: 100 }
            })
          )
      }
      
      // ============================================================
      // FOREWORD (only if generated by Structural Node)
      // ============================================================
      if (compiledContent.structural?.foreword) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Foreword',
                bold: true,
                size: 36,
                font: docxFont
              })
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 400,
              after: 300
            },
            pageBreakBefore: true
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: compiledContent.structural.foreword,
                size: 24,
                font: docxFont
              })
            ],
            spacing: {
              after: 400
            }
          })
        )
      }
      
      // ============================================================
      // INTRODUCTION (only if generated by Structural Node)
      // ============================================================
      if (compiledContent.structural?.introduction) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Introduction',
                bold: true,
                size: 36,
                font: docxFont
              })
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 400,
              after: 300
            },
            pageBreakBefore: true
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: compiledContent.structural.introduction,
                size: 24,
                font: docxFont
              })
            ],
            spacing: {
              after: 400
            }
          })
        )
      }
      
      // ============================================================
      // ABOUT THE AUTHOR (optional, position: start)
      // ============================================================
      if (aboutAuthor && aboutAuthor.trim() && aboutAuthorPosition === 'start') {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'About the Author',
                bold: true,
                size: 32,
                font: docxFont
              })
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 400,
              after: 300
            },
            pageBreakBefore: true
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: aboutAuthor,
                size: 24,
                font: docxFont
              })
            ],
            spacing: {
              after: 200
            },
            alignment: AlignmentType.JUSTIFIED
          })
        )
      }
      
      // ============================================================
      // CHAPTERS
      // ============================================================
      sections.forEach((section, index) => {
        // SURGICAL FIX: Use actual section.title - no placeholders
        if (!section.title || !section.title.trim()) {
          console.warn(`⚠️ Skipping section in DOCX - missing title`)
          return
        }
        const chapterTitle = this.stripMarkdown(section.title.trim())
        const chapterNum = section.metadata?.chapterNumber || section.chapterNumber || (index + 1)
        const chapterContent = section.content || ''
        
        if (!chapterContent || !chapterContent.trim()) {
          console.warn(`⚠️ Warning: Chapter ${chapterNum} has empty content`)
          return
        }
        
        // Chapter title - clean and professional
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: chapterTitle,
                bold: true,
                size: 32,
                font: docxFont
              })
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 400
            },
            pageBreakBefore: true
          })
        )
        
        // Optional chapter images (data URLs only)
        try {
          const imgs = (compiledContent.assets?.images || []).filter(img => (img.chapter || chapterNum) === chapterNum)
          imgs.forEach((img) => {
            if (typeof img.url === 'string' && img.url.startsWith('data:')) {
              const base64 = String(img.url).split(',')[1]
              const binary = atob(base64)
              const len = binary.length
              const bytes = new Uint8Array(len)
              for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
              const ab = bytes.buffer
              documentChildren.push(
                new Paragraph({
                  children: [ new ImageRun({ data: ab, transformation: { width: 480, height: 320 } }) ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.CENTER
                })
              )
            } else if (img.url) {
              documentChildren.push(
                new Paragraph({
                  children: [ new TextRun({ text: `[image] ${img.url}`, size: 20, font: docxFont }) ],
                  spacing: { after: 100 },
                  alignment: AlignmentType.CENTER
                })
              )
            }
          })
        } catch (e) {
          console.warn('⚠️ DOCX image embed warning:', e?.message)
        }

        // Chapter content - split into paragraphs and strip markdown
        const cleanContent = this.stripMarkdown(chapterContent)
        const paragraphs = cleanContent.split('\n\n').filter(p => p.trim())
        
        paragraphs.forEach((paragraph) => {
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph.trim(),
                  size: 24,
                  font: docxFont
                })
              ],
              spacing: {
                after: 200
              },
              alignment: AlignmentType.JUSTIFIED
            })
          )
        })
      })
      
      // ============================================================
      // ABOUT THE AUTHOR (optional, position: end)
      // ============================================================
      if (aboutAuthor && aboutAuthor.trim() && aboutAuthorPosition !== 'start') {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'About the Author',
                bold: true,
                size: 32,
                font: docxFont
              })
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 400,
              after: 300
            },
            pageBreakBefore: true
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: aboutAuthor,
                size: 24,
                font: docxFont
              })
            ],
            spacing: {
              after: 200
            },
            alignment: AlignmentType.JUSTIFIED
          })
        )
      }
      
      // Create document
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: documentChildren
        }]
      })
      
      console.log('✅ DOCX document structure created')
      
      // Generate blob
      const buffer = await Packer.toBuffer(doc)
      
      console.log('✅ DOCX generated successfully, size:', buffer.length, 'bytes')
      
      // Return URL for consistency with PDF and EPUB
      return {
        data: buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        encoding: 'buffer'
      }
      
    } catch (error) {
      console.error('❌ DOCX generation failed:', error.message)
      console.error('Error details:', error)
      
      // DO NOT FALLBACK - REPORT THE ERROR
      throw new Error(`DOCX generation failed: ${error.message}`)
    }
  }
  
  /**
   * SURGICAL METHOD: Generate DOCX from beautiful pre-formatted content
   * Preserves professional formatting from professionalBookFormatter
   */
  async generateDOCXFromBeautifulContent(compiledContent) {
    try {
      const { beautifulContent, typographyPrefs, userInput } = compiledContent
      const title = userInput?.book_title || userInput?.story_title || 'Untitled'
      const author = userInput?.author_name || 'Unknown Author'
      
      console.log(`📝 SURGICAL DOCX: Generating "${title}" by ${author}`)
      console.log(`📝 Typography: ${typographyPrefs.fontFamily}, ${typographyPrefs.fontSize}`)
      
      // Map typography fonts to Word-compatible fonts
      let docxFont = 'Georgia'
      if (typographyPrefs.fontFamily.toLowerCase().includes('arial') || 
          typographyPrefs.fontFamily.toLowerCase().includes('helvetica') || 
          typographyPrefs.fontFamily.toLowerCase().includes('sans')) {
        docxFont = 'Arial'
      } else if (typographyPrefs.fontFamily.toLowerCase().includes('courier') || 
                 typographyPrefs.fontFamily.toLowerCase().includes('mono')) {
        docxFont = 'Courier New'
      } else if (typographyPrefs.fontFamily.toLowerCase().includes('times')) {
        docxFont = 'Times New Roman'
      }
      
      // Extract font size from typography preferences
      const fontSize = parseInt(typographyPrefs.fontSize) || 16
      const docxFontSize = fontSize * 2 // DOCX uses half-points
      
      const sections = []
      
      // TITLE PAGE
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: Math.max(docxFontSize + 16, 32),
              font: docxFont
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 300 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `by ${author}`,
              italics: true,
              size: docxFontSize + 8,
              font: docxFont
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 }
        })
      )
      
      // PAGE BREAK after title
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: '', break: 1 })],
          pageBreakBefore: true
        })
      )
      
      // PROCESS BEAUTIFUL CONTENT
      // Extract chapters from beautiful HTML content  
      const chapters = this.extractChaptersFromHTML(beautifulContent)
      
      console.log(`📝 SURGICAL DOCX: Extracted ${chapters.length} chapters from beautiful content`)
      
      // Generate chapters with preserved formatting
      chapters.forEach((chapter, index) => {
        // Chapter title
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: chapter.title,
                bold: true,
                size: docxFontSize + 8,
                font: docxFont
              })
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 300 }
          })
        )
        
        // Chapter content - preserve paragraph structure
        const paragraphs = chapter.content.split('\n\n').filter(p => p.trim())
        
        paragraphs.forEach(paragraph => {
          const cleanParagraph = paragraph.trim()
          if (cleanParagraph) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: cleanParagraph,
                    size: docxFontSize,
                    font: docxFont
                  })
                ],
                spacing: { after: 200 },
                alignment: typographyPrefs.textAlign === 'justify' ? AlignmentType.JUSTIFIED : AlignmentType.LEFT
              })
            )
          }
        })
        
        // Add space between chapters (except last)
        if (index < chapters.length - 1) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: '', size: docxFontSize })],
              spacing: { before: 300, after: 300 }
            })
          )
        }
      })
      
      // Create document with professional styling
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: '1in',
                bottom: '1in',
                left: '1in',
                right: '1in'
              }
            }
          },
          children: sections
        }],
        styles: {
          default: {
            document: {
              run: {
                font: docxFont,
                size: docxFontSize
              }
            }
          }
        }
      })
      
      console.log(`✅ SURGICAL DOCX generated with ${sections.length} sections`)
      
      // Generate DOCX blob
      const buffer = await Packer.toBuffer(doc)
      return {
        data: buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        encoding: 'buffer'
      }
      
    } catch (error) {
      console.error('❌ SURGICAL DOCX generation failed:', error.message)
      throw new Error(`SURGICAL DOCX generation failed: ${error.message}`)
    }
  }
  
  async generatePDF(compiledContent) {
    try {
      const pdfDoc = await PDFDocument.create()
      // Font strategy: map user typography to built-in fonts (no external deps)
      const userFontPref = String(
        compiledContent?.userInput?.typography_combo ||
        compiledContent?.userInput?.font_family ||
        ''
      ).toLowerCase()
      const useSans = /sans|helvetica|arial/.test(userFontPref)
      const useMono = /mono|courier/.test(userFontPref)
      const regularFontName = useMono
        ? StandardFonts.Courier
        : useSans
          ? StandardFonts.Helvetica
          : StandardFonts.TimesRoman
      const boldFontName = useMono
        ? StandardFonts.CourierBold
        : useSans
          ? StandardFonts.HelveticaBold
          : StandardFonts.TimesRomanBold
      const fontRegular = await pdfDoc.embedFont(regularFontName)
      const fontBold = await pdfDoc.embedFont(boldFontName)

      const margins = 56 // ~0.78in
      // SURGICAL FIX: Apply typography from typographyPrefs if available, otherwise from userInput
      const typographyPrefs = compiledContent.typographyPrefs || {}
      let baseFontSize = Math.max(
        8,
        parseInt(String(typographyPrefs.fontSize || compiledContent?.userInput?.font_size || '').replace(/[^\d]/g, '')) || 12
      )
      const lineHeight = Math.round(baseFontSize * 1.2)
      const headingLineHeight = Math.round(baseFontSize * 1.6)

      let page = pdfDoc.addPage()
      let { width: pageWidth, height: pageHeight } = page.getSize()
      let cursorY = pageHeight - margins

      const maxWidth = pageWidth - margins * 2
      // TOC and header/footer helpers
      const anchors = []
      let tocPageRef = null
      const tocYPositions = []
      // baseFontSize already derived above

      const wrapLines = (text, font, size) => {
        if (!text) return []
        const words = String(text).split(/\s+/)
        const lines = []
        let currentLine = ''

        words.forEach((word) => {
          const candidate = currentLine ? `${currentLine} ${word}` : word
          const width = font.widthOfTextAtSize(candidate, size)
          if (width > maxWidth && currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine = candidate
          }
        })

        if (currentLine) lines.push(currentLine)
        return lines
      }

      const ensureSpace = (heightNeeded, extra = 0) => {
        if (cursorY - heightNeeded < margins) {
          page = pdfDoc.addPage()
          const size = page.getSize()
          pageWidth = size.width
          pageHeight = size.height
          cursorY = pageHeight - margins
        }
        cursorY -= extra
      }

      const drawLine = (text, font, size, options = {}) => {
        const { color = rgb(0, 0, 0), bold = false } = options
        const lines = wrapLines(text, bold ? fontBold : font, size)
        lines.forEach((line) => {
          ensureSpace(lineHeight)
          page.drawText(line, {
            x: margins,
            y: cursorY,
            size,
            font: bold ? fontBold : font,
            color
          })
          cursorY -= lineHeight
        })
        cursorY -= options.spacingAfter || 0
      }

      const drawHeading = (text, size, spacingAfter = 12) => {
        ensureSpace(headingLineHeight)
        const lines = wrapLines(text, fontBold, size)
        lines.forEach((line) => {
          page.drawText(line, {
            x: margins,
            y: cursorY,
            size,
            font: fontBold,
            color: rgb(0.1, 0.1, 0.1)
          })
          cursorY -= headingLineHeight
        })
        cursorY -= spacingAfter
      }

      const addPageBreak = () => {
        page = pdfDoc.addPage()
        const size = page.getSize()
        pageWidth = size.width
        pageHeight = size.height
        cursorY = pageHeight - margins
      }

      const title = compiledContent.userInput?.book_title || compiledContent.userInput?.story_title || 'Generated Book'
      const author = compiledContent.userInput?.author_name || 'The Author'
      // SURGICAL FIX: Use sections directly from compiledContent - already has proper titles and content
      // Don't try to re-extract from HTML (fragile regex) - use the structured data we already have
      const sections = compiledContent.sections || []
      const foreword = compiledContent.structural?.foreword
      const introduction = compiledContent.structural?.introduction
      const tableOfContentsList = compiledContent.structural?.tableOfContentsList // TOC from Story Architect
      const aboutAuthor = compiledContent.userInput?.about_author
      const aboutAuthorPosition = (compiledContent.userInput?.about_author_position || 'end').toLowerCase() // 'start' | 'end'

      // Title page
      const centerX = pageWidth / 2
      const centerY = pageHeight / 2
      page.drawText(title, {
        x: centerX - fontBold.widthOfTextAtSize(title, 28) / 2,
        y: centerY + 40,
        size: 28,
        font: fontBold
      })
      page.drawText(`by ${author}`, {
        x: centerX - fontRegular.widthOfTextAtSize(`by ${author}`, 16) / 2,
        y: centerY,
        size: 16,
        font: fontRegular
      })

      addPageBreak()

      // Table of Contents
      drawHeading('Table of Contents', Math.round(baseFontSize * 1.6), 16)
      tocPageRef = page
      const contents = []
      
      // SURGICAL FIX: Use structural.tableOfContentsList if available (from Story Architect)
      // Otherwise build TOC from sections
      if (tableOfContentsList && Array.isArray(tableOfContentsList) && tableOfContentsList.length > 0) {
        // Use TOC entries from Story Architect - single source of truth
        tableOfContentsList.forEach((entry, idx) => {
          if (entry && entry.toString().trim()) {
            const cleanEntry = entry.toString().trim().replace(/^\d+\.\s*/, '') // Remove leading numbers
            contents.push({ title: cleanEntry })
          }
        })
      } else {
        // Fallback: Build TOC from structural sections and chapters
      if (foreword) contents.push({ title: 'Foreword' })
      if (introduction) contents.push({ title: 'Introduction' })
        sections.forEach((section) => {
          // SURGICAL FIX: Use actual section.title - no placeholders
          // If title is missing, section is invalid and should be filtered out earlier
          if (section.title && section.title.trim()) {
            contents.push({ title: section.title.trim() })
          }
      })
      }

      contents.forEach((entry, idx) => {
        // Record Y before drawing for right-aligned page number later
        tocYPositions.push(cursorY)
        drawLine(`${idx + 1}. ${entry.title}`, fontRegular, baseFontSize)
      })

      addPageBreak()

      const writeSection = (heading, body) => {
        if (!body || !body.trim()) return
        drawHeading(heading, Math.round(baseFontSize * 1.4), 10)
        body.split(/\n{2,}/).forEach((paragraph) => {
          const cleaned = paragraph.trim()
          if (!cleaned) return
          drawLine(cleaned, fontRegular, baseFontSize, { spacingAfter: 6 })
        })
        cursorY -= 12
      }

      // About Author at start (after structural sections) if configured
      const writeAboutAuthor = () => {
        if (!aboutAuthor || !aboutAuthor.trim()) return
        anchors.push({ title: 'About the Author', page: pdfDoc.getPageCount() })
        writeSection('About the Author', aboutAuthor)
      }

      if (foreword) {
        anchors.push({ title: 'Foreword', page: pdfDoc.getPageCount() })
        writeSection('Foreword', foreword)
        addPageBreak()
      }

      if (introduction) {
        anchors.push({ title: 'Introduction', page: pdfDoc.getPageCount() })
        writeSection('Introduction', introduction)
        addPageBreak()
      }

      if (aboutAuthorPosition === 'start') {
        writeAboutAuthor()
        addPageBreak()
      }

      sections.forEach((section, index) => {
        // SURGICAL FIX: Use actual section.title - no placeholders
        // If title is missing, section is invalid and should be filtered out earlier
        if (!section.title || !section.title.trim()) {
          console.warn(`⚠️ Skipping section ${index + 1} - missing title`)
          return
        }
        const sectionTitle = section.title.trim()
        const content = this.cleanContentForExport(section.content || '')
        if (!content || !content.trim()) {
          console.warn(`⚠️ Skipping section "${sectionTitle}" - empty content`)
          return
        }
        anchors.push({ title: sectionTitle, page: pdfDoc.getPageCount() })
        writeSection(sectionTitle, content)
        cursorY -= 12
      })

      if (aboutAuthorPosition !== 'start') {
        addPageBreak()
        writeAboutAuthor()
      }

      // Add professional headers/footers and fill TOC page numbers (non-blocking)
      try {
        const pageCount = pdfDoc.getPageCount()
        // Headers/Footers per page
        const headerTitle = compiledContent.userInput?.book_title || compiledContent.userInput?.story_title || 'Generated Book'
        for (let i = 0; i < pageCount; i++) {
          const p = pdfDoc.getPage(i)
          const { width, height } = p.getSize()
          // footer - centered page number
          const pText = String(i + 1)
          p.drawText(pText, {
            x: width / 2 - fontRegular.widthOfTextAtSize(pText, 10) / 2,
            y: margins / 2,
            size: 10,
            font: fontRegular,
            color: rgb(0.25, 0.25, 0.25)
          })
          // header - book title left
          p.drawText(headerTitle, {
            x: margins,
            y: height - margins / 2,
            size: 10,
            font: fontRegular,
            color: rgb(0.25, 0.25, 0.25)
          })
        }
        // Draw right-aligned page numbers on TOC
        if (tocPageRef) {
          contents.forEach((entry, idx) => {
            const anchor = anchors.find(a => a.title === entry.title)
            if (!anchor) return
            const pageStr = String(anchor.page)
            const y = tocYPositions[idx] || cursorY
            const textWidth = fontRegular.widthOfTextAtSize(pageStr, baseFontSize)
            tocPageRef.drawText(pageStr, {
              x: pageWidth - margins - textWidth,
              y,
              size: baseFontSize,
              font: fontRegular,
              color: rgb(0.1, 0.1, 0.1)
            })
          })
        }
      } catch (e) {
        // do not fail PDF if polish could not be applied
      }

      const pdfBytes = await pdfDoc.save()
      return {
        data: Buffer.from(pdfBytes),
        mimeType: 'application/pdf',
        encoding: 'buffer',
        metadata: {
          title
        }
      }
    } catch (error) {
      console.error('❌ PDF generation failed:', error)
      throw new Error(`PDF generation failed: ${error.message}`)
    }
  }
  
  /**
   * Extract chapters from beautiful HTML content
   * Preserves structure from professionalBookFormatter
   */
  extractChaptersFromHTML(htmlContent) {
    const chapters = []
    
    // Simple regex-based chapter extraction from HTML
    const chapterRegex = /<div class="chapter">(.*?)<\/div>/gs
    const titleRegex = /<h2 class="chapter-title">(.*?)<\/h2>/s
    const contentRegex = /<div class="chapter-content">(.*?)<\/div>/s
    
    let chapterMatches = htmlContent.match(chapterRegex)
    
    if (!chapterMatches) {
      // Fallback: treat entire content as single chapter
      const cleanContent = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      return [{
        title: 'Generated Content',
        content: cleanContent
      }]
    }
    
    chapterMatches.forEach((chapterHtml, index) => {
      const titleMatch = chapterHtml.match(titleRegex)
      const contentMatch = chapterHtml.match(contentRegex)
      
      // SURGICAL FIX: Extract title or skip - no placeholders
      const extractedTitle = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : null
      if (!extractedTitle || !extractedTitle.trim()) {
        console.warn(`⚠️ Skipping chapter in HTML extraction - could not extract title`)
        return
      }
      chapters.push({
        title: extractedTitle,
        content: contentMatch ? contentMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : ''
      })
    })
    
    return chapters.length > 0 ? chapters : [{
      title: 'Generated Content',
      content: htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    }]
  }
  
  async generateHTML(compiledContent) {
    try {
      const title = compiledContent.userInput?.book_title || compiledContent.userInput?.story_title || 'Untitled'
      const author = compiledContent.userInput?.author_name || 'Unknown Author'
      const fontFamily = compiledContent.userInput?.typography_combo || 
                        compiledContent.userInput?.font_family || 
                        'Georgia, serif'
      
      // Flatten sections - handle both arrays and strings  
      // STANDARDIZED: All sections now have title, chapterNumber, and content from compileWorkflowContent
      let flatSections = []
      const rawSections = compiledContent.sections || []
      
      rawSections.forEach((section, idx) => {
        if (Array.isArray(section.content)) {
          section.content.forEach(ch => {
            // SURGICAL FIX: Use actual title - no placeholders
            const chapterTitle = ch.title || section.title
            if (!chapterTitle || !chapterTitle.trim()) {
              console.warn(`⚠️ Skipping chapter in Markdown - missing title`)
              return
            }
            flatSections.push({
              title: chapterTitle.trim(),
              content: this.cleanContentForExport(ch.content || ''),
              metadata: { 
                chapterNumber: ch.chapter || section.chapterNumber || flatSections.length + 1,
                ...(section.metadata || {})
              }
            })
          })
        } else if (typeof section.content === 'string' && section.content.trim()) {
          // SURGICAL FIX: Use actual section.title - no placeholders
          if (!section.title || !section.title.trim()) {
            console.warn(`⚠️ Skipping section ${idx + 1} in Markdown - missing title`)
            return
          }
          flatSections.push({
            title: section.title.trim(),
            content: this.cleanContentForExport(section.content),
            metadata: { 
              chapterNumber: section.chapterNumber || section.metadata?.chapterNumber || section.metadata?.chapter || (idx + 1),
              ...(section.metadata || {})
            }
          })
        }
      })
      
      const sections = flatSections
      
      if (sections.length === 0) {
        throw new Error('No valid chapters extracted for HTML generation')
      }
      
      console.log(`🌐 Generating HTML: "${title}" by ${author}`)
      console.log(`🌐 Flattened ${sections.length} chapters from ${rawSections.length} raw sections`)
      
      let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: ${fontFamily};
            line-height: 1.9;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #f9f9f9;
            color: #1a1a1a;
            font-size: 16px;
        }
        .container {
            background: white;
            padding: 60px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .title-page {
            text-align: center;
            padding: 80px 0;
            border-bottom: 2px solid #ecf0f1;
            margin-bottom: 60px;
        }
        h1 {
            color: #2c3e50;
            font-size: 3em;
            margin-bottom: 20px;
            font-weight: 700;
        }
        .author {
            font-style: italic;
            color: #7f8c8d;
            font-size: 1.5em;
            margin-bottom: 30px;
        }
        .metadata {
            color: #95a5a6;
            font-size: 0.9em;
        }
        .toc {
            margin: 60px 0;
            padding: 40px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .toc h2 {
            text-align: center;
            color: #2c3e50;
            font-size: 2em;
            margin-bottom: 30px;
            border: none;
        }
        .toc ul {
            list-style: none;
            padding: 0;
        }
        .toc li {
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .toc li:last-child {
            border-bottom: none;
        }
        .toc a {
            text-decoration: none;
            color: #3498db;
            font-size: 1.1em;
            transition: color 0.3s;
        }
        .toc a:hover {
            color: #2980b9;
        }
        .chapter {
            margin: 80px 0;
            page-break-before: always;
        }
        .chapter-number {
            text-align: center;
            color: #95a5a6;
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        h2 {
            color: #34495e;
            text-align: center;
            font-size: 2.2em;
            margin-bottom: 40px;
            font-weight: 700;
        }
        .chapter-content {
            text-align: justify;
            line-height: 1.9;
        }
        .chapter-content p {
            margin-bottom: 20px;
            text-indent: 2em;
        }
        .chapter-content p:first-child {
            text-indent: 0;
        }
        .about-author {
            margin-top: 80px;
            padding-top: 40px;
            border-top: 2px solid #ecf0f1;
            page-break-before: always;
        }
        .about-author h2 {
            text-align: center;
            margin-bottom: 30px;
        }
        .about-author p {
            text-align: justify;
            line-height: 1.8;
        }
        @media print {
            body { 
                background: white; 
                max-width: 100%;
            }
            .container { 
                box-shadow: none;
                padding: 40px;
            }
            .chapter {
                page-break-before: always;
            }
        }
        @media (max-width: 768px) {
            .container {
                padding: 30px 20px;
            }
            h1 {
                font-size: 2em;
            }
            h2 {
                font-size: 1.5em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- TITLE PAGE -->
        <div class="title-page">
            <h1>${title}</h1>
            <div class="author">by ${author}</div>
            ${compiledContent.assets?.cover?.url ? `<div style="margin-top:20px;text-align:center"><img src="${compiledContent.assets.cover.url}" alt="Cover" style="max-width:60%; border:1px solid #e5e7eb; border-radius:6px"/></div>` : ''}
        </div>
        
        <!-- TABLE OF CONTENTS -->
        <div class="toc">
            <h2>Table of Contents</h2>
            <ul>`
      
      // Build TOC strictly from compiled content
      const tocList = Array.isArray(compiledContent.structural?.tableOfContentsList)
        ? compiledContent.structural.tableOfContentsList
        : null
      if (tocList && tocList.length > 0) {
        tocList.forEach((entry, idx) => {
          const anchor = (entry || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
        html += `
                <li><a href="#${anchor}">${idx + 1}. ${entry}</a></li>`
        })
      } else {
        const derived = []
        if (compiledContent.structural?.foreword) derived.push({ id: 'foreword', title: 'Foreword' })
        if (compiledContent.structural?.introduction) derived.push({ id: 'introduction', title: 'Introduction' })
      sections.forEach((section, index) => {
        // SURGICAL FIX: Use actual section.title - no placeholders
        if (!section.title || !section.title.trim()) {
          console.warn(`⚠️ Skipping section ${index + 1} in HTML TOC - missing title`)
          return
        }
        const chapterTitle = section.title.trim()
        const chapterNum = section.metadata?.chapterNumber || section.chapterNumber || (index + 1)
        const chapterId = `chapter-${chapterNum}`
          derived.push({ id: chapterId, title: `${chapterNum}. ${chapterTitle}` })
        })
        derived.forEach((e) => {
        html += `
                <li><a href="#${e.id}">${e.title}</a></li>`
      })
      }
      
      html += `
            </ul>
        </div>
        
        ${Array.isArray(compiledContent.assets?.images) && compiledContent.assets.images.length > 0 ? `
        <!-- IMAGE GALLERY -->
        <div class="chapter" id="image-gallery">
            <h2>Image Gallery</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:24px;">
                ${compiledContent.assets.images.map(img => {
                  const src = img.url || img.dataUri || ''
                  const alt = (img.prompt || 'Generated image').replace(/"/g, '&quot;')
                  return `<div style="border:1px solid #eee;padding:8px;border-radius:6px;background:#fafafa;text-align:center">
                    <img src="${src}" alt="${alt}" style="max-width:100%;border-radius:4px"/>
                    ${img.chapter ? `<div style="margin-top:6px;color:#6b7280;font-size:.9em">Chapter ${img.chapter}</div>` : ''}
                  </div>`
                }).join('')}
            </div>
        </div>
        ` : ``}
        
        <!-- FOREWORD -->
        ${compiledContent.structural?.foreword ? `
        <div class="chapter" id="foreword">
            <h2>Foreword</h2>
            <div class="chapter-content">
                <p>${compiledContent.structural.foreword.replace(/\n/g, '</p><p>')}</p>
            </div>
        </div>` : ''}
        
        <!-- INTRODUCTION -->
        ${compiledContent.structural?.introduction ? `
        <div class="chapter" id="introduction">
            <h2>Introduction</h2>
            <div class="chapter-content">
                <p>${compiledContent.structural.introduction.replace(/\n/g, '</p><p>')}</p>
            </div>
        </div>` : ''}
        
        <!-- CHAPTERS -->`
      
      // Build chapters
      sections.forEach((section, index) => {
        // SURGICAL FIX: Use actual section.title - no placeholders
        if (!section.title || !section.title.trim()) {
          console.warn(`⚠️ Skipping section in HTML - missing title`)
          return
        }
        const chapterTitle = section.title.trim()
        const chapterNum = section.metadata?.chapterNumber || section.chapterNumber || (index + 1)
        const chapterId = `chapter-${chapterNum}`
        const chapterContent = section.content || ''
        
        if (!chapterContent.trim()) {
          console.warn(`⚠️ Warning: Chapter ${chapterNum} has empty content`)
        }
        
        // Chapter images
        const chapterImgs = (compiledContent.assets?.images || []).filter(img => (img.chapter || chapterNum) === chapterNum)
        if (chapterImgs.length) {
          chapterImgs.forEach(i => {
            html += `
            <figure style="text-align:center;margin:24px 0">
              <img src="${i.url}" alt="Chapter image" style="max-width:90%"/>
              ${i.prompt ? `<figcaption style=\"font-size:0.9em;color:#6b7280;margin-top:6px\">${(i.prompt||'').replace(/</g,'&lt;')}</figcaption>` : ''}
            </figure>`
          })
        }

        html += `
        <div class="chapter" id="${chapterId}">
            <h2>${chapterTitle}</h2>
            <div class="chapter-content">`
        
        // Split into paragraphs
        const paragraphs = chapterContent.split('\n\n').filter(p => p.trim())
        paragraphs.forEach(paragraph => {
          html += `
                <p>${paragraph.trim().replace(/\n/g, ' ')}</p>`
        })
        
        html += `
            </div>
        </div>`
      })
      
      // No hardcoded template/footer content – only compiled content
      
      html += `
    </div>
</body>
</html>`
      
      console.log('✅ HTML generated successfully')
      
      return html
      
    } catch (error) {
      console.error('❌ HTML generation failed:', error.message)
      console.error('Error details:', error)
      
      // DO NOT FALLBACK - REPORT THE ERROR
      throw new Error(`HTML generation failed: ${error.message}`)
    }
  }
  
  async generateEPUB(compiledContent) {
    // TEMPORARILY DISABLED: epub-gen is a Node.js library and cannot run in browser
    // This needs to be implemented as a server-side API endpoint
    throw new Error('EPUB generation is temporarily unavailable. The epub-gen library requires Node.js and cannot run in the browser. Please use PDF, DOCX, or Markdown formats instead.')
    
    /* ORIGINAL CODE COMMENTED OUT FOR FUTURE SERVER-SIDE IMPLEMENTATION
    try {
      // Extract dynamic metadata from user input - NO HARDCODED FALLBACKS
      const sections = compiledContent.sections || []
      const title = compiledContent.userInput?.book_title || 
                    compiledContent.userInput?.story_title || 
                    'Untitled'
      const author = compiledContent.userInput?.author_name || 'Unknown Author'
      
      console.log(`📚 Generating EPUB: "${title}" by ${author}`)
      console.log(`📚 Total sections: ${sections.length}`)
      
      // SURGICAL FIX: Build chapters from actual content sections - use actual titles, no placeholders
      const chapters = sections
        .filter(section => section.title && section.title.trim()) // Filter out sections without titles
        .map((section, index) => {
          const chapterTitle = section.title.trim()
        const chapterContent = section.content || ''
        
        if (!chapterContent.trim()) {
            console.warn(`⚠️ Warning: Chapter "${chapterTitle}" has empty content`)
        }
        
        // Format content as proper HTML paragraphs
        const formattedContent = chapterContent
          .split('\n\n')
          .filter(para => para.trim())
          .map(para => `<p>${para.trim().replace(/\n/g, ' ')}</p>`)
          .join('\n')
        
        return {
          title: chapterTitle,
          data: formattedContent || '<p>Chapter content unavailable</p>'
        }
      })
      
      // Build EPUB metadata - ALL DYNAMIC FROM USER INPUT
      const epubOptions = {
        title: title,
        author: author,
        publisher: compiledContent.userInput?.publisher || 'Lekhika AI',
        description: compiledContent.userInput?.description || 
                    compiledContent.userInput?.story_premise || 
                    `${title} by ${author}`,
        cover: compiledContent.userInput?.cover_image || undefined,
        isbn: compiledContent.userInput?.isbn || undefined,
        lang: compiledContent.userInput?.language || 'en',
        tocTitle: 'Table of Contents',
        appendChapterTitles: true,
        customOpfTemplatePath: undefined,
        customNcxTocTemplatePath: undefined,
        customHtmlTocTemplatePath: undefined,
        content: chapters,
        verbose: false
      }
      
      console.log('📚 EPUB Options:', {
        title: epubOptions.title,
        author: epubOptions.author,
        chapters: chapters.length,
        publisher: epubOptions.publisher
      })
      
      // Generate EPUB file as ArrayBuffer (browser-compatible)
      const epub = new EPub(epubOptions)
      const epubBuffer = await epub.genEpub()
      
      console.log('✅ EPUB generated successfully, size:', epubBuffer.byteLength, 'bytes')
      
      // Convert ArrayBuffer to Blob for browser download
      const blob = new Blob([epubBuffer], { 
        type: 'application/epub+zip' 
      })
      
      // Create object URL for download
      const downloadUrl = URL.createObjectURL(blob)
      
      console.log('✅ EPUB download URL created')
      
      return downloadUrl
      
    } catch (error) {
      console.error('❌ EPUB generation failed:', error.message)
      console.error('Error details:', error)
      
      // DO NOT FALLBACK TO FAKE FORMATS - REPORT THE ERROR
      throw new Error(`EPUB generation failed: ${error.message}`)
    }
    */
  }

  async generateMarkdown(compiledContent) {
    try {
      const title = compiledContent.userInput?.book_title || compiledContent.userInput?.story_title || 'Untitled'
      const author = compiledContent.userInput?.author_name || 'Unknown Author'
      
      // Flatten sections - handle both arrays and strings
      // STANDARDIZED: All sections now have title, chapterNumber, and content from compileWorkflowContent
      let flatSections = []
      const rawSections = compiledContent.sections || []
      
      rawSections.forEach((section, idx) => {
        if (Array.isArray(section.content)) {
          section.content.forEach(ch => {
            // SURGICAL FIX: Use actual title - no placeholders
            const chapterTitle = ch.title || section.title
            if (!chapterTitle || !chapterTitle.trim()) {
              console.warn(`⚠️ Skipping chapter in Markdown - missing title`)
              return
            }
            flatSections.push({
              title: chapterTitle.trim(),
              content: this.cleanContentForExport(ch.content || ''),
              metadata: { 
                chapterNumber: ch.chapter || section.chapterNumber || flatSections.length + 1,
                ...(section.metadata || {})
              }
            })
          })
        } else if (typeof section.content === 'string' && section.content.trim()) {
          // SURGICAL FIX: Use actual section.title - no placeholders
          if (!section.title || !section.title.trim()) {
            console.warn(`⚠️ Skipping section ${idx + 1} in Markdown - missing title`)
            return
          }
          flatSections.push({
            title: section.title.trim(),
            content: this.cleanContentForExport(section.content),
            metadata: { 
              chapterNumber: section.chapterNumber || section.metadata?.chapterNumber || section.metadata?.chapter || (idx + 1),
              ...(section.metadata || {})
            }
          })
        }
      })
      
      const sections = flatSections
      
      if (sections.length === 0) {
        throw new Error('No valid chapters extracted for Markdown generation')
      }
      
      console.log(`📝 Generating Markdown: "${title}" by ${author}`)
      console.log(`📝 Flattened ${sections.length} chapters from ${rawSections.length} raw sections`)
      
      let markdown = `# ${title}\n\n`
      markdown += `*by ${author}*\n\n`
      markdown += `---\n\n`
      markdown += `**Generated on:** ${new Date().toLocaleDateString()}\n\n`
      
      // Add total words if available
      if (compiledContent.totalWords) {
        markdown += `**Total Words:** ${compiledContent.totalWords}\n\n`
      }
      
      markdown += `---\n\n`
      
      // TABLE OF CONTENTS
      markdown += `## Table of Contents\n\n`
      
      // Add Foreword and Introduction to TOC (only if generated by Structural Node)
      if (compiledContent.structural?.foreword) {
        markdown += `[Foreword](#foreword)\n`
      }
      if (compiledContent.structural?.introduction) {
        markdown += `[Introduction](#introduction)\n`
      }
      
      sections.forEach((section, index) => {
        // SURGICAL FIX: Use actual section.title - no placeholders
        if (!section.title || !section.title.trim()) {
          console.warn(`⚠️ Skipping section ${index + 1} in Markdown TOC - missing title`)
          return
        }
        const chapterTitle = section.title.trim()
        const chapterNum = section.metadata?.chapterNumber || section.chapterNumber || (index + 1)
        const anchor = chapterTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        
        markdown += `${chapterNum}. [${chapterTitle}](#${anchor})\n`
      })
      
      markdown += `\n---\n\n`
      
      // FOREWORD (only if generated by Structural Node)
      if (compiledContent.structural?.foreword) {
        markdown += `## Foreword\n\n`
        markdown += `${compiledContent.structural.foreword}\n\n`
        markdown += `---\n\n`
      }
      
      // INTRODUCTION (only if generated by Structural Node)
      if (compiledContent.structural?.introduction) {
        markdown += `## Introduction\n\n`
        markdown += `${compiledContent.structural.introduction}\n\n`
        markdown += `---\n\n`
      }
      
      // CHAPTERS
      sections.forEach((section, index) => {
        // SURGICAL FIX: Use actual section.title - no placeholders
        if (!section.title || !section.title.trim()) {
          console.warn(`⚠️ Skipping section ${index + 1} in Markdown - missing title`)
          return
        }
        const chapterTitle = section.title.trim()
        const chapterNum = section.metadata?.chapterNumber || section.chapterNumber || (index + 1)
        const chapterContent = section.content || ''
        
        if (!chapterContent.trim()) {
          console.warn(`⚠️ Warning: Chapter ${chapterNum} has empty content`)
          return
        }
        
        markdown += `## Chapter ${chapterNum}: ${chapterTitle}\n\n`
        markdown += `${chapterContent.trim()}\n\n`
        markdown += `---\n\n`
      })
      
      // IMAGE GALLERY (if any)
      if (Array.isArray(compiledContent.assets?.images) && compiledContent.assets.images.length > 0) {
        markdown += `## Image Gallery\n\n`
        compiledContent.assets.images.forEach((img) => {
          const src = img.url || img.dataUri
          if (!src) return
          const alt = (img.prompt || 'Generated image').replace(/\n/g, ' ').trim()
          markdown += `![${alt}](${src})\n\n`
          if (img.chapter) {
            markdown += `_Chapter ${img.chapter}_\n\n`
          }
        })
        markdown += `---\n\n`
      }
      
      // ABOUT THE AUTHOR (if available)
      const aboutAuthor = compiledContent.userInput?.about_author
      if (aboutAuthor && aboutAuthor.trim()) {
        markdown += `## About the Author\n\n`
        markdown += `${aboutAuthor}\n\n`
      }
      
      console.log('✅ Markdown generated successfully')
      
      return markdown
      
    } catch (error) {
      console.error('❌ Markdown generation failed:', error.message)
      console.error('Error details:', error)
      
      // DO NOT FALLBACK - REPORT THE ERROR
      throw new Error(`Markdown generation failed: ${error.message}`)
    }
  }
}

module.exports = new ExportService()
/**
 * Content compilation + structural extraction helpers.
 * Pure functions so workflowExecutionService can delegate without holding logic.
 */

function sanitizeGeneratedContent(text) {
  if (typeof text !== 'string') return text
  let out = text

  out = out.replace(/(^|\n)[═=]{6,}[\s\S]*?(Only perform tasks[\s\S]*?)?[═=]{6,}\s*/g, '\n')
  out = out.replace(/Only perform tasks you are explicitly authorized for above\.?/gi, '')
  out = out.replace(/⚠️\s*CRITICAL:\s*Violating these permissions.*?$/gmi, '')
  out = out.replace(/Only perform tasks.*?authorized.*?above\.?/gi, '')
  out = out.replace(/^\s*(?:✅|🚫)\s*(AUTHORIZED|FORBIDDEN):.*$/gmi, '')
  out = out.replace(/^\s*⚠️\s*CRITICAL:.*$/gmi, '')
  out = out.replace(/^\s*NODE PERMISSIONS.*$/gmi, '')
  out = out.replace(/^\s*🔐\s*NODE PERMISSIONS.*$/gmi, '')
  out = out.replace(/^\s*STRICTLY ENFORCED.*$/gmi, '')
  out = out.replace(/^\s*(instructions|node instructions|permission instructions)\s*[:\-]*\s*/gmi, '')
  out = out.replace(/You are (only|explicitly) (authorized|allowed|permitted).*?above\.?/gi, '')
  out = out.replace(/Violating (these )?permissions.*?$/gi, '')
  out = out.replace(/This output must (only|exclusively).*?$/gi, '')
  out = out.replace(/^```(?:\w+)?\s*([\s\S]*?)```/m, '$1')
  out = out.replace(/\{[A-Za-z]\}/g, '')
  out = out.replace(/\n{3,}/g, '\n\n').trim()

  return out
}

function extractChapterStructure(content) {
  if (!content || typeof content !== 'string') return null

  let sanitized = sanitizeGeneratedContent(content)

  const prefacePatterns = [
    /^(okay|sure|alright)[,!\.\s-]?\s*i (will|can|understand|shall)[\s\S]{0,120}?(\n{1,}|$)/i,
    /^here('?s| is)\s+the\s+(first|next)\s+chapter[\s\S]{0,120}?(\n{1,}|$)/i,
    /^note[:\-\s][\s\S]{0,200}?(\n{1,}|$)/i
  ]
  for (const pat of prefacePatterns) {
    sanitized = sanitized.replace(pat, '').trim()
  }

  let chapterNumber = null
  let title = null
  let cleanContent = sanitized

  const headerPattern = /^##\s+Chapter\s+(\d+)(?:\s*:\s*(.+?))?(?:\s*$|\n)/mi
  const headerMatch = sanitized.match(headerPattern)
  if (headerMatch) {
    chapterNumber = parseInt(headerMatch[1], 10)
    const headerTitle = (headerMatch[2] || '').trim()
    if (headerTitle) title = headerTitle
    cleanContent = cleanContent.replace(headerPattern, '').trim()
  }

  const boldPattern = /^\*\*Chapter\s+(\d+)(?:\s*:\s*(.+?))\*\*(?:\s*$|\n)/mi
  const boldMatch = cleanContent.match(boldPattern)
  if (boldMatch) {
    const boldChapterNum = parseInt(boldMatch[1], 10)
    const boldTitle = (boldMatch[2] || '').trim()
    if (!chapterNumber || boldChapterNum === chapterNumber) {
      chapterNumber = boldChapterNum
      if (boldTitle) title = boldTitle
    }
    cleanContent = cleanContent.replace(boldPattern, '').trim()
  }

  if (!chapterNumber) {
    const singleHashPattern = /^#\s+Chapter\s+(\d+)(?:\s*:\s*(.+?))?(?:\s*$|\n)/mi
    const singleHashMatch = cleanContent.match(singleHashPattern)
    if (singleHashMatch) {
      chapterNumber = parseInt(singleHashMatch[1], 10)
      const singleHashTitle = (singleHashMatch[2] || '').trim()
      if (singleHashTitle) title = singleHashTitle
      cleanContent = cleanContent.replace(singleHashPattern, '').trim()
    }
  }

  if (!chapterNumber) {
    const plainPattern = /^Chapter\s+(\d+)(?:\s*:\s*(.+?))(?:\s*$|\n)/mi
    const plainMatch = cleanContent.match(plainPattern)
    if (plainMatch) {
      chapterNumber = parseInt(plainMatch[1], 10)
      const plainTitle = (plainMatch[2] || '').trim()
      if (plainTitle) title = plainTitle
      cleanContent = cleanContent.replace(plainPattern, '').trim()
    }
  }

  if (chapterNumber) {
    cleanContent = cleanContent
      .replace(new RegExp(`^##?\\s+Chapter\\s+${chapterNumber}(?:\\s*:\\s*.+?)?(?=\\s|$)`, 'gmi'), '')
      .replace(new RegExp(`^\\*\\*Chapter\\s+${chapterNumber}(?:\\s*:\\s*.+?)\\*\\*(?=\\s|$)`, 'gmi'), '')
      .replace(new RegExp(`^#\\s+Chapter\\s+${chapterNumber}(?:\\s*:\\s*.+?)?(?=\\s|$)`, 'gmi'), '')
      .replace(/\s*\(Word\s+Count:\s*\d+\)\s*$/gmi, '')
      .replace(/\s*\*\*Word\s+Count:\s*\d+\*\*\s*$/gmi, '')
      .replace(/\s*Word\s+Count:\s*\d+\s*$/gmi, '')
      .replace(/^```json[\s\S]*?```/i, '')
      .replace(/^\{[\s\S]*?\}\s*(?=#+\s|$)/, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    if (cleanContent.length < 50) {
      cleanContent = sanitized
        .replace(headerPattern, '')
        .replace(boldPattern, '')
        .trim()
    }

    return {
      chapterNumber,
      title: title || `Chapter ${chapterNumber}`,
      cleanContent,
      hasStructure: true
    }
  }

  return null
}

function compileWorkflowContent(nodeOutputs, userInput) {
  const content = {
    userInput,
    generatedContent: {},
    totalWords: 0,
    totalCharacters: 0,
    sections: [],
    structural: {
      foreword: null,
      introduction: null,
      tableOfContents: null,
      // SURGICAL FIX: Store canonical chapter titles from structural nodes (Story Architect)
      // Keyed by chapterNumber (1-based). This is the single source of truth for titles.
      chapterTitles: {}
    },
    assets: {
      images: [],
      cover: null
    },
    metadata: {
      nodeCount: 0,
      wordCountByNode: {},
      characterCountByNode: {}
    }
  }

  Object.entries(nodeOutputs).forEach(([nodeId, output]) => {
    const nodeLabel = output.metadata?.nodeName || output.metadata?.label || ''
    const isStructuralNode =
      /structural|structure|narrative.*architect/i.test(nodeLabel) ||
      output.metadata?.nodeType === 'structural' ||
      output.type === 'structural'

    if (isStructuralNode && output.content && typeof output.content === 'string') {
      const structuralContent = output.content
      try {
        const unfenced = structuralContent.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
        const maybeJson = unfenced.startsWith('{') ? unfenced : (structuralContent.trim().startsWith('{') ? structuralContent.trim() : '')
        if (maybeJson) {
          const parsed = JSON.parse(maybeJson)
          const opening = parsed?.opening_content || parsed?.story_architecture?.opening_content
          if (opening) {
            if (opening.foreword?.content) {
              const fwText = typeof opening.foreword.content === 'string'
                ? opening.foreword.content.trim()
                : Array.isArray(opening.foreword.content)
                  ? opening.foreword.content.map(p => p.text || '').filter(Boolean).join('\n\n').trim()
                  : ''
              if (fwText.length > 50) content.structural.foreword = sanitizeGeneratedContent(fwText)
            }
            if (opening.introduction?.content) {
              const introText = typeof opening.introduction.content === 'string'
                ? opening.introduction.content.trim()
                : Array.isArray(opening.introduction.content)
                  ? opening.introduction.content.map(item => {
                      if (typeof item.text === 'string') return item.text
                      if (item.list) {
                        return Object.values(item.list)
                          .map(it => (it.title ? `${it.title}: ${it.description || ''}` : ''))
                          .join('\n')
                      }
                      return ''
                    }).filter(Boolean).join('\n\n').trim()
                  : ''
              if (introText.length > 50) content.structural.introduction = sanitizeGeneratedContent(introText)
            }
            const toc = opening.table_of_contents
            if (toc) {
              const tocLines = []
              if (Array.isArray(toc.chapters)) {
                toc.chapters.forEach(ch => {
                  const num = ch.number || ''
                  const title = ch.title || ''
                  if (!title) return

                  // Populate canonical structural chapter title map
                  if (typeof num === 'number' && num > 0) {
                    content.structural.chapterTitles[num] = title
                  }

                  tocLines.push(`${num ? `${num}. ` : ''}${title}`)
                })
              }
              if (Array.isArray(toc.additional_sections)) {
                toc.additional_sections.forEach(sec => {
                  if (sec.title) tocLines.push(sec.title)
                })
              }
              if (tocLines.length > 0) {
                content.structural.tableOfContents = tocLines.join('\n')
                content.structural.tableOfContentsList = tocLines
              }
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ Structural JSON parse skipped:', e?.message)
      }

      const forewordMatch = structuralContent.match(/(?:^|\n)#{1,3}\s*Foreword[\s\S]*?(?=\n#{1,3}\s*(?:Introduction|Table|Chapter|$))/i)
      if (forewordMatch) {
        const forewordText = forewordMatch[0]
          .replace(/^#{1,3}\s*Foreword\s*/i, '')
          .replace(/^#{1,3}\s*Foreword:\s*/i, '')
          .trim()
        if (forewordText.length > 50) {
          content.structural.foreword = sanitizeGeneratedContent(forewordText)
          console.log(`📖 Extracted Foreword from structural node ${nodeId}: ${forewordText.length} chars`)
        }
      }

      const introMatch = structuralContent.match(/(?:^|\n)#{1,3}\s*Introduction[\s\S]*?(?=\n#{1,3}\s*(?:Table|Chapter|$))/i)
      if (introMatch) {
        const introText = introMatch[0]
          .replace(/^#{1,3}\s*Introduction\s*/i, '')
          .replace(/^#{1,3}\s*Introduction:\s*/i, '')
          .trim()
        if (introText.length > 50) {
          content.structural.introduction = sanitizeGeneratedContent(introText)
          console.log(`📖 Extracted Introduction from structural node ${nodeId}: ${introText.length} chars`)
        }
      }

      const tocMatch = structuralContent.match(/(?:^|\n)#{1,3}\s*Table\s+of\s+Contents?[\s\S]*?(?=\n#{1,3}\s*(?:Foreword|Introduction|Chapter|$))/i)
      if (tocMatch) {
        const tocText = tocMatch[0]
          .replace(/^#{1,3}\s*Table\s+of\s+Contents?\s*/i, '')
          .replace(/^#{1,3}\s*TOC\s*/i, '')
          .trim()
        if (tocText.length > 20) {
          content.structural.tableOfContents = sanitizeGeneratedContent(tocText)
          console.log(`📖 Extracted TOC from structural node ${nodeId}: ${tocText.length} chars`)
        }
      }
    }

    const isImageNode = output.type === 'image_generation' || output.type === 'image_skipped'
    if (isImageNode) {
      console.log(`🎨 STORING image node ${nodeId} as asset (not text content)`)
      if (output.type === 'image_generation' && output.imageData) {
        const nodeLabel = output.metadata?.nodeName || nodeId
        const isEcover = nodeLabel.toLowerCase().includes('cover')
        if (isEcover) {
          content.assets.cover = {
            imageData: output.imageData,
            inlineData: output.inlineData,
            sourceNode: nodeId,
            metadata: output.metadata
          }
          console.log(`📸 Stored e-cover image from ${nodeId}`)
        } else {
          content.assets.images.push({
            imageData: output.imageData,
            inlineData: output.inlineData,
            sourceNode: nodeId,
            metadata: output.metadata
          })
          console.log(`📸 Stored image from ${nodeId} (total images: ${content.assets.images.length})`)
        }
      }
      return
    }

    const nodePermissions = output.metadata?.permissions || output.permissions
    const hasWritePermission = nodePermissions?.canWriteContent === true

    if ((output.type === 'ai_generation' || output.type === 'multi_chapter_generation' || output.type === 'process') && output.content) {
      const hasStructuralPermission = nodePermissions?.canEditStructure === true
      if (hasStructuralPermission && !hasWritePermission) {
        console.log(`📖 STRUCTURAL NODE ${nodeId}: Extracting structural elements, skipping from narrative content`)
        return
      }

      if (!hasWritePermission) {
        console.log(`🔒 SKIPPING node ${nodeId} from narrative content (canWriteContent: false, no structural permission)`)
        return
      }

      if (output.type === 'multi_chapter_generation' && Array.isArray(output.content)) {
        console.log(`📚 Processing multi-chapter content from ${nodeId}: ${output.content.length} chapters`)
        output.content.forEach((chapter, index) => {
          if (chapter && typeof chapter.content === 'string' && chapter.content.trim().length > 0) {
            const chNum = chapter.chapter || index + 1
            const wordCount = chapter.content.split(/\s+/).filter(word => word.length > 0).length
            const charCount = chapter.content.length

            content.totalWords += wordCount
            content.totalCharacters += charCount
            content.metadata.wordCountByNode[`${nodeId}_chapter_${chNum}`] = wordCount
            content.metadata.characterCountByNode[`${nodeId}_chapter_${chNum}`] = charCount
            content.metadata.nodeCount++

            // SURGICAL FIX: Prefer canonical structural title if available
            let chapterTitle =
              (content.structural.chapterTitles && content.structural.chapterTitles[chNum]) ||
              chapter.title

            // If still no title, attempt to extract from the content itself
            if (!chapterTitle || !chapterTitle.trim()) {
              const chapterStructure = extractChapterStructure(chapter.content)
              if (chapterStructure && chapterStructure.title && chapterStructure.title.trim()) {
                chapterTitle = chapterStructure.title.trim()
                console.log(`📖 Extracted chapter title from content: "${chapterTitle}"`)
              }
            }

            // FINAL GUARD: if we *still* have no title, log and continue without inventing placeholders.
            if (!chapterTitle || !chapterTitle.trim()) {
              console.warn(`⚠️ Chapter ${chNum} has no reliable title – leaving title empty for downstream filters`)
              chapterTitle = '' // downstream exporters decide whether to skip or label explicitly
            }

            content.sections.push({
              nodeId,
              title: chapterTitle,
              chapterNumber: chNum,
              content: chapter.content,
              metadata: { ...(output.metadata || {}), chapter: chNum },
              contentType: 'chapter'
            })
          }
        })
        return
      }

      if (typeof output.content === 'string' && output.content.trim().length > 0) {
        const chapterParts = output.content
          .split(/(?:^|\n)(?:##\s+Chapter\s+\d+|#\s+Chapter\s+\d+|\*\*Chapter\s+\d+.*\*\*|Chapter\s+\d+\s*:)/g)
          .filter(Boolean)

        if (chapterParts.length > 1) {
          console.log(`📚 Node ${nodeId} content split into ${chapterParts.length} potential chapters`)
          chapterParts.forEach((chapterPart, partIndex) => {
            const chapterStructure = extractChapterStructure(chapterPart.trim())
            if (chapterStructure && chapterStructure.hasStructure) {
              const wordCount = chapterStructure.cleanContent.split(/\s+/).filter(word => word.length > 0).length
              const charCount = chapterStructure.cleanContent.length

              content.totalWords += wordCount
              content.totalCharacters += charCount
              content.metadata.wordCountByNode[`${nodeId}_part_${partIndex + 1}`] = wordCount
              content.metadata.characterCountByNode[`${nodeId}_part_${partIndex + 1}`] = charCount
              content.metadata.nodeCount++

              // SURGICAL FIX: Prefer structural title if available
              const canonicalTitle =
                (content.structural.chapterTitles && content.structural.chapterTitles[chapterStructure.chapterNumber]) ||
                chapterStructure.title

              content.sections.push({
                nodeId,
                title: canonicalTitle,
                chapterNumber: chapterStructure.chapterNumber,
                content: chapterStructure.cleanContent,
                metadata: {
                  ...(output.metadata || {}),
                  chapter: chapterStructure.chapterNumber,
                  splitFromMultiChapter: true
                },
                contentType: 'chapter'
              })
            } else if (chapterPart.trim().length > 100) {
              const sanitized = sanitizeGeneratedContent(chapterPart.trim())
              const wordCount = sanitized.split(/\s+/).filter(word => word.length > 0).length
              const charCount = sanitized.length

              content.totalWords += wordCount
              content.totalCharacters += charCount
              content.metadata.wordCountByNode[`${nodeId}_part_${partIndex + 1}`] = wordCount
              content.metadata.characterCountByNode[`${nodeId}_part_${partIndex + 1}`] = charCount
              content.metadata.nodeCount++

              // Single-content sections do not get structural chapter titles; keep as-is.
              content.sections.push({
                nodeId,
                title: output.metadata?.title || output.metadata?.nodeName || `Section ${content.sections.length + 1}`,
                content: sanitized,
                metadata: {
                  ...(output.metadata || {}),
                  sectionIndex: partIndex + 1,
                  splitFromMultiChapter: true
                },
                contentType: 'single_content'
              })
            }
          })
        } else {
          const chapterStructure = extractChapterStructure(output.content)
          if (chapterStructure && chapterStructure.hasStructure) {
            const wordCount = chapterStructure.cleanContent.split(/\s+/).filter(word => word.length > 0).length
            const charCount = chapterStructure.cleanContent.length

            content.totalWords += wordCount
            content.totalCharacters += charCount
            content.metadata.wordCountByNode[`${nodeId}_single`] = wordCount
            content.metadata.characterCountByNode[`${nodeId}_single`] = charCount
            content.metadata.nodeCount++

            // SURGICAL FIX: Prefer structural title if available
            const canonicalTitle =
              (content.structural.chapterTitles && content.structural.chapterTitles[chapterStructure.chapterNumber]) ||
              chapterStructure.title

            content.sections.push({
              nodeId,
              title: canonicalTitle,
              chapterNumber: chapterStructure.chapterNumber,
              content: chapterStructure.cleanContent,
              metadata: {
                ...(output.metadata || {}),
                chapter: chapterStructure.chapterNumber
              },
              contentType: 'chapter'
            })
          } else {
            const sanitized = sanitizeGeneratedContent(output.content)
            const wordCount = sanitized.split(/\s+/).filter(word => word.length > 0).length
            const charCount = sanitized.length

            content.totalWords += wordCount
            content.totalCharacters += charCount
            content.metadata.wordCountByNode[nodeId] = wordCount
            content.metadata.characterCountByNode[nodeId] = charCount
            content.metadata.nodeCount++

            content.sections.push({
              nodeId,
              title: output.metadata?.title || output.metadata?.nodeName || `Section ${content.sections.length + 1}`,
              content: sanitized,
              metadata: {
                ...(output.metadata || {}),
                sectionIndex: content.sections.length + 1
              },
              contentType: 'single_content'
            })
          }
        }
      } else if (Array.isArray(output.content)) {
        console.log(`⚠️ Node ${nodeId} produced array content outside multi_chapter handler, storing raw`)
        content.generatedContent[nodeId] = output.content
      } else if (typeof output.content === 'object') {
        console.log(`📊 Node ${nodeId} produced structured content (object)`)
        content.generatedContent[nodeId] = output.content
      }
    } else {
      console.log(`ℹ️ Node ${nodeId} content type ${output.type} not included in book compilation`)
    }
  })

  if (content.sections.length === 0) {
    console.warn('⚠️ No sections generated, attempting fallback from first node output')
    const firstNode = Object.values(nodeOutputs)[0]
    if (firstNode?.content && typeof firstNode.content === 'string' && firstNode.content.length > 0) {
      const firstContent = firstNode.content
      const wordCount = firstContent.split(/\s+/).filter(word => word.length > 0).length
      content.sections.push({
        nodeId: Object.keys(nodeOutputs)[0] || 'fallback',
        title: 'Content Section',
        content: sanitizeGeneratedContent(firstContent),
        metadata: { emergencyFallback: true },
        contentType: 'single_content'
      })
      content.totalWords = wordCount
      content.totalCharacters = firstContent.length
      console.warn('⚠️ Emergency section created with', wordCount, 'words')
    } else {
      console.log('✅ Sections created successfully:')
      content.sections.forEach((section, idx) => {
        console.log(`   Section ${idx + 1}:`, {
          title: section.title,
          chapterNumber: section.chapterNumber,
          contentType: section.contentType,
          contentLength: typeof section.content === 'string' ? section.content.length : 'NOT STRING',
          hasContent: !!section.content && (typeof section.content === 'string' ? section.content.trim().length > 0 : false)
        })
      })
    }
  }

  return content
}

module.exports = {
  compileWorkflowContent,
  sanitizeGeneratedContent,
  extractChapterStructure
}


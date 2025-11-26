import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Rocket,
  Download,
  Eye,
  Zap,
  Brain,
  Clock,
  TrendingUp,
  DollarSign,
  FileText,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Layers,
  Cpu,
  Network,
  Activity,
  Target,
  Shield,
  Star,
  ArrowRight,
  RefreshCw,
  Edit3,
  Lightbulb
} from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import toast from 'react-hot-toast'
import UltraButton from './UltraButton'
import AIThinkingModal from './AIThinkingModal'
import UserBookEditorModal from './UserBookEditorModal'
import { sanitizeForExport } from '../utils/sanitize'
import { normalizeExecutionData } from '../utils/normalizeExecutionData'
import { useUserAuth } from '../contexts/UserAuthContext'
import GenerateModal from './GenerateModal'
import dbService from '../services/database'
import { supabase } from '../lib/supabase'

const getAggregatedContent = (executionData) => {
  if (!executionData) {
      return {
      title: 'Untitled',
      foreword: '',
      introduction: '',
      chapters: [],
      html: '',
      markdown: '',
      formats: {},
      formatUrls: {},
      compiledData: null,
      assets: { cover: null, images: [] },
      persistedBook: null,
      bookId: null,
      metadata: {},
      userInput: {}
    }
  }

  const handleImproviseSubmit = async () => {
    if (!activeRegenerateContext) {
      toast.error('No regeneration context available.')
      return
    }

    const instruction = improviseText.trim()
    if (!instruction) {
      toast.error('Please provide guidance before resuming.')
      return
    }

    setImproviseLoading(true)
    try {
      const success = await handleResumeExecution({
        regenerateContext: {
          manualInstruction: instruction,
          manual: true,
          chapterNumber: activeRegenerateContext.chapterNumber,
          targetNodeId: activeRegenerateContext.targetNodeId
        }
      })

      if (success) {
        setShowImproviseModal(false)
        setImproviseText('')
      }
    } catch (error) {
      console.error('❌ Improvise resume failed:', error)
    } finally {
      setImproviseLoading(false)
    }
  }

  const normalizedExecutionData = normalizeExecutionData(executionData)
  const nodeResults = normalizedExecutionData?.nodeResults || {}
  const aiOutputs = normalizedExecutionData?.aiOutputs || []
  const storyContext = normalizedExecutionData?.storyContext || executionData?.storyContext || {}

  const finalOutputEntry = Object.values(nodeResults)
    .reverse()
    .find((entry) => entry?.type === 'final_output' || entry?.metadata?.primaryFormat)

  const compiledData =
    finalOutputEntry?.compiledData ||
    finalOutputEntry?.metadata?.compiledData ||
    normalizedExecutionData?.compiledData ||
    normalizedExecutionData?.executionData?.compiledData ||
    null

  const persistedBook =
    finalOutputEntry?.metadata?.persistedBook ||
    finalOutputEntry?.persistedBook ||
    null

  const allFormats = {
    ...(finalOutputEntry?.metadata?.allFormats || {}),
    ...(finalOutputEntry?.allFormats || {}),
    ...(normalizedExecutionData?.allFormats || {})
  }

  const formatUrls = {
    ...(finalOutputEntry?.formatUrls || {}),
    ...(finalOutputEntry?.metadata?.formatUrls || {}),
    ...(persistedBook?.formatUrls || {})
  }

  const userInput = {
    ...(normalizedExecutionData?.userInput || {}),
    ...(compiledData?.userInput || {}),
    ...(executionData?.userInput || {})
  }

  let title =
    userInput.book_title ||
    userInput.story_title ||
    storyContext?.book?.title ||
    persistedBook?.title ||
    normalizedExecutionData?.metadata?.title ||
    'Untitled Book'

  const structural = {
    foreword: storyContext?.structural?.foreword ||
      compiledData?.structural?.foreword ||
      persistedBook?.content?.structural?.foreword ||
      '',
    forewordTitle: storyContext?.structural?.forewordTitle ||
      compiledData?.structural?.forewordTitle ||
      persistedBook?.content?.structural?.forewordTitle ||
      null,
    introduction: storyContext?.structural?.introduction ||
      compiledData?.structural?.introduction ||
      persistedBook?.content?.structural?.introduction ||
      '',
    introductionTitle: storyContext?.structural?.introductionTitle ||
      compiledData?.structural?.introductionTitle ||
      persistedBook?.content?.structural?.introductionTitle ||
      null,
    tableOfContents: storyContext?.structural?.tableOfContents ||
      compiledData?.structural?.tableOfContents ||
      persistedBook?.content?.structural?.tableOfContents ||
      '',
    tableOfContentsList: storyContext?.structural?.tableOfContentsList ||
      compiledData?.structural?.tableOfContentsList ||
      persistedBook?.content?.structural?.tableOfContentsList ||
      []
  }

  const assets = {
    cover:
      storyContext?.assets?.cover ||
      compiledData?.assets?.cover ||
      persistedBook?.content?.assets?.cover ||
      null,
    images: storyContext?.assets?.images ||
      compiledData?.assets?.images ||
      persistedBook?.content?.assets?.images ||
      []
  }

  const imagePlacementPreference =
    userInput.image_placement ||
    storyContext?.book?.imagePlacement ||
    'auto'

  const resolveChapterKey = (value) => {
    if (value === null || value === undefined) return null
    const parsed = parseInt(value, 10)
    return Number.isNaN(parsed) ? null : parsed
  }

  const imagesByChapter = {}
  const generalImages = []
  ;(assets.images || []).forEach((asset) => {
    const chapterKey =
      resolveChapterKey(asset?.chapterNumber) ||
      resolveChapterKey(asset?.metadata?.chapterNumber) ||
      null
    if (chapterKey !== null) {
      if (!imagesByChapter[chapterKey]) imagesByChapter[chapterKey] = []
      imagesByChapter[chapterKey].push(asset)
    } else {
      generalImages.push(asset)
    }
  })

  let sections = Array.isArray(compiledData?.sections)
    ? compiledData.sections
    : Array.isArray(persistedBook?.content?.sections)
      ? persistedBook.content.sections
      : []

  const contextChapters = Array.isArray(storyContext?.chapters) ? storyContext.chapters : []
  if (contextChapters.length > 0) {
    const compiledMap = new Map(
      sections.map((section) => [
        section?.chapterNumber || section?.number || section?.title,
        section
      ])
    )
    sections = contextChapters.map((chapter, index) => {
      const key = chapter.number || chapter.title || `chapter-${index + 1}`
      const compiledMatch = compiledMap.get(key)
      return {
        id: chapter.id || chapter.nodeId || compiledMatch?.id || `context-${index + 1}`,
        chapterNumber: chapter.number || compiledMatch?.chapterNumber || compiledMatch?.number || index + 1,
        title: chapter.title || compiledMatch?.title || `Chapter ${chapter.number || index + 1}`,
        content: chapter.content || compiledMatch?.content || '',
        metadata: {
          ...(compiledMatch?.metadata || {}),
          ...(chapter.metadata || {}),
          source: 'storyContext'
        },
        nodeId: chapter.nodeId || compiledMatch?.nodeId || null
      }
    })
  }

  if (sections.length === 0) {
    // Fallback to AI outputs if compiled data missing
    const fallbackChapters = []
    const allOutputs = [
      ...Object.values(nodeResults).map((r) => r?.content),
      ...aiOutputs.map((o) => o?.content)
    ].filter(Boolean)

    for (const rawContent of allOutputs) {
      if (typeof rawContent !== 'string') continue
      const trimmed = rawContent.trim()
      if (trimmed.length === 0) continue
      const looksLikeJson = /^[\[{]/.test(trimmed) && /"story_architecture"|\"table_of_contents\"|\"chapter_number\"/i.test(trimmed.substring(0, 800))
      if (looksLikeJson) {
        continue
      }
      const chapterMatches = rawContent.matchAll(/(?:^|\n)##\s*Chapter\s*(\d+):?\s*(.*?)\n([\s\S]*?)(?=\n##\s*Chapter|\n#\s|$)/gim)
      let matched = false
      for (const match of chapterMatches) {
        matched = true
        const chapterNum = parseInt(match[1], 10) || fallbackChapters.length + 1
        const chapterTitle = match[2]?.trim() || `Chapter ${chapterNum}`
        const chapterContent = match[3]?.trim() || ''
        if (chapterContent.length < 50) continue
        fallbackChapters.push({
          nodeId: `fallback-${chapterNum}`,
          title: chapterTitle,
          chapterNumber: chapterNum,
          content: chapterContent,
          metadata: { fallback: true }
        })
      }

      if (!matched && rawContent.length > 200) {
        fallbackChapters.push({
          nodeId: `fallback-${fallbackChapters.length + 1}`,
          title: `Chapter ${fallbackChapters.length + 1}`,
          chapterNumber: fallbackChapters.length + 1,
          content: trimmed,
          metadata: { fallback: true }
        })
      }
    }

    sections = fallbackChapters
  }

  const normalizedChapters = sections
    .filter((section) => section && typeof section.content === 'string')
    .map((section, index) => {
      const chapterNumber = resolveChapterKey(section.chapterNumber) || index + 1
      return {
        id: section.id || `chapter-${index + 1}`,
        number: chapterNumber,
        title: section.title || `Chapter ${chapterNumber}`,
        content: section.content,
        metadata: section.metadata || {},
        nodeId: section.nodeId || null,
        images: imagesByChapter[chapterNumber] || []
      }
    })

  const escapeHtml = (value = '') =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const resolveImageSource = (asset) => {
    if (!asset) return null
    if (typeof asset === 'string') return asset
    if (asset.url) return asset.url
    if (asset.inlineData?.dataUri) return asset.inlineData.dataUri
    if (asset.inlineData?.data) return `data:${asset.inlineData?.mimeType || 'image/png'};base64,${asset.inlineData.data}`
    if (asset.inlineData?.base64Data) return `data:${asset.inlineData?.mimeType || 'image/png'};base64,${asset.inlineData.base64Data}`
    if (asset.inlineData?.base64) return `data:${asset.inlineData?.mimeType || 'image/png'};base64,${asset.inlineData.base64}`
    return null
  }

  const injectInlineBlock = (body = '', injection = '') => {
    const parts = body.split(/\n\n+/)
    if (parts.length > 1) {
      const first = parts.shift()
      return `${first}\n\n${injection}\n\n${parts.join('\n\n')}`
    }
    return `${injection}\n\n${body}`
  }

  const renderHtmlFigure = (asset, index, chapterNumber) => {
    const src = resolveImageSource(asset)
    if (!src) return ''
    const altText = asset.prompt ? escapeHtml(asset.prompt) : `Illustration ${chapterNumber ?? 'gallery'}-${index + 1}`
    const caption = asset.prompt ? `<figcaption>${escapeHtml(asset.prompt)}</figcaption>` : ''
    return `<figure class="chapter-image"><img src="${src}" alt="${altText}" loading="lazy" />${caption}</figure>`
  }

  const renderMarkdownFigure = (asset, chapterNumber) => {
    const src = resolveImageSource(asset)
    if (!src) return ''
    const alt = asset.prompt ? asset.prompt.replace(/\r?\n/g, ' ') : `Illustration ${chapterNumber ?? 'gallery'}`
    const safeAlt = alt.replace(/[\[\]]/g, '')
    return `![${safeAlt}](${src})`
  }

  const resolvePlacementMode = (chapterImages = []) => {
    if (imagePlacementPreference === 'auto') {
      return chapterImages.length > 0 ? 'chapter_header' : 'inline'
    }
    return imagePlacementPreference
  }

  const htmlFromFormats =
    allFormats.html ||
    allFormats.HTML ||
    allFormats['text/html'] ||
    persistedBook?.content?.preview ||
    ''

  const markdownFromFormats =
    allFormats.md ||
    allFormats.markdown ||
    allFormats['text/markdown'] ||
    ''

  const buildHtmlFromSections = () => {
    const authorName = userInput.author_name || 'The Author'
    const aboutAuthor = userInput.about_author || ''
    const aboutAuthorPosition = userInput.about_author_position || 'end'
    
    let html = `<section id="title-page" style="text-align: center; padding: 4rem 2rem; page-break-after: always;">
      <h1 style="font-size: 3.5em; margin-bottom: 1rem; font-weight: 700;">${escapeHtml(title)}</h1>
      <p style="font-size: 1.5em; margin-top: 2rem; color: rgba(255,255,255,0.7);">by ${escapeHtml(authorName)}</p>
    </section>`
    
    if (structural.foreword && aboutAuthorPosition !== 'start') {
      html += `<section id="foreword"><h2>Foreword</h2><div>${structural.foreword}</div></section>`
    }
    if (structural.introduction && aboutAuthorPosition !== 'start') {
      html += `<section id="introduction"><h2>Introduction</h2><div>${structural.introduction}</div></section>`
    }
    
    // Add About Author at start if requested
    if (aboutAuthor && aboutAuthor.trim() && aboutAuthorPosition === 'start') {
      html += `<section id="about-author"><h2>About the Author</h2><div><p><strong>${escapeHtml(authorName)}</strong></p><div>${aboutAuthor}</div></div></section>`
    }
    
    if (normalizedChapters.length > 0) {
      html += '<section id="toc"><h2>Table of Contents</h2><ul>'
      if (structural.foreword) html += '<li><a href="#foreword">Foreword</a></li>'
      if (structural.introduction) html += '<li><a href="#introduction">Introduction</a></li>'
      normalizedChapters.forEach((chap) => {
        html += `<li><a href="#chapter-${chap.number}">${chap.title}</a></li>`
      })
      if (aboutAuthor && aboutAuthor.trim()) html += '<li><a href="#about-author">About the Author</a></li>'
      html += '</ul></section>'
      
      normalizedChapters.forEach((chap) => {
        const figures = (chap.images || [])
          .map((asset, index) => renderHtmlFigure(asset, index, chap.number))
          .filter(Boolean)
          .join('\n')
        const placementMode = resolvePlacementMode(chap.images)
        let chapterBody = chap.content
        if (figures) {
          if (placementMode === 'chapter_header') {
            chapterBody = `${figures}\n\n${chapterBody}`
          } else if (placementMode === 'inline') {
            chapterBody = injectInlineBlock(chapterBody, figures)
          }
        }
        html += `<section id="chapter-${chap.number}"><h2>${chap.title}</h2><div>${chapterBody}</div></section>`
      })
    }
    
    // Add About Author at end if requested (default)
    if (aboutAuthor && aboutAuthor.trim() && aboutAuthorPosition === 'end') {
      html += `<section id="about-author"><h2>About the Author</h2><div><p><strong>${escapeHtml(authorName)}</strong></p><div>${aboutAuthor}</div></div></section>`
    }
    
    if (generalImages.length > 0) {
      const galleryFigures = generalImages
        .map((asset, index) => renderHtmlFigure(asset, index, null))
        .filter(Boolean)
        .join('\n')
      if (galleryFigures) {
        html += `<section id="visual-gallery"><h2>Visual Gallery</h2><div class="chapter-gallery">${galleryFigures}</div></section>`
      }
    }
    return html
  }

  const html = htmlFromFormats || buildHtmlFromSections()

  const chapterMarkdownSections = normalizedChapters.map((chap) => {
    const figures = (chap.images || [])
      .map((asset) => renderMarkdownFigure(asset, chap.number))
      .filter(Boolean)
      .join('\n\n')
    const placementMode = resolvePlacementMode(chap.images)
    let body = chap.content
    if (figures) {
      if (placementMode === 'chapter_header') {
        body = `${figures}\n\n${body}`
      } else if (placementMode === 'inline') {
        body = injectInlineBlock(body, figures)
      }
    }
    return `## ${chap.title}\n\n${body}\n\n`
  })

  let markdown =
    markdownFromFormats ||
    `# ${title}\n\n${structural.foreword ? `## Foreword\n\n${structural.foreword}\n\n` : ''}${structural.introduction ? `## Introduction\n\n${structural.introduction}\n\n` : ''}${chapterMarkdownSections.join('')}`

  if (!markdownFromFormats && generalImages.length > 0) {
    const galleryMarkdown = generalImages
      .map((asset) => renderMarkdownFigure(asset, null))
      .filter(Boolean)
      .join('\n\n')
    if (galleryMarkdown) {
      markdown += `\n\n## Visual Gallery\n\n${galleryMarkdown}\n\n`
    }
  }

  const normalizeFormatKey = (key = '') => {
    if (!key) return ''
    const match = String(key).match(/\(\.(\w+)\)/)
    if (match) return match[1].toLowerCase()
    return String(key).toLowerCase()
  }

  const formatMimeMap = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    html: 'text/html',
    md: 'text/markdown',
    markdown: 'text/markdown',
    txt: 'text/plain',
    epub: 'application/epub+zip'
  }

  const normalizeFormatPayload = (formatKey, payload) => {
    if (payload == null) return null

    const key = normalizeFormatKey(formatKey)
    const defaultMime = formatMimeMap[key] || 'application/octet-stream'

    if (typeof payload === 'string') {
      if (payload.startsWith('data:')) {
        return {
          key,
          dataUri: payload,
          mimeType: payload.split(':')[1]?.split(';')[0] || defaultMime,
          isBinary: true
        }
      }
      return {
        key,
        text: payload,
        mimeType: defaultMime,
        isBinary: false
      }
    }

    if (payload && typeof payload === 'object') {
      const encoding = payload.encoding || payload.formatEncoding
      if ((encoding === 'base64' || encoding === 'buffer') && payload.data != null) {
        let base64Data

        if (typeof payload.data === 'string') {
          // Already base64 string
          base64Data = payload.data
        } else if (Array.isArray(payload.data)) {
          // SURGICAL FIX: Browser-compatible base64 encoding (Buffer doesn't exist in browser)
          const uint8Array = new Uint8Array(payload.data)
          base64Data = btoa(String.fromCharCode.apply(null, uint8Array))
        } else if (payload.data && typeof payload.data === 'object') {
          if (Array.isArray(payload.data.data)) {
            // Nested array - convert to Uint8Array then base64
            const uint8Array = new Uint8Array(payload.data.data)
            base64Data = btoa(String.fromCharCode.apply(null, uint8Array))
          } else if (Array.isArray(payload.data)) {
            const uint8Array = new Uint8Array(payload.data)
            base64Data = btoa(String.fromCharCode.apply(null, uint8Array))
          } else if (payload.data.type === 'Buffer' && Array.isArray(payload.data.data)) {
            // Node.js Buffer format from worker - convert to base64
            const uint8Array = new Uint8Array(payload.data.data)
            base64Data = btoa(String.fromCharCode.apply(null, uint8Array))
          } else {
            const values = Object.values(payload.data)
            if (values.every((val) => typeof val === 'number')) {
              // Array of numbers - treat as binary data
              const uint8Array = new Uint8Array(values)
              base64Data = btoa(String.fromCharCode.apply(null, uint8Array))
            } else {
              // Object - stringify then encode
              const jsonString = JSON.stringify(payload.data)
              base64Data = btoa(unescape(encodeURIComponent(jsonString)))
            }
          }
        } else {
          // String or other - encode as string
          base64Data = btoa(unescape(encodeURIComponent(String(payload.data))))
        }

        const mimeType = payload.mimeType || defaultMime
        return {
          key,
          dataUri: `data:${mimeType};base64,${base64Data}`,
          mimeType,
          isBinary: true,
          size: payload.size || (typeof base64Data === 'string' ? Math.floor(base64Data.length * 0.75) : undefined),
          raw: payload
        }
      }

      if (payload.dataUri || payload.dataURI) {
        const mimeType = payload.mimeType || defaultMime
        return {
          key,
          dataUri: payload.dataUri || payload.dataURI,
          mimeType,
          isBinary: true,
          size: payload.size,
          raw: payload
        }
      }

      if (typeof payload.content === 'string') {
        return {
          key,
          text: payload.content,
          mimeType: payload.mimeType || defaultMime,
          isBinary: false,
          raw: payload
        }
      }
    }

    const fallback = typeof payload === 'string' ? payload : JSON.stringify(payload)
    return {
      key,
      text: fallback,
      mimeType: 'application/json',
      isBinary: false,
      raw: payload
    }
  }

  const normalizedFormats = {}
  const formatMetadata = {}

  const registerFormat = (formatKey, payload) => {
    const normalized = normalizeFormatPayload(formatKey, payload)
    if (!normalized) return
    formatMetadata[normalized.key] = normalized
    if (normalized.dataUri) {
      normalizedFormats[normalized.key] = normalized.dataUri
    } else if (normalized.text) {
      normalizedFormats[normalized.key] = normalized.text
    }
  }

  Object.entries(allFormats || {}).forEach(([key, value]) => registerFormat(key, value))
  registerFormat('html', html)
  registerFormat('md', markdown)
  registerFormat('markdown', markdown)
  registerFormat('txt', markdown.replace(/<[^>]*>?/gm, ''))
  
  return {
    title,
    foreword: structural.foreword,
    introduction: structural.introduction,
    chapters: normalizedChapters,
    html,
    markdown,
    formats: normalizedFormats,
    formatMetadata,
    formatUrls,
    compiledData: compiledData
      ? {
          ...compiledData,
          sections: normalizedChapters.map((chap) => ({
            nodeId: chap.nodeId,
            title: chap.title,
            chapterNumber: chap.number,
            content: chap.content,
            metadata: chap.metadata,
            images: chap.images || []
          })),
          structural,
          assets: {
            ...assets,
            gallery: generalImages
          }
        }
      : null,
    assets: {
      ...assets,
      gallery: generalImages
    },
    imagePlacement: imagePlacementPreference,
    storyContext,
    persistedBook,
    bookId: persistedBook?.bookId || finalOutputEntry?.metadata?.bookId || null,
    metadata: {
      ...(normalizedExecutionData?.metadata || {}),
      ...(finalOutputEntry?.metadata || {}),
      persistedBook,
      imagePlacement: imagePlacementPreference
    },
    userInput
  }
}


const getNodeIcon = (node) => {
  const role = node.data?.role?.toLowerCase() || '';
  if (role.includes('writer')) return FileText;
  if (role.includes('architect') || role.includes('outliner')) return Brain;
  if (role.includes('editor')) return Edit3;
  if (role.includes('image') || role.includes('ecover')) return Zap;
  return Cpu;
};

const UserExecutionModal = ({
  isOpen,
  onClose,
  executionData,
  onForceStop,
  onRestart,
  pollingIssue = false
}) => {
  const [isResuming, setIsResuming] = useState(false)
  const [showImproviseModal, setShowImproviseModal] = useState(false)
  const [improviseText, setImproviseText] = useState('')
  const [improviseLoading, setImproviseLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const { user } = useUserAuth()
  
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(false)
  const [particles, setParticles] = useState([])
  const [progressHistory, setProgressHistory] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showAIThinkingModal, setShowAIThinkingModal] = useState(false)
  const [stopAttempted, setStopAttempted] = useState(false)
  const [stopTimeout, setStopTimeout] = useState(null)
  const [showBookEditor, setShowBookEditor] = useState(false)
  const [bookEditorData, setBookEditorData] = useState(null)
  const [downloadInProgress, setDownloadInProgress] = useState(false)
  const [persistedPipelineSteps, setPersistedPipelineSteps] = useState([])
  const autoSavedExecutionsRef = useRef(new Set())
  const autoSavingExecutionsRef = useRef(new Set())
  const [showReRunModal, setShowReRunModal] = useState(false)
  const [reRunEngine, setReRunEngine] = useState(null)
  // AI Terminal state (manual guidance + sampling controls)
  const [aiGuidance, setAiGuidance] = useState('')
  const [aiTemp, setAiTemp] = useState(0.7)
  const [aiTopP, setAiTopP] = useState(0.9)
  const [aiPresencePenalty, setAiPresencePenalty] = useState(0.6)
  const [aiTerminalBusy, setAiTerminalBusy] = useState(false)
  
  const progressRef = useRef(0)
  const prevProgressRef = useRef(0)
  const prevNodeRef = useRef(null)
  const prevStatusRef = useRef(null)

  const normalizedExecutionData = useMemo(() => normalizeExecutionData(executionData || {}), [executionData])
  const execData = normalizedExecutionData
  const hasNodeResults = !!execData && Object.keys(execData.nodeResults || {}).length > 0
  const hasPartialContent = hasNodeResults || (execData?.aiOutputs?.length > 0)
  const canDownloadFinal = (executionData?.status === 'completed')
    && hasPartialContent
  const canDownloadPartial = ['running', 'failed', 'cancelled', 'cancelling'].includes(executionData?.status || '')
    && hasPartialContent
  
  const activeRegenerateContext = useMemo(() => {
    return execData?.regenerateContext
      || execData?.executionData?.regenerateContext
      || execData?.checkpointData?.regenerateContext
      || null
  }, [execData])

  const shouldShowImprovise = useMemo(() => {
    const status = execData?.status || executionData?.status
    if (status !== 'failed') return false
    if (!activeRegenerateContext) return false
    return activeRegenerateContext.requireManual === true
  }, [activeRegenerateContext, execData?.status, executionData?.status])

  // Prefill AI Terminal guidance from validator errors (e.g. REPETITIVE_CONTENT)
  useEffect(() => {
    const err = executionData?.error || ''
    if (!err || typeof err !== 'string') return
    if (!/repetitive_content/i.test(err)) return
    // Keep it short and editable for the Boss
    const baseHint = `Validator flagged repetitive content. Fix this by:\n` +
      `- Avoiding repeated phrases and sentence openings\n` +
      `- Varying verbs and structures\n` +
      `- Tightening any loops or filler\n\n` +
      `Rewrite this chapter with richer variation while keeping the same plot beats.`
    setAiGuidance((prev) => prev && prev.trim().length > 0 ? prev : baseHint)
  }, [executionData?.error])

  // SURGICAL FIX: Add total accumulation state variables
  const [totalTokens, setTotalTokens] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [liveLog, setLiveLog] = useState([]);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (execData?.status === 'running' && execData?.currentNode && execData.currentNode !== prevNodeRef.current) {
      const newNodeName = execData.nodes?.find(n => n.id === execData.currentNode)?.data?.label || execData.currentNode;
      setLiveLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ⚡ Starting: ${newNodeName}`]);
      prevNodeRef.current = execData.currentNode;
    }
    if (execData?.status === 'completed' || execData?.status === 'failed') {
      if (!liveLog.some(l => l.includes('Execution finished'))) {
        setLiveLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Execution finished with status: ${execData.status.toUpperCase()}`]);
      }
    }
  }, [execData?.status, execData?.currentNode, execData?.nodes, liveLog]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [liveLog]);
  
  // Get available formats from executionData
  const getAvailableFormats = () => {
    // SURGICAL FIX: Check multiple locations for formats
    
    // Check nodeResults for output node with formats
    if (execData?.nodeResults) {
      const outputNode = Object.entries(execData.nodeResults).find(([id, result]) => 
        result?.metadata?.allFormats || result?.type === 'final_output'
      )
      
      if (outputNode && outputNode[1].metadata?.allFormats) {
        return Object.keys(outputNode[1].metadata.allFormats).filter(f => outputNode[1].metadata.allFormats[f] != null)
      }
    }
    
    // Fallback to executionData.allFormats
    if (execData?.allFormats) {
      return Object.keys(execData.allFormats)
    }
    
    // Final fallback: If we have aiOutputs, offer basic text/html formats
    if (execData?.aiOutputs && execData.aiOutputs.length > 0) {
      return ['txt', 'html']
    }
    
    return []
  }

  const openReRunWithPrefill = async () => {
    try {
      const engineId = execData?.engineId || execData?.userEngineId
      if (!engineId) {
        toast.error('Engine ID not found for re-run')
        return
      }
      const blueprint = await dbService.getEngineBlueprint(engineId)
      if (!blueprint) {
        toast.error('Engine blueprint not found')
        return
      }
      setReRunEngine(blueprint)
      setShowReRunModal(true)
    } catch (e) {
      console.error('Failed to prepare re-run modal:', e)
      toast.error('Failed to open Re-Run editor')
    }
  }

  // Resume failed execution from checkpoint
  const handleResumeExecution = async (override = {}) => {
    if (!execData?.id && !execData?.executionId) {
      toast.error('Execution ID not found')
      return
    }
    
    // Allow resume on ANY failed execution - no resumable flag required
    
    if (!execData?.nodes || !execData?.edges) {
      toast.error('Workflow data (nodes/edges) not available for resume')
      return
    }
    
    setIsResuming(true)

    try {
      const executionId = execData.id || execData.executionId
      
      let nodes = execData.nodes;
      let edges = execData.edges;

      // SURGICAL FIX: If nodes/edges are missing, fetch them from the engine blueprint
      if (!nodes || !edges || nodes.length === 0 || edges.length === 0) {
        toast.loading('Workflow blueprint missing, fetching from database...');
        console.log(' M.I.A. - fetching blueprint for engine ID:', execData.userEngineId || execData.engineId);
        const blueprint = await dbService.getEngineBlueprint(execData.userEngineId || execData.engineId);
        if (blueprint) {
          nodes = blueprint.nodes;
          edges = blueprint.edges;
          toast.dismiss();
          toast.success('Blueprint recovered!');
        } else {
          throw new Error('Could not recover engine blueprint.');
        }
      }

      const resumeApiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/engines-api/${execData.userEngineId || execData.engineId}/resume`

      const resumeInputs = execData?.userInput || execData?.input_data || executionData?.input_data || {}
      const baseOptions = execData?.options
        || execData?.executionData?.options
        || executionData?.options
        || {}
      const failedNodeId = execData?.failedNodeId
        || execData?.checkpointData?.failedAtNode
        || executionData?.failedNodeId
        || executionData?.checkpointData?.failedAtNode
        || null
      const baseRegenerateContext = execData?.regenerateContext
        || execData?.executionData?.regenerateContext
        || executionData?.regenerateContext
        || null
      
      const outgoingOptions = {
        ...baseOptions,
        ...(override.options || {})
      }
      
      const outgoingRegenerateContext = {
        ...(baseRegenerateContext || {}),
        ...(override.regenerateContext || {})
      }
      
      const response = await fetch(resumeApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-API-Key': execData.apiKey || ''
        },
        body: JSON.stringify({
          executionId: executionId,
          engineId: execData.engineId,
          userEngineId: execData.userEngineId,
          userId: execData.userId,
          nodes: nodes, // Use the potentially recovered nodes
          edges: edges,  // Use the potentially recovered edges
          inputs: resumeInputs,
          options: outgoingOptions,
          failedNodeId,
          retryFailedNode: true,
          regenerateContext: Object.keys(outgoingRegenerateContext).length > 0 ? outgoingRegenerateContext : undefined
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to resume execution')
      }
      
      await response.json()
      toast.success('🔄 Execution resumed successfully! Continuing from checkpoint...')
      
      // The execution will continue and poll updates will show progress
      // No need to close modal - let it continue showing progress
      return true
    } catch (error) {
      console.error('❌ Resume failed:', error)
      toast.error(`Failed to resume: ${error.message}`)
    } finally {
      setIsResuming(false)
    }
    return false
  }

  // AI Terminal trigger – resume from checkpoint with manual guidance + sampling overrides
  const handleAiTerminalResume = async () => {
    if (!execData?.id && !execData?.executionId) {
      toast.error('Execution ID not found')
      return
    }
    if (!aiGuidance || !aiGuidance.trim()) {
      toast.error('Add guidance for the AI before resuming')
      return
    }
    setAiTerminalBusy(true)
    try {
      await handleResumeExecution({
        options: {
          temperature: aiTemp,
          top_p: aiTopP,
          presence_penalty: aiPresencePenalty
        },
        regenerateContext: {
          manualInstruction: aiGuidance.trim(),
          manual: true
        }
      })
    } finally {
      setAiTerminalBusy(false)
    }
  }

  // Save book to My Books database
  const saveToMyBooks = async (aggregatedContent, formats) => {
    try {
      if (!user?.id) {
        toast.error('User not authenticated')
        return
      }

      // SURGICAL FIX: Handle both aggregated object and direct formattedOutputs
      // aggregatedContent can be either:
      // 1. The full aggregated object from getAggregatedContent (has .formats, .chapters, html, markdown, etc.)
      // 2. Direct formattedOutputs object (has format keys like .markdown, .html, etc.)
      const formattedOutputs = aggregatedContent?.formats || aggregatedContent?.allFormats || aggregatedContent
      
      // Get book details from aggregated content or execution data
      const bookTitle = aggregatedContent?.title || execData?.userInput?.book_title || execData?.userInput?.story_title || 'Generated Book'
      const bookType = execData?.userInput?.type || 'ebook'
      const niche = execData?.userInput?.genre || execData?.userInput?.niche || 'general'
      const targetAudience = execData?.userInput?.target_audience || 'general'
      const tone = execData?.userInput?.tone || 'professional'
      
      // Calculate total word count from chapters or content
      let totalWords = 0
      if (aggregatedContent?.chapters && Array.isArray(aggregatedContent.chapters)) {
        aggregatedContent.chapters.forEach(chapter => {
          if (chapter?.content && typeof chapter.content === 'string') {
            totalWords += chapter.content.split(/\s+/).length
          }
        })
      } else if (execData?.nodeResults) {
        Object.values(execData.nodeResults).forEach(result => {
          if (result?.content && typeof result.content === 'string') {
            totalWords += result.content.split(/\s+/).length
          }
        })
      }

      // Get token count from execution data
      const tokens = execData?.tokens || execData?.metadata?.totalTokens || 0

      // Get execution identifier first
      const executionIdentifier = execData?.id || execData?.executionId || null

      // SURGICAL FIX: Determine status - prioritize having content over execution state
      // If we have formatted outputs OR chapters, the book is ready
      let status = 'draft'
      
      // Primary check: If we have formatted outputs OR chapters, book is completed
      const hasFormattedOutputs = formattedOutputs && Object.keys(formattedOutputs).length > 0
      const hasChapters = aggregatedContent?.chapters && Array.isArray(aggregatedContent.chapters) && aggregatedContent.chapters.length > 0
      
      if (hasFormattedOutputs || hasChapters) {
        status = 'completed'
      } else if (execData?.status === 'completed') {
        // Execution completed but no outputs yet - still mark as completed
        status = 'completed'
      } else if (execData?.status === 'failed' || execData?.status === 'cancelled') {
        status = 'generating'
      } else if (execData?.status === 'running') {
        status = 'generating'
      }

      // Optional: Double-check with database if we have execution ID (non-blocking)
      if (executionIdentifier && status !== 'completed') {
        try {
          const { data: executionRecord, error: execError } = await supabase
            .from('engine_executions')
            .select('status')
            .eq('id', executionIdentifier)
            .maybeSingle() // Use maybeSingle to avoid errors if not found
          
          if (!execError && executionRecord?.status === 'completed') {
            status = 'completed'
          }
        } catch (error) {
          // Silently fail - we already have a status from above
          console.debug('Could not verify execution status from database:', error.message)
        }
      }
      
      const formatsArray = Array.isArray(formats)
        ? Array.from(new Set(formats))
        : Object.keys(formats || formattedOutputs || {})

      // Prepare book data for database
      // SURGICAL FIX: Save the full aggregated content structure, including html/markdown, not just formats
      // Resolve html/markdown from aggregated content or formats (universal, works for all engines)
      const resolvedHtml =
        aggregatedContent?.html ||
        formattedOutputs?.html ||
        formattedOutputs?.HTML ||
        formattedOutputs?.['text/html'] ||
        ''

      const resolvedMarkdown =
        aggregatedContent?.markdown ||
        formattedOutputs?.markdown ||
        formattedOutputs?.md ||
        formattedOutputs?.['text/markdown'] ||
        ''

      const bookContent = {
        html: resolvedHtml,
        markdown: resolvedMarkdown,
        chapters: aggregatedContent?.chapters || [],
        formats: formattedOutputs || {},
        structural: aggregatedContent?.structural || {},
        assets: aggregatedContent?.assets || {},
        metadata: aggregatedContent?.metadata || {},
        userInput: aggregatedContent?.userInput || execData?.userInput || {}
      }
      
      const bookData = {
        user_id: user.id,
        title: bookTitle,
        type: bookType,
        niche: niche,
        target_audience: targetAudience,
        tone: tone,
        status: status,
        content: bookContent,
        metadata: {
          formats: formatsArray,
          execution_id: executionIdentifier,
          tokens_used: tokens,
          word_count: totalWords,
          chapter_count: execData?.userInput?.chapter_count || '1',
          created_from: 'execution_download',
          original_input: execData?.userInput
        },
        ai_service: execData?.aiService || execData?.provider || 'openai', // Use detected service or default
        word_count: totalWords
      }

      let savedBook

      if (executionIdentifier) {
        const { data: existingBook, error: existingError } = await supabase
          .from('books')
          .select('*')
          .eq('user_id', user.id)
          .eq('metadata->>execution_id', executionIdentifier)
          .limit(1)
          .maybeSingle()

        if (existingError && existingError.code !== 'PGRST116') {
          throw existingError
        }

        if (existingBook) {
          savedBook = await dbService.updateBook(existingBook.id, {
            ...bookData,
            updated_at: new Date().toISOString()
          })
        } else {
          savedBook = await dbService.createBook(bookData)
        }
      } else {
        savedBook = await dbService.createBook(bookData)
      }
      
      toast.success(`📚 Book "${bookTitle}" saved to My Books!`)
      console.log('✅ Book saved to My Books:', savedBook.id)
      return savedBook

    } catch (error) {
      console.error('❌ Failed to save book to My Books:', error)
      toast.error('Failed to save book to library')
      throw error
    }
  }

  const handlePartialDownload = (format) => {
    if (!format) {
      handleDownloadAllFormats()
      return
    }

    try {
      const aggregated = getAggregatedContent(execData)
      if (!aggregated || aggregated.chapters.length === 0) {
        toast.error('No chapters available yet. Let the specialists write a bit more.')
        return
      }

      const safeTitle = (aggregated.title || 'lekhika_partial')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'lekhika_partial'

      let content = ''
      let extension = 'md'
      let mimeType = 'text/markdown'

      if (format === 'html' && aggregated.html) {
        content = aggregated.html
        extension = 'html'
        mimeType = 'text/html'
      } else if (format === 'txt') {
        content = aggregated.formats?.txt || aggregated.markdown?.replace(/<[^>]*>/g, '') || aggregated.html || ''
        extension = 'txt'
        mimeType = 'text/plain'
      } else {
        content = aggregated.markdown || aggregated.html || ''
        extension = 'md'
        mimeType = 'text/markdown'
      }

      if (!content || content.trim().length === 0) {
        toast.error('Partial content is still empty. Give the AI a moment.')
        return
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${safeTitle}-${new Date().toISOString().split('T')[0]}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Partial ${extension.toUpperCase()} download ready!`)
    } catch (error) {
      console.error('❌ Partial download failed:', error)
      toast.error('Failed to prepare partial download')
    }
  }

  const handleDownloadAllFormats = async () => {
    try {
      setDownloadInProgress(true)

      const aggregated = getAggregatedContent(execData)
      // SURGICAL FIX: Check if chapters exist in storyContext or nodeResults (like AI Thinking Modal)
      const hasChapters = (aggregated?.chapters && aggregated.chapters.length > 0) ||
                         (execData?.storyContext?.chapters && execData.storyContext.chapters.length > 0)
      
      if (!hasChapters && !hasPartialContent) {
        toast.error('No chapters available yet. Let the specialists write a bit more.')
        return
      }

      // SURGICAL FIX: Get formats from user input or use defaults (normalize + dedupe)
      const normalizeFormat = (fmt) => {
        const f = String(fmt || '').trim().toLowerCase()
        if (['plain text','plaintext','plain_text','text'].includes(f)) return 'txt'
        if (['htm','htr'].includes(f)) return 'html'
        if (f === 'markdown') return 'md'
        return f
      }
      const userInputFormatsRaw = aggregated?.userInput?.output_formats || 
                                  aggregated?.userInput?.outputFormats ||
                                  aggregated?.userInput?.['Output Formats'] ||
                                  []
      const userInputFormats = Array.isArray(userInputFormatsRaw) ? userInputFormatsRaw.map(normalizeFormat) : []
      const defaultFormats = getAvailableFormats().map(normalizeFormat)
      const formatsToDownload = Array.from(new Set((userInputFormats.length > 0 ? userInputFormats : defaultFormats).filter(Boolean)))
      const formatUrls = execData?.allFormats || {}
      const formatMetaMap = aggregated.formatMetadata || {}

      if (!aggregated) {
        toast.error('No content available yet.')
        return
      }

      const mimeMap = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        html: 'text/html',
        md: 'text/markdown',
        markdown: 'text/markdown',
        txt: 'text/plain',
        epub: 'application/epub+zip'
      }
      
      const safeTitle = (aggregated.title || 'lekhika_book')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'lekhika_book'
      
      const downloadedFormats = []

      const downloadBlob = (blob, extension) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${safeTitle}-${new Date().toISOString().split('T')[0]}.${extension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      const looksLikeHtml = (value) => {
        if (typeof value !== 'string') return false
        const sample = value.trim().slice(0, 50).toLowerCase()
        return sample.startsWith('<!doctype html') || sample.startsWith('<html')
      }

      for (const format of formatsToDownload) {
        const lowerFormat = format.toLowerCase()
        const extension = lowerFormat === 'markdown' ? 'md' : lowerFormat
        const mimeType = mimeMap[lowerFormat] || 'text/plain'
        const downloadUrl = formatUrls[format] || formatUrls[lowerFormat]
        const meta = formatMetaMap[lowerFormat] || formatMetaMap[format]

        try {
        if (downloadUrl) {
            const trimmedUrl = typeof downloadUrl === 'string' ? downloadUrl.trim() : ''

            if (/^https?:\/\//i.test(trimmedUrl)) {
              const response = await fetch(trimmedUrl)
              if (!response.ok) throw new Error(`Failed to fetch ${format} from ${trimmedUrl}`)
              const blob = await response.blob()
              downloadBlob(blob, extension)
          downloadedFormats.push(format)
          continue
            }

            if (trimmedUrl.startsWith('data:')) {
              const blob = await (await fetch(trimmedUrl)).blob()
              downloadBlob(blob, extension)
              downloadedFormats.push(format)
              continue
            }

            if (looksLikeHtml(trimmedUrl)) {
              const blob = new Blob([trimmedUrl], { type: 'text/html' })
              downloadBlob(blob, extension)
              downloadedFormats.push(format)
              continue
            }

            // Treat any other inline string as raw content
            if (trimmedUrl.length > 0) {
              const blob = new Blob([trimmedUrl], { type: mimeType })
              downloadBlob(blob, extension)
              downloadedFormats.push(format)
              continue
            }
          }

          if (meta) {
            if (meta.dataUri) {
              const blob = await (await fetch(meta.dataUri)).blob()
              downloadBlob(blob, extension)
              downloadedFormats.push(format)
              continue
            }

            if (meta.text) {
              const blob = new Blob([meta.text], { type: meta.mimeType || mimeType })
              downloadBlob(blob, extension)
              downloadedFormats.push(format)
              continue
            }
        }

        const formatContent =
          aggregated.formats?.[lowerFormat] ||
          aggregated.formats?.[format] ||
          (lowerFormat === 'txt' ? (aggregated.markdown?.replace(/<[^>]*>/g, '') || aggregated.html) : null) ||
          (lowerFormat === 'md' ? aggregated.markdown : null) ||
          (lowerFormat === 'html' ? aggregated.html : null)

        if (!formatContent) {
          console.warn(`No inline content available for ${format}`)
          continue
        }

          const contentBlob = new Blob([formatContent], { type: mimeType })
          downloadBlob(contentBlob, extension)
        downloadedFormats.push(format)
        } catch (err) {
          console.error(`❌ Failed to download ${format}:`, err)
        }
      }

      if (downloadedFormats.length === 0) {
        toast.error('Formats were not ready to download. Please try again after a moment.')
        return
      }

      toast.success(`Downloaded ${downloadedFormats.join(', ')}`)

      try {
        await saveToMyBooks(aggregated, formatsToDownload)
      } catch (error) {
        console.error('❌ Library sync failed after download:', error)
      }
    } catch (error) {
      console.error('❌ Download all formats failed:', error)
      toast.error('Failed to prepare downloads.')
    } finally {
      setDownloadInProgress(false)
    }
  }


  // Confetti on completion (only once per transition)
  useEffect(() => {
    const currentStatus = executionData?.status
    if (currentStatus === 'completed' && prevStatusRef.current !== 'completed') {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 8000)
    }
    if (currentStatus && currentStatus !== 'completed') {
      setShowConfetti(false)
    }
    prevStatusRef.current = currentStatus
  }, [executionData?.status])

  // Generate floating particles during AI thinking
  useEffect(() => {
    if (executionData?.status === 'running' && executionData?.aiThinking) {
      const interval = setInterval(() => {
        setParticles(prev => [
          ...prev.slice(-15),
          {
            id: Date.now() + Math.random(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            opacity: Math.random() * 0.8 + 0.2
          }
        ])
      }, 150)
      return () => clearInterval(interval)
    }
  }, [executionData?.status, executionData?.aiThinking])

  // Track progress changes for smooth animations
  useEffect(() => {
    if (executionData?.progress !== undefined) {
      const currentProgress = executionData.progress
      const prevProgress = prevProgressRef.current
      
      if (currentProgress > prevProgress) {
        setProgressHistory(prev => [...prev.slice(-10), { 
          progress: currentProgress, 
          timestamp: Date.now(),
          nodeName: executionData.currentNode
        }])
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 800)
      }
      
      prevProgressRef.current = currentProgress
      progressRef.current = currentProgress
    }
  }, [executionData?.progress, executionData?.currentNode])
  
  // SURGICAL FIX: Accumulate totals from execution data
  useEffect(() => {
    if (!execData) return

    if (typeof execData.tokens === 'number') {
      setTotalTokens(prev => Math.max(prev, execData.tokens))
      }
    if (typeof execData.words === 'number') {
      setTotalWords(prev => Math.max(prev, execData.words))
    }
  }, [execData?.tokens, execData?.words])

  const getStatusColor = () => {
    switch (executionData?.status) {
      case 'completed': return '#10b981'
      case 'failed': return '#ef4444'
      case 'running': return '#3b82f6'
      case 'cancelling': return '#f59e0b'
      case 'cancelled': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = () => {
    switch (executionData?.status) {
      case 'completed': return CheckCircle
      case 'failed': return AlertTriangle
      case 'running': return Loader2
      case 'cancelling': return Loader2
      case 'cancelled': return StopCircle
      default: return PlayCircle
    }
  }

  const StatusIcon = getStatusIcon()
  const progress = executionData?.progress ?? 0
  const status = executionData?.status || 'unknown'
  const nodeName = executionData?.nodeName || executionData?.currentNode || 'Processing...'

  // Calculate progress segments for visual feedback
  const progressSegments = [
    { name: 'Initialize', range: [0, 20], color: '#3b82f6', description: 'Setting up workflow and validating inputs' },
    { name: 'AI Processing', range: [20, 60], color: '#8b5cf6', description: 'AI is analyzing and generating content' },
    { name: 'Content Generation', range: [60, 85], color: '#ec4899', description: 'Creating final content output' },
    { name: 'Finalizing', range: [85, 100], color: '#10b981', description: 'Processing and validating results' }
  ]

  const currentSegment = progressSegments.find(seg => 
    progress >= seg.range[0] && progress < seg.range[1]
  ) || progressSegments[3]

  // Calculate chapter progress - ENHANCED to use real chapter info from worker
  const nodeResults = executionData?.nodeResults || {}
  const blueprintNodes = execData?.nodes || []
  const orderedNodeIds = blueprintNodes.map((node) => node?.id).filter(Boolean)
  const completedNodeIds = orderedNodeIds.length > 0
    ? orderedNodeIds.filter((nodeId) => nodeResults[nodeId])
    : Object.keys(nodeResults)
  const completedSteps = completedNodeIds.length
  const totalSteps = blueprintNodes.length > 0
    ? blueprintNodes.length
    : Math.max(Object.keys(nodeResults).length, completedSteps, 1)
  const runningNodeId = executionData?.currentNode || execData?.currentNode || null
  const failedNodeId = execData?.failedNodeId || execData?.checkpointData?.failedAtNode || executionData?.failedNodeId || null
  const failedIndex = failedNodeId ? orderedNodeIds.indexOf(failedNodeId) : -1

  const nodeLookup = useMemo(() => {
    const map = {}
    blueprintNodes.forEach((node) => {
      if (!node || !node.id) return
      map[node.id] = node
    })
    return map
  }, [blueprintNodes])

  let currentStepNumber = completedSteps + (runningNodeId ? 1 : 0)
  if (status === 'completed') {
    currentStepNumber = totalSteps
  } else if (status === 'failed' && failedIndex >= 0) {
    currentStepNumber = Math.max(failedIndex + 1, completedSteps || 1)
  }
  currentStepNumber = Math.min(Math.max(currentStepNumber, completedSteps || 1), Math.max(totalSteps, 1))

  let chapterProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : progress || 0
    
  // CRITICAL: Use actual chapter info from worker if available for writer nodes
  const chapterInfo = executionData?.chapterInfo || execData?.chapterInfo
  const currentNodeLabel = runningNodeId
    ? nodeLookup[runningNodeId]?.data?.label || nodeLookup[runningNodeId]?.label || ''
    : execData?.nodeName || executionData?.nodeName || ''
  const isChapterMode = !!chapterInfo && /writer|chapter/i.test((currentNodeLabel || '').toLowerCase())
  let currentChapter = currentStepNumber
  let totalChapters = totalSteps

  if (isChapterMode) {
    const detectedTotal = chapterInfo.totalChapters || chapterInfo.total || chapterInfo.max || totalSteps
    const detectedCurrent = chapterInfo.currentChapter || chapterInfo.current || chapterInfo.active || currentStepNumber

    totalChapters = Math.max(detectedTotal || totalSteps || 1, 1)
    currentChapter = Math.min(Math.max(detectedCurrent || 1, 1), totalChapters)

    if (totalChapters > 0) {
      chapterProgress = Math.round((currentChapter / totalChapters) * 100)
    }
  }

  chapterProgress = Math.min(Math.max(chapterProgress, 0), 100)
  
  // For backward compatibility, keep totalNodes for existing references
  const totalNodes = totalChapters

  const pipelineSteps = useMemo(() => {
    const steps = []
    const seen = new Set()
    const processingSteps =
      (executionData?.processingSteps || execData?.processingSteps || [])
        .filter(Boolean)
    // Build quick lookup by nodeId for live status without reordering
    const processingById = new Map(
      processingSteps
        .filter(ps => ps && (ps.nodeId || ps.id))
        .map(ps => [ps.nodeId || ps.id, ps])
    )

    const stepStatusMeta = (statusValue) => {
      switch (statusValue) {
        case 'completed':
          return { icon: '✅', color: '#10b981', progress: 100 }
        case 'running':
          return { icon: '🔄', color: '#8b5cf6', progress: executionData?.progress || progress || 0 }
        case 'failed':
          return { icon: '⚠️', color: '#ef4444', progress: 0 }
        case 'skipped':
          return { icon: '⏭️', color: '#22d3ee', progress: 100 }
        default:
          return { icon: '⏳', color: '#6b7280', progress: 0 }
      }
    }

    const appendStep = (baseStep) => {
      if (!baseStep) return
      // SURGICAL FIX: Ensure unique ID - never use empty string
      const candidateId = baseStep.nodeId || baseStep.id || `step-${steps.length}-${Date.now()}`
      if (!candidateId || candidateId === '' || seen.has(candidateId)) {
        // If ID is empty or duplicate, generate unique one
        const uniqueId = `step-${steps.length}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        seen.add(uniqueId)
        steps.push({
          ...baseStep,
          id: uniqueId,
          nodeId: baseStep.nodeId || uniqueId
        })
        return
      }
      seen.add(candidateId)
      steps.push({
        ...baseStep,
        id: candidateId,
        nodeId: baseStep.nodeId || candidateId
      })
    }

    // Canonical ordering: strictly follow blueprintNodes
    blueprintNodes.forEach((node, index) => {
      if (!node) return
      const nodeId = node.id || `node-${index}`
      if (seen.has(nodeId)) return
      const result = nodeResults[nodeId]
      const proc = processingById.get(nodeId)

      // Determine status without bumping position
      let stepStatus = 'pending'
      if (proc?.skipped || result?.skipped) stepStatus = 'skipped'
      else if (proc?.status === 'failed' || result?.status === 'failed' || failedNodeId === nodeId) stepStatus = 'failed'
      else if (proc?.status === 'running' || (runningNodeId === nodeId && status === 'running')) stepStatus = 'running'
      else if (result) stepStatus = 'completed'
      else if (status === 'failed' && failedIndex >= 0 && index < failedIndex) stepStatus = 'completed'

      const meta = stepStatusMeta(stepStatus)

      // SURGICAL FIX: Extract chapter info and format step name with chapter progress
      const nodeLabel = node?.data?.label || nodeId
      const isWriterNode = /writer|chapter/i.test((nodeLabel || '').toLowerCase())
      let stepDisplayName = `Step ${index + 1}: ${nodeLabel}`
      
      // SURGICAL FIX: Add chapter progress (Chapter X/Y) to writer nodes
      if (isWriterNode && chapterInfo) {
        const current = chapterInfo.currentChapter || chapterInfo.current || 0
        const total = chapterInfo.totalChapters || chapterInfo.total || 0
        if (total > 0 && stepStatus === 'running') {
          stepDisplayName = `Step ${index + 1}: ${nodeLabel} (Chapter ${current}/${total})`
        }
      }

      appendStep({
        id: nodeId,
        nodeId,
        name: stepDisplayName,
        status: stepStatus,
        icon: meta.icon,
        color: meta.color,
        progress: stepStatus === 'running'
          ? (typeof proc?.progress === 'number' ? proc.progress : (typeof result?.progress === 'number' ? result.progress : meta.progress))
          : meta.progress,
        tokens: proc?.tokens || result?.tokens || result?.aiMetadata?.tokens,
        words: proc?.words || result?.words || result?.aiMetadata?.words,
        // SURGICAL FIX: Ensure provider name is always included and displayed
        provider: proc?.provider || proc?.providerName || result?.providerName || result?.provider || executionData?.providerName || execData?.providerName,
        chapterInfo: stepStatus === 'running' ? chapterInfo : null
      })
    })

    // Ensure total steps equals blueprint node count; no extra placeholders or orphan bumps

    return steps
  }, [
    executionData?.processingSteps,
    execData?.processingSteps,
    blueprintNodes,
    nodeResults,
    runningNodeId,
    status,
    progress,
    failedNodeId,
    failedIndex,
    totalSteps,
    chapterInfo
  ])

  const displayedPipelineSteps = pipelineSteps.length > 0 ? pipelineSteps : persistedPipelineSteps

  useEffect(() => {
    if (pipelineSteps.length > 0) {
      setPersistedPipelineSteps(pipelineSteps)
    }
  }, [pipelineSteps])

  useEffect(() => {
    if (!isOpen) {
      setPersistedPipelineSteps([])
      autoSavedExecutionsRef.current.clear()
      autoSavingExecutionsRef.current.clear()
    }
  }, [isOpen])

  useEffect(() => {
    const executionId = execData?.id || execData?.executionId
    if (!executionId) return

    // SURGICAL FIX: Check both execData and executionData status, and check for content availability
    const currentStatus = executionData?.status || execData?.status
    if (currentStatus !== 'completed') return
    
    // SURGICAL FIX: Get aggregated content first to check for content
    const aggregated = getAggregatedContent(execData)
    
    // SURGICAL FIX: Check for content in multiple places - chapters, formattedOutputs, or nodeResults
    const hasChapters = aggregated?.chapters && Array.isArray(aggregated.chapters) && aggregated.chapters.length > 0
    const hasFormattedOutputs = execData?.formattedOutputs && Object.keys(execData.formattedOutputs || {}).length > 0
    const hasNodeResults = execData?.nodeResults && Object.keys(execData.nodeResults || {}).length > 0
    const hasStoryContext = executionData?.storyContext?.chapters && Array.isArray(executionData.storyContext.chapters) && executionData.storyContext.chapters.length > 0
    
    if (!hasChapters && !hasFormattedOutputs && !hasNodeResults && !hasStoryContext && !hasPartialContent) return
    if (autoSavedExecutionsRef.current.has(executionId) || autoSavingExecutionsRef.current.has(executionId)) return

    const formats = getAvailableFormats()
    if (!aggregated || formats.length === 0) return

    autoSavingExecutionsRef.current.add(executionId)
    ;(async () => {
      try {
        await saveToMyBooks(aggregated, formats)
        autoSavedExecutionsRef.current.add(executionId)
        console.log('✅ Book auto-saved to My Books:', executionId)
      } catch (error) {
        console.error('❌ Auto-save failed:', error)
      } finally {
        autoSavingExecutionsRef.current.delete(executionId)
      }
    })()
  }, [execData?.status, executionData?.status, execData?.id, execData?.executionId, execData?.formattedOutputs, execData?.nodeResults, executionData?.storyContext, hasPartialContent])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="execution-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          // IMPORTANT: Do NOT close on backdrop click – prevents accidental loss of execution view
        >
          {/* Confetti for completion */}
          {showConfetti && (
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={800}
              gravity={0.2}
              colors={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']}
            />
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.4, 0, 0.2, 1],
              type: "spring",
              stiffness: 100
            }}
            className="relative w-full max-w-8xl h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Card with Ultra Glassmorphism */}
            <div
              className="relative overflow-hidden rounded-3xl flex-1 flex flex-col"
              style={{
                background: 'rgba(15, 15, 25, 0.98)',
                backdropFilter: 'blur(60px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: `
                  0 25px 80px rgba(0, 0, 0, 0.6),
                  0 0 0 1px rgba(255, 255, 255, 0.05),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `
              }}
            >
              {/* Thin execution rail - visual only */}
              <motion.div
                className="absolute left-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, ${getStatusColor()}, ${currentSegment.color})` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.max(progress || 0, 0), 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              {/* Polling warning banner */}
              {pollingIssue && (
                <div className="absolute left-0 right-0 top-0 z-20">
                  <div className="mx-6 mt-3 rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2"
                       style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}>
                    ⚠️ Temporary database polling issue detected. Checking worker directly…
                  </div>
                </div>
              )}

              {/* Animated Background Gradient */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${getStatusColor()}40, transparent 50%),
                              radial-gradient(circle at 70% 80%, ${currentSegment.color}30, transparent 50%),
                              radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2), transparent 70%)`,
                }}
                animate={{
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />


              <div className="relative z-10 h-full flex flex-col">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2">

                {/* Header with Compact Progress Circle */}
                <div className="flex items-center justify-between p-8 border-b border-white/10">
                  <div className="flex items-center gap-6">
                    {/* Compact Progress Circle */}
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeWidth="4"
                          fill="none"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={getStatusColor()}
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ strokeDashoffset: 176 }}
                          animate={{ 
                            strokeDashoffset: 176 - (176 * progress) / 100,
                          }}
                          style={{
                            strokeDasharray: 176,
                            filter: `drop-shadow(0 0 10px ${getStatusColor()})`,
                          }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <StatusIcon 
                          className={`w-6 h-6 ${executionData?.status === 'running' ? 'animate-spin' : ''}`}
                          style={{ color: getStatusColor() }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <motion.h3 
                        className="text-2xl font-bold text-white mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {executionData?.status === 'completed' ? '✨ Content Generated!' :
                         executionData?.status === 'failed' ? '❌ Generation Failed' :
                         executionData?.status === 'cancelling' ? '⏹️ Stopping Execution...' :
                         executionData?.status === 'cancelled' ? '⏹️ Execution Cancelled' :
                         '🚀 Generating Content...'}
                      </motion.h3>
                      <motion.p 
                        className="text-lg text-gray-300 flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span>{executionData?.currentNode || 'Initializing...'}</span>
                        {isChapterMode && totalChapters > 0 && (
                          <span className="text-sm text-gray-400">
                            • Chapter {currentChapter}/{totalChapters}
                          </span>
                        )}
                      </motion.p>
                      
                      {/* ERROR DETAILS - Show when failed */}
                      {executionData?.status === 'failed' && executionData?.error && (
                        <motion.div
                          className="mt-4 p-4 rounded-xl border-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderColor: 'rgba(239, 68, 68, 0.4)'
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-semibold text-red-300 mb-2">Execution Failed</div>
                              <div className="text-sm text-red-200 whitespace-pre-wrap break-words">
                                {typeof executionData.error === 'string' 
                                  ? executionData.error 
                                  : executionData.error?.message || JSON.stringify(executionData.error, null, 2)}
                              </div>
                              {executionData.error?.stack && (
                                <details className="mt-2">
                                  <summary className="text-xs text-red-300 cursor-pointer hover:text-red-200">Show technical details</summary>
                                  <pre className="mt-2 text-xs text-red-400 overflow-auto max-h-40 p-2 bg-black/20 rounded">
                                    {executionData.error.stack}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Chapter Progress Indicator */}
                      {totalNodes > 1 && (
                        <motion.div 
                          className="flex items-center gap-2 mt-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="text-sm font-medium text-gray-400">
                            {isChapterMode ? `Chapter ${currentChapter}/${totalChapters}` : `Step ${currentChapter}/${totalChapters}`}
                          </div>
                          <div className="flex-1 w-20 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                background: `linear-gradient(90deg, ${getStatusColor()}, ${currentSegment.color})`,
                                boxShadow: `0 0 10px ${getStatusColor()}40`
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${chapterProgress}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {chapterProgress}%
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Progress Segment Indicator with Phase Description */}
                      <motion.div 
                        className="flex items-center gap-2 mt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ background: currentSegment.color }}
                        />
                        <div className="flex flex-col">
                          <span 
                            className="text-sm font-medium"
                            style={{ color: currentSegment.color }}
                          >
                            {currentSegment.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {currentSegment.description}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                      <Zap className="h-4 w-4 text-emerald-300" />
                      {totalTokens.toLocaleString()} tokens
                    </span>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-3 rounded-2xl hover:bg-white/10 transition-all duration-300 text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                  </div>
                </div>

                {/* MAGICAL DETAILED PROGRESS SECTION */}
                {(['running', 'failed', 'completed', 'cancelled', 'generating'].includes(status) || executionData?.error) && displayedPipelineSteps.length > 0 && (
                  <div className="px-8 py-4">
                    <div 
                      className="rounded-3xl p-8 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
                        border: '2px solid rgba(147, 51, 234, 0.3)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 40px rgba(147, 51, 234, 0.2)'
                      }}
                    >
                      {/* Magical Background Effects */}
                      <div className="absolute inset-0 opacity-20">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <motion.div
                            key={`magical-particle-${i}`}
                            className="absolute w-1 h-1 rounded-full"
                            style={{
                              left: `${15 + i * 15}%`,
                              top: `${20 + i * 10}%`,
                              background: `hsl(${240 + i * 60}, 70%, 60%)`,
                            }}
                            animate={{
                              y: [-20, -40],
                              opacity: [0, 1, 0],
                              scale: [0.5, 1, 0.5]
                            }}
                            transition={{ 
                              duration: 4 + Math.random() * 2,
                              repeat: Infinity,
                              delay: i * 0.3
                            }}
                          />
                        ))}
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <motion.h4 
                            className="text-white font-bold text-xl flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <motion.span
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="text-2xl"
                            >
                              📊
                            </motion.span>
                            AI Processing Pipeline
                          </motion.h4>
                          <motion.div 
                            className="text-purple-300 text-lg font-mono px-4 py-2 rounded-xl"
                            style={{
                              background: 'rgba(147, 51, 234, 0.2)',
                              border: '1px solid rgba(147, 51, 234, 0.3)'
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            {executionData?.progress || 0}% Complete
                          </motion.div>
                        </div>
                        
                        {/* Enhanced Dynamic Node Timeline */}
                        <div className="space-y-4">
                          {/* Simple skeletons when running with no nodeResults yet */}
                          {executionData?.status === 'running' && (!executionData?.nodeResults || Object.keys(executionData.nodeResults).length === 0) && (
                            <div className="space-y-3">
                              {[1,2,3].map(i => (
                                <div key={`skeleton-${i}`} className="w-full h-14 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} />
                              ))}
                            </div>
                          )}
                          {displayedPipelineSteps.map((node, index) => (
                            <motion.div
                              key={node.id || node.nodeId || `node-${index}-${node.name || 'unknown'}`}
                              initial={{ opacity: 0, x: -30 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="relative"
                            >
                              <div 
                                className={`flex items-center gap-6 p-6 rounded-2xl transition-all duration-500 border-2 ${
                                  node.status === 'completed' 
                                    ? 'border-green-400/50 bg-green-500/10' 
                                    : node.status === 'running'
                                    ? 'border-purple-400/50 bg-purple-500/10'
                                    : 'border-gray-600/30 bg-gray-700/20'
                                }`}
                                style={{
                                  boxShadow: node.status === 'running' 
                                    ? `0 0 30px ${node.color}40` 
                                    : '0 4px 20px rgba(0, 0, 0, 0.1)'
                                }}
                              >
                                {/* Magical Node Icon */}
                                <motion.div
                                  className="relative"
                                  animate={node.status === 'running' ? {
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0]
                                  } : {}}
                                  transition={{ 
                                    duration: 2, 
                                    repeat: node.status === 'running' ? Infinity : 0,
                                    ease: 'easeInOut'
                                  }}
                                >
                                  <div className="text-4xl">{node.icon}</div>
                                  {node.status === 'running' && (
                                    <motion.div
                                      animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.5, 1, 0.5]
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity
                                      }}
                                      className="absolute inset-0 rounded-full blur-md"
                                      style={{ background: node.color }}
                                    />
                                  )}
                                </motion.div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <motion.div 
                                      className="text-white font-bold text-lg"
                                      style={{ color: node.status === 'running' ? node.color : '#ffffff' }}
                                    >
                                      {node.name}
                                    </motion.div>
                                    {node.status === 'running' && node.progress !== undefined && (
                                      <div className="text-sm font-mono text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                                        {node.progress}%
                                      </div>
                                    )}
                                  </div>
                                  <motion.div 
                                    className="text-gray-300 text-sm flex items-center gap-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 * index }}
                                  >
                                    {node.status === 'completed' ? (
                                      <>
                                        <motion.span
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 0.5 }}
                                        >
                                          ✅
                                        </motion.span>
                                        <span>Completed</span>
                                      </>
                                    ) : node.status === 'running' ? (
                                      <>
                                        <motion.span
                                          animate={{ rotate: 360 }}
                                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        >
                                          🔄
                                        </motion.span>
                                        <span>Processing...</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>⏳</span>
                                        <span>Waiting</span>
                                      </>
                                    )}
                                  </motion.div>

                                  {/* Progress bar for running nodes */}
                                  {node.status === 'running' && node.progress !== undefined && (
                                    <div className="mt-3 w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                      <motion.div
                                        className="h-full rounded-full"
                                        style={{
                                          background: `linear-gradient(90deg, ${node.color}, ${node.color}80)`,
                                          boxShadow: `0 0 10px ${node.color}40`
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${node.progress}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                {node.status === 'running' && (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="p-3 rounded-full"
                                    style={{ background: `${node.color}20` }}
                                  >
                                    <Cpu className="w-6 h-6" style={{ color: node.color }} />
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Live Log Terminal (Sticky) */}
                <div className="px-8 py-4 sticky top-56 z-20 backdrop-blur-md bg-black/30">
                  <div ref={logContainerRef} className="h-48 bg-black/50 rounded-2xl p-4 font-mono text-xs text-green-400 overflow-y-auto border border-white/10 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                    <p className="text-green-300 font-bold mb-2">~ Lekhika AI Live Terminal ~</p>
                    {liveLog.map((log, i) => (
                      <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{`> ${log}`}</motion.p>
                    ))}
                  </div>
                </div>

                {/* Dynamic Progress Bar with Node Names (moved towards top, non-sticky) */}
                {(executionData?.status === 'running' || executionData?.status === 'failed' || executionData?.error) && (
                  <div className="px-8 py-4">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">Current Process</h4>
                        <div className="text-gray-300 text-sm font-mono">
                          {executionData?.progress || 0}%
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-700/50 rounded-full h-3 mb-3 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${getStatusColor()}, ${currentSegment.color})`,
                            boxShadow: `0 0 20px ${getStatusColor()}40`
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${executionData?.progress || 0}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                      
                      {/* Current Node */}
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Cpu className="w-4 h-4 text-blue-400" />
                        </motion.div>
                        <span className="text-gray-200 text-sm">
                          {executionData?.currentNode || 'Initializing...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comprehensive Stats + AI Terminal Section */}
                <div className="px-8 pb-8 flex-shrink-0">
                  <motion.div 
                    className="flex flex-col lg:flex-row gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Main Stats Grid (compact) */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:flex-1">
                      {[
                        { 
                          icon: Zap, 
                          label: 'Tokens', 
                          value: totalTokens.toLocaleString(), 
                          color: '#f59e0b',
                          animated: executionData?.status === 'running',
                          subtitle: 'Total AI Tokens Used'
                        },
                        { 
                          icon: FileText, 
                          label: 'Words', 
                          value: totalWords.toLocaleString(), 
                          color: '#8b5cf6',
                          animated: executionData?.status === 'running',
                          subtitle: 'Total Content Generated'
                        },
                        { 
                          icon: Clock, 
                          label: 'Time', 
                          value: `${Math.round(executionData?.duration || 0)}s`, 
                          color: '#ec4899',
                          animated: executionData?.status === 'running',
                          subtitle: 'Processing Time'
                        },
                        { 
                          icon: Network, 
                          label: 'Node', 
                          value: executionData?.currentNode ? executionData.currentNode.split(' ')[0] : 'Init', 
                          color: '#10b981',
                          animated: executionData?.status === 'running',
                          subtitle: 'Current Step'
                        }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          whileHover={{ scale: 1.05, y: -3 }}
                          className="p-4 rounded-2xl relative overflow-hidden group cursor-pointer"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid rgba(255, 255, 255, 0.1)`,
                            backdropFilter: 'blur(20px)'
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          {/* Hover Glow */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl"
                            style={{
                              background: `linear-gradient(135deg, ${stat.color}20, transparent)`,
                              opacity: 0
                            }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                          
                          <div className="relative z-10 text-center">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                            >
                              <stat.icon 
                                className="w-6 h-6 mx-auto mb-2" 
                                style={{ color: stat.color }}
                              />
                            </motion.div>
                            <motion.div 
                              className="text-2xl font-bold text-white mb-1"
                              animate={stat.animated ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                              {stat.value}
                            </motion.div>
                            <div className="text-sm text-gray-400 font-medium">
                              {stat.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {stat.subtitle}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* AI Terminal – manual guidance + sampling controls */}
                    <div className="lg:w-1/2 w-full">
                      <div
                        className="h-full rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col gap-3"
                        style={{ backdropFilter: 'blur(18px)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-emerald-300" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                              AI Control Terminal
                            </span>
                          </div>
                          {executionData?.error && (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-red-500/20 text-red-200 border border-red-500/40">
                              Validator Issue
                            </span>
                          )}
                        </div>

                        {/* Error summary */}
                        {executionData?.error && (
                          <div className="text-[11px] text-red-200/90 bg-red-900/20 rounded-xl p-2 max-h-20 overflow-y-auto">
                            {executionData.error}
                          </div>
                        )}

                        {/* Sampling controls */}
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-300">
                          <label className="flex flex-col gap-1">
                            <span>Temperature</span>
                            <input
                              type="range"
                              min="0.1"
                              max="1.2"
                              step="0.05"
                              value={aiTemp}
                              onChange={(e) => setAiTemp(parseFloat(e.target.value))}
                            />
                            <span className="text-[10px] text-gray-400">{aiTemp.toFixed(2)}</span>
                          </label>
                          <label className="flex flex-col gap-1">
                            <span>Top‑p</span>
                            <input
                              type="range"
                              min="0.1"
                              max="1.0"
                              step="0.05"
                              value={aiTopP}
                              onChange={(e) => setAiTopP(parseFloat(e.target.value))}
                            />
                            <span className="text-[10px] text-gray-400">{aiTopP.toFixed(2)}</span>
                          </label>
                          <label className="flex flex-col gap-1">
                            <span>Presence</span>
                            <input
                              type="range"
                              min="0.0"
                              max="1.0"
                              step="0.05"
                              value={aiPresencePenalty}
                              onChange={(e) => setAiPresencePenalty(parseFloat(e.target.value))}
                            />
                            <span className="text-[10px] text-gray-400">{aiPresencePenalty.toFixed(2)}</span>
                          </label>
                        </div>

                        {/* Guidance input */}
                        <div className="flex-1 flex flex-col gap-2">
                          <textarea
                            value={aiGuidance}
                            onChange={(e) => setAiGuidance(e.target.value)}
                            className="flex-1 w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-xs text-gray-100 resize-none"
                            placeholder="Explain how the AI should fix the next attempt. Example: Avoid repeating phrases like 'as Arjun walked...' and vary sentence openings while keeping the same plot beats."
                          />
                          <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span>
                              Guidance is injected into the next retry from the failed step upward.
                            </span>
                            <UltraButton
                              onClick={handleAiTerminalResume}
                              variant="primary"
                              icon={PlayCircle}
                              disabled={aiTerminalBusy || !aiGuidance.trim()}
                              className="px-3 py-1.5 text-xs font-semibold"
                              style={{
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(34,197,94,0.4)'
                              }}
                            >
                              {aiTerminalBusy ? 'Guiding…' : 'Apply & Resume'}
                            </UltraButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Error Display */}
                {executionData?.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-8 pb-6"
                  >
                    <div 
                      className="p-6 rounded-2xl relative overflow-hidden"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, -10, 10, 0]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity 
                          }}
                        >
                          <AlertTriangle className="w-7 h-7 text-red-400" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="text-lg font-bold text-red-400 mb-2">
                            Error occurred
                          </div>
                          <div className="text-gray-200">
                            {executionData.error}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                </div>
                
                {/* Ultra Action Buttons - Fixed Position */}
                <div className="px-8 pb-8 flex gap-4 justify-center flex-shrink-0">
                  {/* AI Thinking Button - Always visible when there's execution data */}
                  {executionData && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <UltraButton
                        onClick={() => setShowAIThinkingModal(true)}
                        variant="primary"
                        icon={Brain}
                        className="px-6 py-4 text-lg font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          border: 'none',
                          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                        }}
                      >
                        View AI Thinking
                      </UltraButton>
                    </motion.div>
                  )}
                  
                  {/* Partial Download - Show for running/failed/cancelled with content */}
                  {canDownloadPartial && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <UltraButton
                        onClick={() => handlePartialDownload()}
                        variant="secondary"
                        icon={Download}
                        className="px-6 py-4 text-lg font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          border: 'none',
                          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        Download Partial
                      </UltraButton>
                    </motion.div>
                  )}
                  
                  {/* Re-Run (Edit) – only after the current execution has finished (completed/failed/cancelled) */}
                  {['completed', 'failed', 'cancelled'].includes(executionData?.status || '') && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.33 }}
                    >
                      <UltraButton
                        onClick={openReRunWithPrefill}
                        variant="secondary"
                        icon={Edit3}
                        className="px-6 py-4 text-lg font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          border: 'none',
                          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
                        }}
                      >
                        Re-Run (Edit)
                      </UltraButton>
                    </motion.div>
                  )}
                  
                  {/* Stop Button - Show for running, failed, or error states */}
                  {(executionData?.status === 'running' || executionData?.status === 'failed' || executionData?.error) && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <UltraButton
                        onClick={onForceStop}
                        variant="secondary"
                        icon={StopCircle}
                        className="px-6 py-4 text-lg font-bold"
                        disabled={executionData?.status === 'cancelling'}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          border: 'none',
                          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        {executionData?.status === 'cancelling' ? 'Stopping...' : 'Stop'}
                      </UltraButton>
                    </motion.div>
                  )}
                  
                  {/* Improvise Button - allow manual override before resume */}
                  {shouldShowImprovise && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.43 }}
                    >
                      <UltraButton
                        onClick={() => {
                          setImproviseText(activeRegenerateContext?.manualInstruction || '')
                          setShowImproviseModal(true)
                        }}
                        variant="secondary"
                        icon={Lightbulb}
                        className="px-6 py-4 text-lg font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                          border: 'none',
                          boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)'
                        }}
                      >
                        Improvise & Resume
                      </UltraButton>
                    </motion.div>
                  )}
                  
                  {/* Resume Button - Show for ANY failed executions */}
                  {(executionData?.status === 'failed' || executionData?.error) && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      <UltraButton
                        onClick={handleResumeExecution}
                        disabled={isResuming}
                        variant="primary"
                        icon={PlayCircle}
                        className="px-6 py-4 text-lg font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
                          opacity: isResuming ? 0.7 : 1
                        }}
                      >
                        {isResuming ? '🔄 Resuming...' : '▶️ Resume from Checkpoint'}
                      </UltraButton>
                    </motion.div>
                  )}
                  
                  {/* Retry Button - Show for failed executions without checkpoint or if resume not available */}
                  {(executionData?.status === 'failed' || executionData?.error) && onRestart && !executionData?.execution_data?.resumable && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <UltraButton
                        onClick={onRestart}
                        variant="primary"
                        icon={RefreshCw}
                        className="px-6 py-4 text-lg font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          border: 'none',
                          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        Retry
                      </UltraButton>
                    </motion.div>
                  )}

                  {/* Completed State Actions */}
                  {canDownloadFinal && (
                    <>
                      {/* 👑 FIXED: Edit Book Button */}
                      <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <UltraButton
                          onClick={() => {
                            const aggregatedData = getAggregatedContent(execData)
                            if (!aggregatedData || !aggregatedData.chapters || aggregatedData.chapters.length === 0) {
                              toast.error('No compiled chapters available to edit yet.')
                              return
                            }
                            setBookEditorData({
                              bookId: aggregatedData.bookId,
                              title: aggregatedData.title,
                              compiledData: aggregatedData.compiledData,
                              html: aggregatedData.html,
                              markdown: aggregatedData.markdown,
                              chapters: aggregatedData.chapters,
                              formats: aggregatedData.formats,
                              formatUrls: aggregatedData.formatUrls,
                              assets: aggregatedData.assets,
                              metadata: aggregatedData.metadata,
                              persistedBook: aggregatedData.persistedBook,
                              userInput: aggregatedData.userInput,
                              imagePlacement: aggregatedData.imagePlacement
                            })
                            setShowBookEditor(true)
                          }}
                          variant="secondary"
                          icon={Edit3}
                          className="px-6 py-4 text-lg font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                          }}
                        >
                          Edit Book
                        </UltraButton>
                      </motion.div>
                      
                      {/* Download All Formats from completion card */}
                      <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <UltraButton
                          onClick={handleDownloadAllFormats}
                          variant="primary"
                          icon={downloadInProgress ? Loader2 : Download}
                          disabled={downloadInProgress}
                          className="px-8 py-4 text-lg font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          {downloadInProgress ? 'Preparing...' : 'Download All Formats'}
                        </UltraButton>
                      </motion.div>
                    </>
                  )}

                  {/* Close Button - Always available */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <UltraButton
                      onClick={onClose}
                      variant="secondary"
                      icon={X}
                      className="px-6 py-4 text-lg font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                        border: 'none',
                        boxShadow: '0 8px 32px rgba(107, 114, 128, 0.3)'
                      }}
                    >
                      Close
                    </UltraButton>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Re-Run Generate Modal */}
      <AnimatePresence key="re-run-generate-modal">
        {showReRunModal && reRunEngine && (
          <GenerateModal
            isOpen={showReRunModal}
            onClose={() => setShowReRunModal(false)}
            engine={reRunEngine}
            // Prefer normalized userInput but fall back to raw input_data from execution record
            initialFormData={execData?.userInput || execData?.input_data || executionData?.input_data || {}}
            onExecutionComplete={() => {
              setShowReRunModal(false)
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence key="improvise-instructions-modal">
        {showImproviseModal && (
          <motion.div
            className="fixed inset-0 z-[2500] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!improviseLoading) {
                setShowImproviseModal(false)
                setImproviseText('')
              }
            }}
          >
            <motion.div
              className="w-full max-w-2xl bg-[#0b1120]/95 border border-white/10 rounded-3xl shadow-2xl p-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20">
                    <Lightbulb className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Improvise Instructions</h2>
                    <p className="text-sm text-white/60">
                      Help the AI recover by providing precise guidance for the next attempt.
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
                  onClick={() => {
                    if (!improviseLoading) {
                      setShowImproviseModal(false)
                      setImproviseText('')
                    }
                  }}
                  aria-label="Close improvise modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/80">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span>Target Node:</span>
                    <span>{activeRegenerateContext?.targetNodeId || 'Unknown node'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <span>Chapter:</span>
                    <span>{activeRegenerateContext?.chapterNumber ?? '—'}</span>
                  </div>
                  {activeRegenerateContext?.validationError?.errors?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-white font-semibold mb-1">Validation Notes:</div>
                      <ul className="list-disc list-inside space-y-1 text-white/70">
                        {activeRegenerateContext.validationError.errors.map((error, idx) => (
                          <li key={idx}>
                            <span className="font-semibold text-white">{error.code}</span>: {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activeRegenerateContext?.regeneratePrompt && (
                    <div className="mt-3">
                      <div className="text-white font-semibold mb-1">Auto Guidance Used:</div>
                      <p className="text-white/70 whitespace-pre-wrap text-sm">
                        {activeRegenerateContext.regeneratePrompt}
                      </p>
                    </div>
                  )}
                  {activeRegenerateContext?.lastError && (
                    <div className="mt-3 text-white/70 text-sm">
                      <span className="font-semibold text-white">Last Error:</span> {activeRegenerateContext.lastError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Your instructions to the AI
                  </label>
                  <textarea
                    value={improviseText}
                    onChange={(event) => setImproviseText(event.target.value)}
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/70"
                    placeholder="Example: Expand the chapter with a dramatic scene where Raman confronts his father about the debt. Highlight his emotional turmoil and add sensory detail from the Chennai streets."
                    disabled={improviseLoading}
                  />
                  <p className="text-xs text-white/50 mt-2">
                    Be specific about plot beats, tone, pacing, or missing details. The AI will incorporate this directly.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <UltraButton
                  onClick={() => {
                    if (!improviseLoading) {
                      setShowImproviseModal(false)
                      setImproviseText('')
                    }
                  }}
                  variant="secondary"
                  className="px-5"
                  disabled={improviseLoading}
                >
                  Cancel
                </UltraButton>
                <UltraButton
                  onClick={handleImproviseSubmit}
                  variant="primary"
                  icon={improviseLoading ? Loader2 : PlayCircle}
                  className="px-5"
                  disabled={improviseLoading}
                >
                  {improviseLoading ? 'Sending...' : 'Send & Resume'}
                </UltraButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Thinking Modal */}
      <AIThinkingModal
        key="ai-thinking-modal"
        isOpen={showAIThinkingModal}
        onClose={() => setShowAIThinkingModal(false)}
        executionData={executionData}
        onForceStop={onForceStop}
        onRestart={onRestart}
      />
      
      {/* 👑 FIXED: User Book Editor Modal */}
      <UserBookEditorModal
        key="user-book-editor-modal"
        isOpen={showBookEditor}
        onClose={() => setShowBookEditor(false)}
        bookData={bookEditorData}
        onSave={(updatedContent) => {
          console.log('📚 Book saved from editor!', updatedContent);
          // Here you would typically call a dbService to update the book
          toast.success('Book changes saved!');
          setShowBookEditor(false);
        }}
      />
    </AnimatePresence>
  )
  
}

export default UserExecutionModal

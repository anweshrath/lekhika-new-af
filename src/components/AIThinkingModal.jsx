import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  Cpu, 
  Database, 
  Network, 
  Sparkles,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Download,
  Copy,
  Scroll,
  FileText,
  Settings,
  Play,
  Pause,
  Square,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Target,
  RefreshCw,
  Wand2,
  Stars,
  Atom,
  Waves,
  Flame,
  Lightbulb,
  Rocket,
  Crown,
  Gem,
  Palette,
  Code,
  Workflow,
  Image,
  SlidersHorizontal
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { sanitizeForExport, sanitizeMarkdownForExport } from '../utils/sanitize'

// NEW 🧼 TITLE SANITIZER: Aggressively cleans titles for display.
function sanitizeTitleForDisplay(title) {
  if (typeof title !== 'string') return 'Untitled'
  let cleanTitle = title
    // Remove markdown emphasis
    .replace(/[\*\_#]+/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Collapse whitespace and trim
    .replace(/\s+/g, ' ').trim()
  return cleanTitle || 'Untitled'
}

// 🧼 DISPLAY SANITIZER: removes permission banners and instruction headers from visible content only
function sanitizeForDisplay(text) {
  if (typeof text !== 'string') return text
  let out = text

  // SURGICAL FIX: Strip HTML tags for display ONLY (does not affect downloads/exports)
  out = out.replace(/<[^>]*>/g, '')

  // SURGICAL SANITIZATION: Remove permission banners and instruction blocks
  // Remove heavy divider/banner blocks (quadrails and NODE PERMISSIONS banner)
  out = out.replace(/(^|\n)[═=]{6,}[\s\S]*?(Only perform tasks[\s\S]*?)?[═=]{6,}\s*/gm, '\n')
  
  // Remove NODE PERMISSIONS blocks with strict enforcement
  out = out.replace(/🔐\s*NODE PERMISSIONS[\s\S]*?Only perform tasks you are explicitly authorized for above\.\s*/gmi, '')
  
  // Remove AUTHORIZED/FORBIDDEN lines and CRITICAL warning lines
  out = out.replace(/^\s*(?:✅|🚫)\s*(AUTHORIZED|FORBIDDEN):.*$/gmi, '')
  out = out.replace(/^\s*⚠️\s*CRITICAL:.*$/gmi, '')
  out = out.replace(/^\s*NODE PERMISSIONS.*$/gmi, '')
  out = out.replace(/^\s*STRICTLY ENFORCED.*$/gmi, '')
  
  // Remove chapter instruction blocks
  out = out.replace(/📖\s*CHAPTER\s+\d+\s+OF\s+\d+[\s\S]*?WRITING GUIDELINES:[\s\S]*?(?=\n\n|\n#|\n\*\*|$)/gmi, '')
  
  // Remove standalone instruction lines
  out = out.replace(/^Only perform tasks you are explicitly authorized for above\.?\s*$/gmi, '')
  out = out.replace(/^This is the opening chapter\..*$/gmi, '')
  out = out.replace(/^Establish the story world.*$/gmi, '')
  out = out.replace(/^Create a compelling beginning.*$/gmi, '')
  
  // Drop a leading "Instructions" header block if echoed
  out = out.replace(/^\s*(instructions|node instructions)\s*[:\-]*\s*/i, '')

  // Unwrap fenced code at the very top (common when LLM echoes instructions)
  out = out.replace(/^```(?:\w+)?\s*([\s\S]*?)```/m, '$1')
  
  // Remove JSON wrapper if it's wrapping the entire content
  out = out.replace(/^\s*\{\s*"[^"]*":\s*"([\s\S]*?)"\s*\}\s*$/m, '$1').replace(/\\n/g, '\n').replace(/\\"/g, '"');

  // Collapse excessive blank lines
  out = out.replace(/\n{3,}/g, '\n\n').trim()

  return out
}

// ------------------------------
// Curated export helpers
// ------------------------------

const MAX_TEXT_LENGTH = 6000
const MAX_MESSAGE_LENGTH = 4000

const isPlainObject = (value) => {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const trimString = (value, max = MAX_TEXT_LENGTH) => {
  if (typeof value !== 'string') return value
  if (value.length <= max) return value
  return `${value.slice(0, max)}…`
}

const INPUT_KEY_BLOCKLIST = [
  'formconfig',
  'inputfields',
  'options',
  'optionsets',
  'availableoptions',
  'prompttemplate',
  'promptsections',
  'promptpreview',
  'compiledprompt',
  'rawprompt',
  'rawoutput',
  'rawcontent',
  'renderedhtml',
  'html',
  'markdown',
  'pdf',
  'docx',
  'assets',
  'images',
  'chapters',
  'sections',
  'storycontext',
  'storyblueprint',
  'storyplan',
  'analysis',
  'debug',
  'telemetry',
  'logs',
  'trace',
  'context',
  'vector',
  'embedding'
]

const shouldDropInputKey = (key) => {
  if (!key) return false
  const normalized = key.toLowerCase()
  return INPUT_KEY_BLOCKLIST.some(blocked => normalized.includes(blocked))
}

const sanitizeUserInputData = (value, depth = 0) => {
  if (value == null) return undefined

  if (typeof value === 'string') {
    return trimString(value, MAX_TEXT_LENGTH)
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (Array.isArray(value)) {
    const sanitizedArray = value
      .map(item => sanitizeUserInputData(item, depth + 1))
      .filter(item => item !== undefined && item !== null)

    // Only keep arrays of primitives to avoid huge nested config structures
    const primitivesOnly = sanitizedArray.every(item => (
      typeof item === 'string' ||
      typeof item === 'number' ||
      typeof item === 'boolean'
    ))

    return primitivesOnly ? sanitizedArray : undefined
  }

  if (isPlainObject(value)) {
    const result = {}
    for (const [key, inner] of Object.entries(value)) {
      if (shouldDropInputKey(key)) continue

      if (key === 'executionMetadata' && isPlainObject(inner)) {
        const { userId, engineId, flowId, engineName, timestamp, runId, workspaceId } = inner
        const metadata = {
          userId,
          engineId,
          flowId,
          engineName,
          timestamp,
          runId,
          workspaceId
        }
        const cleaned = Object.fromEntries(Object.entries(metadata).filter(([, v]) => v !== undefined && v !== null && v !== ''))
        if (Object.keys(cleaned).length > 0) {
          result[key] = cleaned
        }
        continue
      }

      const sanitized = sanitizeUserInputData(inner, depth + 1)
      if (sanitized !== undefined && sanitized !== null && (typeof sanitized !== 'object' || Object.keys(sanitized).length > 0)) {
        result[key] = sanitized
      }
    }
    return Object.keys(result).length > 0 ? result : undefined
  }

  return undefined
}

const sanitizePromptSections = (sections) => {
  if (!Array.isArray(sections)) return undefined
  const sanitized = sections
    .slice(0, 20)
    .map(section => {
      if (!isPlainObject(section)) return null
      const cleaned = {
        title: trimString(section.title, 400),
        role: section.role,
        content: trimString(section.content || section.text || section.body, MAX_TEXT_LENGTH)
      }
      return Object.fromEntries(
        Object.entries(cleaned)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
      )
    })
    .filter(section => Object.keys(section || {}).length > 0)

  return sanitized.length > 0 ? sanitized : undefined
}

const sanitizeMessages = (messages) => {
  if (!Array.isArray(messages)) return undefined
  const cleaned = messages
    .slice(-20) // keep most recent
    .map(message => {
      if (!isPlainObject(message)) return null
      const base = {}
      if (message.role) base.role = message.role
      if (message.name) base.name = message.name
      if (typeof message.id === 'string') base.id = message.id

      if (typeof message.content === 'string') {
        base.content = trimString(message.content, MAX_MESSAGE_LENGTH)
      } else if (Array.isArray(message.content)) {
        const parts = message.content
          .map(part => {
            if (!part) return null
            if (typeof part === 'string') {
              return trimString(part, MAX_MESSAGE_LENGTH)
            }
            if (!isPlainObject(part)) return null
            const sanitizedPart = {}
            if (part.type) sanitizedPart.type = part.type
            if (typeof part.text === 'string') sanitizedPart.text = trimString(part.text, MAX_MESSAGE_LENGTH)
            if (typeof part.content === 'string') sanitizedPart.content = trimString(part.content, MAX_MESSAGE_LENGTH)
            return Object.keys(sanitizedPart).length > 0 ? sanitizedPart : null
          })
          .filter(Boolean)
        if (parts.length > 0) {
          base.content = parts
        }
      } else if (isPlainObject(message.content)) {
        const { text, content } = message.content
        if (typeof text === 'string') base.content = trimString(text, MAX_MESSAGE_LENGTH)
        if (typeof content === 'string') base.content = trimString(content, MAX_MESSAGE_LENGTH)
      }

      return Object.keys(base).length > 0 ? base : null
    })
    .filter(Boolean)

  return cleaned.length > 0 ? cleaned : undefined
}

const sanitizeRawDataForExport = (rawData) => {
  if (!isPlainObject(rawData)) return undefined

  const sanitized = {}

  const instructions = rawData.instructions || rawData.nodeInstructions || rawData.promptInstructions
  if (instructions) sanitized.instructions = trimString(instructions, MAX_TEXT_LENGTH)

  const systemPrompt = rawData.systemPrompt || rawData.system_prompt || rawData.systemMessage || rawData.system_message
  if (systemPrompt) sanitized.systemPrompt = trimString(systemPrompt, MAX_TEXT_LENGTH)

  const prompt = rawData.prompt || rawData.fullPrompt
  if (prompt) sanitized.prompt = trimString(prompt, MAX_TEXT_LENGTH)

  const promptTemplate = rawData.promptTemplate
  if (promptTemplate) sanitized.promptTemplate = trimString(promptTemplate, MAX_TEXT_LENGTH)

  const promptSections = sanitizePromptSections(rawData.promptSections || rawData.prompt_sections)
  if (promptSections) sanitized.promptSections = promptSections

  const messages = sanitizeMessages(rawData.messages || rawData.messageHistory || rawData.chatMessages)
  if (messages) sanitized.messages = messages

  const inputData = sanitizeUserInputData(rawData.inputData || rawData.inputs)
  if (inputData) sanitized.inputData = inputData

  const dynamicInputs = sanitizeUserInputData(rawData.dynamicInputs)
  if (dynamicInputs) sanitized.dynamicInputs = dynamicInputs

  const modelSettings = {
    provider: rawData.provider || rawData.providerName,
    model: rawData.model || rawData.modelName,
    temperature: rawData.temperature,
    topP: rawData.topP,
    maxOutputTokens: rawData.maxOutputTokens || rawData.maxTokens
  }

  const cleanedSettings = Object.fromEntries(
    Object.entries(modelSettings)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
  )
  if (Object.keys(cleanedSettings).length > 0) {
    sanitized.modelSettings = cleanedSettings
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

const cleanObject = (obj) => {
  if (!isPlainObject(obj)) return obj

  const cleaned = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue

    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) cleaned[key] = trimmed
      continue
    }

    if (Array.isArray(value)) {
      const sanitizedArray = value
        .map(item => {
          if (isPlainObject(item)) return cleanObject(item)
          if (typeof item === 'string') return item.trim()
          return item
        })
        .filter(item => {
          if (item == null) return false
          if (typeof item === 'string') return item.length > 0
          if (Array.isArray(item)) return item.length > 0
          if (isPlainObject(item)) return Object.keys(item).length > 0
          return true
        })
      if (sanitizedArray.length > 0) cleaned[key] = sanitizedArray
      continue
    }

    if (isPlainObject(value)) {
      const nested = cleanObject(value)
      if (Object.keys(nested).length > 0) cleaned[key] = nested
      continue
    }

    cleaned[key] = value
  }

  return cleaned
}

// ✨ MAGICAL FLOATING PARTICLES BACKGROUND
const MagicalParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// 🎨 MAGICAL EXPANDABLE OUTPUT COMPONENT
const MagicalExpandableOutput = ({ output, onCopy, index }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showRaw, setShowRaw] = useState(false)
  const { currentTheme } = useTheme()
  
  const getStageIcon = (nodeName) => {
    const name = nodeName?.toLowerCase() || ''
    if (name.includes('literary') || name.includes('writing')) return Wand2
    if (name.includes('outline') || name.includes('structure')) return Layers
    if (name.includes('research') || name.includes('analysis')) return Brain
    if (name.includes('output') || name.includes('final')) return Rocket
    if (name.includes('input')) return Database
    return Sparkles
  }
  
  const StageIcon = getStageIcon(output.nodeName)
  
  return (
    <motion.div 
      className="group relative overflow-hidden mb-4"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
    >
      {/* ✨ MAGICAL GLOW EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-500" />
      
      <div className="relative rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
        {/* 🎭 MAGICAL HEADER */}
        <motion.div 
          className="flex items-center justify-between p-5 cursor-pointer bg-gradient-to-r from-transparent via-white/5 to-transparent hover:from-purple-500/10 hover:via-pink-500/10 hover:to-blue-500/10 transition-all duration-300"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-4 flex-1">
            {/* 🔮 ANIMATED STAGE ICON */}
            <motion.div
              className="relative"
              animate={{ 
                rotate: isExpanded ? 360 : 0,
                scale: isExpanded ? 1.1 : 1
              }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-md opacity-60" />
              <div className="relative p-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full border border-white/30 backdrop-blur-sm">
                <StageIcon className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            
            <div className="flex-1">
              <div className="text-lg font-bold text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {output.nodeName || 'AI Stage Output'}
              </div>
              
              {/* 📊 MAGICAL STATS BAR */}
              <div className="flex items-center gap-4 flex-wrap">
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FileText className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-200 font-bold">{output.words || 0}</span>
                  <span className="text-blue-300/70 text-xs font-medium">words</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Zap className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-200 font-bold">{output.tokens || 0}</span>
                  <span className="text-purple-300/70 text-xs font-medium">tokens</span>
                </motion.div>
                
                {output.provider && (
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Cpu className="w-4 h-4 text-emerald-300" />
                    <span className="text-emerald-200 font-bold text-xs">{output.provider}</span>
                  </motion.div>
                )}
                
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span className="text-amber-200 font-bold text-xs">{output.timestamp}</span>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* 🎮 MAGICAL ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            {output.rawData && (
              <motion.button
                className="group/btn relative px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowRaw(!showRaw)
                }}
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl blur-md opacity-0 group-hover/btn:opacity-50 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <Eye className={`w-4 h-4 transition-colors duration-300 ${showRaw ? 'text-purple-300' : 'text-white/70'}`} />
                  <span className="text-xs font-medium text-white/80">{showRaw ? 'Formatted' : 'Show RAW'}</span>
                </div>
              </motion.button>
            )}
            
            <motion.button
              className="group/btn relative p-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-400/30 hover:from-pink-500/30 hover:to-rose-500/30 transition-all duration-300 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                onCopy(output.content)
              }}
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-xl blur-md opacity-0 group-hover/btn:opacity-50 transition-opacity duration-300" />
              <Copy className="relative w-5 h-5 text-white/70 group-hover/btn:text-pink-300 transition-colors duration-300" />
            </motion.button>
            
            {/* 🔽 EXPAND INDICATOR */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="p-2"
            >
              <ChevronDown className="w-6 h-6 text-white/50" />
            </motion.div>
          </div>
        </motion.div>
        
        {/* 📖 MAGICAL EXPANDABLE CONTENT */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-white/10 bg-gradient-to-b from-transparent to-black/10"
            >
              <div className="p-6 space-y-6">
                {/* 📥 INPUT RECEIVED */}
                {output.rawData?.inputData && (
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h4 className="font-bold text-white flex items-center gap-3 text-sm">
                      <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30">
                        <ArrowRight className="w-4 h-4 text-blue-300" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Input Received from Previous Node</span>
                    </h4>
                    <div className="bg-black/40 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                      <pre className="text-sm text-white/80 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-80 overflow-auto">
                        {typeof output.rawData.inputData === 'object' 
                          ? JSON.stringify(output.rawData.inputData, null, 2)
                          : output.rawData.inputData
                        }
                      </pre>
                    </div>
                  </motion.div>
                )}

                {/* 🎯 INSTRUCTIONS */}
                {output.rawData?.instructions && (
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="font-bold text-white flex items-center gap-3 text-sm">
                      <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                        <Target className="w-4 h-4 text-purple-300" />
                      </div>
                      <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Node Instructions</span>
                    </h4>
                    <div className="bg-black/40 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                      <pre className="text-sm text-white/80 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-80 overflow-auto">
                        {output.rawData.instructions}
                      </pre>
                    </div>
                  </motion.div>
                )}

                {/* 🤖 AI OUTPUT */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className="font-bold text-white flex items-center gap-3 text-sm">
                    <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-400/30">
                      <Brain className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">AI Generated Output</span>
                  </h4>
                  <div className="bg-black/40 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="text-sm text-white/90 whitespace-pre-wrap break-words leading-relaxed max-h-96 overflow-auto">
                      {showRaw && output.rawData ? (
                        <pre className="font-mono text-xs text-white/70 whitespace-pre-wrap break-words max-h-96 overflow-auto">
                          {JSON.stringify(output.rawData, null, 2)}
                        </pre>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          {sanitizeForDisplay(output.content)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// 🌟 MAGICAL PROCESSING STEP COMPONENT
const MagicalProcessingStep = ({ step, index, isActive }) => {
  const getStepIcon = (name) => {
    const stepName = name?.toLowerCase() || ''
    if (stepName.includes('literary') || stepName.includes('writing')) return Wand2
    if (stepName.includes('outline') || stepName.includes('structure')) return Layers
    if (stepName.includes('research') || stepName.includes('analysis')) return Brain
    if (stepName.includes('output') || stepName.includes('final')) return Rocket
    if (stepName.includes('input')) return Database
    return Sparkles
  }
  
  const StepIcon = getStepIcon(step.name)
  
  return (
    <motion.div
      className={`relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
        step.status === 'completed' 
          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/30' 
          : isActive 
            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30' 
            : 'bg-black/20 border-white/10'
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, type: "spring" }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* ✨ MAGICAL GLOW FOR ACTIVE STEP */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl blur-xl" />
      )}
      
      <div className="relative flex items-center gap-4">
        {/* 🎭 STEP ICON */}
        <motion.div
          className={`p-3 rounded-full border ${
            step.status === 'completed' 
              ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400/50' 
              : isActive 
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/50' 
                : 'bg-black/30 border-white/20'
          }`}
          animate={isActive ? { rotate: [0, 360] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <StepIcon className={`w-5 h-5 ${
            step.status === 'completed' ? 'text-emerald-300' : isActive ? 'text-purple-300' : 'text-white/60'
          }`} />
        </motion.div>
        
        <div className="flex-1">
          <div className={`font-bold text-sm mb-1 ${
            step.status === 'completed' ? 'text-emerald-200' : isActive ? 'text-purple-200' : 'text-white/70'
          }`}>
            {step.name}
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <span className={`${
              step.status === 'completed' ? 'text-emerald-300/80' : isActive ? 'text-purple-300/80' : 'text-white/50'
            }`}>
              {step.timestamp}
            </span>
            
            {step.tokens > 0 ? (
              <span className={`flex items-center gap-1 ${
                step.status === 'completed' ? 'text-emerald-300/80' : isActive ? 'text-purple-300/80' : 'text-white/50'
              }`}>
                <Zap className="w-3 h-3" />
                {step.tokens} tokens
              </span>
            ) : (
              <span 
                className="flex items-center gap-1 text-gray-500/70"
                title="Non-AI node - no tokens used"
              >
                <Zap className="w-3 h-3" />
                0 tokens
              </span>
            )}
            
            {step.provider && (
              <span className={`flex items-center gap-1 ${
                step.status === 'completed' ? 'text-emerald-300/80' : isActive ? 'text-purple-300/80' : 'text-white/50'
              }`}>
                <Cpu className="w-3 h-3" />
                {step.provider}
              </span>
            )}
          </div>
        </div>
        
        {/* ✅ STATUS INDICATOR */}
        <div className="flex items-center">
          {step.status === 'completed' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </motion.div>
          )}
          {isActive && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-6 h-6 text-purple-400" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// 🖼️ NEW: MAGICAL IMAGE GALLERY COMPONENT
const MagicalImageGallery = ({ imagesByNode, onDownload }) => {
  if (!imagesByNode || imagesByNode.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-white/60 text-lg mb-2">No images generated yet</div>
        <div className="text-white/40 text-sm">AI-generated images will appear here</div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {imagesByNode.map((node, index) => (
        <motion.div
          key={node.nodeName || index}
          className="group relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, type: "spring" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-500" />
          <div className="relative rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all duration-300">
            <div className="p-5 bg-gradient-to-r from-transparent via-white/5 to-transparent">
              <h3 className="text-lg font-bold text-white mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                {node.nodeName}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {node.images.map((img, imgIndex) => (
                  <motion.div
                    key={img.url || imgIndex}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-white/10 group/image"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <img src={img.url} alt={img.prompt || 'Generated Image'} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <p className="text-xs text-white/80 line-clamp-2 mb-2">{img.prompt}</p>
                      <button
                        onClick={() => onDownload(img.url, `${node.nodeName}_${imgIndex}`)}
                        className="w-full text-xs font-bold bg-white/20 hover:bg-white/30 text-white py-1 px-2 rounded-md backdrop-blur-sm transition-colors duration-200 flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}


// 🎨 MAGICAL CHAPTER COMPONENT
const MagicalChapter = ({ chapter, index }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <motion.div
      className="group relative overflow-hidden mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring" }}
    >
      {/* ✨ MAGICAL GLOW */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-500" />
      
      <div className="relative rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all duration-300">
        {/* 📚 CHAPTER HEADER */}
        <motion.div
          className="flex items-center justify-between p-5 cursor-pointer bg-gradient-to-r from-transparent via-white/5 to-transparent hover:from-amber-500/10 hover:via-orange-500/10 hover:to-red-500/10 transition-all duration-300"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-4 flex-1">
            {/* 📖 CHAPTER ICON */}
            <motion.div
              className="relative"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-md opacity-60" />
              <div className="relative p-3 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-full border border-white/30 backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            
            <div className="flex-1">
              <div className="text-lg font-bold text-white mb-2 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                {chapter.title || `Chapter ${chapter.number || index + 1}`}
              </div>
              
              <div className="flex items-center gap-4">
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span className="text-amber-200 font-bold">{chapter.words || 0}</span>
                  <span className="text-amber-300/70 text-xs font-medium">words</span>
                </motion.div>
              </div>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6 text-white/50" />
          </motion.div>
        </motion.div>
        
        {/* 📖 CHAPTER CONTENT */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/10 bg-gradient-to-b from-transparent to-black/10"
            >
              <div className="p-6">
                <div className="bg-black/40 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div className="text-sm text-white/90 whitespace-pre-wrap break-words leading-relaxed prose prose-invert max-w-none max-h-96 overflow-auto">
                    {sanitizeForDisplay(chapter.content)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

//  Master Sanitizer: Aggressively cleans raw AI output to extract pure narrative.
function masterSanitize(rawContent) {
  if (typeof rawContent !== 'string') return ''

  let content = rawContent

  // Stage 1: Attempt to parse as JSON to extract narrative directly.
  try {
    // First, strip any non-JSON prefixes or suffixes (like the "## 1 - 12" headings).
    const jsonMatch = content.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[1]) {
      const parsed = JSON.parse(jsonMatch[1]);
      
      // Intelligent extraction based on observed patterns
      let narrative = '';
      if (parsed.chapter1Content && parsed.chapter1Content.sections) {
        narrative = parsed.chapter1Content.sections.map(sec => sec.content).join('\n\n');
      } else if (parsed.content) {
        narrative = parsed.content;
      } else if (parsed.chapter_content) {
        narrative = parsed.chapter_content;
      }

      if (narrative) {
        console.log("✅ Master Sanitizer: Extracted content via JSON parsing.");
        content = narrative; // We have clean content, proceed to final cleanup
      }
    }
  } catch (e) {
    // It's not clean JSON, so we'll proceed with regex-based cleaning.
    console.warn("Master Sanitizer: JSON parsing failed, falling back to regex cleanup.", e);
  }

  // Stage 2: Aggressive regex-based cleanup for non-JSON or malformed content.
  // Remove any remaining JSON-like structures and metadata.
  content = content
    // Strip out any {...} blocks that might still exist.
    .replace(/\{[\s\S]*\}/gm, '')
    // Remove common metadata keys and their values.
    .replace(/"(bookTitle|authorName|genre|wordCount|chapterCount|summary|transition|sectionTitle|purpose|outline)":\s*".*?"\s*,?/g, '')
    // Remove markdown headings that are just numbers or placeholders.
    .replace(/^##\s*\d+\s*-\s*\d+\s*$/gm, '')
    // Remove permission banners and instruction headers.
    .replace(/(^|\n)[═=]{6,}[\s\S]*?(Only perform tasks[\s\S]*?)?[═=]{6,}\s*/gm, '\n')
    .replace(/🔐\s*NODE PERMISSIONS[\s\S]*?Only perform tasks you are explicitly authorized for above\.\s*/gmi, '')
    // Remove code fences.
    .replace(/```(?:\w+)?\s*([\s\S]*?)```/gm, '$1');

  // Stage 3: Final whitespace and artifact cleanup.
  return content
    .replace(/\\n/g, '\n') // Replace escaped newlines
    .replace(/\\"/g, '"')   // Replace escaped quotes
    .replace(/\n{3,}/g, '\n\n') // Collapse excessive blank lines
    .trim();
}


// 🎭 MAIN MAGICAL AI THINKING MODAL
const AIThinkingModal = ({
  isOpen,
  onClose,
  executionData = {}, 
  currentPhase = 'initializing',
  className = '',
  ...props 
}) => {
  const { currentTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('process')
  const [processingSteps, setProcessingSteps] = useState([])
  const [aiResponses, setAiResponses] = useState([])
  const [chapters, setChapters] = useState([])
  const [isPlaying, setIsPlaying] = useState(true)
  const scrollRef = useRef(null)
  const prevExecutionDataRef = useRef(null)
  const [imagesByNode, setImagesByNode] = useState([])
  
  // Process real execution data
  useEffect(() => {
    if (!executionData || !isOpen) return
    
    console.log('🧠 AIThinkingModal received execution data:', executionData)
    
    try {
      // Extract real AI responses from execution data
      const realResponses = []
      const realChapters = []
      const curatedChapterKeys = new Set()
      
      // Process node results for AI responses - SAFE PROCESSING
      const nodeResults = executionData.nodeResults || {}
      
      // SURGICAL FIX: The previous declaration was incorrect and caused a crash.
      // This is the correct, safe way to handle both object and array forms of nodeResults.
      const nodeResultsEntries = Array.isArray(nodeResults) ? 
        nodeResults.map((result, index) => [`auto_key_${index}`, result]) : 
        Object.entries(nodeResults);
    
      const contextChapters = Array.isArray(executionData.storyContext?.chapters)
        ? executionData.storyContext.chapters
        : []
      if (contextChapters.length > 0) {
        contextChapters.forEach((chapter, idx) => {
          const content = typeof chapter.content === 'string' ? chapter.content : ''
          if (!content.trim()) return
          const chapterNumber = chapter.number || chapter.chapterNumber || idx + 1
          const sanitizedTitle = sanitizeTitleForDisplay(chapter.title || `Chapter ${chapterNumber}`)
          const chapterId = chapter.id || chapter.nodeId || `context_${idx}`
          const key = `${chapter.nodeId || chapterId}_${chapterNumber}`
          curatedChapterKeys.add(key)
          realChapters.push({
            id: chapterId,
            title: sanitizedTitle,
            content,
            words: chapter.words || content.split(/\s+/).filter(Boolean).length,
            number: chapterNumber,
            nodeId: chapter.nodeId || chapter.metadata?.nodeId || chapterId,
            metadata: { ...(chapter.metadata || {}), source: 'storyContext' }
          })
        })
      }

      const structuralBlocks = executionData.storyContext?.structural || {}
      const tocItems = Array.isArray(structuralBlocks.tableOfContentsList)
        ? structuralBlocks.tableOfContentsList
            .filter(item => item && (item.title || item.chapterNumber))
            .map(item => {
              const label = item.title || `Chapter ${item.chapterNumber || ''}`
              const description = item.description ? ` - ${item.description}` : ''
              return `• ${label}${description}`.trim()
            })
            .join('\n')
        : null

      const structuralEntries = [
        structuralBlocks.foreword ? {
          id: 'structural_foreword',
          title: structuralBlocks.forewordTitle || 'Foreword',
          content: structuralBlocks.foreword,
          number: 0,
          nodeId: 'story-structural-foreword',
          metadata: { structuralType: 'foreword', source: 'storyContext' }
        } : null,
        structuralBlocks.introduction ? {
          id: 'structural_introduction',
          title: structuralBlocks.introductionTitle || 'Introduction',
          content: structuralBlocks.introduction,
          number: 0,
          nodeId: 'story-structural-introduction',
          metadata: { structuralType: 'introduction', source: 'storyContext' }
        } : null,
        (structuralBlocks.tableOfContents || tocItems) ? {
          id: 'structural_toc',
          title: 'Table of Contents',
          content: tocItems || structuralBlocks.tableOfContents,
          number: 0,
          nodeId: 'story-structural-toc',
          metadata: { structuralType: 'table_of_contents', source: 'storyContext' }
        } : null
      ].filter(Boolean)

      structuralEntries.slice().reverse().forEach(entry => {
        if (entry.content && entry.content.trim().length > 0) {
          curatedChapterKeys.add(entry.id || entry.nodeId)
          realChapters.unshift({
            ...entry,
            content: entry.content
          })
        }
      })

      nodeResultsEntries.forEach((entry, index) => {
        try {
          const [key, result] = entry; // No need for complex array checks here
          const nodeKey = key || result?.nodeId || `node_${index}`
          
          if (!result) return
          
          // MASTER INTERROGATOR FIX: Always add a response for EVERY node to show the full "to and fro"
          const outputContent = result.processedContent || result.aiResponse?.content || result.aiResponse || result.content || ''
          const contentString = typeof outputContent === 'string' ? outputContent : JSON.stringify(outputContent, null, 2);

              realResponses.push({
                id: `response_${index}`,
                timestamp: new Date().toLocaleTimeString(),
                phase: result.nodeName || 'AI Generation',
            content: contentString,
                tokens: result.tokens || result.aiMetadata?.tokens || 0,
            words: typeof contentString === 'string' ? contentString.split(/\s+/).filter(Boolean).length : 0,
                nodeId: result.nodeId,
                provider: result.providerName,
                nodeName: result.nodeName || result.metadata?.nodeName || result.label || nodeKey,
            rawData: result // This contains the input and instructions for the "to and fro" view
          });
          
          // CHAPTER SANITIZATION: Only add content from designated "writing" nodes to the Chapters tab.
          const nodeName = result.nodeName?.toLowerCase() || '';
          const isWritingNode = nodeName.includes('writer') || nodeName.includes('lipi.kar') || result.type === 'chapter' || result.type === 'multi_chapter_generation';

          if (isWritingNode) {
          if (result.type === 'multi_chapter_generation' && Array.isArray(result.chapters)) {
            result.chapters.forEach((ch, chIdx) => {
                const chContent = typeof ch?.content === 'string' ? ch.content.trim() : ''
                if (!chContent) return
                const chapterNumber = ch?.chapter || ch?.chapterNumber || (chIdx + 1)
                const chapterKey = `${result.nodeId || nodeKey}_${chapterNumber}`
                if (curatedChapterKeys.has(chapterKey)) return
                curatedChapterKeys.add(chapterKey)

                realChapters.push({
                  id: `chapter_${index}_${chIdx}`,
                  title: sanitizeTitleForDisplay(ch?.title || ch?.metadata?.title || ch?.extractedTitle || `Chapter ${chapterNumber}`),
                  content: chContent,
                  words: ch?.aiMetadata?.words || chContent.split(/\s+/).filter(Boolean).length,
                  number: chapterNumber,
                  nodeId: result.nodeId || ch?.metadata?.nodeId || `${result.nodeId || 'node'}_${chIdx}`,
                  metadata: { ...(ch?.metadata || {}), source: 'nodeResults' }
                })
            })
            } else {
              const candidateContent = result.processedContent || result.content || result.aiResponse || ''
              if (typeof candidateContent !== 'string') return
              const trimmedContent = candidateContent.trim()
              if (trimmedContent.length === 0) return
              const looksLikePlan = trimmedContent.startsWith('{') && /\"chapter_number\"|\"outline\"|story_architect/i.test(trimmedContent.slice(0, 800))
              if (looksLikePlan) return

              const rawChapterNumber = result.metadata?.chapter || result.metadata?.chapterNumber || result.chapterNumber
              const chapterNumber = typeof rawChapterNumber === 'number' && !Number.isNaN(rawChapterNumber)
                ? rawChapterNumber
                : realChapters.length + 1
              const chapterKey = `${result.nodeId || nodeKey}_${chapterNumber}`
              if (curatedChapterKeys.has(chapterKey)) return
              curatedChapterKeys.add(chapterKey)

              const fallbackTitle = result.title || result.metadata?.title || result.nodeName || `Chapter ${chapterNumber}`
                
                realChapters.push({
                  id: `chapter_${index}`,
                title: sanitizeTitleForDisplay(fallbackTitle),
                content: trimmedContent,
                words: trimmedContent.split(/\s+/).filter(Boolean).length,
                number: chapterNumber,
                nodeId: result.nodeId || result.metadata?.nodeId || `node_${index}`,
                metadata: { ...(result.metadata || {}), source: 'nodeResults' }
              })
            }
          }
        } catch (entryError) {
          console.error('Error processing node result entry:', entryError, entry)
        }
      })

      // NEW: If we have curated chapters (from storyContext or writer nodes), update live state immediately
      if (realChapters.length > 0) {
        setChapters(realChapters)
      }

      const liveOutput = executionData.currentOutput;
      if (liveOutput && typeof liveOutput.processedContent === 'string' && liveOutput.processedContent.trim().length > 0) {
        const liveContent = liveOutput.processedContent;
        const existingFinalResponse = realResponses.some(resp => resp.nodeId === liveOutput.nodeId && !resp.isLive);
        if (!existingFinalResponse) {
          const responseId = `live_${liveOutput.nodeId || Date.now()}`;
          realResponses.push({
            id: responseId,
            timestamp: liveOutput.timestamp || new Date().toLocaleTimeString(),
            phase: liveOutput.nodeName || 'In Progress',
            content: liveContent,
            tokens: liveOutput.tokens || 0,
            words: liveContent.split(/\s+/).filter(Boolean).length,
            nodeId: liveOutput.nodeId,
            provider: liveOutput.provider,
            nodeName: `${liveOutput.nodeName || liveOutput.nodeId || 'Current Node'} (Live)`,
            rawData: liveOutput,
            isLive: true
          });
        }

        const nodeName = (liveOutput.nodeName || '').toLowerCase();
        const isWritingNode = nodeName.includes('writer') || nodeName.includes('lipi.kar') || nodeName.includes('chapter') || (liveOutput.nodeId || '').toLowerCase().includes('writer');
        if (isWritingNode) {
          const existingFinalChapter = realChapters.some(ch => ch.nodeId === liveOutput.nodeId && !ch.isLive);
          if (!existingFinalChapter) {
            const chapterNumber = executionData.chapterInfo?.currentChapter || realChapters.length + 1;
            const liveKey = `${liveOutput.nodeId || 'live'}_${chapterNumber}`;
            if (!curatedChapterKeys.has(liveKey)) {
              curatedChapterKeys.add(liveKey);
            realChapters.push({
              id: `live_chapter_${liveOutput.nodeId || chapterNumber}`,
              title: `${chapterNumber} - ${sanitizeTitleForDisplay(liveOutput.nodeName || `Chapter ${chapterNumber}`)} (Live)`,
              content: liveContent,
              words: liveContent.split(/\s+/).filter(Boolean).length,
              number: chapterNumber,
              nodeId: liveOutput.nodeId || `live_${chapterNumber}`,
              isLive: true
            });
            }
          }
        }
      }
    
      // Build dynamic processing steps from execution data
      const dynamicSteps = []
      if (executionData.nodeResults) {
        try {
          const nodeResultsArray = Array.isArray(executionData.nodeResults) 
            ? executionData.nodeResults 
            : Object.entries(executionData.nodeResults)
          
          // Sort by execution order first
          const sortedSteps = nodeResultsArray
            .map((entry, index) => {
              try {
                const [key, result] = Array.isArray(entry) ? entry : [null, entry]
                return { key, result, originalIndex: index }
              } catch (mapError) {
                console.error('Error mapping step entry:', mapError, entry)
                return null
              }
            })
            .filter(item => item && item.result && item.result.type !== 'user_input' && item.result.type !== 'input_json_wrapper')
            .sort((a, b) => {
              try {
                const seqA = a.result.sequenceNumber || a.result.executionIndex || a.originalIndex
                const seqB = b.result.sequenceNumber || b.result.executionIndex || b.originalIndex
                return seqA - seqB
              } catch (sortError) {
                console.error('Error sorting steps:', sortError)
                return 0
              }
            })
          
          sortedSteps.forEach(({ key, result }, index) => {
            try {
              // Use proper node names with clear identification
              const displayName = result.nodeName || result.metadata?.nodeName || result.label || key || `Node ${index + 1}`
              // UI-local numbering to match filtered list
              const uiNum = index + 1
              
              // Extract provider name only (not model name)
              const providerName = result.providerName || result.provider
              const providerDisplay = providerName ? ` • ${providerName}` : ''
              
              dynamicSteps.push({
                id: key || result.nodeId || `step_${index}`,
                name: `${displayName}${providerDisplay} (${uiNum}/${sortedSteps.length})`,
                status: 'completed',
                progress: 100,
                timestamp: result.timestamp || new Date().toLocaleTimeString(),
                duration: result.duration || '0s',
                tokens: result.tokens || result.aiMetadata?.tokens || 0,
                provider: result.providerName || result.provider
              })
            } catch (stepError) {
              console.error('Error processing step:', stepError, { key, result })
            }
          })
        } catch (stepsError) {
          console.error('Error building processing steps:', stepsError)
        }
      }
      
      setProcessingSteps(dynamicSteps)
      
      // SURGICAL STRIKE: Re-process chapters with intelligent title extraction
      const finalChapters = realChapters.map((chapter, index) => {
        const isStructural = !!chapter.metadata?.structuralType
        const chapterNumber = !isStructural
          ? (chapter.number || chapter.chapter || index + 1)
          : (chapter.number || index + 1)
        const primaryTitle = chapter.title || chapter.metadata?.title || chapter.extractedTitle || ''
        let title = primaryTitle

        if (!title || /^chapter\s*\d+/i.test(title) || title.toLowerCase().includes('output')) {
          const content = chapter.content || ''
          const titleMatch = content.match(/^(?:#+\s*)(.*)/)
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1]
          } else {
            const firstLine = content
              .split('\n')
              .map(line => sanitizeTitleForDisplay(line))
              .find(line => line.length > 0) || ''
            if (firstLine.length > 0 && firstLine.length < 120 && !firstLine.startsWith('=')) {
              title = firstLine
            }
          }
        }

        const sanitizedTitle = sanitizeTitleForDisplay(title)
        const shouldPrefix = !isStructural && (
          !new RegExp(`^${chapterNumber}\s*[-–:]`, 'i').test(sanitizedTitle) &&
          !/^\d+\s*[-–:]/.test(sanitizedTitle)
        )

        return {
          ...chapter,
          number: chapterNumber,
          title: shouldPrefix ? `${chapterNumber} - ${sanitizedTitle}` : sanitizedTitle
        }
      });

      const dedupeResponses = (items) => {
        const map = new Map();
        items.forEach((item) => {
          const key = item?.nodeId || item?.id || `${item?.title || item?.phase || 'item'}_${map.size}`;
          if (!map.has(key)) {
            map.set(key, item);
          } else {
            const existing = map.get(key);
            const merged = {
              ...existing,
              ...item,
              content: item.content || existing.content,
              title: item.title || existing.title,
              words: item.words || existing.words,
              timestamp: item.timestamp || existing.timestamp,
              isLive: item.isLive ?? existing.isLive
            };
            if (!merged.isLive && typeof merged.nodeName === 'string') {
              merged.nodeName = merged.nodeName.replace(/\s*\(Live\)\s*$/i, '').trim();
            }
            map.set(key, merged);
          }
        });
        return Array.from(map.values());
      };

      const dedupeChapters = (items) => {
        const map = new Map();
        items.forEach((item, idx) => {
          const signature = (item.content || '').trim().slice(0, 200);
          const key = signature || `${item.nodeId || 'chapter'}_${idx}`;
          if (!map.has(key)) {
            map.set(key, item);
          }
        });
        return Array.from(map.values());
      };

      const orderedResponses = dedupeResponses(realResponses);
      const orderedChapters = dedupeChapters(finalChapters)
        .sort((a, b) => (a.number || 0) - (b.number || 0));
      const normalizedChapters = orderedChapters.map((chapter, idx) => ({
        ...chapter,
        number: chapter.number || idx + 1,
        title: chapter.title || `${idx + 1} - Chapter`
      }));

      setAiResponses(orderedResponses)
      setChapters(normalizedChapters)
      
      // NEW: Extract images from execution data
      const extractedImages = []
      if (Array.isArray(executionData.storyContext?.assets?.images) && executionData.storyContext.assets.images.length > 0) {
        extractedImages.push({
          nodeId: 'storyContext-images',
          nodeName: 'Story Images',
          images: executionData.storyContext.assets.images.map((img, idx) => ({
            url: img.url || img.imageUrl || img.inlineData || img,
            prompt: img.prompt || 'Generated image'
          }))
        })
      }
       nodeResultsEntries.forEach((entry, idx) => {
        const [key, result] = entry; // No need for complex array checks here
        if (result && result.assets && Array.isArray(result.assets.images) && result.assets.images.length > 0) {
          extractedImages.push({
             nodeId: result.nodeId || key || `node_${idx}`,
            nodeName: result.nodeName || key || 'Generated Images',
            images: result.assets.images.map(img => ({
              url: img.url || img, // Handle both object and simple string arrays
              prompt: img.prompt || 'No prompt provided'
            }))
          })
        }
      })
      
      setImagesByNode(extractedImages)
      
      prevExecutionDataRef.current = executionData
    } catch (error) {
      console.error('🚨 AIThinkingModal processing error:', error)
      // Set safe defaults to prevent crash
      setProcessingSteps([])
      setAiResponses([])
      setChapters([])
      setImagesByNode([])
    }
  }, [executionData, isOpen])

  // Copy to clipboard function
  const copyToClipboard = async (text) => {
    try {
      if (!text || typeof text !== 'string') {
        console.warn('Invalid text for clipboard:', text)
        return
      }
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Download chapters as a single file (txt or md)
  const downloadChaptersBundle = (format = 'txt') => {
    if (!Array.isArray(chapters) || chapters.length === 0) return
    try {
      let content = ''
      if (format === 'md') {
        content = chapters.map((ch, idx) => {
          const title = ch.title || `Chapter ${ch.number || idx + 1}`
          const body = sanitizeForExport(ch.content || '')
          return `## ${title}\n\n${body}`
        }).join('\n\n---\n\n')
      } else {
        content = chapters.map((ch, idx) => {
          const title = ch.title || `Chapter ${ch.number || idx + 1}`
          const body = sanitizeForExport(ch.content || '')
          return `${title}\n${'='.repeat(Math.max(10, title.length))}\n\n${body}`
        }).join('\n\n' + '='.repeat(40) + '\n\n')
      }
      const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `chapters-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Chapter download failed:', e)
    }
  }

  // Download all AI outputs as comprehensive JSON
  const downloadOutputsAsJSON = () => {
    if (!Array.isArray(aiResponses) || aiResponses.length === 0) return
    try {
      const sanitizedUserInputs = cleanObject({
        submitted: sanitizeUserInputData(
          executionData?.userInput ||
          executionData?.input_data ||
          executionData?.compiledData?.userInput
        ),
        compiled: sanitizeUserInputData(executionData?.compiledData?.userInput),
        options: sanitizeUserInputData(executionData?.options),
        regenerate: sanitizeUserInputData(
          executionData?.regenerateContext?.userInput ||
          executionData?.regenerateContext
        )
      })

      const sanitizedOutputs = aiResponses.map((output, index) => {
        const base = {
          id: output.id || `response_${index}`,
          nodeId: output.nodeId,
          nodeName: output.nodeName,
          phase: output.phase,
          timestamp: output.timestamp,
          status: output.status,
          tokens: output.tokens,
          words: output.words,
          provider: output.provider || output.providerName || output.rawData?.provider
        }

        if (output.content) {
          base.content = sanitizeForExport(output.content)
        }

        if (output.processedContent) {
          base.processedContent = sanitizeForExport(output.processedContent)
        }

        if (output.summary) {
          base.summary = sanitizeForExport(output.summary)
        }

        const curatedRaw = sanitizeRawDataForExport(output.rawData)
        if (curatedRaw) {
          Object.assign(base, curatedRaw)
        }

        return cleanObject(base)
      })

      const sanitizedChapters = chapters
        .map((chapter, idx) => cleanObject({
          number: chapter.number || idx + 1,
          title: sanitizeTitleForDisplay(chapter.title || `Chapter ${idx + 1}`),
          content: chapter.content ? sanitizeForExport(chapter.content) : undefined,
          summary: chapter.summary ? sanitizeForExport(chapter.summary) : undefined,
          tokens: chapter.tokens,
          words: chapter.words
        }))
        .filter(chapter => Object.keys(chapter).length > 0)

      const jsonData = cleanObject({
        metadata: {
          exportedAt: new Date().toISOString(),
          executionId: executionData?.executionId || 'unknown',
          totalOutputs: sanitizedOutputs.length,
          totalChapters: sanitizedChapters.length,
          totalProcessingSteps: processingSteps.length
        },
        executionSummary: cleanObject({
          status: executionData?.status,
          progress: executionData?.progress,
          currentNode: executionData?.currentNode,
          totalTokens: aiResponses.reduce((sum, out) => sum + (out.tokens || 0), 0),
          totalWords: aiResponses.reduce((sum, out) => sum + (out.words || 0), 0),
          totalCost: executionData?.cost,
          duration: executionData?.duration,
          providerUsed: executionData?.providerName
        }),
        userInputs: Object.keys(sanitizedUserInputs).length > 0 ? sanitizedUserInputs : undefined,
        processingSteps,
        aiOutputs: sanitizedOutputs,
        chapters: sanitizedChapters
      })
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-outputs-debug-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('JSON download failed:', e)
    }
  }

  // NEW: Download a single image from a URL
  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Network response was not ok.')
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      const extension = blob.type.split('/')[1] || 'jpg';
      link.download = `${filename || `image_${Date.now()}`}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Image download failed:', error)
    }
  }

  if (!isOpen) return null

  // Safety check to prevent crashes
  try {
    const tabs = [
      { id: 'process', label: 'AI Process', icon: Workflow, count: processingSteps?.length || 0 },
      { id: 'outputs', label: 'Outputs', icon: Brain, count: aiResponses?.length || 0 },
      { id: 'chapters', label: 'Chapters', icon: BookOpen, count: chapters?.length || 0 },
      { id: 'images', label: 'Image Gallery', icon: Image, count: imagesByNode.reduce((total, node) => total + node.images.length, 0) }
    ]

  return (
    <AnimatePresence>
      <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
          onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-6xl h-[90vh] bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-pink-900/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-x-hidden overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ✨ MAGICAL PARTICLES BACKGROUND */}
          <MagicalParticles />
          
          {/* 🎭 MAGICAL HEADER */}
          <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
            <div className="flex items-center gap-4">
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-md opacity-60" />
                <div className="relative p-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full border border-white/30 backdrop-blur-sm">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  AI Thinking Process
                </h2>
                <p className="text-white/60 text-sm">
                  Real-time insights into AI generation workflow
                </p>
              </div>
            </div>
            
              <motion.button
                onClick={onClose}
              className="group relative p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <X className="relative w-6 h-6 text-white/70 group-hover:text-red-300 transition-colors duration-300" />
              </motion.button>
          </div>

          {/* 🎨 MAGICAL TABS */}
          <div className="relative z-10 flex items-center gap-2 p-6 pb-0">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 text-white shadow-lg'
                      : 'bg-black/20 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl blur-xl" />
                  )}
                  
                  <div className="relative flex items-center gap-3">
                    <TabIcon className={`w-5 h-5 ${isActive ? 'text-purple-300' : 'text-white/60'}`} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <motion.div
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          isActive 
                            ? 'bg-gradient-to-r from-purple-400/30 to-pink-400/30 text-purple-200 border border-purple-400/30' 
                            : 'bg-white/10 text-white/60'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {tab.count}
                      </motion.div>
                    )}
                            </div>
                </motion.button>
              )
            })}
                          </div>

          {/* 📖 MAGICAL CONTENT */}
          <div className="relative z-10 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6" ref={scrollRef}>
              <AnimatePresence mode="wait">
                {activeTab === 'process' && (
                              <motion.div
                    key="process"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {processingSteps.length > 0 ? (
                      processingSteps.map((step, index) => (
                        <MagicalProcessingStep
                          key={step.id}
                          step={step}
                          index={index}
                          isActive={false}
                        />
                      ))
                    ) : (
                      <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="text-white/60 text-lg mb-2">
                          {executionData?.status === 'running'
                            ? 'Workflow is initializing…'
                            : 'No processing steps available'}
                        </div>
                        <div className="text-white/40 text-sm">
                          {executionData?.status === 'running'
                            ? 'AI is setting up the story blueprint and first node.'
                            : 'Start a workflow to see AI processing steps'}
                        </div>
                      </motion.div>
                    )}
                              </motion.div>
                            )}
                
                {activeTab === 'outputs' && (
                  <motion.div
                    key="outputs"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {aiResponses.length > 0 && (
                      <div className="flex items-center justify-end gap-2 mb-4">
                        <button
                          onClick={() => downloadOutputsAsJSON()}
                          className="px-3 py-1.5 rounded-md border border-white/20 text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2"
                        >
                          📊 Download JSON
                        </button>
                      </div>
                    )}
                    {aiResponses.length > 0 ? (
                      aiResponses.map((output, index) => (
                        <MagicalExpandableOutput
                          key={output.id}
                          output={output}
                          onCopy={copyToClipboard}
                          index={index}
                        />
                      ))
                    ) : (
                        <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="text-white/60 text-lg mb-2">No AI outputs available</div>
                        <div className="text-white/40 text-sm">AI responses will appear here during generation</div>
                      </motion.div>
                    )}
                        </motion.div>
                )}
                
                {activeTab === 'chapters' && (
                  <motion.div
                    key="chapters"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {chapters.length > 0 && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => downloadChaptersBundle('txt')}
                          className="px-3 py-1.5 rounded-md border border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                        >
                          Download TXT
                        </button>
                        <button
                          onClick={() => downloadChaptersBundle('md')}
                          className="px-3 py-1.5 rounded-md border border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                        >
                          Download MD
                        </button>
                      </div>
                    )}
                    {chapters.length > 0 ? (
                      chapters.map((chapter, index) => (
                        <MagicalChapter
                          key={chapter.id}
                          chapter={chapter}
                          index={index}
                        />
                      ))
                    ) : (
                      <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="text-white/60 text-lg mb-2">No chapters generated yet</div>
                        <div className="text-white/40 text-sm">Generated chapters will appear here</div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'images' && (
                  <motion.div
                    key="images"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <MagicalImageGallery imagesByNode={imagesByNode} onDownload={downloadImage} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
  } catch (renderError) {
    console.error('🚨 AIThinkingModal render error:', renderError)
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-red-900/90 border border-red-500/50 rounded-xl p-6 max-w-md">
          <h3 className="text-red-300 font-bold mb-2">AI Thinking Modal Error</h3>
          <p className="text-red-200 text-sm mb-4">
            There was an error displaying the AI thinking process. Please try again.
          </p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }
}

export default AIThinkingModal

import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { X, Plus, Save, Trash2, RefreshCw, Filter, Check, Search } from 'lucide-react'
import { CLIENT_FLOWS } from '../../data/clientFlows'
import inputSetService from '../../services/inputSetService'
import { getFieldOptions, ULTIMATE_OPTIONS, getUltimateFormVariables } from '../../data/ULTIMATE_MASTER_VARIABLES.js'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'

const flowKeys = Object.keys(CLIENT_FLOWS || {})

const emptyPreset = (flow_key = '') => ({
  id: null,
  flow_key,
  variant_key: '',
  name: '',
  description: '',
  tags: [],
  variables: {},
  weight: 0,
  is_active: true
})

const TagInput = ({ value = [], onChange }) => {
  const [text, setText] = useState('')
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((t, idx) => (
          <span key={idx} className="px-2 py-1 text-xs rounded-full border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {t}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add tag and press Enter"
          className="flex-1 rounded-lg px-3 py-2"
          style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && text.trim()) {
              onChange([...(value || []), text.trim()])
              setText('')
            }
          }}
        />
      </div>
    </div>
  )
}

// Top-level helper so MasterSelect can use it
const toArrayOptions = (arr) => (arr || []).map(o => (typeof o === 'object' ? o : { value: o, label: String(o) }))

const ensureOptions = (fieldKey, currentValue) => {
  // COMPLETE field mapping - ALL fields from ULTIMATE_MASTER_VARIABLES
  const keyMap = {
    // Core fields
    tone: 'tones',
    writing_style: 'writing_styles',
    target_audience: 'target_audiences',
    accent: 'accents',
    word_count: 'word_counts',
    chapter_count: 'chapter_counts',
    genre: 'genres',
    // Imaging fields
    image_style: 'image_styles',
    art_type: 'art_types',
    aspect_ratio: 'aspect_ratios',
    camera_angle: 'camera_angles',
    focal_length: 'focal_lengths',
    lighting_style: 'lighting_styles',
    background: 'backgrounds',
    color_palette: 'color_palettes',
    mood: 'image_moods',
    composition: 'compositions',
    num_images: 'image_counts',
    upscaler: 'upscalers',
    // E-Cover fields
    ecover_layout: 'ecover_layouts',
    ecover_style: 'ecover_styles',
    typography_combo: 'typography_combos',
    // Typography fields
    heading_font_family: 'font_families',
    body_font_family: 'font_families',
    body_font_size: 'body_font_sizes',
    line_height: 'line_heights',
    paragraph_spacing: 'paragraph_spacings',
    page_size: 'page_sizes',
    page_margins: 'page_margin_presets',
    // Output
    output_formats: 'output_formats',
    // Audiobook
    content_source: 'content_sources',
    // Industry
    industry_focus: 'industry_focuses'
  }
  
  const normalized = keyMap[fieldKey] || fieldKey
  let base = getFieldOptions(normalized)
  
  // ALWAYS try ULTIMATE_OPTIONS if getFieldOptions fails
  if (!Array.isArray(base) || base.length === 0) {
    const fallback = ULTIMATE_OPTIONS && (ULTIMATE_OPTIONS[normalized] || ULTIMATE_OPTIONS[fieldKey])
    if (Array.isArray(fallback) && fallback.length > 0) {
      base = toArrayOptions(fallback)
    }
  }
  
  // If STILL no options, return empty with current value
  if (!Array.isArray(base)) base = []
  
  // Add current value if not in options
  const hasVal = base.some((opt) => (opt.value || opt) === currentValue)
  if (currentValue && !hasVal) {
    const display = String(currentValue).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return [{ value: currentValue, label: display }, ...base]
  }
  
  return base
}

// Compose premium default instructions from variables and flow context
const composeDefaultInstructions = (flowKey, vars = {}) => {
  const tone = vars.tone || 'professional'
  const style = vars.writing_style || 'clear'
  const audience = vars.target_audience || 'general'
  const title = vars.book_title || vars.story_title || vars.topic || 'the work'
  const genre = vars.genre || (String(flowKey || '').includes('fiction') ? 'fiction' : 'non‑fiction')

  return (
    `PROJECT: ${title}
AUDIENCE: ${audience}
VOICE: ${tone}, ${style}
GENRE/MODE: ${genre}

VISION:
- State a single, compelling promise for the reader.
- Keep a strong point‑of‑view; be specific, not generic.

CONTENT PILLARS:
- Core premise and stakes (why it matters now).
- Key themes and recurring motifs.
- Signature concepts/frameworks unique to this book.

CHARACTER / PERSONA NOTES (adapt if non‑fiction):
- Protagonist or primary persona: goals, fears, contradictions.
- Relationships that create tension or momentum.

PLOT / STRUCTURE GUIDANCE (adapt for non‑fiction):
- Opening hook that creates curiosity and context.
- Escalation through meaningful reversals or insights.
- A satisfying resolution that delivers earned payoff.

WORLD & CONTINUITY RULES:
- Maintain internal canon; do not contradict earlier facts.
- Track names, places, timelines, and terminology consistently.

RESEARCH & TRUTHFULNESS:
- Use concrete, verifiable details; avoid hallucinations.
- If an example is illustrative, flag it clearly as such.

STYLE DO / DON’T:
- DO: vivid specifics, active voice, sensory details, strong verbs.
- DO: “show, don’t tell” where appropriate; use lived examples.
- DON’T: filler, generic platitudes, or duplicate content.

SENSITIVITY & ETHICS:
- Avoid stereotypes; write respectfully and inclusively.

ENDINGS:
- Close major loops; leave the reader with clarity and momentum.
`
  )
}

const VariablesEditor = ({ variables, setVariables, previewRows }) => {
  const [key, setKey] = useState('')
  const [val, setVal] = useState('')
  const parsedVal = useMemo(() => {
    try {
      return JSON.parse(val)
    } catch {
      return val
    }
  }, [val])

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="variable key (e.g., word_count)"
          className="rounded-lg px-3 py-2 col-span-1"
          style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        />
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder='value (string/JSON, e.g. "500-1500" or ["pdf","docx"])'
          className="rounded-lg px-3 py-2 col-span-2"
          style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        />
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-2 rounded-lg border hover:bg-surface-hover"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          onClick={() => {
            if (!key.trim()) return
            setVariables({ ...(variables || {}), [key.trim()]: parsedVal })
            setKey(''); setVal('')
          }}
        >
          Add / Update Field
        </button>
        <button
          className="px-3 py-2 rounded-lg border hover:bg-surface-hover"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          onClick={() => {
            if (!key.trim()) return
            const v = { ...(variables || {}) }
            delete v[key.trim()]
            setVariables(v)
            setKey(''); setVal('')
          }}
        >
          Remove Field
        </button>
      </div>
      <div className="rounded-lg p-3 border" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Preview (what this will set):</div>
        <ul className="space-y-1 text-xs">
          {previewRows.map((r, idx) => (
            <li key={idx} style={{ color: 'var(--text-secondary)' }}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Accessible custom select fed by master variables
// Fallback native select for reliability (opens everywhere)
const NativeSelect = ({ fieldKey, value, onChange, placeholder = 'Select…', options: optionsOverride }) => {
  const options = Array.isArray(optionsOverride) ? optionsOverride : ensureOptions(fieldKey, value)
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg px-3 py-2 border focus-ring"
      style={{ background: 'var(--bg-surface-hover)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
    >
      {!value && <option value="">{placeholder}</option>}
      {options.map((opt, i) => (
        <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
  )
}

// Portal select kept for future; not used by default to avoid OS/browser issues
const MasterSelect = ({ fieldKey, value, onChange, placeholder = 'Select…' }) => {
  const [open, setOpen] = useState(false)
  const [menuRect, setMenuRect] = useState(null)
  const btnRef = React.useRef(null)
  const options = ensureOptions(fieldKey, value)
  const selectedLabel = (() => {
    const match = options.find(o => (o.value || o) === value)
    const raw = match ? (match.label || match) : ''
    return raw || ''
  })()

  useEffect(() => {
    const onDocClick = (e) => {
      if (!btnRef.current) return
      if (!btnRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const openMenu = () => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setMenuRect({ left: r.left, top: r.bottom + 4, width: r.width })
    setOpen(true)
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full rounded-lg px-3 py-2 text-left border focus-ring"
        style={{ background: 'var(--bg-surface-hover)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        onClick={open ? () => setOpen(false) : openMenu}
      >
        <span>{selectedLabel || placeholder}</span>
      </button>
      {open && menuRect && createPortal(
        <div
          className="rounded-lg border shadow-soft max-h-56 overflow-auto"
          style={{ position: 'fixed', zIndex: 9999, left: menuRect.left, top: menuRect.top, width: menuRect.width, background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          role="listbox"
        >
          {options.map((opt, i) => {
            const val = opt.value || opt
            const label = opt.label || opt
            const active = val === value
            return (
              <div
                key={i}
                role="option"
                aria-selected={active}
                className={`px-3 py-2 cursor-pointer ${active ? 'bg-surface-hover' : ''}`}
                style={{ color: 'var(--text-primary)' }}
                onClick={() => { onChange(val); setOpen(false) }}
              >
                {label}
              </div>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

const ClientInputPresetsModal = ({ isOpen, onClose, flowKey = '' }) => {
  const [presets, setPresets] = useState([])
  const [loading, setLoading] = useState(false)
  const [flowFilter, setFlowFilter] = useState(flowKey || '')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const loadPresets = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('client_flow_input_sets')
        .select('id, flow_key, variant_key, name, description, tags, variables, is_active, weight, updated_at')
        .order('flow_key', { ascending: true })
        .order('weight', { ascending: true })
        .order('updated_at', { ascending: false })

      if (flowKey || flowFilter) query = query.eq('flow_key', flowKey || flowFilter)

      const { data, error } = await query
      if (error) throw error
      setPresets(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load presets:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (isOpen) loadPresets() }, [isOpen, flowFilter, flowKey])

  // Dedupe and filter presets for the active flow
  const filtered = useMemo(() => {
    const fk = flowKey || flowFilter
    const base = Array.isArray(presets) ? presets.filter(p => p.flow_key === fk) : []
    // Dedupe by variant_key if present, otherwise by name
    const seen = new Set()
    const deduped = base.filter(p => {
      const key = (p.variant_key || p.name || p.id || '').toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    // Sort by weight asc, then updated_at desc
    deduped.sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0) || new Date(b.updated_at) - new Date(a.updated_at))

    if (!search.trim()) return deduped
    const q = search.trim().toLowerCase()
    return deduped.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.variant_key?.toLowerCase().includes(q)
    )
  }, [presets, search, flowKey, flowFilter])

  // Allowed options strictly from the flow's input node
  const getAllowedOptions = (varName) => {
    try {
      const fk = flowKey || flowFilter
      const flow = CLIENT_FLOWS[fk]
      const inputNode = Array.isArray(flow?.nodes) ? flow.nodes.find(n => Array.isArray(n?.data?.inputFields)) : null
      const field = Array.isArray(inputNode?.data?.inputFields)
        ? inputNode.data.inputFields.find(f => f.variable === varName)
        : null
      
      // ALWAYS fall back to ULTIMATE_MASTER_VARIABLES
      if (!field) return ensureOptions(varName, null)
      if (Array.isArray(field.options) && field.options.length > 0) return toArrayOptions(field.options)
      if (field.optionsSource) return ensureOptions(field.optionsSource, null)
      
      // CRITICAL: If field exists but has no options, use ULTIMATE_MASTER_VARIABLES
      return ensureOptions(varName, null)
    } catch {
      // ALWAYS return options from ULTIMATE_MASTER_VARIABLES instead of empty array
      return ensureOptions(varName, null)
    }
  }

  const startNew = () => setEditing(emptyPreset(flowKey || flowFilter))

  const saveEditing = async () => {
    try {
      const payload = { ...editing }
      if (!payload.flow_key) return
      if (payload.id) {
        const { error } = await supabase
          .from('client_flow_input_sets')
          .update({
            flow_key: payload.flow_key,
            variant_key: payload.variant_key,
            name: payload.name,
            description: payload.description,
            tags: payload.tags,
            variables: payload.variables,
            weight: payload.weight,
            is_active: payload.is_active
          })
          .eq('id', payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('client_flow_input_sets')
          .insert([{ 
            flow_key: payload.flow_key,
            variant_key: payload.variant_key,
            name: payload.name,
            description: payload.description,
            tags: payload.tags,
            variables: payload.variables,
            weight: payload.weight,
            is_active: payload.is_active
          }])
        if (error) throw error
      }
      await loadPresets()
      setEditing(null)
    } catch (e) {
      console.error('Failed to save preset:', e)
    }
  }

  const removePreset = async (id) => {
    try {
      const { error } = await supabase
        .from('client_flow_input_sets')
        .delete()
        .eq('id', id)
      if (error) throw error
      await loadPresets()
    } catch (e) {
      console.error('Failed to delete preset:', e)
    }
  }

  if (!isOpen) return null

  const previewRows = (variables, fk) => {
    const vars = variables || {}
    return Object.entries(vars).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="superadmin-theme rounded-2xl border border-subtle w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex" style={{ background: 'var(--bg-surface)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} onClick={(e) => e.stopPropagation()}>
        {/* Left: List */}
        <div className="w-1/2 h-full border-r border-subtle flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-subtle">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Presets</h3>
              <Filter className="w-4 h-4 ml-2" style={{ color: 'var(--text-secondary)' }} />
              {flowKey ? (
                <div className="text-sm px-3 py-1 rounded-lg" style={{ background: 'var(--accent-primary-alpha)', color: 'var(--accent-primary)' }}>{CLIENT_FLOWS[flowKey]?.name || flowKey}</div>
              ) : (
                <select
                  value={flowFilter}
                  onChange={(e) => setFlowFilter(e.target.value)}
                  className="rounded-lg px-3 py-2"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  <option value="">All Flows</option>
                  {flowKeys.map(k => (
                    <option key={k} value={k}>{CLIENT_FLOWS[k]?.name || k}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5" style={{ color: 'var(--text-secondary)' }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search presets"
                  className="rounded-lg pl-8 pr-3 py-2"
                  style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <button
                onClick={loadPresets}
                className="p-2 rounded-lg hover:bg-surface-hover"
                title="Refresh"
                style={{ color: 'var(--text-secondary)' }}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditing(emptyPreset(flowKey || flowFilter))}
                className="px-3 py-2 rounded-lg border hover:bg-surface-hover"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                <Plus className="w-4 h-4 inline mr-1" /> New
              </button>
              <button onClick={async () => {
                try {
                  const fk = flowKey || flowFilter
                  if (!fk) return
                  const list = Array.isArray(presets) ? presets : []
                  const toUpdate = list.filter(p => (p.flow_key === fk) && (!p.variables?.custom_instructions || String(p.variables?.custom_instructions).trim().length < 20))
                  if (toUpdate.length === 0) return
                  const rows = toUpdate.map((p) => ({
                    id: p.id,
                    variables: { ...(p.variables || {}), custom_instructions: composeDefaultInstructions(fk, p.variables) }
                  }))
                  // Batch update
                  await Promise.all(rows.map(r => supabase.from('client_flow_input_sets').update({ variables: r.variables }).eq('id', r.id)))
                  toast.success(`Backfilled instructions for ${rows.length} preset(s)`) 
                  await loadPresets()
                } catch (e) {
                  console.error('Backfill failed:', e)
                  toast.error('Failed to backfill instructions')
                }
              }} className="px-3 py-2 rounded-lg border hover:bg-surface-hover hoverLift" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                Backfill Instructions
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover hoverLift" style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(168,85,247,0.10))',
                      borderColor: 'var(--border-subtle)'
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-transform hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.12))',
                      borderColor: 'var(--border-subtle)'
                    }}
                    onClick={() => setEditing({ ...p })}
                  >
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.flow_key} • {p.variant_key}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {p.is_active ? <span className="px-2 py-1 rounded-full border" style={{ borderColor: 'var(--border-subtle)' }}><Check className="w-3 h-3 inline mr-1"/>Active</span> : 'Inactive'}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No presets found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 h-full flex flex-col">
          <div className="p-4 border-b border-subtle flex items-center justify-between sticky top-0 z-10" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {CLIENT_FLOWS[flowKey || flowFilter]?.name || 'Client Input Presets'}
            </div>
            <div className="flex items-center gap-2">
              {editing?.id && (
                <button
                  onClick={() => removePreset(editing.id)}
                  className="px-3 py-2 rounded-lg border hover:bg-surface-hover"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  <Trash2 className="w-4 h-4 inline mr-1"/> Delete
                </button>
              )}
              <button
                onClick={saveEditing}
                disabled={!editing}
                className="px-3 py-2 rounded-lg border hover:bg-surface-hover disabled:opacity-50"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                <Save className="w-4 h-4 inline mr-1"/> Save
              </button>
              {editing && (
                <button
                  onClick={() => {
                    const fk = flowKey || flowFilter
                    const text = composeDefaultInstructions(fk, editing.variables)
                    setEditing({ ...editing, variables: { ...(editing.variables||{}), custom_instructions: text } })
                    toast.success('Composed premium instructions from current variables')
                  }}
                  className="px-3 py-2 rounded-lg border hover:bg-surface-hover"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  Generate Instructions
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {editing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Flow</label>
                    <select
                      value={editing.flow_key}
                      onChange={(e) => setEditing({ ...editing, flow_key: e.target.value })}
                      className="w-full rounded-lg px-3 py-2"
                      style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                      disabled={!!flowKey}
                    >
                      <option value="">Select flow…</option>
                      {flowKeys.map(k => (
                        <option key={k} value={k}>{CLIENT_FLOWS[k]?.name || k}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Variant Key</label>
                    <input
                      value={editing.variant_key}
                      onChange={(e) => setEditing({ ...editing, variant_key: e.target.value })}
                      className="w-full rounded-lg px-3 py-2"
                      placeholder="unique_variant_key"
                      style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                    <input
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className="w-full rounded-lg px-3 py-2"
                      placeholder="Display name"
                      style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Display Order</label>
                    <input
                      type="number"
                      value={editing.weight}
                      onChange={(e) => setEditing({ ...editing, weight: Number(e.target.value || 0) })}
                      className="w-full rounded-lg px-3 py-2"
                      placeholder="0"
                      style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                    <div className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>Lower number shows earlier in the list.</div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                  <textarea
                    value={editing.description || ''}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Tags</label>
                  <TagInput value={editing.tags || []} onChange={(tags) => setEditing({ ...editing, tags })} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs" style={{ color: 'var(--text-secondary)' }}>Variables</label>
                    <label className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: !!e.target.checked })} /> Active
                    </label>
                  </div>

                  {/* ALL 44 FIELDS ORGANIZED */}
                  <div className="space-y-6">
                    
                    {/* CORE FIELDS */}
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }}>
                      <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>📖 Core Content</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Book Title</label>
                          <input value={editing.variables?.book_title || ''} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), book_title: e.target.value } })} className="w-full rounded-lg px-3 py-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} placeholder="Book title" />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Author Name</label>
                          <input value={editing.variables?.author_name || ''} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), author_name: e.target.value } })} className="w-full rounded-lg px-3 py-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} placeholder="Author name" />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Genre</label>
                          <NativeSelect fieldKey="genre" value={editing.variables?.genre || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), genre: val } })} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Topic/Premise</label>
                          <textarea value={editing.variables?.topic || ''} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), topic: e.target.value } })} rows={3} className="w-full rounded-lg px-3 py-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} placeholder="Core topic or story premise" />
                        </div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Target Audience</label><NativeSelect fieldKey="target_audience" value={editing.variables?.target_audience || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), target_audience: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Word Count</label><NativeSelect fieldKey="word_count" value={editing.variables?.word_count || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), word_count: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Chapter Count</label><NativeSelect fieldKey="chapter_count" value={editing.variables?.chapter_count || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), chapter_count: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Tone</label><NativeSelect fieldKey="tone" value={editing.variables?.tone || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), tone: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Writing Style</label><NativeSelect fieldKey="writing_style" value={editing.variables?.writing_style || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), writing_style: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Accent</label><NativeSelect fieldKey="accent" value={editing.variables?.accent || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), accent: val } })} /></div>
                      </div>
                    </div>

                    {/* OUTPUT FORMATS */}
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }}>
                      <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>📦 Output Formats</h4>
                      <div className="flex flex-wrap gap-2">
                        {ensureOptions('output_formats', null).map((opt, i) => {
                          const value = opt.value || opt
                          const list = Array.isArray(editing.variables?.output_formats) ? editing.variables.output_formats : []
                          const checked = list.includes(value)
                          return (
                            <label key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all hover:scale-105" style={{ borderColor: checked ? 'var(--accent-primary)' : 'var(--border-subtle)', background: checked ? 'var(--accent-primary-alpha)' : 'transparent', color: 'var(--text-primary)' }}>
                              <input type="checkbox" checked={checked} onChange={(e) => { const next = new Set(list); if (e.target.checked) next.add(value); else next.delete(value); setEditing({ ...editing, variables: { ...(editing.variables||{}), output_formats: Array.from(next) } }) }} />
                              <span className="text-xs">{opt.label || opt}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* IMAGING SETTINGS */}
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }}>
                      <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>🎨 Imaging & Visual</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={editing.variables?.include_images === 'true'} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), include_images: e.target.checked ? 'true' : 'false' } })} />
                          <label className="text-xs" style={{ color: 'var(--text-primary)' }}>Include Images</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={editing.variables?.include_ecover === 'true'} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), include_ecover: e.target.checked ? 'true' : 'false' } })} />
                          <label className="text-xs" style={{ color: 'var(--text-primary)' }}>Include E-Cover</label>
                        </div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Image Style</label><NativeSelect fieldKey="image_style" value={editing.variables?.image_style || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), image_style: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Art Type</label><NativeSelect fieldKey="art_type" value={editing.variables?.art_type || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), art_type: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Aspect Ratio</label><NativeSelect fieldKey="aspect_ratio" value={editing.variables?.aspect_ratio || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), aspect_ratio: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Camera Angle</label><NativeSelect fieldKey="camera_angle" value={editing.variables?.camera_angle || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), camera_angle: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Focal Length</label><NativeSelect fieldKey="focal_length" value={editing.variables?.focal_length || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), focal_length: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Lighting</label><NativeSelect fieldKey="lighting_style" value={editing.variables?.lighting_style || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), lighting_style: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Background</label><NativeSelect fieldKey="background" value={editing.variables?.background || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), background: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Color Palette</label><NativeSelect fieldKey="color_palette" value={editing.variables?.color_palette || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), color_palette: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Mood</label><NativeSelect fieldKey="mood" value={editing.variables?.mood || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), mood: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Composition</label><NativeSelect fieldKey="composition" value={editing.variables?.composition || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), composition: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Num Images</label><NativeSelect fieldKey="num_images" value={editing.variables?.num_images || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), num_images: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Upscaler</label><NativeSelect fieldKey="upscaler" value={editing.variables?.upscaler || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), upscaler: val } })} /></div>
                        <div className="col-span-2"><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Negative Prompt</label><textarea value={editing.variables?.negative_prompt || ''} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), negative_prompt: e.target.value } })} rows={2} className="w-full rounded-lg px-3 py-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Seed</label><input value={editing.variables?.seed || ''} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), seed: e.target.value } })} className="w-full rounded-lg px-3 py-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} /></div>
                      </div>
                    </div>

                    {/* E-COVER SETTINGS */}
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }}>
                      <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>📕 E-Cover Settings</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>E-Cover Layout</label><NativeSelect fieldKey="ecover_layout" value={editing.variables?.ecover_layout || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), ecover_layout: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>E-Cover Style</label><NativeSelect fieldKey="ecover_style" value={editing.variables?.ecover_style || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), ecover_style: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Typography Combo</label><NativeSelect fieldKey="typography_combo" value={editing.variables?.typography_combo || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), typography_combo: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Brand Colors</label><input value={editing.variables?.brand_colors || ''} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), brand_colors: e.target.value } })} className="w-full rounded-lg px-3 py-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} placeholder="#hex colors" /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Title Text Override</label><input value={editing.variables?.title_text || ''} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), title_text: e.target.value } })} className="w-full rounded-lg px-3 py-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Subtitle Text</label><input value={editing.variables?.subtitle_text || ''} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), subtitle_text: e.target.value } })} className="w-full rounded-lg px-3 py-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Logo URL</label><input value={editing.variables?.logo_url || ''} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), logo_url: e.target.value } })} className="w-full rounded-lg px-3 py-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} /></div>
                      </div>
                    </div>

                    {/* TYPOGRAPHY */}
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }}>
                      <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>📝 Typography & Formatting</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Heading Font</label><NativeSelect fieldKey="heading_font_family" value={editing.variables?.heading_font_family || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), heading_font_family: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Body Font</label><NativeSelect fieldKey="body_font_family" value={editing.variables?.body_font_family || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), body_font_family: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Font Size</label><NativeSelect fieldKey="body_font_size" value={editing.variables?.body_font_size || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), body_font_size: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Line Height</label><NativeSelect fieldKey="line_height" value={editing.variables?.line_height || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), line_height: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Paragraph Spacing</label><NativeSelect fieldKey="paragraph_spacing" value={editing.variables?.paragraph_spacing || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), paragraph_spacing: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Page Size</label><NativeSelect fieldKey="page_size" value={editing.variables?.page_size || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), page_size: val } })} /></div>
                        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Page Margins</label><NativeSelect fieldKey="page_margins" value={editing.variables?.page_margins || ''} onChange={(val) => setEditing({ ...editing, variables: { ...(editing.variables||{}), page_margins: val } })} /></div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2"><input type="checkbox" checked={editing.variables?.include_toc === 'true'} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), include_toc: e.target.checked ? 'true' : 'false' } })} /><span className="text-xs" style={{ color: 'var(--text-primary)' }}>TOC</span></label>
                          <label className="flex items-center gap-2"><input type="checkbox" checked={editing.variables?.include_title_page === 'true'} onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), include_title_page: e.target.checked ? 'true' : 'false' } })} /><span className="text-xs" style={{ color: 'var(--text-primary)' }}>Title Page</span></label>
                        </div>
                      </div>
                    </div>

                    {/* CUSTOM INSTRUCTIONS */}
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }}>
                      <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>✨ Custom Instructions</h4>
                      <textarea
                        value={editing.variables?.custom_instructions || ''}
                        onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), custom_instructions: e.target.value } })}
                        rows={8}
                        className="w-full rounded-lg px-3 py-2"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        placeholder="Write rich, detailed custom instructions that define this preset personality and use case..."
                      />
                    </div>

                  {/* DYNAMIC CATCH-ALL: Render any master variables not explicitly shown above */}
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }}>
                    <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>🧩 Additional Variables (Auto from Master)</h4>
                    {(() => {
                      // Explicitly-rendered keys above (keep in sync with sections)
                      const explicitKeys = new Set([
                        'book_title','author_name','topic','genre','target_audience','word_count','chapter_count','tone','writing_style','accent',
                        'output_formats',
                        'include_images','include_ecover','image_style','art_type','aspect_ratio','camera_angle','focal_length','lighting_style','background','color_palette','mood','composition','num_images','upscaler','negative_prompt','seed',
                        'ecover_layout','ecover_style','typography_combo','brand_colors','title_text','subtitle_text','logo_url',
                        'heading_font_family','body_font_family','body_font_size','line_height','paragraph_spacing','page_size','page_margins','include_toc','include_title_page',
                        'custom_instructions'
                      ])
                      const allVars = getUltimateFormVariables()
                      const dynamicVars = allVars.filter(v => !explicitKeys.has(v.id))
                      if (dynamicVars.length === 0) {
                        return <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>All master variables are already exposed above.</div>
                      }
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          {dynamicVars.map(v => {
                            const val = editing.variables?.[v.id]
                            const commonLabel = (
                              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {v.name || v.id}
                              </label>
                            )
                            if (v.type === 'select') {
                              return (
                                <div key={v.id}>
                                  {commonLabel}
                                  <NativeSelect
                                    fieldKey={v.id}
                                    value={val || ''}
                                    onChange={(newVal) => setEditing({ ...editing, variables: { ...(editing.variables||{}), [v.id]: newVal } })}
                                  />
                                </div>
                              )
                            }
                            if (v.type === 'multiselect') {
                              const opts = ensureOptions(v.id, null)
                              const list = Array.isArray(val) ? val : []
                              return (
                                <div key={v.id} className="col-span-2">
                                  {commonLabel}
                                  <div className="flex flex-wrap gap-2">
                                    {opts.map((opt, i) => {
                                      const value = opt.value || opt
                                      const checked = list.includes(value)
                                      return (
                                        <label key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer" style={{ borderColor: checked ? 'var(--accent-primary)' : 'var(--border-subtle)', background: checked ? 'var(--accent-primary-alpha)' : 'transparent', color: 'var(--text-primary)' }}>
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => {
                                              const next = new Set(list)
                                              if (e.target.checked) next.add(value)
                                              else next.delete(value)
                                              setEditing({ ...editing, variables: { ...(editing.variables||{}), [v.id]: Array.from(next) } })
                                            }}
                                          />
                                          <span className="text-xs">{opt.label || opt}</span>
                                        </label>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            }
                            if (v.type === 'checkbox') {
                              return (
                                <div key={v.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={String(val) === 'true'}
                                    onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), [v.id]: e.target.checked ? 'true' : 'false' } })}
                                  />
                                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{v.name || v.id}</span>
                                </div>
                              )
                            }
                            if (v.type === 'textarea') {
                              return (
                                <div key={v.id} className="col-span-2">
                                  {commonLabel}
                                  <textarea
                                    value={val || ''}
                                    onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), [v.id]: e.target.value } })}
                                    rows={3}
                                    className="w-full rounded-lg px-3 py-2"
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                                  />
                                </div>
                              )
                            }
                            // default to text
                            return (
                              <div key={v.id}>
                                {commonLabel}
                                <input
                                  value={val || ''}
                                  onChange={(e) => setEditing({ ...editing, variables: { ...(editing.variables||{}), [v.id]: e.target.value } })}
                                  className="w-full rounded-lg px-3 py-2"
                                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>

                    {/* ADVANCED/OTHER FIELDS */}
                    <details className="p-4 rounded-xl cursor-pointer" style={{ background: 'var(--bg-surface-hover)' }}>
                      <summary className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>⚙️ Advanced Fields (Click to expand)</summary>
                      <VariablesEditor
                        variables={editing.variables || {}}
                        setVariables={(v) => setEditing({ ...editing, variables: v })}
                        previewRows={previewRows(editing.variables, editing.flow_key)}
                      />
                    </details>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                Select a preset to edit or create a new one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientInputPresetsModal



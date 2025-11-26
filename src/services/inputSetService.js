import { supabase } from '../lib/supabase'
import { getFieldOptions, getFieldName } from '../data/ULTIMATE_MASTER_VARIABLES'

// Lightweight in-memory cache keyed by flow_key
const cache = new Map()
const CACHE_TTL_MS = 60 * 1000 // 1 minute TTL

function getCache(flowKey) {
  const entry = cache.get(flowKey)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(flowKey)
    return null
  }
  return entry.data
}

function setCache(flowKey, data) {
  cache.set(flowKey, { data, timestamp: Date.now() })
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// Validate and normalize one value against a field definition and master options
function normalizeValueForField(field, value) {
  const options = getFieldOptions(field) || []

  // Multiselect handling
  if (field.type === 'multiselect' || field.multiple) {
    const incoming = Array.isArray(value) ? value : (value ? [value] : [])
    const allowedValues = options.map(opt => (typeof opt === 'string' ? opt : opt.value || opt.id)).filter(Boolean)
    return incoming.filter(v => allowedValues.includes(v))
  }

  // Select handling
  if (field.type === 'select') {
    const allowedValues = options.map(opt => (typeof opt === 'string' ? opt : opt.value || opt.id)).filter(Boolean)
    
    // SURGICAL DEBUG: Log mismatch issues
    if (!allowedValues.includes(value) && value) {
      console.log(`⚠️ PRESET VALUE MISMATCH for ${field.variable || field.name}:`)
      console.log('  - Trying to set value:', value, `(type: ${typeof value})`)
      console.log('  - Allowed values:', allowedValues)
      console.log('  - Field options:', options)
    }
    
    return allowedValues.includes(value) ? value : ''
  }

  // Checkbox
  if (field.type === 'checkbox' || field.type === 'boolean') {
    return Boolean(value)
  }

  // Number
  if (field.type === 'number') {
    const num = Number(value)
    if (Number.isFinite(num)) return num
    return ''
  }

  // Text/textarea and others
  if (value == null) return ''
  return String(value)
}

// Keep only tokens present in inputFields and normalize per type/options
function validateAgainstFields(inputFields, presetVariables) {
  const sanitized = {}
  const byKey = new Map()
  inputFields.forEach(f => byKey.set(f.variable || f.name, f))

  Object.entries(presetVariables || {}).forEach(([token, value]) => {
    const field = byKey.get(token)
    if (!field) return
    sanitized[token] = normalizeValueForField(field, value)
  })

  return sanitized
}

export const inputSetService = {
  async listByFlowKey(flowKey) {
    if (!flowKey) return []

    const cached = getCache(flowKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('client_flow_input_sets')
      .select('id, flow_key, variant_key, name, description, tags, variables, is_active, weight, updated_at')
      .eq('flow_key', flowKey)
      .eq('is_active', true)
      .order('weight', { ascending: true })
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('inputSetService.listByFlowKey error:', error)
      return []
    }

    const presets = Array.isArray(data) ? data.slice(0, 5) : []
    setCache(flowKey, presets)
    return presets
  },

  validateAgainstFields,

  applyPreset({ preset, inputFields, currentValues }) {
    const validated = validateAgainstFields(inputFields, preset?.variables || {})
    // SURGICAL FIX: USER EDITS ARE FINAL - Preset fills empty fields only, never overwrites user input
    const result = { ...validated, ...currentValues }
    
    // Remove any empty/null values from currentValues to allow preset to fill them
    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] === '' || currentValues[key] === null || currentValues[key] === undefined) {
        // Allow preset to fill empty fields
        if (validated[key] !== undefined && validated[key] !== null && validated[key] !== '') {
          result[key] = validated[key]
        }
      } else {
        // USER INPUT IS SACRED - Never overwrite non-empty user input
        result[key] = currentValues[key]
      }
    })
    
    console.log('🔧 PRESET APPLICATION DEBUG:')
    console.log('  - Preset values:', validated)
    console.log('  - User values:', currentValues) 
    console.log('  - Final result (USER WINS):', result)
    
    return result
  },

  // Utility: pretty preview for UI (Proper Case labels)
  buildPreview(inputFields, variables) {
    const byKey = new Map()
    inputFields.forEach(f => byKey.set(f.variable || f.name, f))
    const preview = []
    Object.entries(variables || {}).forEach(([token, value]) => {
      const field = byKey.get(token)
      if (!field) return
      const label = getFieldName(field)
      const displayValue = Array.isArray(value) ? value.join(', ') : String(value)
      preview.push({ token, label, value: displayValue })
    })
    return preview
  }
}

export default inputSetService



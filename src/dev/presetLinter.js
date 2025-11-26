/*
  Developer utility (manual use): validate client_flow_input_sets presets
  against ULTIMATE_MASTER_VARIABLES. Run this in the app console or wire it
  to a temporary button in a dev-only screen.

  Usage in browser dev console after app loads:
    import { runPresetLint } from '/src/dev/presetLinter.js'
    runPresetLint()

  The linter prints a concise report of:
    - Unknown tokens (not in ULTIMATE_VARIABLES)
    - Invalid option values for select/multiselect fields
*/

import { supabase } from '../lib/supabase'
import ULTIMATE_VARIABLES, { ULTIMATE_OPTIONS } from '../data/ULTIMATE_MASTER_VARIABLES'

function toAllowedOptionValues(variableKey) {
  const v = ULTIMATE_VARIABLES[variableKey]
  if (!v) return null
  const optRef = typeof v.options === 'string' ? v.options : null
  if (!optRef) return null
  const src = ULTIMATE_OPTIONS[optRef]
  if (!Array.isArray(src)) return null
  return new Set(src.map(opt => (typeof opt === 'string' ? opt : opt.value || opt.id)).filter(Boolean))
}

function* validatePreset(preset) {
  const issues = []
  const variables = preset.variables || {}

  for (const [token, value] of Object.entries(variables)) {
    const v = ULTIMATE_VARIABLES[token]
    if (!v) {
      issues.push({ type: 'unknown_token', token, value })
      continue
    }

    // Only validate options for select/multiselect
    const isMulti = v.type === 'multiselect'
    const isSelect = v.type === 'select'
    if (!isMulti && !isSelect) continue

    const allowed = toAllowedOptionValues(token)
    if (!allowed) continue

    if (isMulti) {
      const arr = Array.isArray(value) ? value : (value ? [value] : [])
      const invalid = arr.filter(vv => !allowed.has(vv))
      if (invalid.length > 0) issues.push({ type: 'invalid_option', token, invalid, allowedCount: allowed.size })
    } else {
      if (value && !allowed.has(value)) {
        issues.push({ type: 'invalid_option', token, invalid: [value], allowedCount: allowed.size })
      }
    }
  }

  for (const i of issues) yield i
}

export async function runPresetLint() {
  try {
    const { data, error } = await supabase
      .from('client_flow_input_sets')
      .select('id, flow_key, variant_key, name, variables, is_active')

    if (error) throw error

    const rows = Array.isArray(data) ? data : []
    const summary = []
    for (const row of rows) {
      const problems = Array.from(validatePreset(row))
      if (problems.length > 0) {
        summary.push({ id: row.id, flow_key: row.flow_key, name: row.name, issues: problems })
      }
    }

    if (summary.length === 0) {
      console.log('✅ Preset Lint: No issues found across', rows.length, 'presets')
    } else {
      console.group('⚠️ Preset Lint Issues')
      summary.forEach(s => {
        console.group(`${s.flow_key} | ${s.name} (${s.id})`)
        s.issues.forEach(issue => console.log(issue))
        console.groupEnd()
      })
      console.groupEnd()
    }
    return summary
  } catch (e) {
    console.error('Preset lint failed:', e)
    return []
  }
}

export default runPresetLint



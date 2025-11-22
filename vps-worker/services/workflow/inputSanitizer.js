const MAX_TEXT = 4000
const BLOCK_KEYS = ['api_key', 'token', 'secret', 'password', 'authorization']
const ALLOWED_DEPTH = 5

function sanitizeUserInputForNextNode(value, depth = 0) {
  if (value === null || value === undefined) return value
  if (depth > ALLOWED_DEPTH) return undefined

  if (typeof value === 'string') {
    if (value.length > MAX_TEXT) {
      console.warn('⚠️ Sanitizing text input exceeding max length')
      return value.slice(0, MAX_TEXT) + '...'
    }
    if (/`{3}json/.test(value)) {
      return value.replace(/`{3}json[\s\S]*?`{3}/gi, '').trim()
    }
    return value.trim()
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (Array.isArray(value)) {
    const arr = value
      .map(v => sanitizeUserInputForNextNode(v, depth + 1))
      .filter(v => v !== undefined)
    return arr.length > 0 ? arr : undefined
  }

  if (typeof value === 'object') {
    const out = {}
    Object.entries(value).forEach(([k, v]) => {
      if (!k) return
      const nk = k.trim().toLowerCase()
      if (BLOCK_KEYS.some(b => nk.includes(b))) return
      const sv = sanitizeUserInputForNextNode(v, depth + 1)
      if (sv !== undefined) out[k] = sv
    })
    return Object.keys(out).length > 0 ? out : undefined
  }

  return undefined
}

module.exports = {
  sanitizeUserInputForNextNode
}


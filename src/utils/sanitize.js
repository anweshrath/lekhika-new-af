// Universal sanitization helpers for export/rendering
// Removes permission banners, echoed instruction blocks, and stray brace artifacts

export function sanitizeForExport(text) {
  if (typeof text !== 'string') return text
  let out = text

  // Remove heavy divider/banner blocks (quadrails and NODE PERMISSIONS banners)
  out = out.replace(/(^|\n)[═=]{6,}[\s\S]*?(Only perform tasks[\s\S]*?)?[═=]{6,}\s*/g, '\n')

  // Remove AUTHORIZED/FORBIDDEN and CRITICAL lines
  out = out.replace(/^\s*(?:✅|🚫)\s*(AUTHORIZED|FORBIDDEN):.*$/gmi, '')
  out = out.replace(/^\s*⚠️\s*CRITICAL:.*$/gmi, '')
  out = out.replace(/^\s*NODE PERMISSIONS.*$/gmi, '')

  // Drop leading "Instructions" headers if echoed
  out = out.replace(/^\s*(instructions|node instructions)\s*[:\-]*\s*/i, '')

  // Unwrap fenced code at the very top
  out = out.replace(/^```(?:\w+)?\s*([\s\S]*?)```/m, '$1')

  // Remove isolated single-letter braces artifacts like Fa{i}t{h}e
  out = out.replace(/\{[A-Za-z]\}/g, '')

  // Collapse excessive blank lines
  out = out.replace(/\n{3,}/g, '\n\n').trim()

  return out
}

export function sanitizeMarkdownForExport(md) {
  // Currently same as text sanitizer; kept separate for future markdown-specific rules
  return sanitizeForExport(md)
}



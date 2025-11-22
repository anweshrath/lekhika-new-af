// Standalone sanitization utility
function sanitizePermissions(text) {
  if (typeof text !== 'string') return text
  let out = text
  
  // SURGICAL FIX: Remove XML system instruction tags and their content
  out = out.replace(/<system_instructions>[\s\S]*?<\/system_instructions>/gi, '')
  
  // Remove permission banners
  out = out.replace(/(^|\n)[═=]{6,}[\s\S]*?(Only perform tasks[\s\S]*?)?[═=]{6,}\s*/g, '\n')
  out = out.replace(/^\s*(?:✅|🚫)\s*(AUTHORIZED|FORBIDDEN):.*$/gmi, '')
  out = out.replace(/^\s*⚠️\s*CRITICAL:.*$/gmi, '')
  out = out.replace(/^\s*NODE PERMISSIONS.*$/gmi, '')
  out = out.replace(/^\s*(instructions|node instructions)\s*[:\-]*\s*/i, '')
  
  // SURGICAL FIX: Remove metadata boxes with backticks (```text blocks)
  out = out.replace(/```text\s*[\s\S]*?```/gi, '')
  out = out.replace(/```json\s*[\s\S]*?```/gi, '')
  out = out.replace(/```\s*[\s\S]*?```/gi, '')
  
  // CRITICAL: Remove AI instruction acknowledgments including "I will generate..."
  out = out.replace(/^(Okay|Understood|Sure|Certainly|Absolutely|Of course|Yes|Alright|Right|Got it),?\s+(I (will|can|understand|shall|would|am|have|should)|Let me|Here('s| is)|This (is|will be)).*?(\n\n|\n(?=[A-Z#*]))/gmi, '')
  out = out.replace(/^I (will|can|understand|shall|would|am|have) (craft|create|write|generate|build|develop|compose|produce).*?(\n\n|\n(?=[A-Z#*]))/gmi, '')
  
  // SURGICAL FIX: Remove any remaining metadata headers (Word Count:, Genre:, etc.)
  out = out.replace(/^(Book Title|Author|Genre|Word Count|Chapter Count|Target Audience|Tone|Writing Style|Body Font|Custom Instructions|CRITICAL CONTINUITY):\s*.*$/gmi, '')
  
  // Remove template markers
  out = out.replace(/\{[A-Za-z]\}/g, '')
  
  // Clean up excessive newlines
  out = out.replace(/\n{3,}/g, '\n\n').trim()
  
  return out
}

module.exports = { sanitizePermissions }

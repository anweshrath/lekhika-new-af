/**
 * INPUT PROCESSOR MODULE
 * 
 * Purpose: Handle user input structuring and file uploads
 * 
 * Location: workflow/utils/inputProcessor.js
 * 
 * Responsibilities:
 * - Structure user input data according to field definitions
 * - Upload files to Supabase storage
 * 
 * Dependencies:
 * - getSupabase from supabase.js
 * 
 * Extracted from: workflowExecutionService.js (Phase 8 - Final Cleanup)
 * Extraction date: 2025-11-20
 * 
 * Methods extracted:
 * - structureInputData(userInput, inputFields, uploadFileToSupabase) - Structure input data
 * - uploadFileToSupabase(file, fieldName, getSupabase) - Upload file to Supabase
 * 
 * Usage:
 *   const { structureInputData, uploadFileToSupabase } = require('./workflow/utils/inputProcessor')
 */

/**
 * Structure user input data according to field definitions
 * Extracted from: workflowExecutionService.js - structureInputData()
 */
async function structureInputData(userInput, inputFields, uploadFileToSupabaseFn) {
  const structured = {}
  
  console.log('🔍 STRUCTURE INPUT DATA DEBUG:')
  console.log('  - userInput:', userInput)
  console.log('  - inputFields:', inputFields)
  
  for (const field of inputFields || []) {
    console.log(`  - Processing field: ${field.name} (variable: ${field.variable || field.name})`)
    console.log(`    - userInput[${field.name}]:`, userInput[field.name])
    
    if (userInput[field.name] !== undefined) {
      // Handle file uploads specially
      if (field.type === 'file' && userInput[field.name]) {
        try {
          const uploadedUrl = await uploadFileToSupabaseFn(userInput[field.name], field.name)
          structured[field.variable || field.name] = uploadedUrl
          console.log(`    - File uploaded: ${uploadedUrl}`)
        } catch (error) {
          console.error(`Failed to upload file for ${field.name}:`, error)
          structured[field.variable || field.name] = null
        }
      } else {
        structured[field.variable || field.name] = userInput[field.name]
        console.log(`    - Structured value: ${structured[field.variable || field.name]}`)
      }
    } else {
      console.log(`    - Field ${field.name} not found in userInput`)
    }
  }

  console.log('  - Final structured data:', structured)
  return structured
}

/**
 * Upload file to Supabase storage
 * Extracted from: workflowExecutionService.js - uploadFileToSupabase()
 */
async function uploadFileToSupabase(file, fieldName, getSupabase) {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = fieldName.replace(/[^a-zA-Z0-9]/g, '_')
    const fileExtension = file.name.split('.').pop()
    const fileName = `${sanitizedName}_${timestamp}.${fileExtension}`
    
    // Upload to Supabase storage
    const { data, error } = await getSupabase().storage
      .from('workflow-assets')
      .upload(`covers/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = getSupabase().storage
      .from('workflow-assets')
      .getPublicUrl(`covers/${fileName}`)

    return urlData.publicUrl
  } catch (error) {
    console.error('File upload error:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }
}

module.exports = {
  structureInputData,
  uploadFileToSupabase
}


/**
 * WORKFLOW UTILITIES MODULE
 * 
 * Purpose: Centralize workflow utility functions for validation, content assessment, and node management
 * 
 * Location: workflow/utils/workflowUtils.js
 * 
 * Responsibilities:
 * - Validate input fields
 * - Identify missing optional fields
 * - Create next node instructions
 * - Assess content quality
 * - Determine if nodes can be skipped
 * 
 * Dependencies: None (pure functions)
 * 
 * Extracted from: workflowExecutionService.js (Phase 7)
 * Extraction date: 2025-11-20
 * 
 * Methods extracted:
 * - validateInputFields(userInput, inputFields) - Validate required input fields
 * - identifyMissingOptionals(userInput, inputFields) - Find missing optional fields
 * - createNextNodeInstructions(missingOptionals, baseInstructions) - Generate instructions
 * - assessContentQuality(content) - Assess content quality score
 * - canSkipNode(node, pipelineData, workflowId) - Check if node can be skipped
 * 
 * Usage:
 *   const { validateInputFields, identifyMissingOptionals, createNextNodeInstructions, assessContentQuality, canSkipNode } = require('./workflow/utils/workflowUtils')
 */

/**
 * Validate input fields
 * Extracted from: workflowExecutionService.js - validateInputFields()
 */
function validateInputFields(userInput, inputFields) {
  const errors = []
  
  console.log('🔍 Input validation debug:')
  console.log('  - User input keys:', Object.keys(userInput))
  console.log('  - User input values:', userInput)
  console.log('  - Input fields:', inputFields?.map(f => ({ name: f.name, variable: f.variable, required: f.required })))
  
  inputFields?.forEach(field => {
    // Check both field.name and field.variable for compatibility with different flow types
    const fieldValue = userInput[field.name] || userInput[field.variable]
    console.log(`  - Checking field "${field.name}" (variable: "${field.variable}"):`, fieldValue, '(required:', field.required, ')')
    
    if (field.required && (!fieldValue || fieldValue === '')) {
      errors.push(`${field.name} is required`)
    }
  })

  console.log('  - Validation errors:', errors)
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Identify missing optional fields
 * Extracted from: workflowExecutionService.js - identifyMissingOptionals()
 */
function identifyMissingOptionals(userInput, inputFields) {
  const missing = []
  
  inputFields?.forEach(field => {
    if (!field.required) {
      const fieldValue = userInput[field.name] || userInput[field.variable]
      if (!fieldValue || fieldValue === '') {
        missing.push(field)
      }
    }
  })
  
  return missing
}

/**
 * Create next node instructions based on missing optionals
 * Extracted from: workflowExecutionService.js - createNextNodeInstructions()
 */
function createNextNodeInstructions(missingOptionals, baseInstructions) {
  if (missingOptionals.length === 0) {
    return baseInstructions
  }
  
  const missingFields = missingOptionals.map(f => f.name || f.label).join(', ')
  return `${baseInstructions}\n\nNote: The following optional fields were not provided: ${missingFields}. The workflow will proceed with default values.`
}

/**
 * Assess content quality to determine if refinement is needed
 * Extracted from: workflowExecutionService.js - assessContentQuality()
 */
function assessContentQuality(content) {
  if (!content || typeof content !== 'string') {
    return {
      isHighQuality: false,
      score: 0,
      wordCount: 0,
      assessment: 'Invalid or empty content'
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length

  let score = 0
  let assessment = []

  // Word count assessment (0-30 points)
  if (wordCount >= 1000) {
    score += 30
    assessment.push('Excellent word count')
  } else if (wordCount >= 500) {
    score += 20
    assessment.push('Good word count')
  } else if (wordCount >= 300) {
    score += 10
    assessment.push('Adequate word count')
  } else {
    assessment.push('Low word count')
  }

  // Structure assessment (0-25 points)
  if (sentences >= 20) {
    score += 25
    assessment.push('Well-structured with good sentence variety')
  } else if (sentences >= 10) {
    score += 15
    assessment.push('Decent sentence structure')
  } else if (sentences >= 5) {
    score += 10
    assessment.push('Basic sentence structure')
  } else {
    assessment.push('Poor sentence structure')
  }

  // Paragraph structure (0-20 points)
  if (paragraphs >= 5) {
    score += 20
    assessment.push('Good paragraph structure')
  } else if (paragraphs >= 3) {
    score += 15
    assessment.push('Adequate paragraph structure')
  } else if (paragraphs >= 1) {
    score += 10
    assessment.push('Basic paragraph structure')
  } else {
    assessment.push('Poor paragraph structure')
  }

  // Content richness (0-15 points)
  const hasDialogue = /"[^"]*"/.test(content) || /'[^']*'/.test(content)
  const hasDescriptions = content.includes('was') || content.includes('were') || content.includes('had')
  const hasAction = /(walked|ran|moved|went|came|looked|saw|heard|felt)/.test(content)

  if (hasDialogue && hasDescriptions && hasAction) {
    score += 15
    assessment.push('Rich content with dialogue, descriptions, and action')
  } else if (hasDescriptions && hasAction) {
    score += 10
    assessment.push('Good content with descriptions and action')
  } else if (hasDescriptions || hasAction) {
    score += 5
    assessment.push('Basic content elements present')
  } else {
    assessment.push('Limited content richness')
  }

  // Grammar and readability (0-10 points)
  const hasProperCapitalization = /[A-Z]/.test(content)
  const hasProperPunctuation = /[.!?]/.test(content)
  const hasVariedWords = new Set(content.toLowerCase().split(/\s+/)).size > 20

  if (hasProperCapitalization && hasProperPunctuation && hasVariedWords) {
    score += 10
    assessment.push('Good grammar and vocabulary')
  } else if (hasProperCapitalization && hasProperPunctuation) {
    score += 5
    assessment.push('Basic grammar correct')
  } else {
    assessment.push('Grammar issues detected')
  }

  const isHighQuality = score >= 70

  return {
    isHighQuality,
    score,
    wordCount,
    sentences,
    paragraphs,
    assessment: assessment.join('; ')
  }
}

/**
 * Check if a node can be skipped based on content quality and workflow state
 * Extracted from: workflowExecutionService.js - canSkipNode()
 */
function canSkipNode(node, pipelineData, workflowId = null, assessContentQualityFn) {
  // Skip Editor nodes if content is already high quality
  if (node.type === 'editor' && pipelineData.lastNodeOutput?.content) {
    const qualityCheck = assessContentQualityFn(pipelineData.lastNodeOutput.content)
    if (qualityCheck.isHighQuality) {
      console.log(`⏭️ Skipping ${node.type} node - content already high quality (${qualityCheck.score}/100)`)
      return {
        skip: true,
        reason: 'Content already meets quality standards',
        qualityScore: qualityCheck.score
      }
    }
  }

  // Skip duplicate content writer nodes if content already exists
  if (node.type === 'content_writer' && pipelineData.lastNodeOutput?.chapters?.length > 0) {
    const existingChapters = pipelineData.lastNodeOutput.chapters
    const targetChapters = pipelineData.chapter_count || pipelineData.totalChapters || 8
    
    if (existingChapters.length >= targetChapters) {
      console.log(`⏭️ Skipping ${node.type} node - sufficient chapters already generated (${existingChapters.length}/${targetChapters})`)
      return {
        skip: true,
        reason: 'Sufficient chapters already generated',
        existingChapters: existingChapters.length
      }
    }
  }

  // Skip research nodes if research data already exists
  if (node.type === 'researcher' && pipelineData.lastNodeOutput?.researchData) {
    console.log(`⏭️ Skipping ${node.type} node - research data already available`)
    return {
      skip: true,
      reason: 'Research data already available'
    }
  }

  return { skip: false }
}

module.exports = {
  validateInputFields,
  identifyMissingOptionals,
  createNextNodeInstructions,
  assessContentQuality,
  canSkipNode
}


/**
 * CONDITION HELPERS MODULE
 * 
 * Purpose: Centralize condition evaluation and action execution logic
 * 
 * Location: workflow/utils/conditionHelpers.js
 * 
 * Responsibilities:
 * - Evaluate workflow conditions
 * - Execute condition-based actions
 * 
 * Dependencies:
 * - processPromptVariablesHelper from promptService
 * - sanitizeUserInputForNextNode from inputSanitizer
 * 
 * Extracted from: workflowExecutionService.js (Phase 8)
 * Extraction date: 2025-11-20
 * 
 * Methods extracted:
 * - evaluateCondition(condition, data, pipelineData) - Evaluate condition logic
 * - executeConditionAction(action, pipelineData, processPromptVariablesHelper, sanitizeUserInputForNextNode) - Execute action based on condition
 * 
 * Usage:
 *   const { evaluateCondition, executeConditionAction } = require('./workflow/utils/conditionHelpers')
 */

/**
 * Evaluate condition logic
 * Extracted from: workflowExecutionService.js - evaluateCondition()
 */
function evaluateCondition(condition = {}, data = {}, pipelineData = {}) {
  const { field, operator = 'equals', value } = condition

  // Extract field value from the best available source
  let fieldValue = pipelineData.userInput?.[field]

  if (data?.content?.user_input?.[field] !== undefined) {
    fieldValue = data.content.user_input[field]
  } else if (data?.structuredData?.[field] !== undefined) {
    fieldValue = data.structuredData[field]
  }

  let passed = false

  switch ((operator || '').toLowerCase()) {
    case 'equals':
      passed = fieldValue === value || String(fieldValue).toLowerCase() === String(value).toLowerCase()
      break
    case 'not_equals':
      passed = fieldValue !== value
      break
    case 'contains':
      passed = String(fieldValue || '').toLowerCase().includes(String(value || '').toLowerCase())
      break
    case 'greater_than':
      passed = Number(fieldValue) > Number(value)
      break
    case 'less_than':
      passed = Number(fieldValue) < Number(value)
      break
    case 'exists':
      passed = fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
      break
    default:
      passed = false
  }

  return {
    condition,
    fieldValue,
    passed,
    timestamp: new Date()
  }
}

/**
 * Execute condition-based action
 * Extracted from: workflowExecutionService.js - executeConditionAction()
 */
function executeConditionAction(action = {}, pipelineData = {}, processPromptVariablesHelper, sanitizeUserInputForNextNode) {
  switch (action.type) {
    case 'generate_content':
      if (action.prompt) {
        const processedPrompt = processPromptVariablesHelper({
          prompts: { userPrompt: action.prompt },
          pipelineData,
          nodePermissions: null,
          sanitizeUserInputForNextNode,
          logger: console
        })
        pipelineData.conditionGeneration = processedPrompt.userPrompt
      }
      break

    case 'generate_image':
      pipelineData.conditionGeneration = action.prompt || action.instructions || 'Generate professional imagery aligned with the project brief.'
      pipelineData.conditionGenerationType = 'image'
      break

    case 'skip_to':
    case 'skip_to_output':
      pipelineData.skipToNode = action.target || 'output-1'
      break

    case 'continue':
    default:
      // No-op by default; workflow proceeds normally
      break
  }
}

module.exports = {
  evaluateCondition,
  executeConditionAction
}


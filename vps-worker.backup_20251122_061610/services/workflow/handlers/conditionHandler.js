function assertHelper(helper, name) {
  if (typeof helper !== 'function') {
    throw new Error(`conditionHandler missing required helper: ${name}`)
  }
  return helper
}

async function executeConditionNode({
  nodeData,
  pipelineData,
  helpers = {}
}) {
  const {
    evaluateCondition,
    executeConditionAction
  } = helpers

  assertHelper(evaluateCondition, 'evaluateCondition')
  assertHelper(executeConditionAction, 'executeConditionAction')

  const { conditions = [] } = nodeData
  const previousOutput = pipelineData.lastNodeOutput || pipelineData.userInput

  const evaluationResults = []

  for (const condition of conditions) {
    const result = evaluateCondition(condition, previousOutput, pipelineData)
    evaluationResults.push(result)

    if (result.passed && condition.trueAction) {
      executeConditionAction(condition.trueAction, pipelineData)
    } else if (!result.passed && condition.falseAction) {
      executeConditionAction(condition.falseAction, pipelineData)
    }
  }

  return {
    type: 'condition_evaluation',
    evaluations: evaluationResults,
    inputData: previousOutput,
    metadata: {
      nodeId: nodeData.id || 'condition-node',
      timestamp: new Date(),
      conditionCount: conditions.length
    }
  }
}

module.exports = {
  executeConditionNode
}


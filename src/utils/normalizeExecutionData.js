const isPlainObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const toArray = (value) => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

const mapNodeResults = (rawResults) => {
  if (!rawResults) return {}

  if (Array.isArray(rawResults)) {
    return rawResults.reduce((acc, entry, index) => {
      if (!entry) return acc

      if (Array.isArray(entry)) {
        const [key, value] = entry
        if (!value) return acc
        const safeKey = key || value?.nodeId || value?.id || `node_${index}`
        acc[safeKey] = value
        return acc
      }

      const key = entry.nodeId || entry.id || entry.metadata?.nodeId || `node_${index}`
      acc[key] = entry
      return acc
    }, {})
  }

  if (isPlainObject(rawResults)) {
    return { ...rawResults }
  }

  return {}
}

const mergeArraysUnique = (primary, secondary, getKey) => {
  const map = new Map()
  toArray(primary).forEach((item) => {
    if (!item) return
    const key = getKey(item)
    if (!map.has(key)) {
      map.set(key, item)
    }
  })
  toArray(secondary).forEach((item) => {
    if (!item) return
    const key = getKey(item)
    if (!map.has(key)) {
      map.set(key, item)
    }
  })
  return Array.from(map.values())
}

const mappedStatus = (merged) => {
  if (merged.error) return 'failed'
  if (merged.progress >= 100 || merged.completedAt) return 'completed'
  if (merged.status) return merged.status
  return 'running'
}

export const normalizeExecutionData = (input = {}) => {
  if (!input) return {}

  const {
    executionData: nestedCamel = {},
    execution_data: nestedSnake = {},
    ...rest
  } = input

  const nested = {
    ...(isPlainObject(nestedSnake) ? nestedSnake : {}),
    ...(isPlainObject(nestedCamel) ? nestedCamel : {})
  }

  const merged = {
    ...nested,
    ...rest
  }

  const mergedNodeResults = {
    ...mapNodeResults(nested.nodeResults),
    ...mapNodeResults(rest.nodeResults)
  }

  merged.nodeResults = mergedNodeResults

  merged.aiOutputs = mergeArraysUnique(
    nested.aiOutputs,
    rest.aiOutputs,
    (item) => item?.id || item?.nodeId || `${item?.timestamp || ''}-${item?.nodeName || ''}`
  )

  merged.allFormats = {
    ...(isPlainObject(nested.allFormats) ? nested.allFormats : {}),
    ...(isPlainObject(rest.allFormats) ? rest.allFormats : {})
  }

  merged.metadata = {
    ...(isPlainObject(nested.metadata) ? nested.metadata : {}),
    ...(isPlainObject(rest.metadata) ? rest.metadata : {})
  }

  merged.chapterInfo = {
    ...(isPlainObject(nested.chapterInfo) ? nested.chapterInfo : {}),
    ...(isPlainObject(rest.chapterInfo) ? rest.chapterInfo : {})
  }

  merged.userInput = {
    ...(isPlainObject(nested.userInput) ? nested.userInput : {}),
    ...(isPlainObject(rest.userInput) ? rest.userInput : {})
  }

  merged.storyContext = {
    ...(isPlainObject(nested.storyContext) ? nested.storyContext : {}),
    ...(isPlainObject(rest.storyContext) ? rest.storyContext : {})
  }

  merged.deliverables = toArray(rest.deliverables).length > 0
    ? toArray(rest.deliverables)
    : toArray(nested.deliverables)

  merged.status = rest.status || nested.status || rest.executionStatus || mappedStatus(merged)
  merged.progress = rest.progress ?? nested.progress ?? 0
  merged.currentNode = rest.currentNode || nested.currentNode || rest.nodeName || nested.nodeName || null
  merged.currentOutput = rest.currentOutput || nested.currentOutput || null
  merged.engineId = rest.engineId || nested.engineId || rest.masterEngineId || nested.masterEngineId || null
  merged.userEngineId = rest.userEngineId || nested.userEngineId || null
  merged.executionId = rest.executionId || rest.id || nested.executionId || nested.id || null
  merged.id = merged.executionId || rest.id || nested.id || null
  merged.lastValidationError = rest.lastValidationError || nested.lastValidationError || rest.validationError || nested.validationError || null
  merged.failedNodeId = rest.failedNodeId || nested.failedNodeId || rest.failedNode || nested.failedNode || null
  merged.failedNode = merged.failedNodeId
  merged.resumeMetadata = {
    ...(isPlainObject(nested.resumeMetadata) ? nested.resumeMetadata : {}),
    ...(isPlainObject(rest.resumeMetadata) ? rest.resumeMetadata : {})
  }

  const checkpointData = rest.checkpointData
    || nested.checkpointData
    || nested.resumeMetadata?.checkpointData
    || nested.checkpoint
    || null

  if (checkpointData) {
    merged.checkpointData = checkpointData
  }

  merged.nodes = Array.isArray(rest.nodes) && rest.nodes.length > 0
    ? rest.nodes
    : Array.isArray(nested.nodes) && nested.nodes.length > 0
      ? nested.nodes
      : []

  merged.edges = Array.isArray(rest.edges) && rest.edges.length > 0
    ? rest.edges
    : Array.isArray(nested.edges) && nested.edges.length > 0
      ? nested.edges
      : []

  merged.processingSteps = mergeArraysUnique(
    nested.processingSteps,
    rest.processingSteps,
    (item, index) => item?.id || `${item?.name || 'step'}-${index}`
  )

  merged.executionData = {
    ...nested,
    nodeResults: mergedNodeResults,
    aiOutputs: merged.aiOutputs,
    allFormats: merged.allFormats,
    chapterInfo: merged.chapterInfo,
    userInput: merged.userInput,
    checkpointData: checkpointData || nested.checkpointData || null,
    storyContext: merged.storyContext,
    status: merged.status,
    progress: merged.progress,
    currentNode: merged.currentNode,
    currentOutput: merged.currentOutput
  }

  merged.raw = input

  return merged
}

export default normalizeExecutionData


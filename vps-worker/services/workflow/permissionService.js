const { NODE_ROLE_CONFIG } = require('../../data/nodePalettes')

const DEFAULT_PERMISSIONS = {
  canWriteContent: false,
  canEditStructure: false,
  canProofRead: false
}

function inferRoleFromLabel(label = '') {
  const nodeLabel = label.toLowerCase()
  if (nodeLabel.includes('world-building') || nodeLabel.includes('world building') || nodeLabel.includes('character development')) {
    return 'world_builder'
  }
  if (nodeLabel.includes('plot architecture') || nodeLabel.includes('plot') || nodeLabel.includes('story structure')) {
    return 'plot_architect'
  }
  if (nodeLabel.includes('story architect') || nodeLabel.includes('story outline')) {
    return 'story_outliner'
  }
  if (nodeLabel.includes('editor') || nodeLabel.includes('proofread')) {
    return 'editor'
  }
  if (
    nodeLabel.includes('literary writing') ||
    nodeLabel.includes('narrative craft') ||
    nodeLabel.includes('content writer') ||
    nodeLabel.includes('writer') ||
    nodeLabel.includes('author') ||
    nodeLabel.includes('creator') ||
    nodeLabel.includes('chapter') ||
    nodeLabel.includes('content') ||
    nodeLabel.includes('narrative') ||
    (nodeLabel.includes('story') && !nodeLabel.includes('architect') && !nodeLabel.includes('outline')) ||
    nodeLabel.includes('generate') ||
    nodeLabel.includes('generation') ||
    nodeLabel.includes('create')
  ) {
    return 'content_writer'
  }
  return null
}

function computePermissions(nodeData, logger = console) {
  let nodeRole = nodeData.role || nodeData.id

  if (!nodeData.role && nodeData.label) {
    const inferred = inferRoleFromLabel(nodeData.label)
    if (inferred) {
      nodeRole = inferred
      logger.log(`🔍 ENHANCED ROLE MAPPING: "${nodeData.label}" → ${nodeRole}`)
    }
  }

  const roleConfig = NODE_ROLE_CONFIG[nodeRole]
  if (roleConfig) {
    logger.log(`🔐 PERMISSION CHECK for node "${nodeData.label}" (${nodeRole}):`)
    logger.log(`   - canWriteContent: ${roleConfig.canWriteContent}`)
    logger.log(`   - canEditStructure: ${roleConfig.canEditStructure}`)
    logger.log(`   - canProofRead: ${roleConfig.canProofRead}`)
    return {
      role: nodeRole,
      permissions: {
        canWriteContent: roleConfig.canWriteContent,
        canEditStructure: roleConfig.canEditStructure,
        canProofRead: roleConfig.canProofRead
      }
    }
  }

  logger.warn(`⚠️ No role configuration found for node: ${nodeRole}`)
  const isLikelyContentNode =
    nodeData.aiEnabled !== false &&
    (nodeData.systemPrompt || nodeData.userPrompt || nodeData.type === 'process' || nodeData.type === 'ai_generation')

  if (isLikelyContentNode) {
    logger.log(`🤖 AI-enabled node without specific role - assigning content writer permissions`)
    return {
      role: nodeRole,
      permissions: {
        canWriteContent: true,
        canEditStructure: false,
        canProofRead: false
      }
    }
  }

  logger.warn(`   ⚠️ Node "${nodeData.label}" (${nodeRole}) defaulting to NO PERMISSIONS`)
  return { role: nodeRole, permissions: DEFAULT_PERMISSIONS }
}

function applyPermissions(nodeData, logger = console) {
  const { role, permissions } = computePermissions(nodeData, logger)
  nodeData.permissions = permissions
  return { role, permissions }
}

module.exports = {
  applyPermissions,
  computePermissions,
  DEFAULT_PERMISSIONS
}


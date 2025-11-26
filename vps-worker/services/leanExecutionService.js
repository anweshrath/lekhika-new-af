/**
 * LEAN EXECUTION SERVICE
 * 
 * Memory-optimized version of executionService.js
 * Target: 70-85% memory reduction while maintaining full UX
 * 
 * Key Optimizations:
 * 1. Truncate content in progress updates (full content only on completion)
 * 2. Store chapter references, not full chapter text in storyContext
 * 3. Remove aiResponseHistory completely
 * 4. Write minimal progress updates to DB (not full execution_data)
 * 5. Aggressive cleanup of completed executions
 * 
 * Created: 2025-11-24
 * Port: 3002 (separate from standard worker on 3001)
 */

const { getSupabase, adjustUserTokens, logTokenUsage } = require('./supabase');
const workflowExecutionService = require('./workflowExecutionService');
const aiService = require('./aiService');
const analyticsAggregator = require('./analyticsAggregator');
const logger = require('../utils/logger');

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const mergeObjects = (base = {}, patch = {}) => {
  const merged = { ...base };
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (key === undefined) return;
    if (isPlainObject(value) && isPlainObject(merged[key])) {
      merged[key] = mergeObjects(merged[key], value);
    } else {
      merged[key] = value;
    }
  });
  return merged;
};

const mergeNodeResults = (existing = {}, incoming = {}) => {
  const merged = { ...existing };
  Object.entries(incoming || {}).forEach(([nodeId, result]) => {
    if (!nodeId) return;
    if (isPlainObject(result) && isPlainObject(merged[nodeId])) {
      merged[nodeId] = mergeObjects(merged[nodeId], result);
    } else {
      merged[nodeId] = result;
    }
  });
  return merged;
};

// LEAN OPTIMIZATION: Truncate content to reduce memory footprint
const truncateContent = (content, maxLength = 500) => {
  if (!content) return content;
  if (typeof content === 'string' && content.length > maxLength) {
    return content.substring(0, maxLength) + '... [truncated for memory optimization]';
  }
  return content;
};

// LEAN OPTIMIZATION: Extract minimal chapter reference (no full text)
const extractChapterReference = (chapter) => {
  if (!chapter) return null;
  return {
    number: chapter.number || chapter.chapterNumber,
    title: chapter.title || 'Untitled',
    wordCount: chapter.wordCount || (typeof chapter.content === 'string' ? chapter.content.split(/\s+/).length : 0),
    status: chapter.status || 'completed',
    nodeId: chapter.nodeId || null
    // NO content field - saves 15KB per chapter
  };
};

// LEAN OPTIMIZATION: Optimize storyContext to store references only
const optimizeStoryContext = (storyContext) => {
  if (!storyContext) return null;
  
  const optimized = {
    chapters: Array.isArray(storyContext.chapters) 
      ? storyContext.chapters.map(extractChapterReference).filter(Boolean)
      : [],
    structural: {
      theme: storyContext.structural?.theme || null,
      setting: storyContext.structural?.setting || null,
      // Extract only essential metadata, not full 50KB JSON
    },
    assets: {
      images: Array.isArray(storyContext.assets?.images)
        ? storyContext.assets.images.map(img => ({
            nodeId: img.nodeId,
            url: img.url || null
            // NO base64 data - saves MB
          }))
        : []
    }
  };
  
  return optimized;
};

const mergeExecutionDataPayload = (previous = {}, patch = {}) => {
  const merged = mergeObjects(previous, patch);

  if (previous.nodeResults || patch.nodeResults) {
    merged.nodeResults = mergeNodeResults(previous.nodeResults, patch.nodeResults);
  }

  if (previous.allFormats || patch.allFormats) {
    merged.allFormats = mergeObjects(previous.allFormats || {}, patch.allFormats || {});
  }

  if (previous.checkpointData || patch.checkpointData) {
    merged.checkpointData = mergeObjects(previous.checkpointData || {}, patch.checkpointData || {});
  }

  if (previous.regenerationAttempts || patch.regenerationAttempts) {
    merged.regenerationAttempts = mergeObjects(previous.regenerationAttempts || {}, patch.regenerationAttempts || {});
  }

  if (previous.lastValidationError || patch.lastValidationError) {
    merged.lastValidationError = mergeObjects(previous.lastValidationError || {}, patch.lastValidationError || {});
  }

  // LEAN OPTIMIZATION: Optimize storyContext before merging
  if (previous.storyContext || patch.storyContext) {
    const prevOptimized = optimizeStoryContext(previous.storyContext);
    const patchOptimized = optimizeStoryContext(patch.storyContext);
    merged.storyContext = mergeObjects(prevOptimized || {}, patchOptimized || {});
  }

  // LEAN OPTIMIZATION: Remove aiResponseHistory completely (not used by frontend)
  delete merged.aiResponseHistory;

  return merged;
};

const metricKeys = ['tokens', 'tokenCount', 'totalTokens', 'words', 'wordCount', 'totalWords', 'cost', 'costEstimate', 'totalCost'];

const extractNumericMetric = (obj = {}, keys = []) => {
  for (const key of keys) {
    if (typeof obj[key] === 'number' && !Number.isNaN(obj[key])) {
      return obj[key];
    }
  }
  return 0;
};

const gatherNodeMetrics = (nodeResult = {}) => {
  let tokens = 0;
  let words = 0;
  let cost = 0;
  let chapters = 0;

  const candidateMetas = [
    nodeResult.aiMetadata,
    nodeResult.metadata,
    nodeResult.metadata?.metadata,
    nodeResult.outputMetadata,
    nodeResult.compiledData,
  ].filter(Boolean);

  candidateMetas.forEach(meta => {
    tokens = Math.max(tokens, extractNumericMetric(meta, ['totalTokens', 'tokens', 'tokenCount']));
    words = Math.max(words, extractNumericMetric(meta, ['totalWords', 'words', 'wordCount']));
    cost = Math.max(cost, extractNumericMetric(meta, ['totalCost', 'cost', 'costEstimate']));
  });

  if (Array.isArray(nodeResult.chapters)) {
    chapters += nodeResult.chapters.length;
    let chapterTokens = 0;
    let chapterWords = 0;
    nodeResult.chapters.forEach(chapter => {
      const chapterMeta = chapter.metadata || chapter.aiMetadata || {};
      chapterTokens += extractNumericMetric(chapterMeta, ['totalTokens', 'tokens', 'tokenCount']);
      chapterWords += extractNumericMetric(chapterMeta, ['totalWords', 'words', 'wordCount']);
    });
    if (tokens === 0) {
      tokens = chapterTokens;
    } else {
      tokens = Math.max(tokens, chapterTokens);
    }
    if (words === 0) {
      words = chapterWords;
    } else {
      words = Math.max(words, chapterWords);
    }
  }

  if (Array.isArray(nodeResult.metadata?.chapters)) {
    chapters = Math.max(chapters, nodeResult.metadata.chapters.length);
  }

  if (typeof nodeResult.chapterCount === 'number') {
    chapters = Math.max(chapters, nodeResult.chapterCount);
  }

  return { tokens, words, cost, chapters };
};

const calculateExecutionMetrics = (executionData = {}) => {
  let totalTokens = 0;
  let totalWords = 0;
  let totalCost = 0;
  let totalChapters = 0;

  Object.values(executionData.nodeResults || {}).forEach(result => {
    const metrics = gatherNodeMetrics(result);
    totalTokens += metrics.tokens;
    totalWords += metrics.words;
    totalCost += metrics.cost;
    totalChapters += metrics.chapters;
  });

  return {
    tokens: totalTokens,
    words: totalWords,
    cost: totalCost,
    chapters: totalChapters,
  };
};

const clamp = (value, min, max) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};

const normalizeStepStatus = (status) => {
  const normalized = (status || '').toLowerCase();
  if (['completed', 'success', 'done', 'finished'].includes(normalized)) return 'completed';
  if (['failed', 'error', 'stopped', 'cancelled'].includes(normalized)) return 'failed';
  if (['paused', 'waiting'].includes(normalized)) return 'paused';
  if (['running', 'executing', 'processing'].includes(normalized)) return 'running';
  return 'pending';
};

const resolveNodeIndex = (nodeId, workflowNodes = [], fallbackIndex = null) => {
  if (typeof fallbackIndex === 'number') return fallbackIndex;
  if (!nodeId || !Array.isArray(workflowNodes)) return null;
  const index = workflowNodes.findIndex(node => node && node.id === nodeId);
  return index >= 0 ? index : null;
};

const syncProcessingSteps = (existingSteps = [], update = {}, workflowNodes = []) => {
  const stepsMap = new Map();

  (Array.isArray(existingSteps) ? existingSteps : []).forEach(step => {
    if (!step) return;
    const stepId = step.nodeId || step.id;
    if (!stepId) return;
    stepsMap.set(stepId, {
      id: stepId,
      nodeId: stepId,
      name: step.name || stepId,
      status: normalizeStepStatus(step.status),
      progress: clamp(step.progress ?? 0, 0, 100),
      tokens: step.tokens ?? 0,
      words: step.words ?? 0,
      provider: step.provider || null,
      nodeIndex: typeof step.nodeIndex === 'number' ? step.nodeIndex : resolveNodeIndex(stepId, workflowNodes),
      totalNodes: step.totalNodes ?? (Array.isArray(workflowNodes) ? workflowNodes.length : null),
      updatedAt: step.updatedAt || new Date().toISOString(),
      displayOrder: step.displayOrder ?? null
    });
  });

  const nodeId = update.nodeId || update.nodeID || null;
  if (nodeId) {
    const existing = stepsMap.get(nodeId) || {
      id: nodeId,
      nodeId,
      name: update.nodeName || nodeId
    };

    const status = normalizeStepStatus(update.status);
    const executionIndex = update.sequenceNumber ?? update.executionIndex ?? update.nodeIndex ?? existing.executionIndex ?? existing.sequenceNumber ?? existing.nodeIndex ?? null;
    const nodeIndex = resolveNodeIndex(nodeId, workflowNodes, executionIndex);
    const totalNodes = update.totalNodes ?? existing.totalNodes ?? (Array.isArray(workflowNodes) ? workflowNodes.length : null);
    const progressValue = status === 'completed'
      ? 100
      : clamp(update.progress ?? existing.progress ?? 0, 0, 100);

    stepsMap.set(nodeId, {
      ...existing,
      name: update.nodeName || existing.name || nodeId,
      status,
      progress: progressValue,
      tokens: update.tokens ?? existing.tokens ?? 0,
      words: update.words ?? existing.words ?? 0,
      provider: update.providerName || update.provider || existing.provider || null,
      nodeIndex,
      sequenceNumber: executionIndex,
      executionIndex: executionIndex,
      totalNodes,
      updatedAt: new Date().toISOString()
    });
  }

  let orderCounter = 1;
  return Array.from(stepsMap.values())
    .sort((a, b) => {
      const aExecIndex = typeof a.sequenceNumber === 'number' ? a.sequenceNumber : typeof a.executionIndex === 'number' ? a.executionIndex : Number.MAX_SAFE_INTEGER;
      const bExecIndex = typeof b.sequenceNumber === 'number' ? b.sequenceNumber : typeof b.executionIndex === 'number' ? b.executionIndex : Number.MAX_SAFE_INTEGER;
      if (aExecIndex !== bExecIndex && aExecIndex !== Number.MAX_SAFE_INTEGER && bExecIndex !== Number.MAX_SAFE_INTEGER) {
        return aExecIndex - bExecIndex;
      }
      const aIndex = typeof a.nodeIndex === 'number' ? a.nodeIndex : Number.MAX_SAFE_INTEGER;
      const bIndex = typeof b.nodeIndex === 'number' ? b.nodeIndex : Number.MAX_SAFE_INTEGER;
      if (aIndex !== bIndex) return aIndex - bIndex;
      return (a.name || '').localeCompare(b.name || '');
    })
    .map(step => ({
      ...step,
      displayOrder: orderCounter++
    }));
};

class LeanExecutionService {
  constructor() {
    this.activeExecutions = new Map();
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_EXECUTIONS) || 3;
    this.cleanupInterval = null;
    this.startPeriodicCleanup();
    logger.info('🎯 LEAN Execution Service initialized (memory-optimized)');
  }

  startPeriodicCleanup() {
    this.cleanupInterval = setInterval(async () => {
      this.cleanupStuckExecutions();
      await this.cleanupStuckDatabaseExecutions();
    }, 30000);
    
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  cleanupStuckExecutions() {
    const now = Date.now();
    const stuckThreshold = 15 * 60 * 1000;
    
    let cleanedCount = 0;
    for (const [executionId, execution] of this.activeExecutions) {
      if (execution.startTime && (now - execution.startTime) > stuckThreshold) {
        logger.warn(`🧹 [LEAN] Cleaning up stuck execution: ${executionId}`);
        this.activeExecutions.delete(executionId);
        cleanedCount++;
        
        workflowExecutionService.stopWorkflow(executionId);
        
        this.updateExecutionStatus(executionId, 'failed', { 
          error: 'Execution timed out and was cleaned up by lean worker' 
        }).catch(err => {
          logger.error(`Failed to update status for stuck execution ${executionId}:`, err);
        });
      }
    }
    
    if (cleanedCount > 0) {
      logger.info(`🧹 [LEAN] Cleaned up ${cleanedCount} stuck executions`);
    }
  }

  async cleanupStuckDatabaseExecutions() {
    try {
      const supabase = getSupabase();
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      const { data: stuckExecutions, error } = await supabase
        .from('engine_executions')
        .select('id, created_at')
        .eq('status', 'running')
        .lt('created_at', fifteenMinutesAgo);
      
      if (error) {
        logger.error('[LEAN] Error finding stuck database executions:', error);
        return;
      }
      
      if (stuckExecutions && stuckExecutions.length > 0) {
        logger.warn(`🧹 [LEAN] Found ${stuckExecutions.length} stuck executions in database`);
        
        const { error: updateError } = await supabase
          .from('engine_executions')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString(),
            execution_data: { error: 'Execution timed out - automatically marked as failed by lean worker' }
          })
          .eq('status', 'running')
          .lt('created_at', fifteenMinutesAgo);
        
        if (updateError) {
          logger.error('[LEAN] Error updating stuck executions:', updateError);
        } else {
          logger.info(`🧹 [LEAN] Updated ${stuckExecutions.length} stuck executions to failed status`);
        }
      }
    } catch (error) {
      logger.error('[LEAN] Error in cleanupStuckDatabaseExecutions:', error);
    }
  }

  cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    logger.info(`🧹 [LEAN] Force cleaning up ${this.activeExecutions.size} active executions`);
    for (const [executionId, execution] of this.activeExecutions) {
      workflowExecutionService.stopWorkflow(executionId);
    }
    this.activeExecutions.clear();
    
    // LEAN OPTIMIZATION: Also cleanup state manager
    try {
      const stateManager = require('./workflow/state/executionStateManager');
      stateManager.clearAllExecutions();
      logger.info('🧹 [LEAN] Cleared all state manager executions');
    } catch (err) {
      logger.warn('[LEAN] Could not clear state manager:', err.message);
    }
  }
  
  async executeWorkflow({ executionId, lekhikaApiKey, userEngineId, masterEngineId, userId, workflow, inputs, options }) {
    const startTime = Date.now();
    
    try {
      if (this.activeExecutions.size >= this.maxConcurrent) {
        logger.warn(`🚫 [LEAN] Worker at maximum capacity: ${this.activeExecutions.size}/${this.maxConcurrent}`);
        throw new Error(`Lean worker at maximum capacity (${this.activeExecutions.size}/${this.maxConcurrent}). Please wait for current executions to complete.`);
      }
      
      const engineConfig = await this.validateLekhikaApiKey(lekhikaApiKey, userId, userEngineId);
      
      const levelId = options?.levelId || options?.level_id || inputs?.level_id || inputs?.levelId || null;

      const executionContext = {
        executionId,
        userId,
        userEngineId,
        masterEngineId,
        levelId,
        tier: options?.tier || undefined,
        nodes: workflow?.nodes,
        edges: workflow?.edges,
        models: workflow?.models,
        userInput: inputs,
        options
      };

      // LEAN OPTIMIZATION: Store minimal execution entry
      this.activeExecutions.set(executionId, {
        status: 'running',
        startTime: startTime,
        userId,
        userEngineId,
        // Don't store full executionContext - just reference
      });

      logger.info(`🚀 [LEAN] Starting execution ${executionId} (${this.activeExecutions.size}/${this.maxConcurrent} active)`);
      
      await this.updateExecutionStatus(executionId, 'running');
      
      if (!userId) {
        throw new Error(`Execution user context required - userId is missing for execution ${executionId}`)
      }
      
      const userObject = {
        id: userId,
        role: 'user',
        tier: options?.tier || 'hobby'
      };
      
      logger.info(`✅ [LEAN] Constructed executionUser:`, { id: userObject.id, role: userObject.role, tier: userObject.tier });
      
      // LEAN OPTIMIZATION: Minimal progress callback - only essential data
      const progressCallback = async (update) => {
        logger.debug(`📊 [LEAN] Progress for ${executionId}:`, { nodeId: update.nodeId, progress: update.progress });
        
        // LEAN: Extract only minimal AI response (first 500 chars for display)
        let aiResponseText = null;
        
        if (update.processedContent && typeof update.processedContent === 'string') {
          aiResponseText = truncateContent(update.processedContent, 500);
        }
        else if (update.output?.content && typeof update.output.content === 'string') {
          aiResponseText = truncateContent(update.output.content, 500);
        }
        else if (update.aiResponse) {
          if (typeof update.aiResponse === 'string') {
            aiResponseText = truncateContent(update.aiResponse, 500);
          } 
          else if (update.aiResponse.content) {
            if (typeof update.aiResponse.content === 'string') {
              aiResponseText = truncateContent(update.aiResponse.content, 500);
            } else if (Array.isArray(update.aiResponse.content) && update.aiResponse.content[0]?.text) {
              aiResponseText = truncateContent(update.aiResponse.content[0].text, 500);
            }
          }
        }
        if (!aiResponseText && typeof update.output === 'string') {
          aiResponseText = truncateContent(update.output, 500);
        }
        
        const executionEntry = this.activeExecutions.get(executionId) || {};
        const previousData = executionEntry.executionData || {};
        const workflowNodes = Array.isArray(workflow?.nodes) ? workflow.nodes : [];

        const existingProcessingSteps = executionEntry.processingSteps || previousData.processingSteps || [];
        const stepUpdate = update?.nodeId && update.nodeId !== 'initializing' ? update : {};
        const normalizedProcessingSteps = syncProcessingSteps(existingProcessingSteps, stepUpdate, workflowNodes);

        // LEAN OPTIMIZATION: Store optimized storyContext
        const nextStoryContext = isPlainObject(update.storyContext)
          ? optimizeStoryContext(update.storyContext)
          : isPlainObject(executionEntry.storyContext)
            ? executionEntry.storyContext
            : isPlainObject(previousData.storyContext)
              ? previousData.storyContext
              : null;

        // LEAN: Minimal base payload (no aiResponseHistory)
        const basePayload = {
          progress: update.progress || previousData.progress || 0,
          currentNode: update.nodeName || update.nodeId || previousData.currentNode || 'Processing',
          currentNodeId: update.nodeId || previousData.currentNodeId || null,
          nodeType: update.nodeType || previousData.nodeType || 'unknown',
          status: update.status || previousData.status || 'running',
          timestamp: new Date().toISOString(),
          aiResponse: aiResponseText, // Truncated to 500 chars
          tokens: update.tokens || previousData.tokens || 0,
          cost: update.cost || previousData.cost || 0,
          words: update.words || previousData.words || 0,
          providerName: update.providerName || previousData.providerName || null,
          error: update.error || previousData.error || null,
        };

        if (nextStoryContext) {
          basePayload.storyContext = nextStoryContext;
        }

        if (normalizedProcessingSteps.length > 0) {
          basePayload.processingSteps = normalizedProcessingSteps;
        }

        // LEAN OPTIMIZATION: Truncate nodeResults to essential metadata only during execution
        if (update.nodeResults) {
          const truncatedNodeResults = {};
          Object.entries(update.nodeResults).forEach(([nodeId, result]) => {
            truncatedNodeResults[nodeId] = {
              type: result.type,
              nodeId: result.nodeId,
              nodeName: result.nodeName,
              // Truncate content to 500 chars during execution
              content: truncateContent(result.content, 500),
              metadata: {
                tokens: result.metadata?.tokens || result.aiMetadata?.tokens || 0,
                words: result.metadata?.words || result.aiMetadata?.words || 0,
                cost: result.metadata?.cost || result.aiMetadata?.cost || 0,
              }
            };
          });
          basePayload.nodeResults = truncatedNodeResults;
        }

        const mergedExecutionData = mergeExecutionDataPayload(previousData, basePayload);
        mergedExecutionData.processingSteps = normalizedProcessingSteps;
        if (nextStoryContext) {
          mergedExecutionData.storyContext = nextStoryContext;
        }

        const metrics = calculateExecutionMetrics(mergedExecutionData);
        mergedExecutionData.metrics = metrics;
        mergedExecutionData.tokens = metrics.tokens;
        mergedExecutionData.words = metrics.words;
        mergedExecutionData.cost = metrics.cost;
        mergedExecutionData.chaptersGenerated = metrics.chapters;

        // LEAN: Keep minimal data in memory
        executionEntry.executionData = {
          progress: mergedExecutionData.progress,
          status: mergedExecutionData.status,
          currentNode: mergedExecutionData.currentNode,
          processingSteps: normalizedProcessingSteps,
          tokens: metrics.tokens,
          words: metrics.words,
          cost: metrics.cost,
          chaptersGenerated: metrics.chapters
          // NO full nodeResults, NO full storyContext stored in memory
        };
        executionEntry.processingSteps = normalizedProcessingSteps;
        this.activeExecutions.set(executionId, executionEntry);

        // LEAN OPTIMIZATION: Write MINIMAL progress to DB (not full execution_data)
        const supabase = getSupabase();
        await supabase
          .from('engine_executions')
          .update({
            status: basePayload.status,
            progress: basePayload.progress,
            current_node: basePayload.currentNode,
            updated_at: new Date().toISOString()
            // NO execution_data during progress updates
          })
          .eq('id', executionId);
        
        logger.debug(`📊 [LEAN] Minimal progress update: ${basePayload.progress}% - ${basePayload.currentNode}`);
      };
      
      logger.info(`🚀 [LEAN] Executing workflow with ${workflow.nodes.length} nodes`);
      
      const result = await workflowExecutionService.executeWorkflow(
        workflow.nodes,
        workflow.edges,
        inputs,
        executionId,
        progressCallback,
        userObject
      );
      
      logger.info(`✅ [LEAN] Workflow execution completed for ${executionId}`);
      
      let totalTokensUsed = result?.totalTokensUsed || result?.tokenUsage?.debited || 0;
      let totalCost = result?.totalCostIncurred || 0;
      let totalWords = result?.totalWordsGenerated || 0;
      
      if (totalTokensUsed === 0 && result && result.nodeOutputs) {
        logger.info(`📊 [LEAN] Calculating tokens from nodeOutputs`)
        Object.values(result.nodeOutputs).forEach(output => {
          const tokens = output.aiMetadata?.tokens || output.metadata?.tokens || output.tokens || 0;
          const cost = output.aiMetadata?.cost || output.metadata?.cost || output.cost || 0;
          const words = output.aiMetadata?.words || output.metadata?.words || output.words || 0;
          
          totalTokensUsed += tokens;
          totalCost += cost;
          totalWords += words;
        });
      }
      
      logger.info(`📊 [LEAN] Execution totals: ${totalTokensUsed} tokens, $${totalCost} cost, ${totalWords} words`);
      
      const supabase = getSupabase();
      await supabase
        .from('engine_executions')
        .update({
          tokens_used: totalTokensUsed,
          cost_estimate: totalCost,
          execution_time_ms: Date.now() - startTime
        })
        .eq('id', executionId);
      
      if (totalTokensUsed > 0) {
        const engineMetadata = {
          engineId: masterEngineId || userEngineId || null,
          userEngineId,
          masterEngineId,
          totalCost,
          totalWords,
          models: executionContext?.models || null
        };

        try {
          await adjustUserTokens({
            userId,
            amount: totalTokensUsed,
            changeType: 'debit',
            reason: 'workflow_execution',
            metadata: engineMetadata,
            levelId: executionContext?.levelId || null,
            source: 'lean-worker',
            referenceType: 'engine_execution',
            referenceId: executionId,
            executionId
          });
          logger.info(`💳 [LEAN] Debited ${totalTokensUsed} tokens from user ${userId}`);
        } catch (tokenAdjustError) {
          logger.error(`❌ [LEAN] Failed to debit tokens:`, tokenAdjustError);
        }

        try {
          await logTokenUsage(
            userId,
            executionId,
            result.tokenUsage?.provider || engineMetadata.models?.[0]?.provider || 'unknown',
            result.tokenUsage?.model || result.tokenUsage?.modelId || engineMetadata.models?.[0]?.name || 'unknown',
            totalTokensUsed,
            totalCost
          );
        } catch (tokenLogError) {
          logger.error(`❌ [LEAN] Failed to log token usage:`, tokenLogError);
        }
      }
      
      // LEAN OPTIMIZATION: Build FULL completion data ONCE (not during execution)
      const executionEntry = this.activeExecutions.get(executionId) || {};

      const completionData = {
        status: 'completed',
        totalNodes: Object.keys(result.nodeOutputs || {}).length,
        totalTokens: totalTokensUsed,
        totalCost: totalCost,
        totalWords: totalWords,
        formatsGenerated: result.nodeOutputs?.['output-1']?.metadata?.formatsGenerated || 0,
        hasFormats: !!(result.nodeOutputs?.['output-1']?.metadata?.allFormats),
        completedAt: new Date().toISOString(),
        // FULL nodeResults with complete content (for downloads)
        nodeResults: result.nodeOutputs || {},
        result: result,
        output: result.lastNodeOutput || null,
        tokenUsage: result.tokenUsage || null,
        tokenLedger: result.tokenLedger || [],
        processingSteps: executionEntry.processingSteps || [],
        storyContext: optimizeStoryContext(result.storyContext) || null
      };
      
      logger.info(`🏁 [LEAN] Marking execution as completed with FULL data`);
      await this.updateExecutionStatus(executionId, 'completed', completionData);
      
      this.activeExecutions.set(executionId, {
        status: 'completed',
        endTime: Date.now()
        // Minimal - full data is in DB now
      });
      
      logger.info(`✅ [LEAN] Execution ${executionId} completed`);
      
      return result;
      
    } catch (error) {
      logger.error(`❌ [LEAN] Execution failed:`, error);
      
      let totalTokensUsed = 0;
      let totalCost = 0; 
      let totalWords = 0;
      
      try {
        if (typeof result !== 'undefined' && result && result.nodeOutputs) {
          Object.values(result.nodeOutputs).forEach(output => {
            if (output.aiMetadata) {
              totalTokensUsed += output.aiMetadata.tokens || 0;
              totalCost += output.aiMetadata.cost || 0;
              totalWords += output.aiMetadata.words || 0;
            }
          });
        }
      } catch (tokenCalcError) {
        logger.warn('[LEAN] Could not calculate tokens from result:', tokenCalcError.message);
      }

      if (totalTokensUsed === 0) {
        const executionEntry = this.activeExecutions.get(executionId);
        const trackedUsage = executionEntry?.executionData?.tokenUsage;
        if (trackedUsage?.debited) {
          totalTokensUsed = trackedUsage.debited;
        }
      }
      
      logger.info(`📊 [LEAN] Failed execution totals: ${totalTokensUsed} tokens`);
      
      if (totalTokensUsed > 0) {
        const supabase = getSupabase();
        await supabase
          .from('engine_executions')
          .update({
            tokens_used: totalTokensUsed,
            cost_estimate: totalCost,
            execution_time_ms: Date.now() - startTime
          })
          .eq('id', executionId);

        try {
          await adjustUserTokens({
            userId,
            amount: totalTokensUsed,
            changeType: 'debit',
            reason: 'workflow_execution_failed',
            metadata: { status: 'failed' },
            source: 'lean-worker',
            referenceType: 'engine_execution',
            referenceId: executionId,
            executionId
          });
        } catch (tokenAdjustError) {
          logger.error(`❌ [LEAN] Failed to debit tokens:`, tokenAdjustError);
        }
      }
      
      await this.updateExecutionStatus(executionId, 'failed', { 
        error: error.message,
        totalTokens: totalTokensUsed,
        totalCost: totalCost,
        totalWords: totalWords
      });
      
      throw error;
    } finally {
      // LEAN OPTIMIZATION: Aggressive cleanup
      this.activeExecutions.delete(executionId);
      
      // Also cleanup state manager Maps
      try {
        const stateManager = require('./workflow/state/executionStateManager');
        stateManager.clearExecutionState(executionId);
        logger.debug(`🧹 [LEAN] Cleared execution ${executionId} from all state stores`);
      } catch (err) {
        logger.warn('[LEAN] Could not clear state manager:', err.message);
      }
    }
  }
  
  async stopExecution(executionId) {
    try {
      logger.info(`🛑 [LEAN] FORCE STOPPING execution ${executionId}`);
      
      const execution = this.activeExecutions.get(executionId);
      if (execution) {
        this.activeExecutions.delete(executionId);
        
        try {
          workflowExecutionService.stopWorkflow(executionId);
        } catch (stopError) {
          logger.info(`🛑 [LEAN] Workflow ${executionId} force stopped`);
        }
        
        await this.updateExecutionStatus(executionId, 'cancelled');
        
        return { success: true, message: 'Execution force stopped by lean worker' };
      } else {
        await this.updateExecutionStatus(executionId, 'cancelled');
        return { success: true, message: 'Execution marked as cancelled' };
      }
    } catch (error) {
      logger.error(`❌ [LEAN] Error force stopping:`, error);
      
      try {
        await this.updateExecutionStatus(executionId, 'cancelled');
      } catch (dbError) {
        logger.error(`❌ [LEAN] Failed to update database:`, dbError);
      }
      
      return { success: true, message: 'Execution force stopped with errors' };
    }
  }

  async validateLekhikaApiKey(lekhikaApiKey, userId, userEngineId) {
    try {
      const supabase = getSupabase();
      
      if (!lekhikaApiKey || !lekhikaApiKey.startsWith('LEKH-2-')) {
        throw new Error('Invalid Lekhika API key format');
      }
      
      const { data: userEngine, error } = await supabase
        .from('user_engines')
        .select(`
          id,
          user_id,
          engine_id,
          name,
          description,
          nodes,
          edges,
          models,
          status,
          ai_engines!user_engines_engine_id_fkey (
            id,
            name,
            description,
            nodes,
            edges,
            models,
            execution_mode,
            tier,
            active
          )
        `)
        .eq('api_key', lekhikaApiKey)
        .eq('id', userEngineId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (error) {
        throw new Error(`API key validation failed: ${error.message}`);
      }
      
      if (!userEngine) {
        throw new Error('Invalid or inactive Lekhika API key');
      }
      
      return {
        userEngineId: userEngine.id,
        masterEngineId: userEngine.engine_id,
        name: userEngine.name,
        description: userEngine.description,
        nodes: userEngine.nodes || userEngine.ai_engines?.nodes,
        edges: userEngine.edges || userEngine.ai_engines?.edges,
        models: userEngine.models || userEngine.ai_engines?.models,
        executionMode: userEngine.ai_engines?.execution_mode || 'sequential'
      };
      
    } catch (error) {
      logger.error('[LEAN] API key validation failed:', error);
      throw error;
    }
  }
  
  async updateExecutionStatus(executionId, status, data = null) {
    try {
      logger.debug(`🔄 [LEAN] updateExecutionStatus: ${executionId} → ${status}`);
      const supabase = getSupabase();
      
      const updateData = {
        status
      };
      
      // LEAN OPTIMIZATION: Only write full execution_data on completion/failure
      if (data && (status === 'completed' || status === 'failed')) {
        const executionEntry = this.activeExecutions.get(executionId) || {};
        const previousData = executionEntry.executionData || {};
        const mergedData = mergeExecutionDataPayload(previousData, data);
        const metrics = calculateExecutionMetrics(mergedData);
        mergedData.metrics = metrics;
        mergedData.tokens = metrics.tokens;
        mergedData.words = metrics.words;
        mergedData.cost = metrics.cost;
        mergedData.chaptersGenerated = metrics.chapters;
        
        updateData.execution_data = mergedData;
        logger.info(`📦 [LEAN] Writing FULL execution_data on ${status}`);
      }
      // ELSE: During execution, only status/progress are written (in progressCallback)
      
      if (status === 'cancelled') {
        updateData.status = 'failed';
        updateData.error_message = 'Execution cancelled by user';
      }
      
      if (updateData.status === 'completed' || updateData.status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('engine_executions')
        .update(updateData)
        .eq('id', executionId);
      
      if (error) {
        throw new Error(`Failed to update execution status: ${error.message}`);
      }
      
      // Update analytics when execution completes
      const finalStatus = status === 'cancelled' ? 'failed' : status;
      if (finalStatus === 'completed' || finalStatus === 'failed') {
        try {
          const { data: executionData, error: fetchError } = await supabase
            .from('engine_executions')
            .select('user_id, tokens_used, cost_estimate, status')
            .eq('id', executionId)
            .single();
          
          if (!fetchError && executionData) {
            await analyticsAggregator.updateUserAnalytics(executionData.user_id, executionData);
            logger.info(`📊 [LEAN] Analytics updated`);
          }
        } catch (analyticsError) {
          logger.error(`❌ [LEAN] Failed to update analytics:`, analyticsError);
        }
      }
      
    } catch (error) {
      logger.error(`❌ [LEAN] updateExecutionStatus failed:`, error);
      throw error;
    }
  }
  
  getExecutionStatus(executionId) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return { status: 'not_found' };
    }
    
    const executionData = execution.executionData || {};
    const processingSteps = execution.processingSteps || executionData.processingSteps || [];
    
    return {
      status: execution.status || executionData.status || 'running',
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.endTime 
        ? execution.endTime - (execution.startTime || Date.now())
        : Date.now() - (execution.startTime || 0),
      error: execution.error || executionData.error,
      progress: executionData.progress || 0,
      currentNode: executionData.currentNode || null,
      currentNodeId: executionData.currentNodeId || null,
      processingSteps: processingSteps,
      tokens: executionData.tokens || 0,
      cost: executionData.cost || 0,
      words: executionData.words || 0,
      chaptersGenerated: executionData.chaptersGenerated || 0,
      // LEAN: No full nodeResults, storyContext in memory status (fetch from DB if needed)
    };
  }
}

module.exports = new LeanExecutionService();


const { getSupabase, adjustUserTokens, logTokenUsage } = require('./supabase');
const workflowExecutionService = require('./workflowExecutionService');
const aiService = require('./aiService'); // This is the aiService INSTANCE (default export)
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

  if (previous.storyContext || patch.storyContext) {
    merged.storyContext = mergeObjects(previous.storyContext || {}, patch.storyContext || {});
  }

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
    // SURGICAL FIX: Use sequenceNumber/executionIndex from actual execution order, not workflow definition
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
      // SURGICAL FIX: Store execution order for proper sorting
      sequenceNumber: executionIndex,
      executionIndex: executionIndex,
      totalNodes,
      updatedAt: new Date().toISOString()
    });
  }

  let orderCounter = 1;
  return Array.from(stepsMap.values())
    .sort((a, b) => {
      // SURGICAL FIX: Sort by actual execution order (sequenceNumber/executionIndex) first, then workflow order
      const aExecIndex = typeof a.sequenceNumber === 'number' ? a.sequenceNumber : typeof a.executionIndex === 'number' ? a.executionIndex : Number.MAX_SAFE_INTEGER;
      const bExecIndex = typeof b.sequenceNumber === 'number' ? b.sequenceNumber : typeof b.executionIndex === 'number' ? b.executionIndex : Number.MAX_SAFE_INTEGER;
      if (aExecIndex !== bExecIndex && aExecIndex !== Number.MAX_SAFE_INTEGER && bExecIndex !== Number.MAX_SAFE_INTEGER) {
        return aExecIndex - bExecIndex;
      }
      // Fallback to workflow nodeIndex if execution order not available
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

/**
 * Sanitize execution_data to remove large unnecessary data
 */
const sanitizeExecutionData = (data) => {
  if (!data || typeof data !== 'object') return data
  
  const sanitized = { ...data }
  
  // Remove large fields that cause 400 errors
  delete sanitized.rawExecutionData
  delete sanitized.executionData?.rawExecutionData
  
  // Truncate nodeResults if too large
  if (sanitized.nodeResults && typeof sanitized.nodeResults === 'object') {
    const nodeResultsKeys = Object.keys(sanitized.nodeResults)
    if (nodeResultsKeys.length > 50) {
      // Keep only essential node results
      const essentialKeys = nodeResultsKeys.slice(0, 50)
      const truncated = {}
      essentialKeys.forEach(key => {
        const result = sanitized.nodeResults[key]
        truncated[key] = {
          type: result?.type,
          nodeId: result?.nodeId,
          nodeName: result?.nodeName,
          metadata: {
            nodeId: result?.metadata?.nodeId,
            nodeName: result?.metadata?.nodeName,
            tokens: result?.metadata?.tokens || result?.aiMetadata?.tokens,
            words: result?.metadata?.words || result?.aiMetadata?.words
          }
        }
      })
      sanitized.nodeResults = truncated
    }
  }
  
  return sanitized
}

/**
 * Truncate nodeResults to prevent 400 errors
 */
const truncateNodeResults = (nodeResults) => {
  if (!nodeResults || typeof nodeResults !== 'object') return {}
  
  const truncated = {}
  const keys = Object.keys(nodeResults).slice(0, 50) // Keep only first 50 nodes
  
  keys.forEach(key => {
    const result = nodeResults[key]
    truncated[key] = {
      type: result?.type,
      nodeId: result?.nodeId,
      nodeName: result?.nodeName,
      metadata: {
        nodeId: result?.metadata?.nodeId,
        nodeName: result?.metadata?.nodeName,
        tokens: result?.metadata?.tokens || result?.aiMetadata?.tokens,
        words: result?.metadata?.words || result?.aiMetadata?.words
      }
    }
  })
  
  return truncated
}

class ExecutionService {
  constructor() {
    this.activeExecutions = new Map();
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_EXECUTIONS) || 3; // Reduced from 5 to 3
    this.cleanupInterval = null;
    this.startPeriodicCleanup();
  }

  startPeriodicCleanup() {
    // Clean up stuck executions every 30 seconds
    this.cleanupInterval = setInterval(async () => {
      this.cleanupStuckExecutions();
      await this.cleanupStuckDatabaseExecutions();
    }, 30000);
    
    // Also clean up on process exit
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  cleanupStuckExecutions() {
    const now = Date.now();
    const stuckThreshold = 15 * 60 * 1000; // 15 minutes for book generation
    
    let cleanedCount = 0;
    for (const [executionId, execution] of this.activeExecutions) {
      if (execution.startTime && (now - execution.startTime) > stuckThreshold) {
        logger.warn(`🧹 Cleaning up stuck execution: ${executionId} (running for ${Math.round((now - execution.startTime) / 1000)}s)`);
        this.activeExecutions.delete(executionId);
        cleanedCount++;
        
        // Also clean up in workflow service
        workflowExecutionService.stopWorkflow(executionId);
        
        // Update database status to failed
        this.updateExecutionStatus(executionId, 'failed', { 
          error: 'Execution timed out and was cleaned up by worker' 
        }).catch(err => {
          logger.error(`Failed to update status for stuck execution ${executionId}:`, err);
        });
      }
    }
    
    if (cleanedCount > 0) {
      logger.info(`🧹 Cleaned up ${cleanedCount} stuck executions`);
    }
  }

  async cleanupStuckDatabaseExecutions() {
    try {
      const supabase = getSupabase();
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      // Find executions that have been running for more than 15 minutes
      const { data: stuckExecutions, error } = await supabase
        .from('engine_executions')
        .select('id, created_at')
        .eq('status', 'running')
        .lt('created_at', fifteenMinutesAgo);
      
      if (error) {
        logger.error('Error finding stuck database executions:', error);
        return;
      }
      
      if (stuckExecutions && stuckExecutions.length > 0) {
        logger.warn(`🧹 Found ${stuckExecutions.length} stuck executions in database`);
        
        // Update them to failed status
        const { error: updateError } = await supabase
          .from('engine_executions')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString(),
            execution_data: { error: 'Execution timed out - automatically marked as failed' }
          })
          .eq('status', 'running')
          .lt('created_at', fifteenMinutesAgo);
        
        if (updateError) {
          logger.error('Error updating stuck executions:', updateError);
        } else {
          logger.info(`🧹 Updated ${stuckExecutions.length} stuck executions to failed status`);
        }
      }
    } catch (error) {
      logger.error('Error in cleanupStuckDatabaseExecutions:', error);
    }
  }

  cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Force cleanup all active executions
    logger.info(`🧹 Force cleaning up ${this.activeExecutions.size} active executions`);
    for (const [executionId, execution] of this.activeExecutions) {
      workflowExecutionService.stopWorkflow(executionId);
    }
    this.activeExecutions.clear();
  }
  
  async executeWorkflow({ executionId, lekhikaApiKey, userEngineId, masterEngineId, userId, workflow, inputs, options }) {
    // FIX: Capture startTime at function level
    const startTime = Date.now();
    
    try {
      // Check if we're at capacity
      if (this.activeExecutions.size >= this.maxConcurrent) {
        logger.warn(`🚫 Worker at maximum capacity: ${this.activeExecutions.size}/${this.maxConcurrent} executions`);
        logger.info(`📊 Active executions: ${Array.from(this.activeExecutions.keys()).join(', ')}`);
        throw new Error(`Worker at maximum capacity (${this.activeExecutions.size}/${this.maxConcurrent}). Please wait for current executions to complete.`);
      }
      
      // Validate Lekhika API Key and get engine configuration
      const engineConfig = await this.validateLekhikaApiKey(lekhikaApiKey, userId, userEngineId);
      
      const levelId =
        options?.levelId ||
        options?.level_id ||
        inputs?.level_id ||
        inputs?.levelId ||
        null;

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

      // Mark execution as started
      this.activeExecutions.set(executionId, {
        status: 'running',
        startTime: startTime,
        userId,
        lekhikaApiKey,
        userEngineId,
        masterEngineId,
        executionContext
      });

      // Prime execution data cache with existing record (userInput, options, etc.)
      try {
        const supabase = getSupabase();
        const { data: existingRecord, error: existingError } = await supabase
          .from('engine_executions')
          .select('execution_data')
          .eq('id', executionId)
          .single();

        const initialExecutionData = mergeExecutionDataPayload(
          existingRecord?.execution_data || {},
          {
            userInput: inputs,
            options: options,
            workflow: {
              nodes: workflow?.nodes,
              edges: workflow?.edges,
              models: workflow?.models
            }
          }
        );

        const executionEntry = this.activeExecutions.get(executionId) || {};
        executionEntry.executionData = initialExecutionData;
        this.activeExecutions.set(executionId, executionEntry);

      } catch (prefetchError) {
        logger.warn(`⚠️ Failed to prime execution data cache for ${executionId}:`, prefetchError.message);
      }

      const seededEntry = this.activeExecutions.get(executionId) || {};
      if (!seededEntry.executionData) {
        seededEntry.executionData = {
          userInput: inputs,
          options: options,
          workflow: {
            nodes: workflow?.nodes,
            edges: workflow?.edges,
            models: workflow?.models
          }
        };
        this.activeExecutions.set(executionId, seededEntry);
      }
      
      logger.info(`🚀 Starting execution ${executionId} (${this.activeExecutions.size}/${this.maxConcurrent} active)`);
      
      await this.updateExecutionStatus(executionId, 'running');
      
      logger.logExecution(executionId, 'Workflow execution started');
      
      // Create user object for workflow execution (matches superadmin structure)
      const userObject = {
        id: userId,
        role: 'user',
        tier: options.tier || 'hobby'
      };
      
      // Progress callback to update execution status with complete data
      const progressCallback = async (update) => {
        logger.info(`📊 Progress for ${executionId}:`, update);
        
        // Build complete execution data for frontend
        // Extract AI content as STRING for frontend display
        let aiResponseText = null;
        
        // Priority 1: Check processedContent first (this has the actual extracted text)
        if (update.processedContent && typeof update.processedContent === 'string') {
          aiResponseText = update.processedContent;
        }
        // Priority 2: Check output.content for node results
        else if (update.output?.content && typeof update.output.content === 'string') {
          aiResponseText = update.output.content;
        }
        // Priority 3: Check aiResponse
        else if (update.aiResponse) {
          // If aiResponse is already a string, use it
          if (typeof update.aiResponse === 'string') {
            aiResponseText = update.aiResponse;
          } 
          // If it's an object with content field (common AI response format)
          else if (update.aiResponse.content) {
            if (typeof update.aiResponse.content === 'string') {
              aiResponseText = update.aiResponse.content;
            } else if (Array.isArray(update.aiResponse.content) && update.aiResponse.content[0]?.text) {
              aiResponseText = update.aiResponse.content[0].text;
            }
          }
        }
        // Priority 4: Fallback to output as string
        if (!aiResponseText && typeof update.output === 'string') {
          aiResponseText = update.output;
        }
        
        const executionEntry = this.activeExecutions.get(executionId) || {};
        const previousData = executionEntry.executionData || {};
        const workflowNodes = Array.isArray(workflow?.nodes)
          ? workflow.nodes
          : Array.isArray(previousData.workflow?.nodes)
            ? previousData.workflow.nodes
            : [];

        const existingProcessingSteps = executionEntry.processingSteps || previousData.processingSteps || [];
        const stepUpdate = update?.nodeId && update.nodeId !== 'initializing' ? update : {};
        const normalizedProcessingSteps = syncProcessingSteps(existingProcessingSteps, stepUpdate, workflowNodes);
        executionEntry.processingSteps = normalizedProcessingSteps;

        const nextStoryContext = isPlainObject(update.storyContext)
          ? update.storyContext
          : isPlainObject(executionEntry.storyContext)
            ? executionEntry.storyContext
            : isPlainObject(previousData.storyContext)
              ? previousData.storyContext
              : null;
        if (nextStoryContext) {
          executionEntry.storyContext = nextStoryContext;
        }

        const basePayload = {
          progress: update.progress || previousData.progress || 0,
          currentNode: update.nodeName || update.nodeId || previousData.currentNode || 'Processing',
          currentNodeId: update.nodeId || previousData.currentNodeId || null,
          nodeType: update.nodeType || previousData.nodeType || 'unknown',
          status: update.status || previousData.status || 'running',
          timestamp: new Date().toISOString(),
          aiResponse: aiResponseText,
          nodeResults: update.nodeResults || {},
          tokens: update.tokens || previousData.tokens || 0,
          cost: update.cost || previousData.cost || 0,
          words: update.words || previousData.words || 0,
          duration: update.duration || previousData.duration || 0,
          providerName: update.providerName || previousData.providerName || null,
          error: update.error || previousData.error || null,
          currentOutput: update.nodeId ? {
            nodeId: update.nodeId,
            nodeName: update.nodeName || update.nodeId,
            aiResponse: aiResponseText,
            processedContent: update.processedContent,
            tokens: update.tokens || 0,
            words: update.words || 0,
            cost: update.cost || 0,
            provider: update.providerName,
            timestamp: new Date().toISOString(),
            status: update.status
          } : previousData.currentOutput || null
        };

        if (nextStoryContext) {
          basePayload.storyContext = nextStoryContext;
        }

        if (normalizedProcessingSteps.length > 0) {
          basePayload.processingSteps = normalizedProcessingSteps;
        }

        if (update.checkpointData) {
          basePayload.checkpointData = update.checkpointData;
        }

        if (update.validationError) {
          basePayload.lastValidationError = mergeObjects(
            previousData.lastValidationError || {},
            update.validationError
          );
        }

        // Track format availability across nodes
        if (update.output?.metadata?.allFormats) {
          basePayload.allFormats = mergeObjects(
            previousData.allFormats || {},
            update.output.metadata.allFormats
          );
        }

        if (update.nodeResults) {
          Object.values(update.nodeResults).forEach((result) => {
            if (result?.metadata?.allFormats || result?.allFormats) {
              basePayload.allFormats = mergeObjects(
                basePayload.allFormats || previousData.allFormats || {},
                (result.metadata?.allFormats || result.allFormats || {})
              );
            }
          });
        }

        // Maintain AI response history for streaming UI
        const historyEntry = aiResponseText
          ? {
              nodeId: update.nodeId || null,
              nodeName: update.nodeName || null,
              content: aiResponseText,
              timestamp: new Date().toISOString()
            }
          : null;

        if (historyEntry) {
          const previousHistory = previousData.aiResponseHistory || [];
          basePayload.aiResponseHistory = [...previousHistory, historyEntry].slice(-100);
        }

        const mergedExecutionData = mergeExecutionDataPayload(previousData, {
          ...basePayload,
          userInput: previousData.userInput || inputs,
          options: previousData.options || options
        });
        mergedExecutionData.processingSteps = normalizedProcessingSteps;
        if (nextStoryContext) {
          mergedExecutionData.storyContext = mergeObjects(
            previousData.storyContext || {},
            nextStoryContext
          );
        }

        const metrics = calculateExecutionMetrics(mergedExecutionData);
        mergedExecutionData.metrics = metrics;
        mergedExecutionData.tokens = metrics.tokens;
        mergedExecutionData.words = metrics.words;
        mergedExecutionData.cost = metrics.cost;
        mergedExecutionData.chaptersGenerated = metrics.chapters;

        basePayload.tokens = metrics.tokens;
        basePayload.words = metrics.words;
        basePayload.cost = metrics.cost;
        basePayload.chaptersGenerated = metrics.chapters;

        // Keep latest execution data cached in memory
        executionEntry.executionData = mergedExecutionData;
        this.activeExecutions.set(executionId, executionEntry);
        executionEntry.processingSteps = normalizedProcessingSteps;
        if (nextStoryContext) {
          executionEntry.storyContext = mergedExecutionData.storyContext;
        }

        // Update execution_data with complete structured data
        const supabase = getSupabase();
        await supabase
          .from('engine_executions')
          .update({
            execution_data: mergedExecutionData
          })
          .eq('id', executionId);
      };
      
      // Execute using the REAL workflowExecutionService from superadmin
      logger.info(`🚀 Executing workflow with ${workflow.nodes.length} nodes`);
      
      const result = await workflowExecutionService.executeWorkflow(
        workflow.nodes,
        workflow.edges,
        inputs,
        executionId,
        progressCallback,
        userObject, // Pass user object (NOT superadmin)
        executionContext
      );
      
      logger.info(`✅ Workflow execution completed for ${executionId}`);
      
      // SURGICAL FIX: Trust result.totalTokensUsed if already set from state (via getTokenUsageSummaryHelper)
      // Only calculate from nodeOutputs if result.totalTokensUsed is missing or 0
      let totalTokensUsed = result?.totalTokensUsed || result?.tokenUsage?.debited || 0
      let totalCost = result?.totalCostIncurred || 0
      let totalWords = result?.totalWordsGenerated || 0
      
      // FALLBACK: Only calculate from nodeOutputs if totalTokensUsed is 0 (result.totalTokensUsed not set)
      // This ensures we don't double-count or ignore the correct total from state
      if (totalTokensUsed === 0 && result && result.nodeOutputs) {
        logger.info(`📊 totalTokensUsed is 0, calculating from nodeOutputs as fallback`)
        Object.values(result.nodeOutputs).forEach(output => {
          // Check multiple locations for token data
          const tokens = output.aiMetadata?.tokens || 
                        output.aiMetadata?.totalTokens ||
                        output.metadata?.tokens ||
                        output.tokens || 0
          const cost = output.aiMetadata?.cost ||
                      output.aiMetadata?.totalCost ||
                      output.metadata?.cost ||
                      output.cost || 0
          const words = output.aiMetadata?.words ||
                       output.aiMetadata?.totalWords ||
                       output.metadata?.words ||
                       output.words || 0
          
          totalTokensUsed += tokens
          totalCost += cost
          totalWords += words
          
          // Log for debugging
          if (tokens > 0) {
            logger.info(`📊 Node ${output.nodeId || 'unknown'}: ${tokens} tokens, $${cost} cost, ${words} words`)
          }
        })
      } else if (totalTokensUsed > 0) {
        logger.info(`📊 Using totalTokensUsed from result.totalTokensUsed: ${totalTokensUsed} tokens (from state)`);
      }
      
      logger.info(`📊 Execution totals: ${totalTokensUsed} tokens, $${totalCost} cost, ${totalWords} words`);
      
      // Update execution with totals for analytics
      const supabase = getSupabase()
      await supabase
        .from('engine_executions')
        .update({
          tokens_used: totalTokensUsed,
          cost_estimate: totalCost,
          execution_time_ms: Date.now() - startTime
        })
        .eq('id', executionId)
      
      if (totalTokensUsed > 0) {
        const engineMetadata = {
          engineId: masterEngineId || userEngineId || null,
          userEngineId,
          masterEngineId,
          totalCost,
          totalWords,
          models: executionContext?.models || null
        }

        try {
          await adjustUserTokens({
            userId,
            amount: totalTokensUsed,
            changeType: 'debit',
            reason: 'workflow_execution',
            metadata: engineMetadata,
            levelId: executionContext?.levelId || null,
            source: 'worker',
            referenceType: 'engine_execution',
            referenceId: executionId,
            executionId
          })
          logger.info(`💳 Debited ${totalTokensUsed} tokens from user ${userId} for execution ${executionId}`)
        } catch (tokenAdjustError) {
          logger.error(`❌ Failed to debit tokens for execution ${executionId}:`, tokenAdjustError)
        }

        try {
          await logTokenUsage(
            userId,
            executionId,
            result.tokenUsage?.provider || engineMetadata.models?.[0]?.provider || 'unknown',
            result.tokenUsage?.model || result.tokenUsage?.modelId || engineMetadata.models?.[0]?.name || 'unknown',
            totalTokensUsed,
            totalCost
          )
        } catch (tokenLogError) {
          logger.error(`❌ Failed to log token usage for execution ${executionId}:`, tokenLogError)
        }
      }
      
      // Prepare COMPLETE completion data with nodeResults for downloads
      const executionEntry = this.activeExecutions.get(executionId) || {}

      const completionData = {
        status: 'completed',
        totalNodes: Object.keys(result.nodeOutputs || {}).length,
        totalTokens: totalTokensUsed,
        totalCost: totalCost,
        totalWords: totalWords,
        formatsGenerated: result.nodeOutputs?.['output-1']?.metadata?.formatsGenerated || 0,
        hasFormats: !!(result.nodeOutputs?.['output-1']?.metadata?.allFormats),
        completedAt: new Date().toISOString(),
        // CRITICAL: Include nodeResults for downloads
        nodeResults: result.nodeOutputs || {},
        result: result,
        output: result.lastNodeOutput || null,
        tokenUsage: result.tokenUsage || null,
        tokenLedger: result.tokenLedger || [],
        processingSteps: executionEntry.processingSteps || [],
        storyContext: result.storyContext || executionEntry.executionData?.storyContext || executionEntry.storyContext || null
      }
      
      // Mark as completed with COMPLETE data for downloads
      console.log('🏁 ATTEMPTING TO MARK EXECUTION AS COMPLETED:', executionId)
      console.log('📊 Completion data keys:', Object.keys(completionData))
      await this.updateExecutionStatus(executionId, 'completed', completionData);
      console.log('✅ EXECUTION STATUS UPDATED TO COMPLETED')
      this.activeExecutions.set(executionId, {
        status: 'completed',
        endTime: Date.now(),
        userId,
        lekhikaApiKey,
        userEngineId,
        masterEngineId,
        storyContext: completionData.storyContext
      });
      
      logger.logExecution(executionId, 'Workflow execution completed');
      
      return result;
      
    } catch (error) {
      logger.logExecutionError(executionId, error);
      
      // Try to calculate tokens from any partial results BEFORE marking as failed
      let totalTokensUsed = 0
      let totalCost = 0 
      let totalWords = 0
      
      try {
        // Check if workflow execution produced any partial results with token data
        if (typeof result !== 'undefined' && result && result.nodeOutputs) {
          Object.values(result.nodeOutputs).forEach(output => {
            if (output.aiMetadata) {
              totalTokensUsed += output.aiMetadata.tokens || 0
              totalCost += output.aiMetadata.cost || 0
              totalWords += output.aiMetadata.words || 0
            }
          })
        }
      } catch (tokenCalcError) {
        // If we can't calculate tokens from result, check execution state
        logger.warn('Could not calculate tokens from result, tokens may be lost:', tokenCalcError.message)
      }

      if (totalTokensUsed === 0) {
        const executionEntry = this.activeExecutions.get(executionId)
        const trackedUsage = executionEntry?.executionData?.tokenUsage
        if (trackedUsage?.debited) {
          totalTokensUsed = trackedUsage.debited
        }
        if (executionEntry?.executionData?.totalCostIncurred) {
          totalCost = executionEntry.executionData.totalCostIncurred
        }
        if (executionEntry?.executionData?.totalWordsGenerated) {
          totalWords = executionEntry.executionData.totalWordsGenerated
        }
      }
      
      logger.info(`📊 Failed execution totals: ${totalTokensUsed} tokens, $${totalCost} cost, ${totalWords} words`);
      
      // Update execution with tokens BEFORE marking as failed for analytics
      if (totalTokensUsed > 0) {
        const supabase = getSupabase()
        await supabase
          .from('engine_executions')
          .update({
            tokens_used: totalTokensUsed,
            cost_estimate: totalCost,
            execution_time_ms: Date.now() - startTime
          })
          .eq('id', executionId)

        const failureMetadata = {
          engineId: masterEngineId || userEngineId || null,
          userEngineId,
          masterEngineId,
          totalCost,
          totalWords,
          models: this.activeExecutions.get(executionId)?.executionContext?.models || executionContext?.models || null,
          status: 'failed'
        }

        try {
          await adjustUserTokens({
            userId,
            amount: totalTokensUsed,
            changeType: 'debit',
            reason: 'workflow_execution_failed',
            metadata: failureMetadata,
            levelId: this.activeExecutions.get(executionId)?.executionContext?.levelId || executionContext?.levelId || null,
            source: 'worker',
            referenceType: 'engine_execution',
            referenceId: executionId,
            executionId
          })
          logger.info(`💳 Debited ${totalTokensUsed} tokens from user ${userId} for FAILED execution ${executionId}`)
        } catch (tokenAdjustError) {
          logger.error(`❌ Failed to debit tokens for failed execution ${executionId}:`, tokenAdjustError)
        }

        try {
          await logTokenUsage(
            userId,
            executionId,
            failureMetadata.models?.[0]?.provider || 'unknown',
            failureMetadata.models?.[0]?.name || 'unknown',
            totalTokensUsed,
            totalCost
          )
        } catch (tokenLogError) {
          logger.error(`❌ Failed to log token usage for failed execution ${executionId}:`, tokenLogError)
        }
      }
      
      // Mark as failed with token data for analytics
      const failedProcessingSteps = this.activeExecutions.get(executionId)?.processingSteps || [];
      const failedStoryContext = this.activeExecutions.get(executionId)?.executionData?.storyContext
        || this.activeExecutions.get(executionId)?.storyContext
        || null;
      await this.updateExecutionStatus(executionId, 'failed', { 
        error: error.message,
        totalTokens: totalTokensUsed,
        totalCost: totalCost,
        totalWords: totalWords,
        processingSteps: failedProcessingSteps,
        storyContext: failedStoryContext
      });
      this.activeExecutions.set(executionId, {
        status: 'failed',
        endTime: Date.now(),
        userId,
        lekhikaApiKey,
        error: error.message,
        storyContext: failedStoryContext
      });
      
      throw error;
    } finally {
      // Clean up immediately when execution completes/fails
      this.activeExecutions.delete(executionId);
      logger.info(`🧹 Cleaned up execution ${executionId} from active executions`);
    }
  }
  
  async stopExecution(executionId) {
    try {
      logger.info(`🛑 FORCE STOPPING execution ${executionId}`);
      
      // Get execution info before stopping
      const execution = this.activeExecutions.get(executionId);
      if (execution) {
        logger.info(`🛑 Found execution ${executionId}, force stopping...`);
        
        // IMMEDIATELY remove from active executions to prevent new requests
        this.activeExecutions.delete(executionId);
        logger.info(`🗑️ Removed ${executionId} from active executions`);
        
        // Force stop the workflow service execution
        try {
          workflowExecutionService.stopWorkflow(executionId);
          logger.info(`🛑 Workflow ${executionId} stop signal sent`);
        } catch (stopError) {
          logger.info(`🛑 Workflow ${executionId} force stopped:`, stopError.message);
        }
        
        // Update database status to cancelled
        await this.updateExecutionStatus(executionId, 'cancelled');
        logger.info(`📝 Database status updated to cancelled for ${executionId}`);
        
        return { success: true, message: 'Execution force stopped successfully' };
      } else {
        logger.warn(`⚠️ Execution ${executionId} not found in active executions`);
        
        // Even if not in active executions, try to update database status
        await this.updateExecutionStatus(executionId, 'cancelled');
        
        return { success: true, message: 'Execution marked as cancelled' };
      }
    } catch (error) {
      logger.error(`❌ Error force stopping execution ${executionId}:`, error);
      
      // Even if there's an error, try to update database status
      try {
        await this.updateExecutionStatus(executionId, 'cancelled');
      } catch (dbError) {
        logger.error(`❌ Failed to update database status for ${executionId}:`, dbError);
      }
      
      return { success: true, message: 'Execution force stopped with errors' };
    }
  }

  async regenerateFailedNode(executionId, { failedNode, validationError, regeneratePrompt }) {
    logger.info(`🔁 Regeneration requested for execution ${executionId} (node: ${failedNode || 'auto'})`)
    
    const supabase = getSupabase()
    const timestamp = new Date().toISOString()
    let executionData = {}
    
    try {
      const { data: executionRecord, error: executionError } = await supabase
      .from('engine_executions')
      .select('id, user_id, user_engine_id, engine_id, input_data, execution_data')
      .eq('id', executionId)
      .single()
    
      if (executionError || !executionRecord) {
        throw new Error(`Execution ${executionId} not found for regeneration`)
      }
      
      executionData = executionRecord.execution_data || {}
      const checkpointData = executionData.checkpointData || null
      const targetNodeId = failedNode || checkpointData?.failedAtNode
      
      if (!targetNodeId) {
        throw new Error('Unable to identify failed node for regeneration')
      }
      
      const regenerateAttempts = { ...(executionData.regenerationAttempts || {}) }
      const attemptInfo = regenerateAttempts[targetNodeId] || { count: 0 }
      if (attemptInfo.count >= 3) {
        throw new Error(`Regenerate limit reached for node ${targetNodeId}. Manual intervention required.`)
      }
      
      const userEngineId = executionRecord.user_engine_id || executionData.userEngineId
      if (!userEngineId) {
        throw new Error('Unable to determine user engine for regeneration')
      }
      
      const { data: engineBlueprint, error: blueprintError } = await supabase
        .from('user_engines')
        .select('nodes, edges')
        .eq('id', userEngineId)
        .single()
      
      if (blueprintError || !engineBlueprint) {
        throw new Error('Failed to load engine blueprint for regeneration')
      }
      
      let nodes = engineBlueprint.nodes || []
      let edges = engineBlueprint.edges || []
      if (typeof nodes === 'string') {
        try { nodes = JSON.parse(nodes) } catch (_) { /* keep original */ }
      }
      if (typeof edges === 'string') {
        try { edges = JSON.parse(edges) } catch (_) { /* keep original */ }
      }
      
      regenerateAttempts[targetNodeId] = {
        count: attemptInfo.count + 1,
        lastAttemptAt: timestamp,
        lastError: validationError
      }
      
      const updatedExecutionData = {
        ...executionData,
        regenerationAttempts: regenerateAttempts,
        lastRegenerateError: validationError,
        lastRegenerateAt: timestamp
      }
      
      await supabase
        .from('engine_executions')
        .update({
          status: 'running',
          execution_data: updatedExecutionData
        })
        .eq('id', executionId)
      
      const progressCallback = async (update) => {
        try {
          const stepUpdate = update?.nodeId && update.nodeId !== 'initializing' ? update : {};
          const normalizedSteps = syncProcessingSteps(
            updatedExecutionData.processingSteps || executionData.processingSteps || [],
            stepUpdate,
            nodes
          );
          updatedExecutionData.processingSteps = normalizedSteps;

          const executionUpdate = {
            progress: update.progress || 0,
            status: update.status || 'running',
            currentNode: update.nodeName || update.nodeId,
            currentNodeId: update.nodeId || null,
            nodeResults: update.nodeResults || {},
            aiResponse: update.aiResponse || update.output?.content || null,
            timestamp: new Date().toISOString(),
            regenerateContext: {
              targetNodeId,
              attempt: regenerateAttempts[targetNodeId].count
            },
            processingSteps: normalizedSteps
          }
          
          const mergedExecutionData = mergeExecutionDataPayload(
            updatedExecutionData,
            executionUpdate
          );
          mergedExecutionData.processingSteps = normalizedSteps;
          updatedExecutionData = mergedExecutionData;
          
          await supabase
            .from('engine_executions')
            .update({
              status: 'running',
              execution_data: {
                ...(mergedExecutionData || {})
              }
            })
            .eq('id', executionId)
        } catch (err) {
          logger.error('❌ Failed to persist regeneration progress:', err)
        }
      }
      
      const regenerateContext = {
        targetNodeId,
        validationError,
        regeneratePrompt,
        attempt: regenerateAttempts[targetNodeId].count
      }
      
      const result = await workflowExecutionService.resumeExecution(
        executionId,
        nodes,
        edges,
        progressCallback,
        {
          failedNodeId: targetNodeId,
          retryFailedNode: true,
          regenerateContext
        }
      )
      
      logger.info(`✅ Regeneration workflow triggered for ${executionId} (node ${targetNodeId})`)
      return {
        success: true,
        result,
        attempt: regenerateAttempts[targetNodeId].count
      }
    } catch (error) {
      logger.error(`❌ Regeneration failed for execution ${executionId}:`, error)
      try {
        await supabase
          .from('engine_executions')
          .update({
            status: 'failed',
            execution_data: {
              ...(executionData || {}),
              lastRegenerateError: error.message,
              lastRegenerateAt: timestamp
            }
          })
          .eq('id', executionId)
      } catch (updateError) {
        logger.error('❌ Failed to persist regeneration failure state:', updateError)
      }
      throw error
    }
  }
  
  async validateLekhikaApiKey(lekhikaApiKey, userId, userEngineId) {
    try {
      const supabase = getSupabase();
      
      // Validate API key format
      if (!lekhikaApiKey || !lekhikaApiKey.startsWith('LEKH-2-')) {
        throw new Error('Invalid Lekhika API key format');
      }
      
      // Look up user_engines record by API key and userEngineId
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
      
      logger.logExecution('validation', `API key validated for engine: ${userEngine.name}`);
      
      // Return the engine configuration
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
      logger.error('Lekhika API key validation failed:', error);
      throw error;
    }
  }
  
  async updateExecutionStatus(executionId, status, data = null) {
    try {
      console.log(`🔄 updateExecutionStatus called: ${executionId} → ${status}`)
      const supabase = getSupabase();
      
      const updateData = {
        status
      };
      
      if (data) {
        const executionEntry = this.activeExecutions.get(executionId) || {};
        const previousData = executionEntry.executionData || {};
        const mergedData = mergeExecutionDataPayload(previousData, data);
        const metrics = calculateExecutionMetrics(mergedData);
        mergedData.metrics = metrics;
        mergedData.tokens = metrics.tokens;
        mergedData.words = metrics.words;
        mergedData.cost = metrics.cost;
        mergedData.chaptersGenerated = metrics.chapters;
        
        // SURGICAL FIX: Sanitize execution_data to prevent 400 errors (remove large unnecessary data)
        const sanitizedData = sanitizeExecutionData(mergedData);
        const dataSize = JSON.stringify(sanitizedData).length
        console.log(`📦 Including execution_data (${dataSize} bytes, sanitized from ${JSON.stringify(mergedData).length} bytes)`)
        
        // SURGICAL FIX: Only save if under 2MB to prevent Supabase 400 errors
        if (dataSize > 2000000) {
          console.warn(`⚠️ execution_data too large (${dataSize} bytes), saving minimal version`)
          updateData.execution_data = {
            status: sanitizedData.status,
            progress: sanitizedData.progress,
            metrics: sanitizedData.metrics,
            tokens: sanitizedData.tokens,
            words: sanitizedData.words,
            cost: sanitizedData.cost,
            chaptersGenerated: sanitizedData.chaptersGenerated,
            storyContext: sanitizedData.storyContext,
            processingSteps: sanitizedData.processingSteps,
            // Store nodeResults separately or truncate
            nodeResults: truncateNodeResults(sanitizedData.nodeResults || {})
          }
        } else {
          updateData.execution_data = sanitizedData;
        }
        
        executionEntry.executionData = mergedData; // Keep full data in memory
        this.activeExecutions.set(executionId, executionEntry);
      }
      
      // SURGICAL FIX: Database schema only allows 'running', 'completed', 'failed'
      // Map 'cancelled' to 'failed' to comply with schema constraint
      if (status === 'cancelled') {
        console.warn(`⚠️ Status 'cancelled' not allowed by schema, mapping to 'failed'`)
        updateData.status = 'failed'
        updateData.error_message = 'Execution cancelled by user'
      }
      
      // Set completed_at when status is completed or failed
      if (updateData.status === 'completed' || updateData.status === 'failed') {
        updateData.completed_at = new Date().toISOString();
        console.log(`⏰ Setting completed_at: ${updateData.completed_at}`)
      }
      
      console.log(`💾 Updating Supabase...`)
      const { error } = await supabase
        .from('engine_executions')
        .update(updateData)
        .eq('id', executionId);
      
      if (error) {
        console.error(`❌ Supabase update error:`, error)
        // SURGICAL FIX: If execution_data is too large, try saving without it
        if (error.message && (error.message.includes('400') || error.message.includes('too large') || error.code === 'PGRST116')) {
          console.warn(`⚠️ Retrying without execution_data due to size limit`)
          const minimalUpdate = {
            status: updateData.status,
            completed_at: updateData.completed_at,
            error_message: updateData.error_message
          }
          const { error: retryError } = await supabase
            .from('engine_executions')
            .update(minimalUpdate)
            .eq('id', executionId)
          if (retryError) {
            throw new Error(`Failed to update execution status: ${retryError.message}`);
          }
          console.log(`✅ Saved minimal execution status (execution_data too large)`)
        } else {
        throw new Error(`Failed to update execution status: ${error.message}`);
      }
      } else {
      console.log(`✅ Supabase update successful`)
      }
      
      // Update analytics when execution completes (map cancelled to failed)
      const finalStatus = status === 'cancelled' ? 'failed' : status
      if (finalStatus === 'completed' || finalStatus === 'failed') {
        try {
          // Get execution data for analytics
          const { data: executionData, error: fetchError } = await supabase
            .from('engine_executions')
            .select('user_id, tokens_used, cost_estimate, status')
            .eq('id', executionId)
            .single();
          
          if (!fetchError && executionData) {
            await analyticsAggregator.updateUserAnalytics(executionData.user_id, executionData);
            logger.info(`📊 Analytics updated for execution ${executionId}`);
          }
        } catch (analyticsError) {
          logger.error(`❌ Failed to update analytics for execution ${executionId}:`, analyticsError);
          // Don't throw - analytics failure shouldn't break execution
        }
      }
      
      logger.logExecution(executionId, `Status updated to: ${status}`);
      
    } catch (error) {
      logger.logExecutionError(executionId, error);
      throw error;
    }
  }
  
  getExecutionStatus(executionId) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return { status: 'not_found' };
    }
    
    return {
      status: execution.status,
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.endTime 
        ? execution.endTime - (execution.startTime || Date.now())
        : Date.now() - (execution.startTime || 0),
      error: execution.error
    };
  }
}

module.exports = new ExecutionService();

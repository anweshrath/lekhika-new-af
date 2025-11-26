/**
 * JOB MANAGER SERVICE
 * 
 * Comprehensive job lifecycle management for orchestration control center
 * Browse, search, filter, retry, cancel, modify jobs
 * 
 * Features:
 * - Browse jobs by state (waiting, active, completed, failed, delayed)
 * - Search by executionId, userId, engine name
 * - Filter by date range, worker, status
 * - Retry individual or bulk jobs
 * - Cancel jobs
 * - Change job priority
 * - Schedule/delay jobs
 * - Get detailed job information
 * 
 * Part of: Orchestration Control Center (Mother Control Panel)
 * Created: 2025-11-24
 */

const logger = require('../utils/logger');

class JobManager {
  constructor() {
    this.queue = null; // Will be set to queue adapter instance
    this.supabase = null; // Will be set to Supabase client
  }

  /**
   * Initialize with queue adapter and Supabase client
   * @param {object} queueAdapter - Queue adapter instance
   * @param {object} supabaseClient - Supabase client
   */
  initialize(queueAdapter, supabaseClient) {
    this.queue = queueAdapter;
    this.supabase = supabaseClient;
    logger.info('[JobManager] Initialized with queue and database');
  }

  /**
   * Browse jobs by state
   * @param {string} state - waiting, active, completed, failed, delayed
   * @param {number} start - Pagination start (default 0)
   * @param {number} end - Pagination end (default 99)
   * @returns {Array} List of jobs
   */
  async browseJobs(state = 'waiting', start = 0, end = 99) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      let jobs = [];
      
      switch (state.toLowerCase()) {
        case 'waiting':
        case 'wait':
          jobs = await this.queue.queue.getWaiting(start, end);
          break;
        case 'active':
          jobs = await this.queue.queue.getActive(start, end);
          break;
        case 'completed':
          jobs = await this.queue.queue.getCompleted(start, end);
          break;
        case 'failed':
          jobs = await this.queue.queue.getFailed(start, end);
          break;
        case 'delayed':
          jobs = await this.queue.queue.getDelayed(start, end);
          break;
        default:
          throw new Error(`Invalid state: ${state}`);
      }

      // Enrich jobs with user/engine data from database
      const enrichedJobs = await this.enrichJobsWithMetadata(jobs);
      
      return enrichedJobs;
    } catch (error) {
      logger.error(`[JobManager] Failed to browse ${state} jobs:`, error);
      throw new Error(`Failed to browse ${state} jobs: ${error.message}`);
    }
  }

  /**
   * Enrich jobs with user and engine metadata from database
   */
  async enrichJobsWithMetadata(jobs) {
    if (!this.supabase || !jobs || jobs.length === 0) {
      return this.formatJobs(jobs);
    }

    try {
      const executionIds = jobs.map(job => job.id || job.data?.executionId).filter(Boolean);
      
      if (executionIds.length === 0) {
        return this.formatJobs(jobs);
      }

      // Fetch execution data from database
      const { data: executions, error } = await this.supabase
        .from('engine_executions')
        .select('id, user_id, engine_id, status, progress, current_node, created_at, users(email, full_name)')
        .in('id', executionIds);

      if (error) {
        logger.error('[JobManager] Failed to fetch execution metadata:', error);
        return this.formatJobs(jobs);
      }

      // Create lookup map
      const executionMap = new Map();
      (executions || []).forEach(exec => {
        executionMap.set(exec.id, exec);
      });

      // Enrich jobs
      return jobs.map(job => {
        const executionId = job.id || job.data?.executionId;
        const execution = executionMap.get(executionId);
        
        return {
          id: job.id,
          name: job.name,
          state: job.state || 'unknown',
          attemptsMade: job.attemptsMade,
          timestamp: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          failedReason: job.failedReason,
          progress: job.progress || execution?.progress || 0,
          data: {
            executionId: job.data?.executionId,
            userId: job.data?.userId,
            userEngineId: job.data?.userEngineId,
            workerType: job.data?.workerType
          },
          metadata: execution ? {
            userEmail: execution.users?.email,
            userName: execution.users?.full_name,
            currentNode: execution.current_node,
            dbStatus: execution.status,
            createdAt: execution.created_at
          } : null,
          opts: {
            attempts: job.opts?.attempts,
            priority: job.opts?.priority,
            delay: job.opts?.delay
          }
        };
      });
    } catch (error) {
      logger.error('[JobManager] Error enriching jobs:', error);
      return this.formatJobs(jobs);
    }
  }

  /**
   * Format jobs (basic formatting without enrichment)
   */
  formatJobs(jobs) {
    return (jobs || []).map(job => ({
      id: job.id,
      name: job.name,
      state: job.state || 'unknown',
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      progress: job.progress,
      data: job.data,
      opts: {
        attempts: job.opts?.attempts,
        priority: job.opts?.priority,
        delay: job.opts?.delay
      }
    }));
  }

  /**
   * Get job details by ID
   * @param {string} jobId - Job ID (executionId)
   */
  async getJobDetails(jobId) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      const job = await this.queue.getJob(jobId);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found in queue`);
      }

      const state = await job.getState();
      const logs = await job.getState(); // Get job logs/state
      
      return {
        id: job.id,
        name: job.name,
        state: state,
        data: job.data,
        opts: job.opts,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        returnvalue: job.returnvalue,
        progress: job.progress
      };
    } catch (error) {
      logger.error(`[JobManager] Failed to get job details for ${jobId}:`, error);
      throw new Error(`Failed to get job details: ${error.message}`);
    }
  }

  /**
   * Retry a failed job
   * @param {string} jobId - Job ID
   */
  async retryJob(jobId) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      await this.queue.retry(jobId);
      logger.info(`[JobManager] Job ${jobId} queued for retry`);
      return { success: true, message: `Job ${jobId} retry initiated` };
    } catch (error) {
      logger.error(`[JobManager] Failed to retry job ${jobId}:`, error);
      throw new Error(`Failed to retry job: ${error.message}`);
    }
  }

  /**
   * Cancel a job
   * @param {string} jobId - Job ID
   */
  async cancelJob(jobId) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      await this.queue.cancel(jobId);
      logger.info(`[JobManager] Job ${jobId} cancelled`);
      return { success: true, message: `Job ${jobId} cancelled` };
    } catch (error) {
      logger.error(`[JobManager] Failed to cancel job ${jobId}:`, error);
      throw new Error(`Failed to cancel job: ${error.message}`);
    }
  }

  /**
   * Change job priority
   * @param {string} jobId - Job ID
   * @param {number} priority - Priority (lower number = higher priority)
   */
  async changeJobPriority(jobId, priority) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      const job = await this.queue.getJob(jobId);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      await job.changePriority({ priority });
      logger.info(`[JobManager] Job ${jobId} priority changed to ${priority}`);
      
      return { success: true, message: `Job priority changed to ${priority}` };
    } catch (error) {
      logger.error(`[JobManager] Failed to change priority for ${jobId}:`, error);
      throw new Error(`Failed to change priority: ${error.message}`);
    }
  }

  /**
   * Promote job to front of queue
   * @param {string} jobId - Job ID
   */
  async promoteJob(jobId) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      const job = await this.queue.getJob(jobId);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      await job.promote();
      logger.info(`[JobManager] Job ${jobId} promoted to front of queue`);
      
      return { success: true, message: 'Job promoted to front of queue' };
    } catch (error) {
      logger.error(`[JobManager] Failed to promote job ${jobId}:`, error);
      throw new Error(`Failed to promote job: ${error.message}`);
    }
  }

  /**
   * Delay job execution
   * @param {string} jobId - Job ID
   * @param {number} delayMs - Delay in milliseconds
   */
  async delayJob(jobId, delayMs) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      const job = await this.queue.getJob(jobId);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      await job.changeDelay(delayMs);
      logger.info(`[JobManager] Job ${jobId} delayed by ${delayMs}ms`);
      
      return { success: true, message: `Job delayed by ${Math.round(delayMs / 1000)}s` };
    } catch (error) {
      logger.error(`[JobManager] Failed to delay job ${jobId}:`, error);
      throw new Error(`Failed to delay job: ${error.message}`);
    }
  }

  /**
   * Search jobs by executionId or userId
   * @param {string} searchTerm - Execution ID or User ID to search
   * @param {string} searchType - 'executionId' or 'userId'
   */
  async searchJobs(searchTerm, searchType = 'executionId') {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      // Get all jobs from all states
      const [waiting, active, failed, delayed] = await Promise.all([
        this.queue.queue.getWaiting(0, 999),
        this.queue.queue.getActive(0, 999),
        this.queue.queue.getFailed(0, 999),
        this.queue.queue.getDelayed(0, 999)
      ]);

      const allJobs = [...waiting, ...active, ...failed, ...delayed];
      
      // Filter by search term
      const filtered = allJobs.filter(job => {
        if (searchType === 'executionId') {
          return job.id === searchTerm || job.data?.executionId === searchTerm;
        } else if (searchType === 'userId') {
          return job.data?.userId === searchTerm;
        }
        return false;
      });

      // Enrich with metadata
      const enriched = await this.enrichJobsWithMetadata(filtered);
      
      logger.info(`[JobManager] Search found ${enriched.length} jobs for ${searchType}: ${searchTerm}`);
      
      return enriched;
    } catch (error) {
      logger.error('[JobManager] Search failed:', error);
      throw new Error(`Failed to search jobs: ${error.message}`);
    }
  }

  /**
   * Bulk retry all failed jobs
   */
  async bulkRetryFailed() {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      const failed = await this.queue.queue.getFailed(0, 999);
      let retried = 0;
      const errors = [];

      for (const job of failed) {
        try {
          await job.retry();
          retried++;
        } catch (err) {
          errors.push({ jobId: job.id, error: err.message });
        }
      }

      logger.info(`[JobManager] Bulk retry: ${retried}/${failed.length} jobs retried`);
      
      return {
        success: true,
        retried: retried,
        total: failed.length,
        errors: errors
      };
    } catch (error) {
      logger.error('[JobManager] Bulk retry failed:', error);
      throw new Error(`Bulk retry failed: ${error.message}`);
    }
  }

  /**
   * Bulk cancel jobs
   * @param {Array} jobIds - Array of job IDs to cancel
   */
  async bulkCancel(jobIds) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      let cancelled = 0;
      const errors = [];

      for (const jobId of jobIds) {
        try {
          await this.queue.cancel(jobId);
          cancelled++;
        } catch (err) {
          errors.push({ jobId, error: err.message });
        }
      }

      logger.info(`[JobManager] Bulk cancel: ${cancelled}/${jobIds.length} jobs cancelled`);
      
      return {
        success: true,
        cancelled: cancelled,
        total: jobIds.length,
        errors: errors
      };
    } catch (error) {
      logger.error('[JobManager] Bulk cancel failed:', error);
      throw new Error(`Bulk cancel failed: ${error.message}`);
    }
  }

  /**
   * Bulk change priority
   * @param {Array} jobIds - Array of job IDs
   * @param {number} priority - New priority
   */
  async bulkChangePriority(jobIds, priority) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      let changed = 0;
      const errors = [];

      for (const jobId of jobIds) {
        try {
          const job = await this.queue.getJob(jobId);
          if (job) {
            await job.changePriority({ priority });
            changed++;
          }
        } catch (err) {
          errors.push({ jobId, error: err.message });
        }
      }

      logger.info(`[JobManager] Bulk priority change: ${changed}/${jobIds.length} jobs updated`);
      
      return {
        success: true,
        changed: changed,
        total: jobIds.length,
        errors: errors
      };
    } catch (error) {
      logger.error('[JobManager] Bulk priority change failed:', error);
      throw new Error(`Bulk priority change failed: ${error.message}`);
    }
  }

  /**
   * Get job counts by state (for overview)
   */
  async getJobCounts() {
    if (!this.queue) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0
      };
    }

    try {
      const counts = await this.queue.getQueueStats();
      
      return {
        waiting: counts.wait || counts.waiting || 0,
        active: counts.active || 0,
        completed: counts.completed || 0,
        failed: counts.failed || 0,
        delayed: counts.delayed || 0,
        total: (counts.wait || 0) + (counts.active || 0) + (counts.failed || 0) + (counts.delayed || 0)
      };
    } catch (error) {
      logger.error('[JobManager] Failed to get job counts:', error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        total: 0
      };
    }
  }

  /**
   * Get jobs summary (counts + recent jobs)
   */
  async getJobsSummary() {
    const [counts, recentActive, recentFailed] = await Promise.all([
      this.getJobCounts(),
      this.browseJobs('active', 0, 9).catch(() => []),
      this.browseJobs('failed', 0, 9).catch(() => [])
    ]);

    return {
      counts: counts,
      recentActive: recentActive,
      recentFailed: recentFailed,
      timestamp: Date.now()
    };
  }

  /**
   * Clean completed jobs older than specified age
   * @param {number} ageMs - Age in milliseconds (default 24 hours)
   */
  async cleanCompletedJobs(ageMs = 24 * 60 * 60 * 1000) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      const grace = ageMs;
      const limit = 1000;
      
      // BullMQ clean() method: removes jobs older than grace period
      const cleaned = await this.queue.queue.clean(grace, limit, 'completed');
      
      logger.info(`[JobManager] Cleaned ${cleaned.length} completed jobs older than ${Math.round(ageMs / 3600000)}h`);
      
      return {
        success: true,
        cleaned: cleaned.length,
        message: `Cleaned ${cleaned.length} completed jobs`
      };
    } catch (error) {
      logger.error('[JobManager] Failed to clean completed jobs:', error);
      throw new Error(`Failed to clean completed jobs: ${error.message}`);
    }
  }

  /**
   * Get failed jobs with error patterns
   */
  async getFailedJobsAnalysis() {
    if (!this.queue) {
      return { total: 0, patterns: [] };
    }

    try {
      const failed = await this.queue.queue.getFailed(0, 999);
      
      // Group by error type
      const errorPatterns = new Map();
      
      failed.forEach(job => {
        const errorMsg = job.failedReason || 'Unknown error';
        const count = errorPatterns.get(errorMsg) || 0;
        errorPatterns.set(errorMsg, count + 1);
      });

      const patterns = Array.from(errorPatterns.entries())
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count);

      return {
        total: failed.length,
        patterns: patterns,
        topError: patterns[0] || null
      };
    } catch (error) {
      logger.error('[JobManager] Failed to analyze failed jobs:', error);
      return { total: 0, patterns: [], error: error.message };
    }
  }

  /**
   * Schedule recurring job (cron)
   * @param {string} jobType - Job type
   * @param {object} payload - Job payload
   * @param {string} cronPattern - Cron pattern (e.g., '0 0 * * *' for daily at midnight)
   */
  async scheduleRecurringJob(jobType, payload, cronPattern) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      await this.queue.queue.add(jobType, payload, {
        repeat: {
          pattern: cronPattern
        }
      });

      logger.info(`[JobManager] Recurring job scheduled: ${jobType} with pattern ${cronPattern}`);
      
      return {
        success: true,
        message: `Recurring job scheduled with pattern: ${cronPattern}`
      };
    } catch (error) {
      logger.error('[JobManager] Failed to schedule recurring job:', error);
      throw new Error(`Failed to schedule recurring job: ${error.message}`);
    }
  }

  /**
   * Get all repeatable jobs (cron jobs)
   */
  async getRepeatableJobs() {
    if (!this.queue) {
      return [];
    }

    try {
      const repeatable = await this.queue.queue.getRepeatableJobs();
      
      return repeatable.map(job => ({
        key: job.key,
        name: job.name,
        pattern: job.pattern,
        next: job.next,
        tz: job.tz
      }));
    } catch (error) {
      logger.error('[JobManager] Failed to get repeatable jobs:', error);
      return [];
    }
  }

  /**
   * Remove repeatable job
   * @param {string} repeatJobKey - Repeatable job key
   */
  async removeRepeatableJob(repeatJobKey) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      await this.queue.queue.removeRepeatableByKey(repeatJobKey);
      logger.info(`[JobManager] Repeatable job removed: ${repeatJobKey}`);
      
      return { success: true, message: 'Recurring job removed' };
    } catch (error) {
      logger.error('[JobManager] Failed to remove repeatable job:', error);
      throw new Error(`Failed to remove recurring job: ${error.message}`);
    }
  }
}

module.exports = new JobManager();


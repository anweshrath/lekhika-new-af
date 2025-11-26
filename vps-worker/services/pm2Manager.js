/**
 * PM2 MANAGER SERVICE
 * 
 * Programmatic control of PM2 processes from Orchestration Control Center
 * Enables start/stop/restart/logs access via API (no SSH needed)
 * 
 * Features:
 * - List all PM2 processes
 * - Start/stop/restart individual processes
 * - Get process logs
 * - Get process metrics (CPU, memory)
 * - Drain worker (stop accepting new jobs, wait for current to finish)
 * 
 * Part of: Orchestration Control Center (Mother Control Panel)
 * Created: 2025-11-24
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const logger = require('../utils/logger');

const execAsync = promisify(exec);

class PM2Manager {
  constructor() {
    this.pm2Available = false;
    this.checkPM2Availability();
  }

  /**
   * Check if PM2 is available
   */
  async checkPM2Availability() {
    try {
      await execAsync('pm2 -v');
      this.pm2Available = true;
      logger.info('[PM2Manager] PM2 available and ready');
    } catch (error) {
      this.pm2Available = false;
      logger.warn('[PM2Manager] PM2 not available - PM2 features disabled');
    }
  }

  /**
   * Get list of all PM2 processes
   * @returns {Array} List of PM2 processes with status, memory, CPU
   */
  async listProcesses() {
    if (!this.pm2Available) {
      throw new Error('PM2 not available on this system');
    }

    try {
      const { stdout } = await execAsync('pm2 jlist');
      const processes = JSON.parse(stdout);
      
      return processes.map(proc => ({
        name: proc.name,
        pm_id: proc.pm_id,
        pid: proc.pid,
        status: proc.pm2_env?.status,
        uptime: proc.pm2_env?.pm_uptime,
        restarts: proc.pm2_env?.restart_time,
        memory: proc.monit?.memory,
        cpu: proc.monit?.cpu,
        script: proc.pm2_env?.pm_exec_path,
        port: proc.pm2_env?.env?.PORT || proc.pm2_env?.env?.LEAN_PORT,
        type: proc.name.includes('lean') ? 'lean' : proc.name.includes('queue') ? 'queue' : 'standard'
      }));
    } catch (error) {
      logger.error('[PM2Manager] Failed to list processes:', error);
      throw new Error('Failed to get PM2 process list');
    }
  }

  /**
   * Get detailed info for specific process
   * @param {string} processName - PM2 process name
   */
  async describeProcess(processName) {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync(`pm2 describe ${processName}`);
      // PM2 describe returns detailed JSON
      return stdout;
    } catch (error) {
      logger.error(`[PM2Manager] Failed to describe ${processName}:`, error);
      throw new Error(`Failed to get process info for ${processName}`);
    }
  }

  /**
   * Start PM2 process
   * @param {string} processName - PM2 process name
   */
  async startProcess(processName) {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync(`pm2 start ${processName}`);
      logger.info(`[PM2Manager] Started process: ${processName}`);
      return { success: true, message: `Process ${processName} started`, output: stdout };
    } catch (error) {
      logger.error(`[PM2Manager] Failed to start ${processName}:`, error);
      throw new Error(`Failed to start process ${processName}: ${error.message}`);
    }
  }

  /**
   * Stop PM2 process
   * @param {string} processName - PM2 process name
   */
  async stopProcess(processName) {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync(`pm2 stop ${processName}`);
      logger.info(`[PM2Manager] Stopped process: ${processName}`);
      return { success: true, message: `Process ${processName} stopped`, output: stdout };
    } catch (error) {
      logger.error(`[PM2Manager] Failed to stop ${processName}:`, error);
      throw new Error(`Failed to stop process ${processName}: ${error.message}`);
    }
  }

  /**
   * Restart PM2 process
   * @param {string} processName - PM2 process name
   */
  async restartProcess(processName) {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync(`pm2 restart ${processName}`);
      logger.info(`[PM2Manager] Restarted process: ${processName}`);
      return { success: true, message: `Process ${processName} restarted`, output: stdout };
    } catch (error) {
      logger.error(`[PM2Manager] Failed to restart ${processName}:`, error);
      throw new Error(`Failed to restart process ${processName}: ${error.message}`);
    }
  }

  /**
   * Reload PM2 process (zero-downtime restart)
   * @param {string} processName - PM2 process name
   */
  async reloadProcess(processName) {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync(`pm2 reload ${processName}`);
      logger.info(`[PM2Manager] Reloaded process: ${processName}`);
      return { success: true, message: `Process ${processName} reloaded`, output: stdout };
    } catch (error) {
      logger.error(`[PM2Manager] Failed to reload ${processName}:`, error);
      throw new Error(`Failed to reload process ${processName}: ${error.message}`);
    }
  }

  /**
   * Get logs for PM2 process
   * @param {string} processName - PM2 process name
   * @param {number} lines - Number of lines to retrieve (default 100)
   */
  async getLogs(processName, lines = 100) {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync(`pm2 logs ${processName} --lines ${lines} --nostream`);
      return { success: true, logs: stdout };
    } catch (error) {
      logger.error(`[PM2Manager] Failed to get logs for ${processName}:`, error);
      throw new Error(`Failed to get logs for ${processName}`);
    }
  }

  /**
   * Flush logs for PM2 process
   * @param {string} processName - PM2 process name
   */
  async flushLogs(processName) {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync(`pm2 flush ${processName}`);
      logger.info(`[PM2Manager] Flushed logs for: ${processName}`);
      return { success: true, message: `Logs flushed for ${processName}` };
    } catch (error) {
      logger.error(`[PM2Manager] Failed to flush logs for ${processName}:`, error);
      throw new Error(`Failed to flush logs for ${processName}`);
    }
  }

  /**
   * Get real-time monitoring data (monit)
   */
  async getMonitData() {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const processes = await this.listProcesses();
      
      return processes.map(proc => ({
        name: proc.name,
        cpu: proc.cpu,
        memory: proc.memory,
        status: proc.status,
        uptime: proc.uptime
      }));
    } catch (error) {
      logger.error('[PM2Manager] Failed to get monit data:', error);
      throw new Error('Failed to get monitoring data');
    }
  }

  /**
   * Scale process (change number of instances)
   * @param {string} processName - PM2 process name
   * @param {number} instances - Number of instances
   */
  async scaleProcess(processName, instances) {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync(`pm2 scale ${processName} ${instances}`);
      logger.info(`[PM2Manager] Scaled ${processName} to ${instances} instances`);
      return { success: true, message: `Process ${processName} scaled to ${instances}` };
    } catch (error) {
      logger.error(`[PM2Manager] Failed to scale ${processName}:`, error);
      throw new Error(`Failed to scale process ${processName}`);
    }
  }

  /**
   * Reset PM2 process (restart with count reset)
   * @param {string} processName - PM2 process name
   */
  async resetProcess(processName) {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync(`pm2 reset ${processName}`);
      logger.info(`[PM2Manager] Reset process: ${processName}`);
      return { success: true, message: `Process ${processName} reset` };
    } catch (error) {
      logger.error(`[PM2Manager] Failed to reset ${processName}:`, error);
      throw new Error(`Failed to reset process ${processName}`);
    }
  }

  /**
   * Delete PM2 process from list
   * @param {string} processName - PM2 process name
   */
  async deleteProcess(processName) {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync(`pm2 delete ${processName}`);
      logger.info(`[PM2Manager] Deleted process: ${processName}`);
      return { success: true, message: `Process ${processName} deleted` };
    } catch (error) {
      logger.error(`[PM2Manager] Failed to delete ${processName}:`, error);
      throw new Error(`Failed to delete process ${processName}`);
    }
  }

  /**
   * Save PM2 process list (persist across reboots)
   */
  async save() {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      await execAsync('pm2 save');
      logger.info('[PM2Manager] PM2 list saved');
      return { success: true, message: 'PM2 list saved' };
    } catch (error) {
      logger.error('[PM2Manager] Failed to save PM2 list:', error);
      throw new Error('Failed to save PM2 list');
    }
  }

  /**
   * Get PM2 startup script
   */
  async getStartupScript() {
    if (!this.pm2Available) {
      throw new Error('PM2 not available');
    }

    try {
      const { stdout } = await execAsync('pm2 startup');
      return { success: true, script: stdout };
    } catch (error) {
      logger.error('[PM2Manager] Failed to get startup script:', error);
      throw new Error('Failed to get PM2 startup script');
    }
  }
}

module.exports = new PM2Manager();


module.exports = {
  apps: [
    {
      name: 'lekhika-worker',
      script: 'server.js',
      cwd: '/home/lekhika.online/vps-worker',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      log_file: '/home/lekhika.online/vps-worker/logs/lekhika-worker.log',
      out_file: '/home/lekhika.online/vps-worker/logs/lekhika-worker-out.log',
      error_file: '/home/lekhika.online/vps-worker/logs/lekhika-worker-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '3G', // Increased from 1G to prevent restarts during long-running executions
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      name: 'lekhika-queue-worker',
      script: 'queueWorker.js',
      cwd: '/home/lekhika.online/vps-worker',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_file: '/home/lekhika.online/vps-worker/logs/lekhika-queue-worker.log',
      out_file: '/home/lekhika.online/vps-worker/logs/lekhika-queue-worker-out.log',
      error_file: '/home/lekhika.online/vps-worker/logs/lekhika-queue-worker-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      kill_timeout: 5000,
      wait_ready: false
    }
  ]
};

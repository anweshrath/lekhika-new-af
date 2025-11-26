# Lekhika VPS Worker - Deployment Guide

## Overview
This is the VPS execution worker for Lekhika AI Book Generation. It handles real AI API calls, workflow execution, and book compilation.

## Architecture
```
User App → Supabase Edge Functions → VPS Worker (app.lekhika.online:3001) → AI APIs
```

## Prerequisites
- Ubuntu server with CyberPanel
- SSH access
- Domain configured (app.lekhika.online)

## Quick Deployment

### 1. Upload Files to VPS
```bash
# Upload the entire vps-worker directory to your VPS
scp -r vps-worker/ lekhi7866@157.254.24.49:/home/lekhi7866/
```

### 2. SSH into VPS
```bash
ssh lekhi7866@157.254.24.49
```

### 3. Run Deployment Script
```bash
cd /home/lekhi7866/vps-worker
chmod +x deploy.sh
./deploy.sh
```

### 4. Configure Environment
```bash
# Edit the .env file with your actual values
nano .env
```

Required environment variables:
```env
# Server Configuration
PORT=3001
NODE_ENV=production
WORKER_ID=lekhika-vps-worker-001

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider API Keys
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key

# Security
API_SECRET_KEY=your-secure-api-secret
ALLOWED_ORIGINS=https://app.lekhika.online,https://app.copyalche.my
```

### 5. Restart Worker
```bash
pm2 restart lekhika-worker
```

## Manual Setup (Alternative)

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PM2
```bash
sudo npm install -g pm2
```

### Install Dependencies
```bash
cd /home/lekhi7866/vps-worker
npm install
```

### Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Configuration

### CyberPanel Domain Setup
1. Create subdomain `app.lekhika.online`
2. Point to your server IP: `157.254.24.49`
3. Configure reverse proxy to port 3001

### Firewall Configuration
```bash
sudo ufw allow 3001/tcp
sudo ufw --force enable
```

## Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Test Execution
```bash
curl -X POST http://localhost:3001/execute \
  -H "Content-Type: application/json" \
  -d '{
    "executionId": "test-001",
    "workflow": {
      "nodes": [{"id": "1", "type": "input", "data": {"field": "topic"}}],
      "edges": [],
      "models": []
    },
    "inputs": {"topic": "AI and Machine Learning"},
    "userId": "test-user"
  }'
```

## Monitoring

### PM2 Commands
```bash
pm2 status                    # Check status
pm2 logs lekhika-worker       # View logs
pm2 restart lekhika-worker    # Restart
pm2 stop lekhika-worker       # Stop
pm2 monit                     # Monitor
```

### Log Files
- Application logs: `/var/log/lekhika-worker.log`
- Error logs: `/var/log/lekhika-worker-error.log`
- PM2 logs: `~/.pm2/logs/`

## Troubleshooting

### Common Issues

1. **Port 3001 not accessible**
   ```bash
   sudo ufw allow 3001/tcp
   sudo ufw reload
   ```

2. **Node.js not found**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **PM2 not starting**
   ```bash
   pm2 delete lekhika-worker
   pm2 start ecosystem.config.js
   ```

4. **Permission issues**
   ```bash
   sudo chown -R $(whoami):$(whoami) /home/$(whoami)/lekhika-worker
   ```

### Debug Mode
```bash
# Run in development mode
NODE_ENV=development pm2 start server.js --name lekhika-worker-dev
pm2 logs lekhika-worker-dev
```

## Security Considerations

1. **API Keys**: Store securely in .env file
2. **Firewall**: Only allow necessary ports
3. **SSL**: Configure HTTPS for production
4. **Monitoring**: Set up log monitoring
5. **Backups**: Regular backup of configuration

## Performance Tuning

### PM2 Configuration
- Adjust `max_memory_restart` based on server RAM
- Set `instances` to number of CPU cores
- Configure `restart_delay` for stability

### Node.js Optimization
- Use `NODE_ENV=production`
- Enable clustering for multiple instances
- Monitor memory usage

## Support

For issues or questions:
1. Check logs: `pm2 logs lekhika-worker`
2. Verify configuration: `pm2 show lekhika-worker`
3. Test connectivity: `curl http://localhost:3001/health`
4. Check system resources: `htop` or `top`

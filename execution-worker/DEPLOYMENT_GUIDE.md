# Lekhika Execution Worker - VPS Deployment Guide

## Prerequisites
- Ubuntu/Debian VPS (tested on Ubuntu 20.04+)
- SSH access
- Sudo privileges
- At least 1GB RAM
- Port 3001 available

## Quick Deployment

### Step 1: Prepare Files Locally
```bash
# Create deployment package
cd execution-worker
tar -czf lekhika-worker.tar.gz server.js package.json .env ecosystem.config.js deploy-to-vps.sh

# Also need to include src directory from project root
cd ..
tar -czf src.tar.gz src/
```

### Step 2: Upload to VPS
```bash
# Replace with your VPS IP/hostname
export VPS_HOST="your.vps.ip"
export VPS_USER="root"  # or your username

# Upload files
scp execution-worker/lekhika-worker.tar.gz ${VPS_USER}@${VPS_HOST}:~
scp src.tar.gz ${VPS_USER}@${VPS_HOST}:~
```

### Step 3: SSH to VPS and Deploy
```bash
# SSH to VPS
ssh ${VPS_USER}@${VPS_HOST}

# Create worker directory
sudo mkdir -p /var/www/lekhika-worker
sudo chown -R $USER:$USER /var/www/lekhika-worker
cd /var/www/lekhika-worker

# Extract files
tar -xzf ~/lekhika-worker.tar.gz
tar -xzf ~/src.tar.gz

# Make deploy script executable
chmod +x deploy-to-vps.sh

# Run deployment script
./deploy-to-vps.sh
```

## Manual Deployment (if script fails)

### 1. Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should be v20.x
```

### 2. Install PM2
```bash
sudo npm install -g pm2
pm2 --version
```

### 3. Setup Worker Directory
```bash
sudo mkdir -p /var/www/lekhika-worker
sudo chown -R $USER:$USER /var/www/lekhika-worker
cd /var/www/lekhika-worker
```

### 4. Create .env File
```bash
cat > .env << 'EOF'
SUPABASE_URL=https://oglmncodldqiafmxpwdw.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
INTERNAL_API_SECRET=lekhika-worker-secret-2025
PORT=3001
EOF
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Start with PM2
```bash
# Create logs directory
mkdir -p logs

# Start worker
pm2 start ecosystem.config.js

# Or use command line:
pm2 start server.js --name lekhika-worker --time

# Save PM2 config
pm2 save

# Setup auto-start on reboot
pm2 startup
# Copy and run the command it outputs
```

### 7. Configure Firewall
```bash
# Allow port 3001
sudo ufw allow 3001/tcp
sudo ufw reload
```

### 8. Test Worker
```bash
# Local test
curl http://localhost:3001/health

# External test (replace with your VPS IP)
curl http://YOUR_VPS_IP:3001/health
```

## Optional: Nginx Reverse Proxy

If you want to use a domain instead of IP:port

### 1. Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/lekhika-worker
```

```nginx
server {
    listen 80;
    server_name worker.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Important for long-running requests
        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

### 2. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/lekhika-worker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Add SSL (Optional)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d worker.yourdomain.com
```

## Update Supabase Edge Function

Once worker is deployed, update Edge Function environment variables:

```bash
# In Supabase Dashboard → Edge Functions → engines-api → Settings
EXECUTION_WORKER_URL=http://YOUR_VPS_IP:3001
# OR if using domain:
EXECUTION_WORKER_URL=https://worker.yourdomain.com

INTERNAL_API_SECRET=lekhika-worker-secret-2025
```

Then redeploy Edge Function:
```bash
cd /path/to/lekhika_4_8lwy03
npx supabase functions deploy engines-api --no-verify-jwt
```

## Monitoring & Maintenance

### PM2 Commands
```bash
pm2 status                    # Check status
pm2 logs lekhika-worker       # View logs
pm2 logs lekhika-worker --lines 100  # Last 100 lines
pm2 restart lekhika-worker    # Restart
pm2 stop lekhika-worker       # Stop
pm2 delete lekhika-worker     # Remove from PM2
pm2 monit                     # Real-time monitoring
```

### Check Worker Health
```bash
curl http://localhost:3001/health
```

### View System Resources
```bash
pm2 monit
# Or
htop
```

### Logs Location
- PM2 logs: `/var/www/lekhika-worker/logs/`
- System logs: `pm2 logs lekhika-worker`

## Troubleshooting

### Worker won't start
```bash
# Check logs
pm2 logs lekhika-worker --err

# Check .env file
cat /var/www/lekhika-worker/.env

# Test manually
cd /var/www/lekhika-worker
node server.js
```

### Port 3001 already in use
```bash
# Find what's using port 3001
sudo lsof -i :3001
# Or
sudo netstat -tulpn | grep 3001

# Kill the process
sudo kill -9 PID
```

### Cannot reach worker from outside
```bash
# Check firewall
sudo ufw status

# Allow port
sudo ufw allow 3001/tcp

# Check if worker is listening on all interfaces
sudo netstat -tulpn | grep 3001
# Should show 0.0.0.0:3001 or :::3001
```

### Out of Memory
```bash
# Increase PM2 memory limit
pm2 stop lekhika-worker
pm2 start server.js --name lekhika-worker --max-memory-restart 2G
pm2 save
```

## Security Recommendations

1. **Firewall**: Only allow necessary ports
2. **Internal Secret**: Use strong random string for INTERNAL_API_SECRET
3. **SSL**: Use Nginx + Let's Encrypt for HTTPS
4. **Rate Limiting**: Add rate limiting in Nginx
5. **Monitoring**: Setup alerting for worker downtime

## Need Help?

Check worker status: `pm2 status`
View logs: `pm2 logs lekhika-worker`
Restart: `pm2 restart lekhika-worker`


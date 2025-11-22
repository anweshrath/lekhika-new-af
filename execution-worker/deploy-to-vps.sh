#!/bin/bash

# Lekhika Execution Worker - VPS Deployment Script
# Run this script on your VPS after uploading the files

set -e  # Exit on error

echo "🚀 Starting Lekhika Worker Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
WORKER_DIR="/var/www/lekhika-worker"
NODE_VERSION="20"  # LTS version

echo -e "${YELLOW}📦 Step 1: Installing system dependencies...${NC}"

# Update system
sudo apt-get update

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 already installed: $(pm2 --version)"
fi

# Install nginx if not present (optional, for reverse proxy)
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt-get install -y nginx
else
    echo "✅ Nginx already installed"
fi

echo -e "${YELLOW}📁 Step 2: Setting up worker directory...${NC}"

# Create worker directory
sudo mkdir -p ${WORKER_DIR}
sudo chown -R $USER:$USER ${WORKER_DIR}

echo -e "${YELLOW}⚠️  Step 3: Copy files to ${WORKER_DIR}${NC}"
echo "You need to upload these files to ${WORKER_DIR}:"
echo "  - server.js"
echo "  - package.json"
echo "  - .env"
echo ""
echo "Upload the entire 'src' directory from your project root to ${WORKER_DIR}/"
echo ""
read -p "Press Enter once you've uploaded the files..."

echo -e "${YELLOW}📦 Step 4: Installing Node.js dependencies...${NC}"
cd ${WORKER_DIR}
npm install

echo -e "${YELLOW}🔧 Step 5: Configuring PM2...${NC}"

# Stop any existing worker process
pm2 delete lekhika-worker 2>/dev/null || true

# Start the worker with PM2
pm2 start server.js \
  --name lekhika-worker \
  --time \
  --max-memory-restart 1G \
  --log ${WORKER_DIR}/logs/worker.log \
  --error ${WORKER_DIR}/logs/error.log

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup | tail -n 1 | sudo bash

echo -e "${YELLOW}🔥 Step 6: Configuring firewall...${NC}"

# Allow port 3001 through firewall
sudo ufw allow 3001/tcp 2>/dev/null || echo "UFW not enabled, skipping..."

echo -e "${YELLOW}🌐 Step 7: Testing worker...${NC}"

# Wait for worker to start
sleep 3

# Test health endpoint
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Worker is running successfully!${NC}"
    echo ""
    echo "Worker URL: http://$(curl -s ifconfig.me):3001"
    echo ""
    echo "Health check: http://$(curl -s ifconfig.me):3001/health"
else
    echo -e "${RED}❌ Worker failed to start. Check logs:${NC}"
    echo "pm2 logs lekhika-worker"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check worker status"
echo "  pm2 logs lekhika-worker - View logs"
echo "  pm2 restart lekhika-worker - Restart worker"
echo "  pm2 stop lekhika-worker    - Stop worker"
echo ""
echo "Next steps:"
echo "1. Test worker: curl http://YOUR_VPS_IP:3001/health"
echo "2. Update Supabase Edge Function env vars:"
echo "   EXECUTION_WORKER_URL=http://YOUR_VPS_IP:3001"
echo "   INTERNAL_API_SECRET=lekhika-worker-secret-2025"


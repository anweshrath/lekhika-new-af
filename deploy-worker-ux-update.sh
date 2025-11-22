#!/bin/bash

# Lekhika Worker UX Overhaul Deployment Script
# This script deploys the enhanced executionService.js to the VPS worker

echo "🚀 Lekhika Worker UX Overhaul Deployment"
echo "========================================"
echo ""

# Configuration
VPS_IP="157.254.24.49"
VPS_USER="root"
VPS_PASSWORD="3edcCDE#Amitesh123"
WORKER_PATH="/root/lekhika-worker"
LOCAL_FILE="vps-worker/services/workflowExecutionService.js"

echo "📋 Deployment Details:"
echo "  VPS: $VPS_IP"
echo "  User: $VPS_USER"
echo "  Worker Path: $WORKER_PATH"
echo "  File: $LOCAL_FILE"
echo ""

# Check if local file exists
if [ ! -f "$LOCAL_FILE" ]; then
    echo "❌ Error: Local file $LOCAL_FILE not found!"
    exit 1
fi

echo "✅ Local file found: $LOCAL_FILE"
echo ""

echo "📤 Step 1: Backing up existing file on VPS..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << 'EOF'
    if [ -f /root/lekhika-worker/services/workflowExecutionService.js ]; then
        cp /root/lekhika-worker/services/workflowExecutionService.js /root/lekhika-worker/services/workflowExecutionService.js.backup-$(date +%Y%m%d-%H%M%S)
        echo "✅ Backup created"
    else
        echo "⚠️ No existing file to backup"
    fi
EOF

echo ""
echo "📤 Step 2: Uploading new workflowExecutionService.js..."
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no "$LOCAL_FILE" "$VPS_USER@$VPS_IP:$WORKER_PATH/services/"

if [ $? -eq 0 ]; then
    echo "✅ File uploaded successfully"
else
    echo "❌ Upload failed!"
    exit 1
fi

echo ""
echo "🔄 Step 3: Restarting PM2 worker process..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << 'EOF'
    cd /root/lekhika-worker
    pm2 restart lekhika-worker
    sleep 2
    echo "✅ Worker restarted"
EOF

echo ""
echo "📊 Step 4: Checking worker status..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << 'EOF'
    pm2 list | grep lekhika-worker
    echo ""
    echo "Recent logs:"
    pm2 logs lekhika-worker --lines 10 --nostream
EOF

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📝 Next Steps:"
echo "  1. Test workflow execution from user app"
echo "  2. Verify real-time progress updates"
echo "  3. Check worker logs: pm2 logs lekhika-worker"
echo "  4. Monitor execution data in engine_executions table"
echo ""
echo "🔍 To check logs in detail:"
echo "  ssh root@$VPS_IP"
echo "  pm2 logs lekhika-worker --lines 50"
echo ""


#!/bin/bash

# Deploy workflowExecutionService.js to VPS
# This script deploys the updated workflowExecutionService.js with chapter extraction fixes

echo "🚀 Deploying workflowExecutionService.js to VPS"
echo "==============================================="
echo ""

# Configuration
VPS_IP="157.254.24.49"
VPS_USER="lekhi7866"
VPS_PASSWORD="3edcCDE#Amitesh123"
WORKER_PATH="/home/lekhika.online/vps-worker"
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
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << EOF
    if [ -f $WORKER_PATH/services/workflowExecutionService.js ]; then
        cp $WORKER_PATH/services/workflowExecutionService.js $WORKER_PATH/services/workflowExecutionService.js.backup-\$(date +%Y%m%d-%H%M%S)
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
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << EOF
    export NVM_DIR="/home/lekhika.online/.nvm"
    [ -s "\$NVM_DIR/nvm.sh" ] && source "\$NVM_DIR/nvm.sh"
    cd $WORKER_PATH
    pm2 restart lekhika-worker
    sleep 3
    echo "✅ Worker restarted"
EOF

echo ""
echo "📊 Step 4: Checking worker status..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << EOF
    export NVM_DIR="/home/lekhika.online/.nvm"
    [ -s "\$NVM_DIR/nvm.sh" ] && source "\$NVM_DIR/nvm.sh"
    pm2 list | grep lekhika-worker
    echo ""
    echo "Recent logs:"
    pm2 logs lekhika-worker --lines 20 --nostream
EOF

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📝 Changes Deployed:"
echo "  - Chapter extraction from markdown"
echo "  - Multi-chapter splitting logic"
echo "  - Section standardization"
echo "  - Emergency fallback for empty sections"
echo ""
echo "🔍 To check logs in detail:"
echo "  ssh $VPS_USER@$VPS_IP"
echo "  pm2 logs lekhika-worker --lines 50"
echo ""


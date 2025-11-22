#!/bin/bash

# Quick Upload Script to VPS
# Usage: ./upload-to-vps.sh root@your.vps.ip

set -e

if [ -z "$1" ]; then
    echo "Usage: ./upload-to-vps.sh user@vps-ip"
    echo "Example: ./upload-to-vps.sh root@123.45.67.89"
    exit 1
fi

VPS_TARGET=$1

echo "🚀 Uploading Lekhika Worker to ${VPS_TARGET}..."

# Create temporary deployment directory
TEMP_DIR=$(mktemp -d)
echo "📦 Creating deployment package in ${TEMP_DIR}..."

# Copy worker files
cp server.js package.json .env ecosystem.config.js deploy-to-vps.sh ${TEMP_DIR}/

# Copy src directory from parent
echo "📂 Copying src directory..."
cp -r ../src ${TEMP_DIR}/

# Create archive
cd ${TEMP_DIR}
tar -czf lekhika-worker-deploy.tar.gz *

echo "📤 Uploading to VPS..."
scp lekhika-worker-deploy.tar.gz ${VPS_TARGET}:~

echo "🔧 Connecting to VPS to extract and deploy..."
ssh ${VPS_TARGET} << 'ENDSSH'
set -e

# Create worker directory
sudo mkdir -p /var/www/lekhika-worker
sudo chown -R $USER:$USER /var/www/lekhika-worker

# Extract files
cd /var/www/lekhika-worker
tar -xzf ~/lekhika-worker-deploy.tar.gz

# Make deploy script executable
chmod +x deploy-to-vps.sh

echo ""
echo "✅ Files uploaded successfully!"
echo ""
echo "Next steps:"
echo "  1. Run: cd /var/www/lekhika-worker"
echo "  2. Run: ./deploy-to-vps.sh"
echo ""
ENDSSH

# Cleanup
rm -rf ${TEMP_DIR}

echo "🎉 Upload complete!"
echo ""
echo "Now SSH to your VPS and run:"
echo "  cd /var/www/lekhika-worker"
echo "  ./deploy-to-vps.sh"


#!/bin/bash

# Lekhika VPS Worker Deployment Script
# Run this script on your VPS to set up the execution worker

set -e

echo "🚀 Starting Lekhika VPS Worker Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use your regular user account."
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Create application directory
APP_DIR="/home/$(whoami)/lekhika-worker"
print_status "Creating application directory: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

# Copy application files (assuming they're uploaded)
print_status "Setting up application files..."

# Create necessary directories
mkdir -p logs
mkdir -p utils
mkdir -p services

# Set up environment file
print_status "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp env.example .env
    print_warning "Please edit .env file with your actual configuration values!"
    print_warning "Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AI API keys"
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Set up log directory permissions
print_status "Setting up log directory permissions..."
sudo mkdir -p /var/log
sudo chown $(whoami):$(whoami) /var/log/lekhika-worker.log 2>/dev/null || true

# Create systemd service for PM2
print_status "Setting up PM2 startup script..."
pm2 startup systemd -u $(whoami) --hp /home/$(whoami)
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $(whoami) --hp /home/$(whoami)

# Start the application with PM2
print_status "Starting Lekhika Worker with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up firewall rules
print_status "Configuring firewall..."
sudo ufw allow 3001/tcp
sudo ufw --force enable

# Display status
print_status "Deployment completed!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Next Steps:"
echo "1. Edit .env file with your actual configuration"
echo "2. Restart the worker: pm2 restart lekhika-worker"
echo "3. Check logs: pm2 logs lekhika-worker"
echo "4. Test health endpoint: curl http://localhost:3001/health"
echo ""
echo "🔧 Useful Commands:"
echo "  pm2 status                    - Check application status"
echo "  pm2 logs lekhika-worker       - View logs"
echo "  pm2 restart lekhika-worker    - Restart application"
echo "  pm2 stop lekhika-worker       - Stop application"
echo "  pm2 monit                     - Monitor application"
echo ""
print_status "Lekhika VPS Worker is ready! 🎉"

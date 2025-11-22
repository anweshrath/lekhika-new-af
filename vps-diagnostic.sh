#!/bin/bash
# Run this on VPS via SSH to diagnose worker status
# ssh lekhi7866@157.254.24.49 < vps-diagnostic.sh

echo "=== LEKHIKA WORKER DIAGNOSTIC ==="
echo ""

echo "1. Checking if Node.js is installed:"
which node && node --version || echo "❌ Node.js NOT installed"
echo ""

echo "2. Checking if PM2 is installed:"
which pm2 && pm2 --version || echo "❌ PM2 NOT installed"
echo ""

echo "3. Checking PM2 processes:"
pm2 list 2>/dev/null || echo "❌ PM2 not running or not found"
echo ""

echo "4. Checking if worker directory exists:"
ls -la /home/lekhi7866/vps-worker/ 2>/dev/null || echo "❌ vps-worker directory NOT found"
echo ""

echo "5. Checking if port 3001 is in use:"
netstat -tulpn 2>/dev/null | grep :3001 || ss -tulpn 2>/dev/null | grep :3001 || echo "❌ Nothing listening on port 3001"
echo ""

echo "6. Checking firewall status:"
ufw status 2>/dev/null || iptables -L -n 2>/dev/null | grep 3001 || echo "❌ Cannot check firewall"
echo ""

echo "7. Checking for worker process:"
ps aux | grep -i "lekhika\|worker\|node.*3001" | grep -v grep || echo "❌ No worker process found"
echo ""

echo "=== END DIAGNOSTIC ==="

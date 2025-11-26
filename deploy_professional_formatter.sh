#!/bin/bash
# Deploy professionalBookFormatter.js to VPS

cd /Users/anweshrath/Documents/Cursor/lekhika_4_8lwy03

echo "=== UPLOADING PROFESSIONALBOOKFORMATTER.JS ==="
sshpass -p '3edcCDE#Amitesh123' scp -o StrictHostKeyChecking=no \
vps-worker/services/professionalBookFormatter.js \
lekhi7866@157.254.24.49:~/vps-worker/services/ && \
echo "✔ professionalBookFormatter.js uploaded"

echo ""
echo "=== RESTARTING PM2 ==="
sshpass -p '3edcCDE#Amitesh123' ssh -o StrictHostKeyChecking=no \
lekhi7866@157.254.24.49 \
"cd ~/vps-worker && pm2 restart lekhika-worker && echo '✔ PM2 restarted'"

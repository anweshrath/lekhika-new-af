# 🚀 WORKER FILES DEPLOYMENT GUIDE

**Boss:** Always use sshpass with password to deploy worker files to production VPS

## 📋 **Standard Deployment Workflow**

### **Step 1: Upload Files**
```bash
cd /Users/anweshrath/Documents/Cursor/lekhika_4_8lwy03

# Deploy execution service
echo "=== UPLOADING EXECUTIONSERVICE.JS ===" && \
sshpass -p '3edcCDE#Amitesh123' scp -o StrictHostKeyChecking=no \
vps-worker/services/executionService.js \
lekhi7866@157.254.24.49:~/vps-worker/services/ && \
echo "✔ executionService.js uploaded"

# Deploy export service
echo "=== UPLOADING EXPORTSERVICE.JS ===" && \
sshpass -p '3edcCDE#Amitesh123' scp -o StrictHostKeyChecking=no \
vps-worker/services/exportService.js \
lekhi7866@157.254.24.49:~/vps-worker/services/ && \
echo "✔ exportService.js uploaded"

# Deploy workflow execution service
echo "=== UPLOADING WORKFLOWEXECUTIONSERVICE.JS ===" && \
sshpass -p '3edcCDE#Amitesh123' scp -o StrictHostKeyChecking=no \
vps-worker/services/workflowExecutionService.js \
lekhi7866@157.254.24.49:~/vps-worker/services/ && \
echo "✔ workflowExecutionService.js uploaded"
```

### **Step 2: Restart PM2**
```bash
echo "=== RESTARTING VPS WORKER ===" && \
sshpass -p '3edcCDE#Amitesh123' ssh -o StrictHostKeyChecking=no \
lekhi7866@157.254.24.49 \
"cd ~/vps-worker && source ~/.nvm/nvm.sh && pm2 restart all && \
echo '✔ PM2 restarted' && pm2 logs --lines 10"
```

## 🎯 **Template System Files Added**

If deploying template system changes:
```bash
# Deploy professional book formatter
echo "=== UPLOADING PROFESSIONALBOOKFORMATTER.JS ===" && \
sshpass -p '3edcCDE#Amitesh123' scp -o StrictHostKeyChecking=no \
vps-worker/services/professionalBookFormatter.js \
lekhi7866@157.254.24.49:~/vps-worker/services/ && \
echo "✔ professionalBookFormatter.js uploaded"
```

## ⚠️ **IMPORTANT RULES**

1. **ALWAYS use sshpass** - Never try plain scp/ssh without password
2. **ALWAYS use StrictHostKeyChecking=no** - Avoid interactive prompts
3. **ALWAYS restart PM2** - Changes don't apply until PM2 restarts
4. **ALWAYS check logs** - Verify deployment with pm2 logs

## 🔥 **Quick Deploy All Worker Services**

```bash
cd /Users/anweshrath/Documents/Cursor/lekhika_4_8lwy03 && \
echo "=== UPLOADING ALL WORKER SERVICES ===" && \
sshpass -p '3edcCDE#Amitesh123' scp -o StrictHostKeyChecking=no \
vps-worker/services/executionService.js \
vps-worker/services/exportService.js \
vps-worker/services/workflowExecutionService.js \
vps-worker/services/professionalBookFormatter.js \
lekhi7866@157.254.24.49:~/vps-worker/services/ && \
echo "✔ All worker services uploaded" && \
echo "=== RESTARTING PM2 ===" && \
sshpass -p '3edcCDE#Amitesh123' ssh -o StrictHostKeyChecking=no \
lekhi7866@157.254.24.49 \
"cd ~/vps-worker && source ~/.nvm/nvm.sh && pm2 restart all && \
echo '✔ PM2 restarted'"
```

## 📝 **VERIFICATION**

After deployment, check:
```bash
sshpass -p '3edcCDE#Amitesh123' ssh -o StrictHostKeyChecking=no \
lekhi7866@157.254.24.49 "pm2 logs lekhika-worker --lines 50"
```

Look for these messages:
- ✅ `📚 SURGICAL FIX: Using professionalBookFormatter for ALL formats`
- ✅ `📄 SURGICAL PDF: Using beautiful pre-formatted content`
- ✅ `📚 Template applied: [template_name]` (if templates used)

## 🚨 **IF CPU/MEMORY USAGE SPIKES**

**Stop and check:**
```bash
sshpass -p '3edcCDE#Amitesh123' ssh -o StrictHostKeyChecking=no \
lekhi7866@157.254.24.49 "pm2 monit"
```

**Restart if needed:**
```bash
sshpass -p '3edcCDE#Amitesh123' ssh -o StrictHostKeyChecking=no \
lekhi7866@157.254.24.49 "pm2 restart all --update-env"
```

---

**REMEMBER:** Boss always deploys manually because password auth required. Never assume automation will work.


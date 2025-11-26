# VPS MIGRATION HANDOFF DOCUMENT
**Date:** November 13, 2025  
**Purpose:** Complete guide for migrating Lekhika worker to new VPS  
**For:** Anwesh Rath (Boss) - Post-Sleep Reference

---

## 🎯 QUICK START (FOR WHEN YOU WAKE UP)

### What Happened Today:
1. ✅ Fixed Gemini API endpoints (full URLs, dynamic models)
2. ✅ Fixed Supabase provider loading (getSupabase implementation)
3. ✅ Fixed token debiting (adjust_user_tokens RPC calls)
4. ✅ Fixed frontend crash (removed execution_data from list queries)
5. ✅ Restored corrupted workflowExecutionService.js
6. ✅ Added Supabase env vars to PM2 config

### Current Status:
- ✅ Worker is functional and running
- ✅ All critical fixes deployed
- ⚠️ Ready for VPS migration

### What You Need to Do:
1. Read this document completely
2. Follow the migration checklist
3. Test thoroughly after migration
4. Monitor for 24-48 hours

---

## 📍 CURRENT VPS DETAILS

### Server Information
- **IP Address:** `157.254.24.49`
- **User:** `lekhi7866`
- **Password:** `3edcCDE#Amitesh123`
- **SSH Port:** 22 (default)

### Directory Structure
```
/home/lekhika.online/
└── vps-worker/
    ├── server.js
    ├── ecosystem.config.js
    ├── package.json
    ├── services/
    │   ├── workflowExecutionService.js
    │   ├── executionService.js
    │   ├── aiService.js
    │   ├── supabase.js
    │   └── ... (other services)
    ├── config/
    │   └── celebrityStyles.js
    └── logs/ (created by PM2)
```

### PM2 Configuration
- **Process Name:** `lekhika-worker`
- **Script:** `server.js`
- **Port:** 3001
- **Mode:** fork (single instance)
- **Auto-restart:** Yes (max 10 restarts)

### Environment Variables (in ecosystem.config.js)
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3001,
  SUPABASE_URL: 'https://oglmncodldqiafmxpwdw.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbG1uY29kbGRxaWFmbXhwd2R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTY4ODcxMCwiZXhwIjoyMDY3MjY0NzEwfQ.mRKrQnjnW7LXjjDUx-uFi3aWJjnbaZShH4f5RqJl9_Q'
}
```

---

## 🚀 MIGRATION STEPS

### STEP 1: PREPARE NEW VPS

#### 1.1 Server Setup
```bash
# SSH into new VPS
ssh root@NEW_VPS_IP

# Create user (if needed)
adduser lekhi7866
# Set password: 3edcCDE#Amitesh123

# Add to sudoers (if needed)
usermod -aG sudo lekhi7866

# Switch to user
su - lekhi7866
```

#### 1.2 Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18.20.8 or compatible)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18.20.8
nvm use 18.20.8
node --version  # Verify: v18.20.8

# Install PM2 globally
npm install -g pm2

# Install sshpass (for automated deployments)
sudo apt install sshpass -y
```

#### 1.3 Create Directory Structure
```bash
# Create worker directory
mkdir -p ~/vps-worker
cd ~/vps-worker
```

#### 1.4 Configure Firewall
```bash
# Allow port 3001
sudo ufw allow 3001/tcp
sudo ufw enable
sudo ufw status
```

---

### STEP 2: DEPLOY WORKER CODE

#### 2.1 Copy Files from Local
```bash
# From your local machine (in lekhika_4_8lwy03 directory)
cd /Users/anweshrath/Documents/Cursor/lekhika_4_8lwy03

# Copy entire vps-worker directory
sshpass -p '3edcCDE#Amitesh123' scp -r vps-worker/* lekhi7866@NEW_VPS_IP:/home/lekhika.online/vps-worker/
```

**OR manually:**
```bash
# Create directory structure
ssh lekhi7866@NEW_VPS_IP "mkdir -p ~/vps-worker/services ~/vps-worker/config"

# Copy files one by one
scp vps-worker/server.js lekhi7866@NEW_VPS_IP:~/vps-worker/
scp vps-worker/package.json lekhi7866@NEW_VPS_IP:~/vps-worker/
scp vps-worker/ecosystem.config.js lekhi7866@NEW_VPS_IP:~/vps-worker/
scp -r vps-worker/services/* lekhi7866@NEW_VPS_IP:~/vps-worker/services/
scp -r vps-worker/config/* lekhi7866@NEW_VPS_IP:~/vps-worker/config/
```

#### 2.2 Install NPM Dependencies
```bash
# SSH into new VPS
ssh lekhi7866@NEW_VPS_IP

# Navigate to worker directory
cd ~/vps-worker

# Install dependencies
npm install
```

#### 2.3 Verify ecosystem.config.js
```bash
# Check that ecosystem.config.js has Supabase env vars
cat ~/vps-worker/ecosystem.config.js

# Should see:
# SUPABASE_URL: 'https://oglmncodldqiafmxpwdw.supabase.co'
# SUPABASE_SERVICE_ROLE_KEY: 'eyJ...'
```

**If missing, add them:**
```bash
nano ~/vps-worker/ecosystem.config.js
# Add env vars as shown in "Environment Variables" section above
```

---

### STEP 3: START WORKER

#### 3.1 Start with PM2
```bash
cd ~/vps-worker
pm2 start ecosystem.config.js
```

#### 3.2 Verify Status
```bash
# Check PM2 status
pm2 status

# Should show:
# lekhika-worker | online | pid | 0s | 0% | 90mb

# Check logs
pm2 logs lekhika-worker --lines 50

# Should see:
# ✅ Supabase connection established
# ✅ Supabase initialized
# ✅ AI providers ready
# 🚀 Lekhika VPS Worker ready!
# 🚀 Lekhika VPS Worker running on port 3001
```

#### 3.3 Save PM2 Configuration
```bash
# Save PM2 process list (survives reboots)
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the command it outputs (usually involves sudo)
```

---

### STEP 4: VERIFY FUNCTIONALITY

#### 4.1 Test Supabase Connection
```bash
# Check logs for Supabase connection
pm2 logs lekhika-worker | grep -i supabase

# Should see:
# ✅ Supabase connection established
# ✅ Supabase initialized
```

#### 4.2 Test Provider Loading
```bash
# Check logs for provider loading
pm2 logs lekhika-worker | grep -i provider

# Should see provider names being loaded
```

#### 4.3 Test Worker Endpoint
```bash
# From local machine or new VPS
curl http://NEW_VPS_IP:3001/health

# Should return health status
```

#### 4.4 Run Small Test Execution
1. Go to frontend
2. Create a small test execution (1 chapter)
3. Verify it completes successfully
4. Check logs: `pm2 logs lekhika-worker`
5. Verify tokens debited correctly

---

### STEP 5: UPDATE FRONTEND (IF IP CHANGED)

#### 5.1 Update Worker URL
If the new VPS has a different IP, update frontend:

**File:** `src/services/` (find where worker URL is configured)

**Search for:** `157.254.24.49:3001`

**Replace with:** `NEW_VPS_IP:3001`

#### 5.2 Test Frontend Connection
1. Open frontend
2. Try to start an execution
3. Verify it connects to new worker
4. Check browser console for errors

---

## 🔍 VERIFICATION CHECKLIST

### Pre-Migration
- [ ] New VPS accessible via SSH
- [ ] Node.js v18.20.8 installed
- [ ] PM2 installed globally
- [ ] Port 3001 open in firewall
- [ ] Directory structure created

### During Migration
- [ ] All files copied successfully
- [ ] npm install completed without errors
- [ ] ecosystem.config.js has correct env vars
- [ ] PM2 started successfully
- [ ] Worker logs show "ready" status

### Post-Migration
- [ ] Supabase connection established
- [ ] Provider loading works
- [ ] Health endpoint responds
- [ ] Test execution completes
- [ ] Tokens debited correctly
- [ ] Frontend connects to new worker
- [ ] No errors in logs

### 24-Hour Monitoring
- [ ] Check logs every few hours
- [ ] Verify executions completing
- [ ] Monitor memory usage
- [ ] Check for crashes/restarts
- [ ] Verify token debiting accuracy

---

## 🐛 TROUBLESHOOTING

### Worker Won't Start

**Error:** `Missing Supabase configuration`
**Fix:** Check ecosystem.config.js has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

**Error:** `Port 3001 already in use`
**Fix:** 
```bash
# Find process using port 3001
sudo lsof -i :3001
# Kill it or change port in ecosystem.config.js
```

**Error:** `Cannot find module`
**Fix:**
```bash
cd ~/vps-worker
npm install
```

### Worker Crashes Immediately

**Check logs:**
```bash
pm2 logs lekhika-worker --err
```

**Common causes:**
- Missing env vars
- Database connection failed
- Syntax error in code
- Missing dependencies

### Provider Not Loading

**Check:**
```bash
pm2 logs lekhika-worker | grep -i "provider\|supabase"
```

**Verify:**
- Supabase connection established
- ai_providers table has active providers
- ai_model_metadata has active models
- key_name matches between tables

### Frontend Can't Connect

**Check:**
1. Worker is running: `pm2 status`
2. Port is open: `sudo ufw status`
3. Worker URL in frontend is correct
4. CORS is configured (should be in server.js)

**Test:**
```bash
curl http://NEW_VPS_IP:3001/health
```

---

## 📋 ROLLBACK PLAN

### If Migration Fails

#### Option 1: Keep Old VPS Running
- Don't shut down old VPS immediately
- Keep it running for 24-48 hours
- Switch back if needed

#### Option 2: Revert Frontend
- Change worker URL back to old IP
- Test on old VPS
- Fix issues on new VPS
- Retry migration

#### Option 3: Restore from Backup
- If you backed up old VPS files
- Restore to new VPS
- Fix any issues
- Retry

---

## 📞 CRITICAL INFORMATION

### Supabase Credentials
- **URL:** `https://oglmncodldqiafmxpwdw.supabase.co`
- **Service Role Key:** (in ecosystem.config.js, see above)

### PM2 Commands Reference
```bash
# Start worker
pm2 start ecosystem.config.js

# Stop worker
pm2 stop lekhika-worker

# Restart worker
pm2 restart lekhika-worker

# View logs
pm2 logs lekhika-worker

# View status
pm2 status

# Save configuration
pm2 save

# Delete process
pm2 delete lekhika-worker
```

### File Locations
- **Worker code:** `~/vps-worker/`
- **PM2 logs:** `~/.pm2/logs/`
- **PM2 config:** `~/.pm2/ecosystem.config.js` (saved)

---

## ✅ POST-MIGRATION TASKS

### Immediate (First Hour)
1. ✅ Verify worker is running
2. ✅ Test one small execution
3. ✅ Verify tokens debited
4. ✅ Check logs for errors
5. ✅ Verify frontend connectivity

### Short-Term (First 24 Hours)
1. ✅ Monitor logs every 2-3 hours
2. ✅ Run 2-3 test executions
3. ✅ Verify all formats generate correctly
4. ✅ Check token debiting accuracy
5. ✅ Monitor memory/CPU usage

### Long-Term (First Week)
1. ✅ Monitor execution success rate
2. ✅ Check for any recurring errors
3. ✅ Verify performance is acceptable
4. ✅ Document any issues found
5. ✅ Optimize if needed

---

## 🎯 SUCCESS CRITERIA

### Migration is Successful When:
- ✅ Worker starts without errors
- ✅ Supabase connection established
- ✅ Providers load correctly
- ✅ Test execution completes successfully
- ✅ Tokens debited correctly
- ✅ Frontend connects and works
- ✅ No errors in logs for 24 hours
- ✅ All formats generate correctly

---

## 📝 NOTES FOR BOSS

### What's Working:
- ✅ All critical fixes deployed today
- ✅ Worker is stable and functional
- ✅ Token system working
- ✅ Provider system working
- ✅ Execution pipeline working

### What to Watch:
- ⚠️ execution_data size (4.6MB+ per execution)
- ⚠️ Image generation not implemented (will fail if used)
- ⚠️ Monitor memory usage over time

### If Something Breaks:
1. Check PM2 logs first: `pm2 logs lekhika-worker`
2. Check Supabase connection
3. Verify env vars are correct
4. Check if worker is running: `pm2 status`
5. Restart if needed: `pm2 restart lekhika-worker`

---

**END OF HANDOFF DOCUMENT**

**Created:** November 13, 2025  
**For:** Anwesh Rath  
**Purpose:** VPS Migration Reference


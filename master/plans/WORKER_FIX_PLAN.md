# WORKER FIX PLAN - Complete Diagnosis

## PROBLEM SUMMARY

### What Works ✅
- Superadmin flow execution (direct browser, no API)
- Engine deployment to ai_engines table
- Engine assignment to users (user_engines table with API keys)
- User can see assigned engines and fill form

### What's Broken ❌
- User workflow execution hangs indefinitely
- VPS worker not accessible (port 3001 closed, no reverse proxy)
- Edge Function can't reach worker
- EXECUTION_WORKER_URL not configured in Supabase

## ROOT CAUSES FOUND

### Issue #1: Worker Not Running
**Evidence:**
- curl http://app.lekhika.online:3001/health → Connection refused
- Port 3001 closed/filtered
- No reverse proxy configured for /execute or /health endpoints

**Impact:** Edge Function can't contact worker, executions hang

### Issue #2: Environment Variable Missing  
**Evidence:**
- Line 290 in engines-api/index.ts: `Deno.env.get('EXECUTION_WORKER_URL') || 'http://localhost:3001'`
- Defaults to localhost (doesn't exist in Supabase cloud)

**Impact:** Even if worker was running, Edge Function doesn't know the URL

### Issue #3: Two Different Workers
**Found:**
1. `/execution-worker/` - Uses workflowExecutionService import, simpler
2. `/vps-worker/` - Full AI integrations, different payload format

**Edge Function sends payload matching vps-worker format**

## DECISION POINTS

Boss needs to choose:

### Option A: Fix VPS Worker ⚙️
**Pros:**
- You already said it's "deployed"
- Full control
- No monthly costs

**Cons:**
- Requires SSH access
- Need to configure PM2, reverse proxy, firewall
- Maintenance overhead
- Currently NOT working

**Requirements:**
1. SSH into 157.254.24.49
2. Start worker with PM2
3. Configure reverse proxy OR open port 3001
4. Set EXECUTION_WORKER_URL in Supabase

### Option B: Use Railway/Render (RECOMMENDED) 🚂
**Pros:**
- Works in 5 minutes
- No server management
- Auto-scaling
- Free tier available
- Easier to debug

**Cons:**
- ~$5/month after free tier
- External dependency

**Requirements:**
1. Deploy vps-worker to Railway
2. Get public URL
3. Set EXECUTION_WORKER_URL in Supabase

## TECHNICAL DETAILS

### What Edge Function Does (Line 296):
```typescript
fetch(`${workerUrl}/execute`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-Auth': internalSecret
  },
  body: JSON.stringify({
    executionId,
    lekhikaApiKey,
    userEngineId,
    masterEngineId,
    userId,
    workflow: { nodes, edges, models },
    inputs,
    options
  })
})
```

### What vps-worker Expects (Line 52):
```javascript
const { 
  executionId, 
  lekhikaApiKey, 
  userEngineId, 
  masterEngineId, 
  userId, 
  workflow, 
  inputs, 
  options 
} = req.body
```

✅ **MATCH** - Payload format is correct

### What execution-worker Expects (Line 67):
```javascript
const { 
  executionId, 
  engineId,  // ❌ DIFFERENT
  userId, 
  userInput, // ❌ DIFFERENT
  nodes,     // ❌ DIFFERENT
  edges,     // ❌ DIFFERENT
  models 
} = req.body
```

❌ **MISMATCH** - Wrong payload format

## CONCLUSION

**vps-worker is the correct worker to use**
**It just needs to be RUNNING and ACCESSIBLE**

## NEXT STEPS

Boss, you need to tell me:
1. Do you have SSH access to the VPS?
2. Should we go Railway route instead (easier, faster)?
3. Can you check if PM2 is running on the VPS?

Once you decide, I'll implement the complete fix.

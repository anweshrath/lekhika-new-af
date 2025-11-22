# Lekhika Execution Worker

Node.js microservice for executing Lekhika workflows with real AI generation.

## Purpose

This service handles the heavy lifting of workflow execution:
- Runs `workflowExecutionService.js` with all dependencies
- Processes AI generation, book compilation, format exports
- Called by Supabase Edge Functions via internal API
- **NO code duplication** - imports directly from parent src/

## Architecture

```
Supabase Edge Function (process-executions)
    ↓
Node.js Worker (this service)
    ↓
workflowExecutionService.js
    ↓
Real AI generation, book compilation, exports
    ↓
Return results to Edge Function
    ↓
Update Supabase database
```

## Setup

### 1. Install Dependencies
```bash
cd execution-worker
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in:
```
INTERNAL_API_SECRET=<same as Supabase Edge Function secret>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
PORT=3001
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Deploy to Railway/Render

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add environment variables in Railway dashboard

# Deploy
railway up
```

**Render:**
1. Connect GitHub repo
2. Create new Web Service
3. Build command: `cd execution-worker && npm install`
4. Start command: `cd execution-worker && npm start`
5. Add environment variables
6. Deploy

### 5. Configure Supabase Edge Function

In Supabase Dashboard → Edge Functions → Secrets:
```
EXECUTION_WORKER_URL=https://your-worker.railway.app
INTERNAL_API_SECRET=<same-secret-as-worker>
```

## API

### POST /execute

**Headers:**
```
Content-Type: application/json
X-Internal-Auth: <INTERNAL_API_SECRET>
```

**Body:**
```json
{
  "executionId": "exec_...",
  "engineId": "uuid",
  "userId": "uuid",
  "userInput": {
    "story_title": "My Book",
    "genre": "fantasy",
    "word_count": 5000
  },
  "nodes": [...],
  "edges": [...],
  "models": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_...",
    "status": "completed",
    "result": { ... },
    "output": { ... }
  }
}
```

## Security

- ✅ Internal-only (requires auth secret)
- ✅ Not exposed to public internet
- ✅ Called only by Edge Functions
- ✅ Validates all inputs
- ✅ Multi-tenant isolation enforced

## Monitoring

- Logs all executions
- Updates database with progress
- Handles errors gracefully
- Returns detailed error info for debugging


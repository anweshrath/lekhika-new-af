# Railway Deployment for Lekhika Worker

## Quick Setup (5 minutes)

### 1. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub
- Connect your GitHub account

### 2. Deploy Worker
- Click "New Project" → "Deploy from GitHub repo"
- Select your `lekhika_4_8lwy03` repository
- Railway will auto-detect it's Node.js

### 3. Set Environment Variables
In Railway dashboard, go to Variables tab and add:

```
SUPABASE_URL=https://oglmncodldqiafmxpwdw.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbG1uY29kbGRxaWFmbXhwd2R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTY4ODcxMCwiZXhwIjoyMDY3MjY0NzEwfQ.mRKrQnjnW7LXjjDUx-uFi3aWJjnbaZShH4f5RqJl9_Q
INTERNAL_API_SECRET=your-secret-key-here
NODE_ENV=production
```

### 4. Configure Build Settings
- Set **Root Directory**: `execution-worker`
- Set **Build Command**: `npm install`
- Set **Start Command**: `node server.js`

### 5. Get Worker URL
- Railway will give you a URL like: `https://your-app.railway.app`
- Copy this URL

### 6. Update Edge Function
Update your Supabase Edge Function environment variable:
```
WORKER_URL=https://your-app.railway.app
```

## Benefits
- ✅ No SSH needed
- ✅ No server management
- ✅ Auto-scaling
- ✅ Free tier available
- ✅ Easy to deploy updates

## Cost
- Free tier: 500 hours/month
- Paid: $5/month for unlimited

## Alternative: Render.com
If Railway doesn't work:
1. Go to https://render.com
2. Create Web Service
3. Connect GitHub repo
4. Set same environment variables
5. Deploy

Both are much easier than dealing with broken VPS!

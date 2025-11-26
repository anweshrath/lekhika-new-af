# LEKHIKA DEVELOPMENT GUIDE
**Complete Development Documentation**

---

## 📋 TABLE OF CONTENTS

1. [Getting Started](#getting-started)
2. [Codebase Structure](#codebase-structure)
3. [Development Workflow](#development-workflow)
4. [Key Services](#key-services)
5. [Common Patterns](#common-patterns)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## 🚀 GETTING STARTED

### Prerequisites
- Node.js 18+ and npm/pnpm
- Git
- Supabase account and project
- VPS server access (for worker deployment)
- Environment variables configured

### Initial Setup

#### Frontend Setup:
```bash
cd /path/to/lekhika_4_8lwy03
npm install
# or
pnpm install
```

#### Environment Variables (Frontend):
Create `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WORKER_URL=http://157.254.24.49:3001
```

#### Worker Setup:
```bash
cd vps-worker
npm install
```

#### Environment Variables (Worker):
Create `vps-worker/.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
WORKER_ID=lekhika-worker-1
```

### Running Locally

#### Frontend:
```bash
npm run dev
# Runs on http://localhost:5173
```

#### Worker:
```bash
cd vps-worker
node server.js
# Runs on http://localhost:3001
```

---

## 📁 CODEBASE STRUCTURE

### Root Directory Structure:
```
lekhika_4_8lwy03/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # Service layer
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── styles/            # CSS files
│   └── lib/               # Library configurations
├── vps-worker/            # Worker server
│   ├── services/          # Worker services
│   ├── config/            # Configuration files
│   ├── data/              # Data files
│   ├── utils/             # Utility functions
│   └── server.js          # Express server
├── supabase/              # Supabase migrations
├── docs/                  # Documentation
└── package.json           # Dependencies
```

### Frontend Structure (`/src/`):

#### Components (`/src/components/`):
- **UI Components**: Reusable UI elements (UltraButton, UltraCard, etc.)
- **Feature Components**: Feature-specific components (BookReader, AIWorkflowBuilder, etc.)
- **Admin Components**: SuperAdmin components (`/admin/`, `/SuperAdmin/`)
- **Layout Components**: Layout and navigation (Layout, Header, Sidebar)

#### Pages (`/src/pages/`):
- **User Pages**: Dashboard, Books, CreateBook, Profile, Settings
- **Admin Pages**: SuperAdmin dashboard, levels management
- **Auth Pages**: Login, Register, UserAuth
- **Public Pages**: Landing, Sales, Live

#### Services (`/src/services/`):
- **Core Services**: database.js, authService.js, supabaseService.js
- **AI Services**: aiEngineService.js, aiService.js, aiModelService.js
- **Book Services**: bookDownloadService.js, exportService.js
- **Other Services**: tokenManagementService.js, levelAccessService.js

#### Contexts (`/src/contexts/`):
- `AuthContext.jsx`: Authentication state
- `ThemeContext.jsx`: Theme management
- `GamificationContext.jsx`: Gamification state
- `SuperAdminContext.jsx`: SuperAdmin state
- `UserPreferencesContext.jsx`: User preferences

### Worker Structure (`/vps-worker/`):

#### Services (`/vps-worker/services/`):
- `workflowExecutionService.js`: Main execution engine (6171 lines)
- `executionService.js`: Execution management
- `aiService.js`: AI provider integration
- `exportService.js`: Format export
- `professionalBookFormatter.js`: Book formatting
- `supabase.js`: Supabase client

#### Configuration (`/vps-worker/config/`):
- `celebrityStyles.js`: Celebrity style configurations

#### Data (`/vps-worker/data/`):
- `nodePalettes.js`: Node palette definitions

---

## 🔄 DEVELOPMENT WORKFLOW

### Development Process:

1. **Feature Planning**
   - Understand requirements
   - Identify affected components
   - Plan data flow
   - Design API changes (if needed)

2. **Local Development**
   - Create feature branch
   - Implement changes
   - Test locally
   - Fix issues

3. **Testing**
   - Unit tests (if available)
   - Manual testing
   - Integration testing
   - User acceptance testing

4. **Code Review**
   - Self-review
   - Peer review (if applicable)
   - Boss approval (CRITICAL)

5. **Deployment**
   - Deploy to production
   - Monitor for issues
   - Rollback if needed

### Git Workflow:
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create pull request (if using PR workflow)
```

### Critical Rules:
1. **NEVER commit without Boss approval**
2. **NEVER push to main/master directly**
3. **ALWAYS test locally first**
4. **ALWAYS follow code conventions**
5. **ALWAYS document complex changes**

---

## 🔧 KEY SERVICES

### Frontend Services:

#### `database.js` (`/src/services/database.js`)
**Purpose**: Core database operations wrapper

**Key Methods**:
- `getBooks(userId)`: Get user's books
- `createBook(bookData)`: Create book record
- `getEngineBlueprint(engineId)`: Get engine configuration
- `getGoToEngines(userId)`: Get user's go-to engines
- `getDefaultEngines(userId)`: Get default engines

**Usage**:
```javascript
import { dbService } from '../services/database'

const books = await dbService.getBooks(user.id)
```

#### `authService.js` (`/src/services/authService.js`)
**Purpose**: Authentication and user management

**Key Methods**:
- `login(email, password)`: User login
- `register(userData)`: User registration
- `logout()`: User logout
- `getCurrentUser()`: Get current user

#### `aiEngineService.js` (`/src/services/aiEngineService.js`)
**Purpose**: AI engine management

**Key Methods**:
- `getEngines(userId)`: Get user engines
- `createEngine(engineData)`: Create engine
- `updateEngine(engineId, data)`: Update engine
- `deleteEngine(engineId)`: Delete engine

### Worker Services:

#### `workflowExecutionService.js` (`/vps-worker/services/workflowExecutionService.js`)
**Purpose**: Main workflow execution engine

**Key Methods**:
- `executeWorkflow(params)`: Execute workflow
- `resumeExecution(executionId, nodes, edges)`: Resume from checkpoint
- `processNode(node, context)`: Process individual node
- `createCheckpoint(executionId, state)`: Create checkpoint

**Usage**:
```javascript
const workflowExecutionService = require('./services/workflowExecutionService')

const result = await workflowExecutionService.executeWorkflow({
  executionId,
  userId,
  workflow,
  inputs
})
```

#### `aiService.js` (`/vps-worker/services/aiService.js`)
**Purpose**: AI provider integration

**Key Methods**:
- `generateText(prompt, options)`: Generate text
- `generateImage(prompt, options)`: Generate image
- `streamText(prompt, options)`: Stream text

**Usage**:
```javascript
const aiService = require('./services/aiService')

const result = await aiService.generateText(prompt, {
  provider: 'openai',
  model: 'gpt-4',
  temperature: 0.7
})
```

#### `exportService.js` (`/vps-worker/services/exportService.js`)
**Purpose**: Format export

**Key Methods**:
- `exportToPDF(content, options)`: Export to PDF
- `exportToDOCX(content, options)`: Export to DOCX
- `exportToHTML(content, options)`: Export to HTML

---

## 🎨 COMMON PATTERNS

### React Component Pattern:
```javascript
import React, { useState, useEffect } from 'react'
import { useUserAuth } from '../contexts/UserAuthContext'
import { dbService } from '../services/database'
import UltraCard from '../components/UltraCard'

const MyComponent = () => {
  const { user } = useUserAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const result = await dbService.getData(user.id)
      setData(result)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <UltraLoader />
  if (!data) return <div>No data</div>

  return (
    <UltraCard>
      {/* Component content */}
    </UltraCard>
  )
}

export default MyComponent
```

### Service Pattern:
```javascript
// Service file structure
class MyService {
  constructor() {
    this.supabase = getSupabase()
  }

  async getData(userId) {
    const { data, error } = await this.supabase
      .from('table_name')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  }

  async createData(data) {
    const { data: result, error } = await this.supabase
      .from('table_name')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result
  }
}

module.exports = new MyService()
```

### Error Handling Pattern:
```javascript
try {
  // Operation
  const result = await someAsyncOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  // Log error
  // Show user-friendly message
  throw new Error('User-friendly error message')
}
```

### State Management Pattern:
```javascript
// Using React Context
const { state, dispatch } = useMyContext()

// Update state
dispatch({ type: 'UPDATE_DATA', payload: newData })

// Using useState
const [state, setState] = useState(initialState)
setState(newState)
```

---

## 🧪 TESTING

### Manual Testing:
1. **Feature Testing**: Test new features end-to-end
2. **Regression Testing**: Test existing features still work
3. **Integration Testing**: Test component interactions
4. **User Acceptance Testing**: Test from user perspective

### Testing Checklist:
- [ ] Feature works as expected
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] Responsive design works
- [ ] No console errors
- [ ] No TypeScript/linting errors
- [ ] Performance is acceptable

### Testing Tools:
- Browser DevTools
- React DevTools
- Network tab for API calls
- Console for errors

---

## 🚀 DEPLOYMENT

### Frontend Deployment:

1. **Build**:
```bash
npm run build
```

2. **Deploy**:
   - Upload `dist/` folder to hosting platform
   - Update environment variables
   - Verify deployment

### Worker Deployment:

1. **SSH to VPS**:
```bash
ssh lekhika.online@157.254.24.49
```

2. **Navigate to Worker**:
```bash
cd ~/vps-worker
```

3. **Pull Latest Code** (if using git):
```bash
git pull origin main
```

4. **Install Dependencies**:
```bash
npm install
```

5. **Restart PM2**:
```bash
pm2 restart lekhika-worker
```

6. **Check Logs**:
```bash
pm2 logs lekhika-worker
```

### Deployment Checklist:
- [ ] Code tested locally
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Service restarted
- [ ] Health check passes
- [ ] Logs checked
- [ ] Feature tested in production

---

## 🔍 TROUBLESHOOTING

### Common Issues:

#### Frontend Issues:

**Issue**: Supabase connection fails
- **Check**: Environment variables set correctly
- **Check**: Supabase project is active
- **Check**: Network connectivity

**Issue**: Components not rendering
- **Check**: Console for errors
- **Check**: React DevTools
- **Check**: Import paths correct

**Issue**: API calls failing
- **Check**: Network tab for request/response
- **Check**: CORS configuration
- **Check**: Authentication tokens

#### Worker Issues:

**Issue**: Worker not responding
- **Check**: PM2 status: `pm2 status`
- **Check**: Worker logs: `pm2 logs lekhika-worker`
- **Check**: Port 3001 is open
- **Check**: Worker is running: `ps aux | grep node`

**Issue**: Execution failures
- **Check**: Worker logs for errors
- **Check**: Supabase connection
- **Check**: AI provider API keys
- **Check**: Execution data in database

**Issue**: Format export failures
- **Check**: Export service logs
- **Check**: Format-specific libraries installed
- **Check**: Content format is valid

### Debugging Tips:

1. **Check Logs**:
   - Frontend: Browser console
   - Worker: PM2 logs

2. **Check Database**:
   - Verify data in Supabase dashboard
   - Check RLS policies
   - Verify foreign key relationships

3. **Check Network**:
   - Network tab in DevTools
   - Verify API endpoints
   - Check CORS headers

4. **Check Environment**:
   - Verify environment variables
   - Check configuration files
   - Verify service connections

---

## ✅ BEST PRACTICES

### Code Quality:

1. **Follow Conventions**:
   - Use consistent naming
   - Follow React best practices
   - Use ESLint rules

2. **Code Organization**:
   - Keep components small
   - Separate concerns
   - Use proper file structure

3. **Error Handling**:
   - Always handle errors
   - Provide user-friendly messages
   - Log errors appropriately

4. **Performance**:
   - Optimize re-renders
   - Use proper React hooks
   - Lazy load when appropriate

### Security:

1. **Never Hardcode Secrets**:
   - Use environment variables
   - Never commit API keys
   - Use secure storage

2. **Validate Input**:
   - Sanitize user input
   - Validate on frontend and backend
   - Use proper data types

3. **Follow RLS Policies**:
   - Respect user data isolation
   - Test RLS policies
   - Never bypass security

### Documentation:

1. **Code Comments**:
   - Comment complex logic
   - Document function parameters
   - Explain "why" not "what"

2. **Documentation Updates**:
   - Update docs when changing features
   - Keep architecture docs current
   - Document breaking changes

### Git Practices:

1. **Commit Messages**:
   - Use clear, descriptive messages
   - Reference issues/tickets
   - Keep commits focused

2. **Branch Management**:
   - Use feature branches
   - Keep main branch stable
   - Delete merged branches

---

## 🔗 RELATED DOCUMENTS

- [LEKHIKA_TECHNICAL_ARCHITECTURE.md](./LEKHIKA_TECHNICAL_ARCHITECTURE.md) - Architecture details
- [LEKHIKA_FEATURES_AND_CAPABILITIES.md](./LEKHIKA_FEATURES_AND_CAPABILITIES.md) - Feature catalog
- [LEKHIKA_QUICK_REFERENCE.md](./LEKHIKA_QUICK_REFERENCE.md) - Quick reference

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Maintained By**: Lekhika Documentation Team






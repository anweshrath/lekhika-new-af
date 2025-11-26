# LEKHIKA TECHNICAL ARCHITECTURE
**Complete Technical Documentation**

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Structure](#api-structure)
6. [Data Flow](#data-flow)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Service Architecture](#service-architecture)
10. [Integration Points](#integration-points)

---

## 🏗️ SYSTEM OVERVIEW

Lekhika is a **three-tier architecture** consisting of:
1. **Frontend**: React-based user interface
2. **Backend**: Supabase (PostgreSQL + Edge Functions)
3. **Worker**: Node.js Express server for workflow execution

### Architecture Pattern:
- **Client-Server Architecture**: Frontend communicates with backend via REST APIs
- **Event-Driven Workflow Execution**: Worker processes workflows asynchronously
- **Multi-Tenant SaaS**: Row-Level Security (RLS) ensures data isolation
- **Microservices Pattern**: Separate services for different concerns (AI, export, formatting)

### Key Architectural Principles:
1. **NO HARDCODED DATA**: Everything from database
2. **NO LOCALSTORAGE**: Supabase only
3. **NO FAKE/MOCK SERVICES**: Real AI, real generation
4. **DYNAMIC & MODULAR**: No static values
5. **MULTI-TENANT ISOLATION**: Users can't see each other's data
6. **RLS ENABLED**: Proper security policies

---

## 🧩 ARCHITECTURE COMPONENTS

### 1. Frontend (React Application)

**Location**: `/src/`

**Technology**: 
- React 18 with Vite
- React Router for routing
- Tailwind CSS for styling
- Framer Motion for animations
- React Flow for workflow visualization

**Key Components**:
- **Pages**: User-facing pages (Dashboard, Books, CreateBook, etc.)
- **Components**: Reusable UI components
- **Services**: Frontend service layer for API calls
- **Contexts**: React contexts for state management
- **Hooks**: Custom React hooks

**Key Features**:
- Responsive design
- Dark/light theme support
- Real-time execution monitoring
- Interactive workflow builder
- Book reader with multiple formats

### 2. Backend (Supabase)

**Location**: Supabase Cloud (PostgreSQL + Edge Functions)

**Components**:
- **PostgreSQL Database**: Primary data store
- **Row-Level Security (RLS)**: Data isolation per user
- **Storage**: File storage for books and assets
- **Edge Functions**: Serverless functions for API endpoints
- **Realtime**: Real-time subscriptions (if used)

**Key Tables**:
- `users`: User accounts and authentication
- `ai_engines`: Workflow engine definitions
- `ai_flows`: Workflow templates and presets
- `engine_executions`: Execution records
- `books`: Generated book metadata
- `ai_providers`: AI provider configurations
- `ai_model_metadata`: Available AI models
- `user_token_wallets`: Token/credit management
- `level_token_policies`: Tier-based token policies

### 3. Worker (VPS Server)

**Location**: `/vps-worker/` (Production: 157.254.24.49)

**Technology**: 
- Node.js Express server
- Port 3001
- PM2 for process management

**Key Services**:
- `workflowExecutionService.js`: Main workflow execution engine
- `aiService.js`: AI provider integration
- `exportService.js`: Format export (PDF, DOCX, HTML)
- `professionalBookFormatter.js`: Book formatting
- `executionService.js`: Execution management
- `healthService.js`: Health monitoring
- `analyticsAggregator.js`: Analytics processing

**Key Features**:
- Asynchronous workflow execution
- Checkpoint/resume functionality
- Progress callbacks
- Error handling and recovery
- Logging and monitoring

---

## 💻 TECHNOLOGY STACK

### Frontend Stack:
```
React 18.2.0
├── Vite 4.4.5 (Build tool)
├── React Router 6.8.1 (Routing)
├── Tailwind CSS 3.3.0 (Styling)
├── Framer Motion 10.16.16 (Animations)
├── React Flow 11.11.4 (Workflow visualization)
├── React Hot Toast 2.4.1 (Notifications)
└── Lucide React 0.263.1 (Icons)
```

### Backend Stack:
```
Supabase
├── PostgreSQL (Database)
├── Row-Level Security (RLS)
├── Storage (File storage)
└── Edge Functions (Serverless)
```

### Worker Stack:
```
Node.js Express
├── Express (HTTP server)
├── Winston (Logging)
├── PM2 (Process management)
└── dotenv (Environment variables)
```

### AI Integration:
```
Multi-Provider Support
├── OpenAI (GPT-4, GPT-3.5, DALL-E)
├── Anthropic (Claude)
├── Google (Gemini)
├── Stability AI (Image generation)
└── Custom providers (Extensible)
```

### Export Formats:
```
Multiple Format Support
├── PDF (jsPDF, pdf-lib)
├── DOCX (docx library)
├── HTML (Custom formatter)
├── Markdown (Custom formatter)
└── EPUB (epub-gen)
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables:

#### `users`
- User accounts and authentication
- Custom JWT-based auth (NOT Supabase Auth)
- User levels/tiers
- Profile information

**Key Columns**:
- `id` (UUID, Primary Key)
- `email` (String)
- `level` (String) - User tier (Starter, Pro, Enterprise)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `ai_engines`
- Workflow engine definitions
- Node-based workflow blueprints
- Form configurations

**Key Columns**:
- `id` (UUID, Primary Key)
- `name` (String)
- `flow_config` (JSONB) - Workflow nodes and edges
- `form_config` (JSONB) - Input form definition
- `user_id` (UUID, Foreign Key)
- `is_master` (Boolean) - Master template flag

#### `ai_flows`
- Pre-built workflow templates
- Preset workflows for common use cases
- Flow metadata

**Key Columns**:
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (Text)
- `flow_key` (String) - Unique identifier
- `category` (String)
- `nodes` (JSONB)
- `edges` (JSONB)

#### `engine_executions`
- Execution records and status
- User input data
- Execution results
- Checkpoint data

**Key Columns**:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `engine_id` (UUID, Foreign Key)
- `status` (String) - pending, running, completed, failed
- `user_input` (JSONB)
- `execution_data` (JSONB)
- `checkpoint_data` (JSONB)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `books`
- Generated book metadata
- Format URLs
- Book content

**Key Columns**:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `title` (String)
- `author` (String)
- `content` (Text)
- `format_urls` (JSONB) - URLs for different formats
- `output_formats` (Array) - Available formats
- `ai_service` (String) - AI provider used
- `word_count` (Integer)
- `character_count` (Integer)
- `created_at` (Timestamp)

#### `ai_providers`
- AI provider configurations
- API keys (encrypted)
- Provider metadata

**Key Columns**:
- `id` (UUID, Primary Key)
- `name` (String) - openai, anthropic, google, etc.
- `api_key` (String, Encrypted)
- `is_active` (Boolean)
- `user_id` (UUID, Foreign Key) - For user-specific keys

#### `ai_model_metadata`
- Available AI models
- Model capabilities
- Category classification

**Key Columns**:
- `id` (UUID, Primary Key)
- `provider` (String)
- `model_id` (String)
- `name` (String)
- `category` (String) - text, image, audio, video
- `capabilities` (JSONB)
- `is_active` (Boolean)

#### `user_token_wallets`
- User token/credit balances
- Transaction history

**Key Columns**:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `balance` (Integer)
- `total_earned` (Integer)
- `total_spent` (Integer)
- `updated_at` (Timestamp)

#### `level_token_policies`
- Tier-based token policies
- Token allocation rules

**Key Columns**:
- `id` (UUID, Primary Key)
- `level` (String) - Starter, Pro, Enterprise
- `monthly_allocation` (Integer)
- `per_execution_limit` (Integer)
- `features` (JSONB)

### Relationships:

```
users (1) ──< (many) ai_engines
users (1) ──< (many) engine_executions
users (1) ──< (many) books
users (1) ──< (1) user_token_wallets
ai_engines (1) ──< (many) engine_executions
ai_providers (1) ──< (many) ai_model_metadata
```

---

## 🔌 API STRUCTURE

### Frontend → Backend (Supabase):

**Authentication**:
- Custom JWT-based authentication
- NOT using Supabase Auth
- User sessions managed via custom service

**Database Queries**:
- Direct Supabase client queries
- RLS policies enforce data isolation
- Service layer in `/src/services/`

**Key Services**:
- `database.js`: Core database operations
- `authService.js`: Authentication
- `aiEngineService.js`: Engine management
- `bookDownloadService.js`: Book retrieval
- `exportService.js`: Format export

### Frontend → Worker:

**Endpoints** (Worker: `http://157.254.24.49:3001`):

1. **POST `/execute`**
   - Start workflow execution
   - Body: `{ executionId, lekhikaApiKey, userEngineId, masterEngineId, userId, workflow, inputs, options }`
   - Returns: `{ success, executionId, result }`

2. **GET `/status/:executionId`**
   - Get execution status
   - Returns: `{ success, executionId, status }`

3. **POST `/stop/:executionId`**
   - Stop running execution
   - Returns: `{ success, message, executionId }`

4. **POST `/resume`**
   - Resume from checkpoint
   - Body: `{ executionId, nodes, edges, workflow }`
   - Returns: `{ success, executionId, result }`

5. **POST `/regenerate`**
   - Regenerate failed node
   - Body: `{ executionId, failedNode, validationError, regeneratePrompt }`
   - Returns: `{ success, executionId, attempt }`

6. **GET `/health`**
   - Health check
   - Returns: `{ status, timestamp, workerId, uptime, memory, version }`

7. **GET `/status`**
   - Worker status
   - Returns: `{ success, status, activeExecutions, maxConcurrent, capacity, uptime, memoryUsage }`

8. **GET `/logs`**
   - Recent logs
   - Query: `?limit=50`
   - Returns: `{ success, logs, count, timestamp }`

### Worker → AI Providers:

**AI Service Integration** (`vps-worker/services/aiService.js`):
- Unified interface for all AI providers
- Fetches API keys from `ai_providers` table
- Handles rate limiting, retries, error handling
- Supports: OpenAI, Anthropic, Google, Stability AI

**Methods**:
- `generateText(prompt, options)`: Text generation
- `generateImage(prompt, options)`: Image generation
- `streamText(prompt, options)`: Streaming text

---

## 🔄 DATA FLOW

### Workflow Execution Flow:

```
1. User Input
   ↓
2. Frontend: GenerateModal
   - Collects user input via form
   - Validates input
   ↓
3. Frontend: Create execution record
   - POST to Supabase: engine_executions
   - Status: "pending"
   ↓
4. Frontend: Call Worker
   - POST /execute to worker
   - Passes: executionId, workflow, inputs
   ↓
5. Worker: workflowExecutionService
   - Validates execution
   - Creates execution state
   - Starts workflow processing
   ↓
6. Worker: Process Nodes
   - For each node in workflow:
     a. Execute node (AI call, processing, etc.)
     b. Store output in execution state
     c. Pass data to next nodes via edges
     d. Update progress callback
   ↓
7. Worker: Format & Export
   - professionalBookFormatter: Format content
   - exportService: Generate formats (PDF, DOCX, HTML)
   ↓
8. Worker: Save Results
   - Update engine_executions: status="completed"
   - Create book record in books table
   - Store format URLs
   ↓
9. Frontend: Poll for Updates
   - GET /status/:executionId
   - Display progress in UserExecutionModal
   ↓
10. Frontend: Display Results
    - Show completed book
    - Provide download links
    - Allow editing/re-running
```

### Book Generation Pipeline:

```
User Input (Form Data)
  ↓
Story Requirements Node
  ↓
Story Architect Node
  ↓
Story Outliner Node
  ↓
Chapter Generator Nodes (Parallel)
  ↓
Content Compilation
  ↓
Professional Formatting
  ↓
Format Export (PDF, DOCX, HTML)
  ↓
Storage (Supabase Storage)
  ↓
Database Record (books table)
```

### Checkpoint/Resume Flow:

```
1. Execution Running
   ↓
2. Checkpoint Created
   - Save node outputs
   - Save execution state
   - Update checkpoint_data in engine_executions
   ↓
3. User Stops/Error Occurs
   - Status: "paused" or "failed"
   ↓
4. User Resumes
   - POST /resume to worker
   - Passes: executionId, nodes, edges
   ↓
5. Worker: Resume Execution
   - Load checkpoint_data
   - Continue from last completed node
   - Process remaining nodes
```

---

## 🔒 SECURITY ARCHITECTURE

### Authentication:
- **Custom JWT System**: NOT using Supabase Auth
- **API Keys**: Lekhika API keys for worker authentication
- **User Sessions**: Managed via custom service

### Authorization:
- **Row-Level Security (RLS)**: Database-level data isolation
- **User Isolation**: Users can only access their own data
- **SuperAdmin Access**: Special access for platform administration

### Data Protection:
- **Encrypted API Keys**: AI provider keys stored encrypted
- **Secure Storage**: Files stored in Supabase Storage with RLS
- **Input Sanitization**: User inputs sanitized before processing
- **Output Validation**: AI outputs validated before storage

### RLS Policies:
- **Users Table**: Users can only read/update their own record
- **Books Table**: Users can only access their own books
- **Engine Executions**: Users can only access their own executions
- **AI Engines**: Users can access their own + master templates
- **Token Wallets**: Users can only access their own wallet

### Worker Security:
- **API Key Authentication**: Worker requires Lekhika API key
- **CORS Configuration**: Configured for specific origins
- **Rate Limiting**: Prevents abuse (if implemented)
- **Error Handling**: No sensitive data in error messages

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Frontend Deployment:
- **Build Tool**: Vite
- **Output**: Static files (HTML, CSS, JS)
- **Hosting**: (To be confirmed - likely Vercel, Netlify, or similar)
- **Environment Variables**: 
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_WORKER_URL` (if used)

### Backend Deployment:
- **Platform**: Supabase Cloud
- **Database**: PostgreSQL (managed by Supabase)
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions (if used)

### Worker Deployment:
- **Server**: VPS (157.254.24.49)
- **Location**: `/home/lekhika.online/vps-worker/`
- **Process Manager**: PM2
- **Port**: 3001
- **Logs**: `/home/lekhika.online/vps-worker/logs/`
- **Environment Variables**: `.env` file with:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PORT=3001`
  - AI provider API keys (if needed)

### Deployment Process:

**Worker Deployment**:
1. SSH to VPS: `ssh lekhika.online@157.254.24.49`
2. Navigate to worker: `cd ~/vps-worker`
3. Pull latest code: `git pull` (if using git)
4. Install dependencies: `npm install`
5. Restart PM2: `pm2 restart lekhika-worker`
6. Check logs: `pm2 logs lekhika-worker`

**Frontend Deployment**:
1. Build: `npm run build`
2. Deploy static files to hosting platform
3. Update environment variables if needed

---

## 🔧 SERVICE ARCHITECTURE

### Frontend Services (`/src/services/`):

**Core Services**:
- `database.js`: Supabase database operations
- `authService.js`: Authentication and user management
- `supabaseService.js`: Supabase client wrapper

**AI Services**:
- `aiEngineService.js`: Engine CRUD operations
- `aiModelService.js`: Model management
- `aiService.js`: AI provider integration (frontend)
- `workflowExecutionService.js`: Workflow execution (frontend)

**Book Services**:
- `bookDownloadService.js`: Book retrieval and download
- `exportService.js`: Format export (frontend)
- `BookCompilationService.js`: Book compilation logic

**Other Services**:
- `tokenManagementService.js`: Token/credit management
- `levelAccessService.js`: Tier-based access control
- `formGeneratorService.js`: Dynamic form generation

### Worker Services (`/vps-worker/services/`):

**Core Services**:
- `workflowExecutionService.js`: Main execution engine (6171 lines)
- `executionService.js`: Execution management
- `aiService.js`: AI provider integration
- `supabase.js`: Supabase client for worker

**Formatting Services**:
- `professionalBookFormatter.js`: Book formatting
- `exportService.js`: Format export (PDF, DOCX, HTML)
- `typographyService.js`: Typography handling

**Supporting Services**:
- `narrativeStructureService.js`: Narrative structure
- `accentInstructionService.js`: Accent/style instructions
- `sampleAnalysisService.js`: Sample content analysis
- `bookCompilationService.js`: Book compilation
- `healthService.js`: Health monitoring
- `analyticsAggregator.js`: Analytics processing

---

## 🔗 INTEGRATION POINTS

### AI Provider Integration:
- **OpenAI**: GPT-4, GPT-3.5, DALL-E, TTS
- **Anthropic**: Claude (various models)
- **Google**: Gemini, Imagen
- **Stability AI**: Image generation
- **Extensible**: New providers can be added

### Storage Integration:
- **Supabase Storage**: Book files, images, assets
- **Bucket**: `books` (or similar)
- **RLS**: Storage policies enforce access control

### Export Integration:
- **PDF**: jsPDF, pdf-lib
- **DOCX**: docx library
- **HTML**: Custom formatter
- **Markdown**: Custom formatter
- **EPUB**: epub-gen

### Monitoring Integration:
- **PM2**: Process monitoring
- **Winston**: Logging
- **Health Endpoints**: `/health`, `/status`

---

## 🔗 RELATED DOCUMENTS

- [LEKHIKA_COMPLETE_OVERVIEW.md](./LEKHIKA_COMPLETE_OVERVIEW.md) - Business overview
- [LEKHIKA_FEATURES_AND_CAPABILITIES.md](./LEKHIKA_FEATURES_AND_CAPABILITIES.md) - Feature catalog
- [LEKHIKA_DEVELOPMENT_GUIDE.md](./LEKHIKA_DEVELOPMENT_GUIDE.md) - Development guide
- [LEKHIKA_FILE_STRUCTURE_DIAGRAM.md](./LEKHIKA_FILE_STRUCTURE_DIAGRAM.md) - File structure
- [LEKHIKA_SYSTEM_FLOW_DIAGRAMS.md](./LEKHIKA_SYSTEM_FLOW_DIAGRAMS.md) - Flow diagrams

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Maintained By**: Lekhika Documentation Team






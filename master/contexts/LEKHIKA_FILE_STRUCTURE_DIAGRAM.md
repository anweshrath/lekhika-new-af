# LEKHIKA FILE STRUCTURE DIAGRAM
**Complete Visual File Structure**

---

## 📋 TABLE OF CONTENTS

1. [Root Structure](#root-structure)
2. [Frontend Structure](#frontend-structure)
3. [Worker Structure](#worker-structure)
4. [Database Structure](#database-structure)
5. [Key File Locations](#key-file-locations)

---

## 📁 ROOT STRUCTURE

```
lekhika_4_8lwy03/
│
├── src/                          # Frontend React Application
│   ├── components/               # React Components
│   ├── pages/                    # Page Components
│   ├── services/                 # Service Layer
│   ├── contexts/                 # React Contexts
│   ├── hooks/                    # Custom Hooks
│   ├── utils/                    # Utility Functions
│   ├── styles/                   # CSS Files
│   ├── lib/                      # Library Configs
│   ├── data/                     # Data Files
│   ├── api/                      # API Configs
│   ├── App.jsx                   # Main App Component
│   ├── main.jsx                  # Entry Point
│   └── index.css                 # Global Styles
│
├── vps-worker/                   # Worker Server
│   ├── services/                 # Worker Services
│   ├── config/                   # Configuration
│   ├── data/                     # Data Files
│   ├── utils/                    # Utilities
│   ├── server.js                 # Express Server
│   ├── package.json              # Dependencies
│   └── ecosystem.config.js       # PM2 Config
│
├── supabase/                     # Supabase Migrations
│   └── migrations/               # Database Migrations
│
├── docs/                         # Documentation
│
├── package.json                  # Root Dependencies
├── vite.config.js                # Vite Configuration
├── tailwind.config.js            # Tailwind Config
└── README.md                     # Project README
```

---

## 🎨 FRONTEND STRUCTURE

### Complete Frontend Tree:

```
src/
│
├── components/                   # UI Components
│   ├── admin/                    # Admin Components
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminUsers.jsx
│   │   ├── AdminBooks.jsx
│   │   ├── AdminAnalytics.jsx
│   │   └── AdminSettings.jsx
│   │
│   ├── SuperAdmin/               # SuperAdmin Components
│   │   ├── [80+ files]
│   │   ├── SuperAdminDashboard.jsx
│   │   ├── EngineManagement.jsx
│   │   ├── FlowManagement.jsx
│   │   └── ...
│   │
│   ├── Dashboard/                 # Dashboard Components
│   │   └── ...
│   │
│   ├── ui/                       # UI Primitives
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── ...
│   │
│   ├── FormGenerator/            # Form Components
│   │   └── FormGenerator.jsx
│   │
│   ├── AchievementCard.jsx
│   ├── AIAssistant.jsx
│   ├── AIThinkingModal.jsx
│   ├── AIWorkflowBuilder.jsx
│   ├── BookCreator.jsx
│   ├── BookReader.jsx
│   ├── BookReaderModal.jsx
│   ├── ContentStudio.jsx
│   ├── Dashboard.jsx
│   ├── EngineFormModal.jsx
│   ├── GenerateModal.jsx
│   ├── Header.jsx
│   ├── Layout.jsx
│   ├── PremiumSidebar.jsx
│   ├── Sidebar.jsx
│   ├── TemplateSelector.jsx
│   ├── TokenUsageDashboard.jsx
│   ├── UltraButton.jsx
│   ├── UltraCard.jsx
│   ├── UltraInput.jsx
│   ├── UltraLoader.jsx
│   ├── UserExecutionModal.jsx
│   └── [50+ more components]
│
├── pages/                        # Page Components
│   ├── admin/                    # Admin Pages
│   │   ├── AdminAnalytics.jsx
│   │   ├── AdminBooks.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminSettings.jsx
│   │   └── AdminUsers.jsx
│   │
│   ├── SuperAdmin/               # SuperAdmin Pages
│   │   ├── SuperAdminDashboard.jsx
│   │   ├── SuperAdminLogin.jsx
│   │   ├── Levels.jsx
│   │   └── LevelManagement.jsx
│   │
│   ├── Analytics.jsx
│   ├── Billing.jsx
│   ├── Books.jsx
│   ├── BookBar.jsx
│   ├── CopyAITools.jsx
│   ├── CreateBook.jsx
│   ├── CreateBookImproved.jsx
│   ├── Dashboard.jsx
│   ├── InternalAITest.jsx
│   ├── Landing.jsx
│   ├── Live.jsx
│   ├── Login.jsx
│   ├── Profile.jsx
│   ├── Register.jsx
│   ├── Sales.jsx
│   ├── Settings.jsx
│   └── UserAuth.jsx
│
├── services/                     # Service Layer
│   ├── __tests__/                # Service Tests
│   │   └── bookRecoveryService.test.js
│   │
│   ├── quality/                  # Quality Services
│   │   └── contentValidationEngine.js
│   │
│   ├── accentInstructionService.js
│   ├── aiEngineService.js
│   ├── aiModelDiscoveryService.js
│   ├── aiModelService.js
│   ├── aiResponseValidator.js
│   ├── aiService.js
│   ├── aiServiceManager.js
│   ├── aiServiceValidator.js
│   ├── aiUsageVerifier.js
│   ├── aiValidationService.js
│   ├── alchemistDataFlow.js
│   ├── alchemistFlowService.js
│   ├── alchemistService.js
│   ├── apiKeyService.js
│   ├── authService.js
│   ├── BookCompilationService.js
│   ├── bookDownloadService.js
│   ├── bookRecoveryService.js
│   ├── claudeService.js
│   ├── conditionalLogicEngine.js
│   ├── coverService.js
│   ├── database.js              # ⭐ Core Database Service
│   ├── emailMarketingService.js
│   ├── engineAssignmentService.js
│   ├── engineDeploymentService.js
│   ├── engineFormService.js
│   ├── exportService.js
│   ├── formGeneratorService.js
│   ├── geminiService.js
│   ├── grokService.js
│   ├── humanizeService.js
│   ├── inputSetService.js
│   ├── integratedAiService.js
│   ├── levelAccessService.js
│   ├── mistralService.js
│   ├── modelSelectionService.js
│   ├── multiLlmService.js
│   ├── narrativeStructureService.js
│   ├── nodePaletteSyncService.js
│   ├── openaiService.js
│   ├── pdfProcessingService.js
│   ├── perplexityService.js
│   ├── pricingScraperService.js
│   ├── professionalBookFormatter.js
│   ├── publishingService.js
│   ├── qualityControlService.js
│   ├── quotesService.js
│   ├── sessionManager.js
│   ├── specializedAiRouter.js
│   ├── storageService.js
│   ├── supabaseService.js
│   ├── superAdminKeyService.js
│   ├── superadminService.js
│   ├── systemLoggingService.js
│   ├── templateApplicationService.js
│   ├── tokenAnalyticsService.js
│   ├── tokenCostCalculator.js
│   ├── tokenManagementService.js
│   ├── tokenPredictionService.js
│   ├── tokenRestrictionService.js
│   ├── typographyService.js
│   ├── userAuthService.js
│   ├── userTierService.js
│   └── workflowExecutionService.js
│
├── contexts/                     # React Contexts
│   ├── AuthContext.jsx
│   ├── GamificationContext.jsx
│   ├── SuperAdminContext.jsx
│   ├── ThemeContext.jsx
│   ├── UserAuthContext.jsx      # ⭐ Main Auth Context
│   └── UserPreferencesContext.jsx
│
├── hooks/                        # Custom Hooks
│   ├── useFeatureAccess.jsx
│   ├── useOptimizedSoundEffects.js
│   ├── useSoundEffects.js
│   └── useTokenWallet.jsx
│
├── utils/                        # Utility Functions
│   ├── normalizeExecutionData.js
│   ├── sanitize.js
│   └── ultraToast.js
│
├── styles/                        # CSS Files
│   ├── professionalDesignSystem.css
│   ├── themes.css
│   ├── accessibility.css
│   └── [10+ more CSS files]
│
├── lib/                          # Library Configs
│   ├── supabase.js              # ⭐ Supabase Client
│   └── pagedjs.css
│
├── data/                         # Data Files
│   ├── alchemistFrameworks.js
│   ├── alchemistPreBuiltFlows.js
│   ├── alchemistServices/
│   ├── alchemistVariables.js
│   ├── clientFlows.js
│   ├── ebookTemplates.js
│   ├── eliteDFYFlows.js
│   ├── flows/
│   ├── inputOptions.js
│   ├── nodePalettes.js
│   ├── nodeTemplates.js
│   ├── specialtyVariables.js
│   ├── testFlow.js
│   ├── testInputs.js
│   ├── ULTIMATE_MASTER_VARIABLES.js
│   └── variables.js
│
├── api/                          # API Configs
│   └── engines.js
│
├── App.jsx                       # ⭐ Main App Component
├── App.css                       # App Styles
├── main.jsx                      # ⭐ Entry Point
└── index.css                     # Global Styles
```

---

## ⚙️ WORKER STRUCTURE

### Complete Worker Tree:

```
vps-worker/
│
├── services/                     # Worker Services
│   ├── accentInstructionService.js
│   ├── aiProviders.js
│   ├── aiResponseValidator.js
│   ├── aiService.js             # ⭐ AI Provider Integration
│   ├── analyticsAggregator.js
│   ├── BookCompilationService.js
│   ├── bookPersistenceService.js
│   ├── executionService.js
│   ├── exportService.js         # ⭐ Format Export
│   ├── healthService.js
│   ├── narrativeStructureService.js
│   ├── pdfProcessingService.js
│   ├── professionalBookFormatter.js  # ⭐ Book Formatting
│   ├── providerService.js
│   ├── sampleAnalysisService.js
│   ├── sanitizeUtils.js
│   ├── sessionManager.js
│   ├── supabase.js              # ⭐ Supabase Client
│   ├── typographyService.js
│   └── workflowExecutionService.js  # ⭐ Main Execution Engine (6171 lines)
│
├── config/                       # Configuration
│   └── celebrityStyles.js
│
├── data/                         # Data Files
│   └── nodePalettes.js
│
├── utils/                        # Utilities
│   └── logger.js                 # ⭐ Logging Utility
│
├── logs/                         # Log Files (Production)
│   ├── lekhika-worker-out.log
│   └── lekhika-worker-error.log
│
├── server.js                     # ⭐ Express Server
├── package.json                  # Dependencies
├── ecosystem.config.js            # PM2 Configuration
├── deploy.sh                     # Deployment Script
└── env.example                   # Environment Variables Template
```

---

## 🗄️ DATABASE STRUCTURE

### Key Tables:

```
Supabase PostgreSQL Database
│
├── users                         # User Accounts
│   ├── id (UUID, PK)
│   ├── email
│   ├── level (Starter/Pro/Enterprise)
│   └── ...
│
├── ai_engines                    # Workflow Engines
│   ├── id (UUID, PK)
│   ├── name
│   ├── flow_config (JSONB)
│   ├── form_config (JSONB)
│   ├── user_id (FK → users)
│   └── is_master (Boolean)
│
├── ai_flows                      # Workflow Templates
│   ├── id (UUID, PK)
│   ├── name
│   ├── flow_key
│   ├── nodes (JSONB)
│   ├── edges (JSONB)
│   └── category
│
├── engine_executions            # Execution Records
│   ├── id (UUID, PK)
│   ├── user_id (FK → users)
│   ├── engine_id (FK → ai_engines)
│   ├── status
│   ├── user_input (JSONB)
│   ├── execution_data (JSONB)
│   ├── checkpoint_data (JSONB)
│   └── ...
│
├── books                        # Generated Books
│   ├── id (UUID, PK)
│   ├── user_id (FK → users)
│   ├── title
│   ├── author
│   ├── content (Text)
│   ├── format_urls (JSONB)
│   ├── output_formats (Array)
│   ├── ai_service
│   ├── word_count
│   └── ...
│
├── ai_providers                 # AI Provider Configs
│   ├── id (UUID, PK)
│   ├── name (openai/anthropic/google)
│   ├── api_key (Encrypted)
│   ├── is_active
│   └── user_id (FK → users)
│
├── ai_model_metadata            # AI Models
│   ├── id (UUID, PK)
│   ├── provider
│   ├── model_id
│   ├── name
│   ├── category (text/image/audio/video)
│   └── capabilities (JSONB)
│
├── user_token_wallets           # Token Wallets
│   ├── id (UUID, PK)
│   ├── user_id (FK → users)
│   ├── balance
│   ├── total_earned
│   └── total_spent
│
├── level_token_policies         # Tier Policies
│   ├── id (UUID, PK)
│   ├── level
│   ├── monthly_allocation
│   └── features (JSONB)
│
└── [20+ more tables]
```

---

## 📍 KEY FILE LOCATIONS

### Critical Files:

#### Frontend:
- **Entry Point**: `src/main.jsx`
- **App Component**: `src/App.jsx`
- **Database Service**: `src/services/database.js`
- **Supabase Client**: `src/lib/supabase.js`
- **Auth Context**: `src/contexts/UserAuthContext.jsx`
- **Main Pages**: `src/pages/Dashboard.jsx`, `src/pages/CreateBook.jsx`, `src/pages/Books.jsx`

#### Worker:
- **Server**: `vps-worker/server.js`
- **Execution Engine**: `vps-worker/services/workflowExecutionService.js` (6171 lines)
- **AI Service**: `vps-worker/services/aiService.js`
- **Export Service**: `vps-worker/services/exportService.js`
- **Formatter**: `vps-worker/services/professionalBookFormatter.js`
- **Supabase Client**: `vps-worker/services/supabase.js`

#### Configuration:
- **Vite Config**: `vite.config.js`
- **Tailwind Config**: `tailwind.config.js`
- **Package.json**: `package.json` (root), `vps-worker/package.json`
- **PM2 Config**: `vps-worker/ecosystem.config.js`

#### Documentation:
- **This File**: `LEKHIKA_FILE_STRUCTURE_DIAGRAM.md`
- **Overview**: `LEKHIKA_COMPLETE_OVERVIEW.md`
- **Architecture**: `LEKHIKA_TECHNICAL_ARCHITECTURE.md`
- **Features**: `LEKHIKA_FEATURES_AND_CAPABILITIES.md`
- **Development**: `LEKHIKA_DEVELOPMENT_GUIDE.md`
- **AI Instructions**: `LEKHIKA_AI_CUSTOMIZATION_INSTRUCTIONS.md`

---

## 🔗 RELATED DOCUMENTS

- [LEKHIKA_TECHNICAL_ARCHITECTURE.md](./LEKHIKA_TECHNICAL_ARCHITECTURE.md) - Architecture details
- [LEKHIKA_DEVELOPMENT_GUIDE.md](./LEKHIKA_DEVELOPMENT_GUIDE.md) - Development guide
- [LEKHIKA_UI_UX_ARCHITECTURE.md](./LEKHIKA_UI_UX_ARCHITECTURE.md) - UI/UX architecture

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Maintained By**: Lekhika Documentation Team






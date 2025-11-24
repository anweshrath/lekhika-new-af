# LEKHIKA QUICK REFERENCE
**At-a-Glance Reference Guide**

---

## 🎯 ESSENTIAL FACTS

### Product Identity:
- **Name**: Lekhika 2.0
- **Type**: AI-powered book creation platform
- **Status**: Production-ready SaaS
- **Investment**: $18 Million USD
- **Architecture**: React + Supabase + VPS Worker

### Core Value:
- **Speed**: 30 minutes vs. months
- **Cost**: 100x cheaper than ghostwriters
- **Quality**: Professional, publish-ready
- **Innovation**: Multi-AI orchestration (unique)

---

## 💎 KEY DIFFERENTIATORS

1. **Multi-AI Orchestration** - Only platform coordinating GPT-4, Claude, Gemini
2. **Node-Based Workflows** - Visual workflow builder
3. **Publish-Ready Formatting** - Professional typography, TOC, metadata
4. **Revenue-Stack Templates** - Pre-built monetization workflows
5. **AI Detection Immune** - Passes all detection tools
6. **Enterprise-Grade** - Multi-tenant, RLS, team collaboration

---

## 🏗️ ARCHITECTURE

### Three-Tier System:
- **Frontend**: React 18 (Vite) - `/src/`
- **Backend**: Supabase (PostgreSQL) - Cloud
- **Worker**: Node.js Express - `/vps-worker/` (157.254.24.49:3001)

### Key Technologies:
- React, Tailwind CSS, Framer Motion
- Supabase (PostgreSQL, Storage, RLS)
- Node.js, Express, PM2
- Multi-AI providers (OpenAI, Anthropic, Google)

---

## 📊 KEY METRICS

- **Books Created**: Tracked per user
- **Success Rate**: 97.3%
- **User Revenue**: $2.8M+ generated
- **Execution Time**: ~30 minutes per book
- **Formats**: PDF, DOCX, HTML, Markdown, EPUB

---

## 🔑 KEY FILES

### Frontend:
- `src/main.jsx` - Entry point
- `src/App.jsx` - Main app
- `src/services/database.js` - Database service
- `src/lib/supabase.js` - Supabase client
- `src/pages/Dashboard.jsx` - Dashboard
- `src/pages/CreateBook.jsx` - Book creation

### Worker:
- `vps-worker/server.js` - Express server
- `vps-worker/services/workflowExecutionService.js` - Execution engine (6171 lines)
- `vps-worker/services/aiService.js` - AI integration
- `vps-worker/services/exportService.js` - Format export
- `vps-worker/services/professionalBookFormatter.js` - Formatting

---

## 🗄️ DATABASE TABLES

### Core Tables:
- `users` - User accounts
- `ai_engines` - Workflow engines
- `ai_flows` - Workflow templates
- `engine_executions` - Execution records
- `books` - Generated books
- `ai_providers` - AI provider configs
- `ai_model_metadata` - AI models
- `user_token_wallets` - Token management

---

## 🚀 QUICK COMMANDS

### Development:
```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production

# Worker
cd vps-worker
node server.js       # Start worker
pm2 restart lekhika-worker  # Restart PM2
```

### Deployment:
```bash
# Worker Deployment
ssh lekhika.online@157.254.24.49
cd ~/vps-worker
git pull
npm install
pm2 restart lekhika-worker
pm2 logs lekhika-worker
```

---

## 📋 COMMON QUESTIONS

### Q: What is Lekhika?
**A**: AI-powered platform that generates complete, publish-ready books in 30 minutes using multi-AI orchestration.

### Q: How does it work?
**A**: Users fill a form → Lekhika orchestrates multiple AIs through node-based workflows → Generates professional book → Exports to multiple formats.

### Q: What formats are supported?
**A**: PDF, DOCX, HTML, Markdown, EPUB - all with professional formatting.

### Q: How much does it cost?
**A**: Subscription-based: Starter (~$29-49/mo), Pro (~$99-149/mo), Enterprise (~$499-999/mo).

### Q: What makes it different?
**A**: Only platform with multi-AI orchestration (GPT-4, Claude, Gemini working together) + publish-ready formatting + revenue-stack templates.

---

## 🎯 TARGET MARKETS

1. **Individual Authors** - Create books quickly and affordably
2. **Entrepreneurs** - Generate marketing content, lead magnets
3. **Content Agencies** - White-label content creation
4. **Enterprise Teams** - Scalable content production
5. **Educators** - Course materials, training guides

---

## 💰 PRICING TIERS

- **Starter**: Basic features, limited usage
- **Pro**: Advanced features, higher limits
- **Enterprise**: Full features, unlimited, team collaboration

---

## 🔗 API ENDPOINTS

### Worker Endpoints (157.254.24.49:3001):
- `POST /execute` - Start execution
- `GET /status/:executionId` - Get status
- `POST /stop/:executionId` - Stop execution
- `POST /resume` - Resume from checkpoint
- `GET /health` - Health check
- `GET /logs` - Recent logs

---

## 🎨 FEATURES

### Core Features:
- Book generation (30 minutes)
- Multi-format export (PDF, DOCX, HTML, etc.)
- Template system
- Workflow builder
- Multi-AI orchestration
- Professional formatting
- Checkpoint/resume
- Real-time progress tracking

### Enterprise Features:
- Team collaboration
- White-label options
- API access
- Custom integrations
- Advanced security

---

## 📚 DOCUMENTATION INDEX

1. **LEKHIKA_COMPLETE_OVERVIEW.md** - Business overview
2. **LEKHIKA_TECHNICAL_ARCHITECTURE.md** - Technical details
3. **LEKHIKA_FEATURES_AND_CAPABILITIES.md** - Feature catalog
4. **LEKHIKA_DEVELOPMENT_GUIDE.md** - Development guide
5. **LEKHIKA_AI_CUSTOMIZATION_INSTRUCTIONS.md** - AI training guide
6. **LEKHIKA_FILE_STRUCTURE_DIAGRAM.md** - File structure
7. **LEKHIKA_UI_UX_ARCHITECTURE.md** - UI/UX architecture
8. **LEKHIKA_SYSTEM_FLOW_DIAGRAMS.md** - System flows
9. **LEKHIKA_QUICK_REFERENCE.md** - This document

---

## ⚠️ CRITICAL NOTES

### Security:
- Custom JWT authentication (NOT Supabase Auth)
- Row-Level Security (RLS) enabled
- Encrypted API keys
- Multi-tenant data isolation

### Architecture Principles:
- NO HARDCODED DATA - Everything from database
- NO LOCALSTORAGE - Supabase only
- NO FAKE/MOCK SERVICES - Real AI, real generation
- DYNAMIC & MODULAR - No static values

### Brand Identity:
- Premium, enterprise-grade platform
- Professional, unique brand (NO social media aesthetics)
- Results-driven, innovation-focused

---

## 🆘 TROUBLESHOOTING

### Frontend Issues:
- Check environment variables
- Check Supabase connection
- Check browser console for errors

### Worker Issues:
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs lekhika-worker`
- Check port 3001 is open
- Check Supabase connection

### Execution Issues:
- Check worker logs
- Check execution data in database
- Check AI provider API keys
- Check format export services

---

## 📞 SUPPORT RESOURCES

### Documentation:
- Complete documentation in `/docs/` and root directory
- Technical architecture guide
- Development guide
- Feature catalog

### Key Contacts:
- Boss: Anwesh Rath (Project Owner)
- System: Production-ready, actively maintained

---

## 🔄 VERSION INFO

- **Document Version**: 1.0
- **Last Updated**: 2025-01-XX
- **Platform Version**: Lekhika 2.0
- **Status**: Production

---

**Quick Reference Guide**  
**For detailed information, see full documentation files**






# LEKHIKA PROJECT CONTEXT
## Complete System Overview for AI Assistant

**Project:** Lekhika - $18 Million AI-Powered Book Creation Platform  
**Date:** January 27, 2025  
**Status:** Production-Ready Core System with Node Palette Optimization

---

## 🎯 PROJECT OVERVIEW

**Lekhika** is a sophisticated AI-powered content creation platform with dual workflow systems:
- **Main Flow System** - Complex, multi-node workflows for comprehensive content generation
- **Alchemist Flow System** - Streamlined, focused workflows for specific tasks

**Core Architecture:** Node-based visual workflow system using React Flow with Supabase backend

---

## 🏗️ SYSTEM ARCHITECTURE

### **Database Structure (Supabase)**
- **ai_flows** table: Stores workflow definitions with configurations JSONB column
- **node_palettes** table: Stores reusable node templates
- **ai_providers** table: AI service providers (name as unique constraint)
- **ai_model_metadata** table: AI model configurations
- **superadmin_users** table: Admin user management
- **All tables have 'inbx_' prefix**

### **Workflow System**
- **Node Types:** Input, Process, Condition, Preview, Output
- **Data Flow:** Each node receives JSON, stores in previousNodePassover, processes with AI, combines with previous data, passes to next node
- **AI Integration:** Each node can have systemPrompt, userPrompt, and processing instructions

---

## 🎨 NODE PALETTE SYSTEM

### **Universal JSON Wrapper Architecture**
All nodes use standardized JSON format:
```json
{
  "user_input": {...ALL_INPUT_FIELDS_FROM_ANY_SOURCE...},
  "metadata": {
    "node_id": "{{NODE_ID}}", 
    "timestamp": "{{TIMESTAMP}}",
    "status": "{{STATUS}}",
    "node_type": "{{NODE_TYPE}}",
    "execution_order": "{{EXECUTION_ORDER}}"
  },
  "previous_node_data": {...ALL_DATA_FROM_PREVIOUS_NODE...},
  "current_node_output": {...WHATEVER_THIS_NODE_PRODUCES...},
  "next_node_data": {...ALL_DATA_FORWARDED_TO_NEXT_NODE...}
}
```

### **5-Step Data Preservation Workflow**
1. **RECEIVE:** JSON from previous node → store in `previousNodePassover`
2. **EXECUTE:** AI processing using systemPrompt + userPrompt + stored data
3. **GENERATE:** AI output in structured JSON
4. **COMBINE:** AI output + `previousNodePassover` → complete package
5. **PASSOVER:** Send combined JSON to next node

### **Node Categories (26 Total Nodes)**

#### **INPUT NODES (3 nodes)**
- **Universal Input** - Collects all project requirements
- **Story Input** - Specialized for fiction and narrative content
- **Business Input** - Specialized for business and professional content

#### **STRUCTURAL NODES (1 node)**
- **Book Structure** - Defines structural elements and layout

#### **PROCESS NODES (18 nodes)**

**Research & Analysis (3 nodes):**
- **Researcher** - Gathers data, facts, statistics (NO CONTENT WRITING)
- **Market Analyst** - Analyzes market trends and competitive landscape
- **Fact Checker** - Verifies information accuracy and credibility

**Creative Development (3 nodes):**
- **World Builder** - Creates fictional world foundations
- **Character Developer** - Develops character architecture
- **Plot Architect** - Designs plot structures and narrative frameworks

**Content Creation (3 nodes):**
- **Content Writer** - Writes actual book content, chapters, and narrative
- **Technical Writer** - Creates technical documentation and instructional content
- **Copywriter** - Creates persuasive and marketing-focused content

**Quality Control (3 nodes):**
- **Editor** - Refines and polishes written content
- **Quality Checker** - Validates content quality and standards
- **Proofreader** - Final review for errors and consistency

**Routing & Control (6 nodes):**
- **User Preference Router** - Routes based on user preferences
- **Content Type Router** - Routes based on content characteristics
- **Quality Gate** - Evaluates content quality and routing decisions
- **Chapter Preview** - Generates chapter previews for user review
- **Content Preview** - Generates content section previews
- **Final Preview** - Generates final preview presentations

#### **OUTPUT NODES (4 nodes)**
- **Elite Output Processor** - Multi-format publication architecture
- **Audiobook Output** - Complete audiobook production
- **Multi-Format Output** - Simultaneous multi-format generation
- **Audiobook Preview** - Generates audiobook preview samples

---

## 📋 WORKFLOW TEMPLATES

### **Current Templates (10 total)**
All templates use proper Node Palette nodes with complete configurations:

1. **Clean Test Flow** - 4 nodes (testing)
2. **EBOOK Lead Generator** - 6 nodes (marketing)
3. **FICTION Novel Generator** - 7 nodes (fiction)
4. **NON-FICTION Authority Builder** - 7 nodes (business)
5. **TEXTBOOK Academic Generator** - 6 nodes (education)
6. **TECHNICAL Manual Generator** - 6 nodes (technical)
7. **WHITE PAPER B2B Generator** - 6 nodes (business)
8. **BIOGRAPHY Memoir Generator** - 7 nodes (biography)
9. **SELF-HELP Personal Development** - 7 nodes (self-help)
10. **LEAD GEN Ebook Generator** - 6 nodes (marketing)

### **Deleted Templates (6 total)**
Recorded in `DELETED_TEMPLATES_RECORD.md` for future rebuilding:
- Technical Documentation Master
- Creative Writing Workshop
- Health & Wellness Guide
- Financial Planning Masterclass
- Productivity System Builder
- Language Learning Academy

---

## 🤖 AI INTEGRATION

### **Multi-Provider Support**
- **OpenAI** - GPT-4, GPT-4o, GPT-3.5-turbo
- **Anthropic** - Claude-3.5-Sonnet, Claude-3-Haiku
- **Google** - Gemini-Pro, Gemini-Pro-Vision
- **Mistral** - Mistral-Large, Mistral-Medium

### **Dynamic Model Loading**
- Real-time model availability from database
- Provider management with active/inactive tracking
- API key validation and secure storage

### **No Fallbacks Policy**
- System fails honestly instead of using fake content
- All AI calls are real API calls to providers
- No mock responses or simulated fallbacks

---

## 🔧 CURRENT STATUS

### **✅ What Works Perfectly**
- SuperAdmin Dashboard & Authentication
- AI Provider Integration (OpenAI, Claude, Gemini, Mistral)
- Database Architecture & RLS
- Basic workflow execution
- Node Palette System (26 nodes with elite configurations)
- Universal JSON wrapper for data flow
- 5-step data preservation workflow

### **⚠️ What Needs Optimization**
- **Node Palette Sync Issues** - UI doesn't refresh after node operations
- **Chapter Count Range Logic** - Takes highest number instead of letting AI choose within range
- **Duplicate Field Names** - Shows both "chapterCount" and "Chapter Count"
- **Book Structure Node Failure** - Database sync fails

### **❌ Critical Issues**
- **Chapter Count Range Logic** - Most critical user-facing issue
- **Node Palette UI Refresh** - User experience issue
- **Book Structure Node Sync** - Complete the node palette sync
- **Standardize Variable Names** - Clean up duplicate variables

---

## 🎯 IMMEDIATE PRIORITIES

### **Critical Fixes Needed**
1. **Fix Chapter Count Range Logic** - Update range parsing to let AI choose within range
2. **Resolve Node Palette UI Refresh** - Fix UI refresh after node operations
3. **Fix Book Structure Node** - Resolve database sync failure
4. **Standardize Variable Names** - Remove duplicate chapter count variables

### **Enhancement Opportunities**
1. **Improve Execution Modal** - Enhanced progress tracking and AI thinking display
2. **Optimize Content Generation** - Better chapter structure and formatting
3. **Enhance Error Handling** - More detailed error messages and recovery options

---

## 📊 PROJECT HEALTH SCORE

**Overall Status:** 🟡 **GOOD** (75/100)

- **Core Functionality:** ✅ 90/100
- **User Experience:** ⚠️ 60/100
- **Code Quality:** ✅ 80/100
- **Documentation:** ⚠️ 70/100
- **Testing:** ⚠️ 50/100

---

## 🚨 CRITICAL RULES & CONSTRAINTS

### **Health-Protecting Rules**
- **NEVER** change working code without explicit permission
- **NO** patchwork, band-aid solutions, or shortcuts
- **NO** hardcoded values anywhere - everything must be dynamic
- **NO** assumptions - ask questions instead of guessing
- **NO** localStorage or fake data - all data from Supabase database
- Surgical, precise fixes only - no broad patches
- Ask permission before ANY changes

### **Technical Standards**
- Use theme colors only - no hardcoded colors
- Dynamic data fetching - no static placeholders
- Professional, maintainable solutions - no corner cutting
- Database tables for everything - prefix 'inbx_' for all tables
- Standardize on 'admin' not 'owner' - terminology consistency
- Supabase exclusively - no local storage

### **Communication Rules**
- Address as "Boss" or "Sir"
- Submissive, respectful tone - no patronizing language
- Short, direct answers - no long essays
- Be fully honest and transparent - admit mistakes immediately
- Report progress and request permission before each step
- Answer ONLY what's asked - no extra commentary

---

## 🎯 WHAT THE AI SHOULD FOCUS ON

### **For Content Generation**
- Use only Node Palette nodes with proper configurations
- Follow the universal JSON wrapper format
- Ensure data preservation through the 5-step workflow
- Use real AI calls - no fallbacks or mock responses

### **For System Improvements**
- Fix the 4 critical issues listed above
- Enhance user experience without breaking existing functionality
- Maintain the elite quality of Node Palette configurations
- Ensure all changes are surgical and precise

### **For New Features**
- Build on the existing Node Palette system
- Use proper Node Palette nodes in all workflows
- Maintain the universal JSON wrapper architecture
- Follow the 5-step data preservation workflow

---

## 📁 KEY FILES

- **Node Palettes:** `src/data/nodePalettes.js` (26 elite nodes)
- **Workflow Templates:** `src/data/awesomeFlows.js` (10 complete templates)
- **Variables:** `src/data/variables.js` (Dynamic field definitions)
- **Deleted Templates Record:** `DELETED_TEMPLATES_RECORD.md`
- **Project Status:** `28th-sept-7-30-am-PROJECT_STATUS_REPORT.md`

---

**This context provides everything needed to understand, work with, and improve the Lekhika system while maintaining its elite quality and health-protecting rules.**

---

## 🔄 RECENT UPDATES (January 16, 2025)

### **VPS Worker Deployment & Edge Function Integration**

#### **✅ Completed Work:**

**1. VPS Worker Architecture:**
- **Deployed Node.js worker** to VPS (`app.lekhika.online:3001`)
- **Dynamic AI Provider Loading** - Worker loads AI providers from database, not hardcoded
- **Lekhika API Key Integration** - Each user engine has unique API key for execution
- **PM2 Process Management** - Worker runs as persistent service

**2. Edge Function Refactoring:**
- **Fixed JSON Structure** - Edge Function now sends correct data to VPS Worker:
  ```json
  {
    "executionId": "uuid",
    "lekhikaApiKey": "LEKH-2-...",
    "userEngineId": "user-engine-copy-id",
    "masterEngineId": "master-engine-id", 
    "userId": "user-uuid",
    "workflow": { "nodes": [...], "edges": [...], "models": [...] },
    "inputs": { /* dynamic user input - whatever fields they fill */ },
    "options": { /* dynamic AI parameters - temperature, tokens, etc. */ }
  }
  ```
- **Fixed API Key Extraction** - Now checks X-API-Key header first for Lekhika API key
- **Proper Authentication** - Uses Supabase anon key for Edge Function access, Lekhika API key for validation

**3. Main App Integration:**
- **Fixed Authorization Headers** - Sends both Supabase anon key and Lekhika API key
- **Dynamic Input Handling** - No hardcoded fields, accepts whatever user fills
- **Dynamic Options Handling** - No hardcoded AI parameters, uses configured values

#### **🚧 Current Issue:**

**VPS Worker Not Processing Executions:**
- ✅ Edge Function working (status 202, execution queued)
- ✅ API key validation working
- ✅ JSON structure correct
- ❌ VPS Worker not receiving/processing requests
- ❌ AI Thinking stays empty
- ❌ Execution stuck in "running" status

**Debug Status:**
- VPS Worker logs show only Node.js deprecation warnings
- No execution logs (`📥 POST /execute received` not appearing)
- Edge Function successfully calls VPS Worker but worker doesn't process

#### **🔧 Technical Architecture:**

**Execution Flow:**
1. **User fills form** → Dynamic fields (story_title, genre, chapter_count, etc.)
2. **Main App** → Sends Lekhika API key + Supabase anon key to Edge Function
3. **Edge Function** → Validates Lekhika API key, sends structured JSON to VPS Worker
4. **VPS Worker** → Should validate API key, load engine config, execute workflow
5. **Book Generation** → Uses system AI keys with user's specific engine configuration

**Key Files Modified:**
- `supabase/functions/engines-api/index.ts` - Fixed JSON structure and API key extraction
- `vps-worker/server.js` - Updated to handle new JSON structure
- `vps-worker/services/executionService.js` - Updated validation and workflow processing
- `src/components/GenerateModal.jsx` - Fixed authorization headers

#### **🎯 Next Steps:**
1. **Debug VPS Worker** - Check why execution requests aren't being processed
2. **Verify Worker Connectivity** - Ensure Edge Function can reach VPS Worker
3. **Test Execution Flow** - Complete end-to-end book generation
4. **Monitor Performance** - Ensure worker handles concurrent executions properly

#### **📊 Current Status:**
- **Core System:** ✅ 95/100 (VPS Worker deployed, Edge Function working)
- **Execution Flow:** ⚠️ 60/100 (Worker not processing requests)
- **User Experience:** ⚠️ 70/100 (Forms work, execution stuck)
- **Overall:** 🟡 **GOOD** (80/100) - Major infrastructure complete, execution debugging needed

# LEKHIKA SYSTEM FLOW DIAGRAMS
**Complete System Flow Visualizations**

---

## 📋 TABLE OF CONTENTS

1. [Workflow Execution Flow](#workflow-execution-flow)
2. [Book Generation Pipeline](#book-generation-pipeline)
3. [AI Provider Integration Flow](#ai-provider-integration-flow)
4. [User Authentication Flow](#user-authentication-flow)
5. [Data Persistence Flow](#data-persistence-flow)
6. [Export Format Flow](#export-format-flow)

---

## 🔄 WORKFLOW EXECUTION FLOW

### Complete Execution Flow:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Supabase
    participant Worker
    participant AIProviders

    User->>Frontend: Fill Form & Click Generate
    Frontend->>Supabase: Create Execution Record (status: pending)
    Supabase-->>Frontend: Execution ID
    Frontend->>Worker: POST /execute (executionId, workflow, inputs)
    Worker->>Worker: Validate Execution
    Worker->>Worker: Create Execution State
    Worker->>Worker: Process Nodes Sequentially
    
    loop For Each Node
        Worker->>AIProviders: Call AI API
        AIProviders-->>Worker: AI Response
        Worker->>Worker: Process Node Output
        Worker->>Worker: Update Execution State
        Worker->>Supabase: Update Progress (progressCallback)
        Supabase-->>Frontend: Real-time Updates (Polling)
    end
    
    Worker->>Worker: Format Content
    Worker->>Worker: Generate Export Formats
    Worker->>Supabase: Save Book Record
    Worker->>Supabase: Update Execution (status: completed)
    Worker-->>Frontend: Execution Complete
    Frontend->>User: Show Download Options
```

### Detailed Node Processing:

```mermaid
graph TD
    A[Start Execution] --> B[Load Workflow]
    B --> C[Initialize Execution State]
    C --> D[Get First Node]
    D --> E{Node Type?}
    
    E -->|Input Node| F[Collect User Input]
    E -->|AI Node| G[Call AI Provider]
    E -->|Process Node| H[Process Data]
    E -->|Output Node| I[Generate Output]
    
    F --> J[Store Output]
    G --> J
    H --> J
    I --> J
    
    J --> K[Get Next Nodes via Edges]
    K --> L{More Nodes?}
    L -->|Yes| D
    L -->|No| M[Compile Final Content]
    M --> N[Format Content]
    N --> O[Generate Exports]
    O --> P[Save to Database]
    P --> Q[Complete]
```

---

## 📚 BOOK GENERATION PIPELINE

### Complete Book Generation Flow:

```mermaid
graph LR
    A[User Input] --> B[Story Requirements Node]
    B --> C[Story Architect Node]
    C --> D[Story Outliner Node]
    D --> E[Chapter Generator Nodes]
    E --> F[Content Compilation]
    F --> G[Professional Formatting]
    G --> H[Format Export]
    H --> I[Storage]
    I --> J[Database Record]
    J --> K[User Download]
```

### Node-by-Node Breakdown:

```mermaid
graph TD
    A[User Input Form] --> B[Story Requirements]
    B -->|Requirements| C[Story Architect]
    C -->|Structure| D[Story Outliner]
    D -->|Outline| E[Chapter 1 Generator]
    D -->|Outline| F[Chapter 2 Generator]
    D -->|Outline| G[Chapter N Generator]
    E --> H[Content Compiler]
    F --> H
    G --> H
    H --> I[Professional Formatter]
    I --> J[PDF Export]
    I --> K[DOCX Export]
    I --> L[HTML Export]
    J --> M[Supabase Storage]
    K --> M
    L --> M
    M --> N[Books Table]
```

### Format Generation Flow:

```mermaid
graph TD
    A[Formatted Content] --> B{Format Type?}
    B -->|PDF| C[PDF Generator]
    B -->|DOCX| D[DOCX Generator]
    B -->|HTML| E[HTML Generator]
    B -->|Markdown| F[Markdown Generator]
    B -->|EPUB| G[EPUB Generator]
    
    C --> H[Apply Typography]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Add Metadata]
    I --> J[Add TOC]
    J --> K[Add Cover]
    K --> L[Upload to Storage]
    L --> M[Update Database]
```

---

## 🤖 AI PROVIDER INTEGRATION FLOW

### AI Service Call Flow:

```mermaid
sequenceDiagram
    participant Node
    participant AIService
    participant ProviderService
    participant Supabase
    participant OpenAI
    participant Anthropic
    participant Google

    Node->>AIService: generateText(prompt, options)
    AIService->>Supabase: Get Provider API Key
    Supabase-->>AIService: API Key
    AIService->>ProviderService: Route to Provider
    
    alt Provider: OpenAI
        ProviderService->>OpenAI: API Call
        OpenAI-->>ProviderService: Response
    else Provider: Anthropic
        ProviderService->>Anthropic: API Call
        Anthropic-->>ProviderService: Response
    else Provider: Google
        ProviderService->>Google: API Call
        Google-->>ProviderService: Response
    end
    
    ProviderService-->>AIService: Normalized Response
    AIService-->>Node: Text Output
```

### Multi-AI Orchestration:

```mermaid
graph TD
    A[Workflow Starts] --> B[Node 1: Story Requirements]
    B -->|Uses GPT-4| C[Node 2: Story Architect]
    C -->|Uses Claude| D[Node 3: Story Outliner]
    D -->|Uses Gemini| E[Node 4: Chapter Generator]
    E -->|Uses GPT-4| F[Node 5: Editor]
    F -->|Uses Claude| G[Final Compilation]
    
    style B fill:#10b981
    style C fill:#3b82f6
    style D fill:#f59e0b
    style E fill:#10b981
    style F fill:#3b82f6
```

### Provider Selection Logic:

```mermaid
graph TD
    A[Node Requires AI] --> B{Model Specified?}
    B -->|Yes| C[Use Specified Model]
    B -->|No| D{Task Type?}
    
    D -->|Research| E[Use GPT-4]
    D -->|Creative Writing| F[Use Claude]
    D -->|Analysis| G[Use Gemini]
    D -->|Image| H[Use DALL-E/Stability]
    
    C --> I[Check API Key]
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J{Key Available?}
    J -->|Yes| K[Make API Call]
    J -->|No| L[Use Fallback Provider]
    L --> K
    K --> M[Return Result]
```

---

## 🔐 USER AUTHENTICATION FLOW

### Login Flow:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthService
    participant Supabase
    participant Context

    User->>Frontend: Enter Credentials
    Frontend->>AuthService: login(email, password)
    AuthService->>Supabase: Query users table
    Supabase-->>AuthService: User Data
    AuthService->>AuthService: Verify Password
    AuthService->>AuthService: Generate JWT Token
    AuthService->>Context: Set User State
    Context->>Frontend: Update UI
    Frontend->>User: Redirect to Dashboard
```

### Registration Flow:

```mermaid
graph TD
    A[User Fills Registration Form] --> B[Validate Input]
    B --> C{Valid?}
    C -->|No| D[Show Errors]
    D --> A
    C -->|Yes| E[Check Email Exists]
    E --> F{Exists?}
    F -->|Yes| G[Show Error]
    G --> A
    F -->|No| H[Hash Password]
    H --> I[Create User Record]
    I --> J[Set Default Level]
    J --> K[Create Token Wallet]
    K --> L[Generate JWT]
    L --> M[Set Auth State]
    M --> N[Redirect to Dashboard]
```

### Protected Route Flow:

```mermaid
graph TD
    A[User Accesses Route] --> B{Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D{Has Access?}
    D -->|No| E[Show Access Denied]
    D -->|Yes| F[Load Page]
    F --> G[Check Feature Access]
    G --> H{Feature Allowed?}
    H -->|No| I[Show Upgrade Prompt]
    H -->|Yes| J[Render Page]
```

---

## 💾 DATA PERSISTENCE FLOW

### Book Creation Flow:

```mermaid
sequenceDiagram
    participant Worker
    participant Formatter
    participant Exporter
    participant Storage
    participant Database

    Worker->>Formatter: Format Content
    Formatter-->>Worker: Formatted Content
    
    Worker->>Exporter: Export to PDF
    Exporter-->>Worker: PDF Buffer
    
    Worker->>Exporter: Export to DOCX
    Exporter-->>Worker: DOCX Buffer
    
    Worker->>Exporter: Export to HTML
    Exporter-->>Worker: HTML Buffer
    
    Worker->>Storage: Upload PDF
    Storage-->>Worker: PDF URL
    
    Worker->>Storage: Upload DOCX
    Storage-->>Worker: DOCX URL
    
    Worker->>Storage: Upload HTML
    Storage-->>Worker: HTML URL
    
    Worker->>Database: Create Book Record
    Database-->>Worker: Book ID
```

### Execution State Persistence:

```mermaid
graph TD
    A[Execution Starts] --> B[Create Execution Record]
    B --> C[Status: pending]
    C --> D[Process Nodes]
    D --> E[Update Progress]
    E --> F{Checkpoint?}
    F -->|Yes| G[Save Checkpoint Data]
    F -->|No| H[Continue]
    G --> I[Update Execution Record]
    H --> J{Complete?}
    J -->|No| D
    J -->|Yes| K[Status: completed]
    K --> L[Save Final Data]
    L --> M[Create Book Record]
```

---

## 📤 EXPORT FORMAT FLOW

### Format Export Pipeline:

```mermaid
graph TD
    A[Compiled Content] --> B[Professional Formatter]
    B --> C[Apply Typography]
    C --> D[Add Structure]
    D --> E[Add Metadata]
    E --> F{Format Type?}
    
    F -->|PDF| G[PDF Generator]
    F -->|DOCX| H[DOCX Generator]
    F -->|HTML| I[HTML Generator]
    F -->|Markdown| J[Markdown Generator]
    F -->|EPUB| K[EPUB Generator]
    
    G --> L[Apply PDF Styling]
    H --> M[Apply DOCX Styling]
    I --> N[Apply HTML Styling]
    J --> O[Apply Markdown Formatting]
    K --> P[Apply EPUB Styling]
    
    L --> Q[Upload to Storage]
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    Q --> R[Get Storage URLs]
    R --> S[Update Database]
```

### Format-Specific Processing:

```mermaid
graph LR
    A[Raw Content] --> B[Format-Specific Processor]
    B --> C[PDF Processor]
    B --> D[DOCX Processor]
    B --> E[HTML Processor]
    
    C --> F[PDF Styling]
    D --> G[DOCX Styling]
    E --> H[HTML Styling]
    
    F --> I[PDF Buffer]
    G --> J[DOCX Buffer]
    H --> K[HTML String]
    
    I --> L[Storage Upload]
    J --> L
    K --> L
    
    L --> M[Format URLs]
    M --> N[Database Update]
```

---

## 🔗 RELATED DOCUMENTS

- [LEKHIKA_TECHNICAL_ARCHITECTURE.md](./LEKHIKA_TECHNICAL_ARCHITECTURE.md) - Architecture details
- [LEKHIKA_DEVELOPMENT_GUIDE.md](./LEKHIKA_DEVELOPMENT_GUIDE.md) - Development guide
- [LEKHIKA_FILE_STRUCTURE_DIAGRAM.md](./LEKHIKA_FILE_STRUCTURE_DIAGRAM.md) - File structure

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Maintained By**: Lekhika Documentation Team






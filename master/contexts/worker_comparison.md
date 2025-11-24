# Worker Comparison Analysis

## Two Different Workers Found:

### 1. execution-worker/ (Directory exists)
- Purpose: Original worker design
- Size: Small, clean implementation
- Dependencies: @supabase/supabase-js, other packages
- Main file: server.js

### 2. vps-worker/ (Directory exists) 
- Purpose: VPS-specific deployment
- Size: Larger, more features
- Dependencies: Multiple AI SDKs
- Main file: server.js
- README mentions: app.lekhika.online:3001

## Key Question:
Which worker is actually deployed to VPS?

-- UPDATE TECHNICAL PROGRAMMING MASTERY FLOW WITH PROPER INPUT FIELDS
-- Add input fields and test scenarios to make it truly DFY

UPDATE ai_flows 
SET configurations = jsonb_set(
  configurations,
  '{nodes,0,data}',
  '{
    "label": "Technical Guide Requirements",
    "description": "Collect programming language, skill level, and project specifications",
    "aiEnabled": true,
    "systemPrompt": "You are an elite Input Validation and Enhancement Specialist with deep expertise in content strategy, publishing standards, and workflow optimization. Your core mission: intelligently validate, enhance, and structure user inputs for optimal downstream processing. CAPABILITIES: Smart consistency validation, intelligent gap-filling, format standardization, conflict resolution, and professional data structuring. Apply surgical precision to ensure 100% accuracy while enhancing incomplete inputs with contextually appropriate suggestions. Flag inconsistencies immediately and resolve conflicts using industry best practices.",
    "userPrompt": "INTELLIGENT INPUT PROCESSING & VALIDATION\n\nANALYZE these user inputs with expert precision:\nUsing all the data provided to you\n\nEXECUTE these validation and enhancement tasks:\n\n1. SMART VALIDATION:\n   - Check logical consistency (genre vs style vs audience)\n   - Validate realistic word count vs chapter count ratios\n   - Flag conflicting requirements or impossible combinations\n   - Ensure all critical fields have meaningful values\n\n2. INTELLIGENT ENHANCEMENT:\n   - Fill missing optional details based on genre/type context\n   - Suggest appropriate defaults for unspecified preferences\n   - Enhance vague inputs with specific, actionable details\n   - Add industry-standard metadata where beneficial\n\n3. CONFLICT RESOLUTION:\n   - Resolve contradictory inputs using best practices\n   - Prioritize user intent over conflicting specifications\n   - Provide clear reasoning for resolution decisions\n\n4. PROFESSIONAL STRUCTURING:\n   - Format all data consistently for downstream processing\n   - Create comprehensive variable mapping\n   - Generate processing metadata and quality flags\n   - Prepare optimized data package for next workflow node\n\nOUTPUT FORMAT: Structured JSON with validated inputs, enhancements, flags, and processing instructions.",
    "inputFields": [
      {"id": 1, "name": "book_title", "type": "text", "required": true, "variable": "book_title", "placeholder": "Enter book title"},
      {"id": 2, "name": "industry_focus", "type": "select", "required": true, "variable": "industry_focus", "options": ["technology", "finance", "marketing", "healthcare", "education", "retail", "manufacturing", "consulting"], "placeholder": "Select industry"},
      {"id": 3, "name": "business_objective", "type": "textarea", "required": true, "variable": "business_objective", "placeholder": "What business problem does this solve?"},
      {"id": 4, "name": "target_audience", "type": "select", "required": true, "variable": "target_audience", "options": ["entrepreneurs", "executives", "managers", "professionals", "students", "investors"], "placeholder": "Select target audience"},
      {"id": 5, "name": "key_topics", "type": "textarea", "required": true, "variable": "key_topics", "placeholder": "List key topics to cover"},
      {"id": 6, "name": "case_studies", "type": "checkbox", "required": false, "variable": "include_case_studies", "options": ["yes"], "placeholder": "Include case studies"},
      {"id": 7, "name": "word_count", "type": "select", "required": true, "variable": "word_count", "options": ["8000-15000", "15000-25000", "25000-40000", "40000+"], "placeholder": "Select word count"},
      {"id": 8, "name": "chapter_count", "type": "select", "required": true, "variable": "chapter_count", "options": ["5", "8", "10", "12", "15"], "placeholder": "Select chapter count"},
      {"id": 9, "name": "tone", "type": "select", "required": true, "variable": "tone", "options": ["professional", "authoritative", "conversational", "academic"], "placeholder": "Select tone"}
    ],
    "outputFormat": "structured_json",
    "processingInstructions": "BUSINESS INPUT NODE PROCESSING: Validate all business inputs, format into structured JSON with proper field mapping, ensure all required fields are present, add metadata (timestamp, node_id, processing_status). OUTPUT FORMAT: { \"user_input\": {...all_business_input_fields...}, \"metadata\": {\"node_id\": \"business_input\", \"timestamp\": \"ISO_string\", \"status\": \"processed\", \"workflow_type\": \"business\"}, \"next_node_data\": {...formatted_business_data_for_next_node...} }",
    "testInputEnabled": true,
    "testInputValues": {
      "book_title": "Advanced JavaScript Programming Guide",
      "industry_focus": "technology",
      "business_objective": "Teach modern JavaScript development with real-world applications and best practices",
      "target_audience": "professionals",
      "key_topics": "ES6+, React, Node.js, Testing, Performance, Security",
      "include_case_studies": true,
      "word_count": "25000-40000",
      "chapter_count": "12",
      "tone": "professional"
    }
  }'::jsonb
)
WHERE name = 'Technical Programming Mastery' 
AND created_by = '5950cad6-810b-4c5b-9d40-4485ea249770';


SELECT 'Technical Programming Mastery flow updated with input fields and test scenarios' as status;

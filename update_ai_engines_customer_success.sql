-- Update Customer Success Playbook engine in ai_engines table with 10 Book Creation fields
UPDATE ai_engines 
SET flow_config = jsonb_set(
  flow_config, 
  '{nodes,0,data,inputFields}', 
  '[
    {"id": 1, "name": "Book Title", "type": "text", "required": true, "variable": "book_title", "placeholder": "Enter your book title", "fullWidth": false},
    {"id": 2, "name": "Author Name", "type": "text", "required": true, "variable": "author_name", "placeholder": "Enter author name", "fullWidth": false},
    {"id": 3, "name": "Genre", "type": "select", "required": true, "variable": "genre", "placeholder": "Select a genre", "fullWidth": false, "options": [
      {"value": "", "label": "Select a genre"},
      {"value": "fiction", "label": "Fiction"},
      {"value": "non-fiction", "label": "Non-Fiction"},
      {"value": "mystery", "label": "Mystery"},
      {"value": "romance", "label": "Romance"},
      {"value": "sci-fi", "label": "Science Fiction"},
      {"value": "fantasy", "label": "Fantasy"},
      {"value": "thriller", "label": "Thriller"},
      {"value": "biography", "label": "Biography"},
      {"value": "self-help", "label": "Self-Help"},
      {"value": "business", "label": "Business"}
    ]},
    {"id": 4, "name": "Target Audience", "type": "select", "required": true, "variable": "target_audience", "placeholder": "Select target audience", "fullWidth": false, "options": [
      {"value": "", "label": "Select target audience"},
      {"value": "children", "label": "Children (5-12)"},
      {"value": "young-adult", "label": "Young Adult (13-17)"},
      {"value": "adult", "label": "Adult (18+)"},
      {"value": "senior", "label": "Senior (65+)"},
      {"value": "professional", "label": "Professional"},
      {"value": "academic", "label": "Academic"}
    ]},
    {"id": 5, "name": "Book Description", "type": "textarea", "required": true, "variable": "book_description", "placeholder": "Describe your book idea, plot, or concept...", "fullWidth": true, "rows": 4},
    {"id": 6, "name": "Additional Requirements", "type": "textarea", "required": false, "variable": "additional_requirements", "placeholder": "Any specific style, tone, or content requirements...", "fullWidth": true, "rows": 3},
    {"id": 7, "name": "Word Count Target", "type": "number", "required": false, "variable": "word_count", "placeholder": "e.g., 50000", "fullWidth": false, "min": 1000},
    {"id": 8, "name": "Writing Style", "type": "select", "required": false, "variable": "writing_style", "placeholder": "Select writing style", "fullWidth": false, "options": [
      {"value": "", "label": "Select writing style"},
      {"value": "formal", "label": "Formal"},
      {"value": "casual", "label": "Casual"},
      {"value": "conversational", "label": "Conversational"},
      {"value": "academic", "label": "Academic"},
      {"value": "creative", "label": "Creative"},
      {"value": "technical", "label": "Technical"}
    ]},
    {"id": 9, "name": "Company Name", "type": "text", "required": false, "variable": "company_name", "placeholder": "Enter company name (optional)", "fullWidth": false},
    {"id": 10, "name": "Business Model", "type": "select", "required": false, "variable": "business_model", "placeholder": "Select business model", "fullWidth": false, "options": [
      {"value": "", "label": "Select business model"},
      {"value": "saas", "label": "SaaS"},
      {"value": "subscription", "label": "Subscription"},
      {"value": "one_time_purchase", "label": "One-time Purchase"},
      {"value": "freemium", "label": "Freemium"},
      {"value": "marketplace", "label": "Marketplace"},
      {"value": "consulting", "label": "Consulting"},
      {"value": "ecommerce", "label": "E-commerce"}
    ]}
  ]'::jsonb
)
WHERE name = 'Customer Success Playbook';

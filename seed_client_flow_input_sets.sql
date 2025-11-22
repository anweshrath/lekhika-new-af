-- Seed 50 client_flow_input_sets (5 per flow)
-- NOTE: Replace sample text with your curated content before running in production.

insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight)
values
-- Business Content Creation Flow
('business_content_creation','exec_brief','Executive Briefing','C‑suite quarterly strategy summary', ARRAY['Business','Report'],
  '{"book_title":"Quarterly Strategy Briefing","topic":"Digital growth plan for Q4","target_audience":"executives","word_count":"3000-5000","chapter_count":"5","tone":"authoritative","writing_style":"professional","output_formats":["pdf","docx","html"],"custom_instructions":"Focus on KPIs, priorities, risks, next actions."}',0),
('business_content_creation','product_launch','Product Launch One‑Pager','Fast GTM launch brief', ARRAY['Business','GTM'],
  '{"book_title":"Launch Brief – Project Atlas","topic":"New product go‑to‑market","target_audience":"professionals","word_count":"1500-3000","chapter_count":"3","tone":"confident","writing_style":"persuasive","output_formats":["html","docx","md"],"custom_instructions":"Benefits, positioning, CTA. Avoid jargon."}',1),
('business_content_creation','case_study','Customer Case Study','Problem‑solution‑outcome case', ARRAY['Business','Case Study'],
  '{"book_title":"Proven Results with Nimbus","topic":"Customer success case study","target_audience":"managers","word_count":"3000-5000","chapter_count":"5","tone":"professional","writing_style":"analytical","output_formats":["pdf","docx","html"]}',2),
('business_content_creation','board_update','Board Update','Concise board‑level update', ARRAY['Business','Board'],
  '{"book_title":"Board Update – Q4 Outlook","topic":"Executive summary & risks","target_audience":"executives","word_count":"1500-3000","chapter_count":"3","tone":"authoritative","writing_style":"professional","output_formats":["pdf","docx"]}',3),
('business_content_creation','marketing_brief','Marketing Campaign Brief','Performance‑oriented brief', ARRAY['Business','Marketing'],
  '{"book_title":"Campaign Brief – Growth Sprint","topic":"Acquisition campaign","target_audience":"marketers","word_count":"1500-3000","chapter_count":"4","tone":"friendly","writing_style":"persuasive","output_formats":["html","md","docx"]}',4);

-- Fiction Story Creation Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('fiction_story_creation','fantasy_novella','Fantasy Novella Starter','Epic seed for a fantasy novella', ARRAY['Fiction','Fantasy'],
  '{"book_title":"The Emberwood Oath","author_name":"A. S. Rowan","topic":"Vow that binds a forest clan","target_audience":"young_adult","word_count":"10000-20000","chapter_count":"10","tone":"dramatic","writing_style":"storytelling","output_formats":["docx","pdf","md"],"custom_instructions":"Strong character arcs and world‑building."}',0),
('fiction_story_creation','scifi_mystery','Sci‑Fi Mystery Hook','Intriguing tech‑noir opener', ARRAY['Fiction','Sci‑Fi'],
  '{"book_title":"Signal in the Silence","author_name":"K. L. Vega","topic":"Ghost transmission from deep space","target_audience":"adults","word_count":"5000-10000","chapter_count":"8","tone":"mysterious","writing_style":"narrative","output_formats":["md","html","pdf"]}',1),
('fiction_story_creation','romance_meet_cute','Romance Meet‑Cute','Sweet first‑encounter setup', ARRAY['Fiction','Romance'],
  '{"book_title":"Starlight on 5th","author_name":"Mia Carter","topic":"Two rival bakers collide","target_audience":"adults","word_count":"5000-10000","chapter_count":"8","tone":"warm","writing_style":"storytelling","output_formats":["docx","pdf"]}',2),
('fiction_story_creation','thriller_cold_open','Thriller Cold Open','High‑tension opening sequence', ARRAY['Fiction','Thriller'],
  '{"book_title":"The Ninth Key","author_name":"R. H. Morgan","topic":"Break‑in at a biotech vault","target_audience":"adults","word_count":"5000-10000","chapter_count":"8","tone":"dramatic","writing_style":"journalistic","output_formats":["docx","pdf","md"]}',3),
('fiction_story_creation','literary_vignette','Literary Vignette','Reflective, voice‑driven vignette', ARRAY['Fiction','Literary'],
  '{"book_title":"Still Water, Bright City","author_name":"Noah Ellis","topic":"Memory and place","target_audience":"adults","word_count":"3000-5000","chapter_count":"5","tone":"serious","writing_style":"creative","output_formats":["md","pdf"]}',4);

-- Creative Writing Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('creative_writing_flow','poetry_cycle','Poetry Cycle Prompt','Theme‑based poem sequence', ARRAY['Creative','Poetry'],
  '{"book_title":"Tides of Quiet","author_name":"E. M. Hale","topic":"Coastal winters","target_audience":"general","word_count":"3000-5000","chapter_count":"5","tone":"serious","writing_style":"poetic","output_formats":["md","pdf"]}',0),
('creative_writing_flow','screenplay_beats','Screenplay Beat Sheet','Tight act‑beat structure', ARRAY['Creative','Screenplay'],
  '{"book_title":"Glass District","author_name":"Theo Park","topic":"Heist thriller pilot","target_audience":"professionals","word_count":"5000-10000","chapter_count":"8","tone":"dramatic","writing_style":"narrative","output_formats":["docx","pdf"]}',1),
('creative_writing_flow','cnf_essay','Creative Nonfiction Essay','True story, literary lens', ARRAY['Creative','Essay'],
  '{"book_title":"The Long Commute","author_name":"J. Rivera","topic":"City to coast transitions","target_audience":"adults","word_count":"3000-5000","chapter_count":"5","tone":"reflective","writing_style":"creative","output_formats":["md","pdf","docx"]}',2),
('creative_writing_flow','flash_fiction','Flash Fiction Spark','Micro fiction pack', ARRAY['Creative','Flash'],
  '{"book_title":"Five Lights","author_name":"Ivy Chen","topic":"Chance encounters","target_audience":"general","word_count":"1500-3000","chapter_count":"3","tone":"entertaining","writing_style":"creative","output_formats":["md","html"]}',3),
('creative_writing_flow','novel_excerpt','Novel Excerpt Polish','Polish a chapter excerpt', ARRAY['Creative','Editing'],
  '{"book_title":"Moonfault","author_name":"Samir Khan","topic":"Chapter 3 polish","target_audience":"adults","word_count":"3000-5000","chapter_count":"3","tone":"serious","writing_style":"narrative","output_formats":["docx","pdf"]}',4);

-- Educational Content Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('educational_content_flow','course_module','Course Module Outline','Units, outcomes, resources', ARRAY['Education','Course'],
  '{"book_title":"Intro to Data Literacy","author_name":"Dr. Anna Blake","topic":"Data basics for all","target_audience":"students","word_count":"5000-10000","chapter_count":"8","tone":"informative","writing_style":"instructional","output_formats":["pdf","docx","html"]}',0),
('educational_content_flow','lesson_plan','Lesson Plan Builder','Clear objectives and tasks', ARRAY['Education','Lesson'],
  '{"book_title":"Lesson – Probability Basics","author_name":"Mr. Patel","topic":"Intro probability","target_audience":"teachers","word_count":"3000-5000","chapter_count":"5","tone":"informative","writing_style":"expository","output_formats":["docx","pdf"]}',1),
('educational_content_flow','quiz_pack','Quiz & Assessment Pack','Auto‑generated quizzes', ARRAY['Education','Assessment'],
  '{"book_title":"Assessment – Module 2","author_name":"Dept. QA","topic":"Comprehension checks","target_audience":"students","word_count":"1500-3000","chapter_count":"3","tone":"informative","writing_style":"instructional","output_formats":["pdf","docx"]}',2),
('educational_content_flow','lab_exercise','Lab Exercise Guide','Hands‑on lab directions', ARRAY['Education','Lab'],
  '{"book_title":"Lab – Circuit Fundamentals","author_name":"Prof. Lee","topic":"Ohm''s law lab","target_audience":"students","word_count":"3000-5000","chapter_count":"5","tone":"informative","writing_style":"technical","output_formats":["pdf","docx"]}',3),
('educational_content_flow','syllabus_snapshot','Syllabus Snapshot','Compact subject syllabus', ARRAY['Education','Syllabus'],
  '{"book_title":"Syllabus – Web Dev 101","author_name":"Course Team","topic":"Course overview","target_audience":"students","word_count":"3000-5000","chapter_count":"5","tone":"informative","writing_style":"professional","output_formats":["pdf","docx","html"]}',4);

-- Audiobook Creation Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('audiobook_creation_flow','conversational_vo','Conversational Narration Script','Warm, natural delivery', ARRAY['Audio','Narration'],
  '{"book_title":"Working Smarter Daily","author_name":"Nora James","topic":"Time‑saving routines","target_audience":"professionals","word_count":"10000-20000","chapter_count":"8","tone":"conversational","writing_style":"conversational","output_formats":["txt","docx","pdf"]}',0),
('audiobook_creation_flow','corporate_vo','Professional Corporate VO','Clear and authoritative', ARRAY['Audio','Corporate'],
  '{"book_title":"Policy Handbook Narration","author_name":"Voice Team","topic":"Policy narration","target_audience":"professionals","word_count":"5000-10000","chapter_count":"6","tone":"professional","writing_style":"professional","output_formats":["txt","docx"]}',1),
('audiobook_creation_flow','dramatic_story','Dramatic Storytelling','High emotion performance', ARRAY['Audio','Story'],
  '{"book_title":"Embers of Dawn","author_name":"A. Lake","topic":"Family saga","target_audience":"adults","word_count":"10000-20000","chapter_count":"10","tone":"dramatic","writing_style":"narrative","output_formats":["txt","docx","pdf"]}',2),
('audiobook_creation_flow','calming_read','Calming Meditation Read','Soft paced reading', ARRAY['Audio','Meditation'],
  '{"book_title":"Evening Calm","author_name":"Serene Voices","topic":"Meditation script","target_audience":"general","word_count":"5000-10000","chapter_count":"6","tone":"calming","writing_style":"descriptive","output_formats":["txt","docx"]}',3),
('audiobook_creation_flow','documentary','Documentary Style','Neutral and informative', ARRAY['Audio','Documentary'],
  '{"book_title":"Ocean Currents","author_name":"Docu Team","topic":"Ocean science explainer","target_audience":"general","word_count":"5000-10000","chapter_count":"6","tone":"informative","writing_style":"expository","output_formats":["txt","docx","pdf"]}',4);

-- Research & Analysis Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('research_analysis_flow','market_brief','Market Research Brief','Snapshot of market size & growth', ARRAY['Research','Market'],
  '{"book_title":"AI Tools Market 2025","author_name":"Analyst Team","topic":"Market overview","target_audience":"executives","word_count":"5000-10000","chapter_count":"6","tone":"informative","writing_style":"analytical","output_formats":["pdf","docx"]}',0),
('research_analysis_flow','competitive_teardown','Competitive Tear‑Down','Competitor feature matrix', ARRAY['Research','Competitive'],
  '{"book_title":"Competitive Landscape","author_name":"Analyst Team","topic":"Top 8 competitors","target_audience":"managers","word_count":"5000-10000","chapter_count":"6","tone":"confident","writing_style":"analytical","output_formats":["pdf","docx","html"]}',1),
('research_analysis_flow','trend_digest','Trend Analysis Digest','Signals and implications', ARRAY['Research','Trends'],
  '{"book_title":"Signals: Q3 Digest","author_name":"Analyst Team","topic":"Macro trends","target_audience":"professionals","word_count":"3000-5000","chapter_count":"5","tone":"informative","writing_style":"professional","output_formats":["md","pdf"]}',2),
('research_analysis_flow','feasibility_summary','Feasibility Summary','Viability and risk snapshot', ARRAY['Research','Feasibility'],
  '{"book_title":"Project Atlas – Feasibility","author_name":"PMO","topic":"Scope & risks","target_audience":"investors","word_count":"3000-5000","chapter_count":"5","tone":"authoritative","writing_style":"technical","output_formats":["pdf","docx"]}',3),
('research_analysis_flow','executive_abstract','Executive Research Abstract','Board‑level summary', ARRAY['Research','Executive'],
  '{"book_title":"Executive Abstract – AI CX","author_name":"Research Lead","topic":"Customer Experience AI","target_audience":"executives","word_count":"1500-3000","chapter_count":"3","tone":"authoritative","writing_style":"professional","output_formats":["pdf","docx"]}',4);

-- Content Marketing Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('content_marketing_flow','blog_campaign','Blog Campaign Brief','Series and key angles', ARRAY['Marketing','Blog'],
  '{"book_title":"Growth Blog Sprint","author_name":"Content Team","topic":"Acquisition topics","target_audience":"professionals","word_count":"3000-5000","chapter_count":"5","tone":"friendly","writing_style":"conversational","output_formats":["html","md","docx"]}',0),
('content_marketing_flow','social_pack','Social Content Pack','Multi‑platform post set', ARRAY['Marketing','Social'],
  '{"book_title":"Q4 Social Pack","author_name":"Content Team","topic":"Campaign highlights","target_audience":"general","word_count":"1500-3000","chapter_count":"3","tone":"entertaining","writing_style":"persuasive","output_formats":["md","html"]}',1),
('content_marketing_flow','email_drip','Email Drip Outline','3‑email nurture outline', ARRAY['Marketing','Email'],
  '{"book_title":"Nurture – Welcome Series","author_name":"Lifecycle Team","topic":"Welcome flow","target_audience":"entrepreneurs","word_count":"1500-3000","chapter_count":"3","tone":"friendly","writing_style":"professional","output_formats":["docx","md"]}',2),
('content_marketing_flow','landing_copy','Landing Page Copy Brief','Hero, value, CTA', ARRAY['Marketing','Landing'],
  '{"book_title":"Landing – Atlas","author_name":"Copy Team","topic":"Value proposition","target_audience":"professionals","word_count":"1500-3000","chapter_count":"3","tone":"confident","writing_style":"persuasive","output_formats":["html","docx"]}',3),
('content_marketing_flow','ad_copy_matrix','Ad Copy Matrix','Angles and variations', ARRAY['Marketing','Ads'],
  '{"book_title":"Ad Copy Matrix","author_name":"Ad Ops","topic":"Angles & variants","target_audience":"young_adult","word_count":"500-1500","chapter_count":"3","tone":"entertaining","writing_style":"persuasive","output_formats":["md","txt"]}',4);

-- Complete Book Creation Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('complete_book_creation','business_playbook','Business Playbook Outline','Strategy and execution guide', ARRAY['Publishing','Business'],
  '{"book_title":"The Growth Playbook","author_name":"Jordan Blake","topic":"Scaling B2B","target_audience":"professionals","word_count":"20000-50000","chapter_count":"12","tone":"authoritative","writing_style":"professional","output_formats":["pdf","docx","epub"]}',0),
('complete_book_creation','self_help','Self‑Help Guide Map','Transformation framework', ARRAY['Publishing','Self‑Help'],
  '{"book_title":"Unstuck","author_name":"Rae Johnson","topic":"Habits to momentum","target_audience":"adults","word_count":"15000-30000","chapter_count":"10","tone":"inspirational","writing_style":"conversational","output_formats":["pdf","docx","epub"]}',1),
('complete_book_creation','technical_handbook','Technical Handbook Skeleton','Procedural handbook', ARRAY['Publishing','Technical'],
  '{"book_title":"Kubernetes in Practice","author_name":"Dev Team","topic":"K8s operations","target_audience":"developers","word_count":"20000-50000","chapter_count":"12","tone":"informative","writing_style":"technical","output_formats":["pdf","docx","html"]}',2),
('complete_book_creation','biography_map','Biography Chapter Map','Life chapters scaffold', ARRAY['Publishing','Biography'],
  '{"book_title":"Paths of a Pioneer","author_name":"Biographer","topic":"Founder story","target_audience":"adults","word_count":"15000-30000","chapter_count":"10","tone":"serious","writing_style":"narrative","output_formats":["docx","pdf","epub"]}',3),
('complete_book_creation','how_to_manual','How‑To Manual','Step‑by‑step how‑to', ARRAY['Publishing','Guide'],
  '{"book_title":"The Maker''s Manual","author_name":"Alex Quinn","topic":"DIY workshop","target_audience":"beginners","word_count":"10000-20000","chapter_count":"8","tone":"informative","writing_style":"instructional","output_formats":["pdf","docx","html"]}',4);

-- Rapid Content Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('rapid_content_flow','quick_blog','Quick Blog Outline','Rapid 700‑word post', ARRAY['Quick','Blog'],
  '{"book_title":"Quick Post – Productivity","author_name":"Editor","topic":"Focus hacks","target_audience":"general","word_count":"500-1500","chapter_count":"3","tone":"friendly","writing_style":"conversational","output_formats":["html","md"]}',0),
('rapid_content_flow','tips_list','10‑Tips Listicle','Punchy tip list', ARRAY['Quick','Listicle'],
  '{"book_title":"10 Tips for Remote Work","author_name":"Editor","topic":"Remote best practices","target_audience":"professionals","word_count":"1500-3000","chapter_count":"3","tone":"friendly","writing_style":"persuasive","output_formats":["md","html"]}',1),
('rapid_content_flow','micro_case','Micro Case Study','Short proof point', ARRAY['Quick','Case Study'],
  '{"book_title":"Micro Case – Atlas","author_name":"Editor","topic":"Lift from a client","target_audience":"professionals","word_count":"1500-3000","chapter_count":"3","tone":"professional","writing_style":"analytical","output_formats":["pdf","md"]}',2),
('rapid_content_flow','faq_sheet','FAQ Sheet','Concise Q&A', ARRAY['Quick','FAQ'],
  '{"book_title":"FAQ – Product","author_name":"Support","topic":"Common questions","target_audience":"general","word_count":"1500-3000","chapter_count":"3","tone":"informative","writing_style":"professional","output_formats":["html","md"]}',3),
('rapid_content_flow','product_blurbs','Product Feature Blurbs','Short feature blurbs', ARRAY['Quick','Product'],
  '{"book_title":"Feature Blurbs","author_name":"PMM","topic":"Top features","target_audience":"professionals","word_count":"500-1500","chapter_count":"3","tone":"confident","writing_style":"persuasive","output_formats":["md","txt"]}',4);

-- Premium Quality Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('premium_quality_flow','white_paper','White Paper Abstract','Executive research abstract', ARRAY['Premium','White Paper'],
  '{"book_title":"AI Governance – Abstract","author_name":"Strategy Team","topic":"Governance principles","target_audience":"executives","word_count":"10000-20000","chapter_count":"10","tone":"authoritative","writing_style":"academic","output_formats":["pdf","docx"]}',0),
('premium_quality_flow','executive_report','Executive Report Brief','High‑level decision report', ARRAY['Premium','Report'],
  '{"book_title":"Executive Report – GenAI","author_name":"Strategy Team","topic":"Impact and roadmap","target_audience":"executives","word_count":"10000-20000","chapter_count":"10","tone":"sophisticated","writing_style":"professional","output_formats":["pdf","docx","html"]}',1),
('premium_quality_flow','thought_leadership','Thought Leadership Outline','POV and insights', ARRAY['Premium','Thought Leadership'],
  '{"book_title":"Leading Through Change","author_name":"CXO Office","topic":"Change leadership","target_audience":"professionals","word_count":"10000-20000","chapter_count":"10","tone":"confident","writing_style":"persuasive","output_formats":["pdf","docx"]}',2),
('premium_quality_flow','research_paper','Research Paper Framework','Structured academic paper', ARRAY['Premium','Research'],
  '{"book_title":"AI Safety – Paper","author_name":"Research Group","topic":"Safety constraints","target_audience":"researchers","word_count":"20000-50000","chapter_count":"12","tone":"authoritative","writing_style":"academic","output_formats":["pdf","docx"]}',3),
('premium_quality_flow','premium_guide','Premium Guide Blueprint','Comprehensive premium guide', ARRAY['Premium','Guide'],
  '{"book_title":"The Enterprise Handbook","author_name":"Editorial","topic":"Enterprise adoption","target_audience":"professionals","word_count":"20000-50000","chapter_count":"12","tone":"professional","writing_style":"analytical","output_formats":["pdf","docx","epub"]}',4);

-- Add 5 presets for each remaining flow similarly (fiction_story_creation, creative_writing_flow, educational_content_flow, audiobook_creation_flow, rapid_content_flow, premium_quality_flow, content_marketing_flow, research_analysis_flow, complete_book_creation)
-- Keep tokens aligned with ULTIMATE_MASTER_VARIABLES and clientForms.


-- NEW MAIN 5 FLOWS

-- Fiction Novel Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('fiction_novel','epic_fantasy','Epic Fantasy Quest','High-stakes saga with rich world-building', ARRAY['Fiction','Fantasy'],
 '{"book_title":"Oath of the Skyforge","author_name":"Mira Thorn","topic":"A blacksmith heir must rekindle an ancient forge to avert a prophecy","target_audience":"young_adult","word_count":"12000-20000","chapter_count":"12","tone":"dramatic","writing_style":"storytelling","output_formats":["md","pdf","docx"],"include_images":"true","image_style":"digital_painting","art_type":"scene","aspect_ratio":"16:9","mood":"epic","composition":"rule_of_thirds","include_ecover":"true","ecover_style":"fantasy","ecover_layout":"title_top"}',0),
('fiction_novel','sci_fi_odyssey','Sci‑Fi Odyssey','Cosmic mystery with grounded characters', ARRAY['Fiction','Sci‑Fi'],
 '{"book_title":"Echoes of the Lagrange Gate","author_name":"J. Kade","topic":"Anomalous signals from a dormant station","target_audience":"adults","word_count":"8000-12000","chapter_count":"10","tone":"mysterious","writing_style":"narrative","output_formats":["md","html","pdf"],"include_images":"true","image_style":"cinematic","art_type":"scene","aspect_ratio":"16:9","mood":"moody","composition":"leading_lines","include_ecover":"true","ecover_style":"sci_fi","ecover_layout":"title_center"}',1),
('fiction_novel','romance_city','Modern Romance','Warm, city-set romance with wit', ARRAY['Fiction','Romance'],
 '{"book_title":"Cappuccino at Dusk","author_name":"Leah Hayes","topic":"Rivals-to-lovers in a coffee district","target_audience":"adults","word_count":"5000-10000","chapter_count":"8","tone":"warm","writing_style":"storytelling","output_formats":["docx","pdf"],"include_images":"false","include_ecover":"true","ecover_style":"romance","ecover_layout":"title_bottom"}',2),
('fiction_novel','thriller_heist','Tech Thriller Heist','Pacey heist with moral tension', ARRAY['Fiction','Thriller'],
 '{"book_title":"The Glass Cipher","author_name":"R. Cole","topic":"A heist targeting a post-quantum vault","target_audience":"adults","word_count":"8000-12000","chapter_count":"10","tone":"confident","writing_style":"journalistic","output_formats":["pdf","docx"],"include_images":"false","include_ecover":"true","ecover_style":"bold","ecover_layout":"title_center"}',3),
('fiction_novel','literary_slice','Literary Slice of Life','Voice-forward reflective fiction', ARRAY['Fiction','Literary'],
 '{"book_title":"Hushed Elevators","author_name":"N. Aster","topic":"Intersections of strangers in a high-rise","target_audience":"adults","word_count":"3000-5000","chapter_count":"5","tone":"serious","writing_style":"creative","output_formats":["md","pdf"],"include_images":"false","include_ecover":"false"}',4);

-- Audiobook Production Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('audiobook_production','conversational','Conversational Narration','Warm, natural, intimate style', ARRAY['Audio','Narration'],
 '{"book_title":"Everyday Momentum","author_name":"Nora James","topic":"Small daily systems that compound","target_audience":"professionals","word_count":"10000-20000","chapter_count":"8","tone":"conversational","writing_style":"conversational","output_formats":["mp3","m4a","txt"],"include_images":"false","include_ecover":"true","ecover_style":"minimal","ecover_layout":"title_center"}',0),
('audiobook_production','documentary_tone','Documentary Neutral','Clear, informative delivery', ARRAY['Audio','Documentary'],
 '{"book_title":"Streams of Earth","author_name":"Docu Unit","topic":"Watersheds and urban design","target_audience":"general","word_count":"5000-10000","chapter_count":"6","tone":"informative","writing_style":"expository","output_formats":["mp3","wav","txt"],"include_images":"false","include_ecover":"false"}',1),
('audiobook_production','dramatic_story','Dramatic Performance','High emotion, paced beats', ARRAY['Audio','Story'],
 '{"book_title":"Ashes Before Dawn","author_name":"A. Lake","topic":"Reconciliation across generations","target_audience":"adults","word_count":"10000-20000","chapter_count":"10","tone":"dramatic","writing_style":"narrative","output_formats":["mp3","m4a","txt"],"include_images":"true","image_style":"illustration","art_type":"scene","aspect_ratio":"4:5","mood":"mysterious","composition":"centered","include_ecover":"true","ecover_style":"classic","ecover_layout":"title_top"}',2),
('audiobook_production','corporate_vo','Corporate VO','Authoritative and crisp', ARRAY['Audio','Corporate'],
 '{"book_title":"Policy, Clear and Simple","author_name":"Editorial Team","topic":"Readable policies for teams","target_audience":"professionals","word_count":"5000-10000","chapter_count":"6","tone":"professional","writing_style":"professional","output_formats":["mp3","txt"],"include_images":"false","include_ecover":"true","ecover_style":"classic","ecover_layout":"left_art_right_text"}',3),
('audiobook_production','meditation_read','Meditation Read','Soft, slow cadence', ARRAY['Audio','Meditation'],
 '{"book_title":"Evening Grounding","author_name":"Serene Voices","topic":"Gentle evening meditations","target_audience":"general","word_count":"5000-10000","chapter_count":"6","tone":"calming","writing_style":"descriptive","output_formats":["mp3","m4a","txt"],"include_images":"false","include_ecover":"true","ecover_style":"minimal","ecover_layout":"title_bottom"}',4);

-- Lead Magnet Report Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('lead_magnet_report','exec_brief','Executive Brief','C‑suite, KPI-focused snapshot', ARRAY['Business','Executive'],
 '{"book_title":"Quarterly Momentum","author_name":"Strategy Desk","topic":"Q4 growth priorities","target_audience":"executives","word_count":"3000-5000","chapter_count":"5","tone":"authoritative","writing_style":"professional","output_formats":["pdf","docx","html"],"include_images":"true","image_style":"line_art","art_type":"icon","aspect_ratio":"1:1","mood":"sophisticated","composition":"minimal","include_ecover":"true","ecover_style":"classic","ecover_layout":"title_center"}',0),
('lead_magnet_report','case_study','Case Study','Problem → Solution → Outcome', ARRAY['Business','Case Study'],
 '{"book_title":"Turning Churn into Loyalty","author_name":"CS Team","topic":"Retention program","target_audience":"managers","word_count":"3000-5000","chapter_count":"5","tone":"confident","writing_style":"analytical","output_formats":["pdf","docx"],"include_images":"true","image_style":"illustration","art_type":"scene","aspect_ratio":"3:4","mood":"optimistic","composition":"leading_lines","include_ecover":"false"}',1),
('lead_magnet_report','market_brief','Market Brief','Size, growth, drivers', ARRAY['Business','Market'],
 '{"book_title":"Signals: AI in CX","author_name":"Insights Lab","topic":"Market snapshot","target_audience":"professionals","word_count":"3000-5000","chapter_count":"5","tone":"informative","writing_style":"analytical","output_formats":["pdf","docx","md"],"include_images":"false","include_ecover":"true","ecover_style":"bold","ecover_layout":"title_top"}',2),
('lead_magnet_report','playbook','Tactical Playbook','Hands-on tactics and templates', ARRAY['Business','Playbook'],
 '{"book_title":"Acquisition Sprint","author_name":"Growth Team","topic":"Acquisition tactics","target_audience":"entrepreneurs","word_count":"5000-8000","chapter_count":"8","tone":"friendly","writing_style":"instructional","output_formats":["pdf","docx","html"],"include_images":"true","image_style":"digital_painting","art_type":"icon","aspect_ratio":"4:5","mood":"optimistic","composition":"centered","include_ecover":"true","ecover_style":"minimal","ecover_layout":"title_center"}',3),
('lead_magnet_report','one_pager','One‑Pager','Concise, shareable brief', ARRAY['Business','Brief'],
 '{"book_title":"Project Atlas – One‑Pager","author_name":"PMM","topic":"Value prop snapshot","target_audience":"professionals","word_count":"1500-3000","chapter_count":"3","tone":"confident","writing_style":"persuasive","output_formats":["html","pdf","md"],"include_images":"false","include_ecover":"false"}',4);

-- Mini Course eBook Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('mini_course_ebook','module_series','Module Series','8-lesson mini-course booklet', ARRAY['Education','Course'],
 '{"book_title":"Foundations of Focus","author_name":"Dr. Lena Hart","topic":"Focus systems for learners","target_audience":"students","word_count":"5000-10000","chapter_count":"8","tone":"informative","writing_style":"instructional","output_formats":["pdf","docx","epub"],"include_images":"true","image_style":"illustration","art_type":"scene","aspect_ratio":"4:5","mood":"serene","composition":"minimal","include_ecover":"true","ecover_style":"classic","ecover_layout":"title_top"}',0), 
('mini_course_ebook','lesson_pack','Lesson Pack','Pack of 5 compact lessons', ARRAY['Education','Lessons'],
 '{"book_title":"Quick Wins in Writing","author_name":"Course Team","topic":"Clarity and structure","target_audience":"general","word_count":"3000-5000","chapter_count":"5","tone":"informative","writing_style":"professional","output_formats":["pdf","docx"],"include_images":"false","include_ecover":"true","ecover_style":"minimal","ecover_layout":"title_center"}',1),
('mini_course_ebook','lab_guides','Lab Guides','Hands-on exercises with visuals', ARRAY['Education','Lab'],
 '{"book_title":"Data Viz Labs","author_name":"Workshop","topic":"Visualization exercises","target_audience":"students","word_count":"3000-5000","chapter_count":"5","tone":"informative","writing_style":"technical","output_formats":["pdf","docx"],"include_images":"true","image_style":"line_art","art_type":"icon","aspect_ratio":"1:1","mood":"analytical","composition":"minimal","include_ecover":"false"}',2),
('mini_course_ebook','quiz_book','Quiz Book','Self-check quizzes and answers', ARRAY['Education','Assessment'],
 '{"book_title":"Assess Yourself: Module 1","author_name":"QA","topic":"Knowledge checks","target_audience":"students","word_count":"1500-3000","chapter_count":"3","tone":"informative","writing_style":"expository","output_formats":["pdf","docx"],"include_images":"false","include_ecover":"true","ecover_style":"minimal","ecover_layout":"left_art_right_text"}',3),
('mini_course_ebook','syllabus','Syllabus Snapshot','Compact course syllabus', ARRAY['Education','Syllabus'],
 '{"book_title":"Syllabus – Creative Coding","author_name":"Instructor","topic":"Course overview","target_audience":"students","word_count":"3000-5000","chapter_count":"5","tone":"informative","writing_style":"professional","output_formats":["pdf","docx","html"],"include_images":"false","include_ecover":"false"}',4);

-- Biography / Memoir Flow
insert into public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) values
('biography_memoir','founder_bio','Founder Biography','Origin story and pivotal moments', ARRAY['Biography','Founder'],
 '{"book_title":"Under the Neon Monsoon","author_name":"A. Nayar","topic":"Founder biography of Arjun Nayar—early hardships, first product, near-failure, breakout, lessons","target_audience":"adults","word_count":"8000-12000","chapter_count":"10","tone":"serious","writing_style":"narrative","custom_instructions":"Write a third‑person founder biography of Arjun Nayar. Cover childhood influences, spark for the first product, co‑founder dynamics, funding winters, first 100 customers, pivotal failures, inflection points, and leadership philosophy. Include 3 vivid scenes and 5 pull‑quotes. Keep it honest, human, and reflective.","output_formats":["docx","pdf","epub"],"include_images":"true","image_style":"photorealistic","art_type":"character","aspect_ratio":"3:4","mood":"mysterious","composition":"centered","include_ecover":"true","ecover_style":"classic","ecover_layout":"title_center"}',0),
('biography_memoir','memoir_vignettes','Memoir Vignettes','Voice-forward personal vignettes', ARRAY['Biography','Memoir'],
 '{"book_title":"Rooms of Light","author_name":"S. Rae","topic":"Memoir of Selene Rae—five pivotal rooms and how each changed her","target_audience":"adults","word_count":"3000-5000","chapter_count":"5","tone":"warm","writing_style":"creative","custom_instructions":"First‑person memoir. Each chapter centers on a single room tied to a memory, integrating sensory detail and a small revelation. Close with a quiet but resonant insight that threads the five scenes.","output_formats":["md","pdf"],"include_images":"false","include_ecover":"true","ecover_style":"minimal","ecover_layout":"title_bottom"}',1),
('biography_memoir','legacy_profile','Legacy Profile','Profile capturing values and legacy', ARRAY['Biography','Legacy'],
 '{"book_title":"A Life, Well Made","author_name":"Editorial","topic":"Legacy profile of Devendra Malhotra—mentors, values, craft, service","target_audience":"seniors","word_count":"5000-10000","chapter_count":"8","tone":"supportive","writing_style":"descriptive","custom_instructions":"Third‑person magazine‑style profile of Devendra Malhotra. Lead with a present‑tense scene, thread formative mentors, signature projects, community impact, and the values he wants to pass on. End with an epilogue voiced by a family member.","output_formats":["docx","pdf"],"include_images":"false","include_ecover":"true","ecover_style":"classic","ecover_layout":"title_top"}',2),
('biography_memoir','heritage_album','Heritage Album','Family-focused with curated images', ARRAY['Biography','Family'],
 '{"book_title":"The Bridges We Kept","author_name":"Family Team","topic":"Family heritage album for the Narayan family—migrations, rituals, heirlooms","target_audience":"parents","word_count":"3000-5000","chapter_count":"5","tone":"empathetic","writing_style":"narrative","custom_instructions":"Create a family album narrative with 5 themed sections: Origins, Journeys, Work, Rituals, Heirlooms. Invite brief captions for photos and a 1‑page family timeline. Keep tone warm and dignified.","output_formats":["pdf","docx","html"],"include_images":"true","image_style":"watercolor","art_type":"scene","aspect_ratio":"4:5","mood":"serene","composition":"minimal","include_ecover":"true","ecover_style":"classic","ecover_layout":"left_art_right_text"}',3),
('biography_memoir','career_chapters','Career Chapters','Career arc and lessons', ARRAY['Biography','Career'],
 '{"book_title":"Chapters of Practice","author_name":"M. Ortega","topic":"Career biography of Mateo Ortega—apprenticeship to principal engineer","target_audience":"professionals","word_count":"5000-10000","chapter_count":"8","tone":"informative","writing_style":"professional","custom_instructions":"Third‑person career narrative of Mateo Ortega. Organize by stages: apprenticeship, first failures, breakout project, leadership, setbacks, renewal. Insert a short toolbox chapter of 12 hard lessons learned.","output_formats":["docx","pdf"],"include_images":"false","include_ecover":"false"}',4);


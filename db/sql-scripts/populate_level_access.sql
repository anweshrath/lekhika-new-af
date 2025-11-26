-- Populate level_access table with sample data
INSERT INTO public.level_access (id, feature_name, feature_category, feature_description, hobby_access, pro_access, macdaddy_access, byok_access, is_active, created_at, updated_at) VALUES
('4de16d48-33db-475d-8092-e4f114a67620', 'ebook_creation', 'content_type', 'Create eBooks', true, true, true, true, true, now(), now()),
('a652ab2e-8d37-4bc8-83d7-708e75befd6b', 'report_creation', 'content_type', 'Create business reports', false, true, true, true, true, now(), now()),
('ab5fc090-1625-40b1-a5f2-8324b51af9e1', 'guide_creation', 'content_type', 'Create how-to guides', true, true, true, true, true, now(), now()),
('64a2e448-684f-47f7-a34c-ce63a7b4f3a0', 'whitepaper_creation', 'content_type', 'Create whitepapers', false, false, true, true, true, now(), now()),
('1c8b0987-25d1-4910-b9d9-753994c64bc7', 'manual_creation', 'content_type', 'Create technical manuals', false, true, true, true, true, now(), now()),
('0daa170f-0341-447f-95bc-0814ec8e52df', 'case_study_creation', 'content_type', 'Create case studies', false, true, true, true, true, now(), now()),
('fd641948-10d9-4056-988d-95bb9de60c8c', 'tech_manual_creation', 'content_type', 'Create tech manuals', false, true, true, true, true, now(), now()),
('c357bb2b-77d4-4c18-8fe0-e1af55780175', 'cheat_sheet_creation', 'content_type', 'Create cheat sheets', true, true, true, true, true, now(), now()),
('0de57541-b961-40ca-afc4-efb0cdc14a0b', 'fiction_creation', 'content_type', 'Create fiction books', false, true, true, true, true, now(), now()),
('3f2ed7f3-1580-4c8a-86bf-e7580ab838cd', 'autobiography_creation', 'content_type', 'Create autobiographies', false, true, true, true, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Manual Supabase Storage Setup
-- Run this directly in Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('user-references', 'user-references', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv']),
  ('workflow-assets', 'workflow-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for user-references bucket
CREATE POLICY "Users can upload their own references" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-references' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own references" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-references' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own references" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-references' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own references" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-references' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for workflow-assets bucket (public)
CREATE POLICY "Anyone can view workflow assets" ON storage.objects
FOR SELECT USING (bucket_id = 'workflow-assets');

CREATE POLICY "Authenticated users can upload workflow assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'workflow-assets' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update workflow assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'workflow-assets' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete workflow assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'workflow-assets' AND 
  auth.role() = 'authenticated'
);

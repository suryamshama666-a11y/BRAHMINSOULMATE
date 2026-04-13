-- Migration: 20260208_storage_buckets.sql
-- Description: Create and secure missing storage buckets for profiles, horoscopes, and verification

-- ==============================================================================
-- 1. Create Storage Buckets
-- ==============================================================================

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('horoscopes', 'horoscopes', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 2. Storage Policies for Profile Photos
-- ==============================================================================

-- Allow users to upload their own photos
-- Files must be in a folder named after their UID
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own photos
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
CREATE POLICY "Users can update their own profile photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own photos
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
CREATE POLICY "Users can delete their own profile photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public view (already public, but policy makes it explicit for authenticated app logic if needed)
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
CREATE POLICY "Anyone can view profile photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

-- ==============================================================================
-- 3. Storage Policies for Horoscopes
-- ==============================================================================

-- Users can manage their own horoscopes
DROP POLICY IF EXISTS "Users can manage their own horoscopes" ON storage.objects;
CREATE POLICY "Users can manage their own horoscopes" ON storage.objects
  FOR ALL USING (
    bucket_id = 'horoscopes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==============================================================================
-- 4. Storage Policies for Verification Documents
-- ==============================================================================

-- Users can upload verification documents
DROP POLICY IF EXISTS "Users can upload verification docs" ON storage.objects;
CREATE POLICY "Users can upload verification docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins and Owners can view verification documents
DROP POLICY IF EXISTS "Admins and Owners can view verification docs" ON storage.objects;
CREATE POLICY "Admins and Owners can view verification docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' AND 
    (
      (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
      OR
      auth.uid()::text = (storage.foldername(name))[1]
    )
  );

-- Users can manage their own horoscopes
DROP POLICY IF EXISTS "Users can manage their own horoscopes" ON storage.objects;
CREATE POLICY "Users can manage their own horoscopes" ON storage.objects
  FOR ALL USING (
    bucket_id = 'horoscopes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated matches can view horoscopes
DROP POLICY IF EXISTS "Matches can view horoscopes" ON storage.objects;
CREATE POLICY "Matches can view horoscopes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'horoscopes' AND 
    auth.role() = 'authenticated'
  );

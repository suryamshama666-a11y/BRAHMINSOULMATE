-- Supabase Storage Buckets Configuration
-- Create storage buckets for profile photos, documents, and horoscopes

-- ============================================
-- 1. Create Profile Photos Bucket
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- ============================================
-- 2. Create Verification Documents Bucket
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

-- ============================================
-- 3. Create Horoscopes Bucket
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'horoscopes',
  'horoscopes',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

-- ============================================
-- 4. Storage Policies for Profile Photos
-- ============================================

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to profile photos
CREATE POLICY "Profile photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- ============================================
-- 5. Storage Policies for Verification Documents
-- ============================================

-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own verification documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 6. Storage Policies for Horoscopes
-- ============================================

-- Allow authenticated users to upload their own horoscope
CREATE POLICY "Users can upload their own horoscope"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'horoscopes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own horoscope
CREATE POLICY "Users can update their own horoscope"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'horoscopes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own horoscope
CREATE POLICY "Users can view their own horoscope"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'horoscopes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow premium users to view horoscopes of their connections
CREATE POLICY "Premium users can view connection horoscopes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'horoscopes' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND subscription_type IN ('premium', 'gold')
  ) AND
  EXISTS (
    SELECT 1 FROM connections
    WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
    AND status = 'active'
    AND (
      (storage.foldername(name))[1] = user1_id::text OR
      (storage.foldername(name))[1] = user2_id::text
    )
  )
);

-- Allow users to delete their own horoscope
CREATE POLICY "Users can delete their own horoscope"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'horoscopes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

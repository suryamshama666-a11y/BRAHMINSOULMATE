# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage buckets for the Brahmin Soulmate Connect platform.

## Storage Buckets

The platform uses three storage buckets:

### 1. Profile Photos (`profile-photos`)
- **Purpose**: Store user profile photos
- **Access**: Public (anyone can view)
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, JPG, PNG, WebP
- **Structure**: `{user_id}/{timestamp}.{ext}`

### 2. Verification Documents (`verification-documents`)
- **Purpose**: Store identity verification documents
- **Access**: Private (only user and admins)
- **File Size Limit**: 10MB
- **Allowed Types**: PDF, JPEG, JPG, PNG
- **Structure**: `{user_id}/{timestamp}.{ext}`

### 3. Horoscopes (`horoscopes`)
- **Purpose**: Store horoscope files
- **Access**: Private (user + premium connections)
- **File Size Limit**: 10MB
- **Allowed Types**: PDF, JPEG, JPG, PNG
- **Structure**: `{user_id}/horoscope.{ext}`

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar

3. **Create Buckets**
   
   **Profile Photos:**
   - Click "New bucket"
   - Name: `profile-photos`
   - Public bucket: ✓ (checked)
   - File size limit: 5242880 (5MB)
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`
   - Click "Create bucket"

   **Verification Documents:**
   - Click "New bucket"
   - Name: `verification-documents`
   - Public bucket: ✗ (unchecked)
   - File size limit: 10485760 (10MB)
   - Allowed MIME types: `application/pdf, image/jpeg, image/jpg, image/png`
   - Click "Create bucket"

   **Horoscopes:**
   - Click "New bucket"
   - Name: `horoscopes`
   - Public bucket: ✗ (unchecked)
   - File size limit: 10485760 (10MB)
   - Allowed MIME types: `application/pdf, image/jpeg, image/jpg, image/png`
   - Click "Create bucket"

4. **Apply Storage Policies**
   - Go to "Storage" → "Policies"
   - Click "New policy" for each bucket
   - Copy and paste the policies from `supabase/storage/buckets.sql`
   - Or run the SQL file in the SQL Editor

### Option 2: Using SQL Editor

1. **Open SQL Editor**
   - Go to Supabase Dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run Storage Setup Script**
   - Copy the contents of `supabase/storage/buckets.sql`
   - Paste into the SQL Editor
   - Click "Run"

3. **Verify Buckets**
   - Go to "Storage" in the left sidebar
   - You should see all three buckets created

## Storage Policies

### Profile Photos Policies

1. **Upload**: Users can upload photos to their own folder
2. **Update**: Users can update their own photos
3. **Delete**: Users can delete their own photos
4. **View**: Public access (anyone can view)

### Verification Documents Policies

1. **Upload**: Users can upload documents to their own folder
2. **View**: Only the user can view their own documents
3. **Delete**: Users can delete their own documents

### Horoscopes Policies

1. **Upload**: Users can upload their horoscope
2. **Update**: Users can update their horoscope
3. **View**: User + premium connections can view
4. **Delete**: Users can delete their horoscope

## Testing Storage

### Test Photo Upload

```typescript
import { StorageService } from '@/services/api';

// Upload a photo
const file = /* File object from input */;
const { data: photoUrl, error } = await StorageService.uploadPhoto(file);

if (error) {
  console.error('Upload failed:', error);
} else {
  console.log('Photo uploaded:', photoUrl);
}
```

### Test Document Upload

```typescript
import { StorageService } from '@/services/api';

// Upload a document
const file = /* File object from input */;
const { data: docUrl, error } = await StorageService.uploadDocument(file);

if (error) {
  console.error('Upload failed:', error);
} else {
  console.log('Document uploaded:', docUrl);
}
```

### Test Horoscope Upload

```typescript
import { StorageService } from '@/services/api';

// Upload a horoscope
const file = /* File object from input */;
const { data: horoscopeUrl, error } = await StorageService.uploadHoroscope(file);

if (error) {
  console.error('Upload failed:', error);
} else {
  console.log('Horoscope uploaded:', horoscopeUrl);
}
```

## Storage Limits

- **Profile Photos**: 5MB per file
- **Verification Documents**: 10MB per file
- **Horoscopes**: 10MB per file
- **Total Storage**: Check your Supabase plan limits

## Security Considerations

1. **File Validation**: All uploads are validated for type and size
2. **Image Compression**: Photos are compressed before upload
3. **User Isolation**: Users can only access their own files
4. **Premium Features**: Horoscope viewing requires premium subscription
5. **RLS Policies**: Row Level Security enforces access control

## Troubleshooting

### Upload Fails with "Permission Denied"

- Check that storage policies are correctly applied
- Verify user is authenticated
- Ensure file is being uploaded to correct user folder

### File Size Too Large

- Check file size before upload
- For photos, compression is automatic
- For documents, user must reduce size manually

### Invalid File Type

- Verify file MIME type matches allowed types
- Check file extension is correct

## Monitoring

Monitor storage usage in Supabase Dashboard:
- Go to "Settings" → "Usage"
- Check "Storage" section
- Set up alerts for storage limits

## Backup

Supabase automatically backs up storage:
- Daily backups for Pro plan and above
- Point-in-time recovery available
- Manual export available via API

## Next Steps

After setting up storage:
1. Test file uploads in development
2. Verify policies work correctly
3. Test with different user roles
4. Monitor storage usage
5. Set up CDN if needed for better performance

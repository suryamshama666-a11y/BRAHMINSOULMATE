/**
 * Storage Configuration
 * Centralized configuration for Supabase Storage buckets
 */

export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  VERIFICATION_DOCUMENTS: 'verification-documents',
  HOROSCOPES: 'horoscopes',
} as const;

export const STORAGE_LIMITS = {
  PROFILE_PHOTO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  HOROSCOPE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

export const ALLOWED_MIME_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
} as const;

export const IMAGE_COMPRESSION = {
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 1200,
  QUALITY: 0.85,
  FORMAT: 'image/jpeg',
} as const;

/**
 * Get storage bucket URL
 */
export function getStorageBucketUrl(bucket: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}`;
}

/**
 * Get file path in storage
 */
export function getStorageFilePath(userId: string, filename: string): string {
  return `${userId}/${filename}`;
}

/**
 * Extract filename from storage URL
 */
export function extractFilenameFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  } catch {
    return null;
  }
}

/**
 * Extract storage file path (userId/filename) from URL
 * Used for deleting files from storage
 */
export function extractStorageFilePath(url: string): string | null {
  try {
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/');
  } catch {
    return null;
  }
}

/**
 * Extract user ID from storage path
 */
export function extractUserIdFromPath(path: string): string | null {
  try {
    const pathParts = path.split('/');
    return pathParts[0];
  } catch {
    return null;
  }
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(fileType: string, allowedTypes: readonly string[]): boolean {
  return allowedTypes.includes(fileType);
}

/**
 * Check if file size is within limit
 */
export function isFileSizeValid(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const extension = originalFilename.split('.').pop();
  return `${timestamp}.${extension}`;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!isAllowedFileType(file.type, ALLOWED_MIME_TYPES.IMAGES)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.IMAGES.join(', ')}`
    };
  }
  
  if (!isFileSizeValid(file.size, STORAGE_LIMITS.PROFILE_PHOTO_MAX_SIZE)) {
    return {
      valid: false,
      error: `File size must be less than ${formatFileSize(STORAGE_LIMITS.PROFILE_PHOTO_MAX_SIZE)}`
    };
  }
  
  return { valid: true };
}

/**
 * Validate document file
 */
export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
  if (!isAllowedFileType(file.type, ALLOWED_MIME_TYPES.DOCUMENTS)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.DOCUMENTS.join(', ')}`
    };
  }
  
  if (!isFileSizeValid(file.size, STORAGE_LIMITS.DOCUMENT_MAX_SIZE)) {
    return {
      valid: false,
      error: `File size must be less than ${formatFileSize(STORAGE_LIMITS.DOCUMENT_MAX_SIZE)}`
    };
  }
  
  return { valid: true };
}

export default {
  STORAGE_BUCKETS,
  STORAGE_LIMITS,
  ALLOWED_MIME_TYPES,
  IMAGE_COMPRESSION,
  getStorageBucketUrl,
  getStorageFilePath,
  extractFilenameFromUrl,
  extractStorageFilePath,
  extractUserIdFromPath,
  isAllowedFileType,
  isFileSizeValid,
  formatFileSize,
  generateUniqueFilename,
  validateImageFile,
  validateDocumentFile,
};

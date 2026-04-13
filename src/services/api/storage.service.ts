/**
 * Storage Service
 * Handles file uploads and downloads from Supabase Storage
 */

import { supabase, apiCall, APIResponse, getCurrentUserId, ErrorCode, APIError } from './base';

export class StorageService {
  private static readonly PHOTOS_BUCKET = 'profile-photos';
  private static readonly DOCUMENTS_BUCKET = 'verification-documents';
  private static readonly HOROSCOPE_BUCKET = 'horoscopes';
  
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private static readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  /**
   * Validate file before upload
   */
  private static validateFile(
    file: File,
    allowedTypes: string[],
    maxSize: number = this.MAX_FILE_SIZE
  ): { valid: boolean; error?: string } {
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type must be one of: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Compress image before upload
   */
  private static async compressImage(file: File, maxWidth: number = 1200): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.85
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  }

  /**
   * Upload photo to profile photos bucket
   */
  static async uploadPhoto(file: File): Promise<APIResponse<string>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        data: null,
        error: new APIError(ErrorCode.AUTH_ERROR, 'User not authenticated', 401)
      };
    }

    // Validate file
    const validation = this.validateFile(file, this.ALLOWED_IMAGE_TYPES);
    if (!validation.valid) {
      return {
        data: null,
        error: new APIError(ErrorCode.VALIDATION_ERROR, validation.error!, 400)
      };
    }

    return apiCall(async () => {
      try {
        // Compress image
        const compressedBlob = await this.compressImage(file);
        
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from(this.PHOTOS_BUCKET)
          .upload(fileName, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(this.PHOTOS_BUCKET)
          .getPublicUrl(fileName);

        return { data: publicUrl, error: null };
      } catch (error) {
        return {
          data: null,
          error: new APIError(ErrorCode.UPLOAD_FAILED, 'Failed to upload photo', 500, error)
        };
      }
    });
  }

  /**
   * Delete photo from storage
   */
  static async deletePhoto(photoUrl: string): Promise<APIResponse<void>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        data: null,
        error: new APIError(ErrorCode.AUTH_ERROR, 'User not authenticated', 401)
      };
    }

    return apiCall(async () => {
      try {
        // Extract file path from URL
        const urlParts = photoUrl.split('/');
        const fileName = urlParts.slice(-2).join('/'); // userId/filename

        const { error } = await supabase.storage
          .from(this.PHOTOS_BUCKET)
          .remove([fileName]);

        if (error) throw error;

        return { data: null, error: null };
      } catch (error) {
        return {
          data: null,
          error: new APIError(ErrorCode.UPLOAD_FAILED, 'Failed to delete photo', 500, error)
        };
      }
    });
  }

  /**
   * Upload verification document
   */
  static async uploadDocument(file: File): Promise<APIResponse<string>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        data: null,
        error: new APIError(ErrorCode.AUTH_ERROR, 'User not authenticated', 401)
      };
    }

    // Validate file
    const validation = this.validateFile(file, this.ALLOWED_DOCUMENT_TYPES);
    if (!validation.valid) {
      return {
        data: null,
        error: new APIError(ErrorCode.VALIDATION_ERROR, validation.error!, 400)
      };
    }

    return apiCall(async () => {
      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from(this.DOCUMENTS_BUCKET)
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(this.DOCUMENTS_BUCKET)
          .getPublicUrl(fileName);

        return { data: publicUrl, error: null };
      } catch (error) {
        return {
          data: null,
          error: new APIError(ErrorCode.UPLOAD_FAILED, 'Failed to upload document', 500, error)
        };
      }
    });
  }

  /**
   * Upload horoscope file
   */
  static async uploadHoroscope(file: File): Promise<APIResponse<string>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        data: null,
        error: new APIError(ErrorCode.AUTH_ERROR, 'User not authenticated', 401)
      };
    }

    // Validate file
    const validation = this.validateFile(file, this.ALLOWED_DOCUMENT_TYPES);
    if (!validation.valid) {
      return {
        data: null,
        error: new APIError(ErrorCode.VALIDATION_ERROR, validation.error!, 400)
      };
    }

    return apiCall(async () => {
      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/horoscope.${fileExt}`;

        // Upload to Supabase Storage (upsert to replace existing)
        const { error } = await supabase.storage
          .from(this.HOROSCOPE_BUCKET)
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(this.HOROSCOPE_BUCKET)
          .getPublicUrl(fileName);

        return { data: publicUrl, error: null };
      } catch (error) {
        return {
          data: null,
          error: new APIError(ErrorCode.UPLOAD_FAILED, 'Failed to upload horoscope', 500, error)
        };
      }
    });
  }

  /**
   * Get signed URL for private file
   */
  static async getSignedUrl(
    bucket: string,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<APIResponse<string>> {
    return apiCall(async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;

      return { data: data.signedUrl, error: null };
    });
  }

  /**
   * List files in user's folder
   */
  static async listUserFiles(bucket: string): Promise<APIResponse<string[]>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        data: null,
        error: new APIError(ErrorCode.AUTH_ERROR, 'User not authenticated', 401)
      };
    }

    return apiCall(async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(userId);

      if (error) throw error;

      const fileUrls = data.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(`${userId}/${file.name}`);
        return publicUrl;
      });

      return { data: fileUrls, error: null };
    });
  }
}

export default StorageService;

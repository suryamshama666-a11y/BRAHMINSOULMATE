import { env } from '@/config/env';
import { supabase } from '@/integrations/supabase/client';

// Error codes enum
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Custom API Error class
export class APIError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Error handler function
export const handleAPIError = (error: any): APIError => {
  // Supabase specific errors
  if (error.code === 'PGRST116') {
    return new APIError(
      ErrorCode.NOT_FOUND,
      'Resource not found',
      404,
      error
    );
  }

  if (error.code === 'PGRST301') {
    return new APIError(
      ErrorCode.PERMISSION_DENIED,
      'Permission denied',
      403,
      error
    );
  }

  if (error.message?.includes('JWT') || error.message?.includes('token')) {
    return new APIError(
      ErrorCode.AUTH_ERROR,
      'Authentication failed. Please login again.',
      401,
      error
    );
  }

  if (error.code?.startsWith('23')) {
    return new APIError(
      ErrorCode.DATABASE_ERROR,
      'Database operation failed',
      500,
      error
    );
  }

  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return new APIError(
      ErrorCode.NETWORK_ERROR,
      'Network error. Please check your connection.',
      503,
      error
    );
  }

  // Default error
  return new APIError(
    ErrorCode.UNKNOWN_ERROR,
    error.message || 'An unexpected error occurred',
    500,
    error
  );
};

// Base API response type
export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
}

// Helper function to wrap API calls
export async function apiCall<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<APIResponse<T>> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      return {
        data: null,
        error: handleAPIError(error)
      };
    }

    return {
      data,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: handleAPIError(error)
    };
  }
}

/**
 * Enhanced helper for backend API calls
 * Handles authentication headers automatically
 */
export async function backendCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  try {
    // Get current session for JWT
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const url = `${env.api.url}/${cleanEndpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: null, error: null };
    }

    const result = await response.json();

    if (!response.ok) {
      // Create specific error based on status code
      let code = ErrorCode.UNKNOWN_ERROR;
      if (response.status === 401) code = ErrorCode.AUTH_ERROR;
      if (response.status === 403) code = ErrorCode.PERMISSION_DENIED;
      if (response.status === 404) code = ErrorCode.NOT_FOUND;
      if (response.status === 400) code = ErrorCode.VALIDATION_ERROR;

      return {
        data: null,
        error: new APIError(
          code,
          result.error || 'API request failed',
          response.status,
          result
        )
      };
    }

    // Backend returns data in different shapes, normalize it
    const data = result.profile || result.profiles || result.data || result;

    return {
      data: data as T,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: handleAPIError(error)
    };
  }
}

// Get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Retry logic for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

export { supabase };

import { env } from '@/config/env';
import { supabase } from '@/integrations/supabase/client';
export { supabase };
import { APIError as IAPIError, APIResponse as IAPIResponse } from '@/types/errors';

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

// Custom API Error class implementing the interface
export class APIError extends Error implements IAPIError {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Re-export the interface as well
export type { IAPIResponse as APIResponse };

// Error handler function
export const handleAPIError = (error: unknown): APIError => {
  const err = error as any; // Temporary cast for checking properties safely
  
  // Supabase specific errors
  if (err?.code === 'PGRST116') {
    return new APIError(
      ErrorCode.NOT_FOUND,
      'Resource not found',
      404,
      error
    );
  }

  if (err?.code === 'PGRST301') {
    return new APIError(
      ErrorCode.PERMISSION_DENIED,
      'Permission denied',
      403,
      error
    );
  }

  if (err?.message?.includes('JWT') || err?.message?.includes('token')) {
    return new APIError(
      ErrorCode.AUTH_ERROR,
      'Authentication failed. Please login again.',
      401,
      error
    );
  }

  if (err?.code?.startsWith('23')) {
    return new APIError(
      ErrorCode.DATABASE_ERROR,
      'Database operation failed',
      500,
      error
    );
  }

  // Network errors
  if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
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
    err?.message || 'An unexpected error occurred',
    500,
    error
  );
};

// Helper function to wrap API calls
export async function apiCall<T>(
  operation: () => Promise<{ data: T | null; error: unknown }>
): Promise<IAPIResponse<T>> {
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

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

/**
 * Enhanced helper for backend API calls
 * Handles authentication headers automatically
 */
export async function backendCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<IAPIResponse<T>> {
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
      return {
        data: null,
        error: new APIError(
          result.error?.code || ErrorCode.UNKNOWN_ERROR,
          result.error?.message || 'API request failed',
          response.status,
          result.error?.details
        )
      };
    }

    return {
      data: result.data || result,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: handleAPIError(error)
    };
  }
}

/**
 * Error type definitions for type-safe error handling
 */

/**
 * API error response structure
 */
export interface APIError {
  code: string;
  message: string;
  statusCode: number;
  name: string;
  details?: Record<string, unknown>;
}

/**
 * API response structure
 */
export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
}

/**
 * Type guard for API errors
 */
export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'statusCode' in error &&
    'name' in error &&
    typeof (error as APIError).code === 'string' &&
    typeof (error as APIError).message === 'string' &&
    typeof (error as APIError).statusCode === 'number' &&
    typeof (error as APIError).name === 'string'
  );
}

/**
 * Supabase error structure
 */
export interface SupabaseError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Type guard for Supabase errors
 */
export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as SupabaseError).message === 'string'
  );
}

/**
 * Network error structure
 */
export interface NetworkError extends Error {
  status?: number;
  statusText?: string;
  url?: string;
}

/**
 * Type guard for network errors
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof Error;
}

/**
 * Validation error structure
 */
export interface ValidationError extends Error {
  field?: string;
  value?: unknown;
  constraint?: string;
}

/**
 * Type guard for validation errors
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof Error && 'field' in error;
}

/**
 * Authentication error structure
 */
export interface AuthError extends Error {
  code?: string;
  status?: number;
}

/**
 * Type guard for auth errors
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof Error && ('code' in error || 'status' in error);
}

/**
 * Generic error handler that safely extracts error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (isAPIError(error)) {
    return error.message;
  }

  if (isSupabaseError(error)) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as Record<string, unknown>).message;
    if (typeof msg === 'string') {
      return msg;
    }
  }

  return 'An unknown error occurred';
}

/**
 * Safely extract error code
 */
export function getErrorCode(error: unknown): string {
  if (isAPIError(error)) {
    return error.code;
  }

  if (isSupabaseError(error)) {
    return error.code || 'UNKNOWN';
  }

  if (isAuthError(error)) {
    return error.code || 'AUTH_ERROR';
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Safely extract HTTP status code
 */
export function getErrorStatus(error: unknown): number {
  if (isAPIError(error)) {
    return error.statusCode;
  }

  if (isSupabaseError(error)) {
    return error.status || 500;
  }

  if (isNetworkError(error)) {
    return error.status || 500;
  }

  return 500;
}

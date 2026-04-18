/**
 * Centralized error handling utilities for backend routes
 * Consolidates duplicate error message extraction logic
 */

/**
 * Extract error message from unknown error type
 * @param error - Unknown error object
 * @returns Human-readable error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
};

/**
 * Create standardized error response
 * @param error - Error object
 * @param statusCode - HTTP status code (default: 500)
 * @returns Standardized error response object
 */
export const createErrorResponse = (error: unknown, statusCode: number = 500) => {
  return {
    success: false,
    error: getErrorMessage(error),
    statusCode
  };
};

/**
 * Create standardized success response
 * @param data - Response data
 * @param message - Optional success message
 * @returns Standardized success response object
 */
export const createSuccessResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data })
  };
};

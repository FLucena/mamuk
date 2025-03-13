import { NextResponse } from 'next/server';

/**
 * Standard error types for API responses
 */
export enum ApiErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
  error: {
    type: ApiErrorType;
    message: string;
    details?: any;
  };
}

/**
 * Error handler for API routes
 * @param error The error object
 * @param defaultMessage Default error message if none is provided
 * @returns NextResponse with standardized error format
 */
export function handleApiError(
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): NextResponse {
  console.error('API Error:', error);
  
  // Default to internal server error
  let statusCode = 500;
  let errorType = ApiErrorType.INTERNAL_SERVER_ERROR;
  let message = defaultMessage;
  let details = undefined;
  
  // Handle known error types
  if (error instanceof Error) {
    message = error.message;
    
    // Handle specific error types
    if ('code' in error && typeof error.code === 'string') {
      const code = error.code;
      
      // Map error codes to status codes and types
      if (code === 'UNAUTHORIZED' || code === 'auth/unauthorized') {
        statusCode = 401;
        errorType = ApiErrorType.UNAUTHORIZED;
      } else if (code === 'FORBIDDEN' || code === 'auth/forbidden') {
        statusCode = 403;
        errorType = ApiErrorType.FORBIDDEN;
      } else if (code === 'NOT_FOUND' || code === 'db/not-found') {
        statusCode = 404;
        errorType = ApiErrorType.NOT_FOUND;
      } else if (code === 'VALIDATION_ERROR' || code === 'validation/error') {
        statusCode = 400;
        errorType = ApiErrorType.VALIDATION_ERROR;
        
        // Include validation details if available
        if ('details' in error) {
          details = error.details;
        }
      } else if (code === 'RATE_LIMIT_EXCEEDED') {
        statusCode = 429;
        errorType = ApiErrorType.RATE_LIMIT_EXCEEDED;
      }
    }
  }
  
  // Create standardized error response
  const errorResponse: ApiErrorResponse = {
    error: {
      type: errorType,
      message,
      details: details
    },
  };
  
  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Create a custom API error with code and message
 * @param message Error message
 * @param code Error code
 * @param details Additional error details
 * @returns Custom error object
 */
export function createApiError(
  message: string,
  code: string,
  details?: any
): Error & { code: string; details?: any } {
  const error = new Error(message) as Error & { code: string; details?: any };
  error.code = code;
  if (details) {
    error.details = details;
  }
  return error;
} 
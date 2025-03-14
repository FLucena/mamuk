/**
 * Utilidad para manejar errores de forma segura
 * Oculta detalles sensibles en producción
 */

import { NextResponse } from 'next/server';

interface ErrorResponseOptions {
  status?: number;
  publicMessage?: string;
  logError?: boolean;
}

/**
 * Registra un error en el sistema de logs
 * En producción, podría enviar el error a un servicio de monitoreo
 */
export function logErrorToSystem(error: unknown, context: string = ''): void {
  if (process.env.NODE_ENV === 'production') {
    // En producción, podría enviar a un servicio como Sentry
    console.error(`[${context}] Error occurred`);
    
    // Aquí se podría integrar con servicios de monitoreo
    // if (Sentry) Sentry.captureException(error);
  } else {
    // En desarrollo, mostrar detalles completos
    console.error(`[${context}] Error details:`, error);
  }
}

/**
 * Crea una respuesta de error segura
 * Oculta detalles sensibles en producción
 */
export function createErrorResponse(
  error: unknown, 
  options: ErrorResponseOptions = {}
): NextResponse {
  const { 
    status = 500, 
    publicMessage = 'An unexpected error occurred', 
    logError = true 
  } = options;
  
  // Registrar el error si es necesario
  if (logError) {
    logErrorToSystem(error);
  }
  
  // Determinar el mensaje de error
  let errorMessage = publicMessage;
  let errorDetails = null;
  
  // En desarrollo, incluir detalles del error
  if (process.env.NODE_ENV !== 'production') {
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack,
      };
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
  }
  
  // Crear la respuesta
  return NextResponse.json(
    {
      error: true,
      message: errorMessage,
      ...(errorDetails && { details: errorDetails }),
    },
    { status }
  );
}

/**
 * Maneja errores de validación
 */
export function createValidationErrorResponse(
  errors: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    {
      error: true,
      message: 'Validation failed',
      errors,
    },
    { status: 400 }
  );
}

/**
 * Maneja errores de autenticación
 */
export function createAuthErrorResponse(
  message: string = 'Authentication required'
): NextResponse {
  return NextResponse.json(
    {
      error: true,
      message,
    },
    { status: 401 }
  );
}

/**
 * Maneja errores de autorización
 */
export function createForbiddenErrorResponse(
  message: string = 'Access denied'
): NextResponse {
  return NextResponse.json(
    {
      error: true,
      message,
    },
    { status: 403 }
  );
}

/**
 * Maneja errores de recursos no encontrados
 */
export function createNotFoundErrorResponse(
  message: string = 'Resource not found'
): NextResponse {
  return NextResponse.json(
    {
      error: true,
      message,
    },
    { status: 404 }
  );
}

/**
 * Maneja errores de rate limiting
 */
export function createRateLimitErrorResponse(
  retryAfter: number = 60
): NextResponse {
  return NextResponse.json(
    {
      error: true,
      message: 'Too many requests, please try again later',
    },
    { 
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
      }
    }
  );
} 
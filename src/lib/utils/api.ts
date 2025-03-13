import { NextResponse } from 'next/server';

/**
 * Tipos de cache para diferentes tipos de contenido
 */
export enum CacheType {
  PRIVATE = 'private',
  PUBLIC = 'public',
  NO_STORE = 'no-store',
}

/**
 * Opciones para configurar la respuesta API
 */
interface ApiResponseOptions {
  status?: number;
  cacheType?: CacheType;
  maxAge?: number;
  staleWhileRevalidate?: number;
  headers?: Record<string, string>;
}

/**
 * Crea una respuesta API optimizada con cabeceras de caché apropiadas
 * 
 * @param data Datos a devolver en la respuesta
 * @param options Opciones de configuración
 * @returns Respuesta NextResponse optimizada
 */
export function createApiResponse(
  data: any,
  options: ApiResponseOptions = {}
): NextResponse {
  const {
    status = 200,
    cacheType = CacheType.NO_STORE,
    maxAge = 0,
    staleWhileRevalidate = 0,
    headers = {},
  } = options;

  // Construir la directiva Cache-Control
  let cacheControl: string = cacheType;
  
  if (cacheType !== CacheType.NO_STORE) {
    cacheControl += `, max-age=${maxAge}`;
    
    if (staleWhileRevalidate > 0) {
      cacheControl += `, stale-while-revalidate=${staleWhileRevalidate}`;
    }
  }

  // Combinar cabeceras personalizadas con las de caché
  const responseHeaders: Record<string, string> = {
    'Cache-Control': cacheControl,
    ...headers,
  };

  // Añadir cabecera de tiempo de respuesta para depuración
  const startTime = process.hrtime();
  const responseTime = process.hrtime(startTime);
  const responseTimeMs = (responseTime[0] * 1e9 + responseTime[1]) / 1e6;
  
  responseHeaders['X-Response-Time'] = `${responseTimeMs.toFixed(2)}ms`;

  // Crear y devolver la respuesta
  return NextResponse.json(data, {
    status,
    headers: responseHeaders,
  });
}

/**
 * Crea una respuesta de error API optimizada
 * 
 * @param message Mensaje de error
 * @param status Código de estado HTTP
 * @param additionalData Datos adicionales a incluir en la respuesta
 * @returns Respuesta NextResponse de error optimizada
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  additionalData: Record<string, any> = {}
): NextResponse {
  return createApiResponse(
    {
      error: message,
      ...additionalData,
    },
    {
      status,
      cacheType: CacheType.NO_STORE,
    }
  );
}

/**
 * Ejemplos de uso común para diferentes tipos de contenido
 */

/**
 * Crea una respuesta para contenido público que puede ser cacheado por largo tiempo
 * Útil para datos que cambian con poca frecuencia (ej. metadatos, configuración)
 */
export function createPublicCachedResponse(data: any, maxAgeSeconds: number = 3600) {
  return createApiResponse(data, {
    cacheType: CacheType.PUBLIC,
    maxAge: maxAgeSeconds,
    staleWhileRevalidate: maxAgeSeconds * 2,
  });
}

/**
 * Crea una respuesta para contenido privado con caché de corta duración
 * Útil para datos personalizados que pueden ser cacheados brevemente (ej. preferencias de usuario)
 */
export function createPrivateCachedResponse(data: any, maxAgeSeconds: number = 60) {
  return createApiResponse(data, {
    cacheType: CacheType.PRIVATE,
    maxAge: maxAgeSeconds,
    staleWhileRevalidate: maxAgeSeconds * 2,
  });
}

/**
 * Crea una respuesta para contenido dinámico que no debe ser cacheado
 * Útil para datos que cambian frecuentemente o son altamente personalizados
 */
export function createDynamicResponse(data: any) {
  return createApiResponse(data, {
    cacheType: CacheType.NO_STORE,
  });
} 
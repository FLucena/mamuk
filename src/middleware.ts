import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { Role } from './lib/types/user';
import type { NextRequest } from 'next/server';
import { isProtectedRoute, getRequiredRoles, checkRouteAccess, trackRedirect } from './utils/authNavigation';
import { getToken } from 'next-auth/jwt';

interface Token {
  roles: Role[];
  name?: string;
  email?: string;
  id?: string;
}

// Almacén en memoria para rate limiting (en producción debería usar Redis u otro almacén distribuido)
const ipRequests: Record<string, { count: number; resetTime: number }> = {};

// Performance optimization: Cache auth decisions for a short period
const AUTH_CACHE = new Map<string, { decision: NextResponse; timestamp: number }>();
const CACHE_TTL = 10 * 1000; // 10 seconds

/**
 * Verifica si la solicitud debe ser redirigida a www
 */
function checkDomainRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Redirigir de mamuk.com.ar a www.mamuk.com.ar
  if (hostname === 'mamuk.com.ar') {
    url.hostname = 'www.mamuk.com.ar';
    return NextResponse.redirect(url);
  }
  
  return null;
}

/**
 * Protects debug routes in production
 */
function protectDebugRoutes(request: NextRequest) {
  // Check if this is a debug route
  if (request.nextUrl.pathname.startsWith('/debug')) {
    // Only allow access in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!isDevelopment) {
      console.warn(`[Security] Blocked access to debug route in production: ${request.nextUrl.pathname}`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return null;
}

/**
 * Implementa rate limiting basado en IP
 * @returns true si la solicitud debe ser bloqueada, false en caso contrario
 */
function shouldRateLimit(request: NextRequest): boolean {
  // Solo aplicar rate limiting a endpoints críticos
  const isCriticalEndpoint = 
    (request.nextUrl.pathname === '/api/auth/login' || 
     request.nextUrl.pathname === '/api/auth/register' ||
     request.nextUrl.pathname === '/api/auth/reset-password') &&
    request.method === 'POST';
  
  if (!isCriticalEndpoint) {
    return false;
  }
  
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxRequests = 10; // Máximo 10 intentos en 15 minutos
  
  // Inicializar o limpiar entradas antiguas
  if (!ipRequests[ip] || ipRequests[ip].resetTime < now) {
    ipRequests[ip] = { count: 0, resetTime: now + windowMs };
  }
  
  // Incrementar contador
  ipRequests[ip].count += 1;
  
  // Verificar si excede el límite
  return ipRequests[ip].count > maxRequests;
}

/**
 * Handle service worker files to ensure they have the correct MIME type
 */
function handleServiceWorkerFiles(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a service worker file
  if (pathname === '/sw.js' || pathname === '/sw-register.js') {
    // Create a response
    const response = NextResponse.next();
    
    // Set the correct MIME type
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    if (pathname === '/sw.js') {
      response.headers.set('Service-Worker-Allowed', '/');
    }
    
    return response;
  }
  
  return null;
}

/**
 * Handle session API requests to improve performance
 */
function handleSessionRequests(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a session API request
  if (pathname === '/api/auth/session') {
    // Create a response
    const response = NextResponse.next();
    
    // Add cache headers for better performance
    // Allow client caching for 5 seconds to reduce redundant requests
    response.headers.set('Cache-Control', 'private, max-age=5');
    
    // Add a Vary header to ensure proper caching
    response.headers.set('Vary', 'Cookie, Authorization');
    
    return response;
  }
  
  return null;
}

/**
 * Aplica cabeceras de seguridad a la respuesta
 */
function applySecurityHeaders(request: NextRequest, response: NextResponse) {
  // Determinar si es una solicitud para manifest.json o sw.js
  const isManifestRequest = request.nextUrl.pathname === '/manifest.json';
  const isServiceWorkerRequest = request.nextUrl.pathname === '/sw.js' || 
                                request.nextUrl.pathname === '/sw-register.js' ||
                                request.nextUrl.pathname === '/api/sw' ||
                                request.nextUrl.pathname === '/api/sw-register';
  
  // Añadir cabeceras de seguridad
  const securityHeaders: Record<string, string> = {
    'X-DNS-Prefetch-Control': 'on',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'X-Frame-Options': 'DENY', // Denegar por defecto, se eliminará para rutas específicas
  };
  
  // Añadir cabeceras CORS para recursos específicos
  if (isManifestRequest || isServiceWorkerRequest) {
    // Restringir CORS a dominios específicos
    const allowedOrigins = [
      'https://www.mamuk.com.ar',
      'https://mamuk.com.ar',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    const origin = request.headers.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
      securityHeaders['Access-Control-Allow-Origin'] = origin;
    } else {
      // En producción, usar solo el dominio principal
      securityHeaders['Access-Control-Allow-Origin'] = process.env.NODE_ENV === 'production' 
        ? 'https://www.mamuk.com.ar' 
        : '*';
    }
    
    securityHeaders['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    securityHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    
    // Establecer el tipo de contenido correcto
    if (isManifestRequest) {
      securityHeaders['Content-Type'] = 'application/manifest+json';
    } else if (isServiceWorkerRequest) {
      securityHeaders['Content-Type'] = 'application/javascript; charset=utf-8';
      securityHeaders['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      
      // Add Service-Worker-Allowed header for sw.js
      if (request.nextUrl.pathname === '/sw.js') {
        securityHeaders['Service-Worker-Allowed'] = '/';
      }
    }
  }
  
  // Aplicar las cabeceras de seguridad
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Generar nonce para scripts
  const nonce = typeof crypto.randomUUID === 'function' 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
  
  // Determinar si estamos en desarrollo o producción
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Define common image sources
  const imgSrc = isDevelopment
    ? `'self' data: https://www.mamuk.com.ar https://mamuk.com.ar https://cdn.jsdelivr.net https://fonts.gstatic.com https://images.unsplash.com https://*.googleusercontent.com https://avatars.githubusercontent.com https://ui-avatars.com https://randomuser.me https://picsum.photos https://placehold.co`
    : `'self' data: https://www.mamuk.com.ar https://mamuk.com.ar https://cdn.jsdelivr.net https://fonts.gstatic.com https://images.unsplash.com https://*.googleusercontent.com`;
  
  // Define connect-src directive
  const connectSrc = isDevelopment
    ? `'self' https://www.mamuk.com.ar https://mamuk.com.ar https://api.mamuk.com.ar http://localhost:* ws://localhost:*`
    : `'self' https://www.mamuk.com.ar https://mamuk.com.ar https://api.mamuk.com.ar`;

  // Base CSP directives that are common for all routes
  const baseCSP = {
    'default-src': ["'self'"],
    'script-src': isDevelopment 
      ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"] 
      : ["'self'", `'nonce-${nonce}'`, "https://cdn.jsdelivr.net"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Next.js requires unsafe-inline for styles
    'img-src': [imgSrc],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'connect-src': [connectSrc],
    'frame-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'manifest-src': ["'self'"],
    'media-src': ["'self'"],
    'worker-src': ["'self'", "blob:"],
    'child-src': ["'self'", "blob:"],
  };

  // Add frame-src exceptions for routes that need video embeds
  if (
    request.nextUrl.pathname.startsWith('/workout') ||
    request.nextUrl.pathname.startsWith('/coach')
  ) {
    baseCSP['frame-src'] = ["'self'", "https://www.youtube.com", "https://youtube.com", "https://player.vimeo.com", "https://vimeo.com"];
    // Remove X-Frame-Options to allow iframes
    response.headers.delete('X-Frame-Options');
  }

  // Convert CSP object to string
  const cspString = Object.entries(baseCSP)
    .map(([key, values]) => `${key} ${Array.isArray(values) ? values.join(' ') : values}`)
    .join('; ');

  // Set the CSP header
  response.headers.set('Content-Security-Policy', cspString);

  // Pass the nonce to the response for HTML pages
  if (response.headers.get('content-type')?.includes('text/html')) {
    response.headers.set('x-csp-nonce', nonce);
  }
  
  // Implementar protección contra ataques de fuerza bruta con rate limiting
  if (
    (request.nextUrl.pathname === '/api/auth/login' || 
     request.nextUrl.pathname === '/api/auth/register' ||
     request.nextUrl.pathname === '/api/auth/reset-password') &&
    request.method === 'POST'
  ) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Añadir cabeceras de rate limiting
    if (ipRequests[ip]) {
      const remaining = Math.max(0, 10 - ipRequests[ip].count);
      const reset = Math.ceil((ipRequests[ip].resetTime - Date.now()) / 1000);
      
      response.headers.set('X-RateLimit-Limit', '10');
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());
    }
  }
  
  return response;
}

/**
 * Middleware for handling authentication and authorization
 * Optimized to reduce redundant session checks and API calls
 */
export default withAuth(
  async function middleware(request: NextRequest) {
    // Get the pathname of the request
    const path = request.nextUrl.pathname;
    
    // Skip middleware for static files and API routes
    if (
      path.startsWith('/_next') ||
      path.startsWith('/static') ||
      path.startsWith('/api') ||
      path.includes('.') ||
      path === '/favicon.ico'
    ) {
      return NextResponse.next();
    }
    
    // Check for domain redirect first
    const domainRedirect = checkDomainRedirect(request);
    if (domainRedirect) return domainRedirect;
    
    // Handle service worker files
    const swResponse = handleServiceWorkerFiles(request);
    if (swResponse) return swResponse;
    
    // Handle session requests
    const sessionResponse = handleSessionRequests(request);
    if (sessionResponse) return sessionResponse;
    
    // Protect debug routes in production
    const debugResponse = protectDebugRoutes(request);
    if (debugResponse) return debugResponse;
    
    // Check rate limiting for critical endpoints
    if (shouldRateLimit(request)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      // Get the token from the request
      const token = await getToken({ req: request });
      
      // Create a session-like object from the token
      const session = token ? {
        user: {
          id: token.id || '',
          roles: token.roles || ['customer'],
          email: token.email,
          name: token.name
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      } : null;
      
      // Check route access
      const { hasAccess, redirectTo, reason } = checkRouteAccess(path, session);
      
      // If redirect is needed and it's safe to do so
      if (!hasAccess && redirectTo && trackRedirect(path, redirectTo)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = redirectTo;
        
        // If redirecting to signin, add the callback URL
        if (redirectTo === '/auth/signin') {
          redirectUrl.searchParams.set('callbackUrl', path);
        }
        
        // Log the redirect in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Auth] Redirecting from ${path} to ${redirectUrl.pathname} - Reason: ${reason}`);
        }
        
        return NextResponse.redirect(redirectUrl);
      }
      
      // Continue with the request
      const response = NextResponse.next();
      
      // Apply security headers
      applySecurityHeaders(request, response);
      
      return response;
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This is called by next-auth before our middleware
        // We'll do our actual auth check in the middleware
        return true;
      },
    },
  }
);

/**
 * Cache an auth decision for a short period to reduce redundant checks
 */
function cacheAuthDecision(key: string, decision: NextResponse): void {
  AUTH_CACHE.set(key, {
    decision,
    timestamp: Date.now(),
  });
  
  // Clean up old cache entries periodically
  if (AUTH_CACHE.size > 100) {
    const now = Date.now();
    // Use Array.from to convert Map entries to an array for compatibility
    Array.from(AUTH_CACHE.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > CACHE_TTL) {
        AUTH_CACHE.delete(key);
      }
    });
  }
}

// Specify which routes require authentication and include service worker files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (Service Worker)
     * - sw-register.js (Service Worker registration)
     */
    '/((?!api|_next|fonts|icons|images|[\\w-]+\\.\\w+).*)',
    '/debug/:path*',
  ],
}; 
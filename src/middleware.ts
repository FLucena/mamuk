import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { Role } from './lib/types/user';
import type { NextRequest } from 'next/server';
import { isProtectedRoute, getRequiredRoles, checkRouteAccess, trackRedirect, createSessionFromToken } from './utils/authNavigation';
import { getToken } from 'next-auth/jwt';

interface Token {
  roles: Role[];
  name?: string;
  email?: string;
  id?: string;
}

// Almacén en memoria para rate limiting (en producción debería usar Redis u otro almacén distribuido)
const ipRequests: Record<string, { count: number; resetTime: number; blockedUntil?: number }> = {};

// Performance optimization: Cache auth decisions for a short period
const AUTH_CACHE = new Map<string, { decision: { hasAccess: boolean; redirectTo: string | null; reason: string }; timestamp: number }>();
const CACHE_TTL = 10 * 1000; // 10 seconds

// Clear the cache on startup to ensure our permission changes take effect immediately
console.log('[Auth] Clearing auth cache to apply new permission settings');
AUTH_CACHE.clear();

// Suspicious IP tracking
const suspiciousIPs: Record<string, { count: number; lastAttempt: number; blocked: boolean }> = {};

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
function shouldRateLimit(request: NextRequest): { blocked: boolean; reason?: string; remainingAttempts?: number } {
  // Solo aplicar rate limiting a endpoints críticos
  const isCriticalEndpoint = 
    (request.nextUrl.pathname === '/api/auth/login' || 
     request.nextUrl.pathname === '/api/auth/register' ||
     request.nextUrl.pathname === '/api/auth/reset-password' ||
     request.nextUrl.pathname === '/auth/signin') &&
    request.method === 'POST';
  
  if (!isCriticalEndpoint) {
    return { blocked: false };
  }
  
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxRequests = 10; // Máximo 10 intentos en 15 minutos
  const blockDuration = 30 * 60 * 1000; // 30 minutos de bloqueo
  
  // Check if IP is currently blocked
  if (ipRequests[ip]?.blockedUntil && ipRequests[ip].blockedUntil > now) {
    const timeRemaining = Math.ceil((ipRequests[ip].blockedUntil! - now) / 1000);
    return { 
      blocked: true, 
      reason: `Too many authentication attempts. Please try again in ${timeRemaining} seconds.` 
    };
  }
  
  // Inicializar o limpiar entradas antiguas
  if (!ipRequests[ip] || ipRequests[ip].resetTime < now) {
    ipRequests[ip] = { count: 0, resetTime: now + windowMs };
  }
  
  // Incrementar contador
  ipRequests[ip].count += 1;
  
  // Verificar si excede el límite
  if (ipRequests[ip].count > maxRequests) {
    // Block the IP for the block duration
    ipRequests[ip].blockedUntil = now + blockDuration;
    
    return { 
      blocked: true, 
      reason: `Too many authentication attempts. Please try again in ${blockDuration / 60000} minutes.` 
    };
  }
  
  // Not blocked, return remaining attempts
  return { 
    blocked: false,
    remainingAttempts: maxRequests - ipRequests[ip].count
  };
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
  
  // Generar nonce para scripts - use the one from request headers if available
  const nonce = request.headers.get('x-nonce') || 
    (typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64'));
  
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

  // Set the nonce in the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  
  // Check if this is an auth page
  const isAuthPage = 
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.includes('signin') ||
    request.nextUrl.pathname.includes('signout');

  // Define CSP based on page type and environment
  let cspHeader = '';
  
  if (isDevelopment) {
    // Development CSP - more permissive
    cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src ${imgSrc};
      font-src 'self' https://fonts.gstatic.com;
      connect-src ${connectSrc};
      frame-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      worker-src 'self' blob:;
      child-src 'self' blob:;
      upgrade-insecure-requests;
    `;
  } else if (isAuthPage) {
    // Auth pages CSP - more permissive for auth functionality
    cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src ${imgSrc};
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://accounts.google.com https://*.googleapis.com https://www.mamuk.com.ar https://mamuk.com.ar https://api.mamuk.com.ar http://localhost:* ws://localhost:*;
      frame-src 'self' https://accounts.google.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      worker-src 'self' blob:;
      child-src 'self' blob:;
      upgrade-insecure-requests;
    `;
  } else {
    // Regular pages CSP - stricter with nonce
    cspHeader = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net 'unsafe-inline' 'sha256-wcH7AZ3AcJJpGNwM/YsSDmB12/KfulIDMGC1AFRMt/M=' 'sha256-eMuh8xiwcX72rRYNAGENurQBAcH7kLlAUQcoOri3BIo=' 'strict-dynamic';
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src ${imgSrc};
      font-src 'self' https://fonts.gstatic.com;
      connect-src ${connectSrc};
      frame-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      worker-src 'self' blob:;
      child-src 'self' blob:;
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `;
  }

  // Add frame-src exceptions for routes that need video embeds
  if (
    request.nextUrl.pathname.startsWith('/workout') ||
    request.nextUrl.pathname.startsWith('/coach')
  ) {
    cspHeader = cspHeader.replace(
      "frame-src 'self';",
      "frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com;"
    );
    // Remove X-Frame-Options to allow iframes
    response.headers.delete('X-Frame-Options');
  }

  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Set the CSP header
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  // Pass the nonce to the response for HTML pages
  if (response.headers.get('content-type')?.includes('text/html')) {
    response.headers.set('x-nonce', nonce);
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
 * Checks if an IP is suspicious based on patterns of behavior
 */
function checkSuspiciousIP(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
             
  const now = Date.now();
  
  // Initialize tracking for this IP if not exists
  if (!suspiciousIPs[ip]) {
    suspiciousIPs[ip] = { count: 0, lastAttempt: now, blocked: false };
  }
  
  // If already blocked, return true
  if (suspiciousIPs[ip].blocked) {
    return true;
  }
  
  // Check for rapid successive requests (potential bot/script)
  const timeSinceLastAttempt = now - suspiciousIPs[ip].lastAttempt;
  suspiciousIPs[ip].lastAttempt = now;
  
  // If requests are coming too fast (less than 500ms apart)
  if (timeSinceLastAttempt < 500) {
    suspiciousIPs[ip].count += 1;
    
    // If we've seen 5 or more rapid requests, block the IP
    if (suspiciousIPs[ip].count >= 5) {
      suspiciousIPs[ip].blocked = true;
      
      // Log the blocked IP
      console.warn(`[Security] Blocked suspicious IP: ${ip} - Too many rapid requests`);
      
      return true;
    }
  } else {
    // Reset counter if requests are not rapid
    suspiciousIPs[ip].count = Math.max(0, suspiciousIPs[ip].count - 1);
  }
  
  return false;
}

/**
 * Configure headers to enable back/forward cache (bfcache) support
 */
function enableBfCache(request: NextRequest, response: NextResponse) {
  const { pathname } = request.nextUrl;
  
  // Skip for API routes and WebSocket endpoints
  if (pathname.startsWith('/api/') || 
      request.headers.get('upgrade') === 'websocket' ||
      pathname.includes('/_next/webpack-hmr')) {
    return response;
  }
  
  // Skip for authentication routes
  if (pathname.startsWith('/auth/') || 
      pathname === '/api/auth/signin' || 
      pathname === '/api/auth/signout') {
    return response;
  }

  // For static routes that should support bfcache
  if (pathname.startsWith('/workout') || 
      pathname === '/' || 
      pathname.startsWith('/profile') ||
      pathname.startsWith('/exercises')) {
    
    // Remove no-store directive from Cache-Control if it exists
    const cacheControl = response.headers.get('Cache-Control');
    if (cacheControl && cacheControl.includes('no-store')) {
      // Modify the header to enable bfcache
      response.headers.set(
        'Cache-Control', 
        'private, max-age=0'
      );
    }
    
    // Add header to explicitly opt-in to bfcache where possible
    response.headers.set('Cache-Control-Allow-Bfcache', 'true');
  }
  
  return response;
}

/**
 * Middleware for handling authentication and authorization
 * Optimized to reduce redundant session checks and API calls
 */
export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Rate limiting for auth endpoints
    if (pathname.startsWith('/api/auth') && req.method !== 'GET') {
      const ip = req.ip ?? 'unknown';
      const limiter = createRateLimiter(ip);
      const { success, limit, remaining, reset } = await limiter.limit();
      
      if (!success) {
        trackSuspiciousIP(ip, 'rate_limit_exceeded');
        console.warn(`[Auth] Rate limit exceeded for ${ip}`);
        return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        });
      }
    }
    
    // Skip auth checks for public routes or API routes not requiring auth
    if (
      PUBLIC_ROUTES.some(route => pathname.startsWith(route)) ||
      (pathname.startsWith('/api/') && !API_AUTH_ROUTES.some(route => pathname.startsWith(route)))
    ) {
      return NextResponse.next();
    }

    const session = req.auth;
    
    // Redirect unauthenticated users to login
    if (!session) {
      trackRedirect(req.nextUrl.pathname, '/login');
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(url);
    }
    
    // Check route access - modified to bypass role checks
    // Any authenticated user now has access to all routes
    /* Original role-based check disabled:
    const { hasAccess, redirectTo, reason } = checkRouteAccess(pathname, session.user?.roles || []);
    
    if (!hasAccess && redirectTo) {
      console.log(`[Auth] Access denied to ${pathname}: ${reason}`);
      trackRedirect(req.nextUrl.pathname, redirectTo);
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    */
    
    // Allow access to any authenticated user
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

/**
 * Cache an auth decision for a short period to reduce redundant checks
 */
function cacheAuthDecision(path: string, session: any, decision: { hasAccess: boolean; redirectTo: string | null; reason: string }): void {
  // Create a cache key based on path and user roles
  const roles = session?.user?.roles || [];
  const cacheKey = `${path}:${roles.join(',')}`;
  
  AUTH_CACHE.set(cacheKey, {
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

/**
 * Get a cached auth decision if available
 */
function getCachedAuthDecision(path: string, session: any): { hasAccess: boolean; redirectTo: string | null; reason: string } | null {
  // Create a cache key based on path and user roles
  const roles = session?.user?.roles || [];
  const cacheKey = `${path}:${roles.join(',')}`;
  
  const cached = AUTH_CACHE.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.decision;
  }
  
  return null;
}

// Specify which paths this middleware will run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    '/manifest.json',
    '/icon.png',
    '/favicon.ico',
    '/apple-touch-icon.png',
  ],
}; 
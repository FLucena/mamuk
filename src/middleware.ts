import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { Role } from './lib/types/user';
import type { NextRequest } from 'next/server';

interface Token {
  roles: Role[];
  name?: string;
  email?: string;
  id?: string;
}

// Almacén en memoria para rate limiting (en producción debería usar Redis u otro almacén distribuido)
const ipRequests: Record<string, { count: number; resetTime: number }> = {};

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
 * Aplica cabeceras de seguridad a la respuesta
 */
function applySecurityHeaders(request: NextRequest, response: NextResponse) {
  // Determinar si es una solicitud para manifest.json o sw.js
  const isManifestRequest = request.nextUrl.pathname === '/manifest.json';
  const isServiceWorkerRequest = request.nextUrl.pathname === '/sw.js';
  
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
      'http://localhost:3000'
    ];
    
    const origin = request.headers.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
      securityHeaders['Access-Control-Allow-Origin'] = origin;
    } else {
      // En producción, usar solo el dominio principal
      securityHeaders['Access-Control-Allow-Origin'] = 'https://www.mamuk.com.ar';
    }
    
    securityHeaders['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    securityHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    
    // Establecer el tipo de contenido correcto
    if (isManifestRequest) {
      securityHeaders['Content-Type'] = 'application/manifest+json';
    } else if (isServiceWorkerRequest) {
      securityHeaders['Content-Type'] = 'application/javascript; charset=utf-8';
      securityHeaders['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }
  }
  
  // Aplicar las cabeceras de seguridad
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Generar nonce para scripts
  const nonce = crypto.randomUUID();
  
  // Permitir iframes para videos en rutas específicas
  if (
    request.nextUrl.pathname.startsWith('/workout') ||
    request.nextUrl.pathname.startsWith('/coach')
  ) {
    // No establecer X-Frame-Options para permitir iframes
    response.headers.delete('X-Frame-Options');
    
    // Configurar CSP para permitir iframes de YouTube y Vimeo
    response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: https://www.mamuk.com.ar https://mamuk.com.ar https://cdn.jsdelivr.net https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.mamuk.com.ar https://mamuk.com.ar https://api.mamuk.com.ar; frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com; object-src 'none'; base-uri 'self'; require-trusted-types-for 'script';`
    );
  } else if (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/achievements')
  ) {
    response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: https://www.mamuk.com.ar https://mamuk.com.ar https://cdn.jsdelivr.net https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.mamuk.com.ar https://mamuk.com.ar https://api.mamuk.com.ar; frame-src 'none'; object-src 'none'; base-uri 'self'; require-trusted-types-for 'script';`
    );
  } else {
    // CSP para otras rutas
    response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: https://www.mamuk.com.ar https://mamuk.com.ar https://cdn.jsdelivr.net https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.mamuk.com.ar https://mamuk.com.ar https://api.mamuk.com.ar; frame-src 'none'; object-src 'none'; base-uri 'self'; require-trusted-types-for 'script';`
    );
  }
  
  // Pasar el nonce a la respuesta para que pueda ser utilizado en scripts inline
  const html = response.headers.get('content-type')?.includes('text/html');
  if (html) {
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
 * Middleware principal que combina autenticación y seguridad
 */
export default withAuth(
  function middleware(request) {
    // Primero verificar si necesitamos redirigir el dominio
    const redirectResponse = checkDomainRedirect(request);
    if (redirectResponse) {
      return redirectResponse;
    }
    
    // Verificar rate limiting
    if (shouldRateLimit(request)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests', 
          message: 'Please try again later' 
        }),
        { 
          status: 429, 
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutos en segundos
          }
        }
      );
    }
    
    // Obtener la respuesta original
    const response = NextResponse.next();
    
    // Aplicar cabeceras de seguridad
    return applySecurityHeaders(request, response);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        
        // Verificar que el token existe
        if (!token) {
          console.log('Middleware: No token found');
          return false;
        }
        
        // Ensure the user has valid roles
        const tokenWithRoles = token as Token;
        
        // If no roles are defined but we have a token with email, consider it valid
        // but assign default customer role
        if (!tokenWithRoles.roles && tokenWithRoles.email) {
          if (process.env.AUTH_DEBUG === 'true') {
            console.log('Middleware: Token has email but no roles, assigning default role');
          }
          tokenWithRoles.roles = ['customer'];
          return true;
        }
        
        // Check if roles is an array
        if (!Array.isArray(tokenWithRoles.roles)) {
          if (process.env.AUTH_DEBUG === 'true') {
            console.log('Middleware: Token roles is not an array');
          }
          return false;
        }
        
        // Check if any of the roles is valid
        const validRoles = ['admin', 'coach', 'customer'];
        const hasValidRole = tokenWithRoles.roles.some(role => 
          validRoles.includes(role)
        );
        
        if (process.env.NODE_ENV === 'development' && process.env.AUTH_DEBUG === 'true') {
          console.log('Middleware: Has valid role:', hasValidRole);
        }
        
        // If at least one role is valid, allow access
        return hasValidRole;
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
  }
);

/**
 * Configurar las rutas a las que se aplicará el middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - / (homepage)
     * - /api (API routes)
     * - /auth (authentication routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - /logo.png (logo file)
     * - /manifest.json (PWA manifest)
     * - /sw.js (Service Worker)
     */
    '/dashboard/:path*',
    '/workout/:path*',
    '/profile/:path*',
    '/achievements/:path*',
    '/coach/:path*',
    '/admin/:path*',
  ],
}; 
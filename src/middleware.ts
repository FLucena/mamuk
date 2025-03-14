import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { Role } from './lib/types/user';
import type { NextRequest } from 'next/server';
import { isProtectedRoute, getRequiredRoles } from './utils/authNavigation';

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
      'http://localhost:3000'
    ];
    
    const origin = request.headers.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
      securityHeaders['Access-Control-Allow-Origin'] = origin;
    } else {
      // En producción, usar solo el dominio principal
      securityHeaders['Access-Control-Allow-Origin'] = process.env.NODE_ENV === 'production' 
        ? 'https://www.mamuk.com.ar' 
        : 'http://localhost:3000';
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
  
  // Permitir iframes para videos en rutas específicas
  if (
    request.nextUrl.pathname.startsWith('/workout') ||
    request.nextUrl.pathname.startsWith('/coach')
  ) {
    // No establecer X-Frame-Options para permitir iframes
    response.headers.delete('X-Frame-Options');
    
    // Configurar CSP para permitir iframes de YouTube y Vimeo
    // En desarrollo, permitir 'unsafe-inline' y 'unsafe-eval'
    const scriptSrc = isDevelopment 
      ? `'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net` 
      : `'self' 'nonce-${nonce}' https://cdn.jsdelivr.net`;
    
    const styleSrc = isDevelopment
      ? `'self' 'unsafe-inline' https://fonts.googleapis.com`
      : `'self' https://fonts.googleapis.com`;
    
    response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; script-src ${scriptSrc}; style-src ${styleSrc}; img-src ${imgSrc}; font-src 'self' https://fonts.gstatic.com; connect-src ${connectSrc}; frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com; object-src 'none'; base-uri 'self';`
    );
  } else if (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/achievements')
  ) {
    const scriptSrc = isDevelopment 
      ? `'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net` 
      : `'self' 'nonce-${nonce}' https://cdn.jsdelivr.net`;
    
    const styleSrc = isDevelopment
      ? `'self' 'unsafe-inline' https://fonts.googleapis.com`
      : `'self' https://fonts.googleapis.com`;
    
    response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; script-src ${scriptSrc}; style-src ${styleSrc}; img-src ${imgSrc}; font-src 'self' https://fonts.gstatic.com; connect-src ${connectSrc}; frame-src 'none'; object-src 'none'; base-uri 'self';`
    );
  } else {
    // CSP para otras rutas
    const scriptSrc = isDevelopment 
      ? `'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net` 
      : `'self' 'nonce-${nonce}' https://cdn.jsdelivr.net`;
    
    const styleSrc = isDevelopment
      ? `'self' 'unsafe-inline' https://fonts.googleapis.com`
      : `'self' https://fonts.googleapis.com`;
    
    response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; script-src ${scriptSrc}; style-src ${styleSrc}; img-src ${imgSrc}; font-src 'self' https://fonts.gstatic.com; connect-src ${connectSrc}; frame-src 'none'; object-src 'none'; base-uri 'self';`
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
        const pathname = req.nextUrl.pathname;
        
        // If the route is not protected, allow access
        if (!isProtectedRoute(pathname)) {
          return true;
        }
        
        // Verificar que el token existe
        if (!token) {
          if (process.env.AUTH_DEBUG === 'true') {
            console.log(`Middleware: No token found for ${pathname}`);
          }
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
        
        // Get required roles for this route
        const requiredRoles = getRequiredRoles(pathname);
        
        // If route is public (no required roles), allow access
        if (!requiredRoles) {
          return true;
        }
        
        // Check if user has any of the required roles
        const hasRequiredRole = requiredRoles.some(role => 
          tokenWithRoles.roles.includes(role)
        );
        
        if (process.env.AUTH_DEBUG === 'true' && !hasRequiredRole) {
          console.log(`Middleware: User lacks required role(s) for ${pathname}. Required: ${requiredRoles.join(', ')}, User has: ${tokenWithRoles.roles.join(', ')}`);
        }
        
        return hasRequiredRole;
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
  }
);

// Specify which routes require authentication
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/workout/:path*',
    '/achievements/:path*',
    '/profile/:path*',
    '/coach/:path*',
    '/admin/:path*',
    '/api/workout/:path*',
    '/api/user/:path*',
    '/api/coach/:path*',
    '/api/admin/:path*',
    
    // Exclude static files and public routes
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|sw-register.js|offline.html|logo.png|api/auth).*)',
  ],
}; 
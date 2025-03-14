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
 * Aplica cabeceras de seguridad a la respuesta
 */
function applySecurityHeaders(request: NextRequest, response: NextResponse) {
  // Añadir cabeceras de seguridad
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    // Añadir cabeceras CORS para resolver el problema de manifest.json
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Aplicar las cabeceras de seguridad
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
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
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*; frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com https://*.firebasestorage.googleapis.com https://*.amazonaws.com https://*.cloudfront.net https://*.cloudinary.com; object-src 'none'; base-uri 'self';"
    );
  } else if (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/achievements')
  ) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*; frame-src 'none'; object-src 'none'; base-uri 'self';"
    );
  }
  
  // Implementar protección básica contra ataques de fuerza bruta
  if (
    (request.nextUrl.pathname === '/api/auth/login' || 
     request.nextUrl.pathname === '/api/auth/register') &&
    request.method === 'POST'
  ) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    response.headers.set('X-Rate-Limit-By', ip);
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
     */
    '/dashboard/:path*',
    '/workout/:path*',
    '/profile/:path*',
    '/achievements/:path*',
    '/coach/:path*',
    '/admin/:path*',
    // Añadir manifest.json para manejar CORS
    '/manifest.json',
  ],
}; 
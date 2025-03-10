import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { Role } from './lib/types/user';
import type { NextRequest } from 'next/server';

interface Token {
  role: Role;
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
    request.nextUrl.pathname.startsWith('/profile')
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
    // Obtener la respuesta original
    const response = NextResponse.next();
    
    // Aplicar cabeceras de seguridad
    return applySecurityHeaders(request, response);
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Verificar que el token existe y tiene un rol válido
        if (!token) return false;
        
        // Accept any valid role
        const role = token.role as Role;
        return role === 'admin' || role === 'coach' || role === 'customer';
      },
    },
    pages: {
      // Ensure we're using the correct sign-in page
      signIn: '/auth/signin',
    }
  }
);

/**
 * Configurar las rutas a las que se aplicará el middleware
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workout/:path*',
    '/profile/:path*',
  ],
}; 
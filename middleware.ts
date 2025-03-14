import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Handle static files specifically
  if (pathname === '/manifest.json' || pathname === '/icon.png' || pathname === '/favicon.ico' || pathname === '/apple-touch-icon.png') {
    const response = NextResponse.next();
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  }

  // Handle www to non-www redirect
  const hostname = request.headers.get('host') || '';
  const wwwRegex = /^www\./;
  
  if (wwwRegex.test(hostname)) {
    const newHost = hostname.replace(wwwRegex, '');
    return NextResponse.redirect(
      `https://${newHost}${pathname}${request.nextUrl.search}`,
      { status: 301 }
    );
  }

  return NextResponse.next();
}

// Specify which paths this middleware will run for
export const config = {
  matcher: [
    '/manifest.json',
    '/icon.png',
    '/favicon.ico',
    '/apple-touch-icon.png',
    '/((?!api|_next/static|_next/image).*)',
  ],
}; 
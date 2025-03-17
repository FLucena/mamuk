import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Skip middleware for service worker and other critical browser files
  if (pathname.includes('sw.js') || 
      pathname.includes('workbox') || 
      pathname.includes('worker') || 
      pathname.includes('service-worker')) {
    return NextResponse.next();
  }

  // Check if this is a script request that would be affected by redirects
  const isScriptRequest = request.headers.get('sec-fetch-dest') === 'script' || 
                          pathname.endsWith('.js') || 
                          pathname.endsWith('.json') ||
                          pathname.includes('_next/static');
  
  if (isScriptRequest) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  }

  // Handle static files specifically
  if (pathname === '/manifest.json' || pathname === '/icon.png' || pathname === '/favicon.ico' || pathname === '/apple-touch-icon.png') {
    const response = NextResponse.next();
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Cache-Control', 'public, max-age=86400');
    
    return response;
  }

  // Handle www to non-www redirect
  const hostname = request.headers.get('host') || '';
  const wwwRegex = /^www\./;
  
  if (wwwRegex.test(hostname)) {
    const newHost = hostname.replace(wwwRegex, '');
    const redirectUrl = `https://${newHost}${pathname}${request.nextUrl.search}`;
    
    const response = NextResponse.redirect(redirectUrl, { status: 301 });
    
    // Add headers for redirect
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }

  // Default response
  return NextResponse.next();
}

// Reduce middleware scope to avoid processing unnecessary routes
export const config = {
  matcher: [
    // Only match specific files and exclude all script/asset requests
    '/manifest.json',
    '/icon.png',
    '/favicon.ico',
    '/apple-touch-icon.png',
    // Exclude Next.js assets, API routes, static files, etc.
    '/((?!_next/static|_next/image|_next/script|api|static|.*\\.js$|.*\\.json$).*)',
  ],
}; 
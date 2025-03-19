import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // In production, block access to all debug routes
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // In development, allow debug routes
  return NextResponse.next();
}

export const config = {
  // This matcher will apply this middleware to all routes under /debug
  matcher: '/debug/:path*',
}; 
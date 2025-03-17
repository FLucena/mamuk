import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is completely disabled to avoid any potential redirect issues
// We're using a simplified approach without route protection
export function middleware(req: NextRequest) {
  // Return next response directly - no processing
  return NextResponse.next();
}

// Empty matcher to ensure the middleware doesn't run for any routes
export const config = {
  matcher: [],
}; 
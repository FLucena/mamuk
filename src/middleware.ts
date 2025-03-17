import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a simplified middleware that only performs basic functions
// All complex authentication handling has been removed
export function middleware(req: NextRequest) {
  // Return next response directly - no auth checking
  return NextResponse.next();
}

// Keep matcher minimal to avoid processing most routes
export const config = {
  matcher: [
    // Only match a very limited set of routes if absolutely needed
    // For now, we're not matching any routes to avoid middleware processing entirely
  ],
}; 
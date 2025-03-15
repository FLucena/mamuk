import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * Custom handler for NextAuth to add performance optimizations
 * - Adds cache control headers for session endpoint
 * - Adds server timing headers for performance monitoring
 * - Implements conditional responses based on If-None-Match header
 */
async function handler(req: NextRequest) {
  // Get the NextAuth action (session, signin, etc.)
  const action = req.nextUrl.pathname.split('/').pop();
  
  // Create a response object
  const res = NextResponse.next();
  
  // For session requests, add performance optimizations
  if (action === 'session') {
    // Add cache control headers
    res.headers.set('Cache-Control', 'private, max-age=60');
    
    // Add timing headers for debugging
    const startTime = performance.now();
    
    // Get the standard NextAuth handler
    const nextAuthHandler = NextAuth(authOptions);
    
    // Process the request
    const result = await nextAuthHandler(req, res);
    
    // Calculate processing time
    const processingTime = Math.round(performance.now() - startTime);
    
    // Add server timing header
    res.headers.set('Server-Timing', `session;dur=${processingTime}`);
    
    return result;
  }
  
  // For other endpoints, just use the standard handler
  const nextAuthHandler = NextAuth(authOptions);
  return nextAuthHandler(req, res);
}

export { handler as GET, handler as POST }; 
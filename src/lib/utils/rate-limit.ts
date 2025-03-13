import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting
// In production, you would use Redis or another distributed store
const rateLimit = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  limit: number;        // Maximum number of requests
  windowMs: number;     // Time window in milliseconds
  message?: string;     // Custom error message
}

/**
 * Simple rate limiting utility for API routes
 * @param request The incoming request
 * @param options Rate limiting options
 * @returns NextResponse if rate limit is exceeded, null otherwise
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const now = Date.now();
  const ip = request.ip || 'unknown';
  
  // Safely get user agent, handling both Headers object and plain objects
  let userAgent = 'unknown';
  try {
    if (request.headers && typeof request.headers.get === 'function') {
      userAgent = request.headers.get('user-agent') || 'unknown';
    } else if (request.headers) {
      // Handle case where headers might be a plain object in tests
      const headers = request.headers as unknown as Record<string, string>;
      userAgent = headers['user-agent'] || 'unknown';
    }
  } catch (e) {
    // If there's any error accessing headers, use the default value
    console.warn('Error accessing request headers:', e);
  }
  
  // Create a unique key for this client
  // In production, you might want to use just the IP or a session ID
  const key = `${ip}:${userAgent}`;
  
  // Get or create rate limit data for this client
  const rateLimitData = rateLimit.get(key) || { 
    count: 0, 
    resetTime: now + options.windowMs 
  };
  
  // Reset count if the time window has passed
  if (now > rateLimitData.resetTime) {
    rateLimitData.count = 0;
    rateLimitData.resetTime = now + options.windowMs;
  }
  
  // Increment request count
  rateLimitData.count++;
  
  // Update the store
  rateLimit.set(key, rateLimitData);
  
  // Check if rate limit is exceeded
  if (rateLimitData.count > options.limit) {
    const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
    
    return NextResponse.json(
      { 
        error: options.message || 'Too many requests, please try again later',
        retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(options.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimitData.resetTime / 1000)),
        }
      }
    );
  }
  
  return null;
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import { createPrivateCachedResponse, createErrorResponse } from '@/lib/utils/api';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/user';
import { Role } from '@/lib/types/user';
import { createHash } from 'crypto';
import { JsonObject, JsonValue } from '@/types/common';

// In-memory cache for user roles with TTL
interface CacheEntry {
  roles: Role[];
  timestamp: number;
}
const userRolesCache = new Map<string, CacheEntry>();
const ROLES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds (up from 1 minute)
const SESSION_CACHE_TIME = 30; // 30 seconds (up from 10)

// Define runtime environment
export const runtime = 'nodejs'; // 'nodejs' (default) | 'edge'

// Configure dynamic behavior
export const dynamic = 'force-dynamic'; // 'auto' | 'force-static' | 'force-dynamic' | 'error'

/**
 * Generate ETag for a session object
 */
function generateETag(session: Record<string, unknown>): string {
  const hash = createHash('md5')
    .update(JSON.stringify(session))
    .digest('hex');
  return `W/"${hash}"`;
}

/**
 * Get cached user roles or fetch from database
 */
async function getUserRoles(email: string): Promise<Role[]> {
  // Check if we have a valid cache entry
  const cacheEntry = userRolesCache.get(email);
  const now = Date.now();
  
  if (cacheEntry && (now - cacheEntry.timestamp) < ROLES_CACHE_TTL) {
    return cacheEntry.roles;
  }
  
  // Fetch from database if not in cache or expired
  try {
    await dbConnect();
    const startTime = performance.now();
    
    // Use an optimized query with lean(), hint() for index usage, and proper type casting
    const dbUser = await (User.findOne as any)({ email })
      .select('roles')
      .hint({ email: 1 }) // Explicitly use the email index
      .lean()
      .exec() as { roles: Role[] } | null;
    
    const queryTime = performance.now() - startTime;
    console.log(`[Session] Database query for ${email} took ${queryTime.toFixed(2)}ms`);
    
    if (dbUser && dbUser.roles) {
      // Update cache
      userRolesCache.set(email, {
        roles: dbUser.roles,
        timestamp: now
      });
      console.log(`[Session] Cache updated for ${email} with roles: ${dbUser.roles.join(', ')}`);
      return dbUser.roles;
    }
  } catch (error) {
    console.error('Error fetching user roles:', error);
  }
  
  // Return default role if we couldn't get roles from DB
  console.log(`[Session] Returning default role for ${email}`);
  return ['customer'];
}

// GET /api/auth/session - Get current session
export async function GET() {
  const requestStart = performance.now();
  
  try {
    // Check for If-None-Match header for conditional requests
    const headersList = headers();
    const ifNoneMatch = headersList.get('if-none-match');
    const userAgent = headersList.get('user-agent');
    
    // Get the session (this is already optimized by Next-Auth)
    const session = await getServerSession(authOptions);
    
    // If no session, return empty session with 200 status code
    // This prevents NextAuth client errors in the browser console
    if (!session) {
      const emptyResponse: JsonObject = { 
        authenticated: false,
        user: null,
        expires: null
      };
      
      const response = createPrivateCachedResponse(
        emptyResponse,
        SESSION_CACHE_TIME
      );
      
      // Add ETag
      response.headers.set('ETag', generateETag({ authenticated: false }));
      
      const requestTime = performance.now() - requestStart;
      console.log(`[Session] No session response in ${requestTime.toFixed(2)}ms`);
      
      return response;
    }
    
    // Get the most up-to-date roles from cache or database
    let roles: Role[] = session.user.roles || [];
    
    if (session.user.email) {
      roles = await getUserRoles(session.user.email);
    }
    
    // Create the session response object
    const sessionResponse: JsonObject = {
      authenticated: true,
      user: {
        id: session.user.id || '',
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
        roles: roles
      },
      expires: session.expires || null,
      // Include request metadata
      meta: {
        userAgent: userAgent || null,
        timestamp: new Date().toISOString()
      }
    };
    
    // Generate ETag for the response
    const etag = generateETag(sessionResponse);
    
    // If ETag matches, return 304 Not Modified
    if (ifNoneMatch && ifNoneMatch === etag) {
      const notModifiedResponse = new NextResponse(null, {
        status: 304,
        headers: {
          'Cache-Control': `private, max-age=${SESSION_CACHE_TIME}, stale-while-revalidate=${SESSION_CACHE_TIME * 2}`,
          'ETag': etag
        }
      });
      
      const requestTime = performance.now() - requestStart;
      console.log(`[Session] 304 Not Modified in ${requestTime.toFixed(2)}ms`);
      
      return notModifiedResponse;
    }
    
    // Return session data with short-lived cache
    const response = createPrivateCachedResponse(
      sessionResponse,
      SESSION_CACHE_TIME
    );
    
    // Add ETag
    response.headers.set('ETag', etag);
    
    return response;
  } catch (error) {
    console.error('Error fetching session:', error);
    return createErrorResponse('Error fetching session', 500);
  }
}

// POST /api/auth/session/refresh - Refresh session
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return createErrorResponse('No active session to refresh', 401);
    }
    
    // Clear cache entry for this user if exists
    if (session.user.email) {
      userRolesCache.delete(session.user.email);
    }
    
    // In a real implementation, you would refresh the session token here
    
    return createPrivateCachedResponse({
      success: true,
      message: 'Session refreshed',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    }, SESSION_CACHE_TIME);
  } catch (error) {
    console.error('Error refreshing session:', error);
    return createErrorResponse('Error refreshing session', 500);
  }
}

// DELETE /api/auth/session - Sign out
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    // Clear cache entry for this user if exists
    if (session?.user?.email) {
      userRolesCache.delete(session.user.email);
    }
    
    // In a real implementation, you would invalidate the session here
    
    return createPrivateCachedResponse({
      success: true,
      message: 'Signed out successfully'
    }, 0); // No caching for sign out
  } catch (error) {
    console.error('Error signing out:', error);
    return createErrorResponse('Error signing out', 500);
  }
} 
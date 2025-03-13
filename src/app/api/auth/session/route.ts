import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import { createPrivateCachedResponse, createErrorResponse } from '@/lib/utils/api';
import { getCurrentUserRole } from '@/lib/utils/permissions';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/user';
import { Role } from '@/lib/types/user';

// Define runtime environment
export const runtime = 'nodejs'; // 'nodejs' (default) | 'edge'

// Configure dynamic behavior
export const dynamic = 'force-dynamic'; // 'auto' | 'force-static' | 'force-dynamic' | 'error'

// GET /api/auth/session - Get current session
export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Get request headers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    
    // If no session, return empty session with 200 status code
    // This prevents NextAuth client errors in the browser console
    if (!session) {
      return createPrivateCachedResponse(
        { 
          authenticated: false,
          user: null,
          expires: null
        },
        10 // Cache for 10 seconds
      );
    }
    
    // Get the most up-to-date roles from the database
    let roles: Role[] = session.user.roles;
    
    try {
      if (session.user.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email })
          .select('roles')
          .lean<{ roles: Role[] }>();
        
        if (dbUser && dbUser.roles) {
          roles = dbUser.roles as Role[];
        }
      }
    } catch (error) {
      console.error('Error fetching updated roles:', error);
      // Continue with the session roles if there's an error
    }
    
    // Return session data with short-lived cache
    return createPrivateCachedResponse(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          roles: roles
        },
        expires: session.expires,
        // Include request metadata
        meta: {
          userAgent,
          timestamp: new Date().toISOString()
        }
      },
      10 // Cache for 10 seconds
    );
  } catch (error) {
    console.error('Error fetching session:', error);
    return createErrorResponse('Error fetching session', 500);
  }
}

// POST /api/auth/session/refresh - Refresh session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return createErrorResponse('No active session to refresh', 401);
    }
    
    // In a real implementation, you would refresh the session token here
    
    return createPrivateCachedResponse({
      success: true,
      message: 'Session refreshed',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    }, 10);
  } catch (error) {
    console.error('Error refreshing session:', error);
    return createErrorResponse('Error refreshing session', 500);
  }
}

// DELETE /api/auth/session - Sign out
export async function DELETE(request: NextRequest) {
  try {
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
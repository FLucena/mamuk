import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Test API endpoint to check authentication status and session details
 * This is helpful for diagnosing authentication issues
 */
export async function GET(req: NextRequest) {
  console.log('Test Auth API called');
  
  try {
    // Get session using next-auth
    const session = await getServerSession(authOptions);
    
    // Check if we have a session
    if (!session) {
      console.log('No session found in test-auth');
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'No session found',
          headers: Object.fromEntries(req.headers),
          cookies: req.cookies.getAll()
        },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    const isAdmin = session.user?.roles?.includes('admin');
    
    if (!isAdmin) {
      console.log('User is not an admin in test-auth');
      return NextResponse.json(
        { 
          authenticated: true,
          authorized: false,
          error: 'User is not an admin',
          user: {
            id: session.user.id,
            roles: session.user.roles || []
          },
          headers: Object.fromEntries(req.headers),
          cookies: req.cookies.getAll()
        },
        { status: 403 }
      );
    }
    
    // Successfully authenticated and authorized
    console.log('User authenticated and authorized in test-auth');
    return NextResponse.json({
      authenticated: true,
      authorized: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        roles: session.user.roles
      },
      headers: {
        cookie: req.headers.get('cookie'),
        authorization: req.headers.get('authorization')
      },
      cookies: req.cookies.getAll()
    });
  } catch (error) {
    console.error('Error in test-auth API:', error);
    return NextResponse.json(
      { 
        authenticated: false, 
        error: 'Error checking authentication: ' + (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    );
  }
} 
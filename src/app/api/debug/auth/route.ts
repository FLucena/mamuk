import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import { checkRouteAccess } from '@/utils/authNavigation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the server session
    const session = await getServerSession(authOptions);
    
    // Get the JWT token
    const token = await getToken({ req: request });
    
    // Check access to admin route
    const adminAccess = checkRouteAccess('/admin', session);
    
    // Return all the debug information
    return NextResponse.json({
      session,
      token,
      adminAccess,
      headers: {
        cookie: request.headers.get('cookie'),
        authorization: request.headers.get('authorization'),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
} 
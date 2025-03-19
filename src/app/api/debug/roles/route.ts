import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import { checkRouteAccess } from '@/utils/authNavigation';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/user';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Block access in production environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are not available in production' },
      { status: 403 }
    );
  }
  
  try {
    // Get the session from the server
    const session = await getServerSession(authOptions);
    
    // Get the token from the request
    const token = await getToken({ req });
    
    // Check if the user has admin access
    const hasAdminAccess = checkRouteAccess('/admin', session);
    
    // Get user from database if session exists
    let dbUser: any = null;
    if (session?.user?.email) {
      await dbConnect();
      dbUser = await (User.findOne as any)({ email: session.user.email }).lean();
      
      // Convert MongoDB _id to string for JSON serialization
      if (dbUser && dbUser._id) {
        dbUser._id = dbUser._id.toString();
      }
    }
    
    // Return the debug information
    return NextResponse.json({
      session,
      token,
      hasAdminAccess,
      user: dbUser,
      headers: {
        cookie: req.headers.get('cookie'),
        authorization: req.headers.get('authorization'),
      }
    });
  } catch (error) {
    console.error('Error in debug roles API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
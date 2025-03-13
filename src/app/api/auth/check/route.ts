import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define runtime environment
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/auth/check - Check authentication status
export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Return authentication status
    return NextResponse.json({ 
      authenticated: !!session,
      user: session?.user || null,
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=5',
      }
    });
  } catch (error) {
    console.error('Error checking authentication:', error);
    return NextResponse.json({ error: 'Error checking authentication' }, { status: 500 });
  }
} 
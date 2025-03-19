import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({ 
      success: true, 
      session: session,
      hasSession: !!session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test-session API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error checking session',
      error: String(error)
    }, { status: 500 });
  }
} 
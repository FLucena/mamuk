import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json(session || { user: null });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      console.log('Revoking session for user:', session.user?.email);
      // The session will be invalidated when NextAuth processes the DELETE request
    }

    // Set cookies to expire
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token'
    ];

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    cookiesToClear.forEach(cookie => {
      headers.append(
        'Set-Cookie',
        `${cookie}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`
      );
    });

    return new NextResponse(
      JSON.stringify({ success: true, message: 'Session invalidated' }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error invalidating session:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to invalidate session' },
      { status: 500 }
    );
  }
} 
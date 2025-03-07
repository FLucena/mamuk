import { getServerSession } from 'next-auth';
import { NextResponse, NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      console.log('Signing out user:', session.user?.email);
    }

    // Get the callback URL from the request
    const searchParams = new URL(request.url).searchParams;
    const callbackUrl = searchParams.get('callbackUrl') || '/auth/signin';

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

    // Return a JSON response with the callback URL
    return NextResponse.json(
      { url: callbackUrl },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error in signout API:', error);
    return NextResponse.json(
      { url: '/auth/signin' },
      { status: 200 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const callbackUrl = url.searchParams.get('callbackUrl') || '/auth/signin';
    
    // Log the sign-out attempt
    console.log('Sign-out attempt:', { 
      user: session?.user?.email || 'No session', 
      callbackUrl 
    });
    
    const response = NextResponse.redirect(new URL(callbackUrl, req.url));
    
    // Clear all auth-related cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      'next-auth.state',
      'next-auth.pkce',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.callback-url',
      '__Host-next-auth.csrf-token'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set({
        name: cookieName,
        value: '',
        expires: new Date(0),
        path: '/',
        secure: true,
        sameSite: 'lax'
      });
    });
    
    return response;
  } catch (error) {
    console.error('Error in signout GET API:', error);
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
} 
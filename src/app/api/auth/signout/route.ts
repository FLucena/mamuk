import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'No active session' }, { status: 401 });
    }
    
    const body = await req.json();
    const callbackUrl = body.callbackUrl || '/auth/signin';
    
    // Devolver una respuesta exitosa con la URL de redirección
    return NextResponse.json({ 
      success: true, 
      message: 'Logout successful',
      url: callbackUrl
    });
  } catch (error) {
    console.error('Error in signout API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing logout request' 
    }, { status: 500 });
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
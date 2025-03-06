import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
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
    
    // Redireccionar al usuario a la página de inicio de sesión
    return NextResponse.redirect(new URL(callbackUrl, req.url));
  } catch (error) {
    console.error('Error in signout GET API:', error);
    // En caso de error, redirigir a la página de inicio
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
} 
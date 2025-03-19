import { NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/utils/rateLimit';
import { setSecureCookie } from '@/lib/utils/cookies';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
  try {
    // Aplicar rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!applyRateLimit(ip, 'login', 5, 60 * 1000)) { // 5 intentos por minuto
      // Removed console.log
      return NextResponse.json(
        { error: 'Demasiados intentos. Intente nuevamente más tarde.' },
        { status: 429 }
      );
    }

    // ... existing code ...

    // Suponiendo que aquí se genera un token JWT después de la autenticación
    // Usar cookies seguras en lugar de cookies normales
    setSecureCookie('token', 'jwt-token-value', {
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    // ... existing code ...
  } catch (error) {
    console.error('[AUTH] Error en login:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de login' },
      { status: 500 }
    );
  }
} 
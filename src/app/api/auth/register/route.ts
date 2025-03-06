import { NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/utils/rateLimit';

export async function POST(req: Request) {
  try {
    // Aplicar rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!applyRateLimit(ip, 'register', 3, 60 * 60 * 1000)) { // 3 intentos por hora
      console.log(`[SECURITY] Rate limit excedido para registro desde IP: ${ip}`);
      return NextResponse.json(
        { error: 'Demasiados intentos de registro. Intente nuevamente más tarde.' },
        { status: 429 }
      );
    }

    // ... existing code ...
  } catch (error) {
    console.error('[AUTH] Error en registro:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de registro' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoaches, createCoach } from '@/lib/services/coach';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const coaches = await getCoaches();
    return NextResponse.json(coaches);
  } catch (error) {
    console.error('Error obteniendo coaches:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es admin
    const user = session.user as any;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear coaches' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { userId, ...coachData } = data;

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del usuario' },
        { status: 400 }
      );
    }

    const coach = await createCoach(userId, coachData);
    return NextResponse.json(coach);
  } catch (error: any) {
    console.error('Error creando coach:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 
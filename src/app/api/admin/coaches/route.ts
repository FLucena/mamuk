import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAllCoaches,
  createCoach,
  updateCoach,
  deleteCoach,
} from '@/lib/services/coach';
import { validateMongoId } from '@/lib/utils/security';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const coaches = await getAllCoaches();
    return NextResponse.json(coaches);
  } catch (error) {
    console.error('Error en la ruta /api/admin/coaches:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, specialties, biography } = body;

    if (!userId || !validateMongoId(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    if (!specialties || !Array.isArray(specialties) || specialties.length === 0) {
      return NextResponse.json(
        { error: 'Especialidades inválidas' },
        { status: 400 }
      );
    }

    if (!biography || typeof biography !== 'string' || biography.trim().length === 0) {
      return NextResponse.json(
        { error: 'Biografía inválida' },
        { status: 400 }
      );
    }

    const coach = await createCoach({
      userId,
      specialties,
      biography,
    });

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error en la ruta /api/admin/coaches:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { coachId, specialties, biography } = body;

    if (!coachId || !validateMongoId(coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    if (specialties && (!Array.isArray(specialties) || specialties.length === 0)) {
      return NextResponse.json(
        { error: 'Especialidades inválidas' },
        { status: 400 }
      );
    }

    if (biography && (typeof biography !== 'string' || biography.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Biografía inválida' },
        { status: 400 }
      );
    }

    const coach = await updateCoach({
      coachId,
      specialties,
      biography,
    });

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error en la ruta /api/admin/coaches:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');

    if (!coachId || !validateMongoId(coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    await deleteCoach(coachId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en la ruta /api/admin/coaches:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 
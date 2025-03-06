import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getCoachById,
  updateCoach,
  deleteCoach,
  addCustomerToCoach,
  removeCustomerFromCoach,
} from '@/lib/services/coach';
import { validateMongoId } from '@/lib/utils/security';

interface RouteParams {
  params: {
    coachId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!validateMongoId(params.coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    const coach = await getCoachById(params.coachId);
    if (!coach) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error en la ruta /api/admin/coaches/[coachId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!validateMongoId(params.coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { specialties, biography } = body;

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
      coachId: params.coachId,
      specialties,
      biography,
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error en la ruta /api/admin/coaches/[coachId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!validateMongoId(params.coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    await deleteCoach(params.coachId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en la ruta /api/admin/coaches/[coachId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!validateMongoId(params.coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { customerId, action } = body;

    if (!customerId || !action || !validateMongoId(customerId)) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    let coach;

    if (action === 'add') {
      coach = await addCustomerToCoach({
        coachId: params.coachId,
        customerId,
      });
    } else if (action === 'remove') {
      coach = await removeCustomerFromCoach({
        coachId: params.coachId,
        customerId,
      });
    } else {
      return NextResponse.json(
        { error: 'Acción no válida' },
        { status: 400 }
      );
    }

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error en la ruta /api/admin/coaches/[coachId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 
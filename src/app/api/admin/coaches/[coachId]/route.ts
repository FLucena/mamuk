import { NextRequest, NextResponse } from 'next/server';
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

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


// GET /api/admin/coaches/[coachId]
export async function GET(
  request: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { coachId } = params;

    if (!validateMongoId(coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    const coach = await getCoachById(coachId);
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

// PUT /api/admin/coaches/[coachId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { coachId } = params;

    if (!validateMongoId(coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { specialties, bio } = body;

    // Validate specialties if provided
    if (specialties !== undefined && !Array.isArray(specialties)) {
      return NextResponse.json(
        { error: 'Especialidades inválidas: debe ser un array' },
        { status: 400 }
      );
    }

    // Validate biography if provided
    if (bio !== undefined && typeof bio !== 'string') {
      return NextResponse.json(
        { error: 'Biografía inválida: debe ser un string' },
        { status: 400 }
      );
    }

    const coach = await updateCoach({
      coachId: coachId,
      specialties,
      biography: bio,
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

// DELETE /api/admin/coaches/[coachId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { coachId } = params;

    if (!validateMongoId(coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    await deleteCoach(coachId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en la ruta /api/admin/coaches/[coachId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/coaches/[coachId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { coachId } = params;

    if (!validateMongoId(coachId)) {
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
        coachId: coachId,
        customerId,
      });
    } else if (action === 'remove') {
      coach = await removeCustomerFromCoach({
        coachId: coachId,
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
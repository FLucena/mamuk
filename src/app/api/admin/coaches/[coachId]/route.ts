import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoachById, updateCoach as updateCoachService, deleteCoach as deleteCoachService, ensureCoachExists } from '@/lib/services/coach';
import { validateMongoId } from '@/lib/utils/security';

export async function GET(
  req: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const { coachId } = params;

    // Validate MongoDB ID
    if (!validateMongoId(coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    // Try to get the coach, or create it if it doesn't exist
    let coach = await getCoachById(coachId);
    
    // If coach doesn't exist, try to create it
    if (!coach) {
      try {
        coach = await ensureCoachExists(coachId);
        if (!coach) {
          return NextResponse.json(
            { error: 'No se pudo crear el coach' },
            { status: 500 }
          );
        }
      } catch (error) {
        console.error('Error creating coach:', error);
        return NextResponse.json(
          { error: 'Error al crear el coach' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error fetching coach details:', error);
    return NextResponse.json(
      { error: 'Error al obtener detalles del coach' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const { coachId } = params;
    const { specialties, bio } = await req.json();

    // Validate MongoDB ID
    if (!validateMongoId(coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    // Update coach details using the coach service
    const updatedCoach = await updateCoachService({
      coachId,
      specialties,
      biography: bio
    });

    if (!updatedCoach) {
      return NextResponse.json(
        { error: 'Coach no encontrado o error al actualizar' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCoach);
  } catch (error) {
    console.error('Error updating coach:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el coach' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const { coachId } = params;

    // Validate MongoDB ID
    if (!validateMongoId(coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    try {
      // Delete coach using the coach service
      await deleteCoachService(coachId);
      
      return NextResponse.json(
        { message: 'Coach eliminado correctamente' },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: 'Coach no encontrado o error al eliminar' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting coach:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el coach' },
      { status: 500 }
    );
  }
} 
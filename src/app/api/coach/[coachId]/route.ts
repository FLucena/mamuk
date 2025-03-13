import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoachById, updateCoach, addCustomerToCoach, removeCustomerFromCoach } from '@/lib/services/coach';
import { validateMongoId } from '@/lib/utils/security';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


interface Customer {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { coachId } = params;
    
    const coach = await getCoachById(coachId);
    if (!coach) {
      return NextResponse.json({ error: 'Coach no encontrado' }, { status: 404 });
    }

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error obteniendo coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es admin
    const user = session.user as any;
    if (!user.roles.includes('admin')) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar coaches' },
        { status: 403 }
      );
    }

    const { coachId } = params;
    
    const data = await request.json();
    const { specialties, biography } = data;
    
    const coach = await updateCoach({
      coachId: coachId,
      specialties,
      biography
    });
    
    if (!coach) {
      return NextResponse.json({ error: 'Coach no encontrado' }, { status: 404 });
    }

    return NextResponse.json(coach);
  } catch (error: any) {
    console.error('Error actualizando coach:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es admin
    const user = session.user as any;
    if (!user.roles.includes('admin')) {
      return NextResponse.json(
        { error: 'No tienes permisos para gestionar clientes' },
        { status: 403 }
      );
    }

    const { coachId } = params;
    
    const data = await request.json();
    const { customerId, action } = data;

    if (!customerId || !action) {
      return NextResponse.json(
        { error: 'Se requiere customerId y action' },
        { status: 400 }
      );
    }

    let coach;
    if (action === 'assign') {
      coach = await addCustomerToCoach({
        coachId: coachId,
        customerId
      });
    } else if (action === 'remove') {
      coach = await removeCustomerFromCoach({
        coachId: coachId,
        customerId
      });
    } else {
      return NextResponse.json(
        { error: 'Acción no válida' },
        { status: 400 }
      );
    }

    return NextResponse.json(coach);
  } catch (error: any) {
    console.error('Error gestionando cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 
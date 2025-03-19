import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllCoaches, createCoach } from '@/lib/services/coach';
import { z } from 'zod';

// Force dynamic rendering for this route since it depends on user session
export const dynamic = 'force-dynamic';

// Schema for coach creation validation
const coachSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  specialties: z.array(z.string()).optional().default([]),
  biography: z.string().optional().default(""),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Solo los admin pueden ver todos los coaches
    if (!session.user.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }
    
    const coaches = await getAllCoaches();
    return NextResponse.json(coaches);
  } catch (error) {
    console.error('Error obteniendo coaches:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es admin
    const user = session.user;
    if (!user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear coaches' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Validate request data
    const validationResult = coachSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Error de validación', 
          details: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // Pasar los parámetros en un objeto como espera la función
    const coach = await createCoach({
      userId: validatedData.userId,
      specialties: validatedData.specialties,
      biography: validatedData.biography
    });
    
    return NextResponse.json(coach);
  } catch (error: unknown) {
    console.error('Error creando coach:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error interno del servidor';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 
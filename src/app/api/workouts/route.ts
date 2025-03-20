import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createWorkout } from '@/lib/services/workout';
import { randomUUID } from 'crypto';
import { ErrorWithMessage } from '@/types/common';
import User from '@/lib/models/user';
import { dbConnect } from '@/lib/db';
import { IUser } from '@/lib/models/user';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Check if user has permission to create workouts
    if (!session.user.roles.some(role => ['admin', 'coach'].includes(role))) {
      return NextResponse.json(
        { message: 'No tienes permisos para crear rutinas' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json(
        { message: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();
    
    // Find the user by their Google OAuth ID (sub field)
    const user = await (User.findOne as any)({ sub: session.user.id }).lean() as IUser;
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Create default workout structure
    const defaultDays = Array.from({ length: 3 }, (_, dayIndex) => ({
      id: randomUUID(),
      name: `Día ${dayIndex + 1}`,
      blocks: Array.from({ length: 4 }, (_, blockIndex) => ({
        id: randomUUID(),
        name: `Bloque ${blockIndex + 1}`,
        exercises: [],
      }))
    }));
    
    // Create workout using the user's MongoDB ID
    const workout = await createWorkout({
      name,
      description,
      days: defaultDays,
    }, user._id.toString());
    
    return NextResponse.json(workout, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating workout:', error);
    
    const err = error as ErrorWithMessage;
    return NextResponse.json(
      { message: err.message || 'Error al crear la rutina' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Types } from 'mongoose';
import { Workout } from '@/lib/models/workout';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Define interface for the document we get from MongoDB
interface DbRoutine {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: {
    name?: string;
    email?: string;
  };
  status: string;
}

// Interface for transformed routine
interface TransformedRoutine {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  archivedAt: string;
  coach: {
    name: string;
    email: string;
  };
  customer: {
    name: string;
    email: string;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.roles?.includes('admin')) {
      return new NextResponse(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Consultar directamente la base de datos para rutinas archivadas
    const archivedRoutines = await (Workout.find as any)({ 
      status: 'archived' 
    })
    .populate('userId', 'name email')
    .sort({ updatedAt: -1 })
    .lean();

    // Transform the data to match our interface
    const transformedRoutines: TransformedRoutine[] = (archivedRoutines as any[]).map((routine: any) => ({
      id: routine._id.toString(),
      name: routine.name || 'Sin nombre',
      description: routine.description || 'Sin descripción',
      createdAt: new Date(routine.createdAt).toISOString(),
      archivedAt: new Date(routine.updatedAt).toISOString(),
      coach: {
        name: session.user.name || 'Admin',
        email: session.user.email || 'admin@mamuk.com'
      },
      customer: {
        name: routine.userId?.name || 'Usuario desconocido',
        email: routine.userId?.email || 'Sin email'
      }
    }));

    return NextResponse.json(transformedRoutines);
  } catch (error) {
    console.error('Error in archived routines API route:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Types } from 'mongoose';
import { Rutina } from '@/lib/models/workout';

interface DbRoutine {
  _id: Types.ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  userId: {
    name: string;
    email: string;
  };
  status: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Consultar directamente la base de datos para rutinas archivadas
    const archivedRoutines = await Rutina.find({ 
      status: 'archived' 
    })
    .populate('userId', 'name email')
    .sort({ updatedAt: -1 })
    .lean();

    // Transform the data to match our interface
    const transformedRoutines = archivedRoutines.map((routine: any) => ({
      id: routine._id.toString(),
      name: routine.name,
      description: routine.description || 'Sin descripción',
      createdAt: routine.createdAt.toISOString(),
      archivedAt: routine.updatedAt.toISOString(),
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
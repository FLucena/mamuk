import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/admin/routines/archived/[id] - Restore an archived workout
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user?.id || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    await dbConnect();
    
    // Find the archived workout and restore it (change status to active)
    const workout = await Workout.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(id),
        status: 'archived'
      },
      { 
        $set: { 
          status: 'active',
          updatedAt: new Date()
        } 
      },
      { new: true }
    );

    if (!workout) {
      return NextResponse.json(
        { error: 'Rutina no encontrada o no está archivada' },
        { status: 404 }
      );
    }

    // Revalidate paths to update UI
    revalidatePath('/admin');
    revalidatePath('/workout');

    return NextResponse.json({
      success: true,
      message: 'Rutina restaurada exitosamente',
      workout: {
        id: workout._id.toString(),
        name: workout.name
      }
    });
  } catch (error) {
    console.error('Error restoring workout:', error);
    return NextResponse.json(
      { error: 'Error al restaurar la rutina' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/routines/archived/[id] - Permanently delete an archived workout
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user?.id || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    await dbConnect();
    
    // Find and permanently delete the archived workout
    const result = await Workout.findOneAndDelete({
      _id: new Types.ObjectId(id),
      status: 'archived'
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Rutina no encontrada o no está archivada' },
        { status: 404 }
      );
    }

    // Revalidate paths to update UI
    revalidatePath('/admin');
    revalidatePath('/workout');

    return NextResponse.json({
      success: true,
      message: 'Rutina eliminada permanentemente',
      workout: {
        id: result._id.toString(),
        name: result.name
      }
    });
  } catch (error) {
    console.error('Error deleting workout permanently:', error);
    return NextResponse.json(
      { error: 'Error al eliminar permanentemente la rutina' },
      { status: 500 }
    );
  }
} 
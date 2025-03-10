import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWorkout, updateWorkout, archiveWorkout, getWorkoutById } from '@/lib/services/workout';
import { validateIds } from '@/lib/utils/security';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/workout/[id] - Get a specific workout
export async function GET(req: Request, { params }: RouteParams) {
  try {
    validateIds(params.id);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse(null, { status: 401 });

    const workout = await getWorkoutById(params.id);
    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid workout ID' },
      { status: 400 }
    );
  }
}

// PUT /api/workout/[id] - Update a workout
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const workout = await updateWorkout(params.id, data, session.user.id);
    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json(
      { error: 'Error updating workout' },
      { status: 500 }
    );
  }
}

// DELETE /api/workout/[id] - Delete a workout (soft delete by archiving)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workout = await archiveWorkout(params.id, session.user.id);
    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error archiving workout:', error);
    return NextResponse.json(
      { error: 'Error archiving workout' },
      { status: 500 }
    );
  }
} 
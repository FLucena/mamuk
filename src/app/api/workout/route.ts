import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWorkouts, createWorkout } from '@/lib/services/workout';

// GET /api/workout - Get all workouts for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workouts = await getWorkouts(session.user.id);
    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Error fetching workouts' },
      { status: 500 }
    );
  }
}

// POST /api/workout - Create a new workout
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const workout = await createWorkout(data, session.user.id);
    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json(
      { error: 'Error creating workout' },
      { status: 500 }
    );
  }
} 
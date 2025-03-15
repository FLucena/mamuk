import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWorkouts, createWorkout } from '@/lib/services/workout';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';

// Force dynamic rendering for this route since it depends on user session
export const dynamic = 'force-dynamic';

// Add cache control headers to prevent caching
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Schema for workout creation validation
const workoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  exercises: z.array(
    z.object({
      name: z.string().min(1, "Exercise name is required"),
      sets: z.number().int().positive().optional(),
      reps: z.number().int().positive().optional(),
      weight: z.number().positive().optional(),
      duration: z.number().positive().optional(),
      notes: z.string().optional(),
    })
  ).optional(),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional(),
});

// GET /api/workout - Get all workouts for the current user
export async function GET(request: NextRequest) {
  // Apply rate limiting - 100 requests per minute
  const rateLimitResponse = checkRateLimit(request, {
    limit: 100,
    windowMs: 60 * 1000,
    message: 'Too many requests, please try again later'
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Check if this is a count request
    const url = new URL(request.url);
    const isCountRequest = url.searchParams.get('count') === 'user';
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle count request
    if (isCountRequest) {
      try {
        await dbConnect();
        const count = await Workout.countDocuments({ 
          userId: session.user.id,
          status: 'active'
        });
        return NextResponse.json({ count }, { status: 200 });
      } catch (error) {
        console.error('Error counting workouts:', error);
        return NextResponse.json({ count: 0 }, { status: 200 });
      }
    }

    // Regular workouts request
    const workouts = await getWorkouts(session.user.id);
    
    // Add cache control headers to improve performance
    const headers = new Headers();
    headers.set('Cache-Control', 'private, max-age=10');
    
    return NextResponse.json({ workouts }, { 
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Error fetching workouts', workouts: [] },
      { status: 500 }
    );
  }
}

// POST /api/workout - Create a new workout
export async function POST(request: NextRequest) {
  // Apply rate limiting - 20 requests per minute for workout creation
  const rateLimitResponse = checkRateLimit(request, {
    limit: 20,
    windowMs: 60 * 1000,
    message: 'Too many workout creation requests, please try again later'
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate request data
    const validationResult = workoutSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    const workout = await createWorkout(validatedData, session.user.id);
    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json(
      { error: 'Error creating workout' },
      { status: 500 }
    );
  }
} 
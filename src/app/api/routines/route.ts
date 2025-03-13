import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { RoutineModel } from '@/models/Routine';
import { z } from 'zod';

// Schema for routine creation
const routineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  customerId: z.string().optional(),
  exercises: z.array(
    z.object({
      exercise: z.string().min(1, 'Exercise ID is required'),
      sets: z.number().min(1, 'Sets must be at least 1'),
      reps: z.number().min(1, 'Reps must be at least 1'),
      weight: z.number().min(0, 'Weight cannot be negative').default(0),
      notes: z.string().max(200).optional(),
      restTime: z.number().min(0).default(60),
    })
  ).min(1, 'At least one exercise is required'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId') || session.user.id;
    
    // Connect to the database
    await connectToDatabase();
    
    // Check if the user has permission to view routines
    const isAdmin = session.user.roles?.includes('admin');
    const isCoach = session.user.roles?.includes('coach');
    const isOwnRoutine = customerId === session.user.id;
    
    if (!isAdmin && !isCoach && !isOwnRoutine) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get routines for the customer
    const routines = await RoutineModel.find({
      customerId,
      isArchived: false,
    }).populate('exercises.exercise');
    
    return NextResponse.json(routines);
  } catch (error) {
    console.error('Error fetching routines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routines' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse and validate the request body
    const body = await req.json();
    const validationResult = routineSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Connect to the database
    await connectToDatabase();
    
    // Determine the customer ID and coach ID
    const isAdmin = session.user.roles?.includes('admin');
    const isCoach = session.user.roles?.includes('coach');
    const customerId = data.customerId || session.user.id;
    
    // Only admins and coaches can create routines for other customers
    if (customerId !== session.user.id && !isAdmin && !isCoach) {
      return NextResponse.json(
        { error: 'You are not authorized to create routines for other customers' },
        { status: 403 }
      );
    }
    
    // Check if the customer has reached the limit of 3 routines
    // Only apply limit for regular customers creating their own routines
    if (!isAdmin && !isCoach) {
      const routineCount = await RoutineModel.countDocuments({
        customerId,
        isArchived: false,
      });
      
      if (routineCount >= 3) {
        return NextResponse.json(
          { error: 'You have reached the limit of 3 routines. Please archive or delete an existing routine before creating a new one.' },
          { status: 400 }
        );
      }
    }
    
    // Create the routine
    const routine = new RoutineModel({
      ...data,
      customerId,
      coachId: (isAdmin || isCoach) ? session.user.id : undefined,
    });
    
    await routine.save();
    
    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error('Error creating routine:', error);
    return NextResponse.json(
      { error: 'Failed to create routine' },
      { status: 500 }
    );
  }
} 
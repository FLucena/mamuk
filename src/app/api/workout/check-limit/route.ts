import { NextResponse } from 'next/server';
import { checkWorkoutLimit } from '@/app/workout/[id]/actions';

// Make sure we use nodejs runtime for MongoDB connectivity
export const runtime = 'nodejs';

/**
 * API endpoint to check a user's workout limit
 * This serves as a bridge between client components and server actions
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId } = data;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const result = await checkWorkoutLimit(userId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Error checking workout limit:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check workout limit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
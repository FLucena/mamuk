import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWorkout, updateWorkout, archiveWorkout, getWorkoutById } from '@/lib/services/workout';
import { validateIds } from '@/lib/utils/security';
import { handleApiError, createApiError } from '@/lib/utils/api-error-handler';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// Force dynamic rendering for this route since it depends on user session
export const dynamic = 'force-dynamic';

// GET /api/workout/[id] - Get a specific workout
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;
    
    try {
      validateIds(id);
    } catch (error) {
      throw createApiError('Invalid workout ID', 'VALIDATION_ERROR');
    }
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw createApiError('Authentication required', 'UNAUTHORIZED');
    }

    const workout = await getWorkoutById(id);
    
    if (!workout) {
      throw createApiError('Workout not found', 'NOT_FOUND');
    }
    
    return NextResponse.json(workout);
  } catch (error) {
    return handleApiError(error, 'Error fetching workout');
  }
}

// PUT /api/workout/[id] - Update a workout
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Apply rate limiting - 20 requests per minute
  const rateLimitResponse = checkRateLimit(request, {
    limit: 20,
    windowMs: 60 * 1000,
    message: 'Too many update requests, please try again later'
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw createApiError('Authentication required', 'UNAUTHORIZED');
    }

    const { id } = params;
    
    try {
      validateIds(id);
    } catch (error) {
      throw createApiError('Invalid workout ID', 'VALIDATION_ERROR');
    }
    
    const data = await request.json();
    const workout = await updateWorkout(id, data, session.user.id);
    
    if (!workout) {
      throw createApiError('Workout not found', 'NOT_FOUND');
    }

    return NextResponse.json(workout);
  } catch (error) {
    return handleApiError(error, 'Error updating workout');
  }
}

// DELETE /api/workout/[id] - Delete a workout (soft delete by archiving)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Apply rate limiting - 20 requests per minute
  const rateLimitResponse = checkRateLimit(request, {
    limit: 20,
    windowMs: 60 * 1000,
    message: 'Too many delete requests, please try again later'
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw createApiError('Authentication required', 'UNAUTHORIZED');
    }

    const { id } = params;
    
    try {
      validateIds(id);
    } catch (error) {
      throw createApiError('Invalid workout ID', 'VALIDATION_ERROR');
    }
    
    const workout = await archiveWorkout(id, session.user.id);
    
    if (!workout) {
      throw createApiError('Workout not found', 'NOT_FOUND');
    }

    return NextResponse.json(workout);
  } catch (error) {
    return handleApiError(error, 'Error archiving workout');
  }
} 
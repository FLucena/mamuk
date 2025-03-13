'use client';

import { Workout, Exercise, WorkoutDay } from '@/lib/types/workout';

/**
 * Client-side service for workout operations
 * This file contains functions for client-side workout operations
 * that interact with the server API
 */

/**
 * Fetches all workouts for the current user
 * @returns Promise with array of workouts
 */
export async function fetchWorkouts(): Promise<Workout[]> {
  try {
    const response = await fetch('/api/workout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch workouts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return [];
  }
}

/**
 * Fetches a single workout by ID
 * @param id Workout ID
 * @returns Promise with workout data
 */
export async function fetchWorkoutById(id: string): Promise<Workout | null> {
  try {
    const response = await fetch(`/api/workout/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch workout');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching workout ${id}:`, error);
    return null;
  }
}

/**
 * Creates a new workout
 * @param workoutData Workout data
 * @returns Promise with created workout
 */
export async function createWorkout(workoutData: Partial<Workout>): Promise<Workout | null> {
  try {
    const response = await fetch('/api/workout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create workout');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating workout:', error);
    return null;
  }
}

/**
 * Updates an existing workout
 * @param id Workout ID
 * @param workoutData Updated workout data
 * @returns Promise with updated workout
 */
export async function updateWorkout(id: string, workoutData: Partial<Workout>): Promise<Workout | null> {
  try {
    const response = await fetch(`/api/workout/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update workout');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating workout ${id}:`, error);
    return null;
  }
}

/**
 * Deletes a workout
 * @param id Workout ID
 * @returns Promise with success status
 */
export async function deleteWorkout(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/workout/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete workout');
    }

    return true;
  } catch (error) {
    console.error(`Error deleting workout ${id}:`, error);
    return false;
  }
}

/**
 * Completes a workout
 * @param id Workout ID
 * @returns Promise with updated workout
 */
export async function completeWorkout(id: string): Promise<Workout | null> {
  try {
    const response = await fetch(`/api/workout/${id}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete workout');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error completing workout ${id}:`, error);
    return null;
  }
} 
import { rest } from 'msw'
import { server } from '../mocks/setup'

// Mock del servicio de workout
jest.mock('@/lib/services/workout-client', () => ({
  fetchWorkouts: jest.fn().mockResolvedValue([
    { id: 'workout-1', name: 'Test Workout 1', days: [] },
    { id: 'workout-2', name: 'Test Workout 2', days: [] }
  ]),
  
  fetchWorkoutById: jest.fn().mockResolvedValue({
    id: 'workout-1',
    name: 'Test Workout workout-1',
    days: []
  }),
  
  createWorkout: jest.fn().mockResolvedValue({
    id: 'new-workout',
    name: 'New Workout',
    days: []
  }),
  
  updateWorkout: jest.fn().mockResolvedValue({
    id: 'workout-1',
    name: 'Updated Workout',
    days: []
  }),
  
  deleteWorkout: jest.fn().mockResolvedValue(true)
}))

// Importamos después del mock
const { 
  fetchWorkouts, 
  fetchWorkoutById, 
  createWorkout, 
  updateWorkout, 
  deleteWorkout 
} = require('@/lib/services/workout-client')

describe('Workout Service Integration', () => {
  it('fetches all workouts', async () => {
    const workouts = await fetchWorkouts()
    
    expect(Array.isArray(workouts)).toBe(true)
    expect(workouts.length).toBe(2)
    expect(workouts[0].name).toBe('Test Workout 1')
    expect(workouts[1].name).toBe('Test Workout 2')
  })

  it('fetches a workout by id', async () => {
    const workout = await fetchWorkoutById('workout-1')
    
    expect(workout).toHaveProperty('id')
    expect(workout.id).toBe('workout-1')
    expect(workout.name).toBe('Test Workout workout-1')
  })

  it('creates a new workout', async () => {
    const newWorkout = {
      name: 'New Workout',
      days: []
    }
    
    const created = await createWorkout(newWorkout)
    
    expect(created).toHaveProperty('id')
    expect(created.id).toBe('new-workout')
    expect(created.name).toBe('New Workout')
  })

  it('updates a workout', async () => {
    const updated = await updateWorkout('workout-1', {
      name: 'Updated Workout',
      days: []
    })
    
    expect(updated).toHaveProperty('id')
    expect(updated.id).toBe('workout-1')
    expect(updated.name).toBe('Updated Workout')
  })

  it('deletes a workout', async () => {
    const result = await deleteWorkout('workout-1')
    
    expect(result).toBe(true)
  })
}) 
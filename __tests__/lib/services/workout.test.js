import { getWorkout, getWorkouts } from '@/lib/services/workout'
import { dbConnect } from '@/lib/db'
import mongoose from 'mongoose'
import * as security from '@/lib/utils/security'

// Mock de los modelos y utilidades
jest.mock('@/lib/db')
jest.mock('@/lib/utils/security', () => ({
  validateIds: jest.fn(),
  validateMongoId: jest.fn().mockReturnValue(true)
}))

jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose')
  return {
    ...originalModule,
    connection: {
      setMaxListeners: jest.fn(),
      on: jest.fn(),
      once: jest.fn()
    },
    models: {
      Workout: {
        findById: jest.fn(),
        find: jest.fn(),
        lean: jest.fn()
      },
      User: {
        findOne: jest.fn().mockResolvedValue({ _id: 'user-id', email: 'test@example.com' })
      }
    },
    model: jest.fn((name) => {
      if (name === 'User') {
        return {
          findOne: jest.fn().mockResolvedValue({ _id: 'user-id', email: 'test@example.com' })
        }
      }
      return {
        findById: jest.fn(),
        find: jest.fn(),
        lean: jest.fn()
      }
    }),
    Types: {
      ObjectId: {
        isValid: jest.fn().mockReturnValue(true)
      }
    }
  }
})

describe('Workout Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getWorkout returns workout by ID', async () => {
    const mockWorkout = { 
      _id: 'workout-id', 
      name: 'Test Workout',
      userId: 'user-id',
      days: [{ name: 'Day 1', blocks: [] }] 
    }
    
    mongoose.models.Workout.findById = jest.fn().mockReturnThis()
    mongoose.models.Workout.lean = jest.fn().mockResolvedValue(mockWorkout)
    
    const result = await getWorkout('workout-id')
    
    expect(dbConnect).toHaveBeenCalled()
    expect(mongoose.models.Workout.findById).toHaveBeenCalledWith('workout-id')
    expect(result.name).toBe('Test Workout')
  })

  it('getWorkouts returns workouts for user', async () => {
    const mockWorkouts = [
      { _id: 'workout-1', name: 'Workout 1', userId: 'user-id' },
      { _id: 'workout-2', name: 'Workout 2', userId: 'user-id' }
    ]
    
    mongoose.models.Workout.find = jest.fn().mockReturnThis()
    mongoose.models.Workout.lean = jest.fn().mockResolvedValue(mockWorkouts)
    
    const result = await getWorkouts('user-id')
    
    expect(dbConnect).toHaveBeenCalled()
    expect(result.length).toBe(2)
  })
}) 
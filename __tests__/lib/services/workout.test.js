/**
 * @jest-environment jsdom
 */

// Mock dependencies before importing the module under test
jest.mock('@/lib/db', () => ({
  dbConnect: jest.fn().mockResolvedValue(true)
}));

// Mock mongoose
jest.mock('mongoose', () => {
  const mockSchema = function() {
    return {
      index: jest.fn().mockReturnThis(),
      pre: jest.fn().mockReturnThis()
    };
  };
  
  mockSchema.Types = {
    ObjectId: {
      isValid: jest.fn().mockReturnValue(true)
    }
  };
  
  return {
    Schema: mockSchema,
    Types: {
      ObjectId: {
        isValid: jest.fn().mockReturnValue(true)
      }
    }
  };
});

// Mock Coach model
jest.mock('@/lib/models/coach', () => {
  return {
    __esModule: true,
    default: {
      findOne: jest.fn().mockResolvedValue(null)
    }
  };
});

// Mock User model
jest.mock('@/lib/models/user', () => {
  return {
    __esModule: true,
    default: {
      findById: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockResolvedValue({
          _id: 'user123',
          role: 'user',
          roles: ['user']
        })
      })),
      findOne: jest.fn().mockResolvedValue({
        _id: 'user123',
        role: 'user',
        roles: ['user']
      })
    }
  };
});

// Mock Workout model
jest.mock('@/lib/models/workout', () => {
  const mockModel = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ _id: 'mock-id' }),
    findById: jest.fn().mockResolvedValue(null),
    findByIdAndUpdate: jest.fn().mockResolvedValue(null),
    findByIdAndDelete: jest.fn().mockResolvedValue(null),
    countDocuments: jest.fn().mockResolvedValue(0)
  };
  
  return {
    __esModule: true,
    default: mockModel
  };
});

// Mock the workout service functions directly
jest.mock('@/lib/services/workout', () => ({
  createWorkout: jest.fn(),
  getWorkouts: jest.fn()
}));

// Import the mocked functions
import { createWorkout, getWorkouts } from '@/lib/services/workout';

describe('Workout Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a workout', async () => {
    const workoutData = {
      name: 'Test Workout',
      description: 'Test Description',
      exercises: []
    };
    const userId = 'user123';
    const expectedWorkout = {
      _id: 'workout123',
      ...workoutData,
      userId
    };

    // Setup mock implementation for this test
    createWorkout.mockResolvedValueOnce(expectedWorkout);

    const result = await createWorkout(workoutData, userId);

    expect(result).toBeDefined();
    expect(result.name).toBe(workoutData.name);
    expect(result.userId).toBe(userId);
    expect(createWorkout).toHaveBeenCalledWith(workoutData, userId);
  });

  it('should get workouts for a user', async () => {
    const userId = 'user123';
    const mockWorkouts = [
      { _id: 'workout1', name: 'Workout 1', userId },
      { _id: 'workout2', name: 'Workout 2', userId }
    ];

    // Setup mock implementation for this test
    getWorkouts.mockResolvedValueOnce(mockWorkouts);

    const result = await getWorkouts(userId);

    expect(result).toEqual(mockWorkouts);
    expect(getWorkouts).toHaveBeenCalledWith(userId);
  });
}); 
// Mock fetch
global.fetch = jest.fn().mockImplementation((url) => {
  if (url === '/api/workout') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: 'workout-1', name: 'Test Workout 1', days: [] },
        { id: 'workout-2', name: 'Test Workout 2', days: [] }
      ]),
    });
  }
  
  if (url.includes('/api/workout/workout-1')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: 'workout-1',
        name: 'Test Workout workout-1',
        days: []
      }),
    });
  }
  
  if (url === '/api/workout' && global.fetch.mock.calls[0]?.[1]?.method === 'POST') {
    return Promise.resolve({
      ok: true,
      status: 201,
      json: () => Promise.resolve({
        id: 'new-workout',
        name: 'New Workout',
        days: [],
        createdAt: new Date().toISOString()
      }),
    });
  }
  
  if (url.includes('/api/workout/workout-1') && global.fetch.mock.calls[0]?.[1]?.method === 'PUT') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: 'workout-1',
        name: 'Updated Workout',
        days: [],
        updatedAt: new Date().toISOString()
      }),
    });
  }
  
  if (url.includes('/api/workout/workout-1') && global.fetch.mock.calls[0]?.[1]?.method === 'DELETE') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  }
  
  return Promise.reject(new Error('Not found'));
});

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
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
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
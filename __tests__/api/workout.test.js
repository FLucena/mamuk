import { createMocks } from 'node-mocks-http'
import * as workoutService from '@/lib/services/workout'
import { getServerSession } from 'next-auth'

// Mock de servicios y next-auth
jest.mock('@/lib/services/workout')
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

// Importamos las funciones de la API
// Nota: Esto puede necesitar ajustes dependiendo de cómo estén estructuradas tus rutas de API
let GET, POST
jest.mock('@/app/api/workout/route', () => {
  const actual = jest.requireActual('@/app/api/workout/route')
  GET = actual.GET
  POST = actual.POST
  return actual
})

describe('/api/workout API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('GET returns 401 for unauthenticated user', async () => {
    getServerSession.mockResolvedValue(null)
    
    const { req, res } = createMocks({ method: 'GET' })
    
    await GET(req, res)
    
    expect(res._getStatusCode()).toBe(401)
  })

  it('GET returns workouts for authenticated user', async () => {
    const mockSession = { 
      user: { id: 'user-id', email: 'test@example.com' } 
    }
    getServerSession.mockResolvedValue(mockSession)
    
    const mockWorkouts = [
      { id: 'workout-1', name: 'Workout 1' },
      { id: 'workout-2', name: 'Workout 2' }
    ]
    workoutService.getWorkouts.mockResolvedValue(mockWorkouts)
    
    const { req, res } = createMocks({ method: 'GET' })
    
    await GET(req, res)
    
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(mockWorkouts)
  })

  it('POST creates new workout', async () => {
    const mockSession = { 
      user: { id: 'user-id', email: 'test@example.com' } 
    }
    getServerSession.mockResolvedValue(mockSession)
    
    const workoutData = { name: 'New Workout', description: 'Test' }
    const createdWorkout = { id: 'new-workout-id', ...workoutData, userId: 'user-id' }
    
    workoutService.createWorkout.mockResolvedValue(createdWorkout)
    
    const { req, res } = createMocks({
      method: 'POST',
      body: workoutData
    })
    
    await POST(req, res)
    
    expect(res._getStatusCode()).toBe(201)
    expect(JSON.parse(res._getData())).toEqual(createdWorkout)
    expect(workoutService.createWorkout).toHaveBeenCalledWith(workoutData, 'user-id')
  })
}) 
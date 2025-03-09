import { createMocks } from 'node-mocks-http'
import * as workoutService from '@/lib/services/workout'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

// Mock de servicios y next-auth
jest.mock('@/lib/services/workout', () => ({
  getWorkouts: jest.fn(),
  createWorkout: jest.fn()
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url, init) => ({
      url,
      method: init?.method || 'GET',
      json: jest.fn().mockImplementation(() => Promise.resolve(init?.body ? JSON.parse(init.body) : {})),
      nextUrl: { pathname: '/api/workout' }
    })),
    NextResponse: {
      json: jest.fn().mockImplementation((body, init) => ({
        body,
        status: init?.status || 200
      }))
    }
  }
})

// Importamos las funciones de la API
import { GET, POST } from '@/app/api/workout/route'

describe('/api/workout API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('GET returns 401 for unauthenticated user', async () => {
    getServerSession.mockResolvedValue(null)
    
    const req = new NextRequest('http://localhost:3000/api/workout')
    
    const response = await GET(req)
    
    expect(response.status).toBe(401)
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
    
    const req = new NextRequest('http://localhost:3000/api/workout')
    
    const response = await GET(req)
    
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockWorkouts)
  })

  it('POST creates new workout', async () => {
    const mockSession = { 
      user: { id: 'user-id', email: 'test@example.com' } 
    }
    getServerSession.mockResolvedValue(mockSession)
    
    const workoutData = { name: 'New Workout', description: 'Test' }
    const createdWorkout = { id: 'new-workout-id', ...workoutData, userId: 'user-id' }
    
    workoutService.createWorkout.mockResolvedValue(createdWorkout)
    
    const req = new NextRequest('http://localhost:3000/api/workout', {
      method: 'POST',
      body: JSON.stringify(workoutData)
    })
    
    const response = await POST(req)
    
    expect(response.status).toBe(201)
    expect(response.body).toEqual(createdWorkout)
    expect(workoutService.createWorkout).toHaveBeenCalledWith(expect.objectContaining(workoutData), 'user-id')
  })
}) 
import * as workoutService from '@/lib/services/workout'
import { getServerSession } from 'next-auth'
import { GET, POST } from '@/app/api/workout/route'

// Mock services and next-auth
jest.mock('@/lib/services/workout')
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url, init) => ({
      url,
      json: jest.fn().mockImplementation(async () => init?.body ? JSON.parse(init.body) : {}),
      nextUrl: { searchParams: new URLSearchParams() }
    })),
    NextResponse: {
      json: jest.fn().mockImplementation((body, options) => ({
        body,
        status: options?.status || 200
      }))
    }
  }
})

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {}
}))

describe('/api/workout API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('GET returns 401 for unauthenticated user', async () => {
    getServerSession.mockResolvedValue(null)
    
    const { NextRequest } = require('next/server')
    const request = new NextRequest('http://localhost/api/workout')
    
    const response = await GET(request)
    
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
    
    const { NextRequest } = require('next/server')
    const request = new NextRequest('http://localhost/api/workout')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ workouts: mockWorkouts })
  })

  it('POST creates new workout', async () => {
    const mockSession = { 
      user: { id: 'user-id', email: 'test@example.com' } 
    }
    getServerSession.mockResolvedValue(mockSession)
    
    const workoutData = { title: 'New Workout', description: 'Test' }
    const validatedData = { ...workoutData, isPublic: false }
    const createdWorkout = { id: 'new-workout-id', ...validatedData, userId: 'user-id' }
    
    workoutService.createWorkout.mockResolvedValue(createdWorkout)
    
    const { NextRequest } = require('next/server')
    const request = new NextRequest('http://localhost/api/workout', {
      method: 'POST',
      body: JSON.stringify(workoutData)
    })
    
    const response = await POST(request)
    
    expect(response.status).toBe(201)
    expect(response.body).toEqual(createdWorkout)
    expect(workoutService.createWorkout).toHaveBeenCalledWith(validatedData, 'user-id')
  })
}) 
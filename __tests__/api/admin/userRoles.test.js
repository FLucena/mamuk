// Import the API route handlers
import { GET, PUT } from '@/app/api/admin/users/[userId]/roles/route';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import User from '@/lib/models/user';
import { silenceConsoleForTest } from '../../utils/testUtils';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));

// Mock User model
jest.mock('@/lib/models/user', () => {
  return {
    __esModule: true,
    default: {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn()
    }
  };
});

// Mock console.error to prevent noise in test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('User Roles API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Setup session as null (unauthenticated)
    getServerSession.mockResolvedValueOnce(null);

    // Setup request and params
    const mockRequest = { json: jest.fn() };
    const mockParams = { params: { userId: 'user-123' } };

    await PUT(mockRequest, mockParams);
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'No autorizado' },
      { status: 401 }
    );
  });

  it('should return 401 if user is not an admin', async () => {
    // Setup session with non-admin user
    getServerSession.mockResolvedValueOnce({
      user: { id: 'user-123', role: 'user', roles: ['user'] }
    });

    // Setup request and params
    const mockRequest = { json: jest.fn().mockResolvedValue({ roles: ['admin', 'coach'] }) };
    const mockParams = { params: { userId: 'user-123' } };

    await PUT(mockRequest, mockParams);
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'No autorizado' },
      { status: 401 }
    );
  });

  it('should return 400 if userId is invalid', async () => {
    // Setup admin session
    getServerSession.mockResolvedValueOnce({
      user: { id: 'admin-123', role: 'admin', roles: ['admin'] }
    });

    // Setup request with invalid userId
    const mockRequest = { json: jest.fn().mockResolvedValue({ roles: ['admin', 'coach'] }) };
    const mockParams = { params: { userId: '' } };

    await PUT(mockRequest, mockParams);
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'ID de usuario inválido' },
      { status: 400 }
    );
  });

  it('should return 400 if roles is not an array', async () => {
    // Setup admin session
    getServerSession.mockResolvedValueOnce({
      user: { id: 'admin-123', role: 'admin', roles: ['admin'] }
    });

    // Setup request with non-array roles
    const mockRequest = { json: jest.fn().mockResolvedValue({ roles: 'admin' }) };
    const mockParams = { params: { userId: 'user-123' } };

    await PUT(mockRequest, mockParams);
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Se requiere al menos un rol' },
      { status: 400 }
    );
  });

  it('should return 400 if roles is an empty array', async () => {
    // Setup admin session
    getServerSession.mockResolvedValueOnce({
      user: { id: 'admin-123', role: 'admin', roles: ['admin'] }
    });

    // Setup request with empty roles array
    const mockRequest = { json: jest.fn().mockResolvedValue({ roles: [] }) };
    const mockParams = { params: { userId: 'user-123' } };

    await PUT(mockRequest, mockParams);
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Se requiere al menos un rol' },
      { status: 400 }
    );
  });

  it('should return 404 if user is not found', async () => {
    // Setup admin session
    getServerSession.mockResolvedValueOnce({
      user: { id: 'admin-123', role: 'admin', roles: ['admin'] }
    });

    // Setup request with valid roles
    const mockRequest = { json: jest.fn().mockResolvedValue({ roles: ['admin', 'coach'] }) };
    const mockParams = { params: { userId: 'nonexistent-user' } };

    // Mock user not found
    User.findById.mockResolvedValueOnce(null);

    await PUT(mockRequest, mockParams);
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Usuario no encontrado' },
      { status: 404 }
    );
  });

  it('should update user roles and return the updated user', async () => {
    // Setup admin session
    getServerSession.mockResolvedValueOnce({
      user: { id: 'admin-123', roles: ['admin'] }
    });

    // Setup request with valid roles
    const mockRequest = { json: jest.fn().mockResolvedValue({ roles: ['admin', 'coach'] }) };
    const mockParams = { params: { userId: 'user-123' } };

    // Mock user found
    User.findById.mockResolvedValueOnce({ _id: 'user-123', name: 'Test User' });

    // Mock user update
    User.findByIdAndUpdate.mockResolvedValueOnce({
      _id: 'user-123',
      name: 'Test User',
      roles: ['admin', 'coach']
    });

    await PUT(mockRequest, mockParams);
    
    // Verify findByIdAndUpdate was called with correct params
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-123',
      { roles: ['admin', 'coach'] },
      { new: true }
    );
    
    expect(NextResponse.json).toHaveBeenCalledWith({
      roles: ['admin', 'coach']
    });
  });

  it('should handle errors and return 500', async () => {
    // Setup admin session
    getServerSession.mockResolvedValueOnce({
      user: { id: 'admin-123', role: 'admin', roles: ['admin'] }
    });

    // Setup request with valid roles
    const mockRequest = { json: jest.fn().mockResolvedValue({ roles: ['admin', 'coach'] }) };
    const mockParams = { params: { userId: 'user-123' } };

    // Mock findById to throw an error
    User.findById.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    // Mock NextResponse.json to return the expected error response
    NextResponse.json.mockImplementationOnce((error, status) => {
      return { error, status };
    });

    await PUT(mockRequest, mockParams);
    
    // Check that the error response was returned
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  });

  it('should correctly fetch multiple roles after they are assigned', async () => {
    // First, set up the PUT request to assign multiple roles
    
    // Setup admin session for PUT
    getServerSession.mockResolvedValueOnce({
      user: { id: 'admin-123', role: 'admin', roles: ['admin'] }
    });

    // Setup request with multiple roles
    const mockPutRequest = { json: jest.fn().mockResolvedValue({ roles: ['admin', 'coach', 'customer'] }) };
    const mockParams = { params: { userId: 'user-123' } };

    // Mock user found for PUT
    User.findById.mockResolvedValueOnce({ _id: 'user-123', name: 'Test User' });

    // Mock user update for PUT
    User.findByIdAndUpdate.mockResolvedValueOnce({
      _id: 'user-123',
      name: 'Test User',
      roles: ['admin', 'coach', 'customer'],
      role: 'admin'
    });

    // Execute PUT request
    await PUT(mockPutRequest, mockParams);
    
    // Now, set up the GET request to fetch the roles
    
    // Setup admin session for GET
    getServerSession.mockResolvedValueOnce({
      user: { id: 'admin-123', role: 'admin', roles: ['admin'] }
    });

    // Clear previous mock calls
    User.findById.mockReset();
    NextResponse.json.mockClear();

    // Mock user found for GET with the updated roles
    User.findById.mockResolvedValueOnce({
      _id: 'user-123',
      name: 'Test User',
      roles: ['admin', 'coach', 'customer'],
      role: 'admin'
    });

    // Execute GET request
    await GET({}, mockParams);
    
    // Verify that the GET endpoint returns all assigned roles
    expect(NextResponse.json).toHaveBeenCalledWith({
      roles: ['admin', 'coach', 'customer']
    });
  });
}); 
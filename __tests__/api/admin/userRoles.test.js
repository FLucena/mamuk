// Importar las utilidades
import { silenceConsoleForTest } from '../../utils/testUtils';
import { PUT } from '@/app/api/admin/users/[userId]/roles/route';

// Mock next/server antes de importar
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options }))
  }
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

// Mock utils/security
jest.mock('@/lib/utils/security', () => ({
  validateMongoId: jest.fn()
}));

// Mock db
jest.mock('@/lib/db', () => ({
  dbConnect: jest.fn()
}));

// Mock User model
jest.mock('@/lib/models/user', () => {
  const mockLean = jest.fn().mockReturnValue({
    _id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer',
    roles: ['customer', 'coach']
  });
  
  const mockSelect = jest.fn().mockReturnValue({
    lean: mockLean
  });
  
  const mockFindByIdAndUpdate = jest.fn().mockReturnValue({
    select: mockSelect
  });
  
  return {
    findByIdAndUpdate: mockFindByIdAndUpdate
  };
});

describe('User Roles API', () => {
  // Datos de prueba
  const mockSession = {
    user: {
      id: 'admin-id',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      roles: ['admin']
    }
  };
  
  const mockRequest = {
    json: jest.fn()
  };
  
  const mockParams = {
    params: {
      userId: 'user-123'
    }
  };
  
  // Acceso a los mocks
  const mockUserModel = require('@/lib/models/user');
  const mockNextResponse = require('next/server').NextResponse;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar los mocks por defecto para cada test
    require('next-auth').getServerSession.mockResolvedValue(mockSession);
    require('@/lib/utils/security').validateMongoId.mockReturnValue(true);
    mockRequest.json.mockResolvedValue({ roles: ['admin', 'coach'] });
  });
  
  // Función para configurar el mock de User para devolver null (usuario no encontrado)
  const mockUserNotFound = () => {
    const mockLean = jest.fn().mockReturnValue(null);
    const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
    mockUserModel.findByIdAndUpdate.mockReturnValueOnce({ select: mockSelect });
  };
  
  // Función para configurar el mock de User para lanzar un error
  const mockUserError = (errorMessage = 'Database error') => {
    mockUserModel.findByIdAndUpdate.mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });
  };

  it('should return 401 if user is not authenticated', async () => {
    // Configurar el mock para este test específico
    require('next-auth').getServerSession.mockResolvedValueOnce(null);
    
    await PUT(mockRequest, mockParams);
    
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'No autorizado' },
      { status: 401 }
    );
  });

  it('should return 401 if user is not an admin', async () => {
    // Configurar el mock para este test específico
    require('next-auth').getServerSession.mockResolvedValueOnce({
      user: { ...mockSession.user, role: 'customer' }
    });
    
    await PUT(mockRequest, mockParams);
    
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'No autorizado' },
      { status: 401 }
    );
  });

  it('should return 400 if userId is invalid', async () => {
    // Configurar el mock para este test específico
    require('@/lib/utils/security').validateMongoId.mockReturnValueOnce(false);
    
    await PUT(mockRequest, mockParams);
    
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'ID de usuario inválido' },
      { status: 400 }
    );
  });

  it('should return 400 if roles is not an array', async () => {
    // Configurar el mock para este test específico
    mockRequest.json.mockResolvedValueOnce({ roles: 'not-an-array' });
    
    await PUT(mockRequest, mockParams);
    
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'Se requiere al menos un rol' },
      { status: 400 }
    );
  });

  it('should return 400 if roles is an empty array', async () => {
    // Configurar el mock para este test específico
    mockRequest.json.mockResolvedValueOnce({ roles: [] });
    
    await PUT(mockRequest, mockParams);
    
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'Se requiere al menos un rol' },
      { status: 400 }
    );
  });

  it('should return 400 if roles contains invalid roles', async () => {
    // Configurar el mock para este test específico
    mockRequest.json.mockResolvedValueOnce({ roles: ['admin', 'invalid-role'] });
    
    await PUT(mockRequest, mockParams);
    
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'Roles inválidos' },
      { status: 400 }
    );
  });

  it('should return 404 if user is not found', async () => {
    // Configurar el mock para este test específico
    mockUserNotFound();
    
    await PUT(mockRequest, mockParams);
    
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'Usuario no encontrado' },
      { status: 404 }
    );
  });

  it('should update user roles and return the updated user', async () => {
    const result = await PUT(mockRequest, mockParams);
    
    // Verificar que findByIdAndUpdate fue llamado con los parámetros correctos
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-123',
      { 
        roles: ['admin', 'coach'],
        role: 'admin' // El primer rol se convierte en el rol principal
      },
      { new: true }
    );
    
    // Verificar los datos de respuesta
    expect(result.data).toEqual({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      roles: ['customer', 'coach']
    });
  });

  it('should handle errors and return 500', async () => {
    // Configurar el mock para lanzar un error
    mockUserError('Database error');
    
    // Silenciar los mensajes de consola para este test
    await silenceConsoleForTest(async () => {
      await PUT(mockRequest, mockParams);
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    });
  });
}); 
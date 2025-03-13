/**
 * Mocks reutilizables para tests de API
 */

// Mock para next/server
export const mockNextServer = () => {
  const jsonMock = jest.fn((data, options) => ({ data, options }));
  
  return {
    NextRequest: jest.fn(),
    NextResponse: {
      json: jsonMock
    }
  };
};

// Mock para next-auth
export const mockNextAuth = (session = null) => {
  return {
    getServerSession: jest.fn().mockResolvedValue(session)
  };
};

// Mock para la base de datos
export const mockDb = () => {
  return {
    dbConnect: jest.fn()
  };
};

// Mock para el modelo User
export const mockUserModel = (userData = null) => {
  const defaultUserData = {
    _id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer',
    roles: ['customer', 'coach']
  };
  
  const data = userData || defaultUserData;
  
  const mockLean = jest.fn().mockReturnValue(data);
  const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
  const mockFindByIdAndUpdate = jest.fn().mockReturnValue({ select: mockSelect });
  
  return {
    findByIdAndUpdate: mockFindByIdAndUpdate,
    // Métodos para configurar comportamientos específicos
    setUserData: (newData) => {
      mockLean.mockReturnValue(newData);
    },
    setUserNotFound: () => {
      mockLean.mockReturnValue(null);
    },
    throwError: (errorMessage = 'Database error') => {
      mockFindByIdAndUpdate.mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });
    }
  };
};

// Mock para utilidades de seguridad
export const mockSecurity = (isValidId = true) => {
  return {
    validateMongoId: jest.fn().mockReturnValue(isValidId)
  };
};

// Datos de ejemplo para tests
export const mockData = {
  adminSession: {
    user: {
      id: 'admin-id',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      roles: ['admin']
    }
  },
  customerSession: {
    user: {
      id: 'customer-id',
      name: 'Customer User',
      email: 'customer@example.com',
      role: 'customer',
      roles: ['customer']
    }
  },
  coachSession: {
    user: {
      id: 'coach-id',
      name: 'Coach User',
      email: 'coach@example.com',
      role: 'coach',
      roles: ['coach']
    }
  },
  mockRequest: {
    json: jest.fn().mockResolvedValue({ roles: ['admin', 'coach'] })
  },
  mockParams: {
    params: {
      userId: 'user-123'
    }
  }
}; 
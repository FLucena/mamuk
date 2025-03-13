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
    },
    models: {
      User: null
    },
    model: jest.fn().mockReturnValue({})
  };
});

// Mock db connection
jest.mock('@/lib/db', () => ({
  dbConnect: jest.fn().mockResolvedValue(true)
}));

// Mock User model
jest.mock('@/lib/models/user', () => {
  return {
    __esModule: true,
    default: {
      findOne: jest.fn().mockResolvedValue({
        _id: 'user123',
        roles: ['admin', 'coach']
      }),
      findById: jest.fn().mockResolvedValue({
        _id: 'user123',
        roles: ['admin', 'coach']
      })
    }
  };
});

import { hasRole, hasAnyRole } from '@/lib/utils/permissions';

describe('Role utility functions', () => {
  const userWithRoles = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    roles: ['admin', 'coach']
  };

  const mongoUserWithRoles = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    roles: ['admin', 'coach']
  };

  describe('hasRole function', () => {
    it('should return true when user has the specified role', () => {
      expect(hasRole(userWithRoles, 'admin')).toBe(true);
      expect(hasRole(userWithRoles, 'coach')).toBe(true);
      
      // Test with MongoUser
      expect(hasRole(mongoUserWithRoles, 'admin')).toBe(true);
      expect(hasRole(mongoUserWithRoles, 'coach')).toBe(true);
    });

    it('should return false when user does not have the specified role', () => {
      expect(hasRole(userWithRoles, 'customer')).toBe(false);
      expect(hasRole(mongoUserWithRoles, 'customer')).toBe(false);
    });

    it('should return false when user is null or undefined', () => {
      expect(hasRole(null, 'admin')).toBe(false);
      expect(hasRole(undefined, 'admin')).toBe(false);
    });

    it('should return false when user has empty roles array', () => {
      const userWithEmptyRoles = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        roles: []
      };
      expect(hasRole(userWithEmptyRoles, 'coach')).toBe(false);
    });
  });

  describe('hasAnyRole function', () => {
    it('should return true when user has any of the specified roles', () => {
      expect(hasAnyRole(userWithRoles, ['admin', 'customer'])).toBe(true);
      expect(hasAnyRole(userWithRoles, ['coach', 'customer'])).toBe(true);
      
      // Test with MongoUser
      expect(hasAnyRole(mongoUserWithRoles, ['admin', 'customer'])).toBe(true);
      expect(hasAnyRole(mongoUserWithRoles, ['coach', 'customer'])).toBe(true);
    });

    it('should return false when user has none of the specified roles', () => {
      expect(hasAnyRole(userWithRoles, ['customer'])).toBe(false);
      expect(hasAnyRole(mongoUserWithRoles, ['customer'])).toBe(false);
    });

    it('should return false when user is null or undefined', () => {
      expect(hasAnyRole(null, ['admin'])).toBe(false);
      expect(hasAnyRole(undefined, ['admin'])).toBe(false);
    });

    it('should return false when user has empty roles array', () => {
      const userWithEmptyRoles = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        roles: []
      };
      expect(hasAnyRole(userWithEmptyRoles, ['coach'])).toBe(false);
    });
  });
}); 
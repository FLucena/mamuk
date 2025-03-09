import { hasRole, hasAnyRole } from '@/lib/types/user';

describe('Role utility functions', () => {
  const userWithRoles = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    roles: ['admin', 'coach']
  };

  const mongoUserWithRoles = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
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

    it('should return false when user has no roles property', () => {
      const userWithoutRoles = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      };
      expect(hasRole(userWithoutRoles, 'coach')).toBe(false);
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

    it('should return false when user has no roles property', () => {
      const userWithoutRoles = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      };
      expect(hasAnyRole(userWithoutRoles, ['coach'])).toBe(false);
    });
  });
}); 
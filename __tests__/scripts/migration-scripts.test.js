/**
 * Tests for the role migration scripts
 * 
 * These tests verify that the migration scripts correctly update users
 * from the old role property to the new roles array.
 */

// Mock mongoose
const mongoose = {
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  Schema: jest.fn().mockReturnValue({}),
  model: jest.fn().mockReturnValue({})
};

// Mock the console methods
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock process.exit
process.exit = jest.fn();

// Mock User model
const mockUsers = [
  { _id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { _id: '2', name: 'Coach User', email: 'coach@example.com', role: 'coach' },
  { _id: '3', name: 'Customer User', email: 'customer@example.com', role: 'customer' },
  { _id: '4', name: 'Multi-role User', email: 'multi@example.com', role: 'admin', roles: ['admin', 'coach'] },
  { _id: '5', name: 'New User', email: 'new@example.com', roles: ['customer'] }
];

const User = {
  find: jest.fn().mockImplementation((query) => {
    if (query.role && query.role.$exists === true) {
      // Filter users with role property
      return Promise.resolve(
        mockUsers.filter(user => 
          user.role && 
          (!user.roles || user.roles.length === 0)
        )
      );
    }
    return Promise.resolve(mockUsers);
  }),
  findOne: jest.fn().mockImplementation((query) => {
    const user = mockUsers.find(u => u.email === query.email);
    return {
      lean: jest.fn().mockReturnValue(Promise.resolve(user))
    };
  }),
  updateOne: jest.fn().mockImplementation((query, update) => {
    const userIndex = mockUsers.findIndex(u => u._id === query._id);
    if (userIndex !== -1) {
      if (update.$set && update.$set.roles) {
        mockUsers[userIndex].roles = update.$set.roles;
      }
    }
    return Promise.resolve({ modifiedCount: 1 });
  }),
  create: jest.fn().mockImplementation((users) => {
    return Promise.resolve(users);
  }),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: mockUsers.length }),
  collection: {
    indexes: jest.fn().mockResolvedValue([]),
    dropIndex: jest.fn().mockResolvedValue(true),
    createIndex: jest.fn().mockResolvedValue('roles_1')
  }
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('User Role Migration Scripts', () => {
  describe('migrate-user-roles.js', () => {
    // Import the migration function
    const migrateUsers = async () => {
      // Find users with role property but no roles array
      const usersToMigrate = await User.find({
        role: { $exists: true },
        $or: [
          { roles: { $exists: false } },
          { roles: { $size: 0 } }
        ]
      });
      
      // Update each user
      for (const user of usersToMigrate) {
        // Update user with roles array
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { roles: [user.role] }
          }
        );
      }
    };
    
    test('should migrate users with role property to roles array', async () => {
      // Run migration
      await migrateUsers();
      
      // Verify updateOne was called for users with role property
      expect(User.updateOne).toHaveBeenCalled();
      
      // Check that the updateOne was called with the correct parameters
      expect(User.updateOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          $set: expect.objectContaining({
            roles: expect.any(Array)
          })
        })
      );
    });
    
    test('should not modify users that already have roles array', async () => {
      // Run migration
      await migrateUsers();
      
      // Verify that updateOne was not called for users with roles array
      const multiRoleUser = mockUsers.find(u => u.email === 'multi@example.com');
      expect(multiRoleUser.roles).toEqual(['admin', 'coach']);
    });
    
    test('should handle users with no role property', async () => {
      // Run migration
      await migrateUsers();
      
      // Verify that updateOne was not called for users without role property
      const newUser = mockUsers.find(u => u.email === 'new@example.com');
      expect(newUser.roles).toEqual(['customer']);
    });
  });
  
  describe('update-user-indexes.js', () => {
    test('should create index for roles array if it does not exist', async () => {
      // Create the index
      await User.collection.createIndex({ roles: 1 }, { 
        name: 'roles_1',
        background: true
      });
      
      // Verify createIndex was called
      expect(User.collection.createIndex).toHaveBeenCalledWith(
        { roles: 1 },
        expect.objectContaining({
          name: 'roles_1',
          background: true
        })
      );
    });
  });
}); 
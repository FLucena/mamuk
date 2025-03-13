/**
 * Helper functions for mocking MongoDB models in tests
 */

/**
 * Creates a mock for a MongoDB model with common methods
 * @param {Object} mockData - Default data to return from queries
 * @returns {Object} Mock model with common Mongoose methods
 */
export function createMockModel(mockData = {}) {
  const mockDocument = {
    ...mockData,
    _id: mockData._id || 'mock-id',
    save: jest.fn().mockResolvedValue(mockData),
    toObject: jest.fn().mockReturnValue(mockData),
    toJSON: jest.fn().mockReturnValue(mockData),
  };

  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockDocument),
  };

  return {
    findOne: jest.fn().mockImplementation(() => mockQuery),
    findById: jest.fn().mockImplementation(() => mockQuery),
    find: jest.fn().mockImplementation(() => ({
      ...mockQuery,
      exec: jest.fn().mockResolvedValue([mockDocument]),
    })),
    create: jest.fn().mockResolvedValue(mockDocument),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    countDocuments: jest.fn().mockResolvedValue(1),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockDocument),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockDocument),
    aggregate: jest.fn().mockResolvedValue([mockDocument]),
  };
}

/**
 * Creates a mock for a User model with roles
 * @param {Object} userData - User data to include in the mock
 * @returns {Object} Mock User model
 */
export function createMockUserModel(userData = {}) {
  const defaultUserData = {
    _id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer',
    roles: ['customer'],
    ...userData,
  };

  return createMockModel(defaultUserData);
}

/**
 * Creates a mock for a Workout model
 * @param {Object} workoutData - Workout data to include in the mock
 * @returns {Object} Mock Workout model
 */
export function createMockWorkoutModel(workoutData = {}) {
  const defaultWorkoutData = {
    _id: 'workout-123',
    name: 'Test Workout',
    description: 'Test Description',
    userId: 'user-123',
    days: [],
    ...workoutData,
  };

  return createMockModel(defaultWorkoutData);
}

/**
 * Creates a mock for a Coach model
 * @param {Object} coachData - Coach data to include in the mock
 * @returns {Object} Mock Coach model
 */
export function createMockCoachModel(coachData = {}) {
  const defaultCoachData = {
    _id: 'coach-123',
    userId: 'user-123',
    customers: [],
    ...coachData,
  };

  return createMockModel(defaultCoachData);
} 
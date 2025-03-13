/**
 * Helper functions for mocking database connections in tests
 */

/**
 * Creates a mock for the database connection
 * @returns {Object} Mock database connection functions
 */
export function createMockDbConnection() {
  return {
    dbConnect: jest.fn().mockResolvedValue(true),
    dbDisconnect: jest.fn().mockResolvedValue(true),
  };
}

/**
 * Sets up mocks for database-related modules
 */
export function setupDbMocks() {
  // Mock the database connection
  jest.mock('@/lib/db', () => ({
    dbConnect: jest.fn().mockResolvedValue(true),
    dbDisconnect: jest.fn().mockResolvedValue(true),
  }));

  // Mock mongoose
  jest.mock('mongoose', () => {
    return require('../../../__mocks__/mongoose');
  });
}

/**
 * Clears all mocks related to the database
 */
export function clearDbMocks() {
  jest.clearAllMocks();
}

/**
 * Resets all mocks related to the database
 */
export function resetDbMocks() {
  jest.resetAllMocks();
} 
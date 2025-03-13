/**
 * MSW setup file for tests
 */
import { setupServer } from 'msw/lib/node';

/**
 * Creates a mock API server with the provided handlers
 * @param {Array} handlers - Array of MSW handlers
 * @returns {Object} MSW server instance
 */
export function createMockApiServer(handlers = []) {
  return setupServer(...handlers);
}

/**
 * Standard MSW setup for tests
 * @param {Array} handlers - Array of MSW handlers
 * @returns {Object} - Object with setup, teardown, and server
 */
export function setupMswForTest(handlers = []) {
  const server = createMockApiServer(handlers);
  
  return {
    setup: () => {
      // Start the server before all tests
      beforeAll(() => server.listen());
      
      // Reset handlers after each test
      afterEach(() => server.resetHandlers());
      
      // Close server after all tests
      afterAll(() => server.close());
    },
    server,
  };
} 
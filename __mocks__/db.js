/**
 * Mock for database connection
 */
module.exports = {
  dbConnect: jest.fn().mockResolvedValue(true),
  dbDisconnect: jest.fn().mockResolvedValue(true),
}; 
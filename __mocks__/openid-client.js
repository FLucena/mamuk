// Mock for openid-client module
module.exports = {
  Issuer: {
    discover: jest.fn(() => Promise.resolve({
      Client: jest.fn(() => ({
        callback: jest.fn(),
        authorizationUrl: jest.fn(),
        refresh: jest.fn(),
        revoke: jest.fn(),
      })),
    })),
  },
}; 
// Mock for jose module
module.exports = {
  compactDecrypt: jest.fn(),
  compactVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}; 
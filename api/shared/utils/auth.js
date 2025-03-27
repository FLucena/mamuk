import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for authenticated users
 * @param {Object} user - User object from database
 * @returns {String} Generated JWT token
 */
export const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email || '',
    role: user.role || 'user'
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'default_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload if valid, throws error if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Extract token from authorization header
 * @param {String} authHeader - Authorization header
 * @returns {String|null} JWT token or null if not found
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}; 
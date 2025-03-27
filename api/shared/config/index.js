/**
 * Centralized configuration for API 
 * Handles different environments (development, production, test)
 */

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Default configuration
const config = {
  // Database settings
  db: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Authentication settings
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    google: {
      clientId: process.env.VITE_GOOGLE_CLIENT_ID
    }
  },
  
  // API settings
  api: {
    prefix: '/api',
    cors: {
      origin: isProd ? process.env.FRONTEND_URL : '*',
      credentials: true
    }
  },
  
  // Environment flags
  env: {
    isDev,
    isProd,
    isTest
  }
};

export default config; 
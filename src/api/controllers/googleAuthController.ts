import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Define constants from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:5173';

// Define interface for user data
interface UserData {
  _id: string;
  email: string;
  role: string;
}

// Type for jwt.sign to avoid any
type JwtSignFunction = (
  payload: string | object | Buffer,
  secretOrPrivateKey: jwt.Secret,
  options?: jwt.SignOptions
) => string;

// Generate JWT token
const generateToken = (user: UserData) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role || 'user'
  };

  // Use type casting with a proper type instead of any
  return (jwt.sign as JwtSignFunction)(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

export const googleAuthController = {
  // Handle Google OAuth callback
  googleCallback: (_req: Request, res: Response) => {
    res.redirect('/api/auth/google/success');
  },

  // Handle successful authentication
  googleSuccess: (req: Request, res: Response) => {
    if (!req.user) {
      return res.redirect('/api/auth/google/failure');
    }

    try {
      // Cast req.user to UserData
      const userData = req.user as unknown as UserData;
      
      // Generate token
      const token = generateToken(userData);
      
      // Redirect to frontend with token
      res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}`);
    } catch (error) {
      console.error('Google auth success error:', error);
      res.redirect('/api/auth/google/failure');
    }
  },

  // Handle authentication failure
  googleFailure: (_req: Request, res: Response) => {
    res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

export default googleAuthController; 
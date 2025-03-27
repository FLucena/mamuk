import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

// Define constants from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:5173';
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || '';

// Create a Google OAuth client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

  // Verify Google token from client-side authentication
  verifyGoogleToken: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ success: false, message: 'Google token is required' });
      }
      
      // Verify the Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        return res.status(400).json({ success: false, message: 'Invalid Google token' });
      }
      
      // Check if user exists in database, if not create a new one
      // This would typically call a service function to handle database operations
      // For simplicity, we're just creating a mock user here
      const userData = {
        _id: payload.sub || '',
        email: payload.email,
        name: payload.name || '',
        role: 'user',
        profilePicture: payload.picture || '',
        googleId: payload.sub || ''
      };
      
      // Generate JWT token
      const jwtToken = generateToken(userData);
      
      // Return user data and token
      return res.status(200).json({
        success: true,
        token: jwtToken,
        expiresIn: JWT_EXPIRES_IN,
        ...userData
      });
    } catch (error) {
      console.error('Google token verification error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to verify Google token' 
      });
    }
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
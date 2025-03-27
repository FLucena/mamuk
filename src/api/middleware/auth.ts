import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../../models/User';
import { AuthRequest } from '../../types/express';

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request object
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Extract token without "Bearer " prefix
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'default_secret'
    ) as jwt.JwtPayload;
    
    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request
    (req as AuthRequest).user = {
      userId: user._id.toString(),
      role: user.role || 'user'
    };
    
    next();
  } catch (error: unknown) {
    console.error('Authentication error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
    }
    
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Role-based authorization middleware
 * Ensures user has one of the allowed roles
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (allowedRoles.length === 0 || allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ 
        message: `Not authorized, required roles: ${allowedRoles.join(', ')}` 
      });
    }
  };
}; 
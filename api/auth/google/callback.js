import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../../../src/models/User';
import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // Already connected
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected in serverless function');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
};

// Generate JWT token
const generateToken = (user) => {
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

export default async function handler(req, res) {
  // Handle both GET and POST methods for flexibility
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For POST requests, we expect a token in the body
    // For GET requests, this would be handled by Google OAuth redirect
    const { token } = req.body || {};
    
    if (req.method === 'POST' && !token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Connect to database
    await connectDB();
    
    if (req.method === 'POST') {
      // Verify the token with Google OAuth2
      const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
      
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.VITE_GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      
      if (!payload) {
        return res.status(401).json({ error: 'Invalid Google token' });
      }
      
      // Find or create the user based on the Google ID
      let user = await User.findOne({ googleId: payload.sub });
      
      if (!user) {
        // If not found by Google ID, check if a user exists with the same email
        const existingUserByEmail = await User.findOne({ email: payload.email });
        
        if (existingUserByEmail) {
          // Update existing user with Google details
          user = existingUserByEmail;
          // Add Google authentication to the existing user
          if (payload.email && payload.name && payload.picture && payload.sub) {
            user.googleId = payload.sub;
            user.email = payload.email;
            user.name = payload.name;
            user.profilePicture = payload.picture;
            user.authProvider = 'google';
          }
          
          // Ensure authProvider is updated if needed
          if (!user.authProvider) {
            user.authProvider = 'google';
          }
          
          await user.save();
        } else {
          // Create new user if not found
          if (payload.email && payload.name) {
            const newUser = {
              name: payload.name,
              email: payload.email,
              authProvider: 'google',
              googleId: payload.sub || '',
              profilePicture: payload.picture || '',
              role: 'customer', // Default role for new users
              emailVerified: payload.email_verified
            };
            
            user = new User(newUser);
            await user.save();
          } else {
            return res.status(400).json({ error: 'Incomplete user data from Google' });
          }
        }
      } else {
        // Update existing user's Google data
        if (payload.email && payload.name && payload.picture && user.googleId) {
          user.email = payload.email;
          user.name = payload.name;
          user.profilePicture = payload.picture;
          user.authProvider = 'google';
        }
        
        // Ensure authProvider is set correctly
        if (!user.authProvider) {
          user.authProvider = 'google';
        }
        
        await user.save();
      }
      
      // Only generate token if user is available
      if (!user) {
        return res.status(400).json({ error: 'Failed to create or find user' });
      }
      
      // Generate a real JWT token
      const jwtToken = generateToken(user);
      
      // Return the user data with the token
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer',
        profilePicture: user.profilePicture,
        token: jwtToken
      };
      
      return res.status(200).json(userData);
    } else {
      // GET method - should redirect to frontend with error message
      // This is a simplified version for Vercel deployment
      const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.mamuk.com.ar';
      return res.redirect(`${FRONTEND_URL}/auth-callback?error=use_post_method`);
    }
  } catch (error) {
    console.error('Error processing Google authentication:', error);
    
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: error.message
    });
  }
} 
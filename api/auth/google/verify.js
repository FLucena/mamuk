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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }
    
    // Connect to database
    await connectDB();
    
    // Verify the Google token
    const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }
    
    // Find or create user
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      // Only create a new user if we have the required data
      if (payload.name && payload.email && payload.sub) {
        const newUserData = {
          name: payload.name,
          email: payload.email,
          role: 'user',
          googleId: payload.sub,
          profilePicture: payload.picture || '',
          authProvider: 'google'
        };
        
        user = new User(newUserData);
        await user.save();
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Incomplete user data from Google' 
        });
      }
    }
    
    if (!user) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create or retrieve user' 
      });
    }
    
    // Generate JWT token
    const jwtToken = generateToken(user);
    
    // Return user data and token
    return res.status(200).json({
      success: true,
      token: jwtToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      profilePicture: user.profilePicture || ''
    });
  } catch (error) {
    console.error('Google token verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify Google token',
      details: error.message 
    });
  }
} 
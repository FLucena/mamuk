import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import { GoogleProfile } from '../models/User';

// Create a type definition to help TypeScript understand what passport expects
type DoneCallback = (error: Error | null, user?: unknown) => void;

// Configure passport with Google OAuth strategy
const configurePassport = () => {
  // Get the server URL based on environment
  const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.VITE_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET || '',
        callbackURL: `${SERVER_URL}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Format profile data to match our GoogleProfile interface
          const googleProfile: GoogleProfile = {
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails || [],
            photos: profile.photos
          };
          
          // Find or create user
          const user = await User.findOrCreateGoogleUser(googleProfile);
          
          // Use a typed version of done to satisfy TypeScript
          (done as DoneCallback)(null, user);
          return;
        } catch (error) {
          (done as DoneCallback)(error as Error, undefined);
          return;
        }
      }
    )
  );

  // Configure serialization/deserialization
  passport.serializeUser((user, done) => {
    if (user && typeof user === 'object' && '_id' in user) {
      // Extract the ID as a string to avoid type issues
      const userId = String(user._id);
      done(null, userId);
    } else {
      done(new Error('User object is missing _id'), null);
    }
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      // Use a typed version of done to satisfy TypeScript
      (done as DoneCallback)(null, user);
    } catch (error) {
      (done as DoneCallback)(error as Error, undefined);
    }
  });
  
  return passport;
};

export default configurePassport; 
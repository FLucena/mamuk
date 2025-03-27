/**
 * TypeScript Server Implementation
 * 
 * IMPORTANT NOTE:
 * This TypeScript server implementation contains type definitions that will help with future
 * development and maintenance. However, it currently has some TypeScript compilation errors
 * that would require significant refactoring to fully resolve.
 * 
 * For immediate development and production use, we are currently using:
 * - server-dev.js: A JavaScript version that's fully functional for development
 * 
 * To run the development server:
 * npm run server:dev
 * 
 * Long-term plan:
 * 1. Gradually refine these type definitions
 * 2. Properly integrate with Express and Passport typings
 * 3. Set up a proper build process for TypeScript -> JavaScript compilation
 * 
 * The most significant issues to resolve:
 * - User model type compatibility with Express.User
 * - AuthRequest interface integration with Express request types
 * - JSONWebToken typings for sign/verify functions
 */

// Using TypeScript with proper imports
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import { AuthRequest } from './types/express';
import User, { AuthProvider } from './models/User';

// Load environment variables if not already loaded
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Define a proper User interface
interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: string;
  height?: number;
  weight?: number;
  fitnessGoals?: string[];
  healthConditions?: string[];
  createdAt?: Date;
  googleId?: string;
  authProvider?: AuthProvider;
  emailVerified?: boolean;
  save: () => Promise<User>;
}

// Define MongoDB specific error interfaces
interface ValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { message: string }>;
}

interface MongoServerError extends Error {
  name: 'MongoServerError';
  code: number;
  keyValue: Record<string, unknown>;
}

// Define a proper UserModel interface with static methods
interface UserModelType {
  findById(id: string): Promise<User | null>;
  findOne(query: Record<string, unknown>): Promise<User | null>;
  new(doc: Partial<User>): User;  // Add constructor signature
}

// Cast the imported model to our interface
const UserModel = User as unknown as UserModelType;

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mamuk';

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Configure Passport
const configurePassport = (): passport.PassportStatic => {
  // Serialize user
  passport.serializeUser((user: Express.User, done) => {
    const userWithId = user as User & { id?: string };
    done(null, userWithId.id || userWithId._id);
  });

  // Deserialize user
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await UserModel.findById(id);
      // Use type casting to ensure compatibility with Passport's expected type
      done(null, user ? { 
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user', // Provide default role to avoid undefined
        profilePicture: user.profilePicture
      } : false);
    } catch (error) {
      done(error, false);
    }
  });

  // Get the server URL based on environment
  const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
  
  // Fix client ID issue by getting it directly - logging to debug
  const clientID = process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientID || !clientSecret) {
    console.error('Google OAuth credentials missing! Authentication will fail.');
  }

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID as string,
        clientSecret: clientSecret as string,
        callbackURL: `${SERVER_URL}/api/auth/google/callback`,
        scope: ['profile', 'email']
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Find or create user
          let user = await UserModel.findOne({ googleId: profile.id });

          if (!user) {
            // Create a user object that matches our User interface
            const newUser = {
              name: profile.displayName,
              email: profile.emails?.[0]?.value || '',
              googleId: profile.id,
              profilePicture: profile.photos?.[0]?.value || '',
              authProvider: AuthProvider.GOOGLE,
              save: async function() { return this; } // Mock function for type compatibility
            } as User;

            // Use actual implementation
            user = await UserModel.findOne({ email: newUser.email });
            if (!user) {
              // Here we would create a new user via your User model
              // This depends on your actual implementation
              // For now just log that we would create a user
              console.log('Would create new user:', newUser);
            }
          }

          // Use type casting to ensure compatibility with Passport's expected type
          return done(null, user ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || 'user', // Provide default role to avoid undefined
            profilePicture: user.profilePicture || ''
          } : false);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  return passport;
};

// Initialize Express app
const app = express();
const PORT = parseInt(process.env.API_PORT || '5000');

// Connect to MongoDB
connectDB();

// Initialize passport
const passportInstance = configurePassport();

// Setup allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://localhost:5000',
  'https://localhost:5000',
  'https://www.mamuk.com.ar'
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins regardless of protocol
    if (origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check against static allowed origins for non-localhost
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24, // 1 day
    autoRemove: 'native',
    touchAfter: 24 * 3600 // time period in seconds
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Initialize passport middleware
app.use(passportInstance.initialize());
app.use(passportInstance.session());

// JWT functions
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:5173';

// Instead of using namespace, use module augmentation
// This is preferred over namespaces in modern TypeScript
declare module 'express-serve-static-core' {
  // Extend the existing User interface (don't redefine it)
  interface User {
    _id: string;
    name?: string;
    // Using same modifier for email to avoid the "All declarations of 'email' must have identical modifiers" error
    email?: string;
    role: string;
    profilePicture?: string;
    googleId?: string;
  }
}

// Generate JWT token
const generateToken = (user: User): string => {
  const payload = {
    id: user._id,
    email: user.email || '', // Provide default for undefined email
    role: user.role || 'user'
  };
  
  // Use a type-safe approach for jwt.sign
  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

// JWT Authentication middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    
    // Add user info to request
    (req as AuthRequest).user = {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role || 'customer'
    };
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error instanceof Error ? error.message : error);
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};

// Google Auth Controller
const googleAuthController = {
  googleCallback: (_req: express.Request, res: express.Response): void => {
    res.redirect('/api/auth/google/success');
  },

  googleSuccess: (req: express.Request, res: express.Response): void => {
    if (!req.user) {
      return res.redirect('/api/auth/google/failure');
    }

    try {
      // Cast to our User type for token generation
      const userWithRequiredProps = {
        _id: (req.user as Express.User)._id,
        name: (req.user as Express.User).name || '',
        email: (req.user as Express.User).email || '',
        role: (req.user as Express.User).role,
        save: async () => req.user as User
      } as User;
      
      const token = generateToken(userWithRequiredProps);
      res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}`);
    } catch (error) {
      console.error('Google auth success error:', error);
      res.redirect('/api/auth/google/failure');
    }
  },

  googleFailure: (_req: express.Request, res: express.Response): void => {
    res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

// API routes
// Add a simple healthcheck endpoint
app.get('/api/healthcheck', (_req, res) => {
  res.status(200).json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Auth routes
app.get('/api/auth/google', 
  passportInstance.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback', 
  passportInstance.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
  googleAuthController.googleCallback
);

// Add a POST endpoint for handling the token from the frontend
app.post('/api/auth/google/callback', async (req: express.Request, res: express.Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    try {
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
            user.authProvider = AuthProvider.GOOGLE;
          }
          
          // Ensure authProvider is updated if needed
          if (!user.authProvider) {
            user.authProvider = AuthProvider.GOOGLE;
          }
          
          await user.save();
        } else {
          // Create new user if not found
          if (payload.email && payload.name) {
            const newUser = {
              name: payload.name,
              email: payload.email,
              authProvider: AuthProvider.GOOGLE,
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
          user.authProvider = AuthProvider.GOOGLE;
        }
        
        // Ensure authProvider is set correctly
        if (!user.authProvider) {
          user.authProvider = AuthProvider.GOOGLE;
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
    } catch (verificationError) {
      console.error('Google token verification error:', verificationError);
      return res.status(401).json({ 
        error: 'Failed to verify Google token',
        details: verificationError instanceof Error ? verificationError.message : String(verificationError)
      });
    }
  } catch (error) {
    console.error('Error processing Google authentication:');
    console.error('Error message:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : error);
    
    // Check for specific error types
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationError = error as ValidationError;
      console.error('MongoDB validation error:', validationError.errors);
      return res.status(400).json({ 
        error: 'User validation failed',
        details: Object.keys(validationError.errors).map((field: string) => ({
          field,
          message: validationError.errors[field].message
        }))
      });
    }
    
    if (error instanceof Error && error.name === 'MongoServerError' && (error as MongoServerError).code === 11000) {
      const mongoError = error as MongoServerError;
      console.error('MongoDB duplicate key error:', mongoError.keyValue);
      return res.status(409).json({ 
        error: 'User already exists',
        details: `Duplicate value for ${Object.keys(mongoError.keyValue)[0]}`
      });
    }
    
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add the Google verify endpoint
app.post('/api/auth/google/verify', async (req: express.Request, res: express.Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }
    
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
          authProvider: AuthProvider.GOOGLE
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
      expiresIn: JWT_EXPIRES_IN,
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
      message: 'Failed to verify Google token' 
    });
  }
});

app.get('/api/auth/google/success', googleAuthController.googleSuccess);
app.get('/api/auth/google/failure', googleAuthController.googleFailure);

// User Profile endpoint
app.get('/api/users/profile', authenticate as express.RequestHandler, async (req: express.Request, res: express.Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user?.userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }
    
    const user = await User.findById(authReq.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data (excluding sensitive info)
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'customer',
      profilePicture: user.profilePicture,
      bio: user.bio,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      fitnessGoals: user.fitnessGoals,
      healthConditions: user.healthConditions,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// For workout routes, use a simple approach to register them
// We'll handle this more gracefully in the future
app.use('/api/workouts', (req, res, next) => {
  // Forward requests to the workout routes
  // This is a temporary solution until we properly fix the module system
  import('./api/routes/workoutRoutes')
    .then(module => {
      const router = module.default;
      router(req, res, next);
    })
    .catch(error => {
      console.error('Error loading workout routes:', error);
      res.status(500).json({ error: 'Server configuration error' });
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
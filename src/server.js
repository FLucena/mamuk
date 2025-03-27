// Using plain JavaScript to avoid TypeScript issues
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mamuk';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Load User model
const User = require('./models/User');

// Configure Passport
const configurePassport = () => {
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
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
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: `${SERVER_URL}/api/auth/google/callback`,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find or create user
          let user = await User.findOne({ 'google.id': profile.id });

          if (!user) {
            user = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              google: {
                id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                picture: profile.photos[0].value
              }
            });
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
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
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:5173';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// JWT Authentication middleware
const authenticate = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user info to request
    req.user = {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role || 'customer'
    };
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Google Auth Controller
const googleAuthController = {
  googleCallback: (req, res) => {
    res.redirect('/api/auth/google/success');
  },

  googleSuccess: (req, res) => {
    if (!req.user) {
      return res.redirect('/api/auth/google/failure');
    }

    try {
      const token = generateToken(req.user);
      res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}`);
    } catch (error) {
      console.error('Google auth success error:', error);
      res.redirect('/api/auth/google/failure');
    }
  },

  googleFailure: (req, res) => {
    res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

// API routes
// Auth routes
app.get('/api/auth/google', 
  passportInstance.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback', 
  passportInstance.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
  googleAuthController.googleCallback
);

// Add a POST endpoint for handling the token from the frontend
app.post('/api/auth/google/callback', async (req, res) => {
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
      let user = await User.findOne({ 'google.id': payload.sub });
      
      if (!user) {
        // If not found by Google ID, check if a user exists with the same email
        const existingUserByEmail = await User.findOne({ email: payload.email });
        
        if (existingUserByEmail) {
          // Update existing user with Google details
          user = existingUserByEmail;
          // Add Google authentication to the existing user
          user.google = {
            id: payload.sub,
            email: payload.email,
            name: payload.name, 
            picture: payload.picture
          };
          user.profilePicture = user.profilePicture || payload.picture;
          
          // Ensure authProvider is updated if needed
          if (!user.authProvider) {
            user.authProvider = 'google';
          }
          
          await user.save();
        } else {
          // Create new user if not found
          user = new User({
            name: payload.name,
            email: payload.email,
            authProvider: 'google', // Set auth provider to google
            google: {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              picture: payload.picture
            },
            profilePicture: payload.picture,
            role: 'customer', // Default role for new users
            emailVerified: payload.email_verified
          });
          
          await user.save();
        }
      } else {
        // Update existing user's Google data
        user.google.email = payload.email;
        user.google.name = payload.name;
        user.google.picture = payload.picture;
        user.profilePicture = user.profilePicture || payload.picture;
        
        // Ensure authProvider is set correctly
        if (!user.authProvider) {
          user.authProvider = 'google';
        }
        
        await user.save();
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
        details: verificationError.message
      });
    }
  } catch (error) {
    console.error('Error processing Google authentication:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific error types
    if (error.name === 'ValidationError') {
      console.error('MongoDB validation error:', error.errors);
      return res.status(400).json({ 
        error: 'User validation failed',
        details: Object.keys(error.errors).map(field => ({
          field,
          message: error.errors[field].message
        }))
      });
    }
    
    if (error.name === 'MongoServerError' && error.code === 11000) {
      console.error('MongoDB duplicate key error:', error.keyValue);
      return res.status(409).json({ 
        error: 'User already exists',
        details: `Duplicate value for ${Object.keys(error.keyValue)[0]}`
      });
    }
    
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: error.message
    });
  }
});

// Add the Google verify endpoint
app.post('/api/auth/google/verify', async (req, res) => {
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
      // Create a new user
      user = new User({
        name: payload.name,
        email: payload.email,
        role: 'user',
        google: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
      });
      
      await user.save();
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
      profilePicture: user.google?.picture || ''
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
app.get('/api/users/profile', authenticate, async (req, res) => {
  try {
    
    const user = await User.findById(req.user.userId);
    
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

// Mount workout routes
app.use('/api/workouts', require('./api/routes/workoutRoutes'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
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

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

app.get('/api/auth/google/success', googleAuthController.googleSuccess);
app.get('/api/auth/google/failure', googleAuthController.googleFailure);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
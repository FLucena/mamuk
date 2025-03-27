// Using require-style imports to avoid ESM/CJS confusion
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './lib/db';
import createApiRouter from './api/routes/index';
import configurePassport from './config/passport';
import MongoStore from 'connect-mongo';

// Initialize Express
const app = express();
const PORT = parseInt(process.env.API_PORT || '5000');

// Connect to MongoDB
connectDB();

// Initialize passport
const passport = configurePassport();

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

// MongoDB URI for session store
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mamuk';

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
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use('/api', createApiRouter(passport));

// Health check route
app.get('/health', (_: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 404 Handler
app.use((_: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler - Express requires all 4 parameters even if some are unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
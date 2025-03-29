"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Using TypeScript with proper imports
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const mongoose_1 = __importDefault(require("mongoose"));
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importStar(require("./models/User"));
// Load environment variables if not already loaded
const envPath = path_1.default.resolve(process.cwd(), '.env.local');
dotenv_1.default.config({ path: envPath });
// Cast the imported model to our interface
const UserModel = User_1.default;
// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mamuk';
// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
// Configure Passport
const configurePassport = () => {
    // Serialize user
    passport_1.default.serializeUser((user, done) => {
        const userWithId = user;
        done(null, userWithId.id || userWithId._id);
    });
    // Deserialize user
    passport_1.default.deserializeUser(async (id, done) => {
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
        }
        catch (error) {
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
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: `${SERVER_URL}/api/auth/google/callback`,
        scope: ['profile', 'email']
    }, async (_accessToken, _refreshToken, profile, done) => {
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
                    authProvider: User_1.AuthProvider.GOOGLE,
                    save: async function () { return this; } // Mock function for type compatibility
                };
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
        }
        catch (error) {
            return done(error, false);
        }
    }));
    return passport_1.default;
};
// Initialize Express app
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc)
        if (!origin)
            return callback(null, true);
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
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
// Session configuration with MongoDB store
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
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
// Generate JWT token
const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email || '', // Provide default for undefined email
        role: user.role || 'user'
    };
    // Use a type-safe approach for jwt.sign
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
// JWT Authentication middleware
const authenticate = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Add user info to request
        req.user = {
            userId: decoded.id,
            email: decoded.email,
            role: decoded.role || 'customer'
        };
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error instanceof Error ? error.message : error);
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
};
// Google Auth Controller
const googleAuthController = {
    googleCallback: (_req, res) => {
        res.redirect('/api/auth/google/success');
    },
    googleSuccess: (req, res) => {
        if (!req.user) {
            return res.redirect('/api/auth/google/failure');
        }
        try {
            // Cast to our User type for token generation
            const userWithRequiredProps = {
                _id: req.user._id,
                name: req.user.name || '',
                email: req.user.email || '',
                role: req.user.role,
                save: async () => req.user
            };
            const token = generateToken(userWithRequiredProps);
            res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}`);
        }
        catch (error) {
            console.error('Google auth success error:', error);
            res.redirect('/api/auth/google/failure');
        }
    },
    googleFailure: (_req, res) => {
        res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }
};
// API routes
// Add a simple healthcheck endpoint
app.get('/api/healthcheck', (_req, res) => {
    res.status(200).json({ message: 'Server is running', timestamp: new Date().toISOString() });
});
// Auth routes
app.get('/api/auth/google', passportInstance.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback', passportInstance.authenticate('google', { failureRedirect: '/api/auth/google/failure' }), googleAuthController.googleCallback);
// Add a POST endpoint for handling the token from the frontend
app.post('/api/auth/google/callback', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        try {
            // Verify the token with Google OAuth2
            const client = new google_auth_library_1.OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.VITE_GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            if (!payload) {
                return res.status(401).json({ error: 'Invalid Google token' });
            }
            // Find or create the user based on the Google ID
            let user = await User_1.default.findOne({ googleId: payload.sub });
            if (!user) {
                // If not found by Google ID, check if a user exists with the same email
                const existingUserByEmail = await User_1.default.findOne({ email: payload.email });
                if (existingUserByEmail) {
                    // Update existing user with Google details
                    user = existingUserByEmail;
                    // Add Google authentication to the existing user
                    if (payload.email && payload.name && payload.picture && payload.sub) {
                        user.googleId = payload.sub;
                        user.email = payload.email;
                        user.name = payload.name;
                        user.profilePicture = payload.picture;
                        user.authProvider = User_1.AuthProvider.GOOGLE;
                    }
                    // Ensure authProvider is updated if needed
                    if (!user.authProvider) {
                        user.authProvider = User_1.AuthProvider.GOOGLE;
                    }
                    await user.save();
                }
                else {
                    // Create new user if not found
                    if (payload.email && payload.name) {
                        const newUser = {
                            name: payload.name,
                            email: payload.email,
                            authProvider: User_1.AuthProvider.GOOGLE,
                            googleId: payload.sub || '',
                            profilePicture: payload.picture || '',
                            role: 'customer', // Default role for new users
                            emailVerified: payload.email_verified
                        };
                        user = new User_1.default(newUser);
                        await user.save();
                    }
                    else {
                        return res.status(400).json({ error: 'Incomplete user data from Google' });
                    }
                }
            }
            else {
                // Update existing user's Google data
                if (payload.email && payload.name && payload.picture && user.googleId) {
                    user.email = payload.email;
                    user.name = payload.name;
                    user.profilePicture = payload.picture;
                    user.authProvider = User_1.AuthProvider.GOOGLE;
                }
                // Ensure authProvider is set correctly
                if (!user.authProvider) {
                    user.authProvider = User_1.AuthProvider.GOOGLE;
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
        }
        catch (verificationError) {
            console.error('Google token verification error:', verificationError);
            return res.status(401).json({
                error: 'Failed to verify Google token',
                details: verificationError instanceof Error ? verificationError.message : String(verificationError)
            });
        }
    }
    catch (error) {
        console.error('Error processing Google authentication:');
        console.error('Error message:', error instanceof Error ? error.message : error);
        console.error('Error stack:', error instanceof Error ? error.stack : error);
        // Check for specific error types
        if (error instanceof Error && error.name === 'ValidationError') {
            const validationError = error;
            console.error('MongoDB validation error:', validationError.errors);
            return res.status(400).json({
                error: 'User validation failed',
                details: Object.keys(validationError.errors).map((field) => ({
                    field,
                    message: validationError.errors[field].message
                }))
            });
        }
        if (error instanceof Error && error.name === 'MongoServerError' && error.code === 11000) {
            const mongoError = error;
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
app.post('/api/auth/google/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Google token is required' });
        }
        // Verify the Google token
        const client = new google_auth_library_1.OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.VITE_GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, message: 'Invalid Google token' });
        }
        // Find or create user
        let user = await User_1.default.findOne({ email: payload.email });
        if (!user) {
            // Only create a new user if we have the required data
            if (payload.name && payload.email && payload.sub) {
                const newUserData = {
                    name: payload.name,
                    email: payload.email,
                    role: 'user',
                    googleId: payload.sub,
                    profilePicture: payload.picture || '',
                    authProvider: User_1.AuthProvider.GOOGLE
                };
                user = new User_1.default(newUserData);
                await user.save();
            }
            else {
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
    }
    catch (error) {
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
        const authReq = req;
        if (!authReq.user?.userId) {
            return res.status(401).json({ message: 'User ID not found in request' });
        }
        const user = await User_1.default.findById(authReq.user.userId);
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
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Server error while fetching profile' });
    }
});
// For workout routes, use a simple approach to register them
// We'll handle this more gracefully in the future
app.use('/api/workouts', (req, res, next) => {
    // Forward requests to the workout routes
    // This is a temporary solution until we properly fix the module system
    Promise.resolve().then(() => __importStar(require('./api/routes/workoutRoutes'))).then(module => {
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
// Error handling middleware for API routes
// 404 Handler - For API routes that don't exist
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        status: 404
    });
});
// Serve static files for client-side routes in production
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React build directory
    const clientBuildPath = path_1.default.join(__dirname, '../dist');
    app.use(express_1.default.static(clientBuildPath));
    // For any other request, send the React app's index.html
    // This allows client-side routing to work
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(clientBuildPath, 'index.html'));
    });
}
else {
    // In development, provide a simple fallback for non-API routes
    app.use('*', (req, res) => {
        if (!req.originalUrl.startsWith('/api')) {
            res.status(404).send(`
        <html>
          <head>
            <title>API Server - Development Mode</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; }
              h1 { color: #333; }
              pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow: auto; }
              .note { background: #fffde7; border-left: 4px solid #ffd600; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>API Server - Development Mode</h1>
            <div class="note">
              <p><strong>Note:</strong> This is the API server running in development mode. 
              It doesn't serve the frontend application.</p>
              <p>To access the frontend, please use the Vite development server at: 
              <a href="http://localhost:5173">http://localhost:5173</a></p>
            </div>
            <p>Request to non-existent route: <code>${req.method} ${req.originalUrl}</code></p>
            <p>Available API endpoints:</p>
            <pre>
GET  /api/healthcheck
GET  /api/auth/google
GET  /api/auth/google/callback
POST /api/auth/google/callback
POST /api/auth/google/verify
GET  /api/auth/google/success
GET  /api/auth/google/failure
GET  /api/users/profile
GET  /api/workouts
POST /api/workouts
GET  /api/workouts/:id
PUT  /api/workouts/:id
DELETE /api/workouts/:id
            </pre>
          </body>
        </html>
      `);
        }
        else {
            res.status(404).json({
                error: 'Not Found',
                message: `Cannot ${req.method} ${req.originalUrl}`,
                status: 404
            });
        }
    });
}
// General error handler - Must be the last middleware
app.use((err, _req, res, next) => {
    console.error('Server error:', err);
    // Determine if we've already started sending a response
    if (res.headersSent) {
        return next(err);
    }
    // Send a JSON error response
    res.status(500).json({
        error: 'Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message,
        status: 500
    });
});
//# sourceMappingURL=server.js.map
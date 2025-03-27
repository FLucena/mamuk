"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
// Define constants from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:5173';
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || '';
// Create a Google OAuth client
const googleClient = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
// Generate JWT token
const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role || 'user'
    };
    // Use type casting with a proper type instead of any
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};
exports.googleAuthController = {
    // Handle Google OAuth callback
    googleCallback: (_req, res) => {
        res.redirect('/api/auth/google/success');
    },
    // Verify Google token from client-side authentication
    verifyGoogleToken: async (req, res) => {
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
        }
        catch (error) {
            console.error('Google token verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to verify Google token'
            });
        }
    },
    // Handle successful authentication
    googleSuccess: (req, res) => {
        if (!req.user) {
            return res.redirect('/api/auth/google/failure');
        }
        try {
            // Cast req.user to UserData
            const userData = req.user;
            // Generate token
            const token = generateToken(userData);
            // Redirect to frontend with token
            res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}`);
        }
        catch (error) {
            console.error('Google auth success error:', error);
            res.redirect('/api/auth/google/failure');
        }
    },
    // Handle authentication failure
    googleFailure: (_req, res) => {
        res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }
};
exports.default = exports.googleAuthController;
//# sourceMappingURL=googleAuthController.js.map
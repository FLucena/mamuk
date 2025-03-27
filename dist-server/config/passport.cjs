"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = __importDefault(require("../models/User.cjs"));
// Configure passport with Google OAuth strategy
const configurePassport = () => {
    // Get the server URL based on environment
    const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
    // Configure Google OAuth Strategy
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.VITE_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: `${SERVER_URL}/api/auth/google/callback`,
        scope: ['profile', 'email'],
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            // Format profile data to match our GoogleProfile interface
            const googleProfile = {
                id: profile.id,
                displayName: profile.displayName,
                emails: profile.emails || [],
                photos: profile.photos
            };
            // Find or create user
            const user = await User_1.default.findOrCreateGoogleUser(googleProfile);
            // Use a typed version of done to satisfy TypeScript
            done(null, user);
            return;
        }
        catch (error) {
            done(error, undefined);
            return;
        }
    }));
    // Configure serialization/deserialization
    passport_1.default.serializeUser((user, done) => {
        if (user && typeof user === 'object' && '_id' in user) {
            // Extract the ID as a string to avoid type issues
            const userId = String(user._id);
            done(null, userId);
        }
        else {
            done(new Error('User object is missing _id'), null);
        }
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await User_1.default.findById(id);
            // Use a typed version of done to satisfy TypeScript
            done(null, user);
        }
        catch (error) {
            done(error, undefined);
        }
    });
    return passport_1.default;
};
exports.default = configurePassport;
//# sourceMappingURL=passport.js.map
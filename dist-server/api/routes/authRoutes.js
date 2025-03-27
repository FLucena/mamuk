"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRouter = void 0;
const express = __importStar(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const googleAuthController_1 = require("../controllers/googleAuthController");
const middleware_helpers_1 = require("../middleware/middleware-helpers");
// Export a function that creates and returns the router with the provided passport instance
const createAuthRouter = (passport) => {
    const router = express.Router();
    // Public routes
    router.post('/register', authController_1.registerUser);
    router.post('/login', authController_1.loginUser);
    // Google Authentication routes
    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleAuthController_1.googleAuthController.googleCallback);
    router.post('/google/verify', googleAuthController_1.googleAuthController.verifyGoogleToken);
    router.get('/google/success', googleAuthController_1.googleAuthController.googleSuccess);
    router.get('/google/failure', googleAuthController_1.googleAuthController.googleFailure);
    // Protected routes - require authentication
    router.get('/profile', (0, middleware_helpers_1.asHandler)(auth_1.authenticate), (0, middleware_helpers_1.withAuth)(authController_1.getCurrentUser));
    router.put('/profile', (0, middleware_helpers_1.asHandler)(auth_1.authenticate), (0, middleware_helpers_1.withAuth)(authController_1.updateUserProfile));
    return router;
};
exports.createAuthRouter = createAuthRouter;
// For backward compatibility
exports.default = exports.createAuthRouter;
//# sourceMappingURL=authRoutes.js.map
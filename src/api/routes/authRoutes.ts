import * as express from 'express';
import type { PassportStatic } from 'passport';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { googleAuthController } from '../controllers/googleAuthController';
import { withAuth, asHandler } from '../middleware/middleware-helpers';

// Export a function that creates and returns the router with the provided passport instance
export const createAuthRouter = (passport: PassportStatic) => {
  const router = express.Router();

  // Public routes
  router.post('/register', registerUser);
  router.post('/login', loginUser);

  // Google Authentication routes
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    googleAuthController.googleCallback
  );
  router.post('/google/verify', googleAuthController.verifyGoogleToken);
  router.get('/google/success', googleAuthController.googleSuccess);
  router.get('/google/failure', googleAuthController.googleFailure);

  // Protected routes - require authentication
  router.get('/profile', asHandler(authenticate), withAuth(getCurrentUser));
  router.put('/profile', asHandler(authenticate), withAuth(updateUserProfile));

  return router;
};

// For backward compatibility
export default createAuthRouter; 
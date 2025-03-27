import * as express from 'express';
import mongoose from 'mongoose';
import { createAuthRouter } from './authRoutes';
import workoutSessionRoutes from './workoutSessionRoutes';
import { User } from '../../models';
import type { PassportStatic } from 'passport';

// Export a function that creates and returns the router with the provided passport instance
export const createApiRouter = (passport: PassportStatic) => {
  const router = express.Router();

  // Mount routes
  router.use('/auth', createAuthRouter(passport));
  router.use('/workout-sessions', workoutSessionRoutes);

  // API info route
  router.get('/', (req: express.Request, res: express.Response) => {
    res.json({
      message: 'Welcome to Mamuk Fitness API',
      version: '1.0.0'
    });
  });

  // Database test route
  router.get('/db-test', async (req: express.Request, res: express.Response) => {
    try {
      // Check connection status
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      
      // Count users for a simple database operation test
      const userCount = await User.countDocuments();
      
      res.json({
        status: 'success',
        dbConnection: dbStatus,
        mongoDbVersion: mongoose.version,
        userCount: userCount,
        message: 'MongoDB connection test successful'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'MongoDB connection test failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  return router;
};

// For backward compatibility
export default createApiRouter; 
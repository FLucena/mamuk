import * as express from 'express';
import {
  startWorkoutSession,
  updateWorkoutSession,
  completeWorkoutSession,
  getWorkoutSessions,
  getWorkoutSessionById,
  deleteWorkoutSession
} from '../controllers/workoutSessionController';
import { authenticate } from '../middleware/auth';
import { withAuth, asHandler } from '../middleware/middleware-helpers';

const router = express.Router();

// All routes require authentication - use the type-safe asHandler wrapper
router.use(asHandler(authenticate));

// Workout session routes - use withAuth wrapper for all handlers
router.route('/')
  .get(withAuth(getWorkoutSessions));

router.route('/start')
  .post(withAuth(startWorkoutSession));

router.route('/:id')
  .get(withAuth(getWorkoutSessionById))
  .put(withAuth(updateWorkoutSession))
  .delete(withAuth(deleteWorkoutSession));

router.route('/:id/complete')
  .put(withAuth(completeWorkoutSession));

export default router; 
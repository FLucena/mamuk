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

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Workout session routes
router.route('/')
  .get(getWorkoutSessions);

router.route('/start')
  .post(startWorkoutSession);

router.route('/:id')
  .get(getWorkoutSessionById)
  .put(updateWorkoutSession)
  .delete(deleteWorkoutSession);

router.route('/:id/complete')
  .put(completeWorkoutSession);

export default router; 
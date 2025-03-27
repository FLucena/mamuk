import express from 'express';
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  toggleWorkoutCompletion
} from '../controllers/workoutController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../../models/User';
import { withAuth, asHandler } from '../middleware/middleware-helpers';

const router = express.Router();

// All routes require authentication - use our type-safe wrapper
router.use(asHandler(authenticate));

// Workout routes - wrap all handlers with withAuth
router.route('/')
  .get(withAuth(getWorkouts))
  .post(withAuth(createWorkout));

router.route('/:id')
  .get(withAuth(getWorkoutById))
  .put(withAuth(updateWorkout))
  .delete(withAuth(deleteWorkout));

// Toggle workout completion status
router.put('/:id/toggle-completion', withAuth(toggleWorkoutCompletion));

export default router; 
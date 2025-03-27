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

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Workout routes
router.route('/')
  .get(getWorkouts)
  .post(createWorkout);

router.route('/:id')
  .get(getWorkoutById)
  .put(updateWorkout)
  .delete(deleteWorkout);

// Toggle workout completion status
router.put('/:id/toggle-completion', toggleWorkoutCompletion);

export default router; 
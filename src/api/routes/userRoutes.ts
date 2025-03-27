import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../../models/User';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes - require authentication
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

// Admin only routes
router.get('/', authenticate, authorize(UserRole.ADMIN), getUsers);
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), getUserById);
router.put('/:id/role', authenticate, authorize(UserRole.ADMIN), updateUserRole);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteUser);

export default router; 
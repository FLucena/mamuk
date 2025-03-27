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
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.get('/profile', authenticate, getUserProfile);
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.put('/profile', authenticate, updateUserProfile);

// Admin only routes
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.get('/', authenticate, authorize(UserRole.ADMIN), getUsers);
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), getUserById);
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.put('/:id/role', authenticate, authorize(UserRole.ADMIN), updateUserRole);
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteUser);

export default router; 
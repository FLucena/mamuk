import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../../models/User';
import { UserRole } from '../../models/User';
import { AuthRequest } from '../../types/express';

// Environment variable for JWT secret (would be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 */
const generateToken = (user: { _id: string; email: string; role?: string }): string => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

/**
 * Register a new user
 * POST /api/users/register
 * Public
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user - by default, all new users are customers
    const user = await User.create({
      name,
      email,
      password,
      role: UserRole.CUSTOMER
    });

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Log in a user
 * POST /api/users/login
 * Public
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if required fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email - need to explicitly select password as it's not returned by default
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Get current user profile
 * GET /api/users/profile
 * Private
 */
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      bio: user.bio,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      fitnessGoals: user.fitnessGoals,
      healthConditions: user.healthConditions,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 * Private
 */
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fields that can be updated
    const {
      name,
      profilePicture,
      bio,
      dateOfBirth,
      gender,
      height,
      weight,
      fitnessGoals,
      healthConditions
    } = req.body;

    // Update fields if provided
    if (name) user.name = name;
    if (profilePicture) user.profilePicture = profilePicture;
    if (bio) user.bio = bio;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    if (fitnessGoals) user.fitnessGoals = fitnessGoals;
    if (healthConditions) user.healthConditions = healthConditions;

    // Save updated user
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      bio: user.bio,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      fitnessGoals: user.fitnessGoals,
      healthConditions: user.healthConditions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

/**
 * Get all users (admin only)
 * GET /api/users
 * Private/Admin
 */
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

/**
 * Get user by ID (admin and coaches only)
 * GET /api/users/:id
 * Private/Admin/Coach
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

/**
 * Update user role (admin only)
 * PUT /api/users/:id/role
 * Private/Admin
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    if (!role || !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
};

/**
 * Delete user (admin only)
 * DELETE /api/users/:id
 * Private/Admin
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
}; 
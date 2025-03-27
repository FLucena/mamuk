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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getUserById = exports.getUsers = exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../models/User.cjs"));
const User_2 = require("../../models/User.cjs");
// Environment variable for JWT secret (would be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
    return jwt.sign({
        userId: user._id,
        email: user.email,
        role: user.role || 'user'
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
/**
 * Register a new user
 * POST /api/users/register
 * Public
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if required fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        // Create new user - by default, all new users are customers
        const user = await User_1.default.create({
            name,
            email,
            password,
            role: User_2.UserRole.CUSTOMER
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
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
exports.registerUser = registerUser;
/**
 * Log in a user
 * POST /api/users/login
 * Public
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if required fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        // Find user by email - need to explicitly select password as it's not returned by default
        const user = await User_1.default.findOne({ email }).select('+password');
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
exports.loginUser = loginUser;
/**
 * Get current user profile
 * GET /api/users/profile
 * Private
 */
const getUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await User_1.default.findById(req.user.userId);
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
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
};
exports.getUserProfile = getUserProfile;
/**
 * Update user profile
 * PUT /api/users/profile
 * Private
 */
const updateUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Fields that can be updated
        const { name, profilePicture, bio, dateOfBirth, gender, height, weight, fitnessGoals, healthConditions } = req.body;
        // Update fields if provided
        if (name)
            user.name = name;
        if (profilePicture)
            user.profilePicture = profilePicture;
        if (bio)
            user.bio = bio;
        if (dateOfBirth)
            user.dateOfBirth = dateOfBirth;
        if (gender)
            user.gender = gender;
        if (height)
            user.height = height;
        if (weight)
            user.weight = weight;
        if (fitnessGoals)
            user.fitnessGoals = fitnessGoals;
        if (healthConditions)
            user.healthConditions = healthConditions;
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
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};
exports.updateUserProfile = updateUserProfile;
/**
 * Get all users (admin only)
 * GET /api/users
 * Private/Admin
 */
const getUsers = async (_req, res) => {
    try {
        const users = await User_1.default.find({});
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};
exports.getUsers = getUsers;
/**
 * Get user by ID (admin and coaches only)
 * GET /api/users/:id
 * Private/Admin/Coach
 */
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching user' });
    }
};
exports.getUserById = getUserById;
/**
 * Update user role (admin only)
 * PUT /api/users/:id/role
 * Private/Admin
 */
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role || !Object.values(User_2.UserRole).includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }
        const user = await User_1.default.findById(req.params.id);
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
    }
    catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Server error while updating user role' });
    }
};
exports.updateUserRole = updateUserRole;
/**
 * Delete user (admin only)
 * DELETE /api/users/:id
 * Private/Admin
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne();
        res.status(200).json({ message: 'User removed' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map
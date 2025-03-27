const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Workout = require('../../models/Workout');

// JWT Secret from environment or default
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

// Authentication middleware
const authenticate = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('No token provided for workout route:', req.originalUrl);
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified for workout route, user:', decoded.id);
    
    // Add user info to request
    req.user = {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role || 'customer'
    };
    
    next();
  } catch (error) {
    console.error('Token verification failed for workout route:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Apply authentication to all routes
router.use(authenticate);

// Get all workouts with filters
router.get('/', async (req, res) => {
  try {
    console.log('Get workouts request from user:', req.user);
    
    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const completed = req.query.completed !== undefined 
      ? req.query.completed === 'true' 
      : undefined;
    
    const isTemplate = req.query.isTemplate !== undefined 
      ? req.query.isTemplate === 'true' 
      : undefined;
    
    // Build filter object
    const filter = { createdBy: req.user.userId };
    
    if (completed !== undefined) {
      filter.completed = completed;
    }
    
    if (isTemplate !== undefined) {
      filter.isTemplate = isTemplate;
    }
    
    // Execute query
    const workouts = await Workout.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Workout.countDocuments(filter);
    
    // Calculate total pages
    const pages = Math.ceil(total / limit);
    
    res.status(200).json({
      workouts,
      page,
      pages,
      total
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Server error while fetching workouts' });
  }
});

// Get single workout
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if user is authorized to view this workout
    if (workout.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this workout' });
    }
    
    res.status(200).json(workout);
  } catch (error) {
    console.error('Error fetching workout by ID:', error);
    res.status(500).json({ message: 'Server error while fetching workout' });
  }
});

// Create workout
router.post('/', async (req, res) => {
  try {
    console.log('Create workout request from user:', req.user);
    console.log('Workout data received:', JSON.stringify(req.body, null, 2));
    
    // Check if days are provided
    if (!req.body.days || !Array.isArray(req.body.days) || req.body.days.length === 0) {
      return res.status(400).json({ message: 'A workout must include at least one day' });
    }
    
    // Create the workout
    const workout = new Workout({
      ...req.body,
      createdBy: req.user.userId
    });
    
    const savedWorkout = await workout.save();
    console.log('Workout created successfully:', savedWorkout._id);
    
    res.status(201).json(savedWorkout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ 
      message: 'Server error while creating workout',
      error: error.message
    });
  }
});

// Update workout
router.put('/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if user is authorized to update this workout
    if (workout.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this workout' });
    }
    
    // Update fields
    const updateData = req.body;
    
    // Filter out fields that shouldn't be updated
    if (updateData.createdBy) delete updateData.createdBy;
    if (updateData._id) delete updateData._id;
    
    // Update the document
    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    res.status(200).json(updatedWorkout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ message: 'Server error while updating workout' });
  }
});

// Delete workout
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if user is authorized to delete this workout
    if (workout.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this workout' });
    }
    
    await Workout.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Workout deleted' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Server error while deleting workout' });
  }
});

// Toggle workout completion
router.put('/:id/toggle-completion', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if user is authorized to update this workout
    if (workout.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this workout' });
    }
    
    // Toggle completion status
    workout.completed = !workout.completed;
    
    await workout.save();
    
    res.status(200).json({
      _id: workout._id,
      completed: workout.completed
    });
  } catch (error) {
    console.error('Error toggling workout completion:', error);
    res.status(500).json({ message: 'Server error while toggling workout completion' });
  }
});

module.exports = router; 
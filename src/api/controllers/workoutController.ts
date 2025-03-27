import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Workout, { IWorkout } from '../../models/Workout';

/**
 * Get all workouts with pagination and filters
 * GET /api/workouts
 * Private
 */
export const getWorkouts = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Get workouts request from user:', req.user);
    
    if (!req.user) {
      console.error('No user found in request when fetching workouts');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log('User role for getWorkouts:', req.user.role);
    console.log('User ID for getWorkouts:', req.user.userId);

    // Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const completed = req.query.completed !== undefined 
      ? req.query.completed === 'true' 
      : undefined;
    
    const isTemplate = req.query.isTemplate !== undefined 
      ? req.query.isTemplate === 'true' 
      : undefined;
    
    // Build filter object
    interface WorkoutFilter {
      createdBy: string;
      completed?: boolean;
      isTemplate?: boolean;
    }
    
    const filter: WorkoutFilter = { createdBy: req.user.userId };
    
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
};

/**
 * Get a single workout by ID
 * GET /api/workouts/:id
 * Private
 */
export const getWorkoutById = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Get workout by ID request from user:', req.user);
    
    if (!req.user) {
      console.error('No user found in request when fetching workout by ID');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log('User role for getWorkoutById:', req.user.role);
    console.log('User ID for getWorkoutById:', req.user.userId);
    
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if the user is authorized to view this workout
    if (workout.createdBy.toString() !== req.user.userId && 
        !workout.assignedTo.includes(new mongoose.Types.ObjectId(req.user.userId)) &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this workout' });
    }
    
    res.status(200).json(workout);
  } catch (error) {
    console.error('Error fetching workout by ID:', error);
    res.status(500).json({ message: 'Server error while fetching workout' });
  }
};

/**
 * Create a new workout
 * POST /api/workouts
 * Private
 */
export const createWorkout = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Create workout request from user:', req.user);
    
    if (!req.user) {
      console.error('No user found in request when creating workout');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log('User role for createWorkout:', req.user.role);
    console.log('User ID for createWorkout:', req.user.userId);
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update a workout
 * PUT /api/workouts/:id
 * Private
 */
export const updateWorkout = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Update workout request from user:', req.user);
    
    if (!req.user) {
      console.error('No user found in request when updating workout');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log('User role for updateWorkout:', req.user.role);
    console.log('User ID for updateWorkout:', req.user.userId);
    
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
    
    // Update the document with filtered data
    Object.assign(workout, updateData);
    
    const updatedWorkout = await workout.save();
    console.log('Workout updated successfully:', updatedWorkout._id);
    
    res.status(200).json(updatedWorkout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ message: 'Server error while updating workout' });
  }
};

/**
 * Delete a workout
 * DELETE /api/workouts/:id
 * Private
 */
export const deleteWorkout = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Delete workout request from user:', req.user);
    
    if (!req.user) {
      console.error('No user found in request when deleting workout');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log('User role for deleteWorkout:', req.user.role);
    console.log('User ID for deleteWorkout:', req.user.userId);
    
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if user is authorized to delete this workout
    if (workout.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this workout' });
    }
    
    await Workout.deleteOne({ _id: req.params.id });
    console.log('Workout deleted successfully:', req.params.id);
    
    res.status(200).json({ message: 'Workout deleted' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Server error while deleting workout' });
  }
};

/**
 * Toggle workout completion status
 * PUT /api/workouts/:id/toggle-completion
 * Private
 */
export const toggleWorkoutCompletion = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Toggle workout completion request from user:', req.user);
    
    if (!req.user) {
      console.error('No user found in request when toggling workout completion');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log('User role for toggleWorkoutCompletion:', req.user.role);
    console.log('User ID for toggleWorkoutCompletion:', req.user.userId);
    
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if user is authorized to update this workout
    if (workout.createdBy.toString() !== req.user.userId && 
        !workout.assignedTo.includes(new mongoose.Types.ObjectId(req.user.userId)) &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this workout' });
    }
    
    // Toggle completion status
    workout.completed = !workout.completed;
    
    const updatedWorkout = await workout.save();
    console.log('Workout completion toggled successfully:', updatedWorkout._id, 
                'New completion status:', updatedWorkout.completed);
    
    res.status(200).json({
      _id: updatedWorkout._id,
      completed: updatedWorkout.completed
    });
  } catch (error) {
    console.error('Error toggling workout completion:', error);
    res.status(500).json({ message: 'Server error while toggling workout completion' });
  }
}; 
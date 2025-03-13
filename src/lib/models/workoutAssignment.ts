import mongoose from 'mongoose';

const WorkoutAssignmentSchema = new mongoose.Schema({
  workoutId: { type: mongoose.Schema.Types.ObjectId, required: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  assignedAt: { type: Date, default: Date.now },
  completedAt: Date,
  status: { type: String, enum: ['pending', 'completed', 'in_progress'], default: 'pending' }
});

export const WorkoutAssignment = mongoose.model('WorkoutAssignment', WorkoutAssignmentSchema); 
import mongoose from 'mongoose';

const exerciseProgressSchema = new mongoose.Schema({
  exerciseId: {
    type: String,
    required: true,
  },
  sets: [{
    reps: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  }],
});

const blockProgressSchema = new mongoose.Schema({
  blockId: {
    type: String,
    required: true,
  },
  exercises: [exerciseProgressSchema],
});

const dayProgressSchema = new mongoose.Schema({
  dayId: {
    type: String,
    required: true,
  },
  blocks: [blockProgressSchema],
  completed: {
    type: Boolean,
    default: false,
  },
  notes: String,
});

const progressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  workoutId: {
    type: String,
    required: true,
  },
  weekNumber: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  days: [dayProgressSchema],
}, {
  timestamps: true,
});

// Create a compound index for unique progress entries per user, workout, and week
progressSchema.index({ userId: 1, workoutId: 1, weekNumber: 1, year: 1 }, { unique: true });

export const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema); 
const mongoose = require('mongoose');

const ExerciseInstanceSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  },
  name: {
    type: String,
    required: [true, 'Exercise name is required']
  },
  sets: {
    type: Number,
    required: [true, 'Number of sets is required'],
    min: [1, 'Number of sets must be at least 1']
  },
  reps: {
    type: Number,
    required: [true, 'Number of reps is required'],
    min: [1, 'Number of reps must be at least 1']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative']
  },
  notes: {
    type: String
  }
});

const WorkoutBlockSchema = new mongoose.Schema({
  id: {
    type: String
  },
  name: {
    type: String,
    required: [true, 'Block name is required']
  },
  exercises: {
    type: [ExerciseInstanceSchema],
    default: []
  }
});

const WorkoutDaySchema = new mongoose.Schema({
  id: {
    type: String
  },
  name: {
    type: String,
    required: [true, 'Day name is required']
  },
  blocks: {
    type: [WorkoutBlockSchema],
    default: []
  },
  day: {
    type: Number,
    required: [true, 'Day number is required'],
    min: [1, 'Day number must be at least 1']
  }
});

const WorkoutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a workout title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify the creator of the workout']
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  days: {
    type: [WorkoutDaySchema],
    default: []
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  frequency: {
    type: String
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  category: {
    type: String
  },
  goals: [{
    type: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster lookups
WorkoutSchema.index({ createdBy: 1 });
WorkoutSchema.index({ isTemplate: 1 });
WorkoutSchema.index({ completed: 1 });

module.exports = mongoose.model('Workout', WorkoutSchema); 
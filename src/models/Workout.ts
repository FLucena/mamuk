import mongoose from 'mongoose';

export interface IExerciseInstance {
  exercise: mongoose.Types.ObjectId; // Reference to Exercise model
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // in seconds, for timed exercises
  notes?: string;
}

export interface IWorkoutBlock {
  name: string;
  exercises: IExerciseInstance[];
}

export interface IWorkoutDay {
  name: string;
  blocks: IWorkoutBlock[];
  day: number; // 1-based index for ordering
}

export interface IWorkout extends mongoose.Document {
  title: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId; // Coach or user who created the workout
  assignedTo: mongoose.Types.ObjectId[]; // Users to whom this workout is assigned
  days: IWorkoutDay[];
  startDate?: Date;
  endDate?: Date;
  frequency?: string; // e.g., 'daily', '3x per week', etc.
  isTemplate: boolean; // Whether this is a template that can be reused
  completed: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string; // e.g., 'strength', 'cardio', 'hybrid', etc.
  goals?: string[]; // e.g., 'weight loss', 'muscle gain', 'endurance', etc.
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseInstanceSchema = new mongoose.Schema<IExerciseInstance>({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: [true, 'Exercise reference is required']
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

const WorkoutBlockSchema = new mongoose.Schema<IWorkoutBlock>({
  name: {
    type: String,
    required: [true, 'Block name is required']
  },
  exercises: {
    type: [ExerciseInstanceSchema],
    default: []
  }
});

const WorkoutDaySchema = new mongoose.Schema<IWorkoutDay>({
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

const WorkoutSchema = new mongoose.Schema<IWorkout>(
  {
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
  },
  {
    timestamps: true
  }
);

// Indexes for faster lookups
WorkoutSchema.index({ createdBy: 1 });
WorkoutSchema.index({ assignedTo: 1 });
WorkoutSchema.index({ isTemplate: 1 });
WorkoutSchema.index({ completed: 1 });

export default mongoose.model<IWorkout>('Workout', WorkoutSchema); 
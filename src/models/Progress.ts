import mongoose from 'mongoose';

// Tracking workout session completions
export interface IWorkoutSession extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  workout: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  completedExercises: {
    exercise: mongoose.Types.ObjectId;
    sets: {
      reps: number;
      weight?: number;
      duration?: number; // in seconds
      completed: boolean;
      notes?: string;
    }[];
    completed: boolean;
  }[];
  moodBefore?: 'poor' | 'average' | 'good' | 'great';
  moodAfter?: 'poor' | 'average' | 'good' | 'great';
  energyLevel?: 'low' | 'medium' | 'high';
  notes?: string;
  rating?: number; // 1-5 rating of workout difficulty/enjoyment
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutSessionSchema = new mongoose.Schema<IWorkoutSession>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: [true, 'Workout reference is required']
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      default: Date.now
    },
    endTime: {
      type: Date
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedExercises: [
      {
        exercise: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Exercise',
          required: [true, 'Exercise reference is required']
        },
        sets: [
          {
            reps: {
              type: Number,
              required: [true, 'Number of reps is required'],
              min: [0, 'Reps cannot be negative']
            },
            weight: {
              type: Number,
              min: [0, 'Weight cannot be negative']
            },
            duration: {
              type: Number,
              min: [0, 'Duration cannot be negative']
            },
            completed: {
              type: Boolean,
              default: true
            },
            notes: {
              type: String
            }
          }
        ],
        completed: {
          type: Boolean,
          default: false
        }
      }
    ],
    moodBefore: {
      type: String,
      enum: ['poor', 'average', 'good', 'great']
    },
    moodAfter: {
      type: String,
      enum: ['poor', 'average', 'good', 'great']
    },
    energyLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    notes: {
      type: String
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    }
  },
  {
    timestamps: true
  }
);

// Tracking body measurements
export interface IBodyMeasurement extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  weight?: number; // in kg
  height?: number; // in cm
  bodyFatPercentage?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    thighs?: number;
    arms?: number;
    shoulders?: number;
    calves?: number;
    neck?: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BodyMeasurementSchema = new mongoose.Schema<IBodyMeasurement>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    date: {
      type: Date,
      required: [true, 'Measurement date is required'],
      default: Date.now
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    },
    bodyFatPercentage: {
      type: Number,
      min: [0, 'Body fat percentage cannot be negative'],
      max: [100, 'Body fat percentage cannot exceed 100%']
    },
    measurements: {
      chest: {
        type: Number,
        min: [0, 'Chest measurement cannot be negative']
      },
      waist: {
        type: Number,
        min: [0, 'Waist measurement cannot be negative']
      },
      hips: {
        type: Number,
        min: [0, 'Hips measurement cannot be negative']
      },
      thighs: {
        type: Number,
        min: [0, 'Thighs measurement cannot be negative']
      },
      arms: {
        type: Number,
        min: [0, 'Arms measurement cannot be negative']
      },
      shoulders: {
        type: Number,
        min: [0, 'Shoulders measurement cannot be negative']
      },
      calves: {
        type: Number,
        min: [0, 'Calves measurement cannot be negative']
      },
      neck: {
        type: Number,
        min: [0, 'Neck measurement cannot be negative']
      }
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster lookups
WorkoutSessionSchema.index({ user: 1, createdAt: -1 });
WorkoutSessionSchema.index({ workout: 1 });
WorkoutSessionSchema.index({ completed: 1 });

BodyMeasurementSchema.index({ user: 1, date: -1 });

export const WorkoutSession = mongoose.model<IWorkoutSession>('WorkoutSession', WorkoutSessionSchema);
export const BodyMeasurement = mongoose.model<IBodyMeasurement>('BodyMeasurement', BodyMeasurementSchema); 
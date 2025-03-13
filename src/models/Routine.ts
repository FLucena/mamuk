import mongoose, { Schema, Document, Model } from 'mongoose';
import { Exercise } from './Exercise';

export interface RoutineExercise {
  exercise: string | Exercise; // Reference to Exercise model or Exercise object
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
  restTime?: number; // Rest time in seconds
}

export interface Routine extends Document {
  name: string;
  description?: string;
  customerId: string; // Reference to the customer who owns this routine
  coachId?: string; // Reference to the coach who created this routine (if any)
  exercises: RoutineExercise[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

const RoutineSchema = new Schema<Routine>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the routine'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    customerId: {
      type: String,
      required: [true, 'Please provide a customer ID'],
      index: true,
    },
    coachId: {
      type: String,
      index: true,
    },
    exercises: [
      {
        exercise: {
          type: Schema.Types.ObjectId,
          ref: 'Exercise',
          required: [true, 'Please provide an exercise'],
        },
        sets: {
          type: Number,
          required: [true, 'Please provide the number of sets'],
          min: [1, 'Sets must be at least 1'],
        },
        reps: {
          type: Number,
          required: [true, 'Please provide the number of reps'],
          min: [1, 'Reps must be at least 1'],
        },
        weight: {
          type: Number,
          default: 0,
        },
        notes: {
          type: String,
          maxlength: [200, 'Notes cannot be more than 200 characters'],
        },
        restTime: {
          type: Number,
          default: 60, // Default rest time: 60 seconds
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to check if a customer has reached the routine limit
RoutineSchema.statics.hasReachedLimit = async function(
  customerId: string,
  userRoles: string[]
): Promise<boolean> {
  // Admins and coaches can create unlimited routines
  if (userRoles.includes('admin') || userRoles.includes('coach')) {
    return false;
  }
  
  // Regular customers are limited to 3 active routines
  const count = await this.countDocuments({
    customerId,
    isArchived: false,
  });
  
  return count >= 3;
};

// Middleware to prevent creating more than 3 routines per customer
RoutineSchema.pre('save', async function(next) {
  if (this.isNew) {
    const model = this.constructor as Model<Routine> & {
      hasReachedLimit: (customerId: string, userRoles: string[]) => Promise<boolean>;
    };
    
    // Skip the check if the routine is created by a coach or admin
    if (this.coachId) {
      return next();
    }
    
    // Check if the customer has reached the limit
    const hasReachedLimit = await model.hasReachedLimit(this.customerId, ['customer']);
    if (hasReachedLimit) {
      const error = new Error('Customer has reached the limit of 3 routines');
      return next(error);
    }
  }
  
  next();
});

// Create or get the model
export const RoutineModel = mongoose.models.Routine || mongoose.model<Routine>('Routine', RoutineSchema); 
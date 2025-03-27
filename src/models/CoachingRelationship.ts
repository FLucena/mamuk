import mongoose from 'mongoose';

export type CoachingStatus = 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';

// For tracking coach-client relationships
export interface ICoachingRelationship extends mongoose.Document {
  coach: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  status: CoachingStatus;
  startDate: Date;
  endDate?: Date;
  package: {
    name: string;
    description?: string;
    duration?: number; // in days
    sessionsPerWeek?: number;
    price?: number;
  };
  goals: string[];
  currentWorkout?: mongoose.Types.ObjectId; // Current assigned workout
  workoutHistory: mongoose.Types.ObjectId[]; // All workouts assigned over time
  notes: {
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  feedback?: {
    fromCoach?: {
      content: string;
      rating?: number; // 1-5 rating
      date: Date;
    }[];
    fromClient?: {
      content: string;
      rating?: number; // 1-5 rating
      date: Date;
    }[];
  };
  paymentHistory?: {
    amount: number;
    date: Date;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    notes?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CoachingRelationshipSchema = new mongoose.Schema<ICoachingRelationship>(
  {
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Coach reference is required']
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client reference is required']
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'paused', 'completed', 'cancelled'],
      default: 'pending'
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date
    },
    package: {
      name: {
        type: String,
        required: [true, 'Package name is required']
      },
      description: {
        type: String
      },
      duration: {
        type: Number,
        min: [1, 'Duration must be at least 1 day']
      },
      sessionsPerWeek: {
        type: Number,
        min: [1, 'Sessions per week must be at least 1']
      },
      price: {
        type: Number,
        min: [0, 'Price cannot be negative']
      }
    },
    goals: [{
      type: String
    }],
    currentWorkout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout'
    },
    workoutHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout'
    }],
    notes: [{
      content: {
        type: String,
        required: [true, 'Note content is required']
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Note creator is required']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    feedback: {
      fromCoach: [{
        content: {
          type: String,
          required: [true, 'Feedback content is required']
        },
        rating: {
          type: Number,
          min: [1, 'Rating must be at least 1'],
          max: [5, 'Rating cannot be more than 5']
        },
        date: {
          type: Date,
          default: Date.now
        }
      }],
      fromClient: [{
        content: {
          type: String,
          required: [true, 'Feedback content is required']
        },
        rating: {
          type: Number,
          min: [1, 'Rating must be at least 1'],
          max: [5, 'Rating cannot be more than 5']
        },
        date: {
          type: Date,
          default: Date.now
        }
      }]
    },
    paymentHistory: [{
      amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0, 'Amount cannot be negative']
      },
      date: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      notes: {
        type: String
      }
    }]
  },
  {
    timestamps: true
  }
);

// Custom validation to ensure coach and client are different users
CoachingRelationshipSchema.pre('validate', function(next) {
  if (this.coach.toString() === this.client.toString()) {
    this.invalidate('client', 'Coach and client cannot be the same user');
  }
  next();
});

// Indexes for faster lookups
CoachingRelationshipSchema.index({ coach: 1, status: 1 });
CoachingRelationshipSchema.index({ client: 1, status: 1 });
CoachingRelationshipSchema.index({ startDate: -1 });
CoachingRelationshipSchema.index({ status: 1 });

export default mongoose.model<ICoachingRelationship>('CoachingRelationship', CoachingRelationshipSchema); 
import mongoose, { Schema, Document } from 'mongoose';

export interface Exercise extends Document {
  name: string;
  description?: string;
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<Exercise>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the exercise'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    muscleGroups: {
      type: [String],
      required: [true, 'Please provide at least one muscle group'],
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'Please provide at least one muscle group',
      },
    },
    difficulty: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: '{VALUE} is not a valid difficulty level',
      },
      required: [true, 'Please provide a difficulty level'],
    },
    equipment: {
      type: [String],
      default: [],
    },
    instructions: {
      type: [String],
      required: [true, 'Please provide instructions for the exercise'],
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'Please provide at least one instruction',
      },
    },
    videoUrl: {
      type: String,
      validate: {
        validator: function(v: string) {
          // Simple URL validation
          return !v || /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.*/.test(v);
        },
        message: 'Please provide a valid YouTube or Vimeo URL',
      },
    },
    imageUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
ExerciseSchema.index({ name: 1 });
ExerciseSchema.index({ muscleGroups: 1 });
ExerciseSchema.index({ difficulty: 1 });
ExerciseSchema.index({ isActive: 1 });

// Create or get the model
export const ExerciseModel = mongoose.models.Exercise || mongoose.model<Exercise>('Exercise', ExerciseSchema); 
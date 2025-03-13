import mongoose from 'mongoose';
import { bodyZones } from '@/lib/constants/bodyZones';

const exerciseSchema = new mongoose.Schema({
  id: String,
  name: String,
  sets: Number,
  reps: Number,
  weight: Number,
  videoUrl: String,
  notes: String,
  tags: {
    type: [String],
    enum: bodyZones,
    default: []
  }
}, { _id: false });

const blockSchema = new mongoose.Schema({
  id: String,
  name: String,
  exercises: [exerciseSchema],
}, { _id: false });

const daySchema = new mongoose.Schema({
  id: String,
  name: String,
  blocks: [blockSchema],
}, { _id: false });

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  days: [daySchema],
  status: {
    type: String,
    enum: ['active', 'archived', "completed"],
    default: 'active',
    required: true,
  },
  assignedCoaches: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
    validate: {
      validator: (ids: mongoose.Types.ObjectId[]) => ids.every(id => mongoose.isValidObjectId(id)),
      message: 'ID de coach inválido detectado'
    }
  },
  assignedCustomers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
    validate: {
      validator: (ids: mongoose.Types.ObjectId[]) => ids.every(id => mongoose.isValidObjectId(id)),
      message: 'ID de cliente inválido detectado'
    }
  },
  isCoachCreated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

// Add index for createdBy to optimize queries for customer workout limits
workoutSchema.index({ userId: 1, createdBy: 1, status: 1 });

const Workout = mongoose.models.Workout || mongoose.model('Workout', workoutSchema);

export { Workout }; 
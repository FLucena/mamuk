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
}, {
  timestamps: true,
});

const Rutina = mongoose.models.Rutina || mongoose.model('Rutina', workoutSchema);

export { Rutina }; 
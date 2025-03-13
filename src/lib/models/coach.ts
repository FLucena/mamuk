import mongoose from 'mongoose';

const coachSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialties: [{
    type: String
  }],
  bio: String,
  customers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const Coach = mongoose.models.Coach || mongoose.model('Coach', coachSchema);

export default Coach; 
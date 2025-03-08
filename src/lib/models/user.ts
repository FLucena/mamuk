import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  role: 'admin' | 'coach' | 'customer';
  emailVerified?: Date;
  image?: string;
  coach?: mongoose.Types.ObjectId;
  sub?: string;
  provider?: string;
  // ... other fields
}

export type UserRole = 'admin' | 'coach' | 'customer';

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  emailVerified: {
    type: Date,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['admin', 'coach', 'customer'],
    default: 'customer',
    required: true
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: false
  },
  // Google-specific fields
  sub: {
    type: String,
    unique: true,
    sparse: true,
    required: false
  },
  provider: {
    type: String,
    default: 'google',
    required: true
  }
}, {
  timestamps: true
});

// Only add index for role since it's not unique
userSchema.index({ role: 1 });

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 
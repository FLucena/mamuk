import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  roles: ('admin' | 'coach' | 'customer')[];
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
  },
  emailVerified: {
    type: Date,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  roles: {
    type: [String],
    enum: ['admin', 'coach', 'customer'],
    default: ['customer'],
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

// Add index for roles and email
userSchema.index({ roles: 1 });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ sub: 1 }, { sparse: true });

// Add compound indexes for common queries
userSchema.index({ roles: 1, name: 1 });
userSchema.index({ roles: 1, email: 1 });
userSchema.index({ name: 'text', email: 'text' });

// Add a pre-save hook to ensure roles is always an array
userSchema.pre('save', function(next) {
  // Ensure roles is an array
  if (!this.roles || !Array.isArray(this.roles) || this.roles.length === 0) {
    this.roles = ['customer'];
  }
  next();
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 
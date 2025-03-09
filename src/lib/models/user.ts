import mongoose from 'mongoose';

export type UserRole = 'admin' | 'coach' | 'customer';

// Define the interface for the document
export interface IUser {
  name?: string;
  email?: string;
  role: UserRole;
  emailVerified?: Date;
  image?: string;
  coach?: mongoose.Types.ObjectId;
  sub?: string;
  provider?: string;
  // ... other fields
}

// Create the schema without generic type parameter
const userSchema = new mongoose.Schema({
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

// Define the User model type
export type UserDocument = mongoose.Document & IUser;

// Create the model
const User = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);

export default User; 
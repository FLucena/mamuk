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

// Add index for roles
userSchema.index({ roles: 1 });

// Add a single named index for email with sparse option and optimized settings
// This replaces the previous duplicate indexes
userSchema.index({ email: 1 }, { 
  unique: true, 
  name: 'email_unique_index',
  background: true,
  sparse: true, // Allow null/undefined values
  partialFilterExpression: { email: { $exists: true } }, // Only index documents with email
});

// Add efficient compound index for auth lookups by email and provider
userSchema.index({ email: 1, provider: 1 }, { 
  name: 'email_provider_lookup',
  background: true 
});

userSchema.index({ sub: 1 }, { sparse: true });

// Add compound indexes for common queries with email prioritized
userSchema.index({ email: 1, roles: 1 });
userSchema.index({ roles: 1, name: 1 });

// Add text index for search with weights
userSchema.index(
  { 
    name: 'text', 
    email: 'text' 
  }, 
  { 
    weights: { 
      name: 2, 
      email: 10  // Higher weight for email searches
    },
    name: 'user_text_search'
  }
);

// Add a pre-save hook to ensure roles is always an array
userSchema.pre('save', function(next) {
  // Ensure roles is an array
  if (!this.roles || !Array.isArray(this.roles) || this.roles.length === 0) {
    this.roles = ['customer'];
  }
  next();
});

// Add a static method for efficient email lookups
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email }).lean().exec();
};

// Ensure model gets exported only once
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 
import mongoose, { Document, Model, Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
  CUSTOMER = 'customer',
  COACH = 'coach',
  ADMIN = 'admin'
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google'
}

// Define a type for Google OAuth profile
export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: string;
  height?: number; // in cm
  weight?: number; // in kg
  fitnessGoals?: string[];
  healthConditions?: string[];
  authProvider?: AuthProvider;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

interface UserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findOrCreateGoogleUser(profile: GoogleProfile): Promise<IUser>;
}

const UserSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email'
      ],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: function() {
        return this.authProvider === AuthProvider.LOCAL || this.authProvider === undefined;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't include password in query results by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER
    },
    profilePicture: {
      type: String
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer not to say']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    fitnessGoals: [{
      type: String
    }],
    healthConditions: [{
      type: String
    }],
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  { 
    timestamps: true 
  }
);

// Hash the password before saving
UserSchema.pre('save', async function(this: IUser, next) {
  // Only hash the password for local authentication and if password is modified
  if (this.authProvider !== AuthProvider.LOCAL && this.authProvider !== undefined) {
    return next();
  }
  
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

// Compare password method
UserSchema.methods.matchPassword = async function(this: IUser, enteredPassword: string): Promise<boolean> {
  // For Google auth users, they don't have a password to match
  if (this.authProvider === AuthProvider.GOOGLE) {
    return false;
  }
  
  return await bcrypt.compare(enteredPassword, this.password);
};

// Static method to find a user by email
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};

// Static method to find or create a user from Google profile
UserSchema.statics.findOrCreateGoogleUser = async function(profile: GoogleProfile) {
  // Try to find user by googleId first
  let user = await this.findOne({ googleId: profile.id });
  
  if (!user) {
    // Try to find by email
    user = await this.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // User exists with this email but not linked to Google, update the user
      user.googleId = profile.id;
      user.authProvider = AuthProvider.GOOGLE;
      if (!user.profilePicture && profile.photos && profile.photos.length) {
        user.profilePicture = profile.photos[0].value;
      }
      await user.save();
    } else {
      // Create a new user
      user = await this.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        authProvider: AuthProvider.GOOGLE,
        profilePicture: profile.photos && profile.photos.length ? profile.photos[0].value : undefined
      });
    }
  }
  
  return user;
};

const User = mongoose.model<IUser, UserModel>('User', UserSchema);

export default User; 
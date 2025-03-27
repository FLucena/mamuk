const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User roles
const UserRole = {
  CUSTOMER: 'customer',
  COACH: 'coach',
  ADMIN: 'admin'
};

// Auth providers
const AuthProvider = {
  LOCAL: 'local',
  GOOGLE: 'google'
};

const UserSchema = new mongoose.Schema(
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
    google: {
      id: String,
      email: String,
      name: String,
      picture: String
    }
  },
  { 
    timestamps: true 
  }
);

// Hash the password before saving
UserSchema.pre('save', async function(next) {
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
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // For Google auth users, they don't have a password to match
  if (this.authProvider === AuthProvider.GOOGLE) {
    return false;
  }
  
  return await bcrypt.compare(enteredPassword, this.password);
};

// Static method to find a user by email
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// Static method to find or create a user from Google profile
UserSchema.statics.findOrCreateGoogleUser = async function(profile) {
  // Try to find user by google id first
  let user = await this.findOne({ 'google.id': profile.id });
  
  if (!user) {
    // Try to find by email
    const email = profile.emails[0].value;
    user = await this.findOne({ email });
    
    if (user) {
      // User exists with this email but not linked to Google, update the user
      user.google = {
        id: profile.id,
        email: email,
        name: profile.displayName,
        picture: profile.photos ? profile.photos[0].value : null
      };
      user.authProvider = AuthProvider.GOOGLE;
      await user.save();
    } else {
      // Create a new user
      user = await this.create({
        name: profile.displayName,
        email: email,
        authProvider: AuthProvider.GOOGLE,
        google: {
          id: profile.id,
          email: email,
          name: profile.displayName,
          picture: profile.photos ? profile.photos[0].value : null
        }
      });
    }
  }
  
  return user;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
module.exports.UserRole = UserRole;
module.exports.AuthProvider = AuthProvider; 
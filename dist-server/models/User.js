"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = exports.UserRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["COACH"] = "coach";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["LOCAL"] = "local";
    AuthProvider["GOOGLE"] = "google";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
const UserSchema = new mongoose_1.Schema({
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
        required: function () {
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
}, {
    timestamps: true
});
// Hash the password before saving
UserSchema.pre('save', async function (next) {
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
    }
    catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
    }
});
// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // For Google auth users, they don't have a password to match
    if (this.authProvider === AuthProvider.GOOGLE) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};
// Static method to find a user by email
UserSchema.statics.findByEmail = function (email) {
    return this.findOne({ email });
};
// Static method to find or create a user from Google profile
UserSchema.statics.findOrCreateGoogleUser = async function (profile) {
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
        }
        else {
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
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
//# sourceMappingURL=User.js.map
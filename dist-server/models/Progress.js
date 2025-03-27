"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyMeasurement = exports.WorkoutSession = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const WorkoutSessionSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    workout: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Workout',
        required: [true, 'Workout reference is required']
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required'],
        default: Date.now
    },
    endTime: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedExercises: [
        {
            exercise: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Exercise',
                required: [true, 'Exercise reference is required']
            },
            sets: [
                {
                    reps: {
                        type: Number,
                        required: [true, 'Number of reps is required'],
                        min: [0, 'Reps cannot be negative']
                    },
                    weight: {
                        type: Number,
                        min: [0, 'Weight cannot be negative']
                    },
                    duration: {
                        type: Number,
                        min: [0, 'Duration cannot be negative']
                    },
                    completed: {
                        type: Boolean,
                        default: true
                    },
                    notes: {
                        type: String
                    }
                }
            ],
            completed: {
                type: Boolean,
                default: false
            }
        }
    ],
    moodBefore: {
        type: String,
        enum: ['poor', 'average', 'good', 'great']
    },
    moodAfter: {
        type: String,
        enum: ['poor', 'average', 'good', 'great']
    },
    energyLevel: {
        type: String,
        enum: ['low', 'medium', 'high']
    },
    notes: {
        type: String
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    }
}, {
    timestamps: true
});
const BodyMeasurementSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    date: {
        type: Date,
        required: [true, 'Measurement date is required'],
        default: Date.now
    },
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    height: {
        type: Number,
        min: [0, 'Height cannot be negative']
    },
    bodyFatPercentage: {
        type: Number,
        min: [0, 'Body fat percentage cannot be negative'],
        max: [100, 'Body fat percentage cannot exceed 100%']
    },
    measurements: {
        chest: {
            type: Number,
            min: [0, 'Chest measurement cannot be negative']
        },
        waist: {
            type: Number,
            min: [0, 'Waist measurement cannot be negative']
        },
        hips: {
            type: Number,
            min: [0, 'Hips measurement cannot be negative']
        },
        thighs: {
            type: Number,
            min: [0, 'Thighs measurement cannot be negative']
        },
        arms: {
            type: Number,
            min: [0, 'Arms measurement cannot be negative']
        },
        shoulders: {
            type: Number,
            min: [0, 'Shoulders measurement cannot be negative']
        },
        calves: {
            type: Number,
            min: [0, 'Calves measurement cannot be negative']
        },
        neck: {
            type: Number,
            min: [0, 'Neck measurement cannot be negative']
        }
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});
// Indexes for faster lookups
WorkoutSessionSchema.index({ user: 1, createdAt: -1 });
WorkoutSessionSchema.index({ workout: 1 });
WorkoutSessionSchema.index({ completed: 1 });
BodyMeasurementSchema.index({ user: 1, date: -1 });
exports.WorkoutSession = mongoose_1.default.model('WorkoutSession', WorkoutSessionSchema);
exports.BodyMeasurement = mongoose_1.default.model('BodyMeasurement', BodyMeasurementSchema);
//# sourceMappingURL=Progress.js.map
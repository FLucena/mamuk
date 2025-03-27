"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ExerciseInstanceSchema = new mongoose_1.default.Schema({
    exercise: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: [true, 'Exercise reference is required']
    },
    sets: {
        type: Number,
        required: [true, 'Number of sets is required'],
        min: [1, 'Number of sets must be at least 1']
    },
    reps: {
        type: Number,
        required: [true, 'Number of reps is required'],
        min: [1, 'Number of reps must be at least 1']
    },
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    duration: {
        type: Number,
        min: [0, 'Duration cannot be negative']
    },
    notes: {
        type: String
    }
});
const WorkoutBlockSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Block name is required']
    },
    exercises: {
        type: [ExerciseInstanceSchema],
        default: []
    }
});
const WorkoutDaySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Day name is required']
    },
    blocks: {
        type: [WorkoutBlockSchema],
        default: []
    },
    day: {
        type: Number,
        required: [true, 'Day number is required'],
        min: [1, 'Day number must be at least 1']
    }
});
const WorkoutSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a workout title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please specify the creator of the workout']
    },
    assignedTo: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }],
    days: {
        type: [WorkoutDaySchema],
        default: []
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    frequency: {
        type: String
    },
    isTemplate: {
        type: Boolean,
        default: false
    },
    completed: {
        type: Boolean,
        default: false
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    category: {
        type: String
    },
    goals: [{
            type: String
        }],
    notes: {
        type: String
    }
}, {
    timestamps: true
});
// Indexes for faster lookups
WorkoutSchema.index({ createdBy: 1 });
WorkoutSchema.index({ assignedTo: 1 });
WorkoutSchema.index({ isTemplate: 1 });
WorkoutSchema.index({ completed: 1 });
exports.default = mongoose_1.default.model('Workout', WorkoutSchema);
//# sourceMappingURL=Workout.js.map
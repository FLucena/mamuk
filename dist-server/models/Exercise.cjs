"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ExerciseSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please provide an exercise name'],
        trim: true
    },
    category: {
        type: String,
        enum: ['strength', 'cardio', 'flexibility', 'balance', 'other'],
        required: [true, 'Please specify the exercise category']
    },
    muscleGroups: {
        type: [String],
        required: [true, 'Please specify at least one muscle group'],
        validate: [
            (arr) => arr.length > 0,
            'At least one muscle group is required'
        ]
    },
    defaultSets: {
        type: Number,
        min: [1, 'Number of sets must be at least 1']
    },
    defaultReps: {
        type: Number,
        min: [1, 'Number of reps must be at least 1']
    },
    defaultWeight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    defaultDuration: {
        type: Number,
        min: [0, 'Duration cannot be negative']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    instructions: {
        type: String,
        maxlength: [2000, 'Instructions cannot be more than 2000 characters']
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    equipment: [{
            type: String
        }],
    isCustom: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    imageUrl: {
        type: String
    },
    videoUrl: {
        type: String
    }
}, {
    timestamps: true
});
// Index for faster lookups
ExerciseSchema.index({ name: 1 });
ExerciseSchema.index({ category: 1 });
ExerciseSchema.index({ muscleGroups: 1 });
ExerciseSchema.index({ isCustom: 1, createdBy: 1 });
exports.default = mongoose_1.default.model('Exercise', ExerciseSchema);
//# sourceMappingURL=Exercise.js.map
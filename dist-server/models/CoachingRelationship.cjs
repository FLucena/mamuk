"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CoachingRelationshipSchema = new mongoose_1.default.Schema({
    coach: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Coach reference is required']
    },
    client: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client reference is required']
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'paused', 'completed', 'cancelled'],
        default: 'pending'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        default: Date.now
    },
    endDate: {
        type: Date
    },
    package: {
        name: {
            type: String,
            required: [true, 'Package name is required']
        },
        description: {
            type: String
        },
        duration: {
            type: Number,
            min: [1, 'Duration must be at least 1 day']
        },
        sessionsPerWeek: {
            type: Number,
            min: [1, 'Sessions per week must be at least 1']
        },
        price: {
            type: Number,
            min: [0, 'Price cannot be negative']
        }
    },
    goals: [{
            type: String
        }],
    currentWorkout: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Workout'
    },
    workoutHistory: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Workout'
        }],
    notes: [{
            content: {
                type: String,
                required: [true, 'Note content is required']
            },
            createdBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: [true, 'Note creator is required']
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    feedback: {
        fromCoach: [{
                content: {
                    type: String,
                    required: [true, 'Feedback content is required']
                },
                rating: {
                    type: Number,
                    min: [1, 'Rating must be at least 1'],
                    max: [5, 'Rating cannot be more than 5']
                },
                date: {
                    type: Date,
                    default: Date.now
                }
            }],
        fromClient: [{
                content: {
                    type: String,
                    required: [true, 'Feedback content is required']
                },
                rating: {
                    type: Number,
                    min: [1, 'Rating must be at least 1'],
                    max: [5, 'Rating cannot be more than 5']
                },
                date: {
                    type: Date,
                    default: Date.now
                }
            }]
    },
    paymentHistory: [{
            amount: {
                type: Number,
                required: [true, 'Payment amount is required'],
                min: [0, 'Amount cannot be negative']
            },
            date: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed', 'refunded'],
                default: 'pending'
            },
            notes: {
                type: String
            }
        }]
}, {
    timestamps: true
});
// Custom validation to ensure coach and client are different users
CoachingRelationshipSchema.pre('validate', function (next) {
    if (this.coach.toString() === this.client.toString()) {
        this.invalidate('client', 'Coach and client cannot be the same user');
    }
    next();
});
// Indexes for faster lookups
CoachingRelationshipSchema.index({ coach: 1, status: 1 });
CoachingRelationshipSchema.index({ client: 1, status: 1 });
CoachingRelationshipSchema.index({ startDate: -1 });
CoachingRelationshipSchema.index({ status: 1 });
exports.default = mongoose_1.default.model('CoachingRelationship', CoachingRelationshipSchema);
//# sourceMappingURL=CoachingRelationship.js.map
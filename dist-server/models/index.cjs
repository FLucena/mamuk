"use strict";
// Main export file for all models
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.CoachingRelationship = exports.BodyMeasurement = exports.WorkoutSession = exports.Workout = exports.Exercise = exports.User = void 0;
const User_1 = __importStar(require("./User.cjs"));
exports.User = User_1.default;
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return User_1.UserRole; } });
const Exercise_1 = __importDefault(require("./Exercise.cjs"));
exports.Exercise = Exercise_1.default;
const Workout_1 = __importDefault(require("./Workout.cjs"));
exports.Workout = Workout_1.default;
const Progress_1 = require("./Progress.cjs");
Object.defineProperty(exports, "WorkoutSession", { enumerable: true, get: function () { return Progress_1.WorkoutSession; } });
Object.defineProperty(exports, "BodyMeasurement", { enumerable: true, get: function () { return Progress_1.BodyMeasurement; } });
const CoachingRelationship_1 = __importDefault(require("./CoachingRelationship"));
exports.CoachingRelationship = CoachingRelationship_1.default;
// Export default object with all models
exports.default = {
    User: User_1.default,
    Exercise: Exercise_1.default,
    Workout: Workout_1.default,
    WorkoutSession: Progress_1.WorkoutSession,
    BodyMeasurement: Progress_1.BodyMeasurement,
    CoachingRelationship: CoachingRelationship_1.default
};
//# sourceMappingURL=index.js.map
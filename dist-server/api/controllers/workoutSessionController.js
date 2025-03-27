"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkoutSession = exports.getWorkoutSessionById = exports.getWorkoutSessions = exports.completeWorkoutSession = exports.updateWorkoutSession = exports.startWorkoutSession = void 0;
// These models would need to be created, but for now let's just stub them
const WorkoutSession = { findOne: () => Promise.resolve(null), findById: () => Promise.resolve(null), create: () => Promise.resolve({}) };
const Workout = { findById: () => Promise.resolve(null) };
/**
 * Start a new workout session
 * POST /api/workout-sessions/start
 * Private
 */
const startWorkoutSession = async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
};
exports.startWorkoutSession = startWorkoutSession;
/**
 * Update a workout session (track progress during workout)
 * PUT /api/workout-sessions/:id
 * Private
 */
const updateWorkoutSession = async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
};
exports.updateWorkoutSession = updateWorkoutSession;
/**
 * Complete a workout session
 * PUT /api/workout-sessions/:id/complete
 * Private
 */
const completeWorkoutSession = async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
};
exports.completeWorkoutSession = completeWorkoutSession;
/**
 * Get workout sessions for the current user
 * GET /api/workout-sessions
 * Private
 */
const getWorkoutSessions = async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
};
exports.getWorkoutSessions = getWorkoutSessions;
/**
 * Get a specific workout session
 * GET /api/workout-sessions/:id
 * Private
 */
const getWorkoutSessionById = async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
};
exports.getWorkoutSessionById = getWorkoutSessionById;
/**
 * Delete a workout session
 * DELETE /api/workout-sessions/:id
 * Private
 */
const deleteWorkoutSession = async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
};
exports.deleteWorkoutSession = deleteWorkoutSession;
module.exports = {
    startWorkoutSession: exports.startWorkoutSession,
    updateWorkoutSession: exports.updateWorkoutSession,
    completeWorkoutSession: exports.completeWorkoutSession,
    getWorkoutSessions: exports.getWorkoutSessions,
    getWorkoutSessionById: exports.getWorkoutSessionById,
    deleteWorkoutSession: exports.deleteWorkoutSession
};
//# sourceMappingURL=workoutSessionController.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workoutController_1 = require("../controllers/workoutController");
const auth_1 = require("../middleware/auth");
const middleware_helpers_1 = require("../middleware/middleware-helpers");
const router = express_1.default.Router();
// All routes require authentication - use our type-safe wrapper
router.use((0, middleware_helpers_1.asHandler)(auth_1.authenticate));
// Workout routes - wrap all handlers with withAuth
router.route('/')
    .get((0, middleware_helpers_1.withAuth)(workoutController_1.getWorkouts))
    .post((0, middleware_helpers_1.withAuth)(workoutController_1.createWorkout));
router.route('/:id')
    .get((0, middleware_helpers_1.withAuth)(workoutController_1.getWorkoutById))
    .put((0, middleware_helpers_1.withAuth)(workoutController_1.updateWorkout))
    .delete((0, middleware_helpers_1.withAuth)(workoutController_1.deleteWorkout));
// Toggle workout completion status
router.put('/:id/toggle-completion', (0, middleware_helpers_1.withAuth)(workoutController_1.toggleWorkoutCompletion));
exports.default = router;
//# sourceMappingURL=workoutRoutes.js.map
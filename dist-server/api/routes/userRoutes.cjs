"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth.cjs");
const User_1 = require("../../models/User.cjs");
const router = express_1.default.Router();
// Public routes
router.post('/register', userController_1.registerUser);
router.post('/login', userController_1.loginUser);
// Private routes - require authentication
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.get('/profile', auth_1.authenticate, userController_1.getUserProfile);
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.put('/profile', auth_1.authenticate, userController_1.updateUserProfile);
// Admin only routes
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN), userController_1.getUsers);
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.COACH), userController_1.getUserById);
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.put('/:id/role', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN), userController_1.updateUserRole);
// @ts-expect-error - TypeScript doesn't understand that middleware ensures correct types at runtime
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN), userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map
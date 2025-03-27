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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = void 0;
const express = __importStar(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const authRoutes_1 = require("./authRoutes");
const workoutSessionRoutes_1 = __importDefault(require("./workoutSessionRoutes"));
const workoutRoutes_1 = __importDefault(require("./workoutRoutes"));
const models_1 = require("../../models");
// Export a function that creates and returns the router with the provided passport instance
const createApiRouter = (passport) => {
    const router = express.Router();
    // Mount routes
    router.use('/auth', (0, authRoutes_1.createAuthRouter)(passport));
    router.use('/workouts', workoutRoutes_1.default);
    router.use('/workout-sessions', workoutSessionRoutes_1.default);
    // API info route
    router.get('/', (req, res) => {
        res.json({
            message: 'Welcome to Mamuk Fitness API',
            version: '1.0.0'
        });
    });
    // Database test route
    router.get('/db-test', async (req, res) => {
        try {
            // Check connection status
            const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
            // Count users for a simple database operation test
            const userCount = await models_1.User.countDocuments();
            res.json({
                status: 'success',
                dbConnection: dbStatus,
                mongoDbVersion: mongoose_1.default.version,
                userCount: userCount,
                message: 'MongoDB connection test successful'
            });
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'MongoDB connection test failed',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    return router;
};
exports.createApiRouter = createApiRouter;
// For backward compatibility
exports.default = exports.createApiRouter;
//# sourceMappingURL=index.js.map
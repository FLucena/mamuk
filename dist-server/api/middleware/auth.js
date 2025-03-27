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
exports.authorize = exports.authenticate = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../models/User"));
/**
 * Authentication middleware
 * Verifies JWT token and adds user to request object
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        // Extract token without "Bearer " prefix
        const token = authHeader.substring(7);
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        if (!decoded.id) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        // Find user by id
        const user = await User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        // Add user to request
        req.user = {
            userId: user._id.toString(),
            role: user.role || 'user'
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        if (error instanceof Error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
        }
        res.status(500).json({ message: 'Server error during authentication' });
    }
};
exports.authenticate = authenticate;
/**
 * Role-based authorization middleware
 * Ensures user has one of the allowed roles
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        if (allowedRoles.length === 0 || allowedRoles.includes(req.user.role)) {
            next();
        }
        else {
            return res.status(403).json({
                message: `Not authorized, required roles: ${allowedRoles.join(', ')}`
            });
        }
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map
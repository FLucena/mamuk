"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asHandler = exports.withAuth = void 0;
/**
 * Wrapper function to type-cast request handlers that need AuthRequest
 * This resolves TypeScript errors when using middleware with Express
 */
const withAuth = (handler) => {
    return (req, res, next) => {
        return handler(req, res, next);
    };
};
exports.withAuth = withAuth;
/**
 * Helper to type-cast a middleware for use with Express router
 * This wraps the middleware to handle asynchronous execution properly
 */
const asHandler = (middleware) => {
    return (req, res, next) => {
        // Converting async middleware into Promise-aware middleware
        try {
            const result = middleware(req, res, next);
            if (result && typeof result.catch === 'function') {
                result.catch((err) => {
                    next(err);
                });
            }
            return result;
        }
        catch (err) {
            next(err);
        }
    };
};
exports.asHandler = asHandler;
//# sourceMappingURL=middleware-helpers.js.map
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from '../../types/express';

/**
 * Wrapper function to type-cast request handlers that need AuthRequest
 * This resolves TypeScript errors when using middleware with Express
 */
export const withAuth = <ResBody = unknown>(
  handler: (req: AuthRequest, res: Response<ResBody>, next?: NextFunction) => Promise<void | Response<ResBody>> | void | Response<ResBody>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthRequest, res, next);
  };
};

/**
 * Helper to type-cast a middleware for use with Express router
 * This wraps the middleware to handle asynchronous execution properly
 */
export const asHandler = (
  middleware: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<unknown>> | void
): RequestHandler => {
  return (req, res, next) => {
    // Converting async middleware into Promise-aware middleware
    try {
      const result = middleware(req, res, next);
      if (result && typeof result.catch === 'function') {
        result.catch((err: unknown) => {
          next(err);
        });
      }
      return result;
    } catch (err) {
      next(err);
    }
  };
}; 
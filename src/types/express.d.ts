// Type definitions for Express.js
import { Request } from 'express';
import { Query, ParamsDictionary } from 'express-serve-static-core';

// Properly extend Express namespace
declare global {
  namespace Express {
    // Extend the User interface (using same structure as our User model)
    interface User {
      _id: string;
      name?: string;
      email?: string;
      role: string;
      profilePicture?: string;
      google?: {
        id: string;
        email: string;
        name: string;
        picture: string;
      };
    }

    export interface Request {
      user?: User;
    }
  }
}

// Extend Request interface to include our custom AuthRequest properties
declare module 'express-serve-static-core' {
  interface Request {
    // Optional user field with our required auth properties
    user?: Express.User | {
      userId: string;
      email?: string;
      role: string;
    };
  }
}

// For use in our controller functions, define a properly extended AuthRequest type
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    role: string;
  };
  // Express.Request already includes these properties,
  // but we re-list them here for extra clarity:
  body: any;
  params: ParamsDictionary;
  query: Query;
}

export {}; 
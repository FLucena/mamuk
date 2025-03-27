import { User as UserModel } from '../models/User';

declare global {
  namespace Express {
    export interface User {
      _id: string;
      email: string;
      role: string;
      [key: string]: any;
    }

    export interface Request {
      user?: User;
    }
  }
}

export {}; 
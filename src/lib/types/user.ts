export type Role = 'admin' | 'coach' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
}

export interface MongoUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
} 
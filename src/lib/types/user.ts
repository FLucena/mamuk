export type Role = 'admin' | 'coach' | 'customer';

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: Role[];
  image?: string;
} 
export type Role = 'admin' | 'coach' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roles: Role[];
  image?: string;
}

export interface MongoUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  roles: Role[];
  image?: string;
}

// Funciones de utilidad para verificar roles
export const hasRole = (user: User | MongoUser | null | undefined, role: Role): boolean => {
  if (!user) return false;
  return user.roles?.includes(role) || false;
};

export const hasAnyRole = (user: User | MongoUser | null | undefined, roles: Role[]): boolean => {
  if (!user) return false;
  return roles.some(role => user.roles?.includes(role)) || false;
}; 
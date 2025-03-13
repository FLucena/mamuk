import 'next-auth';
import { UserRole } from '@/lib/models/user';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      roles: UserRole[];
      coachId?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles: UserRole[];
    coachId?: string;
  }
} 
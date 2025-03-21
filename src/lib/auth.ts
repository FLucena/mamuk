import { DefaultSession, NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { dbConnect } from './db';
import User from './models/user';
import { Role } from './types/user';

// Type definitions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roles: Role[];
    } & DefaultSession['user']
  }

  interface User {
    id: string;
    roles: Role[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    roles: Role[];
    sub?: string;
    email?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // Handle JWT token creation
    async jwt({ token, user }) {
      
      if (!token.roles) {
        token.roles = ['customer'];
      }

      if (user) {
        token.id = user.id;
        token.roles = (user.roles as Role[]) || ['customer'];
      }

      return token;
    },
    // Add user information to session
    async session({ session, token }) {
      
      if (session.user) {
        try {
          await dbConnect();
          const dbUser = await (User.findOne as any)({ email: session.user.email })
            .select('roles')
            .lean() as { roles?: Role[] } | null;

          session.user.id = token.id as string || '';
          session.user.roles = (dbUser?.roles || token.roles || ['customer']) as Role[];
        } catch (error) {
          console.error('Error fetching user roles:', error);
          session.user.roles = token.roles || ['customer'];
        }
      }
      
      return session;
    },
    // Basic signIn callback
    async signIn({ user, account }) {
      if (!account) {
        return false;
      }

      try {
        await dbConnect();
        
        // Find or create user in database
        const dbUser = await (User.findOne as any)({
          $or: [
            { email: user.email },
            { sub: account.providerAccountId }
          ]
        });
        
        if (!dbUser) {
          // Create new user if not found
          await (User.create as any)({
            email: user.email || "",
            name: user.name || '',
            image: user.image,
            roles: ['customer'],
            sub: account.providerAccountId,
            provider: account.provider
          });
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return '/auth/error?error=DatabaseError';
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 
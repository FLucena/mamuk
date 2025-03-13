import { DefaultSession, NextAuthOptions, Session, User as NextAuthUser, Account } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import GoogleProvider from 'next-auth/providers/google';
import { dbConnect } from './db';
import User from './models/user';
import clientPromise from './mongodb';
import { JWT } from 'next-auth/jwt';
import { Role } from './types/user';
import { Document } from 'mongoose';

interface GoogleUser extends NextAuthUser {
  emailVerified?: Date | null;
}

interface DbUser extends Document {
  _id: any;
  roles: Role[];
  email: string;
  name?: string;
  image?: string;
  sub?: string;
  provider?: string;
  emailVerified?: Date | null;
}

interface LeanDbUser {
  _id: any;
  roles: Role[];
  email: string;
  name?: string;
  image?: string;
  sub?: string;
  provider?: string;
  emailVerified?: Date | null;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roles: Role[];
      coachId?: string;
      emailVerified?: Date | null;
    } & DefaultSession['user']
  }

  interface User {
    id: string;
    roles: Role[];
    emailVerified?: Date | null;
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
    }),
  ],
  logger: {
    error(code: string, metadata: any) {
      if (process.env.NODE_ENV !== 'production' || code !== 'CLIENT_FETCH_ERROR') {
        console.error('AUTH ERROR:', code, metadata);
      }
    },
    warn(code: string) {
      if (code !== 'DEBUG_ENABLED') {
        // Removed console.warn
      }
    },
    debug(code: string, metadata: any) {
      if (process.env.NODE_ENV === 'development') {
        // Removed console.log
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Ensure token has roles property
      if (!token.roles) {
        token.roles = ['customer'];
      }

      if (user) {
        token.roles = user.roles || ['customer'];
        token.id = user.id;
      }

      try {
        await dbConnect();
        const dbUser = await User.findOne({ 
          $or: [
            { email: token.email },
            { sub: token.sub }
          ]
        })
        .select('_id roles email name image sub provider emailVerified')
        .lean<LeanDbUser>();

        if (dbUser) {
          // Ensure user has roles
          const userRoles = Array.isArray(dbUser.roles) && dbUser.roles.length > 0 
            ? dbUser.roles 
            : ['customer'];
          
          return {
            ...token,
            id: dbUser._id.toString(),
            roles: userRoles,
            name: dbUser.name || token.name,
            email: dbUser.email || token.email,
            picture: dbUser.image || token.picture,
          };
        } else if (trigger === 'signIn') {
          const newUser = await User.create({
            name: token.name,
            email: token.email,
            image: token.picture,
            sub: token.sub,
            roles: ['customer'],
          });

          return {
            ...token,
            id: newUser._id.toString(),
            roles: newUser.roles,
          };
        } else {
          return {
            ...token,
            roles: token.roles || ['customer'],
          };
        }
      } catch (error) {
        console.error('Error in jwt callback:', error);
        return {
          ...token,
          roles: token.roles || ['customer']
        };
      }
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = {
          id: token?.id || '',
          roles: token?.roles || ['customer'],
          name: token?.name,
          email: token?.email,
          image: token?.picture
        };
      } else {
        session.user.id = token?.id || session.user.id || '';
        session.user.roles = token?.roles || ['customer'];
        
        // Always ensure the user has roles
        if (!session.user.roles || !Array.isArray(session.user.roles) || session.user.roles.length === 0) {
          session.user.roles = ['customer'];
        }
      }

      // Debug log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Session after processing:', {
          id: session.user.id,
          email: session.user.email,
          roles: session.user.roles
        });
      }

      return session;
    },
    async signIn(params) {
      const { user, account } = params;
      
      if (!account) {
        console.error('No account provided in signIn callback');
        return false;
      }

      try {
        await dbConnect();
        const dbUser = await User.findOne({ 
          $or: [
            { email: user.email },
            { sub: account.providerAccountId }
          ]
        });
        
        if (!dbUser) {
          await User.create({
            email: user.email,
            name: user.name || '',
            image: user.image,
            emailVerified: user.emailVerified,
            roles: ['customer'],
            sub: account.providerAccountId,
            provider: account.provider
          });
        } else if (!dbUser.sub) {
          await User.findByIdAndUpdate(dbUser._id, {
            sub: account.providerAccountId,
            provider: account.provider
          });
        }
        
        // Ensure user has roles array
        if (dbUser && (!dbUser.roles || !Array.isArray(dbUser.roles) || dbUser.roles.length === 0)) {
          await User.findByIdAndUpdate(dbUser._id, {
            roles: ['customer']
          });
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        // Removed console.log
      }
    },
    async signOut({ token }) {
      // Removed console.log
    }
  },
  debug: process.env.NODE_ENV === 'development',
}; 
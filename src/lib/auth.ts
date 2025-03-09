import { DefaultSession, NextAuthOptions, Session, User as NextAuthUser, Account } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { dbConnect } from './db';
import User from './models/user';
import { JWT } from 'next-auth/jwt';
import { Role } from './types/user';
import { Document } from 'mongoose';

interface GoogleUser extends NextAuthUser {
  emailVerified?: Date | null;
}

interface DbUser extends Document {
  _id: any;
  role: Role;
  email: string;
  name?: string;
  image?: string;
  sub?: string;
  provider?: string;
  emailVerified?: Date | null;
}

interface LeanDbUser {
  _id: any;
  role: Role;
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
      role: Role;
      coachId?: string;
      emailVerified?: Date | null;
    } & DefaultSession['user']
  }

  interface User {
    id: string;
    role: Role;
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: Role;
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
        console.warn('AUTH WARNING:', code);
      }
    },
    debug(code: string, metadata: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log('AUTH DEBUG:', code, metadata);
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
      if (user) {
        token.role = user.role;
      }

      try {
        await dbConnect();
        const dbUser = await User.findOne({ 
          $or: [
            { email: token.email },
            { sub: token.sub }
          ]
        })
        .select('_id role email name image sub provider emailVerified')
        .lean<LeanDbUser>();

        if (dbUser) {
          return {
            ...token,
            id: dbUser._id.toString(),
            role: dbUser.role as Role,
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
            role: 'customer' as Role,
          });

          return {
            ...token,
            id: newUser._id.toString(),
            role: newUser.role as Role,
          };
        } else {
          return {
            ...token,
            role: 'customer' as Role,
          };
        }
      } catch (error) {
        console.error('Error in jwt callback:', error);
        return {
          ...token,
          role: token.role || 'customer' as Role
        };
      }
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = {
          id: token?.id || '',
          role: (token?.role || 'customer') as Role,
          name: token?.name,
          email: token?.email,
          image: token?.picture
        };
      } else {
        session.user.id = token?.id || session.user.id || '';
        
        // Siempre obtener el rol actualizado de la base de datos
        try {
          await dbConnect();
          
          if (session.user.email) {
            const dbUser = await User.findOne({ email: session.user.email })
              .select('role')
              .lean<{ role: Role }>();
            
            if (dbUser) {
              session.user.role = dbUser.role;
              // Actualizamos el token también para mantener sincronizado
              token.role = dbUser.role;
            } else {
              session.user.role = (token?.role || 'customer') as Role;
            }
          } else {
            session.user.role = (token?.role || 'customer') as Role;
          }
        } catch (error) {
          console.error('Error getting updated role in session callback:', error);
          session.user.role = (token?.role || 'customer') as Role;
        }
      }

      return session;
    },
    async signIn({ user, account }) {
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
            role: 'customer',
            sub: account.providerAccountId,
            provider: account.provider
          });
        } else if (!dbUser.sub) {
          await User.findByIdAndUpdate(dbUser._id, {
            sub: account.providerAccountId,
            provider: account.provider
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
        console.log('New user signed in:', user.email);
      }
    },
    async signOut({ token }) {
      console.log('User signed out:', token.id);
    }
  },
  debug: process.env.NODE_ENV === 'development',
}; 
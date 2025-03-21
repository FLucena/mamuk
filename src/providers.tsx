'use client';

import { Session } from 'next-auth';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import SessionProvider from '@/components/SessionProvider';
import { WorkoutLimitProvider } from './providers/WorkoutLimitProvider';

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

export function Providers({ children, session = null }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange
      >
        <WorkoutLimitProvider>
          {children}
        </WorkoutLimitProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 
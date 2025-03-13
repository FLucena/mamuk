'use client';

import { Session } from 'next-auth';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import SessionProvider from '@/components/SessionProvider';

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
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
} 
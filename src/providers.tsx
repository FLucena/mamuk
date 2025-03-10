'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import NavigationGuard from '@/components/NavigationGuard';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange
      >
        <NavigationProvider>
          <NavigationGuard>
            <AuthProvider>
              {children}
            </AuthProvider>
          </NavigationGuard>
        </NavigationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 
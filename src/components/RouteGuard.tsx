'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { checkRouteAccess } from '@/utils/authNavigation';
import PageLoading from '@/components/ui/PageLoading';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const initialCheckDone = useRef<boolean>(false);

  useEffect(() => {
    // Reset authorization when path changes
    if (pathname && initialCheckDone.current) {
      setAuthorized(false);
    }
    
    // Skip authorization check while session is loading
    if (status === 'loading') return;

    // Check if route requires authentication
    const { hasAccess, redirectTo, reason } = checkRouteAccess(pathname || '', session);

    // Log access checks during development
    if (process.env.NODE_ENV === 'development') {
      console.log(`RouteGuard: ${pathname} - ${hasAccess ? 'Access granted' : 'Access denied'} - ${reason}`);
    }

    // If we have a session, we're authorized
    if (session) {
      setAuthorized(true);
      initialCheckDone.current = true;
      return;
    }

    // For unauthenticated users, redirect if needed
    if (!hasAccess && redirectTo) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname || '/')}`);
    } else {
      // Otherwise set authorized based on the access check
      setAuthorized(hasAccess);
    }
    
    // Mark that we've done the initial check
    initialCheckDone.current = true;
  }, [pathname, session, status, router]);

  // Show loading indicator while checking authentication
  if (status === 'loading' || !authorized) {
    return <PageLoading label="Verificando acceso..." data-testid="loading-spinner" />;
  }

  // Show children only if authorized
  return <>{children}</>;
} 
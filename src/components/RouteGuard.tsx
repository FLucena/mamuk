'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { checkRouteAccess } from '@/utils/authNavigation';
import PageLoading from '@/components/ui/PageLoading';
import { redirectService } from '@/utils/redirectService';

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

    if (process.env.NODE_ENV === 'development') {
      console.log(`RouteGuard: ${pathname} - ${hasAccess ? 'Access granted' : 'Access denied'} - ${reason}`);
    }

    if (!hasAccess && redirectTo) {
      // Use the centralized redirect service
      redirectService.performRedirect(router, redirectTo, { 
        source: 'RouteGuard',
        // Force the first redirect after login
        force: !initialCheckDone.current,
        // Pass the session status
        sessionStatus: status
      });
    } else {
      setAuthorized(true);
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
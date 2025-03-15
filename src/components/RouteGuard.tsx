'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { checkRouteAccess } from '@/utils/authNavigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Skip authorization check while session is loading
    if (status === 'loading') return;

    // Check if route requires authentication
    const { hasAccess, redirectTo, reason } = checkRouteAccess(pathname || '', session);

    if (process.env.NODE_ENV === 'development') {
      console.log(`RouteGuard: ${pathname} - ${hasAccess ? 'Access granted' : 'Access denied'} - ${reason}`);
    }

    if (!hasAccess && redirectTo) {
      // Redirect to appropriate page
      router.push(redirectTo);
    } else {
      setAuthorized(true);
    }
  }, [pathname, session, status, router]);

  // Show loading indicator while checking authentication
  if (status === 'loading' || !authorized) {
    return <LoadingSpinner data-testid="loading-spinner" />;
  }

  // Show children only if authorized
  return <>{children}</>;
} 
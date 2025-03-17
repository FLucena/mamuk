'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
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
    // Skip authorization check while session is loading
    if (status === 'loading') return;

    // With simplified authentication:
    // 1. All users are authorized to view all pages
    // 2. We're keeping basic Google authentication
    
    // For development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`RouteGuard: ${pathname} - Access granted - Using simplified auth`);
    }
    
    // Always set authorized to true - no route protection
    setAuthorized(true);
    initialCheckDone.current = true;
  }, [pathname, session, status, router]);

  // Show loading indicator while checking authentication
  if (status === 'loading' || !initialCheckDone.current) {
    return <PageLoading label="Verificando acceso..." data-testid="loading-spinner" />;
  }

  // Show children only if authorized (always true in simplified version)
  return <>{children}</>;
} 
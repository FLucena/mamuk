import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

/**
 * A wrapper component that protects routes from unauthorized access.
 * 
 * @param children - The route component(s) to render if authenticated
 * @param allowedRoles - Optional array of roles that are allowed to access this route
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, refreshUserData } = useAuth();
  const location = useLocation();

  // Effect to refresh user data when navigating to a protected route
  useEffect(() => {
    if (isAuthenticated) {
      refreshUserData().catch(err => {
        console.error('Failed to refresh user data:', err);
      });
    }
  }, [isAuthenticated, refreshUserData]);

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after successful login
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }
  
  // If roles are specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User doesn't have the required role, redirect to dashboard
      return <Navigate to="/" replace />;
    }
  }
  
  // User is authenticated and has required role, render children
  return <>{children}</>;
};

export default ProtectedRoute; 
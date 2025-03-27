import { useEffect } from 'react';
import { useAuth } from '../store/authStore';
import tokenService from '../services/tokenService';

/**
 * Custom hook to initialize token refresh when the app starts
 * and the user is authenticated
 */
const useTokenRefresh = () => {
  const { isAuthenticated, refreshUserData } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      // Initialize token refresh mechanism
      tokenService.initTokenRefresh();
      
      // Refresh user data once on app initialization
      refreshUserData().catch(err => {
        console.error('Initial user data refresh failed:', err);
      });
    }
  }, [isAuthenticated, refreshUserData]);
};

export default useTokenRefresh; 
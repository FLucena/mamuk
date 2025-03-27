import api from './api';
import authService from './authService';

// Constants
const TOKEN_KEY = 'mamuk_token';
const REFRESH_TOKEN_KEY = 'mamuk_refresh_token';
const TOKEN_EXPIRY_KEY = 'mamuk_token_expiry';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Token service to handle JWT token lifecycle
 */
const tokenService = {
  /**
   * Get the JWT token from localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set the JWT token in localStorage with expiry time
   */
  setToken: (token: string, expiresIn?: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    
    // Calculate expiry time if expiresIn is provided (e.g. '7d', '24h', '60m')
    if (expiresIn) {
      const expiryDate = calculateExpiryDate(expiresIn);
      if (expiryDate) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
      }
    }
  },

  /**
   * Set refresh token in localStorage
   */
  setRefreshToken: (refreshToken: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Remove all tokens from localStorage
   */
  removeTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  /**
   * Check if the token is expired or about to expire
   */
  isTokenExpiringSoon: (): boolean => {
    const expiryString = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryString) return false;

    try {
      const expiry = new Date(expiryString).getTime();
      const now = new Date().getTime();
      
      // Check if token expires within the threshold
      return expiry - now < TOKEN_REFRESH_THRESHOLD;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  },

  /**
   * Refresh the auth token
   */
  refreshToken: async (): Promise<boolean> => {
    const refreshToken = tokenService.getRefreshToken();
    
    if (!refreshToken) {
      console.error('No refresh token available');
      return false;
    }
    
    try {
      const response = await api.post('/users/refresh-token', { refreshToken });
      
      if (response.data.token) {
        tokenService.setToken(response.data.token, response.data.expiresIn);
        
        if (response.data.refreshToken) {
          tokenService.setRefreshToken(response.data.refreshToken);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      
      // If refresh fails, logout the user
      authService.logout();
      return false;
    }
  },

  /**
   * Initialize token refresh mechanism
   */
  initTokenRefresh: (): void => {
    // Check token expiry every minute
    const interval = setInterval(async () => {
      if (tokenService.isTokenExpiringSoon()) {
        console.log('Token is expiring soon, attempting to refresh');
        await tokenService.refreshToken();
      }
    }, 60000); // 1 minute

    // Clean up interval on window unload
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
    });
  }
};

/**
 * Helper function to calculate expiry date from JWT expiresIn format
 */
function calculateExpiryDate(expiresIn: string): Date | null {
  const now = new Date();
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1), 10);
  
  if (isNaN(value)) {
    console.error('Invalid expiresIn format:', expiresIn);
    return null;
  }
  
  switch (unit) {
    case 'd': // days
      now.setDate(now.getDate() + value);
      break;
    case 'h': // hours
      now.setHours(now.getHours() + value);
      break;
    case 'm': // minutes
      now.setMinutes(now.getMinutes() + value);
      break;
    case 's': // seconds
      now.setSeconds(now.getSeconds() + value);
      break;
    default:
      console.error('Unknown time unit:', unit);
      return null;
  }
  
  return now;
}

export default tokenService; 
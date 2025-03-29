import axios from 'axios';
import tokenService from '../services/tokenService';

// Determine the base URL based on environment
const getBaseUrl = () => {
  if (typeof window === 'undefined') return ''; // Server-side
  
  // For local development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  
  // In production, use the current hostname
  return window.location.origin;
};

// Create an axios instance with the appropriate base URL
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (Unauthorized) and not from auth routes, try to refresh token
    if (
      error.response && 
      error.response.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url.includes('/login') && 
      !originalRequest.url.includes('/register') &&
      !originalRequest.url.includes('/refresh-token')
    ) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshSuccess = await tokenService.refreshToken();
        
        if (refreshSuccess) {
          // Update the auth header with the new token
          const newToken = tokenService.getToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request with the new token
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // If we get here, refresh failed or was not attempted
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?returnUrl=${returnUrl}`;
    }
    
    return Promise.reject(error);
  }
);

// Google authentication service
export const authService = {
  // Verify Google ID token
  verifyGoogleToken: async (idToken: string) => {
    try {
      const response = await api.post('/api/auth/google/verify', { token: idToken });
      return response.data;
    } catch (error) {
      console.error('Google authentication error:', error);
      throw error;
    }
  },
  
  // Google callback handler
  handleGoogleCallback: async (token: string) => {
    try {
      const response = await api.post('/api/auth/google/callback', { token });
      return response.data;
    } catch (error) {
      console.error('Google callback error:', error);
      throw error;
    }
  },
  
  // Log out
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default api; 
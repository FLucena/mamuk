import axios from 'axios';
import tokenService from './tokenService';

// Set base API URL
const baseURL = import.meta.env.VITE_API_URL || 'https://localhost:5000/api';

// Create Axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    
    // Check if token is expiring soon and refresh if needed
    if (tokenService.isTokenExpiringSoon()) {
      try {
        await tokenService.refreshToken();
      } catch (error) {
        console.error('Token refresh failed in request interceptor:', error);
      }
    }
    
    // Get the token (which might be the refreshed one)
    const token = tokenService.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token available for request to:', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
      // Redirect to login page
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
    }
    
    return Promise.reject(error);
  }
);

export default api; 
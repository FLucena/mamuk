import axios from 'axios';

// Determine the base URL based on environment
const getBaseUrl = () => {
  if (typeof window === 'undefined') return ''; // Server-side
  
  // For local development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  
  // In production, use the current hostname (Vercel)
  return '';
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

// User service
export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
};

export default api; 
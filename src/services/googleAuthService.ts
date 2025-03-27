import api from './api';
import tokenService from './tokenService';
import { UserData } from './authService';
import { useAuth, User, UserRole } from '../store/authStore';

export const googleAuthService = {
  // Process Google sign-in token
  handleGoogleSignIn: async (googleToken: string): Promise<UserData> => {
    
    try {
      // Send the token to our backend - removing /api prefix as api service likely already has it
      const apiUrl = '/auth/google/callback';
      
      const response = await api.post(apiUrl, { token: googleToken });
      const userData = response.data;
      
      if (!userData || !userData.token) {
        throw new Error('Invalid authentication response from server');
      }
      
      // Store the token
      tokenService.setToken(userData.token, userData.expiresIn);
        
      // Store user data in localStorage (including the token for convenience)
      localStorage.setItem('mamuk_user', JSON.stringify(userData));
      
      // Update the authentication state in the Zustand store
      // We need to get the store actions directly since we're outside a React component
      const actions = {
        setAuthenticated: (userData: UserData, token: string) => {
          // Convert role to UserRole type if needed
          const role = userData.role as UserRole;
          
          // Create a User object from UserData
          const user: User = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: role,
            profilePicture: userData.profilePicture,
            // Copy other relevant fields
            ...(userData as Partial<User>)
          };
          
          useAuth.setState({ 
            isAuthenticated: true, 
            user, 
            token,
            isLoading: false
          });
        }
      };
      
      // Set the authenticated state
      actions.setAuthenticated(userData, userData.token);
      
      return userData;
    } catch (error) {
      console.error('Google authentication error:', error);
      throw error;
    }
  }
};

export default googleAuthService; 
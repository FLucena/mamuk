import * as userController from './userController';

// Re-export the authentication-related functions from userController
export const registerUser = userController.registerUser;
export const loginUser = userController.loginUser;
export const getCurrentUser = userController.getUserProfile;
export const updateUserProfile = userController.updateUserProfile; 
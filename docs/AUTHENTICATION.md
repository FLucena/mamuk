# Authentication Flow Documentation

## Overview

This document explains the authentication flow in the Mamuk application, which uses NextAuth.js for authentication and implements role-based access control.

## Authentication Process

1. **Sign In**:
   - Users sign in using Google OAuth via NextAuth.js
   - After successful authentication, users are redirected to the appropriate page based on their role:
     - Coaches are redirected to `/coach`
     - Regular users are redirected to `/workout`

2. **Session Management**:
   - NextAuth.js creates and manages the user session
   - Session information is stored in cookies
   - The session includes user details and roles

3. **Route Protection**:
   - Protected routes are guarded by the `RouteGuard` component
   - The `useAuthRedirect` hook is used to redirect unauthenticated users
   - Role-based access is enforced through the `checkRouteAccess` function

## Role-Based Access Control

The application implements role-based access control with the following roles:

- **customer**: Regular users who can view and manage their own workouts
- **coach**: Users who can create workouts and assign them to customers
- **admin**: Users with full access to all features

Access to routes is defined in the `ROUTE_ACCESS` array in `src/utils/authNavigation.ts`.

## Authentication Components

### RouteGuard

The `RouteGuard` component wraps protected pages and:
- Checks if the user is authenticated
- Verifies if the user has the required roles for the route
- Redirects unauthorized users to the appropriate page
- Shows a loading spinner while checking authentication

### useAuthRedirect Hook

The `useAuthRedirect` hook:
- Handles authentication redirects consistently across the application
- Redirects unauthenticated users to the sign-in page
- Can redirect authenticated users to a specific page if needed
- Checks if the user has the required roles

## Workouts Page Authentication

The workouts page (`/workout`) is a protected route that:
1. Uses `useAuthRedirect` to ensure only authenticated users can access it
2. Fetches the user's workouts based on their session
3. Displays different UI elements based on the user's roles:
   - Regular users see their workouts and have a limit of 3 personal workouts
   - Coaches and admins can see all workouts and have no limit
   - Coaches have additional functionality to assign workouts to users

## Debugging Authentication Issues

If you encounter authentication issues:

1. Check if you're properly signed in:
   - Look for the profile picture/initial in the navigation bar
   - Verify that you can access protected routes

2. If you're having issues:
   - Use the debug script in `scripts/debug-auth.js`
   - Check browser console for errors
   - Verify that cookies are enabled in your browser
   - Try clearing your browser cache and cookies

3. For role-based access issues:
   - Verify your user roles in the database
   - Check if the route requires specific roles that you don't have

## Testing Authentication

Refer to the `docs/MANUAL_TESTS.md` file for detailed test procedures to verify the authentication flow. 
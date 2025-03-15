/**
 * Manual Authentication Workflow Test
 * 
 * This script provides functions to manually test the authentication flow
 * in the browser console. It checks if the authentication is working correctly
 * and if authenticated users can access the workouts page.
 * 
 * Usage:
 * 1. Open your browser's developer console
 * 2. Copy and paste this entire script
 * 3. Run the tests using the provided functions
 */

// Global object to store test results
const AuthTests = {
  results: {},
  
  // Test if the user is currently authenticated
  async checkAuthentication() {
    console.group('🔐 Authentication Test');
    
    try {
      // Check for Next-Auth session cookie
      const cookies = document.cookie.split(';').map(cookie => cookie.trim());
      const nextAuthCookie = cookies.find(cookie => cookie.startsWith('next-auth.session-token='));
      
      if (nextAuthCookie) {
        console.log('✅ Next-Auth session cookie found');
        this.results.hasSessionCookie = true;
      } else {
        console.warn('❌ Next-Auth session cookie not found');
        this.results.hasSessionCookie = false;
      }
      
      // Try to fetch the session from the API
      try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        
        if (sessionData && sessionData.user) {
          console.log('✅ Session API returned user data:', sessionData.user);
          this.results.hasSessionAPI = true;
          this.results.user = sessionData.user;
        } else {
          console.warn('❌ Session API did not return user data');
          this.results.hasSessionAPI = false;
        }
      } catch (error) {
        console.error('❌ Error fetching session from API:', error);
        this.results.hasSessionAPI = false;
        this.results.sessionAPIError = error.message;
      }
      
      // Check if we're on a protected page
      const isProtectedPage = window.location.pathname.includes('/workout') || 
                             window.location.pathname.includes('/admin') ||
                             window.location.pathname.includes('/coach');
      
      console.log(`Current page: ${window.location.pathname} (Protected: ${isProtectedPage})`);
      this.results.isProtectedPage = isProtectedPage;
      
      // Overall authentication status
      this.results.isAuthenticated = this.results.hasSessionCookie && this.results.hasSessionAPI;
      console.log(`Overall authentication status: ${this.results.isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}`);
      
      return this.results;
    } catch (error) {
      console.error('Error in authentication test:', error);
      return { error: error.message };
    } finally {
      console.groupEnd();
    }
  },
  
  // Test if the user can access the workouts page
  async testWorkoutsAccess() {
    console.group('🏋️ Workouts Page Access Test');
    
    try {
      // First check authentication
      if (!this.results.isAuthenticated) {
        await this.checkAuthentication();
      }
      
      if (!this.results.isAuthenticated) {
        console.warn('❌ User is not authenticated. Cannot test workouts access.');
        return { canAccessWorkouts: false, reason: 'Not authenticated' };
      }
      
      // If we're already on the workouts page, check for workouts content
      if (window.location.pathname.includes('/workout')) {
        const hasWorkoutsHeading = !!document.querySelector('h1')?.textContent.includes('Rutinas');
        const hasWorkoutsList = !!document.querySelector('[class*="workout"]');
        
        console.log(`Workouts heading found: ${hasWorkoutsHeading ? '✅' : '❌'}`);
        console.log(`Workouts list found: ${hasWorkoutsList ? '✅' : '❌'}`);
        
        this.results.canAccessWorkouts = hasWorkoutsHeading;
        this.results.hasWorkoutContent = hasWorkoutsList;
        
        return {
          canAccessWorkouts: this.results.canAccessWorkouts,
          hasWorkoutContent: this.results.hasWorkoutContent
        };
      } else {
        // If we're not on the workouts page, suggest navigating there
        console.log('Not currently on the workouts page. Navigate to /workout to test access.');
        return { action: 'Navigate to /workout to test access' };
      }
    } catch (error) {
      console.error('Error in workouts access test:', error);
      return { error: error.message };
    } finally {
      console.groupEnd();
    }
  },
  
  // Run all tests
  async runAllTests() {
    console.group('🧪 Running All Authentication Tests');
    
    await this.checkAuthentication();
    const workoutsResult = await this.testWorkoutsAccess();
    
    console.log('Test Results Summary:');
    console.table({
      'Is Authenticated': this.results.isAuthenticated,
      'Has Session Cookie': this.results.hasSessionCookie,
      'Has Session API': this.results.hasSessionAPI,
      'Is On Protected Page': this.results.isProtectedPage,
      'Can Access Workouts': workoutsResult.canAccessWorkouts,
      'Has Workout Content': workoutsResult.hasWorkoutContent
    });
    
    console.groupEnd();
    return this.results;
  }
};

// Run the tests automatically if we're on a relevant page
if (window.location.pathname.includes('/workout') || 
    window.location.pathname.includes('/auth') ||
    window.location.pathname.includes('/admin')) {
  console.log('🧪 Automatically running authentication tests for current page...');
  AuthTests.runAllTests();
} else {
  console.log('🧪 Authentication test functions available. Run AuthTests.runAllTests() to test authentication.');
}

// Return the AuthTests object so it can be used in the console
AuthTests; 
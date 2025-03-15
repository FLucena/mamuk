# Authentication Testing Tools

This directory contains tools for testing the authentication flow in the Mamuk application.

## Manual Testing

### Using the Test Dashboard

1. Start your development server:
   ```
   npm run dev
   ```

2. Navigate to the test dashboard:
   ```
   http://localhost:3000/tests/auth-test.html
   ```

3. Follow the instructions on the dashboard to test authentication:
   - Click "Go to Sign In" to sign in to your account
   - Return to the test dashboard
   - Click "Run All Tests" to check your authentication status
   - Use the navigation buttons to test access to different pages

### Using the Console Script

You can also use the authentication test script directly in your browser console:

1. Open your browser's developer console (F12 or right-click > Inspect > Console)
2. Copy the contents of `auth-workflow-manual.js`
3. Paste it into the console and press Enter
4. Run the tests using the provided functions:
   ```javascript
   // Check if you're authenticated
   AuthTests.checkAuthentication();
   
   // Test if you can access the workouts page
   AuthTests.testWorkoutsAccess();
   
   // Run all tests
   AuthTests.runAllTests();
   ```

## Automated Testing

The `auth-workflow.test.js` file contains automated tests using Playwright. These tests verify:

1. Unauthenticated users are redirected to the sign-in page when trying to access protected routes
2. Authenticated users can access the workouts page after signing in
3. Admin users can access the admin page
4. Regular users cannot access the admin page

To run the automated tests:

```
npx playwright test
```

Note: The automated tests require a running development server and may need to be modified based on your environment.

## Troubleshooting

If you encounter issues with the tests:

1. Make sure your development server is running
2. Check that you have the correct environment variables set
3. Verify that your authentication provider (Google OAuth) is properly configured
4. Check the browser console for any errors
5. Try clearing your browser cookies and cache

For JWT-related errors, you may need to check your NextAuth.js configuration and ensure that the JWT secret is properly set. 
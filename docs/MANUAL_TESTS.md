# Manual Testing Guide

## Authentication Flow Tests

### Test 1: Verify Unauthenticated Access Restrictions

**Objective**: Ensure that unauthenticated users are redirected to the sign-in page when trying to access protected routes.

**Steps**:
1. Open a new incognito/private browser window to ensure you're not logged in
2. Navigate directly to `https://www.mamuk.com.ar/workout`
3. Observe the redirection

**Expected Result**: 
- You should be automatically redirected to the sign-in page (`/auth/signin`)
- The sign-in page should display "Iniciar Sesión" and a Google sign-in button

### Test 2: Verify Authentication and Access to Workouts Page

**Objective**: Ensure that users can sign in and access the workouts page.

**Steps**:
1. Open a new incognito/private browser window
2. Navigate to the homepage `https://www.mamuk.com.ar/`
3. Click on the "Iniciar Sesión" button
4. Sign in with your Google account
5. Observe the redirection after successful authentication

**Expected Result**:
- After successful authentication, you should be redirected to the workouts page (`/workout`)
- The workouts page should display "Rutinas" as the heading
- Your workouts should be listed (if you have any)
- The navigation bar should show your profile picture or initial

### Test 3: Verify Role-Based Access Controls

**Objective**: Ensure that role-based access controls are properly enforced.

**Steps**:
1. While logged in as a regular user (customer role only):
   - Try to access the admin page: `https://www.mamuk.com.ar/admin`
   - Observe the redirection
2. If you have an admin account:
   - Log out and log in with your admin account
   - Navigate to the admin page: `https://www.mamuk.com.ar/admin`
   - Observe the access

**Expected Results**:
- Regular users should be redirected to the unauthorized page when trying to access the admin page
- Admin users should be able to access the admin page and see the admin dashboard

### Test 4: Verify Session Persistence

**Objective**: Ensure that authentication sessions persist across page reloads and navigation.

**Steps**:
1. Sign in to the application
2. Navigate to the workouts page
3. Refresh the page
4. Navigate to another page and then back to the workouts page

**Expected Result**:
- Your session should persist across page reloads and navigation
- You should not be asked to sign in again
- You should maintain access to protected routes

### Test 5: Verify Sign Out Functionality

**Objective**: Ensure that users can sign out and lose access to protected routes.

**Steps**:
1. Sign in to the application
2. Click on your profile picture/initial in the navigation bar
3. Click on "Cerrar sesión"
4. Try to access the workouts page directly: `https://www.mamuk.com.ar/workout`

**Expected Result**:
- You should be successfully signed out
- When trying to access the workouts page, you should be redirected to the sign-in page

## Detailed Workouts Page Authentication Test

### Test 6: Verify Complete Workouts Page Functionality for Authenticated Users

**Objective**: Ensure that authenticated users can see and interact with all elements of the workouts page.

**Prerequisites**:
- A valid user account with the 'customer' role
- At least one workout assigned to the user (if possible)

**Steps**:

1. **Sign In Process**:
   - Open a new incognito/private browser window
   - Navigate to `https://www.mamuk.com.ar/auth/signin`
   - Sign in with your Google account
   - Verify you are redirected to the workouts page (`/workout`)

2. **Verify Page Elements**:
   - Confirm the page title shows "Rutinas"
   - Verify the "Nueva rutina" button is visible (if you haven't reached your limit)
   - Check if your workout count is displayed (e.g., "Rutinas personales: 1/3")
   - Verify the "Refrescar" button is visible and functional

3. **Verify Workout List**:
   - If you have workouts, confirm they are displayed in the list
   - Each workout card should show:
     - Workout name
     - Description (if available)
     - Number of days and exercises
     - Action buttons (View, Edit, Duplicate, Delete)

4. **Test Workout Actions** (if workouts are available):
   - Click the "View" button on a workout and verify it opens the workout details page
   - Navigate back to the workouts list
   - Test the "Duplicate" button:
     - Click it and verify the duplicate modal appears
     - Enter a new name and description
     - Submit and verify a new workout appears in the list
   - Test the "Edit" button and verify it navigates to the workout edit page

5. **Test Refresh Functionality**:
   - Click the "Refrescar" button
   - Verify the spinner animation appears during refresh
   - Confirm the success toast message appears after refresh

6. **Test Workout Limit** (for regular customers):
   - If you have fewer than 3 workouts:
     - Verify you can create a new workout
   - If you have 3 workouts:
     - Verify the warning message about reaching the limit is displayed
     - Verify you cannot create additional workouts

**Expected Results**:
- All page elements should be visible and functional
- Workouts should be displayed correctly with all action buttons
- The refresh functionality should work properly
- Workout limits should be enforced for regular customers
- All interactions should be smooth without errors

### Test 7: Verify Coach-Specific Functionality

**Objective**: Ensure that users with the 'coach' role have access to additional functionality.

**Prerequisites**:
- A valid user account with the 'coach' role

**Steps**:
1. Sign in with a coach account
2. Navigate to the workouts page
3. Verify that the "Asignar" (Assign) button is visible on workout cards
4. Test the assign functionality:
   - Click the "Asignar" button on a workout
   - Verify the assign modal appears
   - Select users to assign the workout to
   - Submit and verify the success message

**Expected Results**:
- Coach users should see the "Asignar" button on workout cards
- The assign functionality should work properly
- Coaches should not have workout limits

## Troubleshooting Common Issues

### Issue: Not Redirected After Sign In

If you're not redirected to the workouts page after signing in:

1. Check the browser console for any errors
2. Verify that cookies are enabled in your browser
3. Try clearing your browser cache and cookies
4. Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)

### Issue: Unexpected Access Denied

If you're unexpectedly denied access to a page you should have access to:

1. Sign out and sign in again
2. Check your user roles in the profile dropdown
3. Contact an administrator if you believe your account should have different permissions

### Issue: Session Expires Too Quickly

If your session expires unexpectedly:

1. Check if you have privacy settings or extensions that might be clearing cookies
2. Ensure your device's date and time are set correctly
3. Try using a different browser 
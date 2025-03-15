/**
 * Authentication Workflow Test
 * 
 * This script tests the authentication flow to ensure that:
 * 1. Unauthenticated users are redirected to the sign-in page when trying to access protected routes
 * 2. Authenticated users can access the workouts page after signing in
 * 3. The correct role-based access controls are applied
 */

// Import required libraries
const { test, expect } = require('@playwright/test');

test.describe('Authentication Workflow', () => {
  test('Unauthenticated user is redirected to sign-in page when accessing workouts', async ({ page }) => {
    // Navigate to the workouts page without authentication
    await page.goto('/workout');
    
    // Wait for redirect to complete
    await page.waitForURL(/.*\/auth\/signin.*/);
    
    // Verify we're on the sign-in page
    expect(page.url()).toContain('/auth/signin');
    
    // Verify sign-in page content
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
    await expect(page.getByText('Continuar con Google')).toBeVisible();
  });
  
  test('Authenticated user can access workouts page after sign-in', async ({ page, context }) => {
    // Mock the authentication
    // Note: In a real test, you would use a proper authentication method
    // This is a simplified version for demonstration purposes
    
    // 1. Set up authentication cookies
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      }
    ]);
    
    // 2. Mock the session response
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'Test User',
            email: 'test@example.com',
            image: null,
            roles: ['customer'],
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });
    
    // Navigate to the workouts page
    await page.goto('/workout');
    
    // Verify we're on the workouts page
    await expect(page.url()).toContain('/workout');
    
    // Verify workouts page content
    await expect(page.getByRole('heading', { name: 'Rutinas' })).toBeVisible();
  });
  
  test('Admin user can access admin page', async ({ page, context }) => {
    // Mock admin authentication
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-admin-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      }
    ]);
    
    // Mock the session response for admin
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'Admin User',
            email: 'admin@example.com',
            image: null,
            roles: ['admin', 'customer'],
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });
    
    // Navigate to the admin page
    await page.goto('/admin');
    
    // Verify we're on the admin page
    await expect(page.url()).toContain('/admin');
    
    // Verify admin page content
    await expect(page.getByText(/Panel de Administración|Admin Dashboard/)).toBeVisible();
  });
  
  test('Regular user cannot access admin page', async ({ page, context }) => {
    // Mock regular user authentication
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-user-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      }
    ]);
    
    // Mock the session response for regular user
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'Regular User',
            email: 'user@example.com',
            image: null,
            roles: ['customer'],
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });
    
    // Navigate to the admin page
    await page.goto('/admin');
    
    // Wait for redirect to complete
    await page.waitForURL(/.*\/unauthorized.*/);
    
    // Verify we're redirected to unauthorized page
    expect(page.url()).toContain('/unauthorized');
  });
}); 
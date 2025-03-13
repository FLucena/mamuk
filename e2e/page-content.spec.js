import { test, expect } from '@playwright/test';
import { checkPageContent, checkAuthenticatedPageContent } from '../__tests__/utils/page-content-checker';

// List of public pages that don't require authentication
const publicPages = [
  { path: '/', title: 'Mamuk', heading: 'Mamuk' },
  { path: '/about', title: 'About', heading: 'About' },
  { path: '/blog', title: 'Blog', heading: 'Blog' },
  { path: '/contact', title: 'Contact', heading: 'Contact' },
  { path: '/features', title: 'Features', heading: 'Features' },
  { path: '/guides', title: 'Guides', heading: 'Guides' },
  { path: '/help-center', title: 'Help Center', heading: 'Help Center' },
  { path: '/pricing', title: 'Pricing', heading: 'Pricing' },
  { path: '/privacy', title: 'Privacy Policy', heading: 'Privacy' },
  { path: '/support', title: 'Support', heading: 'Support' },
  { path: '/terms', title: 'Terms of Service', heading: 'Terms' },
  { path: '/ejercicios', title: 'Ejercicios', heading: 'Ejercicios' },
  { path: '/auth/signin', title: 'Sign In', heading: 'Sign In' },
];

// List of authenticated pages that require login
const authenticatedPages = [
  { path: '/workout', title: 'Workouts', heading: 'Workouts' },
  { path: '/workout/new', title: 'New Workout', heading: 'New Workout' },
  { path: '/workout/archived', title: 'Archived Workouts', heading: 'Archived' },
  { path: '/achievements', title: 'Achievements', heading: 'Achievements' },
  { path: '/coach', title: 'Coach Dashboard', heading: 'Coach' },
  { path: '/coach/customers', title: 'Customers', heading: 'Customers' },
  { path: '/admin', title: 'Admin Dashboard', heading: 'Admin' },
];

test.describe('Page Content Tests', () => {
  test.describe('Public Pages', () => {
    // Test each public page
    for (const page of publicPages) {
      test(`${page.path} should have content`, async ({ page: browserPage }) => {
        const result = await checkPageContent(browserPage, page.path, {
          title: page.title,
          heading: page.heading,
          minContentLength: 100
        });
        
        expect(result).toBe(true);
      });
    }
  });
  
  test.describe('Authenticated Pages', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/auth/signin');
      await page.fill('[name="email"]', 'test@example.com');
      await page.fill('[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for login to complete
      await page.waitForURL('/workout');
    });
    
    // Test each authenticated page
    for (const page of authenticatedPages) {
      test(`${page.path} should have content`, async ({ page: browserPage }) => {
        const result = await checkAuthenticatedPageContent(browserPage, page.path, {
          title: page.title,
          heading: page.heading,
          minContentLength: 100
        });
        
        expect(result).toBe(true);
      });
    }
  });
  
  // Test error pages
  test.describe('Error Pages', () => {
    test('404 page should have content', async ({ page }) => {
      const result = await checkPageContent(page, '/this-page-does-not-exist', {
        minContentLength: 50,
        checkNavigation: false,
        screenshotPath: './test-results/screenshots/404-page.png'
      });
      
      expect(result).toBe(true);
      
      // Check for "not found" message
      const pageContent = await page.textContent('body');
      expect(pageContent.toLowerCase()).toContain('not found');
    });
    
    test('Unauthorized page should have content', async ({ page }) => {
      const result = await checkPageContent(page, '/unauthorized', {
        minContentLength: 50,
        screenshotPath: './test-results/screenshots/unauthorized-page.png'
      });
      
      expect(result).toBe(true);
      
      // Check for "unauthorized" message
      const pageContent = await page.textContent('body');
      expect(pageContent.toLowerCase()).toContain('unauthorized');
    });
  });
}); 
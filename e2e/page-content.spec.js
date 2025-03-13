import { test, expect } from '@playwright/test';
import { checkPageContentE2E, checkAuthenticatedPageContent } from '../__tests__/utils/page-content-checker';

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

test.describe('Page Content E2E Tests', () => {
  test.describe('Public Pages', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/auth/signin');
      await page.fill('[name="email"]', 'test@example.com');
      await page.fill('[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for login to complete
      await page.waitForURL('/workout');
    });
    
    test.each(publicPages)('Public page %s should have content', async ({ path }) => {
      const result = await checkPageContentE2E(browserPage, path, {
        checkHeading: true,
        checkContent: true,
      });
      expect(result.hasHeading).toBe(true);
      expect(result.hasContent).toBe(true);
    });
  });
  
  test.describe('Authenticated Pages', () => {
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
  test('404 page should have content', async ({ page }) => {
    const result = await checkPageContentE2E(page, '/this-page-does-not-exist', {
      checkHeading: true,
      checkContent: true,
    });
    expect(result.hasHeading).toBe(true);
    expect(result.hasContent).toBe(true);
  });
  
  test('Unauthorized page should have content', async ({ page }) => {
    const result = await checkPageContentE2E(page, '/unauthorized', {
      checkHeading: true,
      checkContent: true,
    });
    expect(result.hasHeading).toBe(true);
    expect(result.hasContent).toBe(true);
  });
}); 
const puppeteer = require('puppeteer');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.mamuk.com.ar'
  : 'http://localhost:3000';

const SCREENSHOTS = [
  {
    name: 'desktop-home.png',
    path: '/screenshot/desktop/home',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'desktop-workout.png',
    path: '/screenshot/desktop/workout',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'mobile-home.png',
    path: '/screenshot/mobile/home',
    viewport: { width: 750, height: 1334 }
  },
  {
    name: 'mobile-workout.png',
    path: '/screenshot/mobile/workout',
    viewport: { width: 750, height: 1334 }
  }
];

async function waitForNextjsHydration(page) {
  try {
    // Wait for Next.js hydration to complete
    await page.waitForFunction(() => {
      return !document.documentElement.classList.contains('__next-hydration');
    }, { timeout: 10000 });
  } catch (error) {
    console.warn('Warning: Could not detect Next.js hydration completion');
  }
}

async function takeScreenshots() {
  console.log('🎥 Taking screenshots...');
  console.log(`Base URL: ${BASE_URL}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set a longer timeout for navigation
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);
    
    // Enable better error logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', err => console.error('Browser page error:', err));
    
    // Set user agent to avoid mobile layouts
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');
    
    // Login if needed
    if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
      console.log('🔐 Logging in...');
      await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle0' });
      await page.type('input[type="email"]', process.env.TEST_EMAIL);
      await page.type('input[type="password"]', process.env.TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      console.log('✅ Logged in successfully');
    }
    
    // Take each screenshot
    for (const screenshot of SCREENSHOTS) {
      console.log(`\n📸 Taking screenshot: ${screenshot.name}`);
      console.log(`URL: ${BASE_URL}${screenshot.path}`);
      
      // Set viewport
      await page.setViewport(screenshot.viewport);
      console.log(`Viewport set: ${screenshot.viewport.width}x${screenshot.viewport.height}`);
      
      // Navigate to page
      await page.goto(`${BASE_URL}${screenshot.path}`, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });
      console.log('Page loaded');
      
      // Wait for hydration
      await waitForNextjsHydration(page);
      
      // Wait for helper to be ready
      try {
        await page.waitForSelector('[data-testid="screenshot-helper"]', { timeout: 10000 });
        console.log('Screenshot helper found');
      } catch (error) {
        console.error('Could not find screenshot helper:', error);
        // Take screenshot anyway
        console.log('Taking screenshot without helper...');
      }
      
      // Wait a bit for any animations to complete
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, screenshot.name),
        fullPage: false
      });
      
      console.log(`✅ Saved ${screenshot.name}`);
    }
  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
    
    // Try to get more context about the error
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.error('Is the development server running on port 3000?');
    }
    
    process.exit(1);
  } finally {
    await browser.close();
  }
  
  console.log('\n✨ All screenshots taken successfully!');
}

// Run if called directly
if (require.main === module) {
  takeScreenshots();
}

module.exports = takeScreenshots; 
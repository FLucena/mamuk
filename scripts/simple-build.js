/**
 * Simple build script that skips source maps and other optimizations
 * Use this if the regular build process is failing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting simple build process...');

// Clean previous build (skip if there are permission issues)
try {
  console.log('🧹 Attempting to clean previous build...');
  
  // Try to clean only specific directories that are safe to remove
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    try {
      // Try to remove specific subdirectories that are less likely to have permission issues
      const safeDirs = ['static', 'server', 'cache'];
      
      for (const dir of safeDirs) {
        const dirPath = path.join(nextDir, dir);
        if (fs.existsSync(dirPath)) {
          console.log(`Cleaning ${dir} directory...`);
          execSync(`npx rimraf "${dirPath}"`, { stdio: 'inherit' });
        }
      }
      
      console.log('✅ Partial clean complete');
    } catch (innerError) {
      console.warn(`⚠️ Could not clean some directories: ${innerError.message}`);
      console.log('Continuing with build anyway...');
    }
  }
} catch (error) {
  console.warn(`⚠️ Could not clean build directory: ${error.message}`);
  console.log('Continuing with build anyway...');
}

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Disable experimental features
process.env.NEXT_DISABLE_MEMORY_WORKERS = 'true';
process.env.NEXT_DISABLE_OPTIMIZE_CSS = 'true';

// Run the build with a timeout
try {
  console.log('🏗️ Running simple build...');
  
  // Set a timeout for the build process (15 minutes)
  const buildTimeout = setTimeout(() => {
    console.error('⏱️ Build timed out after 15 minutes');
    process.exit(1);
  }, 15 * 60 * 1000);
  
  execSync('npx next build --no-lint', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  // Clear the timeout if build completes
  clearTimeout(buildTimeout);
  
  console.log('✅ Build complete');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('🎉 Simple build process completed successfully!'); 
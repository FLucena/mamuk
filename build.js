/**
 * Custom build script with optimizations
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const ENABLE_SOURCEMAPS = true;
const ENABLE_IMAGE_OPTIMIZATION = true;
const ENABLE_LINT = true;
const DEBUG_MODE = true;
const TIMEOUT_MINUTES = 10; // Set a timeout for the build process

console.log('🚀 Starting optimized build process...');

// Clean previous build
try {
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('.next')) {
    execSync('rimraf .next', { stdio: 'inherit' });
  }
  if (fs.existsSync('node_modules/.cache')) {
    execSync('rimraf node_modules/.cache', { stdio: 'inherit' });
  }
  console.log('✅ Clean complete');
} catch (error) {
  console.error('❌ Error cleaning previous build:', error);
}

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Disable experimental features that might cause issues
process.env.NEXT_DISABLE_MEMORY_WORKERS = 'true';
process.env.NEXT_DISABLE_OPTIMIZE_CSS = 'true';

// Build command
let buildCommand = 'next build';

if (!ENABLE_LINT) {
  buildCommand += ' --no-lint';
}

if (DEBUG_MODE) {
  buildCommand += ' --debug';
}

// Run the build with a timeout
console.log(`🏗️ Running build: ${buildCommand}`);
console.log('Build started at:', new Date().toISOString());

const runBuildWithTimeout = () => {
  return new Promise((resolve, reject) => {
    const buildProcess = spawn('npx', buildCommand.split(' '), {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });

    // Set a timeout
    const timeoutMs = TIMEOUT_MINUTES * 60 * 1000;
    const timeout = setTimeout(() => {
      console.error(`⏱️ Build timed out after ${TIMEOUT_MINUTES} minutes`);
      buildProcess.kill('SIGTERM');
      reject(new Error('Build timed out'));
    }, timeoutMs);

    buildProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        console.log('✅ Build complete');
        resolve();
      } else {
        console.error(`❌ Build failed with code ${code}`);
        reject(new Error(`Build failed with code ${code}`));
      }
    });

    buildProcess.on('error', (err) => {
      clearTimeout(timeout);
      console.error('❌ Build process error:', err);
      reject(err);
    });
  });
};

// Main execution
(async () => {
  try {
    await runBuildWithTimeout();

    // Generate source maps if enabled
    if (ENABLE_SOURCEMAPS) {
      try {
        console.log('🗺️ Generating source maps...');
        execSync('node scripts/generate-source-maps.js', { stdio: 'inherit' });
        console.log('✅ Source maps generated');
      } catch (error) {
        console.error('❌ Error generating source maps:', error);
      }
    }

    // Optimize images if enabled
    if (ENABLE_IMAGE_OPTIMIZATION) {
      try {
        console.log('🖼️ Optimizing images...');
        execSync('node scripts/optimize-images.js', { stdio: 'inherit' });
        console.log('✅ Images optimized');
      } catch (error) {
        console.error('❌ Error optimizing images:', error);
      }
    }

    // Print build stats
    try {
      console.log('📊 Build statistics:');
      
      // Check .next directory size
      const nextDir = path.join(process.cwd(), '.next');
      const getDirectorySize = (dir) => {
        let size = 0;
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const file of files) {
          const filePath = path.join(dir, file.name);
          
          if (file.isDirectory()) {
            size += getDirectorySize(filePath);
          } else {
            size += fs.statSync(filePath).size;
          }
        }
        
        return size;
      };
      
      const nextDirSize = getDirectorySize(nextDir);
      console.log(`- Build size: ${(nextDirSize / (1024 * 1024)).toFixed(2)} MB`);
      
      // Check if build is standalone
      const isStandalone = fs.existsSync(path.join(nextDir, 'standalone'));
      console.log(`- Standalone build: ${isStandalone ? 'Yes' : 'No'}`);
      
      console.log('✅ Build statistics complete');
    } catch (error) {
      console.error('❌ Error getting build statistics:', error);
    }

    console.log('🎉 Build process completed successfully!');
    console.log('Build finished at:', new Date().toISOString());
  } catch (error) {
    console.error('❌ Build process failed:', error.message);
    process.exit(1);
  }
})(); 
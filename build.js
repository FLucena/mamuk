const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean the .next directory if it exists
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  console.log('Cleaning .next directory...');
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('.next directory removed successfully');
  } catch (error) {
    console.error('Error removing .next directory:', error);
  }
}

// Set environment variables
process.env.NODE_ENV = 'production';

// Run the build command
console.log('Starting Next.js build...');
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 
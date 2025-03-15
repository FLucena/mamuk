/**
 * Script to backup the current next.config.js and use the minimal config
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = process.cwd();
const nextConfigPath = path.join(rootDir, 'next.config.js');
const minimalConfigPath = path.join(rootDir, 'scripts', 'minimal-next-config.js');
const backupConfigPath = path.join(rootDir, 'next.config.js.backup');

console.log('🔄 Switching to minimal Next.js configuration...');

// Check if minimal config exists
if (!fs.existsSync(minimalConfigPath)) {
  console.error('❌ Minimal config not found at:', minimalConfigPath);
  process.exit(1);
}

// Backup current config if it exists
if (fs.existsSync(nextConfigPath)) {
  try {
    console.log('📦 Backing up current next.config.js...');
    fs.copyFileSync(nextConfigPath, backupConfigPath);
    console.log('✅ Backup created at:', backupConfigPath);
  } catch (error) {
    console.error('❌ Failed to backup config:', error.message);
    process.exit(1);
  }
}

// Copy minimal config to next.config.js
try {
  console.log('📄 Copying minimal config to next.config.js...');
  fs.copyFileSync(minimalConfigPath, nextConfigPath);
  console.log('✅ Minimal config applied');
} catch (error) {
  console.error('❌ Failed to copy minimal config:', error.message);
  process.exit(1);
}

// Run the simple build
console.log('🏗️ Running build with minimal config...');
try {
  execSync('npm run build:simple', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Restore original config
  if (fs.existsSync(backupConfigPath)) {
    try {
      console.log('🔄 Restoring original next.config.js...');
      fs.copyFileSync(backupConfigPath, nextConfigPath);
      fs.unlinkSync(backupConfigPath);
      console.log('✅ Original config restored');
    } catch (error) {
      console.error('⚠️ Failed to restore original config:', error.message);
      console.log('⚠️ Your original config is backed up at:', backupConfigPath);
    }
  }
}

console.log('🎉 Process completed!'); 
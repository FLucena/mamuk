const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_ICON = path.join(__dirname, '../public/logo.png');
const ICONS_DIR = path.join(__dirname, '../public/icons');
const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');

// Ensure directories exist
[ICONS_DIR, SCREENSHOTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function generateIcons() {
  const sizes = [192, 512];
  
  // Generate regular icons
  for (const size of sizes) {
    await sharp(SOURCE_ICON)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(ICONS_DIR, `icon-${size}.png`));
    
    // Generate maskable icons (with padding for safe area)
    await sharp(SOURCE_ICON)
      .resize(Math.floor(size * 0.8), Math.floor(size * 0.8), {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .extend({
        top: Math.floor(size * 0.1),
        bottom: Math.floor(size * 0.1),
        left: Math.floor(size * 0.1),
        right: Math.floor(size * 0.1),
        background: { r: 79, g: 70, b: 229, alpha: 1 } // Indigo-600 (#4f46e5)
      })
      .png()
      .toFile(path.join(ICONS_DIR, `maskable-${size}.png`));
  }
  
  // Generate shortcut icons
  await sharp(SOURCE_ICON)
    .resize(96, 96, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(path.join(ICONS_DIR, 'shortcut-dashboard.png'));
  
  await sharp(SOURCE_ICON)
    .resize(96, 96, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(path.join(ICONS_DIR, 'shortcut-workout.png'));
}

async function generatePlaceholderScreenshots() {
  // Desktop screenshots (1920x1080)
  const desktopScreenshots = [
    { name: 'desktop-home.png', text: 'Homescreen' },
    { name: 'desktop-workout.png', text: 'Workout Tracking' }
  ];
  
  for (const screenshot of desktopScreenshots) {
    const width = 1920;
    const height = 1080;
    
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 79, g: 70, b: 229, alpha: 1 }
      }
    })
    .png()
    .toFile(path.join(SCREENSHOTS_DIR, screenshot.name));
  }
  
  // Mobile screenshots (750x1334)
  const mobileScreenshots = [
    { name: 'mobile-home.png', text: 'Mobile Home' },
    { name: 'mobile-workout.png', text: 'Mobile Workout' }
  ];
  
  for (const screenshot of mobileScreenshots) {
    const width = 750;
    const height = 1334;
    
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 79, g: 70, b: 229, alpha: 1 }
      }
    })
    .png()
    .toFile(path.join(SCREENSHOTS_DIR, screenshot.name));
  }
}

async function main() {
  try {
    console.log('🎨 Generating PWA assets...');
    
    await generateIcons();
    console.log('✅ Icons generated successfully');
    
    await generatePlaceholderScreenshots();
    console.log('✅ Placeholder screenshots generated');
    
    console.log('✨ All PWA assets generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Replace placeholder screenshots in public/screenshots/ with real app screenshots');
    console.log('2. Verify icons in public/icons/ look correct');
    console.log('3. Test PWA installation on both desktop and mobile');
  } catch (error) {
    console.error('❌ Error generating PWA assets:', error);
    process.exit(1);
  }
}

main(); 
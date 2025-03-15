/**
 * This script optimizes images in the public directory
 * It converts images to WebP format and compresses them
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const sharp = require('sharp');
const glob = promisify(require('glob'));

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

// Configuration
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];
const QUALITY = 80; // WebP quality (0-100)
const SKIP_EXISTING = true; // Skip if WebP version already exists
const KEEP_ORIGINALS = true; // Keep original images

/**
 * Check if a file is an image based on its extension
 */
function isImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Create directory if it doesn't exist
 */
async function ensureDir(dirPath) {
  try {
    await stat(dirPath);
  } catch (err) {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * Optimize a single image
 */
async function optimizeImage(imagePath) {
  try {
    const ext = path.extname(imagePath).toLowerCase();
    const dir = path.dirname(imagePath);
    const baseName = path.basename(imagePath, ext);
    const webpPath = path.join(dir, `${baseName}.webp`);
    
    // Skip if WebP version already exists and SKIP_EXISTING is true
    if (SKIP_EXISTING) {
      try {
        await stat(webpPath);
        console.log(`Skipping ${imagePath} (WebP already exists)`);
        return { success: true, path: imagePath, skipped: true };
      } catch (err) {
        // WebP doesn't exist, continue
      }
    }
    
    // Process the image with sharp
    await sharp(imagePath)
      .webp({ quality: QUALITY })
      .toFile(webpPath);
    
    // Remove original if KEEP_ORIGINALS is false
    if (!KEEP_ORIGINALS) {
      await promisify(fs.unlink)(imagePath);
    }
    
    console.log(`Optimized ${imagePath} -> ${webpPath}`);
    return { success: true, path: imagePath };
  } catch (err) {
    console.error(`Error optimizing ${imagePath}:`, err);
    return { success: false, path: imagePath, error: err.message };
  }
}

/**
 * Find all images in a directory recursively
 */
async function findImages() {
  try {
    const pattern = path.join(PUBLIC_DIR, '**/*.{jpg,jpeg,png,gif}');
    const images = await glob(pattern, { nocase: true });
    return images;
  } catch (err) {
    console.error('Error finding images:', err);
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  console.time('Image optimization');
  console.log('Optimizing images...');
  
  try {
    // Find all images
    const images = await findImages();
    console.log(`Found ${images.length} images to process`);
    
    if (images.length === 0) {
      console.log('No images found to optimize');
      return;
    }
    
    // Process images in batches to avoid memory issues
    const results = [];
    const batchSize = 10;
    
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(optimizeImage));
      results.push(...batchResults);
      
      // Log progress
      const progress = Math.round(((i + batch.length) / images.length) * 100);
      console.log(`Progress: ${progress}% (${i + batch.length}/${images.length})`);
    }
    
    // Log results
    const successful = results.filter(r => r.success);
    const skipped = results.filter(r => r.success && r.skipped);
    const failed = results.filter(r => !r.success);
    
    console.log(`
Optimization complete:
- Total: ${images.length}
- Optimized: ${successful.length - skipped.length}
- Skipped: ${skipped.length}
- Failed: ${failed.length}
    `);
    
    if (failed.length > 0) {
      console.log('Failed images:');
      failed.forEach(f => console.log(`- ${f.path}: ${f.error}`));
    }
    
    console.timeEnd('Image optimization');
  } catch (err) {
    console.error('Error optimizing images:', err);
    process.exit(1);
  }
}

// Run the script
main(); 
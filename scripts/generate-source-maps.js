/**
 * This script generates source maps for JavaScript files in the .next directory
 * Run this script after building the application to ensure source maps are available
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// Configuration
const BUILD_DIR = path.join(process.cwd(), '.next');
const SOURCE_MAP_COMMENT = '//# sourceMappingURL=';
const BATCH_SIZE = 5; // Process fewer files in batches to avoid memory issues
const EXTENSIONS = ['.js']; // File extensions to process
const IGNORE_PATTERNS = [
  'node_modules',
  'cache',
  'server/chunks',
  'server/font-manifest.json',
  'trace',
  'server/pages',
  'server/app',
  'static/chunks'
];
const MAX_FILES = 100; // Limit the number of files to process to avoid memory issues

/**
 * Check if a file should be ignored based on its path
 */
function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Check if a file is a JavaScript file without a source map
 */
async function needsSourceMap(filePath) {
  try {
    // Check if it's a JavaScript file with the right extension
    if (!EXTENSIONS.some(ext => filePath.endsWith(ext))) {
      return false;
    }

    // Check if we should ignore this file
    if (shouldIgnore(filePath)) {
      return false;
    }

    // Check if source map already exists
    const mapPath = `${filePath}.map`;
    try {
      await stat(mapPath);
      return false; // Source map already exists
    } catch (err) {
      // Map doesn't exist, continue
    }

    // Check if file already has a sourceMappingURL comment
    const content = await readFile(filePath, 'utf8');
    if (content.includes(SOURCE_MAP_COMMENT)) {
      return false; // Already has source map reference
    }

    return true;
  } catch (err) {
    console.error(`Error checking file ${filePath}:`, err);
    return false;
  }
}

/**
 * Generate a basic source map for a JavaScript file
 */
async function generateSourceMap(filePath) {
  try {
    const fileName = path.basename(filePath);
    const mapFileName = `${fileName}.map`;
    
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    
    // Create a simple source map
    const sourceMap = {
      version: 3,
      file: fileName,
      sources: [fileName],
      names: [],
      mappings: '', // Empty mappings for now
      sourceContent: [content]
    };
    
    // Write the source map file
    await writeFile(`${filePath}.map`, JSON.stringify(sourceMap));
    
    // Add sourceMappingURL comment to the original file
    const updatedContent = `${content}\n${SOURCE_MAP_COMMENT}${mapFileName}`;
    await writeFile(filePath, updatedContent);
    
    return true;
  } catch (err) {
    console.error(`Error generating source map for ${filePath}:`, err);
    return false;
  }
}

/**
 * Process files in batches to avoid memory issues
 */
async function processBatch(files) {
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        if (await needsSourceMap(file)) {
          const success = await generateSourceMap(file);
          return { file, success };
        }
        return { file, success: false, reason: 'No source map needed' };
      } catch (error) {
        return { file, success: false, error: error.message };
      }
    })
  );
  
  const successful = results.filter(r => r.success);
  if (successful.length > 0) {
    console.log(`Generated ${successful.length} source maps`);
  }
  
  return results;
}

/**
 * Find all JavaScript files in a directory recursively
 */
async function findJsFiles(dir, fileList = []) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (shouldIgnore(fullPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await findJsFiles(fullPath, fileList);
      } else if (EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
        fileList.push(fullPath);
        
        // Limit the number of files to process
        if (fileList.length >= MAX_FILES) {
          console.log(`Reached maximum file limit (${MAX_FILES}), stopping search`);
          return fileList;
        }
      }
    }
    
    return fileList;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return fileList;
  }
}

/**
 * Main function
 */
async function main() {
  console.time('Source map generation');
  console.log('Generating source maps for JavaScript files...');
  
  try {
    // Check if build directory exists
    try {
      await stat(BUILD_DIR);
    } catch (err) {
      console.error(`Build directory ${BUILD_DIR} not found. Run 'next build' first.`);
      process.exit(1);
    }
    
    // Find all JavaScript files
    console.log('Finding JavaScript files...');
    const allFiles = await findJsFiles(BUILD_DIR);
    console.log(`Found ${allFiles.length} JavaScript files to process`);
    
    if (allFiles.length === 0) {
      console.log('No files to process, exiting');
      return;
    }
    
    // Focus on client-side files first (most important for debugging)
    const clientFiles = allFiles.filter(file => file.includes('static/') || file.includes('client/'));
    console.log(`Processing ${clientFiles.length} client-side files first`);
    
    // Process files in batches
    let processed = 0;
    for (let i = 0; i < clientFiles.length; i += BATCH_SIZE) {
      const batch = clientFiles.slice(i, i + BATCH_SIZE);
      await processBatch(batch);
      processed += batch.length;
      
      // Log progress
      const progress = Math.round((processed / clientFiles.length) * 100);
      console.log(`Progress: ${progress}% (${processed}/${clientFiles.length})`);
    }
    
    console.timeEnd('Source map generation');
    console.log('Source map generation complete!');
  } catch (err) {
    console.error('Error generating source maps:', err);
    process.exit(1);
  }
}

// Run the script
main(); 
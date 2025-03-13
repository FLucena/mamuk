#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

// Create backup directory
const BACKUP_DIR = path.join(process.cwd(), 'console-logs-backup');

// Categories of logs to remove
const PATTERNS_TO_REMOVE = [
  // Page load and navigation logs
  { pattern: /console\.log\(\s*['"`]\[PAGE_LOAD\].*?\);?/g, category: 'Page Load' },
  { pattern: /console\.log\(\s*['"`]\[NAVIGATION\].*?\);?/g, category: 'Navigation' },
  { pattern: /console\.log\(\s*['"`]\[REDIRECT\].*?\);?/g, category: 'Redirect' },
  
  // Render logs
  { pattern: /console\.log\(\s*['"`]\[RENDER\].*?\);?/g, category: 'Render' },
  { pattern: /console\.log\(\s*['"`]\[PERFORMANCE\].*?\);?/g, category: 'Performance' },
  
  // Debug logs
  { pattern: /console\.log\(\s*['"`]\[MANUAL\].*?\);?/g, category: 'Manual Debug' },
  { pattern: /console\.log\(\s*['"`]\[DEBUG\].*?\);?/g, category: 'Debug' },
  { pattern: /console\.log\(\s*['"`]\[INFO\].*?\);?/g, category: 'Info' },
  { pattern: /console\.log\(\s*['"`]Current stats:.*?\);?/g, category: 'Stats' },
  { pattern: /console\.log\(\s*['"`]Render phases:.*?\);?/g, category: 'Render Phases' },
  
  // Form submission logs
  { pattern: /console\.log\(\s*\{\s*name,\s*email,\s*subject,\s*message\s*\}\s*\);?/g, category: 'Form Data' },
  
  // Test page logs
  { pattern: /console\.log\(\s*['"`]Intentando cerrar sesión\.\.\.['"`]\s*\);?/g, category: 'Test' },
  { pattern: /console\.log\(\s*['"`]Sesión cerrada exitosamente['"`]\s*\);?/g, category: 'Test' },
  { pattern: /console\.log\(\s*['"`]Información de sesión:['"`],\s*data\s*\);?/g, category: 'Test' },
  
  // Assignment logs
  { pattern: /console\.log\(\s*['"`]\[Assignment\].*?\);?/g, category: 'Assignment' },
  
  // Service logs
  { pattern: /console\.log\(\s*['"`]Service:.*?\);?/g, category: 'Service' },
  { pattern: /console\.log\(\s*['"`]\[SERVICE\].*?\);?/g, category: 'Service' },
  
  // API route logs
  { pattern: /console\.log\(\s*['"`]\[API\].*?\);?/g, category: 'API' },
];

// Statistics
const stats = {
  filesProcessed: 0,
  filesChanged: 0,
  logsByCategory: {}
};

// Initialize stats
PATTERNS_TO_REMOVE.forEach(({ category }) => {
  if (!stats.logsByCategory[category]) {
    stats.logsByCategory[category] = 0;
  }
});

// Function to check if a file should be processed
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.js', '.jsx', '.ts', '.tsx'].includes(ext) && 
         filePath.includes('src') && 
         !filePath.includes('node_modules');
}

// Function to create backup of a file
async function backupFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  const backupDir = path.dirname(backupPath);
  
  try {
    await mkdir(backupDir, { recursive: true });
    await copyFile(filePath, backupPath);
    return true;
  } catch (error) {
    console.error(`Error backing up ${filePath}:`, error);
    return false;
  }
}

// Function to process a file
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    let newContent = content;
    let changed = false;
    const logMatches = {};
    
    stats.filesProcessed++;
    
    // Apply each pattern
    for (const { pattern, category } of PATTERNS_TO_REMOVE) {
      const matches = newContent.match(pattern);
      if (matches) {
        if (!logMatches[category]) {
          logMatches[category] = 0;
        }
        logMatches[category] += matches.length;
        stats.logsByCategory[category] += matches.length;
        
        newContent = newContent.replace(pattern, '// Removed console.log');
        changed = true;
      }
    }
    
    // Save the file if changes were made
    if (changed) {
      // Create backup first
      await backupFile(filePath);
      
      await writeFile(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
      
      // Log what was removed
      Object.entries(logMatches).forEach(([category, count]) => {
        console.log(`  - Removed ${count} ${category} logs`);
      });
      
      stats.filesChanged++;
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to walk through directories
async function walkDir(dir) {
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      if (entry !== 'node_modules' && entry !== '.git' && entry !== 'console-logs-backup') {
        await walkDir(fullPath);
      }
    } else if (shouldProcessFile(fullPath)) {
      await processFile(fullPath);
    }
  }
}

// Function to print statistics
function printStats() {
  console.log('\nSummary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files changed: ${stats.filesChanged}`);
  console.log('\nLogs removed by category:');
  
  Object.entries(stats.logsByCategory)
    .filter(([_, count]) => count > 0)
    .sort(([_, countA], [__, countB]) => countB - countA)
    .forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}`);
    });
    
  console.log(`\nBackups created in: ${BACKUP_DIR}`);
}

// Main function
async function main() {
  const rootDir = process.cwd();
  console.log(`Starting to remove console.log statements from ${rootDir}`);
  console.log(`Creating backups in ${BACKUP_DIR}`);
  
  try {
    // Create backup directory
    await mkdir(BACKUP_DIR, { recursive: true });
    
    // Process files
    await walkDir(rootDir);
    
    // Print statistics
    printStats();
    
    console.log('\nCompleted successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 
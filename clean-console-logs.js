#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readline = require('readline');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

// Create backup directory
const BACKUP_DIR = path.join(process.cwd(), 'console-logs-backup');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  keepErrors: args.includes('--keep-errors'),
  keepWarnings: args.includes('--keep-warnings'),
  verbose: args.includes('--verbose'),
  help: args.includes('--help') || args.includes('-h'),
  restore: args.includes('--restore'),
  skipConfirm: args.includes('--yes') || args.includes('-y'),
  includePattern: args.find(arg => arg.startsWith('--include='))?.split('=')[1] || 'src',
  excludePattern: args.find(arg => arg.startsWith('--exclude='))?.split('=')[1] || 'node_modules,.git,dist,build'
};

// Help text
const helpText = `
Console Log Cleaner

Usage: node clean-console-logs.js [options]

Options:
  --dry-run         Show what would be removed without making changes
  --keep-errors     Keep console.error statements
  --keep-warnings   Keep console.warn statements
  --verbose         Show more detailed output
  --help, -h        Show this help message
  --restore         Restore files from backup
  --yes, -y         Skip confirmation prompt
  --include=<dir>   Only include files in this directory (default: src)
  --exclude=<dirs>  Exclude these directories, comma-separated (default: node_modules,.git,dist,build)

Examples:
  node clean-console-logs.js                   Remove all console logs
  node clean-console-logs.js --dry-run         Show what would be removed without making changes
  node clean-console-logs.js --keep-errors     Remove all console logs except console.error
  node clean-console-logs.js --restore         Restore files from backup
`;

// Show help and exit if requested
if (options.help) {
  console.log(helpText);
  process.exit(0);
}

// Excluded directories
const excludedDirs = options.excludePattern.split(',');

// Console method patterns
const CONSOLE_METHODS = [
  { method: 'log', pattern: /console\.log\(.*?\);?/g, keep: false },
  { method: 'info', pattern: /console\.info\(.*?\);?/g, keep: false },
  { method: 'debug', pattern: /console\.debug\(.*?\);?/g, keep: false },
  { method: 'warn', pattern: /console\.warn\(.*?\);?/g, keep: options.keepWarnings },
  { method: 'error', pattern: /console\.error\(.*?\);?/g, keep: options.keepErrors },
  { method: 'trace', pattern: /console\.trace\(.*?\);?/g, keep: false },
  { method: 'table', pattern: /console\.table\(.*?\);?/g, keep: false },
  { method: 'count', pattern: /console\.count\(.*?\);?/g, keep: false },
  { method: 'countReset', pattern: /console\.countReset\(.*?\);?/g, keep: false },
  { method: 'group', pattern: /console\.group\(.*?\);?/g, keep: false },
  { method: 'groupCollapsed', pattern: /console\.groupCollapsed\(.*?\);?/g, keep: false },
  { method: 'groupEnd', pattern: /console\.groupEnd\(.*?\);?/g, keep: false },
  { method: 'time', pattern: /console\.time\(.*?\);?/g, keep: false },
  { method: 'timeLog', pattern: /console\.timeLog\(.*?\);?/g, keep: false },
  { method: 'timeEnd', pattern: /console\.timeEnd\(.*?\);?/g, keep: false },
  { method: 'assert', pattern: /console\.assert\(.*?\);?/g, keep: false },
  { method: 'clear', pattern: /console\.clear\(.*?\);?/g, keep: false },
  { method: 'dir', pattern: /console\.dir\(.*?\);?/g, keep: false },
  { method: 'dirxml', pattern: /console\.dirxml\(.*?\);?/g, keep: false },
];

// Statistics
const stats = {
  filesProcessed: 0,
  filesChanged: 0,
  logsByMethod: {}
};

// Initialize stats
CONSOLE_METHODS.forEach(({ method }) => {
  stats.logsByMethod[method] = 0;
});

// Function to check if a file should be processed
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.js', '.jsx', '.ts', '.tsx'].includes(ext) && 
         filePath.includes(options.includePattern) && 
         !excludedDirs.some(dir => filePath.includes(dir));
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

// Function to restore a file from backup
async function restoreFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  
  try {
    if (fs.existsSync(backupPath)) {
      await copyFile(backupPath, filePath);
      console.log(`Restored: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error restoring ${filePath}:`, error);
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
    for (const { method, pattern, keep } of CONSOLE_METHODS) {
      if (keep) continue; // Skip methods that should be kept
      
      const matches = newContent.match(pattern);
      if (matches) {
        if (!logMatches[method]) {
          logMatches[method] = 0;
        }
        logMatches[method] += matches.length;
        stats.logsByMethod[method] += matches.length;
        
        if (!options.dryRun) {
          newContent = newContent.replace(pattern, '// Removed console.' + method);
        }
        changed = true;
      }
    }
    
    // Save the file if changes were made and not in dry run mode
    if (changed) {
      if (!options.dryRun) {
        // Create backup first
        await backupFile(filePath);
        await writeFile(filePath, newContent, 'utf8');
      }
      
      console.log(`${options.dryRun ? 'Would update' : 'Updated'}: ${filePath}`);
      
      // Log what was removed
      if (options.verbose) {
        Object.entries(logMatches).forEach(([method, count]) => {
          console.log(`  - ${options.dryRun ? 'Would remove' : 'Removed'} ${count} console.${method} statements`);
        });
      }
      
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
async function walkDir(dir, action) {
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      if (!excludedDirs.some(excluded => entry === excluded)) {
        await walkDir(fullPath, action);
      }
    } else if (shouldProcessFile(fullPath)) {
      if (action === 'process') {
        await processFile(fullPath);
      } else if (action === 'restore') {
        await restoreFile(fullPath);
      }
    }
  }
}

// Function to restore files from backup
async function restoreFromBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error(`Backup directory ${BACKUP_DIR} does not exist.`);
    return;
  }
  
  console.log(`Restoring files from ${BACKUP_DIR}`);
  await walkDir(BACKUP_DIR, 'restore');
  console.log('Restore completed.');
}

// Function to print statistics
function printStats() {
  console.log('\nSummary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files ${options.dryRun ? 'that would be changed' : 'changed'}: ${stats.filesChanged}`);
  
  if (options.verbose || options.dryRun) {
    console.log(`\nConsole statements ${options.dryRun ? 'that would be removed' : 'removed'} by method:`);
    
    Object.entries(stats.logsByMethod)
      .filter(([_, count]) => count > 0)
      .sort(([_, countA], [__, countB]) => countB - countA)
      .forEach(([method, count]) => {
        console.log(`  - console.${method}: ${count}`);
      });
  }
  
  if (!options.dryRun) {
    console.log(`\nBackups created in: ${BACKUP_DIR}`);
  }
}

// Function to confirm action
function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question + ' (y/n) ', answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Main function
async function main() {
  try {
    if (options.restore) {
      await restoreFromBackup();
      return;
    }
    
    console.log(`Console Log Cleaner`);
    console.log(`Mode: ${options.dryRun ? 'Dry Run (no changes will be made)' : 'Live Run'}`);
    
    if (!options.dryRun && !options.skipConfirm) {
      const shouldProceed = await confirm('This will remove console statements from your codebase. Proceed?');
      if (!shouldProceed) {
        console.log('Operation cancelled.');
        return;
      }
    }
    
    // Create backup directory
    if (!options.dryRun) {
      await mkdir(BACKUP_DIR, { recursive: true });
      console.log(`Creating backups in ${BACKUP_DIR}`);
    }
    
    // Process files
    await walkDir(process.cwd(), 'process');
    
    // Print statistics
    printStats();
    
    if (options.dryRun) {
      console.log('\nThis was a dry run. No files were modified.');
      console.log('Run without --dry-run to apply changes.');
    } else {
      console.log('\nCompleted successfully!');
      console.log('To restore files from backup, run with --restore');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 
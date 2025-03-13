const fs = require('fs');
const path = require('path');

// Configuration
const pagesDir = path.join(process.cwd(), 'src', 'app');
const minContentLength = 100; // Minimum content length in characters
const requiredMetadata = ['title', 'description'];

// Helper function to check if a file is a page file
function isPageFile(file) {
  return file === 'page.tsx' || file === 'page.js';
}

// Helper function to check directory content recursively
function checkDirectory(dir) {
  const issues = [];
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip certain directories
      if (!['api', 'components', 'lib', 'utils'].includes(file)) {
        issues.push(...checkDirectory(fullPath));
      }
    } else if (isPageFile(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const relativePath = path.relative(pagesDir, fullPath);
      
      // Check content length
      if (content.length < minContentLength) {
        issues.push(`[Warning] ${relativePath}: Content length is less than ${minContentLength} characters`);
      }

      // Check for basic React component structure
      if (!content.includes('export default') && !content.includes('export function')) {
        issues.push(`[Error] ${relativePath}: Missing default export or exported function`);
      }

      // Check for potential accessibility issues
      if (content.includes('<img') && !content.includes('alt=')) {
        issues.push(`[Warning] ${relativePath}: Image without alt attribute detected`);
      }

      if (content.includes('<a') && !content.includes('aria-label') && !content.includes('>')) {
        issues.push(`[Warning] ${relativePath}: Link without accessible text detected`);
      }
    }
  });

  return issues;
}

// Main execution
try {
  console.log('Checking page content...\n');
  const issues = checkDirectory(pagesDir);

  if (issues.length > 0) {
    console.log('Found the following issues:\n');
    issues.forEach(issue => console.log(issue));
    process.exit(1);
  } else {
    console.log('No content issues found.');
    process.exit(0);
  }
} catch (error) {
  console.error('Error checking page content:', error);
  process.exit(1);
} 
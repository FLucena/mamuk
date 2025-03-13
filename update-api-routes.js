const fs = require('fs');
const path = require('path');

// Function to recursively find all route.ts files
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'route.js') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to add dynamic directive to a route file if it doesn't already have it
function addDynamicDirective(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file already has the dynamic directive
  if (!content.includes('export const dynamic')) {
    // Add the dynamic directive after imports
    const lines = content.split('\n');
    let importEndIndex = 0;
    
    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        importEndIndex = i;
      }
    }
    
    // Insert the dynamic directive after the imports
    lines.splice(importEndIndex + 1, 0, '', '// Force dynamic rendering for this route', 'export const dynamic = \'force-dynamic\';', '');
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Added dynamic directive to ${filePath}`);
  } else {
    console.log(`File ${filePath} already has dynamic directive`);
  }
}

// Main function
function main() {
  const apiDir = path.join(__dirname, 'src', 'app', 'api');
  const routeFiles = findRouteFiles(apiDir);
  
  console.log(`Found ${routeFiles.length} route files`);
  
  routeFiles.forEach(filePath => {
    addDynamicDirective(filePath);
  });
  
  console.log('Done!');
}

main(); 
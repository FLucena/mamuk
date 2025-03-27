// Script to convert all model files to .cjs format
const fs = require('fs');
const path = require('path');

// Get the dist-server directory
const distServerDir = path.join(__dirname, 'dist-server');

// Function to recursively process files in a directory
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      // Get the .cjs filename
      const cjsFilePath = filePath.replace('.js', '.cjs');
      
      // Read the content of the file
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Update require statements to use .cjs extension
      content = content.replace(/require\("(\..*?)\.js"\)/g, 'require("$1.cjs")');
      content = content.replace(/require\("(\..*?)\/([^\/]+?)"\)/g, 'require("$1/$2.cjs")');
      
      // Write the content to the .cjs file
      fs.writeFileSync(cjsFilePath, content, 'utf8');
      
      console.log(`Converted ${filePath} to ${cjsFilePath}`);
    }
  }
}

// Start processing the models directory specifically
const modelsDir = path.join(distServerDir, 'models');

if (fs.existsSync(modelsDir)) {
  console.log('Processing models directory...');
  processDirectory(modelsDir);
} else {
  console.log('Models directory not found.');
}

// More thorough update of server.cjs imports
const serverFile = path.join(distServerDir, 'server.cjs');
if (fs.existsSync(serverFile)) {
  console.log('Updating server.cjs imports...');
  let content = fs.readFileSync(serverFile, 'utf8');
  
  // First, make sure we don't have any .cjs references already to avoid double extensions
  content = content.replace(/\.cjs\.cjs/g, '.cjs');
  content = content.replace(/require\("\.\/models\/([^"]+?)\.cjs"\)/g, 'require("./models/$1.cjs")');
  
  // Then fix model imports with the right regex that won't double-apply
  content = content.replace(/require\("\.\/models\/([^"\.]+?)"\)/g, 'require("./models/$1.cjs")');
  
  // Fix other local imports that might need .cjs, but avoid already fixed ones
  content = content.replace(/require\("(\.\/[^"]+?)\/([^"\/\.]+?)"\)/g, 'require("$1/$2.cjs")');
  
  fs.writeFileSync(serverFile, content, 'utf8');
  console.log('Updated server.cjs imports');
}

console.log('Conversion complete. Update your scripts to use .cjs files.'); 
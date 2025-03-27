/**
 * This script converts ES modules to CommonJS format for server-side models
 * It's used during the build process to ensure compatibility with Node.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get all .js files in the models directory
const modelFiles = glob.sync(path.join(__dirname, 'dist-server/models/**/*.js'));

console.log(`Found ${modelFiles.length} model files to convert to CommonJS format`);

modelFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if the file has ESM export syntax
  if (content.includes('export default') || content.includes('export const') || content.includes('export function')) {
    console.log(`Converting ${path.basename(file)} to CommonJS format`);
    
    // Replace export default with module.exports =
    content = content.replace(/export\s+default\s+/g, 'module.exports = ');
    
    // Replace named exports
    content = content.replace(/export\s+(const|let|var|function|class)\s+(\w+)/g, '$1 $2; exports.$2');
    
    // Write back the converted file
    fs.writeFileSync(file, content, 'utf8');
    
    // Also create a .cjs version
    fs.writeFileSync(file.replace('.js', '.cjs'), content, 'utf8');
  }
});

console.log('Model conversion completed successfully'); 
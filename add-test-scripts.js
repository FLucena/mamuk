const fs = require('fs');
const path = require('path');

// Leer el package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Añadir los scripts de test
packageJson.scripts = {
  ...packageJson.scripts,
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:ci": "npm run test && npm run test:e2e"
};

// Escribir el package.json actualizado
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Scripts de test añadidos al package.json'); 
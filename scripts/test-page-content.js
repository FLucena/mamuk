const { execSync } = require('child_process');
const path = require('path');

// Configuration
const testPaths = [
  './__tests__/integration/page-content.test.js',
  './__tests__/utils/page-content-checker.js'
];

// Main execution
try {
  console.log('Running page content tests...\n');

  // Run Jest for the specific test files
  const command = `jest ${testPaths.join(' ')} --config=jest.config.js --verbose`;
  execSync(command, { stdio: 'inherit' });

  console.log('\nAll page content tests passed successfully.');
  process.exit(0);
} catch (error) {
  console.error('\nError running page content tests:', error.message);
  process.exit(1);
} 
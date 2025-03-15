/**
 * MongoDB Index Creation Script
 * 
 * This script creates indexes for MongoDB collections to improve query performance.
 * Run this script manually when deploying to production or when you need to update indexes.
 * 
 * Usage:
 * node scripts/create-indexes.js
 */

// Set environment to development to enable console logs
process.env.NODE_ENV = 'development';

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Use require to load the TypeScript file directly
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017',
  },
});

// Now we can import the TypeScript file
const { createIndexes } = require('../src/lib/db/indexes');

async function main() {
  console.log('Starting MongoDB index creation...');
  
  try {
    // Create indexes
    await createIndexes();
    console.log('Index creation completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 
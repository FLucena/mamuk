/**
 * Script to update all loading files in the app directory to use PageLoading
 * 
 * This script finds all loading.tsx files in the app directory and updates them
 * to use the PageLoading component instead of other loading components.
 * 
 * Usage:
 * node scripts/update-loading-components.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Template for the updated loading file
const loadingTemplate = `// This is a special Next.js file that automatically creates a loading UI
// It will be shown while page data is loading in a route segment
// See: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming

'use client';

import React from 'react';
import PageLoading from '@/components/ui/PageLoading';

export default function Loading() {
  // This loading component is automatically picked up by Next.js
  // and shown during page transitions and data fetching
  return <PageLoading />;
}
`;

// Function to find all loading.tsx files in the app directory
async function findLoadingFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search subdirectories
      await findLoadingFiles(filePath, fileList);
    } else if (file === 'loading.tsx') {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Function to update a loading file
async function updateLoadingFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Check if the file already uses PageLoading
    if (content.includes('import PageLoading from') && content.includes('return <PageLoading')) {
      console.log(`✅ ${filePath} already uses PageLoading`);
      return;
    }
    
    // Update the file
    await writeFile(filePath, loadingTemplate);
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error);
  }
}

// Main function
async function main() {
  try {
    const appDir = path.join(__dirname, '..', 'src', 'app');
    const loadingFiles = await findLoadingFiles(appDir);
    
    console.log(`Found ${loadingFiles.length} loading files to update`);
    
    // Update each loading file
    for (const filePath of loadingFiles) {
      await updateLoadingFile(filePath);
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main(); 
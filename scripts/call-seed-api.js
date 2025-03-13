/**
 * Script to call the seed API endpoint
 * Run with: node scripts/call-seed-api.js
 */

const fetch = require('node-fetch');

async function callSeedApi() {
  try {
    // Replace with your actual URL and session token
    const response = await fetch('http://localhost:3000/api/seed?count=20', {
      method: 'GET',
      headers: {
        'Cookie': 'next-auth.session-token=YOUR_SESSION_TOKEN_HERE'
      }
    });

    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error('Error calling seed API:', error);
  }
}

callSeedApi(); 
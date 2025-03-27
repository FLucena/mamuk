// CommonJS server entry point
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Check if .env.local exists
const envPath = path.resolve(process.cwd(), '.env.local');

// Load environment variables from .env.local
const result = dotenv.config({ path: envPath });

// Import and run the plain JavaScript server
require('./server.js'); 
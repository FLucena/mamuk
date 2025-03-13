const http2 = require('http2');
const fs = require('fs');
const path = require('path');

// Path to the certificates
const certificatesDir = path.join(__dirname, 'certificates');
const keyPath = path.join(certificatesDir, 'localhost-key.pem');
const certPath = path.join(certificatesDir, 'localhost.pem');

// Check if certificates exist
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('SSL certificates not found. Please run node generate-certs.js first.');
  process.exit(1);
}

// Create HTTP/2 client
const client = http2.connect('https://localhost:3001', {
  ca: fs.readFileSync(certPath), // Use the same cert as CA for self-signed
  rejectUnauthorized: false // Accept self-signed certificates
});

client.on('error', (err) => {
  console.error('Client error:', err);
});

// Make a request
const req = client.request({ ':path': '/' });

req.on('response', (headers) => {
  console.log('Status:', headers[':status']);
  console.log('HTTP Version:', headers[':protocol'] || 'HTTP/2');
  console.log('Headers:', headers);
});

let data = '';
req.on('data', (chunk) => {
  data += chunk;
});

req.on('end', () => {
  console.log('Response received');
  console.log('Response length:', data.length);
  console.log('First 100 characters of response:', data.substring(0, 100));
  client.close();
});

req.end();

console.log('HTTP/2 request sent to https://localhost:3001'); 
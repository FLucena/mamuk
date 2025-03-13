const http = require('http');
const https = require('https');
const http2 = require('http2');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = parseInt(process.env.PORT || '3000', 10);
const httpsPort = parseInt(process.env.HTTPS_PORT || '3001', 10);

// Check if SSL certificates exist
const certificatesDir = path.join(__dirname, 'certificates');
const keyPath = path.join(certificatesDir, 'localhost-key.pem');
const certPath = path.join(certificatesDir, 'localhost.pem');

const sslAvailable = fs.existsSync(keyPath) && fs.existsSync(certPath);

app.prepare().then(() => {
  // Create HTTP/1.1 server (fallback or development)
  http.createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> HTTP/1.1 Server ready on http://localhost:${port}`);
  });

  // Create HTTP/2 server if SSL certificates are available
  if (sslAvailable) {
    try {
      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
        allowHTTP1: true // Allow HTTP/1.1 connections to be upgraded to HTTP/2
      };

      // Create HTTP/2 server with proper request handling
      const server = http2.createSecureServer(options);
      
      server.on('error', (err) => {
        console.error('HTTP/2 Server error:', err);
      });
      
      server.on('stream', (stream, headers) => {
        // For raw HTTP/2 streams
        stream.respond({
          'content-type': 'text/html; charset=utf-8',
          ':status': 200
        });
        stream.end('HTTP/2 stream processed');
      });
      
      // Handle HTTP/1.1 style requests (compatibility mode)
      server.on('request', (req, res) => {
        // Log request details
        console.log(`${req.method} ${req.url} (HTTP/${req.httpVersion})`);
        
        // Parse URL and let Next.js handle the request
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      });
      
      server.listen(httpsPort, (err) => {
        if (err) throw err;
        console.log(`> HTTP/2 Server ready on https://localhost:${httpsPort}`);
        console.log('> SSL certificates found and loaded successfully');
      });
    } catch (error) {
      console.error('Failed to start HTTP/2 server:', error);
    }
  } else {
    console.log(`
      > HTTP/2 Server not started: SSL certificates not found
      > To enable HTTP/2, generate SSL certificates and place them in the 'certificates' directory:
      > - localhost-key.pem (private key)
      > - localhost.pem (certificate)
      
      > You can generate self-signed certificates using the provided script:
      > node generate-certs.js
    `);
  }
}); 
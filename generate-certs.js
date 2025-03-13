const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createPrivateKey, createPublicKey, X509Certificate } = require('crypto');
const forge = require('node-forge');

// Create certificates directory if it doesn't exist
const certsDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

// Generate self-signed certificate using node-forge
function generateSelfSignedCert() {
  console.log('Generating self-signed certificates...');
  
  try {
    // Check if node-forge is installed
    try {
      require.resolve('node-forge');
    } catch (e) {
      console.log('node-forge is not installed. Installing...');
      execSync('npm install --save-dev node-forge', { stdio: 'inherit' });
      console.log('node-forge installed successfully.');
    }

    // Create a new keypair
    const keys = forge.pki.rsa.generateKeyPair(2048);
    
    // Create a certificate
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    
    // Add subject and issuer fields
    const attrs = [
      { name: 'commonName', value: 'localhost' },
      { name: 'countryName', value: 'US' },
      { name: 'organizationName', value: 'Mamuk Development' },
      { name: 'organizationalUnitName', value: 'Development' }
    ];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    
    // Add extensions
    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
          { type: 7, ip: '::1' }
        ]
      }
    ]);
    
    // Self-sign the certificate
    cert.sign(keys.privateKey, forge.md.sha256.create());
    
    // Convert to PEM format
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
    const certPem = forge.pki.certificateToPem(cert);
    
    // Write files
    fs.writeFileSync(path.join(certsDir, 'localhost-key.pem'), privateKeyPem);
    fs.writeFileSync(path.join(certsDir, 'localhost.pem'), certPem);
    
    console.log('Self-signed certificates generated successfully!');
    console.log(`Certificates saved to: ${certsDir}`);
    console.log('- localhost-key.pem: Private key');
    console.log('- localhost.pem: Certificate');
    
    return true;
  } catch (error) {
    console.error('Error generating certificates:', error);
    return false;
  }
}

// Try to generate certificates
const success = generateSelfSignedCert();

if (!success) {
  console.log('\nFailed to generate certificates using Node.js.');
  console.log('Please install mkcert or OpenSSL and generate certificates manually:');
  console.log('\n# Using mkcert:');
  console.log('mkcert -install');
  console.log('mkcert -key-file certificates/localhost-key.pem -cert-file certificates/localhost.pem localhost 127.0.0.1 ::1');
  
  console.log('\n# Using OpenSSL:');
  console.log('openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -keyout certificates/localhost-key.pem -out certificates/localhost.pem -days 365');
} 
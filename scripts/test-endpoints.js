/**
 * Script para probar manualmente los endpoints de API
 * 
 * Ejecutar con: node scripts/test-endpoints.js
 */

import fetch from 'node-fetch';
import chalk from 'chalk';

// URL base para las pruebas
const BASE_URL = 'http://localhost:3000';

// Endpoints a probar
const ENDPOINTS = [
  { url: '/api/manifest', method: 'GET', description: 'Manifest API' },
  { url: '/api/sw', method: 'GET', description: 'Service Worker API' },
  { url: '/api/manifest', method: 'OPTIONS', description: 'Manifest API (OPTIONS)' },
  { url: '/api/sw', method: 'OPTIONS', description: 'Service Worker API (OPTIONS)' },
];

// Orígenes para probar CORS
const ORIGINS = [
  'https://www.mamuk.com.ar',
  'https://mamuk.com.ar',
  'http://localhost:3000',
  'https://malicious-site.com',
];

// Función para realizar una solicitud
async function makeRequest(endpoint, origin = null) {
  const options = {
    method: endpoint.method,
    headers: {},
  };
  
  if (origin) {
    options.headers['Origin'] = origin;
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint.url}`, options);
    
    // Obtener información de la respuesta
    const status = response.status;
    const headers = Object.fromEntries(response.headers.entries());
    let body = null;
    
    if (response.headers.get('content-type')?.includes('json')) {
      body = await response.json();
    } else if (response.headers.get('content-type')?.includes('javascript')) {
      body = await response.text();
      // Truncar el cuerpo si es demasiado largo
      if (body.length > 100) {
        body = body.substring(0, 100) + '...';
      }
    }
    
    return { status, headers, body };
  } catch (error) {
    console.error(`Error al realizar la solicitud a ${endpoint.url}:`, error);
    return { error: error.message };
  }
}

// Función para mostrar los resultados
function displayResults(endpoint, origin, results) {
  console.log('\n' + chalk.bold('='.repeat(80)));
  console.log(chalk.bold.blue(`${endpoint.method} ${endpoint.url} (${endpoint.description})`));
  if (origin) {
    console.log(chalk.bold.yellow(`Origin: ${origin}`));
  }
  console.log(chalk.bold('='.repeat(80)));
  
  if (results.error) {
    console.log(chalk.red(`Error: ${results.error}`));
    return;
  }
  
  // Mostrar el estado
  const statusColor = results.status >= 200 && results.status < 300 ? 'green' : 'red';
  console.log(chalk.bold('Status:'), chalk[statusColor](results.status));
  
  // Mostrar las cabeceras relevantes
  console.log(chalk.bold('\nHeaders:'));
  const relevantHeaders = [
    'content-type',
    'access-control-allow-origin',
    'access-control-allow-methods',
    'access-control-allow-headers',
    'cache-control',
  ];
  
  relevantHeaders.forEach(header => {
    if (results.headers[header]) {
      console.log(`  ${chalk.cyan(header)}: ${results.headers[header]}`);
    }
  });
  
  // Mostrar el cuerpo
  if (results.body) {
    console.log(chalk.bold('\nBody:'));
    if (typeof results.body === 'string') {
      console.log(chalk.gray(results.body));
    } else {
      console.log(chalk.gray(JSON.stringify(results.body, null, 2)));
    }
  }
}

// Función principal
async function main() {
  console.log(chalk.bold.green('Iniciando pruebas de endpoints de API...'));
  
  // Probar cada endpoint sin origen
  for (const endpoint of ENDPOINTS) {
    const results = await makeRequest(endpoint);
    displayResults(endpoint, null, results);
  }
  
  // Probar cada endpoint con diferentes orígenes
  for (const endpoint of ENDPOINTS.filter(e => e.method === 'GET')) {
    for (const origin of ORIGINS) {
      const results = await makeRequest(endpoint, origin);
      displayResults(endpoint, origin, results);
    }
  }
  
  console.log(chalk.bold.green('\nPruebas completadas.'));
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error en la ejecución del script:', error);
  process.exit(1);
}); 
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createErrorResponse, createNotFoundErrorResponse } from '@/lib/utils/errorHandler';

// Define runtime environment
export const runtime = 'nodejs';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/manifest - Serve manifest.json with proper CORS headers
export async function GET(request: NextRequest) {
  try {
    // Definir la ruta exacta al archivo manifest.json
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    
    // Validar que la ruta no contiene caracteres sospechosos
    const normalizedPath = path.normalize(manifestPath);
    if (!normalizedPath.startsWith(path.join(process.cwd(), 'public'))) {
      throw new Error('Invalid file path');
    }
    
    // Verificar que el archivo existe
    if (!fs.existsSync(manifestPath)) {
      return createNotFoundErrorResponse('Manifest file not found');
    }
    
    // Read the manifest.json file
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    
    // Parse the manifest to ensure it's valid JSON
    const manifestJson = JSON.parse(manifestContent);
    
    // Create a response with the manifest content
    const response = NextResponse.json(manifestJson);
    
    // Add CORS headers - Restringido a dominios específicos
    const allowedOrigins = [
      'https://www.mamuk.com.ar',
      'https://mamuk.com.ar',
      'http://localhost:3000'
    ];
    
    const origin = request.headers.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      // En producción, usar solo el dominio principal
      response.headers.set('Access-Control-Allow-Origin', 'https://www.mamuk.com.ar');
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Content-Type', 'application/manifest+json');
    response.headers.set('Cache-Control', 'public, max-age=3600');
    
    return response;
  } catch (error) {
    return createErrorResponse(error, {
      publicMessage: 'Failed to serve manifest.json',
      status: 500
    });
  }
}

// OPTIONS /api/manifest - Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  
  // Add CORS headers - Restringido a dominios específicos
  const allowedOrigins = [
    'https://www.mamuk.com.ar',
    'https://mamuk.com.ar',
    'http://localhost:3000'
  ];
  
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    // En producción, usar solo el dominio principal
    response.headers.set('Access-Control-Allow-Origin', 'https://www.mamuk.com.ar');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
} 
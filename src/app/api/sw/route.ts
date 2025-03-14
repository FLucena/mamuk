import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createErrorResponse, createNotFoundErrorResponse } from '@/lib/utils/errorHandler';

// Define runtime environment
export const runtime = 'nodejs';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/sw - Serve sw.js with proper CORS headers
export async function GET(request: NextRequest) {
  try {
    // Definir la ruta exacta al archivo sw.js
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    
    // Validar que la ruta no contiene caracteres sospechosos
    const normalizedPath = path.normalize(swPath);
    if (!normalizedPath.startsWith(path.join(process.cwd(), 'public'))) {
      throw new Error('Invalid file path');
    }
    
    // Verificar que el archivo existe
    if (!fs.existsSync(swPath)) {
      return createNotFoundErrorResponse('Service worker file not found');
    }
    
    // Read the sw.js file
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Create a response with the service worker content
    const response = new NextResponse(swContent);
    
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
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    return createErrorResponse(error, {
      publicMessage: 'Failed to serve service worker',
      status: 500
    });
  }
}

// HEAD /api/sw - Handle HEAD requests (same as GET but without body)
export async function HEAD(request: NextRequest) {
  try {
    // Definir la ruta exacta al archivo sw.js
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    
    // Validar que la ruta no contiene caracteres sospechosos
    const normalizedPath = path.normalize(swPath);
    if (!normalizedPath.startsWith(path.join(process.cwd(), 'public'))) {
      throw new Error('Invalid file path');
    }
    
    // Verificar que el archivo existe
    if (!fs.existsSync(swPath)) {
      return createNotFoundErrorResponse('Service worker file not found');
    }
    
    // Get file stats for headers
    const stats = fs.statSync(swPath);
    
    // Create a response with empty body (HEAD request)
    const response = new NextResponse(null);
    
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
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8');
    response.headers.set('Content-Length', stats.size.toString());
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    return createErrorResponse(error, {
      publicMessage: 'Failed to serve service worker',
      status: 500
    });
  }
}

// OPTIONS /api/sw - Handle preflight requests
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
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
} 
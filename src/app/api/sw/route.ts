import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define runtime environment
export const runtime = 'nodejs';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/sw - Serve sw.js with proper CORS headers
export async function GET(request: NextRequest) {
  try {
    // Read the sw.js file
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Create a response with the service worker content
    const response = new NextResponse(swContent);
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('Error serving sw.js:', error);
    return NextResponse.json(
      { error: 'Failed to serve sw.js' },
      { status: 500 }
    );
  }
}

// OPTIONS /api/sw - Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
} 
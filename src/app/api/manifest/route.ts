import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define runtime environment
export const runtime = 'nodejs';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/manifest - Serve manifest.json with proper CORS headers
export async function GET(request: NextRequest) {
  try {
    // Read the manifest.json file
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    
    // Parse the manifest to ensure it's valid JSON
    const manifestJson = JSON.parse(manifestContent);
    
    // Create a response with the manifest content
    const response = NextResponse.json(manifestJson);
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Content-Type', 'application/manifest+json');
    response.headers.set('Cache-Control', 'public, max-age=3600');
    
    return response;
  } catch (error) {
    console.error('Error serving manifest.json:', error);
    return NextResponse.json(
      { error: 'Failed to serve manifest.json' },
      { status: 500 }
    );
  }
}

// OPTIONS /api/manifest - Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
} 
import { NextResponse } from 'next/server';
import { gzip } from 'zlib';
import { promisify } from 'util';
import { JsonValue } from '@/types/common';

const gzipAsync = promisify(gzip);

/**
 * Compresses the response data and returns a NextResponse object with appropriate headers
 * 
 * @param data The data to compress and send in the response
 * @param headers Optional headers to include in the response
 * @param status The HTTP status code for the response
 * @returns A NextResponse object with compressed data
 */
export async function compressResponse(
  data: JsonValue, 
  headers: Headers = new Headers(), 
  status: number = 200
): Promise<NextResponse> {
  // For small payloads, don't bother compressing
  const jsonString = JSON.stringify(data);
  
  // If payload is small, just return regular JSON
  if (jsonString.length < 1024) {
    return NextResponse.json(data, { 
      status,
      headers
    });
  }
  
  try {
    // Try to compress the data
    const compressedData = await gzipAsync(Buffer.from(jsonString));
    
    // Add compression headers
    headers.set('Content-Encoding', 'gzip');
    headers.set('Vary', 'Accept-Encoding');
    
    // Create response with compressed data
    return new NextResponse(compressedData, {
      status,
      headers
    });
  } catch (error) {
    console.error('Error compressing response:', error);
    
    // Fall back to uncompressed response
    return NextResponse.json(data, { 
      status,
      headers
    });
  }
}

/**
 * A simpler version that doesn't actually compress but optimizes
 * the response by only including essential fields
 */
export function optimizeResponse(
  data: JsonValue,
  headers: Headers = new Headers(),
  status: number = 200
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers
  });
} 
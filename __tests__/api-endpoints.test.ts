import { NextRequest } from 'next/server';
import { GET as getManifest } from '@/app/api/manifest/route';
import { GET as getServiceWorker } from '@/app/api/sw/route';

// Mock fs and path modules
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockImplementation((path) => {
    if (path.includes('manifest.json')) {
      return JSON.stringify({
        name: 'Mamuk',
        short_name: 'Mamuk',
        start_url: '/',
        display: 'standalone',
        icons: []
      });
    } else if (path.includes('sw.js')) {
      return 'console.log("Service Worker");';
    }
    throw new Error(`Unexpected file path: ${path}`);
  }),
  existsSync: jest.fn().mockReturnValue(true)
}));

jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/'))
}));

describe('API Endpoints Tests', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = {
      nextUrl: {
        pathname: '/api/manifest'
      }
    } as unknown as NextRequest;
  });

  test('Manifest API endpoint should return JSON with correct headers', async () => {
    const response = await getManifest(mockRequest);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');
    
    const data = await response.json();
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('short_name');
    expect(data).toHaveProperty('start_url');
    expect(data).toHaveProperty('display');
  });

  test('Service Worker API endpoint should return JS with correct headers', async () => {
    mockRequest.nextUrl.pathname = '/api/sw';
    const response = await getServiceWorker(mockRequest);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/javascript; charset=utf-8');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    
    const text = await response.text();
    expect(text).toContain('Service Worker');
  });
}); 
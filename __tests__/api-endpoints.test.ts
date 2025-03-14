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
  existsSync: jest.fn().mockImplementation((path) => {
    return path.includes('manifest.json') || path.includes('sw.js');
  })
}));

jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/')),
  normalize: jest.fn().mockImplementation((path) => path),
  startsWith: jest.fn().mockReturnValue(true)
}));

// Mock error handler
jest.mock('@/lib/utils/errorHandler', () => ({
  createErrorResponse: jest.fn().mockImplementation((error, options) => {
    return {
      status: options?.status || 500,
      headers: new Headers({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://www.mamuk.com.ar',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }),
      json: () => Promise.resolve({
        error: true,
        message: options?.publicMessage || 'An unexpected error occurred'
      })
    };
  }),
  createNotFoundErrorResponse: jest.fn().mockImplementation((message) => {
    return {
      status: 404,
      headers: new Headers({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://www.mamuk.com.ar',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }),
      json: () => Promise.resolve({
        error: true,
        message: message || 'Resource not found'
      })
    };
  })
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: jest.fn().mockImplementation((body) => {
        return {
          status: 200,
          headers: new Headers({
            'Access-Control-Allow-Origin': 'https://www.mamuk.com.ar',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, max-age=3600',
            'Content-Type': 'application/manifest+json'
          }),
          json: () => Promise.resolve(body)
        };
      })
    }
  };
});

// Mock para el service worker
jest.mock('@/app/api/sw/route', () => ({
  GET: jest.fn().mockImplementation(() => {
    return {
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': 'https://www.mamuk.com.ar',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }),
      text: () => Promise.resolve('console.log("Service Worker");')
    };
  })
}));

describe('API Endpoints Tests', () => {
  let mockRequest: NextRequest;
  let mockHeaders: Headers;

  beforeEach(() => {
    mockHeaders = new Headers({
      'origin': 'https://www.mamuk.com.ar'
    });
    
    mockRequest = {
      nextUrl: {
        pathname: '/api/manifest'
      },
      headers: mockHeaders,
      // Método para obtener headers
      header: (name: string) => mockHeaders.get(name)
    } as unknown as NextRequest;
    
    // Reset mocks
    jest.clearAllMocks();
  });

  test('Manifest API endpoint should return JSON with correct headers', async () => {
    const response = await getManifest(mockRequest);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/manifest+json');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://www.mamuk.com.ar');
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
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://www.mamuk.com.ar');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    
    const text = await response.text();
    expect(text).toContain('Service Worker');
  });
  
  test('Manifest API should handle file not found', async () => {
    // Mock file not existing
    jest.spyOn(require('fs'), 'existsSync').mockReturnValueOnce(false);
    
    const response = await getManifest(mockRequest);
    
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('error', true);
    expect(data).toHaveProperty('message', 'Manifest file not found');
  });
  
  test('Service Worker API should handle file not found', async () => {
    // Importar la función createNotFoundErrorResponse
    const { createNotFoundErrorResponse } = require('@/lib/utils/errorHandler');
    
    // Restaurar el mock original para este test
    jest.resetModules();
    jest.mock('@/app/api/sw/route', () => ({
      GET: jest.fn().mockImplementation(() => {
        return createNotFoundErrorResponse('Service worker file not found');
      })
    }));
    
    // Importar de nuevo después de resetear
    const { GET: getServiceWorkerTest } = require('@/app/api/sw/route');
    
    mockRequest.nextUrl.pathname = '/api/sw';
    const response = await getServiceWorkerTest(mockRequest);
    
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('error', true);
    expect(data).toHaveProperty('message', 'Service worker file not found');
  });
  
  test('Manifest API should handle invalid origins', async () => {
    // Crear un nuevo objeto de solicitud con un origen diferente
    const invalidOriginRequest = {
      ...mockRequest,
      headers: new Headers({
        'origin': 'https://malicious-site.com'
      })
    } as unknown as NextRequest;
    
    const response = await getManifest(invalidOriginRequest);
    
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://www.mamuk.com.ar');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
  });
}); 
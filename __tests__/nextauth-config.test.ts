import fs from 'fs';
import path from 'path';

describe('NextAuth Configuration Tests', () => {
  let envLocalContent: string | null = null;
  let envProductionContent: string | null = null;
  let nextConfigContent: string | null = null;

  beforeAll(() => {
    // Leer el archivo .env.local si existe
    try {
      const envLocalPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envLocalPath)) {
        envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
      }
    } catch (error) {
      console.warn('No se pudo leer el archivo .env.local');
    }

    // Leer el archivo .env.production si existe
    try {
      const envProductionPath = path.join(process.cwd(), '.env.production');
      if (fs.existsSync(envProductionPath)) {
        envProductionContent = fs.readFileSync(envProductionPath, 'utf8');
      }
    } catch (error) {
      console.warn('No se pudo leer el archivo .env.production');
    }

    // Leer el archivo next.config.js
    try {
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      if (fs.existsSync(nextConfigPath)) {
        nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
      }
    } catch (error) {
      console.warn('No se pudo leer el archivo next.config.js');
    }
  });

  test('Environment files should exist', () => {
    expect(envLocalContent || envProductionContent).toBeTruthy();
  });

  test('NEXTAUTH_URL should be properly configured', () => {
    // Verificar en .env.local
    if (envLocalContent) {
      expect(envLocalContent).toContain('NEXTAUTH_URL=');
    }

    // Verificar en .env.production
    if (envProductionContent) {
      expect(envProductionContent).toContain('NEXTAUTH_URL=');
      expect(envProductionContent).toContain('https://www.mamuk.com.ar');
    }
  });

  test('NEXTAUTH_SECRET should be properly configured', () => {
    // Verificar en .env.local
    if (envLocalContent) {
      expect(envLocalContent).toContain('NEXTAUTH_SECRET=');
    }

    // Verificar en .env.production
    if (envProductionContent) {
      expect(envProductionContent).toContain('NEXTAUTH_SECRET=');
    }
  });

  test('Google OAuth credentials should be properly configured', () => {
    // Verificar en .env.local
    if (envLocalContent) {
      expect(envLocalContent).toContain('GOOGLE_CLIENT_ID=');
      expect(envLocalContent).toContain('GOOGLE_CLIENT_SECRET=');
    }

    // Verificar en .env.production
    if (envProductionContent) {
      expect(envProductionContent).toContain('GOOGLE_CLIENT_ID=');
      expect(envProductionContent).toContain('GOOGLE_CLIENT_SECRET=');
    }
  });

  test('next.config.js should have proper CORS configuration', () => {
    if (nextConfigContent) {
      // Verificar que hay configuración de CORS
      expect(nextConfigContent).toContain('Access-Control-Allow-Origin');
      
      // Verificar que hay configuración específica para rutas de autenticación
      expect(nextConfigContent).toContain('/api/auth/:path*');
    }
  });
}); 
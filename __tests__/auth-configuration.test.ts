import fs from 'fs';
import path from 'path';

describe('Authentication Configuration Tests', () => {
  let authOptionsContent: string | null = null;
  let nextAuthConfigContent: string | null = null;

  beforeAll(() => {
    // Intentar leer el archivo de configuración de autenticación
    try {
      const authOptionsPath = path.join(process.cwd(), 'src', 'lib', 'auth.ts');
      if (fs.existsSync(authOptionsPath)) {
        authOptionsContent = fs.readFileSync(authOptionsPath, 'utf8');
      }
    } catch (error) {
      console.warn('No se pudo leer el archivo de configuración de autenticación');
    }

    // Intentar leer el archivo de configuración de NextAuth
    try {
      const nextAuthConfigPath = path.join(process.cwd(), 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');
      if (fs.existsSync(nextAuthConfigPath)) {
        nextAuthConfigContent = fs.readFileSync(nextAuthConfigPath, 'utf8');
      } else {
        // Intentar con la ruta alternativa
        const altNextAuthConfigPath = path.join(process.cwd(), 'src', 'pages', 'api', 'auth', '[...nextauth].ts');
        if (fs.existsSync(altNextAuthConfigPath)) {
          nextAuthConfigContent = fs.readFileSync(altNextAuthConfigPath, 'utf8');
        }
      }
    } catch (error) {
      console.warn('No se pudo leer el archivo de configuración de NextAuth');
    }
  });

  test('Auth configuration files should exist', () => {
    expect(authOptionsContent || nextAuthConfigContent).toBeTruthy();
  });

  test('Google provider should be properly configured', () => {
    const content = authOptionsContent || nextAuthConfigContent;
    if (!content) {
      // Si no se pudo leer ningún archivo, omitir este test
      return;
    }

    // Verificar que el proveedor de Google está configurado
    expect(content).toContain('GoogleProvider');
    
    // Verificar que se están utilizando variables de entorno para las credenciales
    expect(content).toContain('process.env.GOOGLE_CLIENT_ID');
    expect(content).toContain('process.env.GOOGLE_CLIENT_SECRET');
  });

  test('Authorization configuration should be properly set', () => {
    const content = authOptionsContent || nextAuthConfigContent;
    if (!content) {
      // Si no se pudo leer ningún archivo, omitir este test
      return;
    }

    // Verificar que se está configurando correctamente la autorización
    expect(content).toContain('authorization');
  });

  test('Session configuration should be properly set', () => {
    const content = authOptionsContent || nextAuthConfigContent;
    if (!content) {
      // Si no se pudo leer ningún archivo, omitir este test
      return;
    }

    // Verificar que se está configurando la sesión
    expect(content).toContain('session');
    
    // Verificar que se está configurando el JWT
    expect(content).toContain('jwt');
  });

  test('Error handling should be properly configured', () => {
    const content = authOptionsContent || nextAuthConfigContent;
    if (!content) {
      // Si no se pudo leer ningún archivo, omitir este test
      return;
    }

    // Verificar que se está manejando los errores
    expect(content).toContain('error');
  });

  test('Environment variables should be properly referenced', () => {
    const content = authOptionsContent || nextAuthConfigContent;
    if (!content) {
      // Si no se pudo leer ningún archivo, omitir este test
      return;
    }

    // Verificar que se están utilizando variables de entorno para la configuración
    expect(content).toContain('process.env');
    
    // Verificar que se está utilizando alguna variable de entorno de seguridad
    const hasSecretVar = content.includes('NEXTAUTH_SECRET') || 
                         content.includes('JWT_SECRET') || 
                         content.includes('SECRET_KEY');
    expect(hasSecretVar).toBe(true);
  });
}); 
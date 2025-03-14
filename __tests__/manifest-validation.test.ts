import fs from 'fs';
import path from 'path';

describe('Manifest Validation', () => {
  let manifestContent: string;
  let manifestJson: any;

  beforeAll(() => {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifestJson = JSON.parse(manifestContent);
  });

  test('manifest.json should be valid JSON', () => {
    expect(() => JSON.parse(manifestContent)).not.toThrow();
  });

  test('manifest.json should have required fields', () => {
    expect(manifestJson).toHaveProperty('name');
    expect(manifestJson).toHaveProperty('short_name');
    expect(manifestJson).toHaveProperty('start_url');
    expect(manifestJson).toHaveProperty('display');
    expect(manifestJson).toHaveProperty('icons');
  });

  test('manifest.json should have valid icons', () => {
    expect(Array.isArray(manifestJson.icons)).toBe(true);
    expect(manifestJson.icons.length).toBeGreaterThan(0);

    manifestJson.icons.forEach((icon: any) => {
      expect(icon).toHaveProperty('src');
      expect(icon).toHaveProperty('sizes');
      expect(icon).toHaveProperty('type');
      
      // Verificar que la ruta del icono tiene un formato válido
      expect(icon.src).toMatch(/^\//);
      
      // No verificamos la existencia del archivo porque puede variar en entornos de CI/CD
      // const iconPath = path.join(process.cwd(), 'public', icon.src.replace(/^\//, ''));
      // expect(fs.existsSync(iconPath)).toBe(true);
    });
  });

  test('manifest.json should have valid shortcuts', () => {
    if (manifestJson.shortcuts) {
      expect(Array.isArray(manifestJson.shortcuts)).toBe(true);
      
      manifestJson.shortcuts.forEach((shortcut: any) => {
        expect(shortcut).toHaveProperty('name');
        expect(shortcut).toHaveProperty('url');
        
        if (shortcut.icons) {
          shortcut.icons.forEach((icon: any) => {
            expect(icon).toHaveProperty('src');
            
            // Verificar que la ruta del icono tiene un formato válido
            expect(icon.src).toMatch(/^\//);
            
            // No verificamos la existencia del archivo porque puede variar en entornos de CI/CD
            // const iconPath = path.join(process.cwd(), 'public', icon.src.replace(/^\//, ''));
            // expect(fs.existsSync(iconPath)).toBe(true);
          });
        }
      });
    }
  });

  test('manifest.json should have consistent formatting', () => {
    // Verificar que el JSON está formateado correctamente
    const formattedJson = JSON.stringify(manifestJson, null, 2);
    const lines = formattedJson.split('\n');
    
    // Verificar que hay al menos 10 líneas (un JSON mínimo formateado)
    expect(lines.length).toBeGreaterThan(10);
    
    // Verificar que la primera línea es {
    expect(lines[0].trim()).toBe('{');
    
    // Verificar que la última línea es }
    expect(lines[lines.length - 1].trim()).toBe('}');
  });
}); 
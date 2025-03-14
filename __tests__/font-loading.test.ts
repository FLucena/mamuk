import fs from 'fs';
import path from 'path';

describe('Font Loading Tests', () => {
  test('Inter font should be properly configured in layout.tsx', () => {
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Verificar que la fuente Inter está configurada correctamente
    expect(layoutContent).toContain("import { Inter } from 'next/font/google'");
    expect(layoutContent).toContain("const inter = Inter(");
    
    // Verificar que la configuración de Inter incluye los parámetros necesarios
    expect(layoutContent).toContain("subsets: ['latin']");
    expect(layoutContent).toContain("display: 'swap'");
    
    // Verificar que la clase de Inter se aplica al body
    expect(layoutContent).toContain("${inter.className}");
  });
  
  test('Font files should exist in public directory if referenced', () => {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    
    // Verificar si el directorio de fuentes existe
    if (fs.existsSync(fontsDir)) {
      const fontFiles = fs.readdirSync(fontsDir);
      
      // Si hay archivos de fuentes, verificar que son válidos
      if (fontFiles.length > 0) {
        fontFiles.forEach(fontFile => {
          const fontPath = path.join(fontsDir, fontFile);
          const stats = fs.statSync(fontPath);
          
          // Verificar que el archivo tiene un tamaño razonable (mayor a 0 bytes)
          expect(stats.size).toBeGreaterThan(0);
          
          // Verificar que el archivo tiene una extensión válida
          const validExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
          const hasValidExtension = validExtensions.some(ext => fontFile.endsWith(ext));
          expect(hasValidExtension).toBe(true);
        });
      }
    }
  });
  
  test('CRITICAL_FONTS array should be properly typed', () => {
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Verificar que CRITICAL_FONTS está tipado correctamente
    expect(layoutContent).toContain("CRITICAL_FONTS: { path: string; as: string; type: string; crossOrigin?: string }[]");
  });
  
  test('PerformanceOptimizerWrapper should receive criticalFonts prop', () => {
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Verificar que PerformanceOptimizerWrapper recibe criticalFonts
    expect(layoutContent).toContain("<PerformanceOptimizerWrapper");
    expect(layoutContent).toContain("criticalFonts={CRITICAL_FONTS}");
  });
}); 
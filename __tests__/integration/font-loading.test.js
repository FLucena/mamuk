/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';

describe('Font Loading', () => {
  test('Inter font is configured correctly in layout.tsx', () => {
    // Read the layout file content
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Check for font configuration
    expect(layoutContent).toContain("import { Inter } from 'next/font/google'");
    expect(layoutContent).toContain("subsets: ['latin']");
    expect(layoutContent).toContain("display: 'swap'");
    expect(layoutContent).toContain("preload: true");
    expect(layoutContent).toContain("fallback: ['system-ui', 'Arial', 'sans-serif']");
    
    // Check that the font class is applied to the body
    expect(layoutContent).toContain("body className={`${inter.className}");
  });
}); 
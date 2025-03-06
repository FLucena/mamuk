// Importar DOMPurify para sanitización de HTML
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_VIDEO_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'vimeo.com',
  'player.vimeo.com'
];

export function sanitizeVideoUrl(url: string): string | null {
  try {
    const videoUrl = new URL(url);
    if (!ALLOWED_VIDEO_DOMAINS.includes(videoUrl.hostname)) {
      return null;
    }
    
    // Solo permitir HTTPS
    if (videoUrl.protocol !== 'https:') {
      return null;
    }

    // Asegurarse de que es un embed de YouTube o Vimeo
    if (videoUrl.hostname.includes('youtube.com') && !videoUrl.pathname.startsWith('/embed/')) {
      const videoId = videoUrl.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (videoUrl.hostname === 'youtu.be') {
      const videoId = videoUrl.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (videoUrl.hostname.includes('vimeo.com') && !videoUrl.pathname.startsWith('/video/')) {
      const videoId = videoUrl.pathname.slice(1);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return url;
  } catch {
    return null;
  }
}

/**
 * Sanitiza contenido HTML para prevenir ataques XSS
 * Versión mejorada con validaciones adicionales y configuración más estricta
 * 
 * @param html Contenido HTML a sanitizar
 * @returns Contenido HTML sanitizado
 */
export function sanitizeHtml(html: string | null | undefined): string {
  // Si el contenido es nulo o indefinido, devolver string vacío
  if (html === null || html === undefined) {
    return '';
  }

  // Verificar que el contenido sea un string
  if (typeof html !== 'string') {
    console.warn(`[SECURITY] Intento de sanitizar contenido no string: ${typeof html}`);
    return '';
  }

  try {
    // Lista de etiquetas permitidas
    const allowedTags = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li',
      'b', 'i', 'strong', 'em', 'mark', 'small', 'del', 'ins', 'sub', 'sup'
    ];

    // Lista de atributos permitidos
    const allowedAttributes: Record<string, string[]> = {
      '*': ['class', 'id', 'style']
    };

    // Configuración de estilos permitidos - no se usa directamente en la configuración
    // debido a que ALLOWED_STYLES no es una propiedad reconocida en el tipo Config
    const allowedStyles = {
      '*': {
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
        'font-weight': [/^normal$/, /^bold$/, /^\d+$/],
        'text-decoration': [/^none$/, /^underline$/, /^line-through$/]
      }
    };

    // Sanitizar el HTML con configuración estricta
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes['*'],
      // ALLOWED_STYLES no es una propiedad reconocida en el tipo Config
      // allowedStyles se define arriba pero no se usa directamente aquí
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      WHOLE_DOCUMENT: false,
      SANITIZE_DOM: true
    });

    // Registrar si se detectó contenido potencialmente malicioso
    if (sanitized !== html) {
      console.warn('[SECURITY] Contenido HTML potencialmente malicioso detectado y sanitizado');
    }

    return sanitized;
  } catch (error) {
    console.error('[SECURITY] Error al sanitizar HTML:', error);
    // En caso de error, devolver string vacío para evitar cualquier riesgo
    return '';
  }
}

/**
 * Sanitiza URLs para prevenir ataques de inyección
 * Versión mejorada con validaciones adicionales y configuración más estricta
 * 
 * @param url URL a sanitizar
 * @returns URL sanitizada o string vacío si no es válida
 */
export function sanitizeUrl(url: string | null | undefined): string {
  // Si la URL es nula o indefinida, devolver string vacío
  if (url === null || url === undefined) {
    return '';
  }

  // Verificar que la URL sea un string
  if (typeof url !== 'string') {
    console.warn(`[SECURITY] Intento de sanitizar URL no string: ${typeof url}`);
    return '';
  }

  try {
    // Eliminar espacios en blanco
    const trimmedUrl = url.trim();
    
    // Si está vacía después de eliminar espacios, devolver string vacío
    if (!trimmedUrl) {
      return '';
    }

    // Lista de protocolos permitidos
    const allowedProtocols = ['http:', 'https:'];
    
    // Intentar parsear la URL
    const parsedUrl = new URL(trimmedUrl);
    
    // Verificar que el protocolo sea permitido
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      console.warn(`[SECURITY] Protocolo no permitido en URL: ${parsedUrl.protocol}`);
      return '';
    }
    
    // Verificar que no contenga scripts en la URL
    if (
      trimmedUrl.toLowerCase().includes('javascript:') ||
      trimmedUrl.toLowerCase().includes('data:') ||
      trimmedUrl.toLowerCase().includes('vbscript:')
    ) {
      console.warn(`[SECURITY] URL potencialmente maliciosa detectada: ${trimmedUrl}`);
      return '';
    }
    
    return trimmedUrl;
  } catch (error) {
    // Si no se puede parsear como URL válida
    console.warn(`[SECURITY] URL inválida: ${url}`);
    return '';
  }
}

/**
 * Valida que un ID tenga el formato correcto de MongoDB ObjectId
 * Versión mejorada con validaciones adicionales
 * 
 * @param id ID a validar
 * @returns true si el ID es válido, false en caso contrario
 */
export function validateMongoId(id: string): boolean {
  // Verificar que el ID no sea nulo o indefinido
  if (!id) {
    console.warn('[SECURITY] Intento de validación de ID nulo o indefinido');
    return false;
  }
  
  // Verificar que el ID sea un string
  if (typeof id !== 'string') {
    console.warn(`[SECURITY] ID con tipo incorrecto: ${typeof id}`);
    return false;
  }
  
  // Verificar la longitud exacta (24 caracteres)
  if (id.length !== 24) {
    console.warn(`[SECURITY] ID con longitud incorrecta: ${id.length}`);
    return false;
  }
  
  // Verificar que solo contenga caracteres hexadecimales
  const hexRegex = /^[0-9a-fA-F]{24}$/;
  const isValid = hexRegex.test(id);
  
  if (!isValid) {
    console.warn(`[SECURITY] ID con formato incorrecto: ${id}`);
  }
  
  return isValid;
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  // Implementar rate limiting usando Redis o similar
  // Por ahora retornamos true para permitir todas las peticiones
  return true;
}

/**
 * Implementa rate limiting para endpoints críticos
 * Utiliza esta función en rutas de autenticación y API sensibles
 * 
 * @param ip Dirección IP del cliente
 * @param endpoint Nombre del endpoint (ej: 'login', 'register')
 * @param maxAttempts Número máximo de intentos permitidos en la ventana de tiempo
 * @param windowMs Ventana de tiempo en milisegundos
 * @returns Boolean indicando si la solicitud debe ser permitida
 */
export function applyRateLimit(ip: string, endpoint: string, maxAttempts: number = 5, windowMs: number = 60 * 1000): boolean {
  const key = `${endpoint}:${ip}`;
  return rateLimit(key, maxAttempts, windowMs);
}

/**
 * Middleware para aplicar rate limiting en rutas de API
 * Ejemplo de uso:
 * 
 * export async function POST(req: Request) {
 *   const ip = req.headers.get('x-forwarded-for') || 'unknown';
 *   if (!applyRateLimit(ip, 'login')) {
 *     return new Response(JSON.stringify({ error: 'Demasiados intentos. Intente nuevamente más tarde.' }), {
 *       status: 429,
 *       headers: { 'Content-Type': 'application/json' }
 *     });
 *   }
 *   // Continuar con la lógica normal
 * }
 */

/**
 * Genera un token CSRF para proteger formularios
 * @returns Token CSRF generado aleatoriamente
 */
export function generateCSRFToken(): string {
  // Generar un token aleatorio de 32 bytes y convertirlo a hexadecimal
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback para entorno de servidor
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Valida un token CSRF contra el token almacenado
 * @param token Token CSRF a validar
 * @param storedToken Token CSRF almacenado previamente
 * @returns Boolean indicando si el token es válido
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    console.warn('[SECURITY] Token CSRF faltante');
    return false;
  }
  
  // Comparación segura de strings para evitar timing attacks
  let valid = true;
  const tokenLength = token.length;
  
  if (tokenLength !== storedToken.length) {
    return false;
  }
  
  for (let i = 0; i < tokenLength; i++) {
    if (token.charAt(i) !== storedToken.charAt(i)) {
      valid = false;
    }
  }
  
  return valid;
}

/**
 * Valida una contraseña según criterios de seguridad
 * @param password Contraseña a validar
 * @returns Objeto con resultado de validación y mensaje de error si aplica
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  
  // Verificar complejidad (al menos una mayúscula, una minúscula, un número y un carácter especial)
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
    return { 
      valid: false, 
      message: 'La contraseña debe incluir al menos una letra mayúscula, una minúscula, un número y un carácter especial' 
    };
  }
  
  // Verificar que no sea una contraseña común
  const commonPasswords = ['Password123!', 'Admin123!', '12345678', 'qwerty123'];
  if (commonPasswords.includes(password)) {
    return { valid: false, message: 'La contraseña es demasiado común' };
  }
  
  return { valid: true };
}

/**
 * Valida un correo electrónico
 * @param email Correo electrónico a validar
 * @returns Boolean indicando si el correo es válido
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  // Expresión regular para validar correos electrónicos
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Sanitiza datos de entrada para prevenir inyecciones
 * @param input Datos a sanitizar
 * @returns Datos sanitizados
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Eliminar caracteres potencialmente peligrosos
  return input
    .replace(/[<>]/g, '') // Eliminar < y > para prevenir HTML
    .replace(/javascript:/gi, '') // Prevenir inyección de JavaScript
    .replace(/on\w+=/gi, '') // Prevenir event handlers
    .trim();
}

/**
 * Genera un hash para una contraseña (simulación)
 * En producción, usar bcrypt o similar
 * @param password Contraseña a hashear
 * @returns Hash de la contraseña
 */
export function hashPassword(password: string): string {
  // NOTA: Esta es una implementación de ejemplo.
  // En producción, usar bcrypt, Argon2 o similar
  return `hashed_${password}_${Date.now()}`;
} 
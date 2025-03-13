/**
 * Implementación de rate limiting para proteger endpoints críticos
 * Utiliza un Map en memoria para almacenar los intentos por IP y endpoint
 */

// Almacena los intentos por clave (endpoint:ip)
const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

// Intervalo de limpieza en ms (cada 5 minutos)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Configurar limpieza periódica de entradas expiradas
if (typeof global !== 'undefined') {
  // Solo ejecutar en el servidor, no en el cliente
  setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL);
}

/**
 * Aplica rate limiting basado en una clave (generalmente endpoint:ip)
 * 
 * @param key Clave única para identificar la solicitud (ej: 'login:192.168.1.1')
 * @param maxAttempts Número máximo de intentos permitidos en la ventana de tiempo
 * @param windowMs Ventana de tiempo en milisegundos
 * @returns Objeto con información sobre el resultado del rate limiting
 */
export function rateLimit(
  key: string, 
  maxAttempts: number = 5, 
  windowMs: number = 60 * 1000
): { 
  success: boolean; 
  limit: number; 
  remaining: number; 
  resetTime: number;
} {
  const now = Date.now();
  
  // Verificar si existe un registro para esta clave
  const record = rateLimitStore.get(key);
  
  // Si no hay registro o ha expirado, crear uno nuevo
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime
    });
    return {
      success: true,
      limit: maxAttempts,
      remaining: maxAttempts - 1,
      resetTime
    };
  }
  
  // Si hay un registro válido, incrementar contador y verificar límite
  record.count += 1;
  
  // Actualizar el registro en el store
  rateLimitStore.set(key, record);
  
  // Calcular intentos restantes
  const remaining = Math.max(0, maxAttempts - record.count);
  
  return {
    success: record.count <= maxAttempts,
    limit: maxAttempts,
    remaining,
    resetTime: record.resetTime
  };
}

/**
 * Limpia las entradas expiradas del store de rate limiting
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  // Usar Array.from para evitar problemas con el iterador de Map
  const entries = Array.from(rateLimitStore.entries());
  
  let expiredCount = 0;
  entries.forEach(([key, record]) => {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
      expiredCount++;
    }
  });
  
  if (expiredCount > 0 && process.env.NODE_ENV === 'development') {
    // Removed console.log
  }
}

/**
 * Middleware para aplicar rate limiting en rutas de API
 * 
 * @param ip Dirección IP del cliente
 * @param endpoint Nombre del endpoint (ej: 'login', 'register')
 * @param maxAttempts Número máximo de intentos permitidos en la ventana de tiempo
 * @param windowMs Ventana de tiempo en milisegundos
 * @returns Objeto con información sobre el resultado del rate limiting y headers para la respuesta
 */
export function applyRateLimit(
  ip: string, 
  endpoint: string, 
  maxAttempts: number = 5, 
  windowMs: number = 60 * 1000
): { 
  success: boolean; 
  headers: Record<string, string>;
  message?: string;
} {
  // Sanitizar IP para evitar inyecciones
  const sanitizedIp = ip.replace(/[^0-9a-fA-F.:]/g, '');
  const key = `${endpoint}:${sanitizedIp}`;
  
  const result = rateLimit(key, maxAttempts, windowMs);
  
  // Generar headers para la respuesta HTTP
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
  };
  
  if (!result.success) {
    // Añadir header Retry-After si se ha excedido el límite
    const retryAfterSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
    headers['Retry-After'] = retryAfterSeconds.toString();
  }
  
  return {
    success: result.success,
    headers,
    message: result.success ? undefined : `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`
  };
} 
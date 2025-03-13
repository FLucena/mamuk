import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;

  try {
    const multi = redis.multi();
    multi.incr(windowKey);
    multi.pexpire(windowKey, windowMs);
    
    const [count] = await multi.exec() as [number, any];
    return count <= limit;
  } catch (error) {
    console.error('Rate limit error:', error);
    // En caso de error con Redis, permitimos la petición
    return true;
  }
}

export async function recordSecurityEvent(
  type: 'auth_failure' | 'rate_limit' | 'invalid_input' | 'suspicious_activity',
  details: Record<string, any>
): Promise<void> {
  const event = {
    type,
    timestamp: new Date().toISOString(),
    ...details,
  };

  try {
    await redis.lpush('security_events', JSON.stringify(event));
    // Mantener solo los últimos 1000 eventos
    await redis.ltrim('security_events', 0, 999);
  } catch (error) {
    console.error('Error recording security event:', error);
  }
}

export default redis; 
import redis from '../src/lib/utils/redis';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface SecurityEvent {
  type: string;
  ip?: string;
  path?: string;
  timestamp: string;
  details: any;
}

interface SecurityReport {
  timestamp: string;
  npmAudit: any;
  outdatedDependencies: Record<string, any>;
  securityEvents: SecurityEventAnalysis;
  recommendations: string[];
}

interface SecurityEventAnalysis {
  totalEvents: number;
  eventsByType: Record<string, number>;
  suspiciousIPs: SuspiciousIP[];
  rateLimitBreaches: Record<string, number>;
}

interface SuspiciousIP {
  ip: string;
  count: number;
}

async function runNpmAudit() {
  try {
    const { stdout } = await execAsync('npm audit --json');
    return JSON.parse(stdout);
  } catch (error: any) {
    // npm audit devuelve código de error si encuentra vulnerabilidades
    if (error.stdout) {
      return JSON.parse(error.stdout);
    }
    throw error;
  }
}

async function checkDependencyUpdates() {
  const { stdout } = await execAsync('npm outdated --json');
  return stdout ? JSON.parse(stdout) : {};
}

async function analyzeSecurityEvents(): Promise<SecurityEventAnalysis> {
  const rawEvents = await redis.lrange('security_events', 0, -1);
  const parsedEvents = rawEvents.map((event: string) => JSON.parse(event) as SecurityEvent);

  // Agrupar eventos por tipo
  const eventsByType = parsedEvents.reduce((acc: Record<string, SecurityEvent[]>, event: SecurityEvent) => {
    if (!acc[event.type]) acc[event.type] = [];
    acc[event.type].push(event);
    return acc;
  }, {});

  // Convertir el objeto a array de entradas tipadas
  const typedEntries = Object.entries(eventsByType) as [string, SecurityEvent[]][];

  // Analizar patrones sospechosos
  const analysis: SecurityEventAnalysis = {
    totalEvents: rawEvents.length,
    eventsByType: Object.fromEntries(
      typedEntries.map(([type, events]) => [type, events.length])
    ),
    suspiciousIPs: findSuspiciousIPs(parsedEvents),
    rateLimitBreaches: findRateLimitBreaches(parsedEvents),
  };

  return analysis;
}

function findSuspiciousIPs(events: SecurityEvent[]) {
  const ipCounts = events.reduce((acc: Record<string, number>, event) => {
    if (event.ip) {
      acc[event.ip] = (acc[event.ip] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(ipCounts)
    .filter(([_, count]) => count > 100)
    .map(([ip, count]) => ({ ip, count }));
}

function findRateLimitBreaches(events: SecurityEvent[]) {
  return events
    .filter(event => event.type === 'rate_limit')
    .reduce((acc: Record<string, number>, event) => {
      const key = `${event.ip}:${event.path}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
}

async function generateReport(): Promise<SecurityReport> {
  const [npmAudit, outdatedDeps, securityEvents] = await Promise.all([
    runNpmAudit(),
    checkDependencyUpdates(),
    analyzeSecurityEvents(),
  ]);

  const report: SecurityReport = {
    timestamp: new Date().toISOString(),
    npmAudit,
    outdatedDependencies: outdatedDeps,
    securityEvents,
    recommendations: [],
  };

  // Generar recomendaciones
  if (npmAudit.vulnerabilities) {
    report.recommendations.push('Se encontraron vulnerabilidades en las dependencias. Actualizar paquetes afectados.');
  }

  if (Object.keys(outdatedDeps).length > 0) {
    report.recommendations.push('Hay dependencias desactualizadas. Considerar actualización.');
  }

  if (securityEvents.suspiciousIPs.length > 0) {
    report.recommendations.push('Se detectaron IPs sospechosas. Considerar bloqueo.');
  }

  // Guardar reporte
  const reportPath = path.join(process.cwd(), 'security-reports');
  await fs.mkdir(reportPath, { recursive: true });
  await fs.writeFile(
    path.join(reportPath, `security-report-${Date.now()}.json`),
    JSON.stringify(report, null, 2)
  );

  return report;
}

// Ejecutar auditoría
generateReport()
  .then(report => {
    console.log('Reporte de seguridad generado:', report);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error generando reporte:', error);
    process.exit(1);
  }); 
import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Ejecutar la auditoría todos los días a las 3 AM
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('Iniciando auditoría de seguridad programada:', new Date().toISOString());
    
    // Ejecutar el script de auditoría
    const scriptPath = path.join(process.cwd(), 'scripts', 'security-audit.ts');
    await execAsync(`ts-node ${scriptPath}`);
    
    console.log('Auditoría de seguridad completada:', new Date().toISOString());
  } catch (error) {
    console.error('Error durante la auditoría de seguridad:', error);
  }
}); 
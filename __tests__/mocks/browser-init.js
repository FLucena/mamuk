// Este archivo se ejecuta en el navegador durante el desarrollo
import { worker } from './browser'

// Iniciar el worker
worker.start({
  // Mostrar mensajes de depuración en la consola del navegador
  onUnhandledRequest: 'bypass',
}) 
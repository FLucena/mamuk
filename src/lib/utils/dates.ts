/**
 * Formatear una fecha para mostrarla como fecha de creación
 * @param date La fecha a formatear
 * @returns La fecha formateada como string
 */
export function formatCreatedAt(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'fecha desconocida';
  }

  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatear una fecha para mostrarla en formato corto
 * @param date La fecha a formatear
 * @returns La fecha formateada como string
 */
export function formatShortDate(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '--/--/----';
  }

  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatear una fecha para mostrarla con hora
 * @param date La fecha a formatear
 * @returns La fecha formateada como string
 */
export function formatDateTime(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'fecha y hora desconocida';
  }

  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
} 
'use client';

import { useState } from 'react';

// Definimos las posibles insignias/reconocimientos
export const INSIGNIAS = [
  { id: 'constancia', nombre: 'Constancia', descripcion: '7 días seguidos de entrenamiento', icono: '🏆', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
  { id: 'fuerza', nombre: 'Fuerza', descripcion: 'Alcanzaste un nuevo máximo en tu ejercicio', icono: '💪', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' },
  { id: 'dedicacion', nombre: 'Dedicación', descripcion: '30 días seguidos en la plataforma', icono: '⭐', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
  { id: 'desafio', nombre: 'Desafío', descripcion: 'Completaste un desafío especial', icono: '🔥', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' },
  { id: 'progreso', nombre: 'Progreso', descripcion: 'Mejora constante en tus rutinas', icono: '📈', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
  { id: 'nutricion', nombre: 'Nutrición', descripcion: 'Mantenimiento de dieta balanceada', icono: '🥗', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' },
  { id: 'hidratacion', nombre: 'Hidratación', descripcion: 'Registraste tu consumo de agua diario', icono: '💧', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300' },
  { id: 'social', nombre: 'Social', descripcion: 'Compartiste tus logros con amigos', icono: '👥', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' },
  { id: 'experto', nombre: 'Experto', descripcion: 'Dominaste todos los ejercicios de una categoría', icono: '🏅', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300' },
  { id: 'madrugador', nombre: 'Madrugador', descripcion: 'Entrenaste temprano por 5 días seguidos', icono: '🌅', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' },
];

interface UserBadgesProps {
  insigniasObtenidas?: string[];
  displayFormat?: 'grid' | 'list' | 'carousel';
  maxBadges?: number;
}

export default function UserBadges({
  insigniasObtenidas = ['constancia', 'progreso'],
  displayFormat = 'grid',
  maxBadges = 0
}: UserBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  
  const badgesToShow = maxBadges > 0 
    ? insigniasObtenidas.slice(0, maxBadges) 
    : insigniasObtenidas;
  
  const insigniasFiltradas = INSIGNIAS.filter(insignia => 
    badgesToShow.includes(insignia.id)
  );
  
  const insigniaSeleccionada = selectedBadge 
    ? INSIGNIAS.find(insignia => insignia.id === selectedBadge) 
    : null;
  
  if (insigniasFiltradas.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
        <p className="text-gray-600 dark:text-gray-300">Aún no has obtenido insignias</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Completa desafíos y mantén constancia para ganar reconocimientos
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
        Insignias y Reconocimientos
      </h3>
      
      {/* Grid view */}
      {displayFormat === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {insigniasFiltradas.map((insignia) => (
            <div 
              key={insignia.id}
              className={`${insignia.color} p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={() => setSelectedBadge(insignia.id === selectedBadge ? null : insignia.id)}
            >
              <div className="flex items-center">
                <div className="text-2xl mr-2">{insignia.icono}</div>
                <div>
                  <p className="font-medium text-sm">{insignia.nombre}</p>
                  {selectedBadge === insignia.id && (
                    <p className="text-xs mt-1">{insignia.descripcion}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* List view */}
      {displayFormat === 'list' && (
        <div className="space-y-2">
          {insigniasFiltradas.map((insignia) => (
            <div 
              key={insignia.id}
              className={`${insignia.color} p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={() => setSelectedBadge(insignia.id === selectedBadge ? null : insignia.id)}
            >
              <div className="flex items-center">
                <div className="text-2xl mr-3">{insignia.icono}</div>
                <div>
                  <p className="font-medium">{insignia.nombre}</p>
                  <p className="text-xs opacity-80">{insignia.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Carousel view */}
      {displayFormat === 'carousel' && (
        <div className="relative">
          <div className="flex items-center space-x-3 overflow-x-auto py-2 px-1 scrollbar-hide">
            {insigniasFiltradas.map((insignia) => (
              <div 
                key={insignia.id}
                className={`${insignia.color} p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0 w-24 h-24 flex flex-col items-center justify-center ${selectedBadge === insignia.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedBadge(insignia.id === selectedBadge ? null : insignia.id)}
              >
                <div className="text-3xl mb-1">{insignia.icono}</div>
                <p className="font-medium text-xs text-center">{insignia.nombre}</p>
              </div>
            ))}
          </div>
          
          {/* Detalle de la insignia seleccionada */}
          {insigniaSeleccionada && (
            <div className={`mt-4 p-4 rounded-lg ${insigniaSeleccionada.color}`}>
              <div className="flex items-center mb-2">
                <div className="text-3xl mr-3">{insigniaSeleccionada.icono}</div>
                <div>
                  <p className="font-bold">{insigniaSeleccionada.nombre}</p>
                </div>
              </div>
              <p className="text-sm">{insigniaSeleccionada.descripcion}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Mostrar que hay más insignias si es necesario */}
      {maxBadges > 0 && insigniasObtenidas.length > maxBadges && (
        <p className="text-right mt-3 text-sm text-blue-600 dark:text-blue-400">
          + {insigniasObtenidas.length - maxBadges} más
        </p>
      )}
    </div>
  );
} 
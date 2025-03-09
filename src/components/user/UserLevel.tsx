'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

// Definimos los niveles de usuario
export const NIVELES_USUARIO = [
  { nombre: 'Monito', rango: 0, color: 'text-gray-500', bg: 'bg-gray-500', descripcion: 'Bienvenido a tu viaje fitness. Apenas estás comenzando.' },
  { nombre: 'Chimpancé', rango: 1, color: 'text-green-500', bg: 'bg-green-500', descripcion: 'Estás desarrollando hábitos de entrenamiento constantes.' },
  { nombre: 'Orangután', rango: 2, color: 'text-blue-500', bg: 'bg-blue-500', descripcion: 'Muestra consistencia y mejoras en tu rendimiento.' },
  { nombre: 'Gorila', rango: 3, color: 'text-purple-500', bg: 'bg-purple-500', descripcion: 'Has logrado importantes avances y superado muchos desafíos.' },
  { nombre: 'King Kong', rango: 4, color: 'text-yellow-500', bg: 'bg-yellow-500', descripcion: '¡Felicidades! Has alcanzado el nivel máximo de experiencia.' }
];

interface UserLevelProps {
  nivel?: number;
  puntos?: number;
  puntosNecesariosParaSiguienteNivel?: number;
  showDescription?: boolean;
}

export default function UserLevel({ 
  nivel = 0, 
  puntos = 0, 
  puntosNecesariosParaSiguienteNivel = 100,
  showDescription = false
}: UserLevelProps) {
  const [animateBadge, setAnimateBadge] = useState(false);
  
  useEffect(() => {
    // Pequeña animación cuando el componente se monta
    setAnimateBadge(true);
    const timer = setTimeout(() => setAnimateBadge(false), 1000);
    return () => clearTimeout(timer);
  }, [nivel]);
  
  const nivelActual = NIVELES_USUARIO[nivel];
  const siguienteNivel = nivel < NIVELES_USUARIO.length - 1 ? NIVELES_USUARIO[nivel + 1] : null;
  const porcentaje = Math.min(100, Math.round((puntos / puntosNecesariosParaSiguienteNivel) * 100));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <div className={`relative ${animateBadge ? 'animate-pulse' : ''}`}>
          <Icon icon="FiAward" className={`w-8 h-8 ${nivelActual.color}`} />
          <span className={`absolute -top-1 -right-1 text-xs font-bold rounded-full ${nivelActual.bg} text-white w-5 h-5 flex items-center justify-center`}>
            {nivel + 1}
          </span>
        </div>
        <div className="ml-3">
          <h3 className={`text-lg font-bold ${nivelActual.color}`}>{nivelActual.nombre}</h3>
          {showDescription && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{nivelActual.descripcion}</p>
          )}
        </div>
      </div>
      
      {siguienteNivel && (
        <>
          <div className="flex justify-between text-sm mb-1">
            <span className={nivelActual.color}>{nivelActual.nombre}</span>
            <span className={siguienteNivel.color}>{siguienteNivel.nombre}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
            <div 
              className={`h-2.5 rounded-full ${nivelActual.bg} transition-all duration-1000`} 
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
            {puntos} / {puntosNecesariosParaSiguienteNivel} puntos
          </div>
        </>
      )}
      
      {!siguienteNivel && (
        <div className="text-center py-2 px-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            ¡Has alcanzado el nivel máximo! Eres un verdadero King Kong.
          </p>
        </div>
      )}
    </div>
  );
} 
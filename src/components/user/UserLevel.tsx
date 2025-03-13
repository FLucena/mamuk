'use client';

import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';

// Definimos los niveles de usuario
export const NIVELES_USUARIO = [
  { nombre: 'Monito', rango: 0, color: 'text-gray-500', bg: 'bg-gray-500', descripcion: 'Bienvenido a tu viaje fitness. Apenas estás comenzando.' },
  { nombre: 'Chimpancé', rango: 1, color: 'text-green-500', bg: 'bg-green-500', descripcion: 'Estás desarrollando hábitos de entrenamiento constantes.' },
  { nombre: 'Orangután', rango: 2, color: 'text-blue-500', bg: 'bg-blue-500', descripcion: 'Muestra consistencia y mejoras en tu rendimiento.' },
  { nombre: 'Gorila', rango: 3, color: 'text-purple-500', bg: 'bg-purple-500', descripcion: 'Has logrado importantes avances y superado muchos desafíos.' },
  { nombre: 'King Kong', rango: 4, color: 'text-yellow-500', bg: 'bg-yellow-500', descripcion: '¡Felicidades! Has alcanzado el nivel máximo de experiencia.' }
];

interface UserLevelProps {
  level: number;
  experience: number;
  nextLevelExperience: number;
}

export default function UserLevel({ level, experience, nextLevelExperience }: UserLevelProps) {
  const progress = (experience / nextLevelExperience) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Award className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white ml-2">
          Nivel {level}
        </h2>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{experience} XP</span>
          <span>{nextLevelExperience} XP</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className="h-2 bg-yellow-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {nextLevelExperience - experience} XP para el siguiente nivel
        </p>
      </div>
    </div>
  );
} 
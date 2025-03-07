'use client';

import { useState } from 'react';
import { FiBook, FiActivity, FiHeart, FiTrendingUp } from 'react-icons/fi';

const categories = [
  {
    name: 'Principiantes',
    icon: FiBook,
    description: 'Guías básicas para comenzar tu viaje fitness'
  },
  {
    name: 'Entrenamiento',
    icon: FiActivity,
    description: 'Técnicas y rutinas de ejercicio'
  },
  {
    name: 'Nutrición',
    icon: FiHeart,
    description: 'Consejos de alimentación y dieta'
  },
  {
    name: 'Progreso',
    icon: FiTrendingUp,
    description: 'Seguimiento y medición de resultados'
  }
];

const guides = [
  {
    category: 'Principiantes',
    title: 'Primeros pasos en el gimnasio',
    description: 'Una guía completa para tu primera semana de entrenamiento',
    readTime: '10 min',
    difficulty: 'Básico'
  },
  {
    category: 'Principiantes',
    title: 'Conceptos básicos de nutrición',
    description: 'Aprende los fundamentos de una alimentación saludable',
    readTime: '8 min',
    difficulty: 'Básico'
  },
  {
    category: 'Entrenamiento',
    title: 'Técnica correcta de sentadillas',
    description: 'Guía detallada para realizar sentadillas de forma segura',
    readTime: '12 min',
    difficulty: 'Intermedio'
  },
  {
    category: 'Entrenamiento',
    title: 'Rutina de peso corporal',
    description: 'Ejercicios efectivos sin equipamiento',
    readTime: '15 min',
    difficulty: 'Intermedio'
  },
  {
    category: 'Nutrición',
    title: 'Planificación de comidas semanal',
    description: 'Cómo preparar tus comidas para la semana',
    readTime: '20 min',
    difficulty: 'Avanzado'
  },
  {
    category: 'Nutrición',
    title: 'Suplementos esenciales',
    description: 'Guía básica de suplementación deportiva',
    readTime: '10 min',
    difficulty: 'Intermedio'
  },
  {
    category: 'Progreso',
    title: 'Medición de progreso efectiva',
    description: 'Métodos para trackear tus avances',
    readTime: '8 min',
    difficulty: 'Básico'
  },
  {
    category: 'Progreso',
    title: 'Superando mesetas',
    description: 'Estrategias para continuar progresando',
    readTime: '15 min',
    difficulty: 'Avanzado'
  }
];

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredGuides = selectedCategory === 'Todos'
    ? guides
    : guides.filter(guide => guide.category === selectedCategory);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Guías y Tutoriales
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Aprende todo lo necesario para alcanzar tus objetivos
          </p>
        </div>

        {/* Categories */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`p-6 rounded-lg shadow-md text-left transition-all ${
              selectedCategory === 'Todos'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <h3 className={`text-lg font-semibold ${
              selectedCategory === 'Todos'
                ? 'text-white'
                : 'text-gray-900 dark:text-white'
            }`}>
              Todos
            </h3>
            <p className={
              selectedCategory === 'Todos'
                ? 'text-blue-100'
                : 'text-gray-500 dark:text-gray-400'
            }>
              Ver todas las guías
            </p>
          </button>
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.name)}
                className={`p-6 rounded-lg shadow-md text-left transition-all ${
                  selectedCategory === category.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 ${
                  selectedCategory === category.name
                    ? 'text-white'
                    : 'text-blue-500 dark:text-blue-400'
                }`} />
                <h3 className={`mt-4 text-lg font-semibold ${
                  selectedCategory === category.name
                    ? 'text-white'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {category.name}
                </h3>
                <p className={
                  selectedCategory === category.name
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }>
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Guides Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {guide.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {guide.readTime}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
                  {guide.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {guide.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    guide.difficulty === 'Básico'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : guide.difficulty === 'Intermedio'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {guide.difficulty}
                  </span>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                    Leer más →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
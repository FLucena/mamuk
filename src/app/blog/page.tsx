'use client';

import { useState } from 'react';
import Icon, { IconName } from '@/components/ui/Icon';

const categories = [
  'Entrenamiento',
  'Nutrición',
  'Motivación',
  'Salud',
  'Estilo de vida',
  'Recuperación'
];

const articles = [
  {
    id: 1,
    title: 'Cómo optimizar tu rutina de entrenamiento',
    excerpt: 'Descubre las mejores estrategias para maximizar tus resultados en el gimnasio...',
    author: 'Carlos Ruiz',
    date: '2024-03-15',
    category: 'Entrenamiento',
    readTime: '8 min',
    image: '/blog/workout-optimization.jpg',
    featured: true
  },
  {
    id: 2,
    title: 'Nutrición pre y post entrenamiento',
    excerpt: 'La alimentación adecuada antes y después de entrenar es crucial para...',
    author: 'María González',
    date: '2024-03-12',
    category: 'Nutrición',
    readTime: '6 min',
    image: '/blog/nutrition.jpg',
    featured: true
  },
  {
    id: 3,
    title: 'Mantén la motivación durante todo el año',
    excerpt: 'Estrategias prácticas para mantener la consistencia en tu rutina...',
    author: 'Ana Martínez',
    date: '2024-03-10',
    category: 'Motivación',
    readTime: '5 min',
    image: '/blog/motivation.jpg',
    featured: false
  },
  {
    id: 4,
    title: 'Importancia del descanso en el entrenamiento',
    excerpt: 'El descanso es tan importante como el ejercicio. Aprende por qué...',
    author: 'David López',
    date: '2024-03-08',
    category: 'Recuperación',
    readTime: '7 min',
    image: '/blog/rest-recovery.jpg',
    featured: false
  },
  {
    id: 5,
    title: 'Hábitos saludables para deportistas',
    excerpt: 'Incorpora estos hábitos diarios para mejorar tu rendimiento...',
    author: 'Laura Sánchez',
    date: '2024-03-05',
    category: 'Estilo de vida',
    readTime: '10 min',
    image: '/blog/healthy-habits.jpg',
    featured: false
  }
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  const filteredArticles = selectedCategory === 'Todos'
    ? articles
    : articles.filter(article => article.category === selectedCategory);

  const featuredArticles = articles.filter(article => article.featured);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Blog
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Artículos y consejos sobre fitness, nutrición y bienestar
          </p>
        </div>

        {/* Featured Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Artículos destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredArticles.map(article => (
              <div
                key={article.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700">
                  {/* Image placeholder */}
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <span className="flex items-center">
                      <Icon icon="FiUser" className="w-4 h-4 mr-1" />
                      {article.author}
                    </span>
                    <span className="flex items-center">
                      <Icon icon="FiCalendar" className="w-4 h-4 mr-1" />
                      {new Date(article.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Icon icon="FiTag" className="w-4 h-4 mr-1" />
                      {article.category}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {article.readTime} de lectura
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

        {/* Categories */}
        <div className="mt-12">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('Todos')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'Todos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Todos
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <div
              key={article.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700">
                {/* Image placeholder */}
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                  <span className="flex items-center">
                    <Icon icon="FiUser" className="w-4 h-4 mr-1" />
                    {article.author}
                  </span>
                  <span className="flex items-center">
                    <Icon icon="FiCalendar" className="w-4 h-4 mr-1" />
                    {new Date(article.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {article.excerpt}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {article.readTime} de lectura
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
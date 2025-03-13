'use client';

import { useState } from 'react';
import { IconWrapper } from '@/components/ui/IconWrapper';
import { Search, BookOpen, Video, FileText, HelpCircle } from 'lucide-react';

const categories = [
  {
    title: 'Primeros Pasos',
    icon: BookOpen,
    articles: [
      {
        title: 'Cómo configurar tu cuenta',
        description: 'Guía paso a paso para configurar tu perfil y preferencias',
        readTime: '5 min'
      },
      {
        title: 'Tour por la plataforma',
        description: 'Conoce todas las funcionalidades disponibles',
        readTime: '10 min'
      },
      {
        title: 'Configuración inicial',
        description: 'Personaliza tu experiencia en la plataforma',
        readTime: '7 min'
      }
    ]
  },
  {
    title: 'Tutoriales en Video',
    icon: Video,
    articles: [
      {
        title: 'Cómo crear tu primera rutina',
        description: 'Aprende a diseñar rutinas efectivas',
        readTime: '8 min'
      },
      {
        title: 'Seguimiento de progreso',
        description: 'Utiliza las herramientas de tracking',
        readTime: '6 min'
      },
      {
        title: 'Comunicación con entrenadores',
        description: 'Saca el máximo provecho de tu entrenador',
        readTime: '5 min'
      }
    ]
  },
  {
    title: 'Guías Detalladas',
    icon: FileText,
    articles: [
      {
        title: 'Nutrición y dieta',
        description: 'Guía completa de alimentación',
        readTime: '15 min'
      },
      {
        title: 'Técnicas de ejercicios',
        description: 'Biblioteca de ejercicios con instrucciones',
        readTime: '20 min'
      },
      {
        title: 'Planificación de objetivos',
        description: 'Establece y alcanza tus metas',
        readTime: '10 min'
      }
    ]
  },
  {
    title: 'Solución de Problemas',
    icon: HelpCircle,
    articles: [
      {
        title: 'Problemas comunes',
        description: 'Soluciones a problemas frecuentes',
        readTime: '8 min'
      },
      {
        title: 'Preguntas frecuentes',
        description: 'Respuestas a dudas habituales',
        readTime: '12 min'
      },
      {
        title: 'Contacto con soporte',
        description: 'Cómo obtener ayuda adicional',
        readTime: '3 min'
      }
    ]
  }
];

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  return (
    <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Centro de Ayuda
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Encuentra toda la información que necesitas para usar nuestra plataforma
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar artículos, tutoriales y guías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {filteredCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <IconWrapper icon={category.icon} className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  <h2 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>
                <div className="mt-6 space-y-6">
                  {category.articles.map((article, articleIndex) => (
                    <div
                      key={articleIndex}
                      className="group cursor-pointer"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {article.title}
                      </h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {article.description}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {article.readTime} de lectura
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Enlaces Rápidos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/support"
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <HelpCircle className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <span className="ml-3 text-gray-900 dark:text-white">Soporte Técnico</span>
            </a>
            <a
              href="/guides"
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <BookOpen className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <span className="ml-3 text-gray-900 dark:text-white">Guías y Tutoriales</span>
            </a>
            <a
              href="/contact"
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <span className="ml-3 text-gray-900 dark:text-white">Documentación</span>
            </a>
            <a
              href="/blog"
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Video className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <span className="ml-3 text-gray-900 dark:text-white">Videotutoriales</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
} 
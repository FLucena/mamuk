'use client';

import { IconWrapper } from '@/components/ui/IconWrapper';
import { Target, Users, Activity, Award, TrendingUp, Shield } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Entrenamiento Personalizado',
    description: 'Rutinas adaptadas a tus objetivos, nivel y disponibilidad. Cada plan es único, como tú.'
  },
  {
    icon: Users,
    title: 'Coaches Expertos',
    description: 'Accede a entrenadores certificados con experiencia en diferentes disciplinas y objetivos.'
  },
  {
    icon: Activity,
    title: 'Seguimiento en Tiempo Real',
    description: 'Monitorea tu progreso, registra tus entrenamientos y ajusta tus objetivos sobre la marcha.'
  },
  {
    icon: Award,
    title: 'Sistema de Logros',
    description: 'Mantente motivado con nuestro sistema de niveles e insignias que reconocen tu dedicación.'
  },
  {
    icon: TrendingUp,
    title: 'Análisis de Progreso',
    description: 'Visualiza tu evolución con gráficos detallados y métricas personalizadas.'
  },
  {
    icon: Shield,
    title: 'Seguridad y Privacidad',
    description: 'Tus datos están seguros con nosotros. Utilizamos la última tecnología en seguridad.'
  }
];

export default function FeaturesPage() {
  return (
    <main className="py-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Características de Mamuk
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Todo lo que necesitas para alcanzar tus objetivos fitness
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <IconWrapper icon={feature.icon} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¿Listo para empezar?
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Únete a nuestra comunidad y comienza tu viaje hacia una vida más saludable
          </p>
          <div className="mt-8">
            <a
              href="/auth/signin"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Comenzar ahora
            </a>
          </div>
        </div>
      </div>
    </main>
  );
} 
'use client';

import Image from 'next/image';
import { IconWrapper } from '@/components/ui/IconWrapper';
import { Heart, Target, Users } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Pasión por el bienestar',
    description: 'Creemos en un enfoque holístico del fitness que integra cuerpo y mente.'
  },
  {
    icon: Target,
    title: 'Compromiso con resultados',
    description: 'Nos enfocamos en ayudarte a alcanzar tus metas de manera sostenible y saludable.'
  },
  {
    icon: Users,
    title: 'Comunidad inclusiva',
    description: 'Construimos un espacio donde todos son bienvenidos, sin importar su nivel de experiencia.'
  }
];

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

const team: TeamMember[] = [
  {
    name: 'Ana García',
    role: 'CEO & Fundadora',
    image: '/team/ana.jpg',
    bio: 'Experta en fitness con más de 10 años de experiencia en la industria.'
  },
  {
    name: 'Carlos Rodríguez',
    role: 'Director de Entrenamiento',
    image: '/team/carlos.jpg',
    bio: 'Especialista en nutrición deportiva y entrenamiento personalizado.'
  },
  {
    name: 'Laura Martínez',
    role: 'Jefa de Tecnología',
    image: '/team/laura.jpg',
    bio: 'Ingeniera de software apasionada por la tecnología fitness.'
  }
];

// Function to determine if an image should have priority based on its index
function shouldHavePriority(index: number): boolean {
  return index < 2; // Only prioritize loading the first two images
}

export default function AboutPage() {
  return (
    <main className="bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Sobre Mamuk
          </h1>
          <p className="text-xl text-blue-100">
            Transformando vidas a través del fitness personalizado
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Nuestra Misión
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            En Mamuk, nos dedicamos a hacer el fitness accesible y efectivo para todos. 
            Combinamos tecnología avanzada con experiencia en entrenamiento para ofrecer 
            soluciones personalizadas que se adaptan a tu estilo de vida.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <IconWrapper icon={value.icon} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Nuestro Equipo
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Conoce a las personas detrás de Mamuk
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
            >
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 dark:bg-gray-700">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={300}
                  height={300}
                  className="object-cover"
                  {...(shouldHavePriority(index) ? { priority: true } : {})}
                  loading={shouldHavePriority(index) ? 'eager' : 'lazy'}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 
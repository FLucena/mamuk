import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import SchemaOrg from '@/components/SchemaOrg';
import { generateOrganizationSchema, generateWebPageSchema, generateFAQSchema } from '@/lib/utils/schema';
import type { Viewport } from 'next';

// Configuración de viewport para la página principal
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#f9fafb', // Color gris claro que coincide con el bg-gray-50
  colorScheme: 'light'
};

// Preguntas frecuentes para el esquema FAQ
const faqs = [
  {
    question: '¿Qué es Mamuk Training?',
    answer: 'Mamuk es una plataforma que conecta entrenadores personales con clientes para crear y gestionar rutinas de entrenamiento personalizadas.'
  },
  {
    question: '¿Cómo puedo registrarme como entrenador?',
    answer: 'Puedes registrarte como entrenador desde la página de registro seleccionando la opción "Soy entrenador" y completando la información requerida.'
  },
  {
    question: '¿Es gratuito usar Mamuk?',
    answer: 'Ofrecemos un plan básico gratuito y planes premium con características adicionales para entrenadores y clientes.'
  }
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/workout');
  }

  // Generar esquemas para SEO
  const organizationSchema = generateOrganizationSchema();
  const webPageSchema = generateWebPageSchema(
    'Mamuk - Plataforma de Entrenamiento Personalizado',
    'Crea, gestiona y comparte rutinas de entrenamiento personalizadas. Mamuk te ayuda a alcanzar tus objetivos fitness con planes adaptados a tus necesidades.',
    process.env.NEXT_PUBLIC_APP_URL || 'https://mamuk.vercel.app'
  );
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* Esquemas JSON-LD para SEO */}
      <SchemaOrg schema={organizationSchema} />
      <SchemaOrg schema={webPageSchema} />
      <SchemaOrg schema={faqSchema} />
      
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="Mamuk Training Logo"
              width={200}
              height={200}
              className="mx-auto"
              priority
            />
            <h1 className="mt-6 text-4xl font-bold text-gray-900 dark:text-white">
              Mamuk Training
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Tu compañero de entrenamiento personal
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/signup"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </main>
    </>
  );
} 
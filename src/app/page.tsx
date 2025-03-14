import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import SchemaOrg from '@/components/SchemaOrg';
import { generateOrganizationSchema, generateWebPageSchema, generateFAQSchema } from '@/lib/utils/schema';
import { SignInButtons } from '@/components/auth/SignInButtons';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants/site';

// Enable incremental static regeneration with a 1 hour revalidation period
// This makes the page static for unauthenticated users, improving server response time
export const revalidate = 3600; // 1 hour

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
    question: '¿Qué beneficios tiene usar Mamuk?',
    answer: 'Mamuk te permite crear rutinas personalizadas, hacer seguimiento de tu progreso, recibir feedback de profesionales y compartir tus logros con la comunidad.'
  }
];

// Pre-generate the schema data for better performance
const organizationSchema = generateOrganizationSchema();
const webPageSchema = generateWebPageSchema(
  `${SITE_NAME} - ${SITE_DESCRIPTION}`,
  'Crea, gestiona y comparte rutinas de entrenamiento personalizadas. Mamuk te ayuda a alcanzar tus objetivos fitness con planes adaptados a tus necesidades.',
  process.env.NEXT_PUBLIC_APP_URL || SITE_URL
);
const faqSchema = generateFAQSchema(faqs);

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Si el usuario está autenticado, redirigir a la página de workout
  if (session?.user) {
    // Redirect authenticated users to the workout page
    redirect('/workout');
  }

  return (
    <>
      <SchemaOrg schema={organizationSchema} />
      <SchemaOrg schema={webPageSchema} />
      <SchemaOrg schema={faqSchema} />
      
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="Mamuk Training Logo"
              width={150}
              height={150}
              className="mx-auto"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Bienvenido a {SITE_NAME}
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
            {SITE_DESCRIPTION}
          </p>
          
          <div className="mb-8">
            <SignInButtons />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Crea Rutinas</h2>
              <p className="text-gray-600 dark:text-gray-300">Diseña rutinas de entrenamiento personalizadas adaptadas a tus objetivos y nivel de condición física.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Seguimiento</h2>
              <p className="text-gray-600 dark:text-gray-300">Realiza un seguimiento de tu progreso y visualiza tus mejoras a lo largo del tiempo.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Comunidad</h2>
              <p className="text-gray-600 dark:text-gray-300">Conecta con entrenadores profesionales y otros usuarios para compartir experiencias y motivación.</p>
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Preguntas Frecuentes</h2>
            <div className="max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <div key={index} className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-left">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{faq.question}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 mb-8">
            <Link 
              href="/about" 
              className="text-blue-600 dark:text-blue-400 hover:underline mr-6"
            >
              Sobre Nosotros
            </Link>
            <Link 
              href="/features" 
              className="text-blue-600 dark:text-blue-400 hover:underline mr-6"
            >
              Características
            </Link>
            <Link 
              href="/contact" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contacto
            </Link>
          </div>
        </div>
      </main>
    </>
  );
} 
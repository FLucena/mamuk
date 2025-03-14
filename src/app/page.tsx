import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SchemaOrg from '@/components/SchemaOrg';
import { generateOrganizationSchema, generateWebPageSchema, generateFAQSchema } from '@/lib/utils/schema';
import { SignInButtons } from '@/components/auth/SignInButtons';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants/site';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { ResponsiveHeading1, ResponsiveHeading2, ResponsiveHeading3, ResponsiveParagraph } from '@/components/ui/ResponsiveText';
import ResponsiveGrid from '@/components/ui/ResponsiveGrid';

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
        <ResponsiveContainer maxWidth="xl" className="py-8 md:py-12">
          <div className="text-center">
            <div className="mb-8">
              <ResponsiveImage
                src="/logo.png"
                alt="Mamuk Training Logo"
                width={150}
                height={150}
                className="mx-auto"
                priority
              />
            </div>
            <ResponsiveHeading1 className="mb-4 text-gray-900 dark:text-white">
              Bienvenido a {SITE_NAME}
            </ResponsiveHeading1>
            <ResponsiveParagraph className="mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-300 px-4 md:px-0">
              {SITE_DESCRIPTION}
            </ResponsiveParagraph>
            
            <div className="mb-8">
              <SignInButtons />
            </div>
            
            <ResponsiveGrid 
              cols={{ xs: 1, md: 3 }} 
              gap={{ xs: 4, md: 6 }}
              className="max-w-6xl mx-auto px-4"
            >
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
                <ResponsiveHeading3 className="mb-3 text-gray-900 dark:text-white">Crea Rutinas</ResponsiveHeading3>
                <ResponsiveParagraph className="text-gray-600 dark:text-gray-300">
                  Diseña rutinas de entrenamiento personalizadas adaptadas a tus objetivos y nivel de condición física.
                </ResponsiveParagraph>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
                <ResponsiveHeading3 className="mb-3 text-gray-900 dark:text-white">Seguimiento</ResponsiveHeading3>
                <ResponsiveParagraph className="text-gray-600 dark:text-gray-300">
                  Realiza un seguimiento de tu progreso y visualiza tus mejoras a lo largo del tiempo.
                </ResponsiveParagraph>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
                <ResponsiveHeading3 className="mb-3 text-gray-900 dark:text-white">Comunidad</ResponsiveHeading3>
                <ResponsiveParagraph className="text-gray-600 dark:text-gray-300">
                  Conecta con entrenadores profesionales y otros usuarios para compartir experiencias y motivación.
                </ResponsiveParagraph>
              </div>
            </ResponsiveGrid>
            
            <div className="mt-12">
              <ResponsiveHeading2 className="mb-6 text-gray-900 dark:text-white">Preguntas Frecuentes</ResponsiveHeading2>
              <div className="max-w-3xl mx-auto px-4 md:px-0">
                {faqs.map((faq, index) => (
                  <div key={index} className="mb-6 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md text-left">
                    <ResponsiveHeading3 className="mb-2 text-gray-900 dark:text-white">{faq.question}</ResponsiveHeading3>
                    <ResponsiveParagraph className="text-gray-600 dark:text-gray-300">{faq.answer}</ResponsiveParagraph>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </main>
    </>
  );
} 
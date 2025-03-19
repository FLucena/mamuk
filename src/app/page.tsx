import { redirect } from 'next/navigation';

// Enable incremental static regeneration with a 1 hour revalidation period
// This makes the page static for unauthenticated users, improving server response time
export const revalidate = 3600; // 1 hour

export default async function Home() {
  // Always redirect to workout page
  redirect('/workout');
  
  // The code below will never be executed due to the redirect
  // but is kept for reference in case you want to revert the change
  
  // Previous approach (commented out)
  /*
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
                centered
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
  */
} 
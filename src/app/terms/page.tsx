'use client';

export default function TermsPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Términos de Servicio
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Aceptación de los términos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Al acceder y utilizar Mamuk, aceptas estar sujeto a estos términos de servicio. 
              Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Descripción del servicio
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Mamuk es una plataforma de entrenamiento personalizado que ofrece servicios de 
              creación y seguimiento de rutinas de ejercicio. Nos reservamos el derecho de 
              modificar o descontinuar el servicio en cualquier momento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Cuentas de usuario
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Para utilizar nuestros servicios, debes crear una cuenta y proporcionar información 
              precisa y completa. Eres responsable de mantener la seguridad de tu cuenta y de 
              todas las actividades que ocurran bajo ella.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Privacidad y protección de datos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tu privacidad es importante para nosotros. Consulta nuestra Política de Privacidad 
              para entender cómo recopilamos, usamos y protegemos tus datos personales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Contenido del usuario
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Al publicar contenido en Mamuk, garantizas que tienes los derechos necesarios 
              sobre dicho contenido y nos otorgas una licencia para usarlo en relación con 
              nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Limitación de responsabilidad
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Mamuk se proporciona "tal cual" y no ofrecemos garantías sobre su disponibilidad 
              o resultados. No nos hacemos responsables de lesiones o daños que puedan resultar 
              del uso de nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Modificaciones de los términos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. 
              Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Contacto
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Si tienes preguntas sobre estos términos, contáctanos en info@mamuk.com
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
} 
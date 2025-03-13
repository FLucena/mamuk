'use client';

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Política de Privacidad
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Información que recopilamos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Recopilamos información que nos proporcionas directamente, incluyendo:
            </p>
            <ul className="list-disc pl-6 mt-4 text-gray-600 dark:text-gray-400">
              <li>Información de perfil (nombre, email, etc.)</li>
              <li>Datos de entrenamiento y progreso</li>
              <li>Información de salud y condición física</li>
              <li>Comunicaciones con nuestro equipo</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Uso de la información
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 mt-4 text-gray-600 dark:text-gray-400">
              <li>Personalizar tu experiencia de entrenamiento</li>
              <li>Mejorar nuestros servicios</li>
              <li>Comunicarnos contigo</li>
              <li>Garantizar la seguridad de tu cuenta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Cookies y tecnologías similares
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc pl-6 mt-4 text-gray-600 dark:text-gray-400">
              <li>Mantener tu sesión activa</li>
              <li>Recordar tus preferencias</li>
              <li>Analizar el uso de nuestro servicio</li>
              <li>Personalizar el contenido</li>
            </ul>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Puedes gestionar tus preferencias de cookies en cualquier momento a través 
              del panel de configuración de cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Compartir información
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              No vendemos tu información personal. Compartimos información solo:
            </p>
            <ul className="list-disc pl-6 mt-4 text-gray-600 dark:text-gray-400">
              <li>Con tu consentimiento explícito</li>
              <li>Con proveedores de servicios que nos ayudan a operar</li>
              <li>Cuando sea requerido por ley</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Seguridad de datos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu 
              información personal. Esto incluye encriptación, acceso restringido y monitoreo 
              regular de seguridad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Tus derechos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tienes derecho a:
            </p>
            <ul className="list-disc pl-6 mt-4 text-gray-600 dark:text-gray-400">
              <li>Acceder a tu información personal</li>
              <li>Corregir datos inexactos</li>
              <li>Solicitar la eliminación de datos</li>
              <li>Oponerte al procesamiento de datos</li>
              <li>Retirar tu consentimiento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Cambios en la política
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios 
              significativos a través de nuestro sitio web o por email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Contacto
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Para preguntas sobre esta política o tus datos personales, contáctanos en:
              <br />
              Email: privacy@mamuk.com
              <br />
              Dirección: Calle Principal 123, 28001 Madrid, España
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
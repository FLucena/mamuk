'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Básico',
    price: '9.99',
    description: 'Ideal para principiantes que buscan comenzar su viaje fitness.',
    features: [
      'Acceso a rutinas básicas',
      'Seguimiento de progreso',
      'Soporte por email',
      'Acceso a la comunidad'
    ],
    cta: 'Comenzar gratis',
    href: '/auth/signup?plan=basic',
    highlighted: false
  },
  {
    name: 'Premium',
    price: '19.99',
    description: 'Para usuarios comprometidos que buscan resultados más rápidos.',
    features: [
      'Todo lo del plan Básico',
      'Rutinas personalizadas',
      'Seguimiento nutricional',
      'Soporte prioritario',
      'Acceso a webinars exclusivos'
    ],
    cta: 'Probar gratis por 7 días',
    href: '/auth/signup?plan=premium',
    highlighted: true
  },
  {
    name: 'Pro',
    price: '39.99',
    description: 'La experiencia completa para quienes buscan transformación total.',
    features: [
      'Todo lo del plan Premium',
      'Coach personal asignado',
      'Videollamadas mensuales',
      'Análisis avanzado de métricas',
      'Acceso a eventos exclusivos',
      'Descuentos en productos'
    ],
    cta: 'Contactar para más info',
    href: '/contact?subject=Plan%20Pro',
    highlighted: false
  }
];

export default function PricingPage() {
  return (
    <main className="bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Planes y Precios
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Elige el plan que mejor se adapte a tus objetivos
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-lg shadow-lg ${
                plan.highlighted
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-0 right-0">
                  <div className="mx-auto w-fit px-4 py-1 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-full">
                    Más popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <h2 className={`text-2xl font-bold ${
                  plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {plan.name}
                </h2>
                <p className={`mt-4 text-sm ${
                  plan.highlighted ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className={`text-4xl font-bold ${
                    plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.price}€
                  </span>
                  <span className={`text-base font-medium ${
                    plan.highlighted ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    /mes
                  </span>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className={`w-5 h-5 mt-0.5 ${
                        plan.highlighted ? 'text-white' : 'text-blue-500 dark:text-blue-400'
                      }`} />
                      <span className={`ml-3 text-sm ${
                        plan.highlighted ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href={plan.href}
                    className={`w-full py-3 px-4 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      plan.highlighted
                        ? 'bg-white text-blue-600 hover:bg-gray-50 focus:ring-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Preguntas frecuentes
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se aplicarán en tu próximo ciclo de facturación.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ¿Hay compromiso de permanencia?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No, todos nuestros planes son flexibles y puedes cancelar en cualquier momento sin penalización.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aceptamos todas las tarjetas de crédito principales, PayPal y transferencia bancaria para planes anuales.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ¿Ofrecen descuentos para planes anuales?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sí, obtienes un 20% de descuento al elegir facturación anual en cualquiera de nuestros planes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
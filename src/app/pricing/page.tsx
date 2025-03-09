'use client';

import { FiCheck } from 'react-icons/fi';
import Icon, { IconName } from '@/components/ui/Icon';

const plans = [
  {
    name: 'Plan Básico',
    price: '19.99',
    period: 'mes',
    description: 'Perfecto para comenzar tu viaje fitness',
    features: [
      'Acceso a rutinas básicas',
      'Seguimiento de progreso',
      'Soporte por email',
      'App móvil',
      'Comunidad de usuarios'
    ],
    highlighted: false,
    buttonText: 'Comenzar gratis',
    trialDays: 14
  },
  {
    name: 'Plan Pro',
    price: '39.99',
    period: 'mes',
    description: 'Para usuarios comprometidos con sus objetivos',
    features: [
      'Todo lo del Plan Básico',
      'Rutinas personalizadas',
      'Acceso a todos los coaches',
      'Soporte prioritario',
      'Análisis avanzado de progreso',
      'Planes de nutrición básicos'
    ],
    highlighted: true,
    buttonText: 'Probar Plan Pro',
    trialDays: 7
  },
  {
    name: 'Plan Elite',
    price: '79.99',
    period: 'mes',
    description: 'La experiencia fitness definitiva',
    features: [
      'Todo lo del Plan Pro',
      'Coach personal dedicado',
      'Videollamadas mensuales',
      'Planes de nutrición avanzados',
      'Acceso anticipado a nuevas funciones',
      'Soporte 24/7'
    ],
    highlighted: false,
    buttonText: 'Contactar ventas',
    trialDays: 7
  }
];

export default function PricingPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 py-12">
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
                    /{plan.period}
                  </span>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Icon 
                        icon="FiCheck" 
                        className={`w-5 h-5 mt-0.5 ${
                          plan.highlighted ? 'text-white' : 'text-blue-500 dark:text-blue-400'
                        }`} 
                      />
                      <span className={`ml-3 text-sm ${
                        plan.highlighted ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <button
                    className={`w-full py-3 px-4 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      plan.highlighted
                        ? 'bg-white text-blue-600 hover:bg-gray-50 focus:ring-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>

                <p className={`mt-4 text-xs text-center ${
                  plan.highlighted ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {plan.trialDays} días de prueba gratis
                </p>
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
    </div>
  );
} 
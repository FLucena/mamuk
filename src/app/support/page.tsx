'use client';

import { useState } from 'react';
import { FiMail, FiMessageSquare, FiHelpCircle, FiBook } from 'react-icons/fi';

const faqs = [
  {
    question: '¿Cómo puedo cambiar mi plan de suscripción?',
    answer: 'Puedes cambiar tu plan en cualquier momento desde la sección "Mi Cuenta > Suscripción". Los cambios se aplicarán en tu próximo ciclo de facturación.'
  },
  {
    question: '¿Cómo recupero mi contraseña?',
    answer: 'Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión. Te enviaremos un enlace por correo electrónico para restablecer tu contraseña.'
  },
  {
    question: '¿Puedo cancelar mi suscripción en cualquier momento?',
    answer: 'Sí, puedes cancelar tu suscripción cuando quieras desde la sección "Mi Cuenta > Suscripción". No hay compromisos de permanencia ni penalizaciones.'
  },
  {
    question: '¿Cómo contacto con mi entrenador?',
    answer: 'Puedes comunicarte con tu entrenador a través del chat integrado en la plataforma o programar una videollamada desde la sección "Mi Entrenador".'
  },
  {
    question: '¿Qué hago si tengo problemas técnicos?',
    answer: 'Si experimentas problemas técnicos, primero intenta actualizar la página o cerrar sesión y volver a entrar. Si el problema persiste, contáctanos a través del formulario de soporte.'
  },
  {
    question: '¿Cómo personalizo mis notificaciones?',
    answer: 'Ve a "Mi Cuenta > Notificaciones" para personalizar qué tipo de alertas quieres recibir y cómo (email, push, SMS).'
  }
];

const resources = [
  {
    title: 'Centro de Ayuda',
    description: 'Encuentra respuestas a preguntas comunes y tutoriales detallados',
    icon: FiHelpCircle,
    link: '/help-center'
  },
  {
    title: 'Guías y Tutoriales',
    description: 'Aprende a sacar el máximo provecho de la plataforma',
    icon: FiBook,
    link: '/guides'
  },
  {
    title: 'Chat de Soporte',
    description: 'Habla en tiempo real con nuestro equipo de soporte',
    icon: FiMessageSquare,
    link: '/chat'
  },
  {
    title: 'Contacto',
    description: 'Envíanos un mensaje y te responderemos lo antes posible',
    icon: FiMail,
    link: '/contact'
  }
];

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    console.log({ name, email, subject, message });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Centro de Soporte
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            ¿Cómo podemos ayudarte?
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Busca en nuestras preguntas frecuentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Help Resources */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <Icon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {resource.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {resource.description}
                </p>
                <a
                  href={resource.link}
                  className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Saber más →
                </a>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Contáctanos
          </h2>
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Asunto
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Enviar mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 
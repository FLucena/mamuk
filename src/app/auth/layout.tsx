import type { Viewport } from 'next';
import type { Metadata } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#f9fafb',
  colorScheme: 'light'
};

export const metadata: Metadata = {
  title: 'Autenticación - Mamuk Training',
  description: 'Inicia sesión o regístrate en Mamuk Training para acceder a tu cuenta y gestionar tus rutinas de entrenamiento.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  );
} 
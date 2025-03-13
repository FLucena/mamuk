import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Logros y Reconocimientos | Mamuk',
  description: 'Visualiza tus logros, insignias y nivel de progreso en tu viaje fitness con Mamuk.',
};

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      {children}
    </section>
  );
} 
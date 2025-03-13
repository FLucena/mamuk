import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sin conexión',
  description: 'No hay conexión a Internet',
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
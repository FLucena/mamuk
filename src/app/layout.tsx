import './globals.css'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import SessionProvider from '@/components/SessionProvider'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { authOptions } from '@/lib/auth'
import { Providers } from '@/providers'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'
import { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ['latin'] })

interface RootLayoutProps {
  children: React.ReactNode
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#f9fafb',
  colorScheme: 'light'
};

export const metadata: Metadata = {
  title: 'Mamuk - Plataforma de Entrenamiento Personalizado',
  description: 'Crea, gestiona y comparte rutinas de entrenamiento personalizadas. Mamuk te ayuda a alcanzar tus objetivos fitness con planes adaptados a tus necesidades.',
  keywords: 'entrenamiento, fitness, rutinas, ejercicios, personalizado, deporte, salud, bienestar',
  authors: [{ name: 'Mamuk Team' }],
  creator: 'Mamuk',
  publisher: 'Mamuk',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    title: 'Mamuk - Plataforma de Entrenamiento Personalizado',
    description: 'Crea, gestiona y comparte rutinas de entrenamiento personalizadas.',
    url: 'https://mamuk.vercel.app',
    siteName: 'Mamuk',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mamuk - Plataforma de Entrenamiento Personalizado',
    description: 'Crea, gestiona y comparte rutinas de entrenamiento personalizadas.',
    creator: '@mamuk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={session}>
          <AuthProvider>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="system" 
              enableSystem={true}
              storageKey="mamuk-theme"
              disableTransitionOnChange
            >
              <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Navbar />
                {children}
                <Toaster richColors position="top-center" />
              </div>
            </ThemeProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
} 
import './globals.css'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import Navbar from '@/components/Navbar'
import { authOptions } from '@/lib/auth'
import { Providers } from '@/providers'
import { Toaster } from 'react-hot-toast'
import { Metadata, Viewport } from 'next'
import CookieConsent from '@/components/CookieConsent'
import Footer from '@/components/Footer'
import LoadingPage from '@/components/LoadingPage'

const inter = Inter({ subsets: ['latin'] })

interface RootLayoutProps {
  children: React.ReactNode
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' }, // Light mode color (gray-50)
    { media: '(prefers-color-scheme: dark)', color: '#030712' }   // Dark mode color (gray-950)
  ],
  colorScheme: 'light dark'
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme-preference');
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (storedTheme === 'dark' || (storedTheme === null && systemPrefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Error applying theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-950`}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            <LoadingPage />
            <Navbar />
            <main className="flex-grow pb-16">
              {children}
            </main>
            <Footer />
            <Toaster position="top-right" />
            <CookieConsent />
          </div>
        </Providers>
      </body>
    </html>
  )
} 
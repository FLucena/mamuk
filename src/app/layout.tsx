import './globals.css'
import '../styles/loading-override.css'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import SessionProvider from '@/components/SessionProvider'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { authOptions } from '@/lib/auth'
import { Providers } from '@/providers'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { Metadata, Viewport } from 'next'
import JsonLd from './components/JsonLd'
import { Analytics } from './components/Analytics'
import { NonceMetaTag } from '@/lib/csp'
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { ErrorProvider } from '@/contexts/ErrorContext'
import NavbarErrorBoundary from '@/components/navbar/NavbarErrorBoundary'
import ContentErrorBoundary from '@/components/ContentErrorBoundary'
import { SpinnerProvider } from '@/contexts/SpinnerContext'
import GlobalSpinner from '@/components/ui/GlobalSpinner'
import { 
  SITE_URL, 
  SITE_NAME, 
  SITE_DESCRIPTION, 
  SITE_KEYWORDS,
  TWITTER_HANDLE,
  COPYRIGHT_HOLDER
} from '@/lib/constants/site'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})

interface RootLayoutProps {
  children: React.ReactNode
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f4f6' }, // Light mode color
    { media: '(prefers-color-scheme: dark)', color: '#111827' },  // Dark mode color
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [
    {
      name: COPYRIGHT_HOLDER,
      url: SITE_URL,
    },
  ],
  creator: COPYRIGHT_HOLDER,
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: TWITTER_HANDLE,
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
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico' }
    ],
    shortcut: '/icon.png',
    apple: '/apple-touch-icon.png'
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

// Critical fonts to preload
const CRITICAL_FONTS: { path: string; as: string; type: string; crossOrigin?: string }[] = [
  // Usar la fuente Inter de next/font/google en lugar de precargar manualmente
  // { path: '/fonts/inter-var-latin.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
];

export const fetchCache = 'auto';

// Dynamically import non-critical components
const DynamicCookieConsent = dynamic(() => import('@/components/CookieConsent'), {
  ssr: false,
  loading: () => null
});

const DynamicFooter = dynamic(() => import('@/components/Footer'), {
  loading: () => null
});

const DynamicErrorNotification = dynamic(() => import('@/components/ErrorNotification'), {
  ssr: false,
  loading: () => null
});

// Development-only components
const DevComponents = dynamic(() => 
  process.env.NODE_ENV === 'development' 
    ? import('@/components/DevComponents').then((mod) => mod.default)
    : Promise.resolve(() => null)
, {
  ssr: false,
  loading: () => null
});

// Optimize performance monitoring
const PerformanceComponents = dynamic(() => 
  Promise.all([
    import('@/components/NavigationTracker'),
    import('@/components/NavigationPatcher'),
    import('@/components/PerformanceMonitor'),
    import('@/components/PerformanceOptimizerWrapper'),
  ]).then(([
    { default: NavigationTracker },
    { default: NavigationPatcher },
    { default: PerformanceMonitor },
    { default: PerformanceOptimizerWrapper }
  ]) => {
    return function CombinedPerformanceComponents({ criticalFonts }: { criticalFonts: any[] }) {
      return (
        <>
          <NavigationTracker />
          <NavigationPatcher />
          <PerformanceMonitor />
          <PerformanceOptimizerWrapper 
            criticalFonts={criticalFonts}
            enableServiceWorker={true}
            enableMemoryMonitoring={true}
          />
        </>
      );
    };
  }), {
  ssr: false,
  loading: () => null
});

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <NonceMetaTag />
        <meta charSet="utf-8" />
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
        <JsonLd />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col overflow-x-hidden w-full`}>
        <ThemeProvider>
          <Providers>
            <ErrorProvider>
              <SessionProvider session={session}>
                <AuthProvider>
                  <SpinnerProvider>
                    <GlobalSpinner />
                    
                    <NavbarErrorBoundary>
                      <Navbar />
                    </NavbarErrorBoundary>
                    
                    <main className="flex-grow w-full max-w-full overflow-x-hidden">
                      <ContentErrorBoundary name="main content">
                        {children}
                      </ContentErrorBoundary>
                    </main>
                    
                    <DynamicFooter />
                    
                    {/* Dynamically loaded components */}
                    <Suspense fallback={null}>
                      <DynamicCookieConsent />
                      <DynamicErrorNotification />
                      <PerformanceComponents criticalFonts={CRITICAL_FONTS} />
                      {process.env.NODE_ENV === 'development' && <DevComponents />}
                    </Suspense>
                    
                    <Toaster position="top-right" />
                    <Analytics />
                  </SpinnerProvider>
                </AuthProvider>
              </SessionProvider>
            </ErrorProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
} 
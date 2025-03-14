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
import CookieConsent from '@/components/CookieConsent'
import Footer from '@/components/Footer'
import NavigationTracker from '@/components/NavigationTracker'
import NavigationPatcher from '@/components/NavigationPatcher'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import PerformanceOptimizerWrapper from '@/components/PerformanceOptimizerWrapper'
import DebugButton from '@/components/DebugButton'
import DebugRenderCounter from '@/components/DebugRenderCounter'
import GlobalSpinner from '@/components/ui/GlobalSpinner'
import { 
  SITE_URL, 
  SITE_NAME, 
  SITE_DESCRIPTION, 
  SITE_KEYWORDS,
  TWITTER_HANDLE,
  COPYRIGHT_HOLDER
} from '@/lib/constants/site'
import NavbarErrorBoundary from '@/components/navbar/NavbarErrorBoundary'
import ContentErrorBoundary from '@/components/ContentErrorBoundary'
import { ErrorProvider } from '@/contexts/ErrorContext'
import ErrorNotification from '@/components/ErrorNotification'
import RoleDebugger from '@/components/RoleDebugger'
import { SpinnerProvider } from '@/contexts/SpinnerContext'
import NavigationSpinnerHandler from '@/components/NavigationSpinnerHandler'
import JsonLd from './components/JsonLd'
import { Analytics } from './components/Analytics'
import { NonceMetaTag } from '@/lib/csp'
import Script from 'next/script'

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
  minimumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
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
  manifest: '/api/manifest',
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
        <link rel="manifest" href="/api/manifest" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col overflow-x-hidden w-full`}>
        <ThemeProvider>
          <Providers>
            <ErrorProvider>
              <SessionProvider session={session}>
                <AuthProvider>
                  <SpinnerProvider>
                    <NavigationPatcher />
                    <NavigationTracker />
                    <NavigationSpinnerHandler />
                    <PerformanceMonitor />
                    <PerformanceOptimizerWrapper 
                      criticalFonts={CRITICAL_FONTS}
                      enableServiceWorker={true}
                      enableMemoryMonitoring={true}
                    />
                    <DebugRenderCounter />
                    <GlobalSpinner />
                    
                    <NavbarErrorBoundary>
                      <Navbar />
                    </NavbarErrorBoundary>
                    
                    <main className="flex-grow w-full max-w-full overflow-x-hidden">
                      <ContentErrorBoundary name="main content">
                        {children}
                      </ContentErrorBoundary>
                    </main>
                    
                    <Footer />
                    <CookieConsent />
                    <ErrorNotification />
                    <Toaster position="top-right" />
                    <Analytics />
                    
                    {process.env.NODE_ENV === 'development' && (
                      <>
                        <DebugButton />
                        <RoleDebugger />
                      </>
                    )}
                  </SpinnerProvider>
                </AuthProvider>
              </SessionProvider>
            </ErrorProvider>
          </Providers>
          <Script id="sw-registration" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/api/sw')
                    .then(function(registration) {
                      console.log('Service Worker registered with scope:', registration.scope);
                    })
                    .catch(function(error) {
                      console.error('Service Worker registration failed:', error);
                    });
                });
              }
            `}
          </Script>
        </ThemeProvider>
      </body>
    </html>
  )
} 
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import { SignInButtons } from '@/components/auth/SignInButtons';
import { headers } from 'next/headers';

export default async function SignIn() {
  const session = await getServerSession(authOptions);
  const headersList = headers();
  const referer = headersList.get('referer') || '';
  
  // Extract callbackUrl from referer if it exists
  let callbackUrl = '/workout'; // Default
  try {
    if (referer && referer.includes('callbackUrl=')) {
      const url = new URL(referer);
      const extractedCallbackUrl = url.searchParams.get('callbackUrl');
      if (extractedCallbackUrl) {
        callbackUrl = extractedCallbackUrl;
      }
    }
  } catch (error) {
    console.error('[Server] Error extracting callbackUrl from referer:', error);
  }

  // Log the server-side redirect for debugging
  console.log(`[Server] SignIn page - Session:`, session ? 'Authenticated' : 'Unauthenticated');
  console.log(`[Server] SignIn page - Referer:`, referer);
  console.log(`[Server] SignIn page - CallbackUrl:`, callbackUrl);

  // If user is already authenticated, redirect to the workout page
  if (session?.user) {
    console.log(`[Server] SignIn page - Redirecting authenticated user to /workout`);
    redirect('/workout');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Mamuk Training Logo"
            width={100}
            height={100}
            className="mx-auto"
            priority
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Accede a tu cuenta para comenzar a entrenar
          </p>
        </div>

        <SignInButtons callbackUrl={callbackUrl} />
      </div>
    </main>
  );
} 
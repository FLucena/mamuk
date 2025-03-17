import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import { SignInButtons } from '@/components/auth/SignInButtons';
import { headers } from 'next/headers';
import RobustImage from '@/components/ui/RobustImage';

export default async function SignIn() {
  const session = await getServerSession(authOptions);
  const headersList = headers();
  const referer = headersList.get('referer') || '';
  
  // Get the callbackUrl from the searchParams
  const searchParams = new URL(headers().get('x-url') || 'http://localhost').searchParams;
  let callbackUrl = searchParams.get('callbackUrl') || '/workout';
  
  // Try to decode if it's an encoded URL
  try {
    if (callbackUrl && callbackUrl.includes('%')) {
      callbackUrl = decodeURIComponent(callbackUrl);
    }
  } catch (error) {
    console.error('[Server] Error decoding callbackUrl:', error);
    callbackUrl = '/workout';
  }
  
  // Log the server-side redirect for debugging
  console.log(`[Server] SignIn page - Session:`, session ? 'Authenticated' : 'Unauthenticated');
  console.log(`[Server] SignIn page - Referer:`, referer);
  console.log(`[Server] SignIn page - CallbackUrl:`, callbackUrl);

  // If user is already authenticated, redirect to the callbackUrl or workout page
  if (session?.user) {
    console.log(`[Server] SignIn page - Redirecting authenticated user to ${callbackUrl}`);
    redirect(callbackUrl);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <div className="text-center">
          <RobustImage
            src="/logo.png"
            alt="Mamuk Training Logo"
            width={100}
            height={100}
            className="mx-auto"
            priority
            fallbackSrc="/icon.png"
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
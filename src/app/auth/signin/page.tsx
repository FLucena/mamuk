import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import { SignInButtons } from '@/components/auth/SignInButtons';

export default async function SignIn() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    // Redirect based on user role
    if (session.user.roles?.includes('coach')) {
      redirect('/coach');
    } else {
      // Tanto usuarios normales como administradores van a la página de rutinas por defecto
      redirect('/workout');
    }
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

        <SignInButtons />
      </div>
    </main>
  );
} 
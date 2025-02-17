'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const Navbar = () => {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-custom-color-500 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-white font-bold text-xl">
            Mamuk Training
          </Link>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/ejercicios" className="text-white hover:text-gray-300">
                Ejercicios
              </Link>
            </li>
            {status === 'loading' ? (
              <li className="animate-pulse bg-gray-200 h-8 w-24 rounded" />
            ) : session ? (
              <>
                <li className="flex items-center">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || ''}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="ml-2 text-white">{session.user?.name}</span>
                </li>
                <li>
                  <button
                    onClick={() => signOut()}
                    className="text-white hover:text-gray-300"
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/auth/signin"
                  className="bg-white text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Sign in
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
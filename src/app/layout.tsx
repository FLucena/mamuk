import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import SessionProvider from './components/SessionProvider';
import Navbar from './components/Navbar';
import './globals.css';
import { authOptions } from './api/auth/[...nextauth]/route';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Mamuk',
  description: 'Mamuk Training',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.className}>
      <body>
        <SessionProvider session={session}>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
} 
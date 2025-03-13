'use client';

import Link from 'next/link';
import { useLoading } from '@/contexts/LoadingContext';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function NavLink({ href, children, className = '' }: NavLinkProps) {
  const { startLoading } = useLoading();
  
  const baseClasses = "px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150";
  const classes = `${baseClasses} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white ${className}`;
  
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
} 
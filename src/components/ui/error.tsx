'use client';

import { AlertTriangle, XCircle } from 'lucide-react';
import { IconWrapper } from '@/components/ui/IconWrapper';

interface ErrorProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning';
}

export function Error({ 
  title = 'Error', 
  message, 
  variant = 'error' 
}: ErrorProps) {
  const icon = variant === 'error' ? XCircle : AlertTriangle;
  const colorClass = variant === 'error' 
    ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300' 
    : 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300';

  return (
    <div className={`rounded-lg p-4 ${colorClass}`}>
      <div className="flex items-start">
        <IconWrapper icon={icon} className="h-5 w-5 flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-2 text-sm opacity-90">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorPage({ 
  title = 'Error', 
  message = 'Ha ocurrido un error inesperado.' 
}: Partial<ErrorProps>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full">
        <Error title={title} message={message} />
      </div>
    </div>
  );
} 
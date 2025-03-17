import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/workout"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
        </div>

        <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6">
          <div className="space-y-6">
            <div>
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-2"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
            </div>

            <div>
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-2"></div>
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
            </div>

            <div className="flex justify-end">
              <div className="flex items-center h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse">
                <Loader2 className="w-4 h-4 mx-auto animate-spin text-gray-400 dark:text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
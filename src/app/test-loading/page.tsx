'use client';

import { useState } from 'react';
import PageLoading from '@/components/ui/PageLoading';

export default function TestLoadingPage() {
  const [showPageLoading, setShowPageLoading] = useState(false);
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Loading Component Test</h1>
      
      <div className="border p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">PageLoading Component</h2>
        <p className="mb-4">This component is animated, blue, and centered both horizontally and vertically.</p>
        <button 
          onClick={() => setShowPageLoading(!showPageLoading)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showPageLoading ? 'Hide' : 'Show'} PageLoading
        </button>
        {showPageLoading && <PageLoading />}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Notes</h2>
        <p>
          All loading components in the application have been standardized to use the PageLoading component.
          This includes:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Original LoadingSpinner (now uses PageLoading)</li>
          <li>LoadingPage Component (now uses PageLoading)</li>
          <li>Basic Loading Component (now uses PageLoading)</li>
          <li>All loading.tsx files in the app directory</li>
        </ul>
      </div>
    </div>
  );
} 
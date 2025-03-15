'use client';

import React, { useState } from 'react';
import { useFetch, useMutation, createOptimisticData, deleteOptimisticData } from '@/app/_hooks/useSWRFetch';
import AsyncBoundary from '@/app/_components/Suspense/AsyncBoundary';
import { TableSkeleton } from '@/app/_components/Suspense/SkeletonLoader';

// Define the User type
interface User {
  name: string;
  email: string;
  bio?: string;
  age?: number;
  website?: string;
  role: 'user' | 'admin' | 'editor';
}

/**
 * SWR Example Page
 * Demonstrates client-side data fetching with SWR
 */
export default function SWRExamplePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">SWR Data Fetching Example</h1>
      
      <AsyncBoundary
        loadingFallback={<div className="p-4">Loading application...</div>}
        errorFallback={({ error, reset }) => (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h2 className="text-lg font-semibold text-red-800">Application Error</h2>
            <p className="mt-2 text-red-700">{error.message}</p>
            <button 
              onClick={reset}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}
      >
        <UserManager />
      </AsyncBoundary>
    </div>
  );
}

/**
 * User Manager Component
 * Handles user CRUD operations with SWR
 */
function UserManager() {
  // State for the form
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'user',
  });
  
  // Fetch users with SWR
  const { data: users, error, isLoading, mutate } = useFetch<User[]>('/api/examples/users');
  
  // Create user mutation
  const { trigger: createUser, isMutating: isCreating } = useMutation<User>('/api/examples/users');
  
  // Delete user mutation
  const { trigger: deleteUser, isMutating: isDeleting } = useMutation<{ success: boolean }>('/api/examples/users');
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Optimistically update the UI
      await mutate(
        async (currentUsers: User[] | undefined) => {
          try {
            // Make the API call
            const newUser = await createUser({ 
              method: 'POST', 
              body: formData 
            });
            
            // Return the actual updated data
            return createOptimisticData(currentUsers, newUser);
          } catch (error) {
            // If the API call fails, revert to the original data
            return currentUsers;
          }
        },
        {
          optimisticData: createOptimisticData(users, formData as User),
          rollbackOnError: true,
          revalidate: false,
        }
      );
      
      // Reset the form
      setFormData({
        name: '',
        email: '',
        role: 'user',
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };
  
  // Handle user deletion
  const handleDelete = async (email: string) => {
    try {
      // Optimistically update the UI
      await mutate(
        async (currentUsers: User[] | undefined) => {
          try {
            // Make the API call
            await deleteUser({ 
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              url: `/api/examples/users?email=${encodeURIComponent(email)}`
            });
            
            // Return the actual updated data
            return deleteOptimisticData(currentUsers, email, 'email' as keyof User);
          } catch (error) {
            // If the API call fails, revert to the original data
            return currentUsers;
          }
        },
        {
          optimisticData: deleteOptimisticData(users, email, 'email' as keyof User),
          rollbackOnError: true,
          revalidate: false,
        }
      );
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return <TableSkeleton rows={3} />;
  }
  
  // Show error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-lg font-semibold text-red-800">Error Loading Users</h2>
        <p className="mt-2 text-red-700">{error.message}</p>
        <button 
          onClick={() => mutate()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* User Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Age (Optional)
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isCreating ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
      
      {/* User List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">User List</h2>
        
        {users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((user: User, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">{user.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : user.role === 'editor'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(user.email)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No users found. Add a user to get started.</p>
        )}
      </div>
    </div>
  );
} 